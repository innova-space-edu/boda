-- Actualiza en una transacción todas las invitaciones del lado indicado
-- que todavía no hayan iniciado su plazo, sin alterar las otras.
-- Valores de p_fecha_limite: timestamptz UTC, visualizado en America/Santiago.
CREATE OR REPLACE FUNCTION public.establecer_fecha_limite_lado(
  p_lado text,
  p_fecha_limite timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $func$
DECLARE
  v_actualizadas integer := 0;
  v_protegidas integer := 0;
  v_ahora timestamptz;
BEGIN
  IF auth.uid() IS NULL
    OR lower(coalesce(auth.jwt()->>'email','')) <> 'sthefanomc@gmail.com'
  THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_lado IS NULL OR p_lado NOT IN ('novio', 'novia') THEN
    RAISE EXCEPTION 'Debe elegir el novio o la novia';
  END IF;

  v_ahora := clock_timestamp();
  IF p_fecha_limite IS NULL OR p_fecha_limite <= v_ahora + interval '1 minute' THEN
    RAISE EXCEPTION 'La fecha límite debe ser futura';
  END IF;

  UPDATE public.invitaciones_personalizadas
    SET plazo_fecha_limite_at = p_fecha_limite,
        updated_at = v_ahora
  WHERE lado = p_lado AND plazo_inicio_at IS NULL;
  GET DIAGNOSTICS v_actualizadas = ROW_COUNT;

  SELECT count(*) INTO v_protegidas
    FROM public.invitaciones_personalizadas
    WHERE lado = p_lado AND plazo_inicio_at IS NOT NULL;

  RETURN jsonb_build_object(
    'actualizadas', v_actualizadas,
    'protegidas', v_protegidas,
    'lado', p_lado,
    'fecha_limite', p_fecha_limite
  );
END;
$func$;

REVOKE ALL ON FUNCTION public.establecer_fecha_limite_lado(text,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.establecer_fecha_limite_lado(text,timestamptz) TO authenticated;
