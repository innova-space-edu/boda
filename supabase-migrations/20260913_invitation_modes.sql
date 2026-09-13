-- Adds two invitation modes:
-- 1) lista_cerrada: only predefined people can RSVP.
-- 2) familia_libre: the invited family can freely add who will attend.

alter table public.invitaciones_personalizadas
  add column if not exists tipo text not null default 'lista_cerrada',
  add column if not exists familia text;

alter table public.invitaciones_personalizadas
  drop constraint if exists invitaciones_personalizadas_invitados_check;

alter table public.invitaciones_personalizadas
  drop constraint if exists invitaciones_personalizadas_tipo_check;
alter table public.invitaciones_personalizadas
  add constraint invitaciones_personalizadas_tipo_check
  check (tipo in ('lista_cerrada','familia_libre'));

alter table public.invitaciones_personalizadas
  drop constraint if exists invitaciones_personalizadas_modo_datos_check;
alter table public.invitaciones_personalizadas
  add constraint invitaciones_personalizadas_modo_datos_check
  check (
    (tipo = 'lista_cerrada' and cardinality(invitados) >= 1)
    or
    (tipo = 'familia_libre' and familia is not null and length(trim(familia)) > 0)
  );

drop function if exists public.obtener_invitacion_personalizada(uuid);
create function public.obtener_invitacion_personalizada(p_token uuid)
returns table (
  invitacion_id uuid,
  invitados text[],
  titulo_portada text,
  tipo text,
  familia text
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.invitados, i.titulo_portada, i.tipo, i.familia
  from public.invitaciones_personalizadas i
  where i.token = p_token and i.activa = true
  limit 1;
$$;

revoke execute on function public.obtener_invitacion_personalizada(uuid) from public;
grant execute on function public.obtener_invitacion_personalizada(uuid) to anon, authenticated;

create or replace function public.confirmar_invitacion_familia_libre(
  p_token uuid,
  p_nombres text[],
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
  v_familia text;
  v_nombre text;
  v_contacto text;
  v_total integer := 0;
begin
  select i.id, i.familia into v_id, v_familia
  from public.invitaciones_personalizadas i
  where i.token = p_token and i.activa = true and i.tipo = 'familia_libre'
  for update;

  if v_id is null then
    raise exception 'Invitación familiar no válida o inactiva';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  if p_nombres is null or cardinality(p_nombres) = 0 then
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_familia, 'No podré asistir', 1, v_familia, '', '',
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
  else
    foreach v_nombre in array p_nombres loop
      v_nombre := trim(v_nombre);
      if v_nombre is null or v_nombre = '' then continue; end if;
      v_contacto := coalesce(p_contactos ->> v_nombre, '');
      insert into public.invitados (
        nombre, asistencia, cantidad, confirmante, telefono,
        contacto_integrante, mensaje, grupo_id, invitacion_id
      ) values (
        v_nombre, 'Sí asistiré', 1, v_familia, v_contacto,
        v_contacto, coalesce(p_mensaje, ''), v_id::text, v_id
      );
      v_total := v_total + 1;
    end loop;

    if v_total = 0 then
      raise exception 'Debe registrar al menos una persona válida';
    end if;
  end if;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;

  return v_total;
end;
$$;

revoke execute on function public.confirmar_invitacion_familia_libre(uuid,text[],jsonb,text) from public;
grant execute on function public.confirmar_invitacion_familia_libre(uuid,text[],jsonb,text) to anon, authenticated;
