# Fase 0 — Investigación y decisiones

**Feature**: 012-visual-design | **Fecha**: 2026-09-21

Estado del punto de partida (medido en el repo, no supuesto):

- **Sin tokens**: colores hex hardcodeados en cada componente; ~100 apariciones y ~22 valores distintos, con tres grises de texto que significan lo mismo (`#a0aec0`, `#98a2b3`, `#8b98a5`) y azules de fondo distintos (`#0a0a0a`, `#111`, `#141414`, `#1a1a1a`, `#1d2733`, `#071019`).
- **Sin tipografía de marca**: todo el sitio usa `font-family: system-ui`. `public/fonts/Coplero.ttf` (757 kB) es en realidad **DejaVu Sans** (verificado leyendo la tabla `name` y el `cmap`), la parencia que `satori` necesita para rasterizar. La imagen OG también sale en DejaVu: no hay identidad tipográfica en ninguna superficie.
- **Sin favicon ni `theme-color`**: `public/` solo contiene la fuente.
- **Estados incompletos**: `Decision.svelte` solo define `:hover` (sin `:active`, `:focus-visible`, `:disabled`); `Error.svelte` pinta el error con el ámbar de marca; el foco visible solo existe a nivel global.
- **Lo que ya está bien y no hay que tocar**: `min-height: 44px` en los botones de la tarjeta, `aria-live` en los avisos de compartir, `:focus-visible` global, `prefers-reduced-motion` ausente (a añadir).

---

## R1. Dónde y cómo viven los tokens

**Decisión**: tokens como **custom properties CSS** en `src/ui/tokens.css`, importados una sola vez desde `Layout.astro`, más un **espejo TypeScript** mínimo en `src/ui/tokens.ts` (solo paleta y familias tipográficas).

**Rationale**: `docs/02` §6 ya reserva `src/ui/tokens.css` para "fase 2". Las custom properties heredan a `.astro` y a la isla Svelte sin coste de JS, así que las páginas estáticas siguen en 0 kB. El espejo TS es obligatorio porque el endpoint edge del OG (`prerender = false`) no puede leer CSS y, si no comparte valores, la tarjeta y la web divergen. Un test compara CSS y TS para evitar derivas.

**Alternativas consideradas**:
- *Tailwind*: dependencia, toolchain y utilidades en el marcado; rompe el Principio V sin aportar nada que CSS nativo no dé aquí.
- *CSS-in-JS / estilos en TS*: obliga a JS en páginas estáticas; viola el Principio IV.
- *Tokens solo en TS*: habría que inyectarlos con `<style>` o `setProperty`, añadiendo JS; peor.

## R2. Tipografía de marca

**Decisión**: dos familias libres (OFL) autoalojadas y subseateadas:
- **Display: `Anton`** — marca, titulares, número de año y tarjeta final.
- **Texto: `Atkinson Hyperlegible`** — cuerpo, UI, formularios y botones.

Se obtienen las **woff2 ya subseateadas por unicode-range que sirve Google Fonts** (`latin` + `latin-ext`) y se autoalojan; para `satori` se usa el **TTF** completo de las mismas familias (vive solo en el servidor, no viaja al navegador). Se precarga **solo la display `latin`**. Se incluye el fichero de licencia OFL de cada familia y el crédito correspondiente.

**Rationale**: `Anton` aporta el registro de cartel sin caer en el tópico; `Atkinson Hyperlegible` está diseñada específicamente para legibilidad (sirve directamente a FR-003 y SC-007) y no es la fuente por defecto de la IA, así que no "suena a generado". Usar las subseteadas de Google Fonts evita añadir `fonttools`/`subfont` (Principio V) y deja el coste en ~25–35 kB por familia. La misma familia en OG y web cierra el hueco detectado.

**Alternativas consideradas**:
- *`Fraunces` (variable) como display*: más personalidad, pero variable ⇒ fichero grande o subsetting por ejes (herramienta extra).
- *`Alfa Slab One` / `Rye`*: muy "cartel de fiesta", pero bordean la parodia que el usuario quiere evitar.
- *Una sola familia (`Bricolage Grotesque`)*: menos coste, pero pierde el contraste display/texto que da el carácter.
- *Seguir con `system-ui`*: cero coste, pero deja el problema de identidad intacto (el objetivo de la fase).

> **Confirmado por el usuario (2026-09-21)**: opción **A**, `Anton` + `Atkinson Hyperlegible`. Queda cerrado. El par sigue siendo sustituible con un solo token (`--fuente-display` / `--fuente-texto`) sin tocar nada más, pero **no** es un punto abierto de esta fase.

## R3. Un solo tema (oscuro)

**Decisión**: se mantiene **un único tema oscuro**. Los tokens se declaran en `:root` y se prepara `color-scheme: dark`; el conmutador claro/oscuro **queda fuera** de esta fase.

