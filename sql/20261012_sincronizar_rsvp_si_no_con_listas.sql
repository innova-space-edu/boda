-- Sincroniza el resultado de la respuesta con las listas de los novios.
-- No sobrescribe estados de personas ajenas al enlace.
-- Familia libre: todos los vinculados comparten el estado de la familia.
-- Lista cerrada/persona + acompañante: se utiliza la coincidencia exacta de nombre.
CREATE OR REPLACE FUNCTION public.sincronizar_lista_novios_desde_confirmacion(p_invitacion_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
DECLARE v_tipo text;
BEGIN
  SELECT i.tipo INTO v_tipo
  FROM public.invitaciones_personalizadas i WHERE i.id = p_invitacion_id;
  IF v_tipo IS NULL THEN RETURN; END IF;

  IF v_tipo = 'familia_libre' THEN
    UPDATE public.lista_novios l
       SET asistencia_estado = CASE
             WHEN EXISTS (
               SELECT 1 FROM public.invitados g
               WHERE g.invitacion_id = p_invitacion_id AND g.asistencia = 'Sí asistiré'
             ) THEN 'si' ELSE 'no' END,
           updated_at = clock_timestamp()
     WHERE l.invitacion_id = p_invitacion_id;
  ELSE
    UPDATE public.lista_novios l
       SET asistencia_estado = CASE
             WHEN EXISTS (
               SELECT 1 FROM public.invitados g
               WHERE g.invitacion_id = p_invitacion_id
                 AND lower(btrim(g.nombre)) = lower(btrim(l.nombre))
                 AND g.asistencia = 'Sí asistiré'
             ) THEN 'si' ELSE 'no' END,
           updated_at = clock_timestamp()
     WHERE l.invitacion_id = p_invitacion_id
       AND EXISTS (
         SELECT 1 FROM public.invitados g
         WHERE g.invitacion_id = p_invitacion_id
           AND lower(btrim(g.nombre)) = lower(btrim(l.nombre))
       );
  END IF;
END;
$function$;

-- Esta función es auxiliar interna: solo las RPC de confirmación la invocan.
REVOKE ALL ON FUNCTION public.sincronizar_lista_novios_desde_confirmacion(uuid)
  FROM PUBLIC, anon, authenticated;

-- confirmar_invitacion_familia_libre
CREATE OR REPLACE FUNCTION public.confirmar_invitacion_familia_libre(p_token uuid, p_nombres text[], p_contactos jsonb DEFAULT '{}'::jsonb, p_mensaje text DEFAULT ''::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid;
  v_familia text;
  v_nombre text;
  v_contacto text;
  v_total integer := 0;
begin
  select i.id, i.familia
    into v_id, v_familia
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
    and i.tipo = 'familia_libre'
    and (coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) is null
         or coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) > clock_timestamp())
  for update;

  if v_id is null then
    raise exception 'Invitación familiar no válida o inactiva';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  if p_nombres is null or cardinality(p_nombres) = 0 then
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_familia, 'No podré asistir', 1, v_familia, '', '',
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
  else
    foreach v_nombre in array p_nombres loop
      v_nombre := trim(v_nombre);
      if v_nombre is null or v_nombre = '' then
        continue;
      end if;

      v_contacto := coalesce(p_contactos ->> v_nombre, '');

      insert into public.invitados (
        nombre, asistencia, cantidad, confirmante, telefono,
        contacto_integrante, mensaje, grupo_id, invitacion_id
      ) values (
        v_nombre, 'Sí asistiré', 1, v_familia, v_contacto,
        v_contacto, coalesce(p_mensaje, ''), v_id::text, v_id
      );
      v_total := v_total + 1;
    end loop;

    if v_total = 0 then
      raise exception 'Debe registrar al menos una persona válida';
    end if;
  end if;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;

  -- La sincronización comparte la transacción de guardado de la respuesta.
  PERFORM public.sincronizar_lista_novios_desde_confirmacion(v_id);
  return v_total;
end;
$function$;

