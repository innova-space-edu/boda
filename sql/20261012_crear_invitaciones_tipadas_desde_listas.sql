-- Crea cualquier modalidad de invitación desde las listas del novio o la novia.
-- La creación y el vínculo de cada persona elegida ocurren en una única transacción.
CREATE OR REPLACE FUNCTION public.crear_invitacion_desde_lista_tipada(
  p_lado text,
  p_ids uuid[],
  p_tipo text,
  p_titulo text,
  p_fecha_limite timestamptz,
  p_familia text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $func$
DECLARE
  v_invite uuid;
  v_names text[];
  v_count integer;
  v_updated integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL
    OR lower(coalesce((SELECT auth.jwt()) ->> 'email', '')) <> 'sthefanomc@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_lado NOT IN ('novio', 'novia') OR p_lado IS NULL THEN
    RAISE EXCEPTION 'Selecciona una lista válida';
  END IF;
  IF p_tipo NOT IN ('lista_cerrada', 'familia_libre', 'individual_acompanante')
     OR p_tipo IS NULL THEN
    RAISE EXCEPTION 'Tipo de invitación no válido';
  END IF;
  IF p_ids IS NULL OR cardinality(p_ids) NOT BETWEEN 1 AND 100
    OR (SELECT count(DISTINCT t.id) FROM unnest(p_ids) AS t(id)) <> cardinality(p_ids) THEN
    RAISE EXCEPTION 'Selecciona de 1 a 100 personas sin repetir';
  END IF;
  IF p_tipo = 'individual_acompanante' AND cardinality(p_ids) <> 1 THEN
    RAISE EXCEPTION 'La invitación con acompañante permite una sola persona principal';
  END IF;
  IF length(btrim(coalesce(p_titulo, ''))) < 3 THEN
    RAISE EXCEPTION 'Escribe el texto de portada';
  END IF;
  IF p_tipo = 'familia_libre' AND length(btrim(coalesce(p_familia, ''))) < 2 THEN
    RAISE EXCEPTION 'Indica el nombre de la familia o grupo';
  END IF;
  IF p_fecha_limite IS NULL OR p_fecha_limite <= clock_timestamp() + interval '1 minute' THEN
    RAISE EXCEPTION 'La fecha límite debe ser futura';
  END IF;

  -- No permite mezclar listas ni reutilizar un registro vinculado. FOR UPDATE
  -- serializa creaciones simultáneas que usen los mismos invitados.
  PERFORM 1 FROM public.lista_novios
  WHERE id = ANY(p_ids) AND lado = p_lado
  FOR UPDATE;

  SELECT array_agg(l.nombre ORDER BY l.nombre), count(*)
    INTO v_names, v_count
  FROM public.lista_novios AS l
  WHERE l.id = ANY(p_ids)
    AND l.lado = p_lado
    AND l.invitacion_id IS NULL;

  IF v_count <> cardinality(p_ids) THEN
    RAISE EXCEPTION 'Hay nombres vinculados, borrados o de otra lista. Actualiza la lista.';
  END IF;

  INSERT INTO public.invitaciones_personalizadas (
    tipo, titulo_portada, invitados, familia, lado, plazo_fecha_limite_at
  )
  VALUES (
    p_tipo,
    btrim(p_titulo),
    CASE WHEN p_tipo = 'familia_libre' THEN ARRAY[]::text[] ELSE v_names END,
    CASE WHEN p_tipo = 'familia_libre' THEN btrim(p_familia) ELSE NULL END,
    p_lado,
    p_fecha_limite
  ) RETURNING id INTO v_invite;

  UPDATE public.lista_novios
    SET invitacion_id = v_invite, updated_at = clock_timestamp()
  WHERE id = ANY(p_ids)
    AND lado = p_lado
    AND invitacion_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> v_count THEN
    RAISE EXCEPTION 'No fue posible asociar todas las personas a su enlace';
  END IF;

  RETURN v_invite;
END;
$func$;

REVOKE ALL ON FUNCTION public.crear_invitacion_desde_lista_tipada(
  text, uuid[], text, text, timestamptz, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_invitacion_desde_lista_tipada(
  text, uuid[], text, text, timestamptz, text
) TO authenticated;
