---

description: "Task list for the final career card and sharing feature (007)"
---

# Tasks: Tarjeta final de carrera y compartir

**Input**: Design documents from `/specs/007-final-card/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/engine.md, contracts/codec.md, contracts/rutas.md, contracts/ui.md, quickstart.md

**Tests**: Incluidos — el Principio III de la constitución exige tests deterministas para todo cambio de `engine` y `content`. El E2E (con auditoría de accesibilidad) es opcional.

**Organization**: Tareas agrupadas por historia. El contrato `TarjetaFinal` y su generación son el núcleo compartido (Foundational); cada historia añade su capa y se puede verificar por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: a qué historia pertenece (US1, US2, US3)
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único (Principio V): `src/`, `tests/`, `public/`, `docs/` en la raíz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base verde y mapa de impacto antes de tocar nada.

- [X] T001 Ejecutar `npm run check` y `npm run test` y confirmar que la línea base está verde.
- [X] T002 [P] Localizar todos los consumidores de `ResumenCarrera`, `construirResumen`, el paso `fin` de `Paso` y `resumen` que habrá que adaptar (`rg "ResumenCarrera|construirResumen|\"fin\"|resumen" src tests`) y anotarlos.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contrato `TarjetaFinal`, catálogo de textos y generación determinista, compartidos por las tres historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T003 Ampliar `src/engine/types.ts`: `TarjetaFinal`, `LogroCOAC`, `PremioResumen`, `HitoTarjeta`, `TipoHito`, `BucketFrase`, `TextosTarjeta`; `BancoContenido.textosTarjeta`; `Paso` de `fin` con `tarjeta: TarjetaFinal`; `VERSION_TARJETA = 1`; retirar `ResumenCarrera`.
- [X] T004 [P] Ampliar `src/content/schema.ts` con `TextosTarjetaSchema` (hitos y frases no vacíos) y `BancoContenido.textosTarjeta`.
- [X] T005 [P] Crear `src/content/textos/tarjeta.ts` con `TEXTOS_TARJETA` (plantillas de hitos por `TipoHito`, hitos neutros y frases por `BucketFrase`) e incluirlo en `bancoContenidoBruto` en `src/content/index.ts`.
- [X] T006 Crear `src/engine/tarjeta.ts`: `construirTarjeta(p, banco)`, `sinNombre(tarjeta)` y `hashEstable(texto)` (FNV-1a); deriva identidad, trayectoria, resultado, premios agrupados e hitos; nunca lee `destino`. Depende de T003–T005.
- [X] T007 Actualizar `src/engine/partida.ts`: `siguientePaso` devuelve `{ tipo: "fin", tarjeta: construirTarjeta(p, banco) }` y `resumen(p, banco)` devuelve la tarjeta; retirar la importación de `construirResumen` y borrar `src/engine/resumen.ts`.
- [X] T008 Exportar `tarjeta.ts` desde `src/engine/index.ts` y retirar las exportaciones de `resumen.ts`. Depende de T006.
- [X] T009 Actualizar la simulación: el paso `fin` produce la tarjeta en `src/simulacion/jugar.ts` y añadir la regla `tarjetaIncoherente` (3 hitos, sin claves de `destino`, sin tipos con `veces === 0`) en `src/simulacion/auditoria.ts` + `src/simulacion/tipos.ts`.
- [X] T010 [P] Test de motor del contrato en `src/engine/__tests__/tarjeta.test.ts`: campos completos, `hitos.length === 3`, ausencia de claves de `destino`, `otrosPremios` agrupados sin ceros, `mejorPuesto` solo con concurso, `sinNombre`, determinismo.
- [X] T011 Adaptar los tests que referencian `ResumenCarrera`/`construirResumen`/paso `fin` para dejar la suite verde (p. ej. `src/engine/__tests__/resumen.test.ts` → `tarjeta.test.ts`, `determinismo.test.ts`, `src/juego/__tests__/estado.test.ts`).
- [X] T012 [P] Añadir a `src/content/__tests__/integridad.test.ts` la validación del catálogo `textosTarjeta` (cubre todos los `TipoHito` y `BucketFrase`, sin textos vacíos).

**Checkpoint**: el motor compila, `npm run check` pasa y `siguientePaso` devuelve una `TarjetaFinal` válida sin UI nueva.

---

## Phase 3: User Story 1 - Ver la historia completa de mi carrera (Priority: P1) 🎯 MVP

**Goal**: al terminar, el jugador ve una tarjeta-póster con su identidad, datos destacados, premios, tres hitos y frase; sin número héroe y sin datos ocultos.

**Independent Test**: completar una carrera de referencia y comprobar que la tarjeta aparece con todos los campos, sin número héroe y sin datos ocultos; y que repetir la partida produce la misma tarjeta.

### Tests for User Story 1

- [X] T013 [P] [US1] Test de la isla: el paso `fin` muestra la tarjeta y expone `tarjeta` en `src/juego/__tests__/estado.test.ts`.
- [X] T014 [P] [US1] Test de etiquetas de presentación (fase, premio, "Anónimo" con `nombre: null`, mejor posición) en `src/juego/__tests__/presentacion.test.ts`.

### Implementation for User Story 1

- [X] T015 [US1] Crear `src/juego/Tarjeta.svelte` (composición base: identidad, datos destacados, premios separados, tres hitos, frase y pie con marca de agua y CTA); sin número héroe.
- [X] T016 [US1] Renderizar `Tarjeta.svelte` en `src/juego/pantallas/FinCarrera.svelte` y mantener "Empezar de nuevo".
- [X] T017 [US1] Actualizar `src/juego/estado.svelte.ts` para que el paso `fin` exponga `tarjeta: TarjetaFinal` (sustituye `resumen`).
- [X] T018 [P] [US1] Añadir en `src/juego/presentacion.ts` las etiquetas nuevas (mejor posición, "otros premios", hitos, anónimo) y el texto de la tarjeta.

**Checkpoint**: US1 es demostrable de principio a fin (motor + tarjeta visible en la isla).

---

## Phase 4: User Story 2 - Ver los giros de guion de mi carrera (Priority: P2)

**Goal**: la tarjeta narra los cambios de modalidad/variante en orden cronológico y los años sin concursar, sin inventarlos cuando no los hay.

**Independent Test**: construir carreras con y sin cambios y con/sin años fuera de concurso y comprobar que la tarjeta los refleja o no se los inventa.

### Tests for User Story 2

- [X] T019 [P] [US2] Test de motor: carrera con varios cambios de modalidad (incluida la vuelta) refleja la secuencia completa; carrera sin cambios no inventa, en `src/engine/__tests__/tarjeta.test.ts`.
- [X] T020 [P] [US2] Test de motor: prioridad de hitos (logros > giros > neutros) y relleno neutro con 3 hitos en `src/engine/__tests__/tarjeta.test.ts`.

### Implementation for User Story 2

- [X] T021 [US2] Añadir a `src/juego/Tarjeta.svelte` la fila de trayectoria (chips inicio → cambios → final con año) y los años sin concursar; texto neutro cuando no hay cambios.
- [X] T022 [US2] Añadir en `src/content/textos/tarjeta.ts` las plantillas de hitos de giro y neutros y las frases por bucket; cubrir en `src/content/__tests__/integridad.test.ts`.

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Compartir la tarjeta con otros (Priority: P3)

**Goal**: código autocontenido en la URL, página de resultado, imágenes 9:16/1:1 y OG, y acciones de compartir con privacidad del nombre.

**Independent Test**: terminar una carrera, obtener el enlace, abrirlo en un contexto limpio (sin `localStorage`) y comprobar que la tarjeta se reproduce íntegra; generar las imágenes y la previsualización social.

### Tests for User Story 3

- [X] T023 [P] [US3] Test de codec en `src/engine/__tests__/codec.test.ts`: roundtrip, caracteres URL-safe, `VERSION_CODIGO`, `CODIGO_INVALIDO`, `VERSION_CODIGO_INCOMPATIBLE`, < 2000 caracteres y ausencia de `seed`/claves de `destino`.
- [X] T024 [P] [US3] (Opcional) E2E de compartir + auditoría de accesibilidad en `tests/e2e/compartir.spec.ts`.

### Implementation for User Story 3

- [X] T025 [US3] Crear `src/engine/codec.ts`: `codificar`, `decodificar`, `VERSION_CODIGO`, `ErrorCodigo`; pipeline `JSON → fflate.deflateSync → base64url` con helper base64url puro.
- [X] T026 [US3] Exportar `codec.ts` desde `src/engine/index.ts`.
- [X] T027 [P] [US3] Añadir las fuentes TTF para `satori` en `public/fonts/`.
- [X] T028 [US3] Crear `src/pages/api/og/[codigo].png.ts` (`prerender = false`): `t=og|9x16|1x1` (1200×630 / 1080×1920 / 1080×1080), `satori` + `@resvg/resvg-js`, marca de agua, caché y fallback genérico para código inválido.
- [X] T029 [US3] Ampliar `src/layouts/Layout.astro` con props opcionales de Open Graph.
- [X] T030 [US3] Crear `src/pages/r/[codigo].astro` (`prerender = false`): decodifica, renderiza `Tarjeta.svelte` (0 kB JS), metas OG y página amable con enlace a `/jugar` si el código es inválido.
- [X] T031 [US3] Crear `src/utilities/compartir.ts` con las acciones de compartir (nativo, copiar, descargar PNG, enlace) sin lógica de juego.
- [X] T032 [US3] Añadir el panel de compartir y el toggle de nombre (`ocultarNombre`, `codigoYEnlace`) en `src/juego/pantallas/FinCarrera.svelte` y `src/juego/estado.svelte.ts`.
- [X] T033 [US3] Asegurar saneamiento/escapado del nombre en el codec y en la imagen OG en `src/utilities/compartir.ts` y `src/pages/api/og/[codigo].png.ts`.

**Checkpoint**: las tres historias funcionan y son verificables por separado.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T034 [P] Actualizar `docs/02-arquitectura-tecnica.md` §10 (código sin `seed`, rutas y versionado), `docs/01-diseno-juego.md` §2 y `docs/05-producto-viralidad-negocio.md` §2.
- [X] T035 [P] Registrar las decisiones en `docs/registro/decisiones-cerradas.md` (adaptación de la referencia sin número héroe, código sin `seed`, premios separados).
- [X] T036 Ejecutar `npm run simular -- --n 10000` y comprobar 0 `tarjetaIncoherente` y 0 tarjetas con datos ocultos.
- [X] T037 Ejecutar `npm run check` y recorrer `specs/007-final-card/quickstart.md`.
- [X] T038 [P] Revisar accesibilidad de la tarjeta y la página de resultado (skill `accessibility`, WCAG 2.2 AA).
- [X] T039 [P] Verificar pureza del motor: `rg "Math\.random|Date\.now|document\.|window\." src/engine/tarjeta.ts src/engine/codec.ts` = 0 resultados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** las tres historias.
- **User Stories (Phases 3–5)**: dependen de Foundational; pueden ir en paralelo o en orden P1 → P2 → P3.
- **Polish (Phase 6)**: depende de las historias que se quieran cerrar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias; es el MVP.
- **US2 (P2)**: sin dependencias de US1 en el motor; comparte el componente `Tarjeta.svelte` creado en US1 para la fila de trayectoria.
- **US3 (P3)**: depende de que exista `TarjetaFinal` (Foundational) y del componente de US1 para la página de resultado.

### Within Foundational

- T003 bloquea a T004–T009.
- T004 y T005 son [P] entre sí; T006 depende de T003–T005.
- T007 depende de T006; T008 depende de T006; T009 depende de T007.
- T010 y T012 son [P]; T011 depende de T007 y T009.

### Within Each User Story

- Tests primero (deben fallar) → implementación → integración.
- Los ficheros repetidos entre historias (`tarjeta.test.ts`, `Tarjeta.svelte`) van en serie entre sí.

### Parallel Opportunities

- T004 y T005 en paralelo tras T003.
- T010 y T012 en paralelo dentro de Foundational.
- T013 y T014 en paralelo; T018 en paralelo con T015/T016.
- T019 y T020 en paralelo; T023 y T024 en paralelo.
- T027 y T031 en paralelo con T028.
- T034, T035, T038 y T039 en paralelo al final.

---

## Parallel Example: Foundational (tras T003)

```bash
Task: "Ampliar src/content/schema.ts con TextosTarjetaSchema"
Task: "Crear src/content/textos/tarjeta.ts y wire en src/content/index.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Test de codec en src/engine/__tests__/codec.test.ts"
Task: "Añadir fuentes TTF en public/fonts/"
Task: "Crear src/utilities/compartir.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (bloqueante).
3. Phase 3: US1 → **PARAR y VALIDAR** (tarjeta-póster visible en la isla).
4. Demo si está listo.

### Incremental Delivery

1. Setup + Foundational → `TarjetaFinal` generada y testeada.
2. US1 → demo (tarjeta completa en el fin de carrera).
3. US2 → demo (giros de trayectoria narrados).
4. US3 → demo (compartir: enlace, imágenes y acciones).
5. Polish → docs, 10.000 simulaciones, quickstart, accesibilidad.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- Etiqueta [Story] para trazabilidad con `spec.md`.
- `VERSION_PARTIDA` NO cambia (2): la tarjeta es un agregado derivado y no se persiste.
- El `engine` no importa `content`: los textos viajan por `BancoContenido.textosTarjeta`.
- El código compartido nunca incluye `seed`, `destino` ni la `Partida`.
- No commitear sin petición explícita.
