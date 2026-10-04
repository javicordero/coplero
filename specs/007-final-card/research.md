# Phase 0 — Research: Tarjeta final de carrera y compartir

Todas las incógnitas del Technical Context quedan resueltas aquí. No quedan `NEEDS CLARIFICATION`.

## R1 · Contrato `TarjetaFinal` y relación con `ResumenCarrera`

**Decisión**: Introducir un agregado nuevo `TarjetaFinal` generado por `construirTarjeta(p, banco)`, y **retirar** `ResumenCarrera` (`Paso` de `fin` pasa a llevar `tarjeta: TarjetaFinal`). `construirTarjeta` deriva todos los campos visibles de `Partida` (temporadas, premios, trayectoria) y de `banco.textosTarjeta`, y **nunca** lee ni copia `destino`.

**Rationale**: la spec pide "primero define el contrato de `TarjetaFinal`"; `ResumenCarrera` es un subconjunto (nombre, modalidad, variante, años, mejor fase, premios, trayectoria) que ya no cubre hitos, frase, mejor posición ni premios separados. Sustituir en vez de envolver evita dos formas del mismo dato y un campo `resumen` redundante.

**Alternativas consideradas**:
- Ampliar `ResumenCarrera` con los campos nuevos: obliga a convivir con un nombre que ya no describe el contrato y arrastra el campo `premios` sin agrupar.
- Mantener ambos y anidar: duplica información y complica el codec.

## R2 · Determinismo de hitos y frase de cierre sin `seed`

**Decisión**: El motor deriva los tres hitos por **prioridad** (ganar el COAC → podio/final → premio ajeno, con la Aguja de oro destacada → cambio de modalidad → cambio de variante → años sin concursar) y rellena con **hitos neutros** (debut, duración, mejor resultado). El texto de cada hito y la elección de la frase de cierre se resuelven con un **hash estable FNV-1a** sobre una cadena canónica de campos **visibles** de la tarjeta (mejor fase, años, recuentos de premios, número de cambios), nunca sobre el `seed`.

**Rationale**: la clarificación descarta el `seed` en el código para no permitir deducir el `destino`. Un hash de datos visibles es puro, determinista y reproducible en cualquier dispositivo/versión sin el motor ni la semilla (SC-005).

**Alternativas consideradas**:
- Elegir el primer hito/frase de cada lista (sin hash): correcto pero sin variedad entre carreras idénticas en resultado.
- Incluir el `seed` solo para elegir textos: filtra la semilla y permite inferir el techo; descartado.

## R3 · Codec autocontenido (URL) y versionado

**Decisión**: `src/engine/codec.ts` con `codificar(tarjeta) → string` y `decodificar(string) → Resultado<TarjetaFinal, ErrorCodigo>`. Pipeline: `TarjetaFinal` → JSON → `fflate.strToU8` + `deflateSync` → bytes → **base64url** con un helper puro (sin `btoa`/`Buffer`) → URL-safe. El payload lleva `v: VERSION_CODIGO` (versión del esquema del código, independiente de `VERSION_PARTIDA`). `decodificar` valida el prefijo, la compresión, el JSON, `v` y la forma mínima; cualquier fallo → `{ codigo: "CODIGO_INVALIDO" | "VERSION_CODIGO_INCOMPATIBLE" }`.

**Rationale**: `fflate` ya es dependencia del proyecto y la ruta está cerrada en `docs/02` §10. Un helper base64url puro mantiene el `engine` agnóstico del entorno (navegador y Node). La tarjeta autocontenida no re-simula y respeta FR-004/FR-017.

**Alternativas consideradas**:
- Reutilizar `serializar.ts` (JSON plano): demasiado grande para una URL y acopla el código a la forma de `Partida`.
- Codificar semilla + decisiones: prohibido por FR-017 y filtra el destino.

## R4 · Página de resultado y reutilización de la presentación

**Decisión**: La tarjeta visual es **un solo componente** `src/juego/Tarjeta.svelte` que recibe `TarjetaFinal`. La isla lo usa en `FinCarrera.svelte` (con panel de compartir); `/r/[codigo].astro` (`export const prerender = false`) decodifica el código y renderiza el **mismo** componente en servidor. Astro no envía JS por un componente Svelte sin directiva `client:*`, así que la página de resultado se sirve con **0 kB de JS** (Principio IV).

**Rationale**: evita duplicar la composición entre isla y página y garantiza que ambas muestran exactamente el mismo resultado. El código inválido o de otra versión cae en una página amable con enlace a `/jugar` (FR-024).

**Alternativas consideradas**:
- Dos implementaciones (Svelte en la isla + HTML en Astro): se desincronizan.
- Hidratar la página de resultado: rompe el 0 kB de JS.

## R5 · Imágenes 9:16, 1:1 y Open Graph (satori + resvg)

