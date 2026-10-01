# Phase 0 — Research: Entrada directa al juego

**Feature**: `018-direct-game-entry` | **Date**: 2026-10-01

No hay `NEEDS CLARIFICATION` en el Technical Context: el stack (Astro + isla Svelte 5), el almacenamiento (`localStorage`) y el testing (Vitest + Playwright) ya existen. La investigación se centra en las decisiones de diseño del flujo.

## R1. Dónde se decide la pantalla de arranque

**Decisión**: la decisión se toma en la inicialización de `crearJuego` (`src/juego/estado.svelte.ts`), a partir del resultado de `cargar(almacen)` que ya se ejecuta.

**Rationale**:
- `cargar` ya valida el sobre y devuelve `{ partida, descartado }`; no hace falta lógica nueva de lectura.
- El estado de la isla ya es reactivo; basta con elegir la pantalla inicial con el mismo dato que alimenta `estadoGuardado`.
- Mantiene el determinismo y la separación: es pura presentación, el motor no participa.

**Alternativas consideradas**:
- *Decidir en `Juego.svelte` con un `$effect` de montaje*: introduce un parpadeo (se pinta una pantalla y luego salta a otra) y duplica la lógica. Descartada.
- *Enrutar desde la portada con query/hash*: exigiría JS en la portada (rompe 0 kB) o URLs diferenciadas. Descartada por la clarificación (la portada no detecta guardado).

## R2. Reutilizar la pantalla de inicio o crear una nueva

**Decisión**: renombrar `Intro.svelte` a `Reanudar.svelte` y reconvertirla en pantalla **condicional** de reanudación (dos acciones: continuar / nueva partida).

**Rationale**:
- Conserva el lenguaje visual y los textos ya aprobados (menor riesgo de diseño).
- El nombre `Intro` deja de describir su función (ya no es la entrada obligatoria); `Reanudar` es más honesto.
- La pantalla de reanudación no es "prepartida" (no comparte el marco de cabecera fija de crear/modalidad/variante); se mantiene centrada como el inicio actual.

**Alternativas consideradas**:
- *Mantener `Intro.svelte` con el mismo nombre*: menor diff, pero nombre engañoso. Descartada por claridad.
- *Pantalla de reanudación nueva desde cero*: duplica estilos y textos. Descartada.

## R3. «Nueva partida» sin destruir el guardado (FR-007)

**Decisión**: `empezar()` lleva a `crear-personaje` sin llamar a `borrar()`. El guardado anterior solo se sobrescribe cuando la nueva partida se persiste (al elegir variante), mediante `guardar()`.

**Rationale**:
- En una visita con partida en curso, `partida` es `null` en memoria hasta que se pulsa «Continuar»; por tanto «Nueva partida» no necesita descartar nada: basta con no cargar.
- Si el jugador abandona antes de crear la nueva partida, el sobre sigue intacto y se le vuelve a ofrecer reanudar.
- Evita añadir un diálogo de confirmación (se mantiene el objetivo de quitar fricción).

**Alternativas consideradas**:
- *Borrar al pulsar «Nueva partida»*: destruye progreso ante un clic accidental. Descartada en clarificación.
- *Confirmación modal*: añade una pantalla/estado extra. Descartada en clarificación.

## R4. Descarte silencioso (derogación de 005)

**Decisión**: si el sobre no es recuperable, `cargar` lo elimina (comportamiento actual) y el juego arranca en `crear-personaje` **sin** mostrar el aviso puntual. Se retira `aviso` del estado y `AVISO_GUARDADO_DESCARTADO` de presentación.

**Rationale**:
- Con el arranque directo, la pantalla que alojaba el aviso puede no existir; mostrarlo obligaría a inventar un sitio nuevo.
- Decisión explícita del usuario para simplificar el arranque.

**Alternativas consideradas**:
- *Mostrar el aviso en la creación de personaje*: añade ruido a la primera pantalla. Descartada en clarificación.
- *Mantener el aviso solo en la pantalla de reanudación*: la mayoría de descartes ocurren sin partida recuperable, así que casi nunca se vería. Descartada.

**Impacto de gobernanza**: es un cambio de una decisión **cerrada** (feature 005). Debe registrarse en `docs/registro/decisiones-cerradas.md` y anotarse en `docs/registro/decisiones-pendientes.md`; no se resuelve en silencio (constitución, Flujo de desarrollo).

## R5. Carrera terminada (FR-005)

**Decisión**: una carrera terminada guardada se trata como `ninguno` a efectos de arranque: se va directo a `crear-personaje` y no se ofrece reanudar. El sobre se conserva en `localStorage` hasta que se cree una partida nueva.

**Rationale**:
- Decisión explícita del usuario (opción C).
- La tarjeta final sigue disponible por su enlace `/r/[codigo]` (compartible), que no depende del guardado local.

**Alternativas consideradas**:
- *Abrir la tarjeta automáticamente*: muestra una pantalla que el usuario no pidió. Descartada.
- *Pantalla de reanudación con «Ver resultado»*: contradice la decisión del usuario. Descartada.

## R6. Tests afectados y estrategia

**Decisión**:
- `crearPersonaje` en `tests/e2e/apoyo/juego.ts` deja de pulsar `empezar`; el flujo arranca en `crear-personaje`.
- Se retiran los clics en `empezar` de `layout-previo.spec.ts` y `chrome.spec.ts`.
- `src/juego/__tests__/estado.test.ts` se actualiza: arranque según guardado, sin `aviso`, `reiniciar` → `crear-personaje`, renombrado `intro` → `reanudar`.
- Nuevo `entrada-directa.spec.ts` cubre los tres arranques y el preservado del guardado.

**Rationale**: los tests actuales asumen la pantalla intermedia; hay que alinearlos con el nuevo contrato para evitar falsos negativos.

**Alternativas consideradas**:
- *Dejar `empezar` como alias invisible*: deuda técnica y tests engañosos. Descartada.

## R7. Rango de la pantalla de reanudación en el layout

**Decisión**: la pantalla de reanudación se renderiza como las pantallas "no previas" (centrada verticalmente en `main`), no como las "previas a partida" con cabecera anclada.

**Rationale**: tiene poco contenido (dos botones) y no necesita el marco de cabecera fija de crear/modalidad/variante; centrarla da una apariencia estable y ya es el comportamiento del inicio actual.

**Alternativas consideradas**:
- *Tratarla como prepartida*: la cabecera de pantalla fija está pensada para formularios/listas; forzarla aquí desplaza los botones sin motivo. Descartada.
