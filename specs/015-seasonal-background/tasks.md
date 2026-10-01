# Tasks: Fondo estacional del juego (verano / febrero / resultado)

**Input**: Design documents from `/specs/015-seasonal-background/` (tres estilos: verano claro, febrero oscuro con lluvia real, resultado teatro/escenario; sol y luna en la esquina derecha).

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/fondo.md, quickstart.md

**Tests**: Cambio de presentación (no toca `engine` ni `content`), pero sí `src/ui/` (tokens). V-09 ya cubre verano y febrero; el teatro reutiliza el tema oscuro (sin parejas nuevas). E2E opcional.

**Organization**: tareas agrupadas por historia de usuario para implementación y validación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: historia de usuario (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: confirmar que no hace falta andamiaje nuevo.

- [X] T001 Confirmar que no se añaden dependencias: `package.json` intacto y baseline de `dist/` anotado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tokens de teatro que el estilo de resultado necesita. La paleta clara de verano y `--c-acento-texto` ya existen en `src/ui/`.

**⚠️ CRITICAL**: sin los tokens de teatro no se puede pintar el tercer estilo.

- [X] T002 [P] En `src/ui/tokens.css`: añadir los tokens `--c-teatro-telon` (granate del telón) y `--c-teatro-foco` (cálido del foco), hex de 6 dígitos en minúsculas, junto a la paleta de verano.
- [X] T003 [P] En `src/ui/tokens.ts`: reflejar `--c-teatro-telon` y `--c-teatro-foco` en `COLORES` (y en `COLOR` como `teatroTelon`/`teatroFoco`), con el mismo valor (paridad V-03).

**Checkpoint**: tokens de teatro disponibles; V-03 y V-04 verdes.

---

## Phase 3: User Story 1 - Sentir la estación al jugar (Priority: P1) 🎯 MVP

**Goal**: verano claro (cielo, sol en la esquina derecha, arena) con texto oscuro; febrero oscuro (luna en la esquina derecha, lluvia real) con texto claro; resultado con estilo teatro/escenario.

**Independent Test**: abrir `/jugar`, ver una decisión de verano, una de febrero y el resultado del COAC, y comprobar que cada pantalla tiene su estilo y que sol/luna están a la derecha.

### Implementation for User Story 1

- [X] T004 [US1] En `src/juego/Juego.svelte`, mover el `radial-gradient` del **sol** (verano) y de la **luna** (febrero) a la **esquina superior derecha** (`at 82% 10%` en vez del centro).
- [X] T005 [US1] En `src/juego/Juego.svelte`, sustituir la lluvia actual por **gotas reales**: elementos finos (1 px) con gradiente `transparent → pálido`, escalonados (distintos `left`, `animation-delay` y `animation-duration`) y animados por **un único `@keyframes`** de caída con `transform`, sin JS ni imágenes.
- [X] T006 [US1] En `src/juego/Juego.svelte`, añadir el estilo `main[data-pantalla="resultado"]` de **teatro/escenario**: escenario oscuro + foco de luz (cono) + telón (pliegues granate en los bordes), usando `var(--c-teatro-*)`.
- [X] T012 [US1] Crear `src/juego/pantallas/FondoVerano.svelte` (escena de playa decorativa en **SVG inline**: sol con rayos, nubes, gaviotas, oleaje, orilla ondulada, arena moteada, conchas y sombrilla) y renderizarla en `Juego.svelte`; sustituir el gradiente cielo→arena por bandas cielo→mar con línea de horizonte; añadir los tokens `--c-verano-*` decorativos (paridad V-03, sin hex, V-04). Ver D7.
- [X] T013 [US1] Crear `src/juego/pantallas/FondoFebrero.svelte` (escena de carnaval en **SVG inline**: luna como círculo sin halo, estrellas, nubes oscuras, serpentinas, antifaces, plumeros y Teatro Falla con camino) y renderizarla en `Juego.svelte`; quitar el halo de la luna del `radial-gradient`; añadir los tokens `--c-invierno-*`, `--c-carnaval-*` y `--c-falla-*` (paridad V-03, sin hex, V-04). Ver D8.

**Checkpoint**: los tres estilos son visibles y distintos; la isla sigue sin lógica de juego.

---

## Phase 4: User Story 2 - El fondo no estorba (Priority: P2)

**Goal**: los estilos acompañan sin romper contraste, peso ni movimiento.

**Independent Test**: `npm run check` verde; AA en verano (texto oscuro) y febrero/resultado (texto claro); el peso no crece; la lluvia se congela con reducción de movimiento.

### Implementation for User Story 2

- [X] T007 [US2] En `src/ui/__tests__/tokens.test.ts`, confirmar que V-09 sigue cubriendo verano y febrero; el teatro reutiliza los pares oscuros (sin parejas nuevas) y V-03 verifica la paridad de los tokens de teatro.
- [X] T008 [US2] Confirmar que la lluvia y el cambio de estilo respetan `prefers-reduced-motion` (neutralización global de `src/ui/base.css`); la lluvia usa `transform`, nunca propiedades de layout.

**Checkpoint**: contraste AA y movimiento verificados.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: cierre y validación integral.

- [X] T009 [P] Ejecutar `npm run check` y `npm run build`; verificar `package.json` sin cambios y bundle de la isla sin crecimiento relevante.
- [ ] T010 [P] (Opcional) Añadir assert Playwright en `tests/e2e/` que compruebe `main[data-momento="verano"]`, `main[data-momento="febrero"]` y `main[data-pantalla="resultado"]`, y que las estáticas no los cargan.
- [X] T011 [P] Recorrer la validación de `specs/015-seasonal-background/quickstart.md` (manual: verano/febrero/resultado, lluvia, sol/luna a la derecha, 320 px, reducción de movimiento, estáticas).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — inmediato.
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las historias.
- **User Stories (Phase 3-4)**: dependen de Foundational.
- **Polish (Phase 5)**: depende de US1 y US2.

### User Story Dependencies

- **User Story 1 (P1)**: tras Foundational; sin dependencia de US2.
- **User Story 2 (P2)**: tras Foundational; verifica los mismos tokens; independiente del componente de US1.

### Within Each User Story

- Tokens (Foundational) antes de aplicar (US1) o verificar (US2).
- T004/T005/T006 comparten `Juego.svelte`: se ejecutan en secuencia (mismo fichero).

### Parallel Opportunities

- T002 y T003 en paralelo (ficheros distintos; V-03 detecta drift).
- T007 en paralelo con T004-T006 (test vs componente).
- T009, T010, T011 en paralelo al final.

---

## Parallel Example: User Story 1 + 2 (tras Foundational)

```bash
# Estilos en la isla (US1):
Task: "Mover sol/luna a la derecha en src/juego/Juego.svelte"
Task: "Lluvia real en src/juego/Juego.svelte"
Task: "Estilo teatro en src/juego/Juego.svelte"

# Verificación (US2):
Task: "Confirmar V-09/V-03 en src/ui/__tests__/tokens.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 → T002/T003 (tokens) → T004/T005/T006 (estilos en la isla).
2. **STOP y VALIDAR**: ver los tres estilos y sol/luna a la derecha.
3. Demo si está listo.

### Incremental Delivery

1. Setup + Foundational → tokens listos.
2. US1 → tres estilos visibles (MVP).
3. US2 → contraste y movimiento garantizados.
4. Polish → validación integral.

### Parallel Team Strategy

Tras Foundational: uno aplica los estilos (US1) y otro verifica contraste (US2); convergen en la validación integral.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- [Story] mapea la tarea a su historia.
- Sin literales hex fuera de `src/ui/` (V-04); sin dependencias nuevas; sin cambios en `engine`/`content`.
- **Reconciliación**: el código ya tiene paleta clara + `--c-acento-texto` y fondos verano/febrero con sol/luna centrados y lluvia de "persiana"; T002-T006 los ajustan (teatro, posición a la derecha, lluvia real).
- Commitear tras cada tarea o grupo lógico; no commitear sin petición explícita.
