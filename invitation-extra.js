(function () {
  const path = window.location.pathname;
  const sb = (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase)
    ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

  async function validateToken(token) {
    if (!sb || !token) return null;
    const result = await sb.rpc('obtener_invitacion_personalizada', { p_token: token });
    return result.error ? null : (result.data && result.data[0]) || null;
  }

  async function guardIndex() {
    const confirmLink = document.querySelector('a.hotspot.confirmar');
    if (!confirmLink) return;
    const urlToken = new URLSearchParams(location.search).get('inv') || '';
    const token = urlToken || sessionStorage.getItem('weddingInviteToken') || '';
    let valid = false;

    confirmLink.style.pointerEvents = 'none';
    confirmLink.setAttribute('aria-disabled','true');
    confirmLink.tabIndex = -1;

    const invitation = await validateToken(token);
    if (invitation) {
      valid = true;
      sessionStorage.setItem('weddingInviteToken', token);
      confirmLink.style.pointerEvents = '';
      confirmLink.setAttribute('aria-disabled','false');
      confirmLink.tabIndex = 0;
    } else if (token) {
      sessionStorage.removeItem('weddingInviteToken');
    }

    confirmLink.addEventListener('click', function (event) {
      if (!valid) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function showNoTokenForm(form, subtitle) {
    form.classList.add('hidden');
    subtitle.textContent = 'La confirmación solo se habilita desde un link personalizado.';
    let box = document.getElementById('extraNoInviteBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'extraNoInviteBox';
      box.className = 'bank-box';
      box.innerHTML = '<div class="bank-row"><strong>Confirmación no habilitada</strong></div><p class="small-muted">Para confirmar asistencia debes entrar desde el link que Carolina y Esthefano enviaron para ti, tu familia o tu invitación con acompañante.</p>';
      form.insertAdjacentElement('beforebegin', box);
    }
  }

  async function guardConfirmationPage() {
    const form = document.getElementById('rsvpForm');
    const subtitle = document.getElementById('rsvpSubtitle');
    if (!form || !subtitle) return;
    const token = new URLSearchParams(location.search).get('inv') || '';

    if (!token) {
      showNoTokenForm(form, subtitle);
      form.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
      return;
    }

    const invitation = await validateToken(token);
    if (!invitation) {
      showNoTokenForm(form, subtitle);
      subtitle.textContent = 'Este link no es válido o fue desactivado.';
      form.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
      return;
    }

    if (invitation.tipo !== 'individual_acompanante') return;

    document.getElementById('closedInviteFields')?.classList.add('hidden');
    document.getElementById('openFamilyFields')?.classList.add('hidden');
    document.getElementById('generalFields')?.classList.add('hidden');
    form.classList.remove('hidden');

    let fields = document.getElementById('extraCompanionFields');
    if (!fields) {
      fields = document.createElement('div');
      fields.id = 'extraCompanionFields';
      const principal = (invitation.invitados || [])[0] || 'Persona invitada';
      fields.innerHTML = `
        <div class="personalized-rsvp-title"></div>
        <p class="small-muted">Esta invitación corresponde a una persona y permite registrar como máximo un acompañante.</p>
        <label for="extraPrincipalAttendance">¿Asistirás?</label>
        <select id="extraPrincipalAttendance"><option value="yes">Sí, asistiré</option><option value="no">No podré asistir</option></select>
        <div id="extraPrincipalOptions">
          <label for="extraPrincipalContact">Tu WhatsApp o teléfono (opcional)</label>
          <input id="extraPrincipalContact" type="tel" placeholder="Contacto" />
          <label class="attendance-check" for="extraWithCompanion"><input id="extraWithCompanion" type="checkbox" /><span>Asistiré con un acompañante</span></label>
          <div id="extraCompanionPerson" class="member-entry hidden">
            <label for="extraCompanionName">Nombre y apellido del acompañante</label>
            <input id="extraCompanionName" type="text" placeholder="Nombre y apellido" />
            <label for="extraCompanionContact">WhatsApp o teléfono del acompañante (opcional)</label>
            <input id="extraCompanionContact" type="tel" placeholder="Contacto" />
          </div>
        </div>`;
      fields.querySelector('.personalized-rsvp-title').textContent = invitation.titulo_portada || ('Invitación para ' + principal);
      const messageLabel = form.querySelector('label[for="mensaje"]');
      form.insertBefore(fields, messageLabel || form.firstChild);
    }

    subtitle.textContent = 'Confirma tu asistencia y, si corresponde, registra a tu acompañante.';
    const attendance = document.getElementById('extraPrincipalAttendance');
    const options = document.getElementById('extraPrincipalOptions');
    const withCompanion = document.getElementById('extraWithCompanion');
    const companionBox = document.getElementById('extraCompanionPerson');

    function syncAttendance() {
      const attending = attendance.value === 'yes';
      options.classList.toggle('hidden', !attending);
      if (!attending) { withCompanion.checked = false; companionBox.classList.add('hidden'); }
    }
    attendance.addEventListener('change', syncAttendance);
    withCompanion.addEventListener('change', function () { companionBox.classList.toggle('hidden', !this.checked); });
    syncAttendance();

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const status = document.getElementById('status');
      const submit = document.getElementById('submitRsvpBtn');
      submit.disabled = true;
      status.textContent = 'Enviando confirmación...';

      const principalAsiste = attendance.value === 'yes';
      const hasCompanion = principalAsiste && withCompanion.checked;
      const companionName = hasCompanion ? document.getElementById('extraCompanionName').value.trim() : '';
      if (hasCompanion && !companionName) {
        status.textContent = 'Escribe el nombre del acompañante.';
        submit.disabled = false;
        return;
      }

      const result = await sb.rpc('confirmar_invitacion_individual_acompanante', {
        p_token: token,
        p_principal_asiste: principalAsiste,
        p_contacto_principal: document.getElementById('extraPrincipalContact').value.trim(),
        p_acompanante_nombre: companionName,
        p_acompanante_contacto: hasCompanion ? document.getElementById('extraCompanionContact').value.trim() : '',
        p_mensaje: document.getElementById('mensaje').value.trim()
      });
      if (result.error) {
        console.error(result.error);
        status.textContent = 'No se pudo guardar la confirmación.';
      } else if (!principalAsiste) {
        status.textContent = 'Registramos que no podrás asistir. Muchas gracias.';
      } else if (hasCompanion) {
        status.textContent = 'Confirmación enviada para ti y tu acompañante. Muchas gracias.';
      } else {
        status.textContent = 'Confirmación enviada. Muchas gracias.';
      }
      submit.disabled = false;
    }, true);
  }

  if (path.endsWith('/admin.html')) return;
  if (path.endsWith('/confirmar.html')) guardConfirmationPage();
  else guardIndex();
})();