# Phase 0 — Research: Panel local de situaciones y volcado al juego

Resuelve los puntos técnicos de la spec. No queda ningún `NEEDS CLARIFICATION`.

## R1 · Cómo se sirve el panel sin exponerlo en producción

**Decision**: una **ruta on-demand solo-dev** dentro del propio Astro. La página `/panel` y los
endpoints `/api/panel/*` se declaran con `export const prerender = false` y, en la primera línea,
un guard `if (!import.meta.env.DEV) return new Response("Not Found", { status: 404 })`. En `astro dev`
el flag es `true` y el panel funciona; en el build de Netlify el flag es `false` y **toda** ruta del
panel responde 404, aunque el adapter la despliegue como función.

**Rationale**: cumple FR-001/SC-007 con una sola línea de código, reutiliza el proyecto y el
toolchain (constitución V) y no añade procesos ni dependencias. Es independiente del versionado en
git (FR-021).

**Alternatives considered**:
- *Servidor Node/Express aparte*: segundo proceso, segundo toolchain y dependencia nueva; rechazado.
- *`json-server`*: ya descartado en el spec (dependencia genérica + proceso aparte).
- *Redirección en `netlify.toml`*: protege el deploy pero deja el código accesible en otros entornos
  y no es verificable con test unitario; el guard en código sí.
- *Variable de entorno*: exige configurar Netlify y puede olvidarse; `import.meta.env.DEV` es
  intrínseco al build.

## R2 · Cómo se implementa la UI del panel

**Decision**: una **isla Svelte 5** (`client:load`) en `/panel`, apoyada en componentes pequeños
(`TablasCategorias`, `FormularioSituacion`, `FormularioOpcion`, `DetalleSituacion`). La isla consume
la API JSON por `fetch`.

**Rationale**: el panel es un CRUD con lista dinámica de opciones y feedback de validación; las
runas de Svelte 5 lo resuelven sin estado global ni librerías. Svelte ya está en el stack. La regla
de la constitución (principio IV) reserva la **isla del bucle jugable** a `/jugar`; el panel no
forma parte del bucle jugable y **nunca se sirve en producción**, así que no añade kB al jugador.

**Alternatives considered**:
- *Formularios HTML server-rendered con POST*: viables, pero la edición dinámica de opciones exige
  JS a mano igualmente; más código y peor ergonomía para un formulario denso.
- *React/Vue*: fuera del stack cerrado.
- *Página estática + edición del JSON a mano*: no cumple FR-008–FR-011.

## R3 · Dónde vive el almacén y cómo se escribe

**Decision**: fichero **`content-admin/data/situaciones.json`**, versionado (FR-021), escrito de
forma **atómica** (fichero temporal + `rename`) y con **copia de seguridad** previa en
`content-admin/data/backups/<timestamp>.json` (ignorado en git). Se accede con `node:fs` desde
`src/panel/almacen.ts`.

**Rationale**: FR-002 exige persistencia en disco sin BD ni servicio externo. La escritura atómica
evita corromper el banco si el proceso muere a mitad (edge case "JSON corrupto"), y la copia da
marcha atrás ante un guardado erróneo. Mantener el almacén fuera de `src/` deja claro que **no** es
código que se compile.

**Alternatives considered**:
- *Guardar dentro de `src/content/`*: mezcla datos editables con código y arriesga que un build lea
  el borrador; rechazado.
- *`localStorage`*: no es un fichero en disco, atado al navegador y no versionable.
- *SQLite*: BD real; la constitución pide v1 sin BD y el alcance es 1 usuario.

## R4 · Reutilización de la validación (FR-012, FR-017, FR-020)

**Decision**: se importa **`SituacionSchema`** (y los catálogos de `modalidades.ts`) desde
`src/content/schema.ts`. El panel valida cada situación al guardar; el **volcado** valida además el
**banco completo** reutilizando `BancoContenidoSchema` (con los `condicionales`, `variantes` y
`textosTarjeta` vigentes), de modo que las reglas cruzadas —id único, flag referenciada inexistente,
variante fuera de catálogo, modalidad/variante incompatibles, existencia de una situación común por
momento/tipo— se comprueban con el **mismo** código que el build.

