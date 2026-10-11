-- Crea una invitación con una o varias personas elegidas de una lista.
-- Inserción y vínculo son atómicos; nunca mezcla novio/novia ni duplica enlaces.
CREATE OR REPLACE FUNCTION public.crear_invitacion_desde_lista(
  p_lado text, p_ids uuid[], p_titulo text, p_fecha_limite timestamptz
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
DECLARE
  v_id uuid;
  v_names text[];
  v_count integer;
  v_updated integer;
BEGIN
  IF auth.uid() IS NULL OR lower(coalesce(auth.jwt()->>'email','')) <> 'sthefanomc@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_lado IS NULL OR p_lado NOT IN ('novio', 'novia') THEN
    RAISE EXCEPTION 'Lista de novio o novia inválida';
  END IF;
  IF p_ids IS NULL OR cardinality(p_ids) < 1 OR cardinality(p_ids) > 100
     OR (SELECT count(DISTINCT x.id) FROM unnest(p_ids) AS x(id)) <> cardinality(p_ids) THEN
    RAISE EXCEPTION 'Selecciona entre 1 y 100 invitados sin duplicados';
  END IF;
  IF length(trim(coalesce(p_titulo,''))) < 3 THEN
    RAISE EXCEPTION 'Escribe un título de invitación';
  END IF;
  IF p_fecha_limite IS NULL OR p_fecha_limite <= clock_timestamp() + interval '1 minute' THEN
    RAISE EXCEPTION 'Selecciona una fecha límite futura';
  END IF;

  -- Bloquea las filas elegidas para impedir la creación simultánea de dos links.
  PERFORM 1 FROM public.lista_novios
    WHERE id = ANY(p_ids) AND lado = p_lado FOR UPDATE;

  SELECT array_agg(nombre ORDER BY nombre), count(*)
    INTO v_names, v_count
  FROM public.lista_novios
  WHERE id = ANY(p_ids) AND lado = p_lado AND invitacion_id IS NULL;
  IF v_count <> cardinality(p_ids) THEN
    RAISE EXCEPTION 'Hay nombres ya vinculados o de otra lista. Actualiza y vuelve a seleccionar.';
  END IF;

  INSERT INTO public.invitaciones_personalizadas
    (tipo, titulo_portada, invitados, familia, lado, plazo_fecha_limite_at)
  VALUES ('lista_cerrada', trim(p_titulo), v_names, NULL, p_lado, p_fecha_limite)
  RETURNING id INTO v_id;

  UPDATE public.lista_novios SET invitacion_id = v_id, updated_at = clock_timestamp()
  WHERE id = ANY(p_ids) AND lado = p_lado AND invitacion_id IS NULL;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> v_count THEN
    RAISE EXCEPTION 'No se pudieron vincular todas las personas; se revirtió la creación';
  END IF;

  RETURN v_id;
END;
$func$;
REVOKE ALL ON FUNCTION public.crear_invitacion_desde_lista(text,uuid[],text,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_invitacion_desde_lista(text,uuid[],text,timestamptz) TO authenticated;
