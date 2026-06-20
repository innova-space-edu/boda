-- ============================================================
-- BODA CAROLINA & ESTHEFANO — Supabase Migration
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Cambia este correo si el administrador principal será otro.
CREATE OR REPLACE FUNCTION public.is_wedding_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') = 'sthefanomc@gmail.com';
$$;

-- 1. Configuración editable de la boda
CREATE TABLE IF NOT EXISTS public.wedding_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  bride_name TEXT NOT NULL DEFAULT 'Carolina Elizabeth Vega Carrera',
  groom_name TEXT NOT NULL DEFAULT 'Esthefano Gonzalo Morales Campaña',
  wedding_date DATE NOT NULL DEFAULT '2027-02-06',
  ceremony_time TEXT NOT NULL DEFAULT '18:00',
  venue_name TEXT NOT NULL DEFAULT 'Catedral de Antofagasta',
  venue_address TEXT NOT NULL DEFAULT 'Plaza España s/n',
  city TEXT NOT NULL DEFAULT 'Antofagasta, Chile',
  love_story TEXT DEFAULT 'Nuestra historia comenzó con una mirada, creció con el tiempo y hoy culmina en el día más especial de nuestras vidas. Gracias por ser parte de este momento único.',
  bride_bio TEXT DEFAULT '',
  groom_bio TEXT DEFAULT '',
  bride_image_url TEXT DEFAULT '',
  groom_image_url TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  account_type TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  account_holder TEXT DEFAULT '',
  account_rut TEXT DEFAULT '',
  bank_email TEXT DEFAULT '',
  hero_message TEXT DEFAULT 'Con la bendición de Dios y el amor de nuestras familias, queremos compartir contigo el inicio de nuestra nueva vida juntos.',
  dress_code TEXT DEFAULT 'Formal elegante · tonos blanco, dorado, negro o lila sugeridos',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la tabla ya existía desde una versión anterior, agrega columnas nuevas.
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS bride_image_url TEXT DEFAULT '';
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS groom_image_url TEXT DEFAULT '';
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT '';

INSERT INTO public.wedding_config (id) VALUES ('1') ON CONFLICT (id) DO NOTHING;

-- 2. Respuestas RSVP
CREATE TABLE IF NOT EXISTS public.rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  members JSONB NOT NULL DEFAULT '[]',
  total_attending INT NOT NULL DEFAULT 0,
  dietary_notes TEXT DEFAULT '',
  envelope_message TEXT DEFAULT '',
  will_contribute BOOLEAN DEFAULT FALSE,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Log de accesos
CREATE TABLE IF NOT EXISTS public.access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvp_responses_created_at ON public.rsvp_responses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_log_created_at ON public.access_log (created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wedding_config_public_read ON public.wedding_config;
DROP POLICY IF EXISTS wedding_config_admin_insert ON public.wedding_config;
DROP POLICY IF EXISTS wedding_config_admin_update ON public.wedding_config;
DROP POLICY IF EXISTS wedding_config_admin_delete ON public.wedding_config;
DROP POLICY IF EXISTS wedding_config_admin_write ON public.wedding_config;

CREATE POLICY wedding_config_public_read ON public.wedding_config
  FOR SELECT USING (true);

CREATE POLICY wedding_config_admin_insert ON public.wedding_config
  FOR INSERT WITH CHECK (public.is_wedding_admin());

CREATE POLICY wedding_config_admin_update ON public.wedding_config
  FOR UPDATE USING (public.is_wedding_admin()) WITH CHECK (public.is_wedding_admin());

CREATE POLICY wedding_config_admin_delete ON public.wedding_config
  FOR DELETE USING (public.is_wedding_admin());

DROP POLICY IF EXISTS rsvp_public_insert ON public.rsvp_responses;
DROP POLICY IF EXISTS rsvp_admin_read ON public.rsvp_responses;
DROP POLICY IF EXISTS rsvp_admin_delete ON public.rsvp_responses;

CREATE POLICY rsvp_public_insert ON public.rsvp_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY rsvp_admin_read ON public.rsvp_responses
  FOR SELECT USING (public.is_wedding_admin());

CREATE POLICY rsvp_admin_delete ON public.rsvp_responses
  FOR DELETE USING (public.is_wedding_admin());

DROP POLICY IF EXISTS log_public_insert ON public.access_log;
DROP POLICY IF EXISTS log_admin_read ON public.access_log;
DROP POLICY IF EXISTS log_admin_delete ON public.access_log;

CREATE POLICY log_public_insert ON public.access_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY log_admin_read ON public.access_log
  FOR SELECT USING (public.is_wedding_admin());

CREATE POLICY log_admin_delete ON public.access_log
  FOR DELETE USING (public.is_wedding_admin());

-- ============================================================
-- IMPORTANTE
-- 1) Crea el usuario admin en Supabase > Authentication > Users.
-- 2) Usa el correo definido en is_wedding_admin().
-- 3) No guardes contraseñas en GitHub ni en este archivo SQL.
-- ============================================================