**Rationale**: FR-020 prohíbe duplicar reglas. Es el punto donde más se rompería el proyecto si se
reimplementan las comprobaciones.

**Alternatives considered**:
- *JSON Schema aparte*: duplicaría la fuente de verdad y se desincronizaría.
- *Validar solo al volcar*: daría feedback tardío y podría persistir datos inválidos (FR-012 lo
  prohíbe).

## R5 · Importación del banco actual (FR-022)

**Decision**: comando `npm run panel:importar` (`tsx scripts/panel-importar.ts`) que importa los
seis módulos de `src/content/decisiones/**`, extrae las situaciones y las escribe en el almacén,
previa copia de seguridad. El endpoint `POST /api/panel/importar` llama a la **misma** función para
que el panel pueda ofrecerlo cuando no encuentra almacén.

**Rationale**: arranca el almacén con las 27 situaciones sin perder nada (SC-001/SC-009) y da una
vía de re-sincronización.

**Alternatives considered**:
- *Importar automáticamente al abrir*: sorprendente y difícil de revertir; el spec eligió el comando
  explícito (Q de clarificación 2026-09-20).
- *Copiar el `.ts` a mano*: propenso a errores y contradice FR-016.

## R6 · Determinismo e idempotencia del volcado (SC-006)

**Decision**: el generador agrupa las situaciones por `momento`+`tipo` (un fichero por combinación),
las **ordena por `id`** y serializa con formato fijo (2 espacios, comillas dobles, coma final,
salto de línea final) ya compatible con Biome. Un test genera dos veces y compara byte a byte.

**Rationale**: FR-019/SC-006 exigen que el mismo almacén produzca el mismo contenido. Sin orden
estable, un `git diff` ruidoso haría inútil versionar los `.ts` generados.

**Alternatives considered**:
- *Preservar el orden de inserción del JSON*: sensible a reordenaciones sin cambios reales.
- *Delegar el formato a `biome format` después de escribir*: válido, pero hacer la salida ya
  canónica evita una escritura extra y hace el test trivial.

## R7 · Verificación

**Decision**: tests Vitest de `src/panel/`:
1. **Round-trip sin pérdida** (SC-005): `importar(banco actual)` → almacén → `agrupar` produce
   exactamente las mismas situaciones (deep-equal).
2. **Idempotencia** (SC-006): generar dos veces da el mismo texto.
3. **Rechazo** (SC-003/SC-004): una situación inválida (menos de 2 opciones, id duplicado,
   `efectos` sin `excepcion`, variante fuera de catálogo) falla con mensaje legible y **no** escribe.
4. **Guard** (SC-007): fuera de desarrollo, la página/endpoints devuelven 404.

**Rationale**: cubre los criterios medibles sin E2E, que no aporta valor en una herramienta local de
un usuario.

## R8 · Qué se versiona (FR-021)

**Decision**: se versionan el **código del panel** y el **almacén** `content-admin/data/situaciones.json`;
se ignoran las **copias de seguridad** (`content-admin/data/backups/`). Los `.ts` generados también
se versionan como artefacto de build y quedan marcados como **no editar a mano** (cabecera de
fichero generada).

**Rationale**: el JSON es la fuente de verdad (decisión registrada) y los `.ts` son su salida
compilable; commitear ambos mantiene el build (`npm run check`, Netlify) sin pasos previos. La
cabecera «GENERADO — no editar» evita ediciones manuales que el siguiente volcado borraría.

**Alternatives considered**:
- *Ignorar los `.ts` generados*: obligaría a ejecutar el volcado antes de cada build y de `check`;
  más frágil.
- *Ignorar el almacén*: contradice que sea la fuente de verdad.
