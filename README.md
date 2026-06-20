# Portal de Boda — Carolina & Esthefano

Portal web animado para invitación, confirmación de asistencia y administración de invitados.

## Rutas principales

| Ruta | Uso |
|---|---|
| `/` | Home con intro animada de novia caminando, información de la boda y countdown |
| `/quienes-somos` | Historia e información de los novios |
| `/confirmar` | Confirmación con animación de sobre |
| `/invite` | Página pública solo con encuesta para compartir por WhatsApp |
| `/admin/login` | Login del administrador |
| `/admin/dashboard` | Panel de administración |

## Funciones incluidas

- Intro animada con novia caminando hacia iglesia/catedral.
- Banner fijo superior con navegación.
- Home con datos de boda, fecha, hora, lugar, vestimenta y cuenta regresiva.
- Sección “Quiénes somos” con texto e imágenes editables.
- Encuesta RSVP por núcleo familiar.
- Registro de integrantes asistentes/no asistentes.
- Campo de restricciones alimentarias.
- Sección “Lluvia de sobres” con datos bancarios editables.
- Panel admin con estadísticas, respuestas, accesos y exportación CSV.
- Configuración editable desde el panel admin: nombres, fecha, hora, lugar, textos, imágenes y datos bancarios.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=sthefanomc@gmail.com
```

No subas `.env.local` a GitHub.

## Supabase

1. Crea un proyecto en Supabase.
2. Entra a `SQL Editor`.
3. Ejecuta el archivo `supabase-migration.sql` completo.
4. En `Authentication > Users`, crea el usuario administrador con el correo definido en `NEXT_PUBLIC_ADMIN_EMAIL`.
5. En Supabase Auth, deja desactivado el registro público si solo quieres usuarios creados manualmente.

## Deploy en Vercel

1. Sube el proyecto a GitHub.
2. En Vercel, importa el repositorio.
3. Agrega estas variables en `Project Settings > Environment Variables`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
4. Deploy.
5. Después de cambiar variables de entorno, haz `Redeploy`.

## Comandos útiles

```bash
npm run lint
npm run build
npm run dev
```

## Seguridad

- No se incluye contraseña en el repositorio.
- Las políticas RLS de Supabase restringen lectura/edición admin al correo configurado en `supabase-migration.sql`.
- La encuesta pública solo puede insertar respuestas, no leerlas.
- Los visitantes pueden leer la configuración pública de la boda, pero no modificarla.

## Notas

Si cambias el correo administrador, actualiza dos lugares:

1. `.env.local` / variables de Vercel: `NEXT_PUBLIC_ADMIN_EMAIL`
2. `supabase-migration.sql`, función `public.is_wedding_admin()`
