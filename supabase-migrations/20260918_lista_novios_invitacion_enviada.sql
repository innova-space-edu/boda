-- Track whether each bride/groom guest has already received the invitation.
alter table public.lista_novios
  add column if not exists invitacion_enviada boolean not null default false;

create index if not exists lista_novios_invitacion_enviada_idx
  on public.lista_novios (lado, invitacion_enviada);
