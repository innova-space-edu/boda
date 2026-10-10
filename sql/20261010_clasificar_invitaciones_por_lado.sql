-- Clasificación persistente de invitaciones del novio y de la novia.
-- Las invitaciones sin relación previa quedan pendientes de asignación manual.
ALTER TABLE public.invitaciones_personalizadas
  ADD COLUMN IF NOT EXISTS lado text;

ALTER TABLE public.invitaciones_personalizadas
  ADD CONSTRAINT invitaciones_personalizadas_lado_valido
  CHECK (lado IS NULL OR lado IN ('novio', 'novia'));

CREATE INDEX IF NOT EXISTS invitaciones_personalizadas_lado_idx
  ON public.invitaciones_personalizadas (lado);

WITH vinculadas AS (
  SELECT invitacion_id, MIN(lado) AS lado
  FROM public.lista_novios
  WHERE invitacion_id IS NOT NULL
  GROUP BY invitacion_id
  HAVING COUNT(DISTINCT lado) = 1
)
UPDATE public.invitaciones_personalizadas AS invitacion
SET lado = vinculadas.lado
FROM vinculadas
WHERE invitacion.id = vinculadas.invitacion_id
  AND invitacion.lado IS NULL;
