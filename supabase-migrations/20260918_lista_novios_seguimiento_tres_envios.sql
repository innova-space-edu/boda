-- Seguimiento de confirmación y tres etapas de envío por invitado.
alter table public.lista_novios
  add column if not exists asistencia_estado text not null default 'por_confirmar',
  add column if not exists proximo_envio date,
  add column if not exists envio_1_enviado boolean not null default false,
  add column if not exists envio_2_enviado boolean not null default false,
  add column if not exists envio_3_enviado boolean not null default false,
  add column if not exists fecha_envio_1 date,
  add column if not exists fecha_envio_2 date,
  add column if not exists fecha_envio_3 date;

alter table public.lista_novios
  drop constraint if exists lista_novios_asistencia_estado_check;

alter table public.lista_novios
  add constraint lista_novios_asistencia_estado_check
  check (asistencia_estado in ('por_confirmar', 'si', 'no'));

update public.lista_novios
set envio_1_enviado = invitacion_enviada
where invitacion_enviada = true and envio_1_enviado = false;

create index if not exists lista_novios_asistencia_estado_idx
  on public.lista_novios (lado, asistencia_estado);

create index if not exists lista_novios_proximo_envio_idx
  on public.lista_novios (lado, proximo_envio);

create index if not exists lista_novios_envios_idx
  on public.lista_novios (lado, envio_1_enviado, envio_2_enviado, envio_3_enviado);
