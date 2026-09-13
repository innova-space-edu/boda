-- Adds the individual + one companion invitation mode.
alter table public.invitaciones_personalizadas
  drop constraint if exists invitaciones_personalizadas_tipo_check;

alter table public.invitaciones_personalizadas
  add constraint invitaciones_personalizadas_tipo_check
  check (tipo in ('lista_cerrada', 'familia_libre', 'individual_acompanante'));

alter table public.invitaciones_personalizadas
  drop constraint if exists invitaciones_personalizadas_modo_datos_check;

alter table public.invitaciones_personalizadas
  add constraint invitaciones_personalizadas_modo_datos_check
  check (
    (tipo = 'lista_cerrada' and cardinality(invitados) >= 1)
    or
    (tipo = 'familia_libre' and familia is not null and length(trim(familia)) > 0)
    or
    (tipo = 'individual_acompanante' and cardinality(invitados) = 1)
  );

create or replace function public.confirmar_invitacion_personalizada(
  p_token uuid,
  p_asistentes text[],
  p_contactos jsonb default '{}'::jsonb,
  p_mensaje text default ''
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_invitados text[];
  v_nombre text;
  v_asiste boolean;
  v_contacto text;
  v_total integer := 0;
begin
  select i.id, i.invitados into v_id, v_invitados
  from public.invitaciones_personalizadas i
  where i.token = p_token and i.activa = true and i.tipo = 'lista_cerrada'
  for update;

  if v_id is null then raise exception 'Invitación no válida o inactiva'; end if;
  if p_asistentes is null then p_asistentes := '{}'::text[]; end if;

  if exists (
    select 1 from unnest(p_asistentes) a(nombre)
    where not (a.nombre = any(v_invitados))
  ) then
    raise exception 'La respuesta contiene una persona que no pertenece a esta invitación';
  end if;

  delete from public.invitados where invitacion_id = v_id;
  foreach v_nombre in array v_invitados loop
    v_asiste := v_nombre = any(p_asistentes);
    v_contacto := coalesce(p_contactos ->> v_nombre, '');
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_nombre,
      case when v_asiste then 'Sí asistiré' else 'No podré asistir' end,
      1, array_to_string(v_invitados, ' y '), v_contacto, v_contacto,
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
    if v_asiste then v_total := v_total + 1; end if;
  end loop;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;
  return v_total;
end;
$$;

revoke execute on function public.confirmar_invitacion_personalizada(uuid,text[],jsonb,text) from public;
grant execute on function public.confirmar_invitacion_personalizada(uuid,text[],jsonb,text) to anon, authenticated;

create or replace function public.confirmar_invitacion_individual_acompanante(
  p_token uuid,
  p_principal_asiste boolean,
  p_contacto_principal text default '',
  p_acompanante_nombre text default '',
  p_acompanante_contacto text default '',
  p_mensaje text default ''
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_principal text;
  v_acompanante text;
  v_total integer := 0;
begin
  select i.id, i.invitados[1] into v_id, v_principal
  from public.invitaciones_personalizadas i
  where i.token = p_token and i.activa = true and i.tipo = 'individual_acompanante'
  for update;

  if v_id is null or v_principal is null or trim(v_principal) = '' then
    raise exception 'Invitación individual no válida o inactiva';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  if not coalesce(p_principal_asiste, false) then
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_principal, 'No podré asistir', 1, v_principal,
      coalesce(p_contacto_principal, ''), coalesce(p_contacto_principal, ''),
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
  else
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_principal, 'Sí asistiré', 1, v_principal,
      coalesce(p_contacto_principal, ''), coalesce(p_contacto_principal, ''),
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
    v_total := 1;

    v_acompanante := trim(coalesce(p_acompanante_nombre, ''));
    if v_acompanante <> '' then
      if lower(v_acompanante) = lower(trim(v_principal)) then
        raise exception 'El acompañante debe ser una persona distinta';
      end if;
      insert into public.invitados (
        nombre, asistencia, cantidad, confirmante, telefono,
        contacto_integrante, mensaje, grupo_id, invitacion_id
      ) values (
        v_acompanante, 'Sí asistiré', 1, v_principal,
        coalesce(p_acompanante_contacto, ''), coalesce(p_acompanante_contacto, ''),
        coalesce(p_mensaje, ''), v_id::text, v_id
      );
      v_total := 2;
    end if;
  end if;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;
  return v_total;
end;
$$;

revoke execute on function public.confirmar_invitacion_individual_acompanante(uuid,boolean,text,text,text,text) from public;
grant execute on function public.confirmar_invitacion_individual_acompanante(uuid,boolean,text,text,text,text) to anon, authenticated;
