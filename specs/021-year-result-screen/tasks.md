# Tasks: Modo dev y rediseño de la pantalla de resultado del año

**Input**: Design documents from `/specs/021-year-result-screen/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Incluidos. El plan y la puerta de calidad (`npm run check`, Principio III) fijan los tests unit de fixtures/etiqueta/rosetas y los E2E del modo dev, el indicador, las rosetas y la accesibilidad.

**Organization**: Tareas agrupadas por historia de usuario. Las fases 1–4 ya se completaron; la fase 5 refleja la nueva dirección visual (panel de creación + rosetas).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Rutas de fichero exactas en cada tarea

## Path Conventions

- **Proyecto único**: `src/` y `tests/` en la raíz del repositorio.

---

## Phase 1: Setup (Shared Infrastructure) — ✅ completada

- [x] T001 [P] Revisar el patrón dev existente (`src/juego/dev/fixturesFin.ts` y la guarda `import.meta.env.DEV` en `src/juego/Juego.svelte`)
- [x] T002 [P] Confirmar en `package.json` que no se añaden dependencias ni rutas nuevas

---

## Phase 2: Foundational (Blocking Prerequisites) — ✅ completada

- [x] T003 [P] Ampliar `Indicador.momento` a `Momento | "resultado"` en `src/juego/presentacion.ts`
- [x] T004 [P] Añadir `resultadoInicial?: { temporada: Temporada; ano: number }` a `OpcionesJuego` en `src/juego/estado.svelte.ts`

---

## Phase 3: User Story 1 - Abrir la pantalla de resultado en desarrollo (Priority: P1) — ✅ completada

- [x] T005 [P] [US1] Casos de ejemplo en `src/juego/dev/fixturesResultado.ts`
- [x] T006 [P] [US1] Dispatcher dev `arranqueDevDesdeUrl` en `src/juego/dev/arranque.ts`
- [x] T007 [US1] Cablear `src/juego/Juego.svelte` (arranque dev, render sin `partida`, `data-ano` y respaldo del indicador)
- [x] T008 [P] [US1] Test unit de fixtures y URL dev en `src/juego/__tests__/fixturesResultado.test.ts`
- [x] T009 [US1] E2E del modo dev en `tests/e2e/resultado-dev.spec.ts`

---

## Phase 4: User Story 2 - El indicador dice «Resultado» (Priority: P1) — ✅ completada

- [x] T010 [P] [US2] Etiqueta `resultado → "Resultado"` en `src/juego/presentacion.ts`
- [x] T011 [US2] Derivar el indicador `{ ano, momento: "resultado" }` en `src/juego/Juego.svelte`
- [x] T012 [P] [US2] Test unit de la etiqueta en `src/juego/__tests__/presentacion.test.ts`
- [x] T013 [US2] Actualizar INV-5 en `tests/e2e/layout-estable.spec.ts` a `/Resultado/i`

---

## Phase 5: User Story 3 - Panel de creación y rosetas (Priority: P2)

**Goal**: El resultado deja la hoja clara de acta y adopta el panel de las pantallas de creación (tema oscuro, superficie/borde/sombra, etiquetas en mayúsculas), con las distinciones en una fila (nombre encima, roseta debajo) y el botón «Continuar» dentro del panel.

**Independent Test**: recorrer los casos dev a 320 px y 390 px: tema oscuro, panel, distinciones con roseta y nombre, botón dentro del panel, sin scroll horizontal y `axe` sin violaciones graves.

### Implementation for User Story 3

- [x] T014 [P] [US3] Compartir `ROSETAS: Record<PremioTipo, string>` en `src/juego/presentacion.ts` y usarlo en `src/juego/Tarjeta.svelte` (retirar el mapa local)
- [x] T015 [US3] Rediseñar `src/juego/pantallas/Resultado.svelte`: panel oscuro (superficie/borde/sombra, etiquetas en mayúsculas), etiqueta de llegada, fase, puesto, distinciones en una fila (nombre encima, roseta debajo) y botón «Continuar» dentro del panel (depende de T014)
- [x] T016 [P] [US3] Retirar el bloque `main[data-pantalla="resultado"]` (tema claro de acta) de `src/juego/Juego.svelte`, dejando el tema oscuro por defecto
- [x] T017 [P] [US3] Ampliar `src/juego/__tests__/presentacion.test.ts` con `ROSETAS` (cubre los tres tipos)
- [x] T018 [US3] Actualizar `tests/e2e/resultado-dev.spec.ts`: distinciones en fila con nombre y roseta, botón dentro del panel, «Continuar» inerte, 320 px y `axe` (depende de T015, T016)
- [x] T019 [US3] No regresión del bucle y del layout en `tests/e2e/jugar.spec.ts` y `tests/e2e/layout-estable.spec.ts`

**Checkpoint**: La pantalla tiene el aspecto acordado y las tres historias funcionan.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T020 [P] Verificar que el modo dev no entra en producción: `npm run build` y comprobar que `dev=resultado` no tiene efecto en el bundle
- [x] T021 Ejecutar `npm run check` y validar los escenarios de `specs/021-year-result-screen/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: completadas.
- **US1 (Phase 3)** y **US2 (Phase 4)**: completadas.
- **US3 (Phase 5)**: depende de Foundational y de T014; es el trabajo pendiente.
- **Polish (Phase 6)**: tras US3.

### User Story Dependencies

- **US1 (P1)**: completada.
- **US2 (P1)**: completada.
- **US3 (P2)**: depende de T014 (rosetas compartidas) y del arranque dev de US1 para iterar.

### Within User Story 3

- T014 (rosetas) antes de T015 (Resultado) y T017 (test).
- T015 y T016 antes de T018 (E2E).
- T019 como no regresión.

### Parallel Opportunities

- T014, T016 y T017 pueden ir en paralelo (ficheros distintos).
- T015 depende de T014.
- T018 depende de T015 y T016.
- T020 en paralelo con la preparación de T021.

---

## Implementation Strategy

### Incremental Delivery

1. Setup + Foundational + US1 + US2 → base lista (hecho).
2. US3 → panel de creación + rosetas + botón dentro.
3. Polish → no regresión y quickstart.

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes.
- `src/juego/Juego.svelte` lo tocan US1, US2 y US3 en fases distintas: no ejecutar en paralelo entre historias.
- La dirección visual anterior (hoja clara de acta) queda sustituida por el panel de creación.
