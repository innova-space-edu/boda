-- Ejecutar en Supabase SQL Editor
-- Proyecto: Invitación digital Carolina & Esthefano

create extension if not exists "pgcrypto";

create table if not exists public.wedding_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  main_guest text not null,
  attending boolean not null default true,
  companions jsonb not null default '[]'::jsonb,
  total_attending integer not null default 0,
  message text,
  created_at timestamptz not null default now()
);

alter table public.wedding_settings enable row level security;
alter table public.rsvp_responses enable row level security;

-- Limpia políticas anteriores si vuelves a ejecutar
DROP POLICY IF EXISTS "settings public select" ON public.wedding_settings;
DROP POLICY IF EXISTS "settings admin update" ON public.wedding_settings;
DROP POLICY IF EXISTS "settings admin insert" ON public.wedding_settings;
DROP POLICY IF EXISTS "rsvp public insert" ON public.rsvp_responses;
DROP POLICY IF EXISTS "rsvp admin select" ON public.rsvp_responses;
DROP POLICY IF EXISTS "rsvp admin delete" ON public.rsvp_responses;

create policy "settings public select"
on public.wedding_settings for select
to anon, authenticated
using (true);

create policy "settings admin update"
on public.wedding_settings for update
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com')
with check ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create policy "settings admin insert"
on public.wedding_settings for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create policy "rsvp public insert"
on public.rsvp_responses for insert
to anon, authenticated
with check (true);

create policy "rsvp admin select"
on public.rsvp_responses for select
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create policy "rsvp admin delete"
on public.rsvp_responses for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

insert into public.wedding_settings (id, data)
values (
  'main',
  '{
    "brideFullName":"Carolina Elizabeth Vega Carrera",
    "groomFullName":"Esthefano Gonzalo Morales Campaña",
    "brideShortName":"Carolina",
    "groomShortName":"Esthefano",
    "dateISO":"2027-02-06T18:00:00-03:00",
    "dateText":"Sábado 6 de febrero de 2027",
    "timeText":"18:00 hrs",
    "venue":"Catedral de Antofagasta",
    "city":"Antofagasta, Chile",
    "mapsUrl":"https://www.google.com/maps/search/?api=1&query=Catedral%20de%20Antofagasta%20Antofagasta%20Chile",
    "whatsappOne":"56926301822",
    "whatsappTwo":"56988215400",
    "photoUploadUrl":"https://www.instagram.com/",
    "dressCode":"Formal elegante",
    "bankName":"Por definir",
    "bankAccountType":"Por definir",
    "bankAccountNumber":"Por definir",
    "bankHolder":"Por definir",
    "bankRut":"Por definir",
    "bankEmail":"Por definir",
    "storyText":"Nuestra historia comenzó con una mirada, creció con el tiempo y hoy llega a un día que queremos vivir junto a las personas que más amamos."
  }'::jsonb
)
on conflict (id) do nothing;
