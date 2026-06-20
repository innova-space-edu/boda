# Portal de Boda — Carolina & Esthefano

Portal web para invitación digital, confirmación de asistencia, lluvia de sobres y administración de invitados.

## Diseño actualizado

Tema visual: invitación digital elegante en blanco, dorado, negro y lila, con flores, rosas, estrellas animadas, estrellas fugaces, sobre interactivo, calendario con corazón en el día 6 y mapa funcional de Google Maps.

Incluye imágenes temporales en:

```text
public/images/wedding/
```

Formatos recomendados para reemplazar imágenes:

```text
URL pública directa
.jpg
.jpeg
.png
```

Las imágenes temporales se pueden reemplazar después manteniendo el mismo nombre o cambiando las URL desde el panel administrador.

## Rutas principales

```text
/                  Portal principal con invitación digital
/confirmar         Confirmación con sobre animado
/invite            Página solo con encuesta para compartir
/quienes-somos     Información de los novios
/admin/login       Login administrador
/admin/dashboard   Panel administrador
```

## Datos de boda incluidos

- Novia: Carolina Elizabeth Vega Carrera
- Novio: Esthefano Gonzalo Morales Campaña
- Fecha: 6 de febrero de 2027
- Lugar: Catedral de Antofagasta
- Ciudad: Antofagasta
- Hora: 18:00 hrs
- WhatsApp: 926301822 y 988215400

## Cloudflare Pages

Configuración recomendada:

```text
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: /
Production branch: main
```

El proyecto tiene `output: "export"` en `next.config.ts`, por lo que `npm run build` genera automáticamente la carpeta `out`.

## Variables de entorno

Crear en Cloudflare Pages o en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=sthefanomc@gmail.com
```

## Supabase

Ejecutar el archivo:

```text
supabase-migration.sql
```

Luego crear el usuario administrador en Supabase Authentication con el correo configurado en `NEXT_PUBLIC_ADMIN_EMAIL`.

## Comandos locales

```bash
npm install
npm run lint
npm run build
npm run dev
```

## Notas importantes

- No subir `.env.local` a GitHub.
- La carpeta `out` no se crea manualmente; se genera durante el build.
- El mapa usa Google Maps mediante iframe y link de búsqueda.
- Los botones de WhatsApp usan enlaces `wa.me` con código de país de Chile.

## Rediseño iglesia — versión barroca lila/dorado

Esta versión cambia la estética completa hacia una invitación religiosa más elegante, inspirada en tarjetas clásicas con letras cursivas antiguas, relieves dorados/plateados, fondo claro lila/blanco y detalles florales.

Incluye:

- Portada digital estilo tarjeta de invitación vertical.
- Tipografía cursiva ornamental para los nombres de los novios.
- Tonos blanco, dorado, lila y plateado.
- Animación inicial mejorada: la novia camina hacia la iglesia y el novio espera en la puerta.
- Fondo con estrellas lilas y estrellas fugaces.
- Calendario de febrero 2027 con corazón lila en el día 6.
- Mapa embebido de la Catedral de Antofagasta y botón para abrir Google Maps.
- Botones WhatsApp para 926301822 y 988215400.
- Sección de lluvia de sobres con botón “Ver datos de transferencia” solo cuando el invitado marca que desea considerar aporte monetario.
- Imágenes temporales de boda en `public/images/wedding/`, reemplazables por archivos `.jpg`, `.jpeg`, `.png` o por URL pública desde el panel administrador.

> Nota: las imágenes actuales son placeholders de temática boda lila/dorado. Puedes reemplazarlas manteniendo los mismos nombres de archivo para conservar tamaños y formatos.
