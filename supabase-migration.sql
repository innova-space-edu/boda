-- Supabase schema for Carolina & Esthefano wedding invitation
-- Current frontend tables: invitados, invitacion_visitas
-- Public visitors may INSERT confirmations/visits, but only the authorized
-- authenticated administrator may read, update or delete wedding records.

create table if not exists public.invitados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) > 0),
  asistencia text not null check (asistencia in ('Sí asistiré', 'No podré asistir')),
  cantidad integer not null default 1 check (cantidad between 1 and 20),
  confirmante text not null check (length(trim(confirmante)) > 0),
  telefono text not null default '',
  contacto_integrante text not null default '',
  mensaje text not null default '',
  grupo_id text not null check (length(trim(grupo_id)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists invitados_created_at_idx
  on public.invitados (created_at desc);
create index if not exists invitados_grupo_id_idx
  on public.invitados (grupo_id);

alter table public.invitados enable row level security;
revoke all on table public.invitados from anon, authenticated;
grant insert on table public.invitados to anon, authenticated;
grant select, update, delete on table public.invitados to authenticated;

drop policy if exists invitados_public_insert on public.invitados;
create policy invitados_public_insert
on public.invitados
for insert
to anon, authenticated
with check (true);

drop policy if exists invitados_admin_select on public.invitados;
create policy invitados_admin_select
on public.invitados
for select
to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
);

drop policy if exists invitados_admin_update on public.invitados;
create policy invitados_admin_update
on public.invitados
for update
to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
)
with check (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
);

drop policy if exists invitados_admin_delete on public.invitados;
create policy invitados_admin_delete
on public.invitados
for delete
to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
);

create table if not exists public.invitacion_visitas (
  id uuid primary key default gen_random_uuid(),
  pagina text not null default 'invitacion',
  created_at timestamptz not null default now()
);

create index if not exists invitacion_visitas_created_at_idx
  on public.invitacion_visitas (created_at desc);

alter table public.invitacion_visitas enable row level security;
revoke all on table public.invitacion_visitas from anon, authenticated;
grant insert on table public.invitacion_visitas to anon, authenticated;
grant select, delete on table public.invitacion_visitas to authenticated;

drop policy if exists invitacion_visitas_public_insert on public.invitacion_visitas;
create policy invitacion_visitas_public_insert
on public.invitacion_visitas
for insert
to anon, authenticated
with check (true);

drop policy if exists invitacion_visitas_admin_select on public.invitacion_visitas;
create policy invitacion_visitas_admin_select
on public.invitacion_visitas
for select
to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
);

drop policy if exists invitacion_visitas_admin_delete on public.invitacion_visitas;
create policy invitacion_visitas_admin_delete
on public.invitacion_visitas
for delete
to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com'
);
