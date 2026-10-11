-- Número WhatsApp del invitado en lista del novio o de la novia.
-- Datos restringidos a administrador por políticas RLS existentes de lista_novios.
ALTER TABLE public.lista_novios
  ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.lista_novios
  ADD CONSTRAINT lista_novios_whatsapp_e164
  CHECK (whatsapp IS NULL OR whatsapp ~ '^[1-9][0-9]{7,14}$');
COMMENT ON COLUMN public.lista_novios.whatsapp IS
  'Número WhatsApp del invitado, en dígitos internacionales sin + (Chile: 569XXXXXXXX).';