**Decisión**: `src/pages/api/og/[codigo].png.ts` con `export const prerender = false` y parámetro `?t=og|9x16|1x1` (por defecto `og`). Decodifica el código, compone un árbol de elementos para `satori` (sin React: objeto `{ type, props }`) con la misma información que la tarjeta y la marca de agua, y lo rasteriza con `@resvg/resvg-js`. Tamaños: `og` 1200×630, `9x16` 1080×1920, `1x1` 1080×1080. Cabeceras `Cache-Control` de larga duración. La fuente TTF se guarda en `public/fonts/` y se carga desde el sistema de archivos del endpoint.

**Rationale**: `satori` + `resvg-js` es la decisión cerrada (`docs/02` §10) y las dependencias ya están instaladas. `@resvg/resvg-js` es un addon nativo Node, por lo que las rutas se despliegan como **funciones on-demand** (el `prerender = false` que exige la constitución); no se usa el runtime edge de Deno.

> **Actualización (2026-10-04, feature 020)**: la imagen OG deja de ser una composición propia y **calca el palmarés de `Tarjeta.svelte`** (identidad, mejor posición, trayectoria y distinciones; títulos de sección en Anton; pie de marca dentro de la tarjeta), definida en `rem` y escalada por formato. La URL se **versiona** (`?v=`, `VERSION_OG` + `urlImagenOg()`).

**Alternativas consideradas**:
- `resvg-wasm` en edge: añade complejidad y una segunda ruta de render sin necesidad.
- Generar PNG en el cliente: no cubre la previsualización social (la crawler no ejecuta JS).

## R6 · Acciones de compartir y privacidad del nombre

**Decisión**: panel con cuatro acciones, sin lógica de juego, en `src/utilities/compartir.ts`: (1) **compartir nativo** con `navigator.share` (texto + URL; imagen cuando el destino la admita), (2) **copiar** texto/enlace con `navigator.clipboard`, (3) **descargar** el PNG pedido al endpoint, (4) **copiar/abrir** el enlace de resultado. El **toggle de nombre** (FR-027) aplica `sinNombre(tarjeta)` y vuelve a codificar antes de compartir; por defecto la tarjeta muestra el nombre. Sin fallback para navegadores sin Web Share (T16, fuera de alcance).

**Rationale**: reproduce el conjunto de acciones de la referencia y lo ya pedido en `docs/05` §2 (portapapeles, PNG descargable). El toggle es una decisión de presentación sobre un dato ya generado, no cálculo de juego.

**Alternativas consideradas**:
- Compartir solo texto: pierde el valor viral de la imagen (la mitad del producto según `docs/02`).
- Fallback de copia para Web Share ausente: fuera de alcance (T16).

## R7 · Textos como contenido inyectado

**Decisión**: añadir `textosTarjeta` a `BancoContenido` y un `TextosTarjetaSchema` (Zod) en `src/content/schema.ts`; el catálogo vive en `src/content/textos/tarjeta.ts` y se incluye en `bancoContenidoBruto`. El motor lo recibe por el banco y resuelve etiquetas y frases; si falta un texto, usa un neutro. El `engine` no importa `content`.

**Rationale**: respeta el Principio II (contenido como datos) y la clarificación de que el motor decide *qué* se narra y los textos se pulen como contenido.

**Alternativas consideradas**:
- Constantes de texto dentro del `engine`: viola el Principio II.

## R8 · Accesibilidad y verificación

**Decisión**: objetivo **WCAG 2.2 AA** (FR-015/SC-012). La tarjeta y el panel usan botones con tamaño táctil, foco visible (ya en `Layout.astro`), nombres accesibles y contraste suficiente; no dependen solo del color. Se añade una prueba E2E con Playwright que recorre fin → tarjeta → compartir y ejecuta una auditoría de accesibilidad automática.

**Rationale**: cierra la categoría Non-Functional con un criterio verificable y automatizable.

**Alternativas consideradas**: auditar solo manualmente en la fase de QA: no deja puerta automática.

## R9 · Impacto en simulación y tests

**Decisión**: la simulación construye la tarjeta en el paso `fin` y `auditoria.ts` añade la regla `tarjetaIncoherente` (exactamente 3 hitos, sin claves de `destino`, premios sin tipos a cero). Tests nuevos: `tarjeta.test.ts`, `codec.test.ts`; ampliación de `resumen`/`estado`, integridad de textos de contenido y un E2E de compartir.

**Rationale**: SC-002/SC-003 solo se demuestran a escala; la simulación es la que garantiza que ninguna tarjeta de 10.000 expone datos ocultos o incumple los tres hitos.

**Alternativas consideradas**: confiar solo en tests unitarios con carreras de referencia: no cubre la variedad real del banco.
