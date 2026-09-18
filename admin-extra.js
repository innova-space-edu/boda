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
      if (!name || !title) {
        inviteCreateStatus.textContent = 'Completa el nombre de la persona y el texto de portada.';
        return;
      }
      inviteCreateStatus.textContent = 'Creando invitación...';
      const result = await client.from('invitaciones_personalizadas').insert([{
        tipo: 'individual_acompanante', titulo_portada: title, invitados: [name], familia: null
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

  function patchRenderers() {
    renderInvites = function () {
      const container = document.getElementById('personalInvitesList');
      container.innerHTML = '';
      let rows = allInvites.slice();
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
        const copy = document.createElement('button'); copy.className='mini-button compact-button'; copy.textContent='Copiar link'; copy.onclick=()=>copyText(input.value,copy); actions.appendChild(copy);
        const whatsapp = document.createElement('button'); whatsapp.className='mini-button compact-button'; whatsapp.textContent='WhatsApp'; whatsapp.onclick=()=>shareInvitation('whatsapp',input.value,h3.textContent); actions.appendChild(whatsapp);
        const share = document.createElement('button'); share.className='mini-button compact-button'; share.textContent='Compartir'; share.onclick=()=>shareInvitation('native',input.value,h3.textContent); actions.appendChild(share);
        const email = document.createElement('button'); email.className='mini-button compact-button'; email.textContent='Correo'; email.onclick=()=>shareInvitation('email',input.value,h3.textContent); actions.appendChild(email);
        const edit = document.createElement('button'); edit.className='mini-button compact-button'; edit.textContent='Editar portada'; edit.onclick=async()=>{ const value=prompt('Texto de portada:',invite.titulo_portada||''); if(value===null||!value.trim()) return; await client.from('invitaciones_personalizadas').update({titulo_portada:value.trim(),updated_at:new Date().toISOString()}).eq('id',invite.id); await loadAdminData(); }; actions.appendChild(edit);
        const toggle = document.createElement('button'); toggle.className='mini-button compact-button'; toggle.textContent=invite.activa?'Desactivar':'Reactivar'; toggle.onclick=async()=>{ await client.from('invitaciones_personalizadas').update({activa:!invite.activa,updated_at:new Date().toISOString()}).eq('id',invite.id); await loadAdminData(); }; actions.appendChild(toggle);
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
    .wedding-list-card .wedding-list-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
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

  async function shareInvitation(method, url, title, row) {
    if (!url) return;
    const message = buildShareMessage(title, url);
    const nextStage = row ? shareStageInfo(row) : null;

    if (method === 'whatsapp') {
      if (row && nextStage) armShareConfirmation(row, nextStage.stage);
      window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
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
          if (error?.name !== 'AbortError') console.error(error);
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
            <span class="wedding-side-count" id="groomInlineCount">0</span>
          </div>
          <label for="groomNamesInput">Agregar invitados</label>
          <textarea id="groomNamesInput" rows="4" placeholder="Un nombre por línea&#10;Ej.: Juan Pérez&#10;María Soto"></textarea>
          <p class="form-help">Puedes pegar varios nombres a la vez. Después podrás editar cada nombre y crear o vincular su link.</p>
          <button class="green-button" type="button" id="addGroomNamesBtn">Agregar a lista del novio</button>
          <p class="status" id="groomListStatus"></p>
          <div class="wedding-list-scroll"><div class="wedding-list-items" id="groomListItems"></div></div>
        </article>

        <article class="wedding-list-card">
          <div class="wedding-list-head">
            <div>
              <h3>Lista de la novia</h3>
              <p class="wedding-list-subcount" id="brideListSummary">0 links · 0 por enviar · 0 enviadas</p>
            </div>
            <span class="wedding-side-count" id="brideInlineCount">0</span>
          </div>
          <label for="brideNamesInput">Agregar invitados</label>
          <textarea id="brideNamesInput" rows="4" placeholder="Un nombre por línea&#10;Ej.: Ana González&#10;Pedro Muñoz"></textarea>
          <p class="form-help">Puedes pegar varios nombres a la vez. Después podrás editar cada nombre y crear o vincular su link.</p>
          <button class="green-button" type="button" id="addBrideNamesBtn">Agregar a lista de la novia</button>
          <p class="status" id="brideListStatus"></p>
          <div class="wedding-list-scroll"><div class="wedding-list-items" id="brideListItems"></div></div>
        </article>
      </div>
    `;
    main.appendChild(section);

    navButton.addEventListener('click', function () {
      setSection('weddingListsSection');
      document.getElementById('sectionTitle').textContent = 'Lista de novios';
      loadWeddingLists();
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

    const result = await client.from('invitaciones_personalizadas').insert([{
      tipo: 'lista_cerrada',
      titulo_portada: 'Invitación para ' + row.nombre,
      invitados: [row.nombre],
      familia: null
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

    const options = allInvites.map((invite, index) => {
      return (index + 1) + '. ' + invitationDisplayTitle(invite);
    }).join('\n');

    const answer = prompt('Escribe el número del link que quieres vincular con “' + row.nombre + '”:\n\n' + options);
    if (answer === null) return;
    const index = Number.parseInt(answer, 10) - 1;
    const invite = allInvites[index];
    if (!invite) {
      alert('Selección no válida.');
      return;
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
        copy.addEventListener('click', () => copyText(url, copy));
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
        return names.includes(key) || normalizeWeddingName(invite.familia) === key;
      });

      const uniqueIds = Array.from(new Set(matches.map(invite => invite.id)));
      if (uniqueIds.length !== 1) continue;

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
  patchRenderers();
  setupGeneratedShareControls();

  if (!document.getElementById('adminPanel').classList.contains('hidden')) loadAdminData();
})();