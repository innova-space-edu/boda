-- Vincula cada registro de la lista de novios con una invitación personalizada.
alter table public.lista_novios
  add column if not exists invitacion_id uuid
    references public.invitaciones_personalizadas(id) on delete set null;

create index if not exists lista_novios_invitacion_id_idx
  on public.lista_novios (invitacion_id);
