# Research: Formulario del panel: secciones plegables y rediseño

**Feature**: `026-form-redesign` · **Date**: 2026-10-05

Resuelve las incógnitas del Technical Context y fija las decisiones de diseño. No quedan
`NEEDS CLARIFICATION` (la spec se cerró con decisiones explícitas).

---

## R1 · Mecanismo de plegado: `<details>`/`<summary>` nativo

**Decision**: usar el elemento nativo `<details>` (sin `open`) + `<summary>` para cada sección
plegable. El estado "plegado por defecto" es el comportamiento nativo (sin atributo `open`).

**Rationale**:
- Accesible por defecto: teclado (Enter/Espacio) y expuesto a lectores de pantalla (role `group`,
  estado expandido) sin ARIA manual (FR-006, SC-002).
- Sin JS extra ni estado que mantener; el contenido no se desmonta al plegar, así que los valores
  vinculados se conservan (FR-011).
- Cumple "plegado por defecto" y "no se abre solo por tener contenido" (FR-005) sin lógica.

**Alternatives considered**:
- Botón + `aria-expanded` + `hidden`: más control visual, pero más código, más superficie de
  accesibilidad y hay que gestionar el foco; se descarta por YAGNI.
- Librería de acordeón: dependencia nueva; prohibido por FR-010.

---

## R2 · Indicador de contenido

**Decision**: el `<summary>` muestra un punto/etiqueta cuando la sección tiene valores, calculado en
cada formulario a partir de los datos vinculados: `modalidades.length > 0`, `variantes.length > 0`,
`flags.length > 0`. El indicador es decorativo (`aria-hidden`) con un texto accesible asociado
(p. ej. `title="Tiene contenido"`).

**Rationale**: FR-004 y el edge case "sección plegada con contenido oculto": hay que avisar sin abrir
la sección. El cálculo es trivial y no cambia el modelo.

**Alternatives considered**:
- No mostrar indicador: se pasarían por alto valores marcados; rechazado.
- Abrir la sección si tiene contenido: contradice la decisión del usuario (FR-005).

---

## R3 · Componente reutilizable `Seccion.svelte`

**Decision**: un componente `Seccion.svelte` con props `titulo: string` y `tieneContenido?: boolean`,
que renderiza `<details><summary>…</summary><div>{@render children()}</div></details>`. El contenido
se pasa como **snippet** (Svelte 5).

**Rationale**: el patrón de plegado se repite en situación, condicional y opción; un único componente
evita duplicar marcado, estilos y accesibilidad. Encaja con la simplicidad (principio V).

**Alternatives considered**:
- Repetir `<details>` en cada formulario: duplicación y riesgo de divergencia; rechazado.
- Slot por defecto con `slot` (API Svelte 4): Svelte 5 usa snippets; se usa `children`.

---

## R4 · Qué se pliega y dónde

**Decision**:
- **Situación** y **condicional**: secciones "Modalidades" y "Variantes" plegadas.
- **Opción**: sección "Flags" plegada (es donde vive el `SelectorFlags` de flags).
- El resto (título, texto, minAno, peso, efectos, requisito) queda visible.

**Rationale**: decisión del usuario (Q1). El `consume` ya no existe tras la 025, así que no hay
sección de consumo.

**Alternatives considered**:
- Plegar también texto/minAno/peso/efectos: lo descartó el usuario (Q1, opción A).

---

## R5 · Rediseño visual: identidad propia del formulario (solo CSS/marcado)

**Decision**: rediseño con CSS dentro de los componentes, con una **identidad visual propia** del
formulario (Q1: opción B), **distinta** de las tablas del panel: paleta moderna (no la del panel),
tipografía con **fuentes del sistema** (Q2: opción A, sin cargar ficheros), tarjetas de sección con
encabezado claro, `summary` con chevron y foco visible, rejilla responsive que colapsa a una columna en
móvil y jerarquía tipográfica consistente.

**Rationale**: FR-007/FR-012/FR-013. Mantener el CSS local (dentro de los componentes del formulario)
evita introducir una capa de diseño para una herramienta mono-usuario, y usar fuentes del sistema
respeta "sin dependencias nuevas" (FR-010).

**Alternatives considered**:
- Mantener la paleta del panel: lo descartó el usuario (eligió identidad nueva).
- Web font concreta: añade un asset; el usuario prefirió fuentes del sistema.
- Extraer tokens a `src/ui/` (fase 2 documentada): prematuro para el panel; YAGNI.
- Framework CSS: dependencia nueva; prohibido.

---

## R6 · Alcance: solo el formulario

**Decision**: se rediseñan `FormularioSituacion`, `FormularioCondicional`, `FormularioOpcion`,
`SelectorFlags` y `EditorRequisito`. **No** se tocan las tablas (`TablasMomentos`) ni las vistas de
detalle (`DetalleSituacion`, `DetalleCondicional`).

**Rationale**: decisión del usuario (Q3, opción A) y FR-007.

**Alternatives considered**:
- Rediseñar toda la isla: fuera de alcance; rechazado.

---

## R7 · Validación y tests

**Decision**: no se añaden tests de componente (no hay herramienta configurada). La validación es:
`astro check` (compila los `.svelte`), `biome check` (`.ts`), `vitest` (sin regresiones) y los
escenarios manuales del `quickstart.md`.

**Rationale**: coherencia con la 024 (R8) y YAGNI para una herramienta local. El comportamiento no
cambia, así que no hay lógica nueva que testear.

**Alternatives considered**:
- Montar un runner de tests de componentes (p. ej. `vitest` + `@testing-library/svelte`): dependencia
  y setup nuevos sin valor proporcional; rechazado.

---

## R8 · Relación con la 025

**Decision**: la 026 asume que la 025 ya retiró el `consume` manual. No se contempla ninguna sección
de consumo; si el campo volviera, se plegaría igual que `flags`.

**Rationale**: dependencia declarada en la spec; evita trabajo sobre un campo inexistente.
