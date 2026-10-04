# Tasks: Panel local de situaciones y volcado al juego

**Input**: Design documents from `/specs/009-content-admin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sí. La constitución (Principio III) exige verificación determinista para cambios de
`content`, y el plan fija los tests del panel. No se añaden E2E (herramienta local de un usuario).

**Organization**: tareas agrupadas por historia de usuario. US1 (ver) y US2 (CRUD) son P1; US3
(volcado) es P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ir en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3
- Cada tarea incluye la ruta exacta del fichero

## Path Conventions

Proyecto único Astro: `src/`, `scripts/`, `content-admin/` en la raíz. Ver `plan.md` §Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: estructura mínima del almacén y comandos.

- [x] T001 [P] Crear `content-admin/data/.gitkeep` y añadir `content-admin/data/backups/` a `.gitignore`
- [x] T002 [P] Añadir los scripts `"panel:importar": "tsx scripts/panel-importar.ts"` y `"panel:volcar": "tsx scripts/panel-volcar.ts"` en `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: guard, esquema, almacén e importación. **Bloquea** todas las historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta cerrar esta fase.

- [x] T003 [P] Crear `src/panel/guard.ts` con `esDesarrollo()` (`import.meta.env.DEV`) y `respuesta404()` según `contracts/panel.md`
- [x] T004 [P] Escribir `src/panel/__tests__/guard.test.ts`: fuera de desarrollo devuelve 404; en desarrollo no
- [x] T005 Crear `src/panel/esquema.ts`: `AlmacenSchema` (strict) con `version: z.literal(1)`, `situaciones: z.array(SituacionSchema)` y rechazo de ids de situación duplicados, reutilizando `src/content/schema.ts`
- [x] T006 Crear `src/panel/almacen.ts` con `RUTA_ALMACEN`, `existeAlmacen()`, `leerAlmacen()`, `escribirAlmacen()` (validar → copia de seguridad → escritura atómica) y `copiaDeSeguridad()`, más `ErrorAlmacen`, según `contracts/almacen.md`
- [x] T007 Escribir `src/panel/__tests__/almacen.test.ts`: almacén inexistente → vacío; inválido → no escribe y lanza; escritura crea backup; JSON corrupto → error legible sin perder el fichero bueno
- [x] T008 Crear `src/panel/importador.ts` con `leerBancoActual()` (los 4 módulos de `src/content/decisiones/**`) e `importarBancoActual()` (backup → lectura → escritura ordenada por `id`), según `contracts/importador.md`
- [x] T009 Crear `scripts/panel-importar.ts` que llame a `importarBancoActual()` e imprima el número de situaciones importadas
- [x] T010 Escribir `src/panel/__tests__/importador.test.ts`: importar el banco actual produce un almacén con **todas** las situaciones (sin pérdida, FR-017), ordenadas por `id` y derivando el total de `bancoContenido` (sin hardcodear la cifra)
- [x] T011 Crear `src/pages/panel.astro` (`prerender = false`, guard 404, `noindex,nofollow`) que monte `<Panel client:load />` desde `src/panel-ui/Panel.svelte`
- [x] T012 Crear `src/panel-ui/Panel.svelte` (contenedor mínimo, runas Svelte 5)

**Checkpoint**: `npm run panel:importar` llena el almacén y `/panel` carga vacío sin errores.

---

## Phase 3: User Story 1 - Ver el banco por momento (Priority: P1) 🎯 MVP

**Goal**: tablas por momento con recuento y situación + opción 1/2, y detalle de todos los campos.

**Independent Test**: abrir `/panel` con el banco importado y comprobar tablas, recuentos y detalle.

### Implementation for User Story 1

- [x] T013 [US1] Crear `src/panel/resumen.ts` con `agruparPorMomento(situaciones)` pura (momento → situaciones + recuento)
- [x] T014 [P] [US1] Escribir `src/panel/__tests__/resumen.test.ts`: cada situación aparece una sola vez, el recuento por momento es exacto y la suma iguala el total (SC-001)
- [x] T015 [P] [US1] Crear `src/pages/api/panel/situaciones.ts` con `GET` (dev-only) que devuelve `{ situaciones }` del almacén, según `contracts/panel.md`
- [x] T016 [P] [US1] Crear `src/panel-ui/TablasMomentos.svelte`: una tabla por momento, encabezado con recuento y filas con título, momento y opción 1 y 2
- [x] T017 [US1] Crear `src/panel-ui/DetalleSituacion.svelte` que muestre todos los campos de la situación y de cada opción
- [x] T018 [US1] Conectar en `src/panel-ui/Panel.svelte` la carga (`fetch` a `/api/panel/situaciones`), el agrupado con `resumen.ts` y la apertura del detalle

