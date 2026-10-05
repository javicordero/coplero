# Research: Rediseño integral del panel de contenido

**Feature**: `027-panel-redesign` · **Date**: 2026-10-05

Resuelve las incógnitas del Technical Context y fija las decisiones. No quedan `NEEDS CLARIFICATION`.

---

## R1 · Capa de tokens: hoja global `estilos.css`

**Decision**: centralizar la identidad en `src/panel-ui/estilos.css`, con CSS custom properties en
`:root` (prefijo `--panel-*`: `--panel-primary`, `--panel-primary-hover`, `--panel-surface`,
`--panel-border`, `--panel-text`, `--panel-muted`, `--panel-hover`, `--panel-danger`, `--panel-radius`,
`--panel-gap`) y la base (fondo, color, tipografía del sistema). Se importa **una vez** en
`src/pages/panel.astro`.

**Rationale**:
- Svelte **scoping**: los estilos de cada componente son locales; definir los tokens en `:root` (global)
  permite que **todos** los componentes los hereden sin duplicarlos (FR-002, SC-004).
- `panel.astro` es la única página que monta la isla del panel: importar ahí la hoja global es el punto
  único natural.
- Sin dependencias ni build extra: es CSS plano.

**Alternatives considered**:
- Definir tokens en `Panel.svelte` con `:global(:root)`: funciona, pero mezcla estilos globales en un
  componente y complica el orden de carga; se prefiere la hoja dedicada.
- Tokens por componente (como en la 026): es lo que genera la incoherencia actual; descartado.
- Extraer a `src/ui/` (tokens del proyecto): el panel es solo-dev y no comparte identidad con el juego;
  YAGNI.

---

## R2 · Unificar la identidad de la 026

**Decision**: los componentes del formulario (rediseñados en la 026) dejan de definir sus propias
variables `--f-*` y pasan a consumir `var(--panel-*)`. `Seccion`, `FormularioSituacion`,
`FormularioCondicional`, `FormularioOpcion`, `SelectorFlags` y `EditorRequisito` se actualizan para usar
la misma identidad que el resto del panel.

**Rationale**: es el objetivo central (FR-001): una sola identidad. Mantener `--f-*` junto a `--panel-*`
duplicaría valores y volvería a divergir.

**Alternatives considered**:
- Mantener `--f-*` como alias global de `--panel-*`: válido, pero añade un nombre redundante; se prefiere
  un único nombre canónico.

---

## R3 · Tablas en móvil: scroll horizontal en contenedor propio

**Decision**: envolver cada `<table>` en un `<div class="tabla-scroll">` con `overflow-x: auto` y
`-webkit-overflow-scrolling: touch`, de modo que la tabla se desplace **dentro de su contenedor** sin
que la **página** desborde.

**Rationale**: decisión del usuario (Q2). Cumple FR-004/FR-006: con muchas columnas se consulta la tabla
desplazándola, y la página nunca desborda a 360 px.

**Alternatives considered**:
- Tarjetas apiladas (filas → tarjetas): lo descartó el usuario.
- Ocultar columnas en móvil: pierde información; descartado.

---

## R4 · Rediseño de la carcasa (con foco en móvil)

**Decision**: rediseñar `Panel.svelte` con los tokens: cabecera con título y contador, **conmutador de
vista** tipo *tabs* (situaciones/condicionales) con estado activo claro, botón principal (nueva
situación/condicional), y estados de **carga, error y vacío** con la identidad común. En **móvil** la
cabecera se **apila** (título y contador arriba; acciones y conmutador a ancho completo) y en escritorio
vuelve a una fila (Q3). El fondo y la tipografía base se mueven a `estilos.css` (se elimina el
`:global(body)` de `Panel.svelte`).

**Rationale**: FR-003/FR-007 y la petición explícita de que el encabezado y el resto se vean bien en
móvil. Centralizar el fondo en la hoja global evita el hack `:global(body)`.

**Alternatives considered**:
- Mantener la cabecera actual: no cumple "reconfigurar el diseño"; descartado.
- Barra compacta con iconos en móvil: menos claro para una herramienta con dos acciones y un conmutador; descartado.

---

## R5 · Rediseño de las vistas de detalle

**Decision**: `DetalleSituacion.svelte` y `DetalleCondicional.svelte` se rediseñan con los tokens:
tarjeta con cabecera, lista de campos (`dl`) legible y tarjetas de opción; mismos estados de foco.

**Rationale**: FR-005. Es la vista más usada tras el listado y hoy queda con el estilo antiguo.

**Alternatives considered**:
- Dejarlas como están: rompe la coherencia; descartado.

---

## R6 · Sin modo oscuro

**Decision**: una sola identidad clara; no hay toggle ni tema del sistema.

**Rationale**: decisión del usuario (Q1). Duplicar los estilos para un tema oscuro no aporta a una
herramienta interna.

**Alternatives considered**:
- Toggle o `prefers-color-scheme`: descartado por alcance.

---

## R7 · Alcance: solo el panel

**Decision**: se tocan `src/pages/panel.astro` y `src/panel-ui/**`. **No** se toca el juego (`/jugar`),
las páginas públicas ni el motor/contenido.

**Rationale**: FR-011 y el principio IV (el juego mantiene su HTML estático con 0 kB de JS y su diseño).

**Alternatives considered**:
- Llevar la identidad al juego: fuera de alcance; descartado.

---

## R8 · Validación y tests

**Decision**: no se añaden tests de componente. Validación: `astro check` (compila los `.svelte`),
`biome check` (`.ts`), `vitest` (sin regresiones) y los escenarios del `quickstart.md`.

**Rationale**: coherencia con 024/026; es solo presentación y no hay lógica nueva.

**Alternatives considered**:
- Runner de tests de componentes: dependencia/setup sin valor proporcional; descartado.
