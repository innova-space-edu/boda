CREATE OR REPLACE FUNCTION public.admin_eliminar_confirmacion(p_scope text, p_target text, p_invitacion_id uuid DEFAULT NULL::uuid, p_version timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
 v_inv public.invitaciones_personalizadas%ROWTYPE;
 v_guest public.invitados%ROWTYPE;
 v_manual public.lista_novios%ROWTYPE;
 v_names text[] := ARRAY[]::text[];
 v_removed integer:=0;
 v_total integer:=0;
 v_complete boolean:=false;
 v_clear_all boolean:=false;
BEGIN
 IF auth.uid() IS NULL OR lower(coalesce(auth.jwt()->>'email','')) <> 'sthefanomc@gmail.com' THEN
  RAISE EXCEPTION 'No autorizado' USING ERRCODE='42501';
 END IF;
 IF p_scope IS NULL OR p_scope NOT IN ('invite','guest','manual','group') OR coalesce(btrim(p_target),'')='' THEN RAISE EXCEPTION 'Solicitud inválida'; END IF;
 IF p_invitacion_id IS NOT NULL THEN
  SELECT * INTO v_inv FROM public.invitaciones_personalizadas WHERE id=p_invitacion_id FOR UPDATE;
  IF NOT FOUND OR v_inv.updated_at IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'La invitación cambió. Actualiza y vuelve a intentarlo.'; END IF;
  IF p_scope='invite' THEN
   IF p_target<>v_inv.id::text THEN RAISE EXCEPTION 'Invitación inválida'; END IF;
   v_clear_all:=true;
  ELSIF p_scope='guest' THEN
   SELECT * INTO v_guest FROM public.invitados WHERE id=p_target::uuid AND invitacion_id=v_inv.id FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'La confirmación ya no existe'; END IF;
   v_names:=ARRAY[v_guest.nombre];
  ELSIF p_scope='manual' THEN
   SELECT * INTO v_manual FROM public.lista_novios WHERE id=p_target::uuid AND invitacion_id=v_inv.id FOR UPDATE;
   IF NOT FOUND OR v_manual.asistencia_estado='por_confirmar' THEN RAISE EXCEPTION 'La confirmación ya no existe'; END IF;
   v_names:=ARRAY[v_manual.nombre];
  ELSE RAISE EXCEPTION 'Grupo inválido'; END IF;
  IF v_inv.tipo='individual_acompanante' AND EXISTS(SELECT 1 FROM unnest(v_names) n WHERE lower(btrim(n))=lower(btrim(v_inv.invitados[1]))) THEN v_clear_all:=true; END IF;
  IF v_clear_all THEN
   DELETE FROM public.invitados WHERE invitacion_id=v_inv.id;
   GET DIAGNOSTICS v_removed=ROW_COUNT;
   UPDATE public.lista_novios SET asistencia_estado='por_confirmar',updated_at=clock_timestamp() WHERE invitacion_id=v_inv.id;
  ELSE
   IF p_scope='guest' THEN
    DELETE FROM public.invitados WHERE id=v_guest.id AND invitacion_id=v_inv.id;
    GET DIAGNOSTICS v_removed=ROW_COUNT;
   END IF;
   UPDATE public.lista_novios l SET asistencia_estado='por_confirmar',updated_at=clock_timestamp()
    WHERE l.invitacion_id=v_inv.id AND (l.id=v_manual.id OR EXISTS(SELECT 1 FROM unnest(v_names) n WHERE lower(btrim(n))=lower(btrim(l.nombre))));
   IF v_inv.tipo='familia_libre' THEN
    UPDATE public.lista_novios l SET asistencia_estado=CASE
      WHEN EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id=v_inv.id AND g.asistencia='Sí asistiré') THEN 'si'
      WHEN EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id=v_inv.id AND g.asistencia='No podré asistir') THEN 'no'
      ELSE 'por_confirmar' END,updated_at=clock_timestamp() WHERE l.invitacion_id=v_inv.id;
   END IF;
  END IF;
  SELECT count(*) INTO v_total FROM public.invitados WHERE invitacion_id=v_inv.id;
  v_complete:=CASE WHEN v_inv.tipo='lista_cerrada' THEN NOT EXISTS(SELECT 1 FROM unnest(v_inv.invitados) n WHERE NOT EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id=v_inv.id AND g.nombre=n)) ELSE v_total>0 END;
  UPDATE public.invitaciones_personalizadas SET respondida_at=CASE WHEN v_complete THEN coalesce(v_inv.respondida_at,clock_timestamp()) ELSE NULL END, updated_at=clock_timestamp() WHERE id=v_inv.id;
 ELSE
  IF p_scope='manual' THEN
   UPDATE public.lista_novios SET asistencia_estado='por_confirmar',updated_at=clock_timestamp() WHERE id=p_target::uuid AND invitacion_id IS NULL AND asistencia_estado<>'por_confirmar';
   GET DIAGNOSTICS v_removed=ROW_COUNT;
   IF v_removed=0 THEN RAISE EXCEPTION 'La confirmación cambió o ya no existe'; END IF;
  ELSIF p_scope IN ('guest','group') THEN
   IF p_scope='guest' THEN
    DELETE FROM public.invitados WHERE id=p_target::uuid AND invitacion_id IS NULL RETURNING nombre INTO v_guest.nombre;
    IF NOT FOUND THEN RAISE EXCEPTION 'La confirmación cambió o ya no existe'; END IF;
    v_names:=ARRAY[v_guest.nombre]; v_removed:=1;
   ELSE
    WITH removed AS (DELETE FROM public.invitados WHERE grupo_id=p_target AND invitacion_id IS NULL RETURNING nombre) SELECT count(*),coalesce(array_agg(nombre),ARRAY[]::text[]) INTO v_removed,v_names FROM removed;
    IF v_removed=0 THEN RAISE EXCEPTION 'La confirmación cambió o ya no existe'; END IF;
   END IF;
   UPDATE public.lista_novios l SET asistencia_estado='por_confirmar',updated_at=clock_timestamp()
    WHERE l.invitacion_id IS NULL AND EXISTS(SELECT 1 FROM unnest(v_names) n WHERE lower(btrim(n))=lower(btrim(l.nombre)))
    AND NOT EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id IS NULL AND lower(btrim(g.nombre))=lower(btrim(l.nombre)))
    AND (SELECT count(*) FROM public.lista_novios x WHERE x.invitacion_id IS NULL AND lower(btrim(x.nombre))=lower(btrim(l.nombre)))=1;
  ELSE RAISE EXCEPTION 'Invitación inválida'; END IF;
 END IF;
 RETURN v_removed;
END; $function$
;
REVOKE ALL ON FUNCTION public.admin_eliminar_confirmacion(text,text,uuid,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_eliminar_confirmacion(text,text,uuid,timestamptz) TO authenticated;