**Checkpoint**: US1 funcionando y verificable por sí sola (SC-001).

---

## Phase 4: User Story 2 - Crear, editar y eliminar (Priority: P1)

**Goal**: CRUD completo con validación legible y sin corromper el almacén.

**Independent Test**: crear una situación válida, editarla, borrarla; e intentar guardar una inválida y ver el rechazo.

### Implementation for User Story 2

- [x] T019 [US2] Crear `src/panel/crud.ts` con `crear`, `actualizar` y `eliminar` sobre un `Almacen` en memoria, devolviendo `{ ok }` o `{ errores: [{ruta,mensaje}] }` derivados de Zod (id inmutable, id duplicado)
- [x] T020 [P] [US2] Escribir `src/panel/__tests__/crud.test.ts`: alta/edición/borrado correctos; <2 opciones, id de opción duplicado, `efectos` sin `excepcion` y variante fuera de catálogo se rechazan sin tocar el almacén (SC-003)
- [x] T021 [US2] Implementar `POST` (crear, 201/422/500) en `src/pages/api/panel/situaciones.ts` (secuencial tras T015: mismo fichero)
- [x] T022 [P] [US2] Crear `src/pages/api/panel/situaciones/[id].ts` con `PUT` (200/404/422/500) y `DELETE` (200/404/500)
- [x] T023 [P] [US2] Crear `src/panel-ui/FormularioSituacion.svelte` con todos los campos de `Situacion` y catálogos cerrados (momentos, modalidades, variantes)
- [x] T024 [P] [US2] Crear `src/panel-ui/FormularioOpcion.svelte` con `titulo`, `subtitulo`, `excepcion`+`efectos`, `flags`, `consume`, `peso`, `saltaCOAC`, `cambiaModalidad`, `cambiaVariante` (lista dinámica, mínimo 2)
- [x] T025 [US2] Conectar en `src/panel-ui/Panel.svelte` el alta, la edición y el borrado con confirmación, y mostrar los errores de validación por campo y en resumen (FR-011, FR-012)

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Volcar al juego (Priority: P2)

**Goal**: regenerar `src/content/decisiones/**` desde el almacén, validado y sin pérdida.

**Independent Test**: volcar un almacén válido y ver el juego actualizado; volcar uno inválido y ver el fallo legible sin contenido roto.

### Implementation for User Story 3

- [x] T026 [US3] Crear `src/panel/generador.ts` con `agrupar` (por momento+tipo, ordenado por `id`), `serializar` (cabecera GENERADO + export, formato Biome), `volcar` (valida `BancoContenidoSchema` completo) y `escribirVolcado`, según `contracts/generador.md`
- [x] T027 [P] [US3] Crear `scripts/panel-volcar.ts` que ejecute el volcado, imprima situaciones por fichero y soporte `--check` (valida sin escribir)
- [x] T028 [US3] Escribir `src/panel/__tests__/generador.test.ts`: round-trip sin pérdida (SC-005), idempotencia byte a byte (SC-006), banco inválido no escribe ningún `.ts` (SC-004) y la salida pasa Biome
- [x] T029 [US3] Crear `src/pages/api/panel/importar.ts` (`POST`, dev-only) y añadir en `src/panel-ui/Panel.svelte` el aviso de "sin almacén → importar" con acción que llame al endpoint (SC-009) (secuencial: edita `Panel.svelte`)

**Checkpoint**: ciclo completo panel → volcar → juego operativo.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T030 [P] Ejecutar el primer `npm run panel:volcar` real sobre el banco actual y verificar que `git diff` de `src/content/decisiones/**` solo añade la cabecera GENERADO (contenido intacto)
- [x] T031 [P] Documentar la feature en `docs/02-arquitectura-tecnica.md` (panel local + almacén JSON como fuente de verdad) y registrar la decisión de versionado (FR-021) en `docs/registro/decisiones-cerradas.md`
- [x] T032 Ejecutar `npm run check` (astro check + Biome + Vitest) sobre `src/panel/**` y `src/panel-ui/**` y `npm run contenido:informe`; corregir lo que salga
- [x] T033 Recorrer `specs/009-content-admin/quickstart.md` de punta a punta y anotar los resultados en ese mismo fichero
- [x] T034 Verificar el build de producción (`npm run build`) y confirmar que `src/pages/panel.astro` y `src/pages/api/panel/**` no se enlazan desde páginas públicas y responden 404 fuera de desarrollo (SC-007)