**Rationale**: la spec lo fija en Assumptions; `docs/05` §9 sitúa el "modo oscuro" como v1.1 (entendido como conmutador, porque oscuro ya es lo actual). Introducir dos temas duplica la verificación de contraste y no aporta a la meta de esta fase.

**Alternativas consideradas**: definir la paleta en pares claro/oscuro desde ya (`light-dark()`), lo que adelantaría trabajo de v1.1 pero duplicaría la superficie de testeo ahora.

## R4. Paleta con significado y contraste

**Decisión**: cuatro familias cromáticas con un rol único cada una, sobre neutros.

| Rol | Token | Valor | Uso |
|---|---|---|---|
| Marca / acción / **verano** | `--c-acento` | `#f6ad55` | marca, CTA, indicador de verano |
| Hover del acento | `--c-acento-fuerte` | `#ffc477` | estado `hover` de los controles de acento |
| **Febrero** / éxito / selección | `--c-acento-2` | `#7fd1c1` | indicador de febrero, foco de opción, confirmaciones |
| Error | `--c-error` | `#fc8181` | errores y avisos destructivos |
| Fondo / superficie / superficie alta | `--c-fondo`, `--c-superficie`, `--c-superficie-alta` | `#0a0a0a`, `#141414`, `#1d1d1d` | planos |
| Texto / texto suave | `--c-texto`, `--c-texto-suave` | `#ededed`, `#b3bdca` | texto |
| Separador / borde de control | `--c-separador`, `--c-borde-control` | `#262b33`, `#6b6b6b` | filetes decorativos (exentos) y contorno de controles (≥ 3:1) |

El color **nunca** transmite información por sí solo (FR-006): el momento lleva etiqueta textual ("Verano 2019" / "Febrero 2020") y los avisos llevan texto.

**Rationale**: colapsa 22 valores en 11, elimina la triple duplicación de grises y arregla dos errores semánticos (error pintado en color de marca; `#9ae6b4` mint usada a la vez para indicador y hover). Los pares elegidos superan AA con holgura sobre `#0a0a0a` (≥ 7:1 el peor caso) y `--c-sobre-acento` (`#1a1206`) sobre `#f6ad55` ronda 9:1; aun así el contrato de verificación los testea uno a uno.

**Alternativas consideradas**: mantener el ámbar como único acento (pierde la distinción verano/febrero); usar rojo/verde convencionales para momento (choque con error/éxito).

## R5. Movimiento y microinteracciones

**Decisión**: movimiento **solo CSS**. Escala de duración (120/200/280 ms, dentro de los 200–300 ms que fija `docs/05` §1 para las transiciones entre años) y dos easings como tokens. Transiciones en `background-color`, `border-color`, `color`, `transform` y `opacity`, nunca en propiedades de layout. Un bloque global en `base.css` neutraliza duraciones y `@keyframes` bajo `@media (prefers-reduced-motion: reduce)`. Las pantallas Svelte usan las transiciones nativas de Svelte 5 solo si no añaden JS al bundle compartido.

**Rationale**: el Principio IV pide precargar fuentes y no decisiones; una librería de animación (~10–30 kB) para transiciones de 200 ms en un juego de texto no se justifica y la spec la prohíbe. CSS `transition`/`@keyframes` es gratuito y ya accesible con `prefers-reduced-motion`.

**Alternativas consideradas**: `svelte/transition` (JS mínimo, viable, pero innecesario para hover/estado); `motion`/`GSAP` (rechazado por peso).

## R6. Elemento firma

**Decisión**: **la regla de compás** — un separador compuesto por un compás de 3/4 dibujado en CSS (bastones + cabeza de nota) que aparece bajo la marca, entre secciones de la landing y en el pie de la tarjeta. Se implementa con CSS/SVG inline de coste nulo, decorativo (`aria-hidden`), y nunca es el único vehículo de información.

**Rationale**: Cádiz y el carnaval se leen en la música antes que en el tópico visual (plumas, antifaces); un compás es específico, culto y barato. Da un detalle reconocible reutilizable sin convertir la interfaz en un decorado.

**Alternativas consideradas**:
- *Banderín/estandarte* como marco del indicador de año: igual de barato, algo más naíf.
- *Trama de puntos tipo antifaz*: riesgo de parodia y de contraste bajo.
- *Solo tipografía y color*: un elemento firma explícito ayuda a "no parecer genérico" (FR-002).

## R7. Matriz de estados

**Decisión**: contrato de estados obligatorio para todo control interactivo y para toda pantalla con datos.

- **Control**: `reposo`, `hover`, `active`, `focus-visible`, `disabled`, `seleccionado`.
- **Pantalla**: `carga`, `vacío`, `error`, `éxito`.
- El foco usa `--foco-ancho`/`--foco-offset` y un color con contraste ≥ 3:1 respecto al fondo adyacente.
- `disabled` combina opacidad y `cursor: not-allowed`, y **no** depende solo del color.

