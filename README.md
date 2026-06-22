# Invitación digital de boda — Carolina & Esthefano

Proyecto Next.js para una invitación digital pensada para WhatsApp y celular.

## Estilo

- Diseño vertical tipo invitación digital móvil.
- Fondos en imágenes 9:16.
- Texto real en código con fuentes elegantes.
- Botones transparentes/dorados encima de las imágenes.
- Confirmación de asistencia conectable a Supabase.
- Panel admin para editar datos, lluvia de sobres, WhatsApp, enlace de álbum y ver respuestas.

## Rutas

- `/` Invitación completa.
- `/invite` Invitación completa, ideal para compartir por WhatsApp.
- `/confirmar` Solo formulario de confirmación.
- `/admin/login` Login administrador.
- `/admin/dashboard` Panel administrativo.

## Imágenes

Las imágenes están en:

```txt
public/invitation/
```

Puedes reemplazarlas con imágenes `.jpg`, `.jpeg` o `.png`, manteniendo los mismos nombres:

```txt
01-carta-inicial.jpg
02-invitacion-fondo.jpg
03-presentacion-fondo.jpg
04-detalles-fondo.jpg
05-confirmacion-fondo.jpg
06-lluvia-sobres-fondo.jpg
07-cierre-fondo.jpg
```

Tamaño recomendado para WhatsApp/celular:

```txt
1080 x 1920 px
```

Las fotos temporales están en:

```txt
public/placeholders/
```

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build para Cloudflare Pages

```bash
npm run build
```

Cloudflare Pages:

```txt
Build command: npm run build
Build output directory: out
```

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase-migration.sql` en SQL Editor.
3. Crea el usuario admin en Authentication.
4. Copia tus claves en `.env.local` y también en Cloudflare Pages.

Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=sthefanomc@gmail.com
```

## Subir a GitHub

```bash
git add .
git commit -m "Nueva invitacion digital celular"
git push
```
