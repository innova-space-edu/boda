-- Adds a short cover title for personalized wedding invitation links.
-- Example: "Invitación para la familia Morales Campaña"

alter table public.invitaciones_personalizadas
  add column if not exists titulo_portada text;

drop function if exists public.obtener_invitacion_personalizada(uuid);

create function public.obtener_invitacion_personalizada(p_token uuid)
returns table (
  invitacion_id uuid,
  invitados text[],
  titulo_portada text
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.invitados, i.titulo_portada
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
  limit 1;
$$;

revoke execute on function public.obtener_invitacion_personalizada(uuid) from public;
grant execute on function public.obtener_invitacion_personalizada(uuid) to anon, authenticated;