**Rationale**: hoy solo existe `:hover` en la mayoría de controles; `docs/05` y la spec piden feedback. Se documenta como contrato para que la verificación sea comprobable.

**Alternativas consideradas**: dejar los estados a criterio de cada pantalla (es lo que ha producido la incoherencia actual).

## R8. Identidad fuera del viewport

**Decisión**: añadir `public/favicon.svg` (marca y compás, SVG de <1 kB), `<link rel="icon">`, `<meta name="theme-color">` con el color de fondo y `<link rel="apple-touch-icon">` con PNG pequeño. Sin `manifest` ni service worker (no es PWA y la spec lo excluye).

**Rationale**: hoy `public/` solo tiene la fuente; una pestaña sin favicon en un enlace compartido por WhatsApp debilita la marca. Es el complemento natural de "facilidad de compartir" (US3) y coste casi nulo.

**Alternativas consideradas**: solo `theme-color` (menos identidad); favicon PNG (más peso y menos nítido).

## R9. Coherencia de la imagen OG

**Decisión**: el endpoint `api/og/[codigo].png.ts` pasa a importar `src/ui/tokens.ts` para los colores y a cargar la **tipografía de marca** (TTF subset) en lugar de DejaVu, declarando los pesos reales disponibles. Los tres formatos (`og`, `9x16`, `1x1`) se revisan para no romper jerarquía.

**Rationale**: la tarjeta compartida es la mitad del producto y hoy sale en DejaVu con una paleta duplicada a mano; si el diseño no llega al OG, el enlace compartido contradice la app. Es la superficie donde "facilidad de compartir" se juega.

**Alternativas consideradas**: mantener DejaVu (el OG seguiría pareciendo genérico); generar el OG desde HTML (implica navegador headless en edge; descartado en `007`).

## R10. Estrategia de verificación

**Decisión**: tres capas.

1. **Vitest (puro)**: `src/ui/contraste.ts` con luminancia relativa y ratio WCAG; test de todos los pares token/fondo del contrato; test de **integridad** `tokens.css` ↔ `tokens.ts`; test **anti-hex** que falla si aparece un `#rrggbb` en `src/**` fuera de `src/ui/**`, `src/panel-ui/**`, `src/engine/**` y `src/content/**`.
2. **Playwright + axe** (`tests/e2e/visual.spec.ts`): WCAG 2.2 AA en portada, `/como-jugar`, `/jugar`, `/r/[codigo]` y legales; objetivos táctiles ≥ 44 px; sin scroll horizontal a 320 px; `prefers-reduced-motion` respetado; foco visible por teclado.
3. **Campo (post-deploy)**: Core Web Vitals en Netlify, sin regresión respecto al baseline actual.

**Rationale**: el proyecto ya tiene `@axe-core/playwright` y Vitest; el test anti-hex es el único que impide que la deuda vuelva sola, y el de integridad CSS/TS evita que la web y el OG diverjan. `npm run check` debe seguir siendo la puerta única.

**Alternativas consideradas**: regla de lint personalizada en Biome (no soporta esta comprobación sin plugin); revisión manual (no previene regresiones).

## R11. Alcance excluido

**Decisión**: `src/panel-ui/**` **no** entra en el sistema de tokens. Mantiene su paleta clara propia. El test anti-hex lo excluye explícitamente.

**Rationale**: es una herramienta solo-dev que nunca se sirve en producción; tocarla añade riesgo y no aporta al objetivo. Se documenta la exclusión para que el test no la marque como fallo.

**Alternativas consideradas**: unificar el panel (trabajo sin valor de producto).

---

## Resumen de decisiones

| # | Decisión | Impacto principal |
|---|---|---|
| R1 | Tokens CSS en `src/ui/` + espejo TS | base de todo, 0 kB JS |
| R2 | `Anton` (display) + `Atkinson Hyperlegible` (texto), OFL, subset autoalojado | identidad; **confirmada por el usuario** |
| R3 | Un solo tema oscuro | acota verificación |
| R4 | 11 colores con rol único | contraste y semántica |
| R5 | Movimiento CSS puro, 120/200/280 ms, reduced-motion | Principio IV |
| R6 | **Regla de compás** como elemento firma | "no genérico" |
| R7 | Matriz de estados obligatoria | feedback y a11y |
| R8 | favicon.svg + theme-color | marca al compartir |
| R9 | OG con tokens y tipografía de marca | coherencia web↔tarjeta |
| R10 | Vitest (contraste/integridad/anti-hex) + axe + CWV | puerta de calidad |
| R11 | `panel-ui` excluido | riesgo acotado |