-- confirmar_invitacion_individual_acompanante
CREATE OR REPLACE FUNCTION public.confirmar_invitacion_individual_acompanante(p_token uuid, p_principal_asiste boolean, p_contacto_principal text DEFAULT ''::text, p_acompanante_nombre text DEFAULT ''::text, p_acompanante_contacto text DEFAULT ''::text, p_mensaje text DEFAULT ''::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid;
  v_principal text;
  v_acompanante text;
  v_total integer := 0;
begin
  select i.id, i.invitados[1]
    into v_id, v_principal
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
    and i.tipo = 'individual_acompanante'
    and (coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) is null
         or coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) > clock_timestamp())
  for update;

  if v_id is null or v_principal is null or trim(v_principal) = '' then
    raise exception 'Invitación individual no válida o inactiva';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  if not coalesce(p_principal_asiste, false) then
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_principal, 'No podré asistir', 1, v_principal,
      coalesce(p_contacto_principal, ''), coalesce(p_contacto_principal, ''),
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
  else
    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_principal, 'Sí asistiré', 1, v_principal,
      coalesce(p_contacto_principal, ''), coalesce(p_contacto_principal, ''),
      coalesce(p_mensaje, ''), v_id::text, v_id
    );
    v_total := 1;

    v_acompanante := trim(coalesce(p_acompanante_nombre, ''));
    if v_acompanante <> '' then
      if lower(v_acompanante) = lower(trim(v_principal)) then
        raise exception 'El acompañante debe ser una persona distinta';
      end if;

      insert into public.invitados (
        nombre, asistencia, cantidad, confirmante, telefono,
        contacto_integrante, mensaje, grupo_id, invitacion_id
      ) values (
        v_acompanante, 'Sí asistiré', 1, v_principal,
        coalesce(p_acompanante_contacto, ''), coalesce(p_acompanante_contacto, ''),
        coalesce(p_mensaje, ''), v_id::text, v_id
      );
      v_total := 2;
    end if;
  end if;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;

  -- La sincronización comparte la transacción de guardado de la respuesta.
  PERFORM public.sincronizar_lista_novios_desde_confirmacion(v_id);
  return v_total;
end;
$function$;

-- confirmar_invitacion_personalizada
CREATE OR REPLACE FUNCTION public.confirmar_invitacion_personalizada(p_token uuid, p_asistentes text[], p_contactos jsonb DEFAULT '{}'::jsonb, p_mensaje text DEFAULT ''::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid;
  v_invitados text[];
  v_nombre text;
  v_asiste boolean;
  v_contacto text;
  v_total integer := 0;
begin
  select i.id, i.invitados
    into v_id, v_invitados
  from public.invitaciones_personalizadas i
  where i.token = p_token
    and i.activa = true
    and i.tipo = 'lista_cerrada'
    and (coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) is null
         or coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at) > clock_timestamp())
  for update;

  if v_id is null then
    raise exception 'Invitación no válida o inactiva';
  end if;

  if p_asistentes is null then
    p_asistentes := '{}'::text[];
  end if;

  if exists (
    select 1
    from unnest(p_asistentes) a(nombre)
    where not (a.nombre = any(v_invitados))
  ) then
    raise exception 'La respuesta contiene una persona que no pertenece a esta invitación';
  end if;

  delete from public.invitados where invitacion_id = v_id;

  foreach v_nombre in array v_invitados loop
    v_asiste := v_nombre = any(p_asistentes);
    v_contacto := coalesce(p_contactos ->> v_nombre, '');

    insert into public.invitados (
      nombre, asistencia, cantidad, confirmante, telefono,
      contacto_integrante, mensaje, grupo_id, invitacion_id
    ) values (
      v_nombre,
      case when v_asiste then 'Sí asistiré' else 'No podré asistir' end,
      1,
      array_to_string(v_invitados, ' y '),
      v_contacto,
      v_contacto,
      coalesce(p_mensaje, ''),
      v_id::text,
      v_id
    );

    if v_asiste then
      v_total := v_total + 1;
    end if;
  end loop;

  update public.invitaciones_personalizadas
  set respondida_at = now(), updated_at = now()
  where id = v_id;

  -- La sincronización comparte la transacción de guardado de la respuesta.
  PERFORM public.sincronizar_lista_novios_desde_confirmacion(v_id);
  return v_total;
end;
$function$;

