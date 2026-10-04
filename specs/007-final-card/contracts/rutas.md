# Contrato — Rutas de resultado e imágenes (feature 007)

Dos rutas on-demand (`export const prerender = false`) con el adapter `@astrojs/netlify` ya configurado. Sin base de datos: todo sale del código de la URL.

## `GET /r/[codigo]` — página de resultado

`src/pages/r/[codigo].astro`

| Aspecto | Contrato |
|---|---|
| Render | On-demand (SSR). HTML con **0 kB de JS** (componente Svelte sin directiva `client:*`). |
| JS en la isla | Ninguno: la página es para el visitante; compartir ocurre en `/jugar`. |
| Datos | `decodificar(codigo)`. Si `ok` → render de `Tarjeta.svelte` con la `TarjetaFinal`. |
| Código inválido / versión incompatible | Página amable: mensaje claro, sin errores técnicos ni pantallas bloqueadas, con enlace a `/jugar` (FR-024). |
| Metadatos | `title`, `description`, `og:title`, `og:description`, `og:image` (`/api/og/<codigo>.png`), `og:url`, `twitter:card=summary_large_image`. |
| Indexación | Tarjeta válida: indexable y con `<link rel="canonical">` a `/r/<codigo>`. Código inválido / versión incompatible: `<meta name="robots" content="noindex">` y **sin** canónica (FR-031, SC-014). |
| Contenido | La tarjeta completa (identidad, datos destacados, trayectoria, premios, hitos, frase y pie con marca de agua). Nunca datos ocultos. |
| Accesibilidad | WCAG 2.2 AA (estructura semántica, contraste, texto alternativo). |

`Layout.astro` gana props opcionales de Open Graph y de cabecera SEO (`canonical`, `noindex`); sin ellas se comporta como hasta ahora.

## `GET /api/og/[codigo].png` — imágenes de compartir

`src/pages/api/og/[codigo].png.ts`

| Aspecto | Contrato |
|---|---|
| Parámetro | `t=og\|9x16\|1x1` (por defecto `og`). Valor desconocido ⇒ `og`. `v=<versión>` es un testigo de caché (ver abajo). |
| Tamaños | `og` 1200×630 · `9x16` 1080×1920 · `1x1` 1080×1080. |
| Render | `satori` (árbol de elementos, sin React) + `@resvg/resvg-js`; tipografía TTF desde `public/fonts/`. |
| Contenido | Calca el palmarés de `Tarjeta.svelte`: identidad (modalidad, nombre y estilo), mejor posición (puesto con ordinal o fase, con ornamento), trayectoria (hitos y premios con carril y medallas) y distinciones (una roseta por victoria, agrupadas por tipo), más un **pie de marca** con la URL del juego. Nunca datos ocultos ni texto sin sanear (FR-019/FR-020). |
| Código inválido | Devuelve una imagen genérica del juego (200) para no romper previsualizaciones; la página sí muestra el aviso amable. |
| Caché | `Cache-Control: public, max-age=31536000, immutable`. El contenido depende del código **y de la versión del diseño**, así que la URL se versiona con `?v=` (`VERSION_OG` en `presentacion.ts`); al cambiar el aspecto de la imagen hay que subir esa constante. `urlImagenOg()` construye la URL con el testigo. |
| Respuesta | `Content-Type: image/png`. |

## Orden de prioridad de la tarjeta (resumen)

1. Isla (`/jugar`): la tarjeta se muestra al terminar, con panel de compartir (ver `ui.md`).
2. Enlace `/r/<codigo>`: reproduce la tarjeta sin guardado local.
3. Imágenes: se generan on-demand al compartir o al pedir el enlace en redes.

## Fuera de alcance

- Ranking / "ver jugadores" de la referencia externa: sin backend (v1).
- Fallback de Web Share en navegadores sin soporte (T16).
