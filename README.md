# Invitación digital de boda — Carolina & Esthefano

Proyecto Next.js estático para Cloudflare Pages + Supabase.

## Concepto

La invitación vuelve a una estructura simple y elegante:

- fondos intercalados blanco marfil y lila suave;
- letras antiguas estilo invitación clásica;
- textos editables desde Supabase;
- imágenes editables mediante URL;
- música opcional que inicia al presionar “Abrir invitación”;
- formulario de confirmación conectado a Supabase;
- panel administrador para editar contenido y revisar respuestas.

## Rutas

- `/` invitación completa.
- `/invite` invitación completa para compartir por WhatsApp.
- `/confirmar` solo formulario de confirmación.
- `/admin/login` login administrador.
- `/admin/dashboard` panel de edición y respuestas.

## Configuración local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variables necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=sthefanomc@gmail.com
```

## Supabase

1. Crear proyecto en Supabase.
2. Ejecutar `supabase-migration.sql` en SQL Editor.
3. Crear usuario administrador en Authentication > Users.
4. Usar el mismo correo definido en `NEXT_PUBLIC_ADMIN_EMAIL`.

## Cloudflare Pages

Usar esta configuración:

- Framework preset: Next.js
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`

El proyecto usa `output: "export"` en `next.config.ts`, por lo que `next build` genera la carpeta `out`.

## Música

Coloca una canción en:

```text
public/music/wedding-song.mp3
```

La música solo inicia cuando el usuario presiona “Abrir invitación”. Esto evita problemas con los bloqueos de autoplay del navegador.

También puedes editar `music_url` desde el panel admin usando una URL pública o la ruta local `/music/wedding-song.mp3`.

## Imágenes editables

Las imágenes por defecto están en:

```text
public/photos/
```

Puedes reemplazarlas o usar URLs externas desde el panel admin.

Campos editables:

- Imagen invitación principal
- Imagen significado
- Imagen historia 1
- Imagen historia 2
- Imagen historia 3

Formatos recomendados:

- `.jpg`
- `.jpeg`
- `.png`
- `.svg`

## Diseño

Fuentes usadas mediante Google Fonts:

- Great Vibes para nombres y títulos cursivos.
- Pinyon Script como alternativa cursiva.
- Cinzel para títulos formales, fechas y botones.
- Cormorant Garamond para textos largos.

## Subir a GitHub

```powershell
cd D:\boda-carolina-esthefano-revisado
git pull --rebase origin main
git add .
git commit -m "Recrear invitacion basica editable"
git push
```