---

## Phase 7: Anexo — Ayudas, botón volver y categorías gestionables

Petición posterior a la implementación (2026-09-21). No altera FR-001..FR-022; añadió **FR-023**. **Retirada el 2026-10-04** junto con el `tipo`/`categoria` (los ficheros y la pantalla de categorías se eliminaron).

- [x] T035 [P] Ayudas en el formulario (`id`, `peso`, `flags`, `consume`) en `src/panel-ui/FormularioSituacion.svelte` y `src/panel-ui/FormularioOpcion.svelte`
- [x] T036 [P] Botón "← Volver al panel" en `src/panel-ui/FormularioSituacion.svelte`
- [x] T037 [P] ~~Crear `src/content/categorias.ts`~~ (eliminado)
- [x] T038 [P] ~~Relajar `Categoria` a `string`~~ (eliminado)
- [x] T039 ~~Crear `src/panel/categorias.ts`~~ (eliminado)
- [x] T040 ~~Crear rutas de categorías del panel~~ (eliminadas)
- [x] T041 ~~Crear `src/panel-ui/Categorias.svelte`~~ (eliminado)
- [x] T042 Actualizar `docs/01` §2, `docs/02` §11 y registrar la decisión **B2** — **superseded el 2026-10-04** (categorías retiradas).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** US1–US3.
- **US1/US2/US3**: dependen de la Fase 2 cerrada.
- **Polish (Fase 6)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: tras la Fase 2. Sin dependencias de otras historias → **MVP**.
- **US2 (P1)**: tras la Fase 2. Usa el almacén y el guard; no depende de US1 (pero comparte `Panel.svelte`).
- **US3 (P2)**: tras la Fase 2. Independiente de US1/US2.

### Within Each User Story

- Tests antes de la implementación que verifican; modelos/servicios antes de endpoints; endpoints antes de UI; UI antes del wiring.
- No avanzar de fase sin pasar el checkpoint.

### Parallel Opportunities

- T001, T002 (Setup); T003, T004 (Fase 2) en paralelo.
- En US1: T014, T015, T016 en paralelo. En US2: T020, T021, T022, T023, T024 en paralelo. En US3: T027, T029 en paralelo.
- US1, US2 y US3 pueden abordarse en paralelo tras la Fase 2 (con cuidado en `Panel.svelte`, que comparten).

---

## Parallel Example: User Story 2

```bash
# Lanzar juntos (ficheros distintos):
Task: "Escribir src/panel/__tests__/crud.test.ts"
Task: "Implementar POST en src/pages/api/panel/situaciones.ts"
Task: "Crear src/pages/api/panel/situaciones/[id].ts"
Task: "Crear src/panel-ui/FormularioSituacion.svelte"
Task: "Crear src/panel-ui/FormularioOpcion.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) → Fase 2 (Foundational, con `panel:importar`).
2. Fase 3 (US1): ver el banco por momento.
3. **PARAR Y VALIDAR** con el quickstart (pasos 1–2).
4. US1 ya aporta valor (leer el banco de un vistazo).

### Incremental Delivery

1. Setup + Foundational → almacén e importación listos.
2. US1 → ver → MVP.
3. US2 → editar → panel útil.
4. US3 → volcar → bucle cerrado (panel → juego).
5. Polish → docs, `npm run check`, quickstart y verificación de 404 en producción.

### Parallel Team Strategy

1. Setup + Foundational juntos.
2. Tras la Fase 2: A → US1, B → US2, C → US3.
3. Serializar los cambios en `src/panel-ui/Panel.svelte`.

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes.
- Tests deterministas obligatorios (constitución III); no se añade E2E.
- `src/panel/**` usa `node:fs`: **nunca** importarlo desde componentes `src/panel-ui/**` ni desde el cliente.
- No commitear sin petición explícita (constitución / AGENTS.md §13).
- Evitar solapar ediciones en `src/panel-ui/Panel.svelte` y en `package.json`.
