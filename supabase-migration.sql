-- Ejecutar en Supabase > SQL Editor.
-- Crea configuración editable, confirmaciones y políticas RLS.

create extension if not exists pgcrypto;

create table if not exists public.wedding_settings (
  id text primary key default 'main',
  bride_full_name text not null default 'Carolina Elizabeth Vega Carrera',
  bride_display_name text not null default 'Carolina',
  groom_full_name text not null default 'Esthefano Gonzalo Morales Campaña',
  groom_display_name text not null default 'Esthefano',
  wedding_date date not null default '2027-02-06',
  wedding_time text not null default '18:00',
  ceremony_place text not null default 'Catedral de Antofagasta',
  ceremony_city text not null default 'Antofagasta, Chile',
  ceremony_address text not null default 'Catedral de Antofagasta, Antofagasta, Chile',
  maps_url text not null default 'https://www.google.com/maps/search/?api=1&query=Catedral%20de%20Antofagasta%2C%20Antofagasta%2C%20Chile',
  hero_subtitle text not null default 'Con la bendición de Dios y el amor de nuestras familias',
  invitation_phrase text not null default 'Tenemos el honor de invitarte a celebrar nuestra unión religiosa. Queremos que seas parte de este momento sagrado, alegre y profundamente especial en nuestras vidas.',
  meaning_title text not null default 'Un día con sentido',
  meaning_text text not null default 'Este encuentro no es solo una celebración; es el inicio de una nueva vida juntos, frente a Dios, nuestras familias y las personas que han acompañado nuestra historia.',
  dress_code text not null default 'Formal elegante',
  dress_note text not null default 'Te invitamos a vestir con tonos sobrios y elegantes para acompañar la solemnidad y alegría de este día.',
  gift_title text not null default 'Lluvia de sobres',
  gift_text text not null default 'Tu presencia es nuestro mayor regalo. Si deseas acompañarnos con un detalle, hemos preparado una lluvia de sobres como alternativa a los regalos físicos.',
  bank_name text not null default 'Banco por definir',
  bank_account_type text not null default 'Cuenta por definir',
  bank_account_number text not null default 'Número por definir',
  bank_account_holder text not null default 'Nombre por definir',
  bank_account_rut text not null default 'RUT por definir',
  bank_account_email text not null default 'Correo por definir',
  album_title text not null default 'Álbum de recuerdos',
  album_text text not null default 'Durante la celebración podrás compartir tus fotos y videos para guardar juntos los mejores recuerdos de este día.',
  album_upload_url text not null default 'https://www.instagram.com/',
  whatsapp_one text not null default '56926301822',
  whatsapp_two text not null default '56988215400',
  story_title text not null default 'Nuestra historia',
  story_text text not null default 'Nuestra historia comenzó con pequeños momentos que fueron creciendo hasta convertirse en una promesa de amor, respeto y compañía para toda la vida.',
  closing_title text not null default 'Gracias por ser parte de nuestras vidas',
  closing_text text not null default 'Gracias por acompañarnos con tu cariño, oración y presencia. Será una alegría inmensa compartir contigo este día tan especial.',
  music_url text not null default '/music/wedding-song.mp3',
  hero_image_url text not null default '/photos/wedding-hero.svg',
  meaning_image_url text not null default '/photos/wedding-meaning.svg',
  story_image_1_url text not null default '/photos/story-1.svg',
  story_image_2_url text not null default '/photos/story-2.svg',
  story_image_3_url text not null default '/photos/story-3.svg',
  updated_at timestamptz default now()
);

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  contact_phone text,
  members jsonb not null default '[]'::jsonb,
  total_attending int not null default 0,
  gift_interest boolean not null default false,
  message text,
  created_at timestamptz not null default now()
);

insert into public.wedding_settings (id)
values ('main')
on conflict (id) do nothing;

alter table public.wedding_settings enable row level security;
alter table public.rsvp_responses enable row level security;

drop policy if exists "public can read wedding settings" on public.wedding_settings;
drop policy if exists "admin can update wedding settings" on public.wedding_settings;
drop policy if exists "public can insert rsvp" on public.rsvp_responses;
drop policy if exists "admin can read rsvp" on public.rsvp_responses;
drop policy if exists "admin can delete rsvp" on public.rsvp_responses;

create policy "public can read wedding settings"
on public.wedding_settings
for select
to anon, authenticated
using (true);

create policy "admin can update wedding settings"
on public.wedding_settings
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com')
with check ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create policy "public can insert rsvp"
on public.rsvp_responses
for insert
to anon, authenticated
with check (true);

create policy "admin can read rsvp"
on public.rsvp_responses
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');

create policy "admin can delete rsvp"
on public.rsvp_responses
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'sthefanomc@gmail.com');
