-- Migración: fecha y hora exacta de término de cada invitación.
-- La fecha se almacena en UTC (timestamptz) y la interfaz la muestra en America/Santiago.
-- Las invitaciones antiguas no reciben una fecha arbitraria: el administrador la debe configurar.
-- Invitaciones con un plazo ya iniciado conservan su plazo_fin_at original.
ALTER TABLE public.invitaciones_personalizadas
  ADD COLUMN IF NOT EXISTS plazo_fecha_limite_at timestamptz;

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

  return v_total;
end;
$function$;

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

  return v_total;
end;
$function$;

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

  return v_total;
end;
$function$;

CREATE OR REPLACE FUNCTION public.iniciar_plazo_invitacion(p_invitacion_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v public.invitaciones_personalizadas%ROWTYPE;
  v_ahora timestamptz;
BEGIN
  IF auth.uid() IS NULL OR lower(coalesce(auth.jwt()->>'email', '')) <> 'sthefanomc@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT * INTO v FROM public.invitaciones_personalizadas
  WHERE id = p_invitacion_id FOR UPDATE;
  IF v.id IS NULL OR NOT v.activa THEN
    RAISE EXCEPTION 'Invitación no válida o desactivada';
  END IF;
  IF v.plazo_inicio_at IS NULL THEN
    v_ahora := clock_timestamp();
    IF v.plazo_fecha_limite_at IS NULL THEN
      RAISE EXCEPTION 'Debe establecer la fecha y hora límite antes de iniciar';
    END IF;
    IF v.plazo_fecha_limite_at <= v_ahora THEN
      RAISE EXCEPTION 'La fecha límite de esta invitación ya terminó';
    END IF;
    UPDATE public.invitaciones_personalizadas
      SET plazo_inicio_at = v_ahora,
          plazo_fin_at = v.plazo_fecha_limite_at,
          updated_at = v_ahora
    WHERE id = v.id
    RETURNING * INTO v;
  END IF;
  RETURN jsonb_build_object(
    'plazo_inicio_at', v.plazo_inicio_at,
    'plazo_fin_at', v.plazo_fin_at,
    'plazo_fecha_limite_at', v.plazo_fecha_limite_at
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.obtener_plazo_invitacion(p_token uuid)
 RETURNS TABLE(plazo_horas integer, plazo_inicio_at timestamp with time zone, plazo_fin_at timestamp with time zone, servidor_ahora timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT i.plazo_horas, i.plazo_inicio_at,
         coalesce(i.plazo_fin_at, i.plazo_fecha_limite_at),
         clock_timestamp()
  FROM public.invitaciones_personalizadas i
  WHERE i.token = p_token AND i.activa = true LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.iniciar_plazo_invitacion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.iniciar_plazo_invitacion(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.obtener_plazo_invitacion(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_plazo_invitacion(uuid) TO anon, authenticated;
