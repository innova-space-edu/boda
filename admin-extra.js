(function () {
  if (!document.body.classList.contains('admin-body')) return;

  const typeLabels = {
    lista_cerrada: 'Lista definida',
    familia_libre: 'Familia abierta',
    individual_acompanante: 'Persona + 1'
  };

  const style = document.createElement('style');
  style.textContent = `
    .mode-grid.admin-three-modes{grid-template-columns:repeat(3,minmax(0,1fr))}
    .type-badge.individual_acompanante{background:#e7e6f2;color:#585274}
    .invite-delete-button{border:1px solid rgba(151,82,72,.4)!important;background:#fff7f6!important;color:#953e38!important}
    .invite-delete-button:hover{background:#fbe9e6!important}
    .dashboard-mini-grid.admin-three-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
    .companion-form-note{margin:8px 0 2px;color:#766e66;font-size:13px;line-height:1.45}
    @media(max-width:980px){.mode-grid.admin-three-modes{grid-template-columns:1fr}.dashboard-mini-grid.admin-three-stats{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function formatNames(names) {
    const clean = (names || []).filter(Boolean);
    if (!clean.length) return '';
    if (clean.length === 1) return clean[0];
    if (clean.length === 2) return clean[0] + ' y ' + clean[1];
    return clean.slice(0, -1).join(', ') + ' y ' + clean[clean.length - 1];
  }


  // Navegación y clasificación persistente de las invitaciones.
  let activeInvitationSide = null;
  window.activeInvitationSide = null;

  function linkedInvitationSides(invite) {
    return new Set(weddingListRows
      .filter(row => row.invitacion_id === invite.id)
      .map(row => row.lado));
  }

  async function assignInvitationSide(invite, lado) {
    if (!['novio', 'novia'].includes(lado)) return;
    const linkedSides = linkedInvitationSides(invite);
    if (linkedSides.size && (linkedSides.size > 1 || !linkedSides.has(lado))) {
      alert('Esta invitación está vinculada a la lista del otro lado. Revisa primero su vinculación en «Lista de novios».');
      return;
    }
    const result = await client.from('invitaciones_personalizadas')
      .update({ lado, updated_at: new Date().toISOString() })
      .eq('id', invite.id);
    if (result.error) {
      console.error(result.error);
      alert('No se pudo guardar la clasificación de esta invitación.');
      return;
    }
    invite.lado = lado;
    renderInvites();
  }

  function renderUnassignedInvites(rows) {
    const container = document.getElementById('unassignedInvitesList');
    if (!container) return;
    container.replaceChildren();
    rows.forEach(invite => {
      const row = document.createElement('div');
      row.className = 'unassigned-invite-row';
      const info = document.createElement('div');
      const heading = document.createElement('strong');
      heading.textContent = invite.titulo_portada || invite.familia || formatNames(invite.invitados || []) || 'Invitación';
      const type = document.createElement('small');
      type.textContent = typeLabels[invite.tipo] || invite.tipo;
      info.append(heading, type);
      const actions = document.createElement('div');
      actions.className = 'unassigned-invite-actions';
      for (const [lado, label] of [['novio', 'Asignar al novio'], ['novia', 'Asignar a la novia']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mini-button compact-button';
        button.textContent = label;
        button.addEventListener('click', () => assignInvitationSide(invite, lado));
        actions.appendChild(button);
      }
      row.append(info, actions);
      container.appendChild(row);
    });
  }

  function refreshInvitationSideView() {
    const chooser = document.getElementById('invitationSideChooser');
    const details = document.getElementById('invitationSideDetails');
    const unassignedPanel = document.getElementById('unassignedInvites');
    if (!chooser || !details || !unassignedPanel) return;
    chooser.classList.toggle('hidden', !!activeInvitationSide);
    details.classList.toggle('hidden', !activeInvitationSide);
    const groomCount = allInvites.filter(i => i.lado === 'novio').length;
    const brideCount = allInvites.filter(i => i.lado === 'novia').length;
    document.getElementById('groomInvitationCount').textContent = groomCount + (groomCount === 1 ? ' invitación' : ' invitaciones');
    document.getElementById('brideInvitationCount').textContent = brideCount + (brideCount === 1 ? ' invitación' : ' invitaciones');
    if (activeInvitationSide) {
      document.getElementById('invitationSideHeading').textContent = activeInvitationSide === 'novio' ? 'Invitaciones del novio' : 'Invitaciones de la novia';
      const sameSide = allInvites.filter(invite => invite.lado === activeInvitationSide);
      const available = sameSide.filter(invite => !invite.plazo_inicio_at).length;
      const protectedCount = sameSide.length - available;
      document.getElementById('bulkDeadlineTitle').textContent = activeInvitationSide === 'novio'
        ? 'Fecha límite para todas las invitaciones del novio'
        : 'Fecha límite para todas las invitaciones de la novia';
      document.getElementById('bulkDeadlineDescription').textContent =
        'Elige una fecha común para ' + (activeInvitationSide === 'novio' ? 'el novio' : 'la novia') +
        '. Se aplicará a todas las invitaciones sin plazo iniciado, incluyendo las desactivadas.';
      document.getElementById('bulkDeadlineEligible').textContent =
        available + (available === 1 ? ' disponible' : ' disponibles') +
        (protectedCount ? ' · ' + protectedCount + ' protegidas' : '');
      document.getElementById('applyBulkDeadlineBtn').disabled = available === 0;
      unassignedPanel.classList.add('hidden');
    } else {
      const pending = allInvites.filter(i => i.lado !== 'novio' && i.lado !== 'novia');
      unassignedPanel.classList.toggle('hidden', pending.length === 0);
      document.getElementById('unassignedInvitesSummary').textContent = 'Pendientes de clasificar (' + pending.length + ')';
      renderUnassignedInvites(pending);
    }
  }

  function selectInvitationSide(side) {
    activeInvitationSide = side;
    window.activeInvitationSide = side;
    activeFilter = 'all';
    document.getElementById('bulkDeadlineInput').value = '';
    document.getElementById('bulkDeadlineStatus').textContent = '';
    document.querySelectorAll('#linksSection .filter-chip').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    renderInvites();
    const main = document.querySelector('.dashboard-main');
    if (main) main.scrollTop = 0;
  }


  async function applyBulkDeadline() {
    const side = activeInvitationSide;
    if (side !== 'novio' && side !== 'novia') return;
    const button = document.getElementById('applyBulkDeadlineBtn');
    const status = document.getElementById('bulkDeadlineStatus');
    const input = document.getElementById('bulkDeadlineInput');
    const iso = chileDeadlineToIso(input.value);
    if (!iso || Date.parse(iso) <= Date.now() + 60000) {
      status.textContent = 'Selecciona una fecha y hora futura válida en horario de Chile.';
      return;
    }

    const sideText = side === 'novio' ? 'novio' : 'novia';
    button.disabled = true;
    status.textContent = 'Verificando invitaciones...';
    try {
      // El resumen se consulta de nuevo para evitar presentar cifras antiguas.
      const lookup = await client.from('invitaciones_personalizadas')
        .select('id, plazo_inicio_at').eq('lado', side);
      if (lookup.error) throw lookup.error;
      const rows = lookup.data || [];
      const eligible = rows.filter(invite => !invite.plazo_inicio_at).length;
      const locked = rows.length - eligible;
      if (eligible === 0) {
        status.textContent = rows.length
          ? 'Todas las invitaciones de este lado ya tienen el conteo iniciado. No se modificaron.'
          : 'No hay invitaciones de este lado para actualizar.';
        return;
      }

      const accepted = confirm(
        '¿Establecer el ' + formatDeadlineCL(iso) + ' como fecha límite para ' +
        eligible + (eligible === 1 ? ' invitación del ' : ' invitaciones del ') + sideText + '?\n\n' +
        'Se reemplazarán también las fechas individuales ya configuradas que aún no hayan iniciado el conteo.' +
        (locked ? '\n' + locked + ' invitación(es) con conteo iniciado conservarán su fecha.' : '') +
        '\n\nNo se enviarán mensajes ni se iniciarán nuevos conteos.'
      );
      if (!accepted) {
        status.textContent = 'Operación cancelada. No se modificaron fechas.';
        return;
      }

      status.textContent = 'Guardando fecha límite para ' + sideText + '...';
      // Un único UPDATE transaccional evita modificaciones parciales y
      // protege las invitaciones que iniciaron el conteo durante la operación.
      const result = await client.rpc('establecer_fecha_limite_lado', {
        p_lado: side, p_fecha_limite: iso
      });
      if (result.error) throw result.error;
      const changed = Number(result.data?.actualizadas);
      const preserved = Number(result.data?.protegidas);
      if (!Number.isInteger(changed) || changed < 0) {
        throw new Error('Supabase no confirmó cuántas invitaciones fueron actualizadas.');
      }
      await loadAdminData();
      if (side === activeInvitationSide) {
        document.getElementById('bulkDeadlineStatus').textContent =
          'Fecha guardada para ' + changed + (changed === 1 ? ' invitación' : ' invitaciones') +
          ' del ' + sideText + '.' +
          (preserved ? ' Se conservaron ' + preserved + ' plazo(s) ya iniciados.' : '');
      }
    } catch (error) {
      console.error('Error al establecer la fecha límite masiva', error);
      status.textContent = 'No se pudo aplicar la fecha. No se confirmó ningún cambio. Revisa las invitaciones y vuelve a intentarlo.';
    } finally {
      const sameSideAvailable = allInvites.some(invite =>
        invite.lado === activeInvitationSide && !invite.plazo_inicio_at);
      button.disabled = !sameSideAvailable;
    }
  }

  function setupInvitationSideNavigation() {
    document.querySelectorAll('[data-invite-side]').forEach(button => {
      button.addEventListener('click', () => selectInvitationSide(button.dataset.inviteSide));
    });
    document.getElementById('backToInvitationSides').addEventListener('click', () => selectInvitationSide(null));
    window.addEventListener('admin:invitations-opened', () => selectInvitationSide(null));
    document.getElementById('applyBulkDeadlineBtn').addEventListener('click', applyBulkDeadline);
  }

  function setupCreateMode() {
    const grid = document.querySelector('#createSection .mode-grid');
    const openForm = document.getElementById('openInviteForm');
    if (!grid || !openForm || document.getElementById('companionInviteForm')) return;

    grid.classList.add('admin-three-modes');
    const modeButton = document.createElement('button');
    modeButton.className = 'mode-card';
    modeButton.type = 'button';
    modeButton.dataset.mode = 'individual_acompanante';
    modeButton.innerHTML = '<strong>Persona + acompañante</strong><span>Una persona nominada puede confirmar sola o agregar un único acompañante.</span>';
    grid.appendChild(modeButton);

    const form = document.createElement('article');
    form.className = 'form-card invite-mode-form';
    form.id = 'companionInviteForm';
    form.innerHTML = `
      <h3>Invitación individual con un acompañante</h3>
      <label for="companionPrincipalName">Persona invitada</label>
      <input id="companionPrincipalName" type="text" placeholder="Camila González Soto" />
      <label for="companionCoverTitle">Texto de portada</label>
      <input id="companionCoverTitle" type="text" placeholder="Invitación para Camila González Soto" />
      <p class="companion-form-note">La persona principal queda fija. Si asiste, podrá registrar como máximo un acompañante.</p>
      <button class="green-button" id="createCompanionBtn" type="button">Crear link persona + acompañante</button>
    `;
    openForm.insertAdjacentElement('afterend', form);

    const principal = document.getElementById('companionPrincipalName');
    const cover = document.getElementById('companionCoverTitle');
    principal.addEventListener('input', function () {
      if (!cover.dataset.edited) cover.value = this.value.trim() ? 'Invitación para ' + this.value.trim() : '';
    });
    cover.addEventListener('input', function () { this.dataset.edited = '1'; });

    function chooseMode(mode) {
      document.querySelectorAll('.mode-card').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
      document.getElementById('closedInviteForm')?.classList.toggle('active', mode === 'lista_cerrada');
      document.getElementById('openInviteForm')?.classList.toggle('active', mode === 'familia_libre');
      form.classList.toggle('active', mode === 'individual_acompanante');
    }

    modeButton.addEventListener('click', function () { chooseMode('individual_acompanante'); });
    grid.querySelectorAll('[data-mode="lista_cerrada"],[data-mode="familia_libre"]').forEach(btn => {
      btn.addEventListener('click', function () { form.classList.remove('active'); });
    });

    document.getElementById('createCompanionBtn').addEventListener('click', async function () {
      const name = principal.value.trim();
      const title = cover.value.trim();
      const plazo_fecha_limite_at = readInviteDeadline();
      if (!plazo_fecha_limite_at) return;
      const lado = document.getElementById('inviteSideSelect').value;
      if (!lado) {
        inviteCreateStatus.textContent = 'Selecciona si la invitación es del novio o de la novia.';
        return;
      }
      if (!name || !title) {
        inviteCreateStatus.textContent = 'Completa el nombre de la persona y el texto de portada.';
        return;
      }
      inviteCreateStatus.textContent = 'Creando invitación...';
      const result = await client.from('invitaciones_personalizadas').insert([{
        tipo: 'individual_acompanante', titulo_portada: title, invitados: [name], familia: null, lado, plazo_fecha_limite_at
      }]).select('*').single();
      if (result.error) {
        console.error(result.error);
        inviteCreateStatus.textContent = 'No se pudo crear el link.';
        return;
      }
      principal.value = '';
      cover.value = '';
      delete cover.dataset.edited;
      inviteCreateStatus.textContent = 'Invitación persona + acompañante creada correctamente.';
      showGenerated(result.data);
      await loadAdminData();
    });
  }

  function setupDashboardStat() {
    const grid = document.querySelector('.dashboard-mini-grid');
    if (!grid || document.getElementById('companionLinksCount')) return;
    grid.classList.add('admin-three-stats');
    const box = document.createElement('div');
    box.innerHTML = '<span>Persona + 1</span><strong id="companionLinksCount">0</strong>';
    grid.appendChild(box);
  }

  function setupFilter() {
    const row = document.querySelector('#linksSection .filter-row');
    if (!row || row.querySelector('[data-filter="individual_acompanante"]')) return;
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.dataset.filter = 'individual_acompanante';
    btn.textContent = 'Persona + 1';
    const pending = row.querySelector('[data-filter="pending"]');
    row.insertBefore(btn, pending || null);
    btn.addEventListener('click', function () {
      activeFilter = 'individual_acompanante';
      document.querySelectorAll('.filter-chip').forEach(b => b.classList.toggle('active', b === btn));
      renderInvites();
    });
  }

  // Eliminar sólo si sigue desactivada en la base de datos. Las claves foráneas
  // de invitados y lista_novios usan ON DELETE SET NULL y conservan sus registros.
  async function deleteInactiveInvitation(invite, button) {
    if (invite.activa) return;
    const title = invite.titulo_portada || invite.familia || formatNames(invite.invitados || []) || 'esta invitación';
    const confirmed = confirm(
      '¿Eliminar definitivamente "' + title + '"?\n\n' +
      'El enlace dejará de funcionar y no se podrá recuperar. ' +
      'Las listas y respuestas de asistentes se conservarán, pero quedarán desvinculadas.'
    );
    if (!confirmed) return;

    button.disabled = true;
    button.textContent = 'Eliminando...';
    try {
      const result = await client.from('invitaciones_personalizadas')
        .delete()
        .eq('id', invite.id)
        .eq('activa', false)
        .select('id');
      if (result.error) throw result.error;
      if (!result.data || result.data.length !== 1) {
        alert('No se eliminó la invitación. Es posible que se haya reactivado; actualiza los datos e inténtalo nuevamente.');
        await loadAdminData();
        return;
      }
      await loadAdminData();
    } catch (error) {
      console.error('No se pudo eliminar la invitación:', error);
      alert('No se pudo eliminar la invitación. Comprueba la conexión e inténtalo nuevamente.');
    } finally {
      button.disabled = false;
      button.textContent = 'Eliminar';
    }
  }

  function patchRenderers() {
    renderInvites = function () {
      const container = document.getElementById('personalInvitesList');
      container.innerHTML = '';
      refreshInvitationSideView();
      if (!activeInvitationSide) return;
      let rows = allInvites.filter(i => i.lado === activeInvitationSide);
      if (['lista_cerrada','familia_libre','individual_acompanante'].includes(activeFilter)) rows = rows.filter(i => i.tipo === activeFilter);
      if (activeFilter === 'pending') rows = rows.filter(i => !i.respondida_at);
      if (activeFilter === 'answered') rows = rows.filter(i => !!i.respondida_at);
      if (!rows.length) { container.innerHTML = "<p class='empty-text'>No hay invitaciones en esta categoría.</p>"; return; }

      rows.forEach(invite => {
        const card = document.createElement('article');
        card.className = 'personal-invite-card' + (invite.activa ? '' : ' is-inactive');
        const top = document.createElement('div'); top.className = 'invite-card-top';
        const info = document.createElement('div');
        const h3 = document.createElement('h3'); h3.textContent = invite.titulo_portada || invite.familia || formatNames(invite.invitados || []); info.appendChild(h3);
        const badge = document.createElement('span'); badge.className = 'type-badge ' + invite.tipo; badge.textContent = typeLabels[invite.tipo] || invite.tipo; info.appendChild(badge);
        top.appendChild(info);
        const state = document.createElement('span'); state.className = 'response-badge ' + (invite.respondida_at ? 'answered' : 'pending'); state.textContent = invite.respondida_at ? 'Respondida' : 'Sin respuesta'; top.appendChild(state);
        card.appendChild(top);

        const detail = document.createElement('p'); detail.className = 'small-muted';
        if (invite.tipo === 'familia_libre') detail.textContent = 'Familia: ' + (invite.familia || '');
        else if (invite.tipo === 'individual_acompanante') detail.textContent = 'Invitado: ' + ((invite.invitados || [])[0] || '') + ' · permite 1 acompañante';
        else detail.textContent = 'Invitados: ' + formatNames(invite.invitados || []);
        card.appendChild(detail);

        const meta = document.createElement('p'); meta.className = 'invite-meta'; meta.textContent = (invite.aperturas || 0) + ' apertura(s) · ' + (invite.activa ? 'Activa' : 'Desactivada'); card.appendChild(meta);
        const input = document.createElement('input'); input.readOnly = true; input.value = invitationUrl(invite.token); card.appendChild(input);
        const actions = document.createElement('div'); actions.className = 'invite-card-actions';
        addDeadlineSettings(card, invite);
        const copy = document.createElement('button'); copy.className='mini-button compact-button'; copy.textContent='Copiar link'; copy.onclick=()=>shareInvitation('copy',input.value,h3.textContent,null,copy); actions.appendChild(copy);
        const whatsapp = document.createElement('button'); whatsapp.className='mini-button compact-button'; whatsapp.textContent='WhatsApp'; whatsapp.onclick=()=>shareInvitation('whatsapp',input.value,h3.textContent); actions.appendChild(whatsapp);
        const share = document.createElement('button'); share.className='mini-button compact-button'; share.textContent='Compartir'; share.onclick=()=>shareInvitation('native',input.value,h3.textContent); actions.appendChild(share);
        const email = document.createElement('button'); email.className='mini-button compact-button'; email.textContent='Correo'; email.onclick=()=>shareInvitation('email',input.value,h3.textContent); actions.appendChild(email);
        const edit = document.createElement('button'); edit.className='mini-button compact-button'; edit.textContent='Editar portada'; edit.onclick=async()=>{ const value=prompt('Texto de portada:',invite.titulo_portada||''); if(value===null||!value.trim()) return; await client.from('invitaciones_personalizadas').update({titulo_portada:value.trim(),updated_at:new Date().toISOString()}).eq('id',invite.id); await loadAdminData(); }; actions.appendChild(edit);
        const toggle = document.createElement('button'); toggle.className='mini-button compact-button'; toggle.textContent=invite.activa?'Desactivar':'Reactivar'; toggle.onclick=async()=>{
          toggle.disabled = true;
          const result = await client.from('invitaciones_personalizadas')
            .update({activa:!invite.activa,updated_at:new Date().toISOString()})
            .eq('id',invite.id);
          if (result.error) { console.error(result.error); alert('No se pudo actualizar el estado de la invitación.'); toggle.disabled = false; return; }
          await loadAdminData();
        }; actions.appendChild(toggle);
        if (!invite.activa) {
          const remove = document.createElement('button');
          remove.className = 'mini-button compact-button invite-delete-button';
          remove.type = 'button';
          remove.textContent = 'Eliminar';
          remove.title = 'Eliminar definitivamente esta invitación desactivada';
          remove.addEventListener('click', () => deleteInactiveInvitation(invite, remove));
          actions.appendChild(remove);
        }
        const changeSide = document.createElement('button');
        changeSide.className = 'mini-button compact-button';
        changeSide.type = 'button';
        changeSide.textContent = invite.lado === 'novio' ? 'Mover a la novia' : 'Mover al novio';
        changeSide.addEventListener('click', () => assignInvitationSide(invite, invite.lado === 'novio' ? 'novia' : 'novio'));
        actions.appendChild(changeSide);
        card.appendChild(actions); container.appendChild(card);
      });
    };

    renderDashboard = function (visits) {
      const normalized = allGuests.map(normalizeRow);
      const yes = normalized.filter(r => r.estado === 'Sí asistiré').length;
      const no = normalized.filter(r => r.estado === 'No podré asistir').length;
      const families = new Set(normalized.map(r => r.grupo));
      const answered = allInvites.filter(i => i.respondida_at).length;
      const total = allInvites.length;
      const rate = total ? Math.round(answered / total * 100) : 0;
      document.getElementById('visitasCount').textContent = visits || 0;
      document.getElementById('linksCount').textContent = total;
      document.getElementById('respondidasCount').textContent = answered;
      document.getElementById('asistentesCount').textContent = yes;
      document.getElementById('noAsistenCount').textContent = no;
      document.getElementById('familiasCount').textContent = families.size;
      document.getElementById('responseRateLabel').textContent = rate + '%';
      document.getElementById('responseRateBar').style.width = rate + '%';
      document.getElementById('closedLinksCount').textContent = allInvites.filter(i => i.tipo === 'lista_cerrada').length;
      document.getElementById('openLinksCount').textContent = allInvites.filter(i => i.tipo === 'familia_libre').length;
      const companion = document.getElementById('companionLinksCount');
      if (companion) companion.textContent = allInvites.filter(i => i.tipo === 'individual_acompanante').length;

      const recent = document.getElementById('recentInvites'); recent.innerHTML = '';
      allInvites.slice(0,5).forEach(i => {
        const row = document.createElement('div'); row.className = 'recent-item';
        const left = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = i.titulo_portada || i.familia || 'Invitación';
        const type = document.createElement('span'); type.textContent = typeLabels[i.tipo] || i.tipo;
        left.append(title,type);
        const state = document.createElement('b'); state.textContent = i.respondida_at ? 'Respondida' : 'Pendiente';
        row.append(left,state); recent.appendChild(row);
      });
      if (!allInvites.length) recent.innerHTML = "<p class='empty-text'>Sin invitaciones creadas.</p>";
    };
  }


  // Lista interna de invitados por novio/novia -----------------------------
  let weddingListRows = [];
  let pendingShareConfirmation = null;

  style.textContent += `
    .wedding-list-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:18px}
    .wedding-list-summary .metric-card strong{margin-bottom:3px}
    .wedding-list-columns{display:grid;grid-template-columns:1fr;gap:18px;align-items:start}
    .wedding-list-card{min-width:0;background:var(--admin-surface);border:1px solid var(--admin-line);border-radius:20px;padding:20px;box-shadow:var(--admin-shadow)}
    .wedding-list-card h3{margin:0;color:var(--admin-gold-dark);font-size:20px}
    .wedding-list-card .wedding-list-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:0}
    .wedding-list-head-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
    .wedding-list-toggle{border:1px solid rgba(143,105,40,.3);background:var(--admin-surface-2);color:var(--admin-gold-dark);border-radius:12px;padding:9px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
    .wedding-list-toggle:hover{border-color:var(--admin-olive);background:#f1f3eb}
    .wedding-list-toggle:focus-visible{outline:3px solid rgba(111,122,88,.26);outline-offset:2px}
    .wedding-list-content{margin-top:18px}
    .wedding-list-content[hidden]{display:none!important}
    .wedding-list-subcount{margin:4px 0 0;color:var(--admin-muted);font-size:12px;line-height:1.5}
    .wedding-side-count{display:inline-grid;place-items:center;min-width:42px;height:34px;padding:0 10px;border-radius:999px;background:var(--admin-surface-2);border:1px solid var(--admin-line);font-weight:800;color:var(--admin-gold-dark)}
    .wedding-list-card textarea{min-height:105px}
    .wedding-list-scroll{width:100%;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:3px}
    .wedding-list-items{display:grid;gap:7px;margin-top:18px;min-width:1420px}
    .wedding-list-table-head,.wedding-person-row{display:grid;grid-template-columns:36px minmax(230px,1fr) 145px 185px 185px 185px 310px;align-items:center;gap:10px}
    .wedding-list-table-head{padding:0 11px 7px;color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.045em}
    .wedding-person-row{min-width:0;padding:10px 11px;border:1px solid rgba(143,105,40,.12);background:var(--admin-surface-2);border-radius:13px}
    .wedding-person-row.is-no{background:#fbefed;border-color:rgba(151,82,72,.2)}
    .wedding-person-row.is-yes{background:#f2f5ed;border-color:rgba(111,122,88,.24)}
    .wedding-person-number{color:var(--admin-muted);font-size:12px;text-align:center}
    .wedding-person-name{display:block!important;min-width:0!important;width:auto!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;overflow-wrap:normal!important;word-break:normal!important;font-weight:650}
    .wedding-link-state{display:inline-flex;align-items:center;width:max-content;max-width:100%;margin-top:5px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.02em;background:#eee9df;color:#746650}
    .wedding-link-state.is-ready{background:#f7ecd2;color:#836319}
    .wedding-link-state.is-sent{background:#e3eee0;color:#53694c}
    .wedding-link-state.is-missing{background:#f2e2df;color:#84564e}
    .wedding-next-send{display:block;margin-top:5px;color:var(--admin-muted);font-size:11px;white-space:normal;line-height:1.35}
    .wedding-attendance-select{height:36px!important;padding:6px 9px!important;font-size:12px!important}
    .wedding-send-cell{display:grid;grid-template-columns:auto minmax(0,1fr);gap:7px;align-items:center;min-width:0}
    .wedding-send-check{display:flex!important;align-items:center;gap:5px;margin:0!important;cursor:pointer;white-space:nowrap;color:var(--admin-muted);font-size:11px}
    .dashboard-main .wedding-send-check input[type="checkbox"]{appearance:auto!important;width:17px!important;min-width:17px!important;max-width:17px!important;height:17px!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;accent-color:var(--admin-olive)}
    .dashboard-main .wedding-send-date{height:36px!important;min-width:118px!important;padding:6px 8px!important;font-size:11px!important}
    .wedding-person-actions{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap;min-width:0}
    .wedding-person-actions .mini-button{margin:0!important;width:auto!important;min-width:0!important;padding:7px 9px!important;font-size:12px!important;white-space:nowrap}
    .wedding-delete-button{border-color:rgba(151,82,72,.35)!important;color:#8b4d45!important;background:#fff7f6!important}
    .wedding-create-link{border-color:rgba(124,102,54,.35)!important;background:#fffaf0!important;color:#735d2b!important}
    .wedding-list-empty{padding:20px 8px;color:var(--admin-muted);text-align:center}
    .share-confirm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(31,29,25,.46);display:grid;place-items:center;padding:18px}
    .share-confirm-card{width:min(430px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.24);border:1px solid rgba(143,105,40,.16)}
    .share-confirm-card h3{margin:0 0 8px;color:var(--admin-gold-dark);font-size:22px}
    .share-confirm-card p{margin:0 0 18px;color:var(--admin-muted);line-height:1.5}
    .share-confirm-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}
    .generated-share-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    @media(max-width:700px){
      .wedding-list-summary{grid-template-columns:1fr 1fr}
      .wedding-list-summary .wedding-total-card{grid-column:1/-1}
      .wedding-list-card{padding:16px}
    }
  `;

  function normalizeWeddingName(value) {
    return String(value || '').trim().toLocaleLowerCase('es-CL');
  }

  function weddingInviteFor(row) {
    return allInvites.find(invite => invite.id === row.invitacion_id) || null;
  }

  function invitationDisplayTitle(invite) {
    if (!invite) return 'Invitación';
    return invite.titulo_portada || invite.familia || formatNames(invite.invitados || []) || 'Invitación';
  }

  function shareStageInfo(row) {
    const stages = [
      { stage: 1, field: 'envio_1_enviado', label: 'Invitación inicial' },
      { stage: 2, field: 'envio_2_enviado', label: 'Recordatorio de confirmación' },
      { stage: 3, field: 'envio_3_enviado', label: 'Itinerario' }
    ];
    return stages.find(item => !row[item.field]) || null;
  }

  function buildShareMessage(title, url) {
    return 'Hola, te compartimos nuestra invitación de boda.\n\n' + (title || 'Carolina & Esthefano') + '\n' + url;
  }

  async function markWeddingStageSent(row, stage) {
    const field = 'envio_' + stage + '_enviado';
    const patch = { updated_at: new Date().toISOString() };
    patch[field] = true;
    if (stage === 1) patch.invitacion_enviada = true;

    const result = await client.from('lista_novios').update(patch).eq('id', row.id);
    if (result.error) {
      console.error(result.error);
      alert('No se pudo actualizar el estado de envío.');
      return false;
    }

    row[field] = true;
    if (stage === 1) row.invitacion_enviada = true;
    renderWeddingLists();
    return true;
  }

  function closeShareConfirmation() {
    document.getElementById('shareConfirmOverlay')?.remove();
  }

  function showShareConfirmation(row, stage) {
    if (!row || !stage || document.getElementById('shareConfirmOverlay')) return;
    pendingShareConfirmation = null;

    const stageInfo = [
      null,
      'invitación inicial',
      'recordatorio de confirmación',
      'itinerario'
    ][stage] || 'link';

    const overlay = document.createElement('div');
    overlay.className = 'share-confirm-overlay';
    overlay.id = 'shareConfirmOverlay';

    const card = document.createElement('div');
    card.className = 'share-confirm-card';
    const title = document.createElement('h3');
    title.textContent = '¿Fue compartido el link?';
    const text = document.createElement('p');
    text.textContent = 'Confirma si se envió ' + stageInfo + ' a ' + (row.nombre || 'este invitado') + '. Solo al elegir Sí se marcará como enviado.';

    const actions = document.createElement('div');
    actions.className = 'share-confirm-actions';

    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'mini-button compact-button';
    no.textContent = 'No';
    no.addEventListener('click', closeShareConfirmation);

    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'green-button';
    yes.textContent = 'Sí, fue compartido';
    yes.addEventListener('click', async function () {
      yes.disabled = true;
      no.disabled = true;
      const ok = await markWeddingStageSent(row, stage);
      if (ok) closeShareConfirmation();
      else { yes.disabled = false; no.disabled = false; }
    });

    actions.append(no, yes);
    card.append(title, text, actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  function armShareConfirmation(row, stage) {
    if (!row || !stage) return;
    pendingShareConfirmation = {
      rowId: row.id,
      stage,
      readyAt: Date.now() + 650
    };
  }

  function maybeConfirmReturnedShare() {
    const pending = pendingShareConfirmation;
    if (!pending || Date.now() < pending.readyAt) return;
    const row = weddingListRows.find(item => item.id === pending.rowId);
    if (!row) {
      pendingShareConfirmation = null;
      return;
    }
    showShareConfirmation(row, pending.stage);
  }

  window.addEventListener('focus', function () {
    window.setTimeout(maybeConfirmReturnedShare, 250);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) window.setTimeout(maybeConfirmReturnedShare, 250);
  });


  // Los plazos se almacenan en Supabase, nunca en el navegador.
  style.textContent += `
    .invite-deadline-box{margin:12px 0;padding:13px;border-radius:13px;background:#f7f3eb;border:1px solid rgba(143,105,40,.18)}
    .invite-deadline-box strong{display:block;font-size:13px;color:var(--admin-gold-dark)}
    .invite-deadline-box p{margin:5px 0 8px;font-size:12px;color:var(--admin-muted);line-height:1.5}
    .invite-deadline-settings{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .invite-deadline-settings label{font-size:12px;color:var(--admin-muted)}
    .invite-deadline-settings input{width:min(100%,290px)!important;min-width:210px!important;max-width:100%!important;height:39px!important}
    .invite-deadline-settings .mini-button{width:auto;margin:0}
    .deadline-modal-shade{position:fixed;inset:0;background:rgba(32,29,25,.58);z-index:9998;display:grid;place-items:center;padding:16px}
    .deadline-modal-card{width:min(100%,440px);background:#fffaf4;color:var(--admin-text);padding:24px;border-radius:20px;box-shadow:0 18px 55px rgba(0,0,0,.25)}
    .deadline-modal-card h3{color:var(--admin-gold-dark);margin:0 0 12px;font-size:21px}
    .deadline-modal-card p{font-size:14px;line-height:1.55}
    .deadline-modal-buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
    .deadline-modal-buttons button{width:auto;margin:0!important;min-width:0!important;padding:10px 12px;font-size:13px}
    @media(max-width:600px){.deadline-modal-buttons button{flex:1 1 140px}}
  `;

  function formatDeadlineCL(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago', dateStyle: 'full', timeStyle: 'short'
    }).format(new Date(value));
  }

  function findInviteByUrl(url) {
    try {
      const token = new URL(url).searchParams.get('inv');
      return allInvites.find(invite => invite.token === token) || null;
    } catch (_) { return null; }
  }


  // Conversión estricta del selector a America/Santiago, independiente de la zona
  // horaria configurada en el dispositivo del administrador.
  function chileDeadlineInputFromIso(value) {
    if (!value || !Number.isFinite(new Date(value).getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Santiago',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(value));
    const fields = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return fields.year + '-' + fields.month + '-' + fields.day +
      'T' + fields.hour + ':' + fields.minute;
  }

  function chileDeadlineToIso(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text || '');
    if (!match) return null;
    const [, year, month, day, hour, minute] = match.map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
    const wallUtc = Date.UTC(year, month - 1, day, hour, minute);
    // Chile continental utiliza UTC-3 o UTC-4. Verificar candidatos evita
    // convertir erróneamente horas inexistentes por cambios de horario.
    const candidates = [-3, -4].map(offset => new Date(wallUtc - offset * 3600000))
      .filter(date => chileDeadlineInputFromIso(date) === text);
    if (!candidates.length) return null;
    candidates.sort((a, b) => a.getTime() - b.getTime());
    return candidates[0].toISOString();
  }
  window.chileDeadlineToIso = chileDeadlineToIso;
  window.chileDeadlineInputFromIso = chileDeadlineInputFromIso;

  async function saveInviteDeadline(invite, textValue, button) {
    const deadline = chileDeadlineToIso(textValue);
    if (!deadline || Date.parse(deadline) <= Date.now() + 60000) {
      alert('Selecciona una fecha y hora futura en horario de Chile.');
      return;
    }
    if (invite.plazo_inicio_at) {
      alert('El plazo ya comenzó y su fecha límite no se puede modificar.');
      return;
    }
    button.disabled = true;
    const result = await client.from('invitaciones_personalizadas')
      .update({ plazo_fecha_limite_at: deadline, updated_at: new Date().toISOString() })
      .eq('id', invite.id).is('plazo_inicio_at', null).select('id');
    if (result.error || result.data?.length !== 1) {
      console.error(result.error);
      alert('No se pudo guardar la fecha límite. Actualiza los datos e inténtalo de nuevo.');
      button.disabled = false;
      await loadAdminData();
      return;
    }
    invite.plazo_fecha_limite_at = deadline;
    await loadAdminData();
  }

  function addDeadlineSettings(card, invite) {
    const panel = document.createElement('div');
    panel.className = 'invite-deadline-box';
    const heading = document.createElement('strong');
    heading.textContent = 'Fecha límite para responder';
    const info = document.createElement('p');
    const limit = invite.plazo_fin_at || invite.plazo_fecha_limite_at;
    if (invite.plazo_inicio_at) {
      const expired = new Date(limit).getTime() <= Date.now();
      info.textContent = (expired ? 'Plazo vencido. ' : 'Conteo iniciado. ') +
        'Hasta el ' + formatDeadlineCL(limit) + '.';
      panel.append(heading, info);
    } else {
      info.textContent = limit
        ? (Date.parse(limit) <= Date.now() ? 'Fecha vencida. Debes establecer otra. ' : 'Inicio de envío sin registrar. ') +
          'Fecha límite: ' + formatDeadlineCL(limit) + '.'
        : 'Sin fecha límite. Establécela antes de compartir la invitación.';
      panel.append(heading, info);
      const controls = document.createElement('div');
      controls.className = 'invite-deadline-settings';
      const label = document.createElement('label');
      label.textContent = 'Fecha y hora (Chile):';
      const input = document.createElement('input');
      input.type = 'datetime-local';
      input.step = '60';
      input.value = chileDeadlineInputFromIso(invite.plazo_fecha_limite_at || '');
      input.setAttribute('aria-label', 'Fecha y hora límite de ' +
        (invite.titulo_portada || invite.familia || 'invitación'));
      const save = document.createElement('button');
      save.type = 'button'; save.className = 'mini-button compact-button';
      save.textContent = 'Guardar fecha límite';
      save.onclick = () => saveInviteDeadline(invite, input.value, save);
      controls.append(label, input, save);
      panel.appendChild(controls);
    }
    card.appendChild(panel);
  }

  async function askStartDeadline(invite, method) {
    if (!invite || !invite.activa) {
      alert('No es posible compartir: la invitación no está disponible.');
      return false;
    }
    const limit = invite.plazo_fin_at || invite.plazo_fecha_limite_at;
    if (!limit) {
      alert('Debes establecer primero la fecha y hora límite de esta invitación.');
      return null;
    }
    if (Date.parse(limit) <= Date.now()) {
      alert('La fecha límite ya terminó. No es posible compartir esta invitación con plazo vencido.');
      return null;
    }
    if (invite.plazo_inicio_at) return { allowed: true, popup: null };
    return new Promise(resolve => {
      const shade = document.createElement('div');
      shade.className = 'deadline-modal-shade';
      const card = document.createElement('div');
      card.className = 'deadline-modal-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      const title = document.createElement('h3');
      title.textContent = '¿Iniciar plazo de confirmación?';
      const info = document.createElement('p');
      info.textContent = 'La confirmación termina el ' + formatDeadlineCL(limit) +
        ' (hora de Chile). Puedes registrar ahora el inicio del envío o compartir sin registrarlo. La fecha límite y la cuenta regresiva no cambian en ninguno de los dos casos.';
      const actions = document.createElement('div');
      actions.className = 'deadline-modal-buttons';
      function button(text, green) {
        const el = document.createElement('button');
        el.type = 'button'; el.className = green ? 'green-button' : 'mini-button compact-button';
        el.textContent = text; return el;
      }
      const start = button('Sí, iniciar ahora', true);
      const without = button('Compartir sin iniciar', false);
      const cancel = button('Cancelar', false);
      function close(value) { shade.remove(); resolve(value); }
      function reserveWhatsAppTab() {
        if (method !== 'whatsapp') return null;
        const popup = window.open('', '_blank');
        if (popup) popup.opener = null;
        return popup;
      }
      without.onclick = () => close({ allowed: true, popup: reserveWhatsAppTab() });
      cancel.onclick = () => close(null);
      start.onclick = async () => {
        const popup = reserveWhatsAppTab();
        start.disabled = true; without.disabled = true; cancel.disabled = true;
        start.textContent = 'Iniciando...';
        const result = await client.rpc('iniciar_plazo_invitacion', { p_invitacion_id: invite.id });
        if (result.error || !result.data?.plazo_fin_at) {
          console.error(result.error);
          if (popup) popup.close();
          alert('No se pudo iniciar el plazo. No se compartió el enlace.');
          start.disabled = false; without.disabled = false; cancel.disabled = false;
          start.textContent = 'Sí, iniciar ahora';
          return;
        }
        invite.plazo_inicio_at = result.data.plazo_inicio_at;
        invite.plazo_fin_at = result.data.plazo_fin_at;
        invite.plazo_fecha_limite_at = result.data.plazo_fecha_limite_at || limit;
        renderInvites();
        close({ allowed: true, popup });
      };
      actions.append(start, without, cancel);
      card.append(title, info, actions);
      shade.appendChild(card);
      document.body.appendChild(shade);
      start.focus();
    });
  }

  async function shareInvitation(method, url, title, row, clickedButton) {
    if (!url) return;
    const invite = findInviteByUrl(url);
    const permission = await askStartDeadline(invite, method);
    if (!permission?.allowed) return;
    if (method === 'copy') { await copyText(url, clickedButton); return; }
    const message = buildShareMessage(title, url);
    const nextStage = row ? shareStageInfo(row) : null;

    if (method === 'whatsapp') {
      if (row && nextStage) armShareConfirmation(row, nextStage.stage);
      const destination = 'https://wa.me/?text=' + encodeURIComponent(message);
      const opened = permission.popup || window.open(destination, '_blank', 'noopener,noreferrer');
      if (permission.popup) permission.popup.location.replace(destination);
      if (!opened) {
        await copyText(url);
        alert('Tu navegador bloqueó la ventana de WhatsApp. Copiamos el enlace para que puedas compartirlo manualmente.');
      }
      return;
    }

    if (method === 'email') {
      if (row && nextStage) armShareConfirmation(row, nextStage.stage);
      window.location.href = 'mailto:?subject=' + encodeURIComponent('Invitación de boda Carolina & Esthefano') + '&body=' + encodeURIComponent(message);
      return;
    }

    if (method === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Invitación de boda',
            text: 'Te compartimos nuestra invitación de boda.',
            url
          });
          if (row && nextStage) showShareConfirmation(row, nextStage.stage);
        } catch (error) {
          if (error?.name !== 'AbortError') {
            console.error(error);
            await copyText(url);
            alert('No fue posible abrir el menú de compartir. El enlace quedó copiado.');
          }
        }
        return;
      }
      await copyText(url);
      alert('Tu dispositivo no ofrece el menú de compartir. El link quedó copiado.');
    }
  }

  function setupGeneratedShareControls() {
    const box = document.getElementById('generatedInviteBox');
    if (!box || box.querySelector('.generated-share-actions')) return;

    const actions = document.createElement('div');
    actions.className = 'generated-share-actions';

    [
      ['WhatsApp', 'whatsapp'],
      ['Compartir', 'native'],
      ['Correo', 'email']
    ].forEach(([label, method]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mini-button compact-button';
      button.textContent = label;
      button.addEventListener('click', function () {
        shareInvitation(method, generatedInviteUrl.value, generatedInviteTitle.textContent);
      });
      actions.appendChild(button);
    });

    box.appendChild(actions);
    window.shareGeneratedInvite = (method, button) =>
      shareInvitation(method, generatedInviteUrl.value, generatedInviteTitle.textContent, null, button);
  }

  function setupWeddingLists() {
    const nav = document.querySelector('.sidebar-nav');
    const main = document.querySelector('.dashboard-main');
    if (!nav || !main || document.getElementById('weddingListsSection')) return;

    const navButton = document.createElement('button');
    navButton.className = 'nav-item';
    navButton.type = 'button';
    navButton.dataset.section = 'weddingListsSection';
    navButton.textContent = 'Lista de novios';
    nav.appendChild(navButton);

    const section = document.createElement('section');
    section.className = 'dashboard-section';
    section.id = 'weddingListsSection';
    section.innerHTML = `
      <div class="section-intro">
        <div>
          <h2>Lista de invitados por novios</h2>
          <p>Los nombres, links y estados de envío quedan sincronizados en un solo lugar.</p>
        </div>
      </div>

      <div class="wedding-list-summary">
        <article class="metric-card">
          <span>Novio</span>
          <strong id="groomListTotal">0</strong>
          <small>Personas en la lista del novio</small>
        </article>
        <article class="metric-card">
          <span>Novia</span>
          <strong id="brideListTotal">0</strong>
          <small>Personas en la lista de la novia</small>
        </article>
        <article class="metric-card wedding-total-card">
          <span>Total general</span>
          <strong id="weddingListGrandTotal">0</strong>
          <small>Total combinado de ambas listas</small>
        </article>
      </div>

      <div class="wedding-list-columns">
        <article class="wedding-list-card">
          <div class="wedding-list-head">
            <div>
              <h3>Lista del novio</h3>
              <p class="wedding-list-subcount" id="groomListSummary">0 links · 0 por enviar · 0 enviadas</p>
            </div>
            <div class="wedding-list-head-actions">
              <span class="wedding-side-count" id="groomInlineCount">0</span>
              <button class="wedding-list-toggle" type="button" id="toggleGroomList" aria-controls="groomListContent" aria-expanded="false" aria-label="Abrir lista del novio">Abrir lista ▾</button>
            </div>
          </div>
          <div class="wedding-list-content" id="groomListContent" hidden>
            <label for="groomNamesInput">Agregar invitados</label>
            <textarea id="groomNamesInput" rows="4" placeholder="Un nombre por línea&#10;Ej.: Juan Pérez&#10;María Soto"></textarea>
            <p class="form-help">Puedes pegar varios nombres a la vez. Después podrás editar cada nombre y crear o vincular su link.</p>
            <button class="green-button" type="button" id="addGroomNamesBtn">Agregar a lista del novio</button>
            <p class="status" id="groomListStatus"></p>
            <div class="wedding-list-scroll"><div class="wedding-list-items" id="groomListItems"></div></div>
          </div>
        </article>

        <article class="wedding-list-card">
          <div class="wedding-list-head">
            <div>
              <h3>Lista de la novia</h3>
              <p class="wedding-list-subcount" id="brideListSummary">0 links · 0 por enviar · 0 enviadas</p>
            </div>
            <div class="wedding-list-head-actions">
              <span class="wedding-side-count" id="brideInlineCount">0</span>
              <button class="wedding-list-toggle" type="button" id="toggleBrideList" aria-controls="brideListContent" aria-expanded="false" aria-label="Abrir lista de la novia">Abrir lista ▾</button>
            </div>
          </div>
          <div class="wedding-list-content" id="brideListContent" hidden>
            <label for="brideNamesInput">Agregar invitados</label>
            <textarea id="brideNamesInput" rows="4" placeholder="Un nombre por línea&#10;Ej.: Ana González&#10;Pedro Muñoz"></textarea>
            <p class="form-help">Puedes pegar varios nombres a la vez. Después podrás editar cada nombre y crear o vincular su link.</p>
            <button class="green-button" type="button" id="addBrideNamesBtn">Agregar a lista de la novia</button>
            <p class="status" id="brideListStatus"></p>
            <div class="wedding-list-scroll"><div class="wedding-list-items" id="brideListItems"></div></div>
          </div>
        </article>
      </div>
    `;
    main.appendChild(section);

    navButton.addEventListener('click', function () {
      setSection('weddingListsSection');
      document.getElementById('sectionTitle').textContent = 'Lista de novios';
      loadWeddingLists();
    });

    // Cada lista empieza cerrada y puede abrirse/cerrarse por separado.
    [
      ['toggleGroomList', 'groomListContent', 'del novio'],
      ['toggleBrideList', 'brideListContent', 'de la novia']
    ].forEach(([buttonId, contentId, description]) => {
      const button = document.getElementById(buttonId);
      const content = document.getElementById(contentId);
      button.addEventListener('click', () => {
        const expanded = content.hidden;
        content.hidden = !expanded;
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-label', (expanded ? 'Cerrar lista ' : 'Abrir lista ') + description);
        button.textContent = expanded ? 'Cerrar lista ▴' : 'Abrir lista ▾';
      });
    });

    document.getElementById('addGroomNamesBtn').addEventListener('click', function () {
      addWeddingNames('novio');
    });
    document.getElementById('addBrideNamesBtn').addEventListener('click', function () {
      addWeddingNames('novia');
    });
  }

  function sideElements(side) {
    const groom = side === 'novio';
    return {
      input: document.getElementById(groom ? 'groomNamesInput' : 'brideNamesInput'),
      status: document.getElementById(groom ? 'groomListStatus' : 'brideListStatus'),
      list: document.getElementById(groom ? 'groomListItems' : 'brideListItems')
    };
  }

  async function addWeddingNames(side) {
    const els = sideElements(side);
    if (!els.input || !els.status) return;

    const typed = els.input.value
      .split(/\n+/)
      .map(name => name.trim())
      .filter(Boolean);

    const uniqueTyped = Array.from(new Map(typed.map(name => [name.toLocaleLowerCase('es-CL'), name])).values());
    const existing = new Set(
      weddingListRows
        .filter(row => row.lado === side)
        .map(row => normalizeWeddingName(row.nombre))
    );
    const names = uniqueTyped.filter(name => !existing.has(normalizeWeddingName(name)));

    if (!names.length) {
      els.status.textContent = typed.length ? 'Los nombres ingresados ya están en esta lista.' : 'Agrega al menos un nombre.';
      return;
    }

    els.status.textContent = 'Guardando...';
    const result = await client
      .from('lista_novios')
      .insert(names.map(nombre => ({
        lado: side,
        nombre,
        asistencia_estado: 'por_confirmar'
      })));

    if (result.error) {
      console.error(result.error);
      els.status.textContent = 'No se pudieron guardar los nombres.';
      return;
    }

    els.input.value = '';
    els.status.textContent = names.length === 1 ? 'Invitado agregado.' : names.length + ' invitados agregados.';
    await loadWeddingLists();
  }

  async function createWeddingInvite(row) {
    if (row.invitacion_id) return;
    const initial = chileDeadlineInputFromIso(new Date(Date.now() + 7 * 86400000).toISOString());
    const answer = prompt('Fecha y hora límite para confirmar (Chile). Formato AAAA-MM-DDTHH:mm:', initial);
    if (answer === null) return;
    const plazo_fecha_limite_at = chileDeadlineToIso(answer.trim());
    if (!plazo_fecha_limite_at || Date.parse(plazo_fecha_limite_at) <= Date.now() + 60000) {
      alert('Debes indicar una fecha y hora futuras válidas en horario de Chile.');
      return;
    }

    const result = await client.from('invitaciones_personalizadas').insert([{
      tipo: 'lista_cerrada',
      titulo_portada: 'Invitación para ' + row.nombre,
      invitados: [row.nombre],
      familia: null,
      lado: row.lado,
      plazo_fecha_limite_at
    }]).select('*').single();

    if (result.error) {
      console.error(result.error);
      alert('No se pudo crear el link.');
      return;
    }

    const linked = await client
      .from('lista_novios')
      .update({ invitacion_id: result.data.id, updated_at: new Date().toISOString() })
      .eq('id', row.id);

    if (linked.error) {
      console.error(linked.error);
      await client.from('invitaciones_personalizadas').delete().eq('id', result.data.id);
      alert('El link se creó, pero no se pudo vincular. Se revirtió la creación.');
      return;
    }

    row.invitacion_id = result.data.id;
    allInvites.unshift(result.data);
    renderWeddingLists();
    renderInvites();
    alert('Link creado. El estado ahora es “Por enviar”.');
  }

  async function linkExistingWeddingInvite(row) {
    if (!allInvites.length) {
      alert('No hay links creados para vincular.');
      return;
    }

    const available = allInvites.filter(invite =>
      (!invite.lado || invite.lado === row.lado) &&
      ![...linkedInvitationSides(invite)].some(lado => lado !== row.lado)
    );
    if (!available.length) {
      alert('No hay invitaciones disponibles para este lado.');
      return;
    }
    const options = available.map((invite, index) =>
      (index + 1) + '. ' + invitationDisplayTitle(invite)
    ).join('\n');

    const answer = prompt('Escribe el número del link que quieres vincular con “' + row.nombre + '”:\n\n' + options);
    if (answer === null) return;
    const index = Number.parseInt(answer, 10) - 1;
    const invite = available[index];
    if (!invite) {
      alert('Selección no válida.');
      return;
    }

    if (!invite.lado) {
      const assigned = await client.from('invitaciones_personalizadas')
        .update({ lado: row.lado, updated_at: new Date().toISOString() })
        .eq('id', invite.id);
      if (assigned.error) {
        console.error(assigned.error);
        alert('No se pudo asignar la invitación al lado correspondiente.');
        return;
      }
      invite.lado = row.lado;
    }
    const result = await client
      .from('lista_novios')
      .update({ invitacion_id: invite.id, updated_at: new Date().toISOString() })
      .eq('id', row.id);

    if (result.error) {
      console.error(result.error);
      alert('No se pudo vincular el link.');
      return;
    }

    row.invitacion_id = invite.id;
    renderWeddingLists();
    renderInvites();
  }

  async function editWeddingName(row) {
    const oldName = row.nombre || '';
    const value = prompt('Editar nombre:', oldName);
    if (value === null) return;
    const name = value.trim();
    if (!name || name === oldName) return;

    const result = await client
      .from('lista_novios')
      .update({ nombre: name, updated_at: new Date().toISOString() })
      .eq('id', row.id);

    if (result.error) {
      console.error(result.error);
      alert('No se pudo editar el nombre.');
      return;
    }

    const invite = weddingInviteFor(row);
    if (invite) {
      const oldKey = normalizeWeddingName(oldName);
      let replaced = false;
      const names = (invite.invitados || []).map(invitedName => {
        if (normalizeWeddingName(invitedName) === oldKey) {
          replaced = true;
          return name;
        }
        return invitedName;
      });

      const patch = { updated_at: new Date().toISOString() };
      if (replaced) patch.invitados = names;
      if (normalizeWeddingName(invite.familia) === oldKey) patch.familia = name;
      if ((replaced && names.length === 1) || normalizeWeddingName(invite.titulo_portada) === normalizeWeddingName('Invitación para ' + oldName)) {
        patch.titulo_portada = 'Invitación para ' + name;
      }

      if (Object.keys(patch).length > 1) {
        const inviteUpdate = await client.from('invitaciones_personalizadas').update(patch).eq('id', invite.id);
        if (inviteUpdate.error) {
          console.error(inviteUpdate.error);
          alert('El nombre se actualizó en la lista, pero no se pudo sincronizar el link.');
        } else {
          if (patch.invitados) invite.invitados = patch.invitados;
          if (patch.familia) invite.familia = patch.familia;
          if (patch.titulo_portada) invite.titulo_portada = patch.titulo_portada;
        }
      }
    }

    row.nombre = name;
    renderWeddingLists();
    renderInvites();
  }

  async function deleteWeddingName(row) {
    if (row.asistencia_estado !== 'no') return;
    if (!confirm('¿Eliminar a "' + row.nombre + '" de la lista? Esta acción es manual y no se puede deshacer.')) return;

    const result = await client.from('lista_novios').delete().eq('id', row.id);
    if (result.error) {
      console.error(result.error);
      alert('No se pudo eliminar el nombre.');
      return;
    }

    const sharedRows = row.invitacion_id
      ? weddingListRows.filter(other => other.id !== row.id && other.invitacion_id === row.invitacion_id)
      : [];

    if (row.invitacion_id && !sharedRows.length) {
      await client.from('invitaciones_personalizadas')
        .update({ activa: false, updated_at: new Date().toISOString() })
        .eq('id', row.invitacion_id);
    }

    await loadAdminData();
  }

  async function updateWeddingAttendance(row, value, select) {
    select.disabled = true;
    const previous = row.asistencia_estado || 'por_confirmar';
    const result = await client
      .from('lista_novios')
      .update({ asistencia_estado: value, updated_at: new Date().toISOString() })
      .eq('id', row.id);

    if (result.error) {
      console.error(result.error);
      select.value = previous;
      select.disabled = false;
      alert('No se pudo actualizar la confirmación.');
      return;
    }

    row.asistencia_estado = value;
    renderWeddingLists();
  }

  async function updateWeddingSend(row, stage, checked, checkbox) {
    if (!row.invitacion_id) {
      checkbox.checked = false;
      alert('Primero crea o vincula el link de invitación.');
      return;
    }

    checkbox.disabled = true;
    const field = 'envio_' + stage + '_enviado';
    const patch = { updated_at: new Date().toISOString() };
    patch[field] = checked;
    if (stage === 1) patch.invitacion_enviada = checked;

    const result = await client.from('lista_novios').update(patch).eq('id', row.id);
    if (result.error) {
      console.error(result.error);
      checkbox.checked = !checked;
      checkbox.disabled = false;
      alert('No se pudo actualizar el envío.');
      return;
    }

    row[field] = checked;
    if (stage === 1) row.invitacion_enviada = checked;
    renderWeddingLists();
  }

  async function updateWeddingSendDate(row, stage, value, input) {
    input.disabled = true;
    const field = 'fecha_envio_' + stage;
    const patch = { updated_at: new Date().toISOString() };
    patch[field] = value || null;

    const result = await client.from('lista_novios').update(patch).eq('id', row.id);
    if (result.error) {
      console.error(result.error);
      input.value = row[field] || '';
      input.disabled = false;
      alert('No se pudo guardar la fecha.');
      return;
    }

    row[field] = value || null;
    renderWeddingLists();
  }

  function formatWeddingDate(value) {
    if (!value) return '';
    const parts = String(value).split('-');
    if (parts.length !== 3) return value;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function weddingLinkState(row) {
    if (!row.invitacion_id && (row.envio_1_enviado || row.invitacion_enviada)) {
      return { text: 'Enviado · link sin vincular', className: 'is-missing' };
    }
    if (!row.invitacion_id) return { text: 'Sin link', className: 'is-missing' };
    if (row.envio_1_enviado || row.invitacion_enviada) return { text: 'Enviado', className: 'is-sent' };
    return { text: 'Por enviar', className: 'is-ready' };
  }

  function nextWeddingSend(row) {
    if (row.asistencia_estado === 'no') return 'No asistirá · eliminación manual disponible';
    if (!row.invitacion_id) {
      return (row.envio_1_enviado || row.invitacion_enviada)
        ? 'Vincula el link enviado para dejar el registro sincronizado'
        : 'Primero crea o vincula el link';
    }

    const stages = [
      { sent: !!row.envio_1_enviado, date: row.fecha_envio_1, label: 'Invitación inicial' },
      { sent: !!row.envio_2_enviado, date: row.fecha_envio_2, label: 'Recordatorio' },
      { sent: !!row.envio_3_enviado, date: row.fecha_envio_3, label: 'Itinerario' }
    ];
    const next = stages.find(stage => !stage.sent);
    if (!next) return '3 envíos completados';
    return next.date
      ? 'Próximo: ' + next.label + ' · ' + formatWeddingDate(next.date)
      : 'Próximo: ' + next.label + ' · sin fecha';
  }

  function makeWeddingSendCell(row, stage, label) {
    const cell = document.createElement('div');
    cell.className = 'wedding-send-cell';

    const checkLabel = document.createElement('label');
    checkLabel.className = 'wedding-send-check';
    checkLabel.title = label;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!row['envio_' + stage + '_enviado'];
    checkbox.disabled = !row.invitacion_id;
    const checkText = document.createElement('span');
    checkText.textContent = row.invitacion_id ? 'Enviado' : 'Sin link';
    checkbox.addEventListener('change', function () {
      updateWeddingSend(row, stage, this.checked, this);
    });
    checkLabel.append(checkbox, checkText);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'wedding-send-date';
    dateInput.value = row['fecha_envio_' + stage] || '';
    dateInput.title = 'Fecha planificada para ' + label.toLowerCase();
    dateInput.addEventListener('change', function () {
      updateWeddingSendDate(row, stage, this.value, this);
    });

    cell.append(checkLabel, dateInput);
    return cell;
  }

  function renderWeddingSide(side, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const rows = weddingListRows
      .filter(row => row.lado === side)
      .slice()
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es-CL', { sensitivity: 'base' }));

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'wedding-list-empty';
      empty.textContent = 'Aún no hay personas en esta lista.';
      container.appendChild(empty);
      return;
    }

    const head = document.createElement('div');
    head.className = 'wedding-list-table-head';
    ['N°', 'Nombre / link / próximo envío', 'Asistirá', '1 · Invitación', '2 · Recordatorio', '3 · Itinerario', 'Link y acciones'].forEach(text => {
      const cell = document.createElement('span');
      cell.textContent = text;
      head.appendChild(cell);
    });
    container.appendChild(head);

    rows.forEach((row, index) => {
      const state = row.asistencia_estado || 'por_confirmar';
      const item = document.createElement('div');
      item.className = 'wedding-person-row' + (state === 'si' ? ' is-yes' : state === 'no' ? ' is-no' : '');

      const number = document.createElement('span');
      number.className = 'wedding-person-number';
      number.textContent = String(index + 1);

      const nameBox = document.createElement('div');
      const name = document.createElement('span');
      name.className = 'wedding-person-name';
      name.textContent = row.nombre || 'Sin nombre';
      name.title = row.nombre || 'Sin nombre';

      const linkStateData = weddingLinkState(row);
      const linkState = document.createElement('span');
      linkState.className = 'wedding-link-state ' + linkStateData.className;
      linkState.textContent = linkStateData.text;

      const next = document.createElement('span');
      next.className = 'wedding-next-send';
      next.textContent = nextWeddingSend(row);
      nameBox.append(name, linkState, next);

      const attendance = document.createElement('select');
      attendance.className = 'wedding-attendance-select';
      [
        ['por_confirmar', 'Por confirmar'],
        ['si', 'Sí'],
        ['no', 'No']
      ].forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        attendance.appendChild(option);
      });
      attendance.value = state;
      attendance.addEventListener('change', function () {
        updateWeddingAttendance(row, this.value, this);
      });

      const send1 = makeWeddingSendCell(row, 1, 'Invitación inicial');
      const send2 = makeWeddingSendCell(row, 2, 'Recordatorio de confirmación');
      const send3 = makeWeddingSendCell(row, 3, 'Itinerario');

      const actions = document.createElement('div');
      actions.className = 'wedding-person-actions';

      const invite = weddingInviteFor(row);
      if (!invite) {
        const create = document.createElement('button');
        create.className = 'mini-button compact-button wedding-create-link';
        create.type = 'button';
        create.textContent = 'Crear link';
        create.addEventListener('click', () => createWeddingInvite(row));
        actions.appendChild(create);

        if (allInvites.length) {
          const linkExisting = document.createElement('button');
          linkExisting.className = 'mini-button compact-button';
          linkExisting.type = 'button';
          linkExisting.textContent = 'Vincular existente';
          linkExisting.addEventListener('click', () => linkExistingWeddingInvite(row));
          actions.appendChild(linkExisting);
        }
      } else {
        const url = invitationUrl(invite.token);
        const title = invitationDisplayTitle(invite);

        const whatsapp = document.createElement('button');
        whatsapp.className = 'mini-button compact-button';
        whatsapp.type = 'button';
        whatsapp.textContent = 'WhatsApp';
        whatsapp.addEventListener('click', () => shareInvitation('whatsapp', url, title, row));
        actions.appendChild(whatsapp);

        const share = document.createElement('button');
        share.className = 'mini-button compact-button';
        share.type = 'button';
        share.textContent = 'Compartir';
        share.addEventListener('click', () => shareInvitation('native', url, title, row));
        actions.appendChild(share);

        const email = document.createElement('button');
        email.className = 'mini-button compact-button';
        email.type = 'button';
        email.textContent = 'Correo';
        email.addEventListener('click', () => shareInvitation('email', url, title, row));
        actions.appendChild(email);

        const copy = document.createElement('button');
        copy.className = 'mini-button compact-button';
        copy.type = 'button';
        copy.textContent = 'Copiar';
        copy.addEventListener('click', () => shareInvitation('copy', url, title, row, copy));
        actions.appendChild(copy);
      }

      const edit = document.createElement('button');
      edit.className = 'mini-button compact-button';
      edit.type = 'button';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => editWeddingName(row));
      actions.appendChild(edit);

      if (state === 'no') {
        const del = document.createElement('button');
        del.className = 'mini-button compact-button wedding-delete-button';
        del.type = 'button';
        del.textContent = 'Eliminar';
        del.title = 'Disponible porque esta persona indicó que no asistirá';
        del.addEventListener('click', () => deleteWeddingName(row));
        actions.appendChild(del);
      }

      item.append(number, nameBox, attendance, send1, send2, send3, actions);
      container.appendChild(item);
    });
  }

  function renderWeddingLists() {
    const groomRows = weddingListRows.filter(row => row.lado === 'novio');
    const brideRows = weddingListRows.filter(row => row.lado === 'novia');
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    function summary(rows) {
      const linked = rows.filter(row => row.invitacion_id).length;
      const sent = rows.filter(row => row.envio_1_enviado || row.invitacion_enviada).length;
      const toSend = rows.filter(row => row.invitacion_id && !(row.envio_1_enviado || row.invitacion_enviada)).length;
      const yes = rows.filter(row => row.asistencia_estado === 'si').length;
      const no = rows.filter(row => row.asistencia_estado === 'no').length;
      const pending = rows.length - yes - no;
      return linked + ' links · ' + toSend + ' por enviar · ' + sent + ' enviadas · ' + yes + ' sí · ' + pending + ' por confirmar · ' + no + ' no';
    }

    setText('groomListTotal', groomRows.length);
    setText('brideListTotal', brideRows.length);
    setText('weddingListGrandTotal', groomRows.length + brideRows.length);
    setText('groomInlineCount', groomRows.length);
    setText('brideInlineCount', brideRows.length);
    setText('groomListSummary', summary(groomRows));
    setText('brideListSummary', summary(brideRows));

    renderWeddingSide('novio', 'groomListItems');
    renderWeddingSide('novia', 'brideListItems');
  }

  async function syncExistingWeddingLinks() {
    let changed = false;

    for (const row of weddingListRows) {
      if (row.invitacion_id) continue;
      const key = normalizeWeddingName(row.nombre);
      if (!key) continue;

      const matches = allInvites.filter(invite => {
        const names = (invite.invitados || []).map(normalizeWeddingName);
        return (!invite.lado || invite.lado === row.lado) &&
          ![...linkedInvitationSides(invite)].some(lado => lado !== row.lado) &&
          (names.includes(key) || normalizeWeddingName(invite.familia) === key);
      });

      const uniqueIds = Array.from(new Set(matches.map(invite => invite.id)));
      if (uniqueIds.length !== 1) continue;

      const invite = matches[0];
      if (!invite.lado) {
        const assigned = await client.from('invitaciones_personalizadas')
          .update({ lado: row.lado, updated_at: new Date().toISOString() })
          .eq('id', invite.id);
        if (assigned.error) {
          console.error(assigned.error);
          continue;
        }
        invite.lado = row.lado;
      }
      const result = await client
        .from('lista_novios')
        .update({ invitacion_id: uniqueIds[0], updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (!result.error) {
        row.invitacion_id = uniqueIds[0];
        changed = true;
      }
    }

    return changed;
  }

  async function loadWeddingLists() {
    if (!document.getElementById('weddingListsSection')) return;
    const result = await client
      .from('lista_novios')
      .select('*')
      .order('created_at', { ascending: true });

    if (result.error) {
      console.error(result.error);
      const groomStatus = document.getElementById('groomListStatus');
      const brideStatus = document.getElementById('brideListStatus');
      if (groomStatus) groomStatus.textContent = 'No se pudo cargar la lista.';
      if (brideStatus) brideStatus.textContent = 'No se pudo cargar la lista.';
      return;
    }

    weddingListRows = result.data || [];
    weddingListRows.forEach(row => {
      if (!row.asistencia_estado) row.asistencia_estado = 'por_confirmar';
      if (typeof row.envio_1_enviado !== 'boolean') row.envio_1_enviado = !!row.invitacion_enviada;
      if (typeof row.envio_2_enviado !== 'boolean') row.envio_2_enviado = false;
      if (typeof row.envio_3_enviado !== 'boolean') row.envio_3_enviado = false;
    });

    await syncExistingWeddingLinks();
    renderWeddingLists();
  }

  setupWeddingLists();
  setupGeneratedShareControls();

  const loadAdminDataBase = loadAdminData;
  loadAdminData = async function () {
    await loadAdminDataBase();
    await loadWeddingLists();
  };

  setupCreateMode();
  setupDashboardStat();
  setupFilter();
  setupInvitationSideNavigation();
  patchRenderers();
  setupGeneratedShareControls();

  if (!document.getElementById('adminPanel').classList.contains('hidden')) loadAdminData();
})();