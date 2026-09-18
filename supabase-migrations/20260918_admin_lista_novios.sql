-- Internal admin-only lists for bride and groom.
create table if not exists public.lista_novios (
  id uuid primary key default gen_random_uuid(),
  lado text not null check (lado in ('novio', 'novia')),
  nombre text not null check (length(trim(nombre)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lista_novios enable row level security;

drop policy if exists "lista_novios_admin_select" on public.lista_novios;
create policy "lista_novios_admin_select" on public.lista_novios for select to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

drop policy if exists "lista_novios_admin_insert" on public.lista_novios;
create policy "lista_novios_admin_insert" on public.lista_novios for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

drop policy if exists "lista_novios_admin_update" on public.lista_novios;
create policy "lista_novios_admin_update" on public.lista_novios for update to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com')
with check ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

drop policy if exists "lista_novios_admin_delete" on public.lista_novios;
create policy "lista_novios_admin_delete" on public.lista_novios for delete to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create index if not exists lista_novios_lado_created_idx on public.lista_novios (lado, created_at);
