-- Supabase schema for Carolina & Esthefano wedding invitation
-- Public visitors may insert ordinary confirmations/visits.
-- Personalized links are bound to a fixed list of invited people.
-- Only the authenticated administrator can inspect or manage invitation records directly.

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

create index if not exists invitados_created_at_idx on public.invitados (created_at desc);
create index if not exists invitados_grupo_id_idx on public.invitados (grupo_id);

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
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

drop policy if exists invitados_admin_update on public.invitados;
create policy invitados_admin_update
on public.invitados
for update
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

drop policy if exists invitados_admin_delete on public.invitados;
create policy invitados_admin_delete
on public.invitados
for delete
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

create table if not exists public.invitacion_visitas (
  id uuid primary key default gen_random_uuid(),
  pagina text not null default 'invitacion',
  created_at timestamptz not null default now()
);

create index if not exists invitacion_visitas_created_at_idx on public.invitacion_visitas (created_at desc);

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
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

drop policy if exists invitacion_visitas_admin_delete on public.invitacion_visitas;
create policy invitacion_visitas_admin_delete
on public.invitacion_visitas
for delete
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

-- Personalized invitation links.
create table if not exists public.invitaciones_personalizadas (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  invitados text[] not null check (cardinality(invitados) >= 1),
  activa boolean not null default true,
  aperturas integer not null default 0 check (aperturas >= 0),
  ultima_apertura_at timestamptz,
  respondida_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitaciones_personalizadas enable row level security;
revoke all on table public.invitaciones_personalizadas from anon, authenticated;
grant select, insert, update, delete on table public.invitaciones_personalizadas to authenticated;

drop policy if exists invitaciones_personalizadas_admin_all on public.invitaciones_personalizadas;
create policy invitaciones_personalizadas_admin_all
on public.invitaciones_personalizadas
for all
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'sthefanomc@gmail.com');

alter table public.invitados
  add column if not exists invitacion_id uuid references public.invitaciones_personalizadas(id) on delete set null;

create index if not exists invitados_invitacion_id_idx on public.invitados (invitacion_id);

-- Public token lookup. The UUID token is the capability; only the matching active invitation is returned.
create or replace function public.obtener_invitacion_personalizada(p_token uuid)
returns table (invitacion_id uuid, invitados text[])
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.invitados
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
  limit 1;
$$;

revoke execute on function public.obtener_invitacion_personalizada(uuid) from public;
grant execute on function public.obtener_invitacion_personalizada(uuid) to anon, authenticated;

create or replace function public.registrar_apertura_invitacion(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.invitaciones_personalizadas
  set aperturas = aperturas + 1,
      ultima_apertura_at = now(),
      updated_at = now()
  where token = p_token
    and activa = true;
  return found;
end;
$$;

revoke execute on function public.registrar_apertura_invitacion(uuid) from public;
grant execute on function public.registrar_apertura_invitacion(uuid) to anon, authenticated;

-- RSVP for personalized links. Official names come from the database, not from browser input.
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
  select i.id, i.invitados
    into v_id, v_invitados
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
  for update;

  if v_id is null then
    raise exception 'Invitación no válida o inactiva';
  end if;

  if p_asistentes is null then
    p_asistentes := '{}'::text[];
  end if;

  if exists (
    select 1
    from unnest(p_asistentes) a(nombre)
    where not (a.nombre = any(v_invitados))
  ) then
    raise exception 'La respuesta contiene una persona que no pertenece a esta invitación';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  foreach v_nombre in array v_invitados loop
    v_asiste := v_nombre = any(p_asistentes);
    v_contacto := coalesce(p_contactos ->> v_nombre, '');

    insert into public.invitados (
      nombre,
      asistencia,
      cantidad,
      confirmante,
      telefono,
      contacto_integrante,
      mensaje,
      grupo_id,
      invitacion_id
    ) values (
      v_nombre,
      case when v_asiste then 'Sí asistiré' else 'No podré asistir' end,
      1,
      array_to_string(v_invitados, ' y '),
      v_contacto,
      v_contacto,
      coalesce(p_mensaje, ''),
      v_id::text,
      v_id
    );

    if v_asiste then
      v_total := v_total + 1;
    end if;
  end loop;

  update public.invitaciones_personalizadas
  set respondida_at = now(),
      updated_at = now()
  where id = v_id;

  return v_total;
end;
$$;

revoke execute on function public.confirmar_invitacion_personalizada(uuid,text[],jsonb,text) from public;
grant execute on function public.confirmar_invitacion_personalizada(uuid,text[],jsonb,text) to anon, authenticated;
