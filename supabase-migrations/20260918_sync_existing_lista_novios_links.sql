-- Vincula automáticamente solo coincidencias exactas y no ambiguas ya existentes.
with matches as (
  select
    ln.id as row_id,
    array_agg(distinct ip.id) as invite_ids
  from public.lista_novios ln
  join public.invitaciones_personalizadas ip
    on lower(trim(coalesce(ip.familia, ''))) = lower(trim(ln.nombre))
    or exists (
      select 1
      from unnest(ip.invitados) as guest_name
      where lower(trim(guest_name)) = lower(trim(ln.nombre))
    )
  where ln.invitacion_id is null
  group by ln.id
),
unique_matches as (
  select row_id, invite_ids[1] as invite_id
  from matches
  where cardinality(invite_ids) = 1
)
update public.lista_novios ln
set invitacion_id = um.invite_id,
    updated_at = now()
from unique_matches um
where ln.id = um.row_id;
