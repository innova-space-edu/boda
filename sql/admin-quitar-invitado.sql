CREATE OR REPLACE FUNCTION public.admin_quitar_invitado(p_scope text, p_target uuid, p_nombre text DEFAULT NULL::text, p_invitacion_id uuid DEFAULT NULL::uuid, p_version timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
 v_inv public.invitaciones_personalizadas%ROWTYPE;
 v_guest public.invitados%ROWTYPE;
 v_list public.lista_novios%ROWTYPE;
 v_name text;
 v_remaining text[];
 v_total integer;
 v_complete boolean;
 v_entire boolean:=false;
 v_list_count integer;
 v_guest_count integer;
BEGIN
 IF auth.uid() IS NULL OR lower(coalesce(auth.jwt()->>'email','')) <> 'sthefanomc@gmail.com' THEN
  RAISE EXCEPTION 'No autorizado' USING ERRCODE='42501';
 END IF;
 IF p_scope IS NULL OR p_scope NOT IN ('list','guest','invite_member','invite_family') OR p_target IS NULL THEN RAISE EXCEPTION 'Solicitud inválida'; END IF;
 IF p_invitacion_id IS NOT NULL THEN
  SELECT * INTO v_inv FROM public.invitaciones_personalizadas WHERE id=p_invitacion_id FOR UPDATE;
  IF NOT FOUND OR v_inv.updated_at IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'La invitación cambió. Actualiza los datos.'; END IF;
 END IF;
 IF p_scope='list' THEN
  SELECT * INTO v_list FROM public.lista_novios WHERE id=p_target AND invitacion_id IS NOT DISTINCT FROM p_invitacion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El registro cambió o ya no existe'; END IF;
  v_name:=v_list.nombre;
 ELSIF p_scope='guest' THEN
  SELECT * INTO v_guest FROM public.invitados WHERE id=p_target AND invitacion_id IS NOT DISTINCT FROM p_invitacion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'La confirmación cambió o ya no existe'; END IF;
  v_name:=v_guest.nombre;
 ELSE
  IF v_inv.id IS NULL OR p_target<>v_inv.id THEN RAISE EXCEPTION 'Invitación inválida'; END IF;
  v_name:=p_nombre;
  IF p_scope='invite_family' THEN
   IF v_inv.tipo<>'familia_libre' THEN RAISE EXCEPTION 'Invitación familiar inválida'; END IF;
   v_name:=v_inv.familia; v_entire:=true;
  ELSIF v_inv.tipo='familia_libre' OR NOT EXISTS(SELECT 1 FROM unnest(v_inv.invitados) n WHERE lower(btrim(n))=lower(btrim(v_name))) THEN RAISE EXCEPTION 'Persona no pertenece a la invitación'; END IF;
 END IF;
 IF coalesce(btrim(v_name),'')='' THEN RAISE EXCEPTION 'Nombre inválido'; END IF;
 IF v_inv.id IS NULL THEN
  IF p_scope NOT IN ('guest','list') THEN RAISE EXCEPTION 'Registro inválido'; END IF;
  SELECT count(*) INTO v_list_count FROM public.lista_novios WHERE invitacion_id IS NULL AND lower(btrim(nombre))=lower(btrim(v_name));
  SELECT count(*) INTO v_guest_count FROM public.invitados WHERE invitacion_id IS NULL AND lower(btrim(nombre))=lower(btrim(v_name));
  IF p_scope='list' THEN
   DELETE FROM public.lista_novios WHERE id=v_list.id;
   IF v_list_count=1 AND v_guest_count=1 THEN DELETE FROM public.invitados WHERE invitacion_id IS NULL AND lower(btrim(nombre))=lower(btrim(v_name)); END IF;
  ELSE
   DELETE FROM public.invitados WHERE id=v_guest.id;
   IF v_list_count=1 AND v_guest_count=1 THEN DELETE FROM public.lista_novios WHERE invitacion_id IS NULL AND lower(btrim(nombre))=lower(btrim(v_name)); END IF;
  END IF;
  RETURN;
 END IF;
 -- Exact duplicate cleanup: retain the surviving linked identity.
 IF p_scope='list' AND EXISTS(SELECT 1 FROM public.lista_novios l WHERE l.invitacion_id=v_inv.id AND l.id<>v_list.id AND lower(btrim(l.nombre))=lower(btrim(v_name))) THEN
  DELETE FROM public.lista_novios WHERE id=v_list.id;
  RETURN;
 END IF;
 IF p_scope='guest' AND EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id=v_inv.id AND g.id<>v_guest.id AND lower(btrim(g.nombre))=lower(btrim(v_name))) THEN
  DELETE FROM public.invitados WHERE id=v_guest.id;
  UPDATE public.invitaciones_personalizadas SET updated_at=clock_timestamp() WHERE id=v_inv.id;
  RETURN;
 END IF;
 IF v_inv.tipo='familia_libre' AND lower(btrim(v_name))=lower(btrim(v_inv.familia)) THEN v_entire:=true; END IF;
 IF v_inv.tipo='individual_acompanante' AND lower(btrim(v_name))=lower(btrim(v_inv.invitados[1])) THEN v_entire:=true; END IF;
 IF v_inv.tipo='lista_cerrada' THEN
  SELECT coalesce(array_agg(n ORDER BY ord),ARRAY[]::text[]) INTO v_remaining FROM unnest(v_inv.invitados) WITH ORDINALITY AS x(n,ord) WHERE lower(btrim(n))<>lower(btrim(v_name));
  IF cardinality(v_remaining)=0 THEN v_entire:=true; END IF;
 END IF;
 IF v_entire THEN
  DELETE FROM public.invitados WHERE invitacion_id=v_inv.id;
  DELETE FROM public.lista_novios WHERE invitacion_id=v_inv.id;
  DELETE FROM public.invitaciones_personalizadas WHERE id=v_inv.id;
  RETURN;
 END IF;
 DELETE FROM public.invitados WHERE invitacion_id=v_inv.id AND lower(btrim(nombre))=lower(btrim(v_name));
 DELETE FROM public.lista_novios WHERE invitacion_id=v_inv.id AND lower(btrim(nombre))=lower(btrim(v_name));
 SELECT count(*) INTO v_total FROM public.invitados WHERE invitacion_id=v_inv.id;
 IF v_inv.tipo='lista_cerrada' THEN
  v_complete:=NOT EXISTS(SELECT 1 FROM unnest(v_remaining) n WHERE NOT EXISTS(SELECT 1 FROM public.invitados g WHERE g.invitacion_id=v_inv.id AND lower(btrim(g.nombre))=lower(btrim(n))));
  UPDATE public.invitados SET confirmante=array_to_string(v_remaining,' y ') WHERE invitacion_id=v_inv.id;
  UPDATE public.invitaciones_personalizadas SET invitados=v_remaining,
   titulo_portada=CASE WHEN strpos(lower(coalesce(titulo_portada,'')),lower(btrim(v_name)))>0 THEN array_to_string(v_remaining,' y ') ELSE titulo_portada END,
   respondida_at=CASE WHEN v_complete THEN coalesce(v_inv.respondida_at,clock_timestamp()) ELSE NULL END,updated_at=clock_timestamp() WHERE id=v_inv.id;
 ELSE
  UPDATE public.invitaciones_personalizadas SET respondida_at=CASE WHEN v_total>0 THEN coalesce(v_inv.respondida_at,clock_timestamp()) ELSE NULL END,updated_at=clock_timestamp() WHERE id=v_inv.id;
  IF v_inv.tipo='familia_libre' THEN
   UPDATE public.lista_novios SET asistencia_estado=CASE WHEN EXISTS(SELECT 1 FROM public.invitados WHERE invitacion_id=v_inv.id AND asistencia='Sí asistiré') THEN 'si' WHEN v_total>0 THEN 'no' ELSE 'por_confirmar' END,updated_at=clock_timestamp() WHERE invitacion_id=v_inv.id;
  END IF;
 END IF;
END; $function$
;
REVOKE ALL ON FUNCTION public.admin_quitar_invitado(text,uuid,text,uuid,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_quitar_invitado(text,uuid,text,uuid,timestamptz) TO authenticated;
