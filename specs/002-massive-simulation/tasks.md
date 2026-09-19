---

description: "Task list — Simulación masiva del motor"
---

# Tasks: Simulación masiva del motor

**Input**: Design documents from `/specs/002-massive-simulation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos. La constitución (Principio III) exige verificación determinista, y el plan define
tests unitarios de perfiles, estadísticas, auditoría, informe y orquestador. E2E no aplica a esta feature.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y prueba
independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: historia de usuario (US1, US2, US3, US4)
- Rutas de fichero exactas en cada tarea

## Path Conventions

Proyecto único. Rutas reales: `src/simulacion/`, `scripts/simular.ts`, `specs/002-massive-simulation/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar estructura y comando

- [X] T001 Crear el directorio `src/simulacion/` y `src/simulacion/__tests__/` con un `src/simulacion/index.ts` vacío (placeholder).
- [X] T002 Cambiar el script `simular` en `package.json` a `tsx scripts/simular.ts` (quitar el `10000` hardcodeado para que `npm run simular -- 10000` pase el argumento).
- [X] T003 [P] Verificar que `biome check` y `astro check` cubren `src/simulacion/**` y `scripts/simular.ts`; ajustar `biome.json`/`tsconfig.json` solo si fuese necesario.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: núcleo compartido que TODAS las historias necesitan

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T004 [P] Definir los tipos del módulo en `src/simulacion/tipos.ts` (`PerfilJugador`, `ConfiguracionPartida`, `OpcionesSimulacion`, `RegistroCarrera`, `InformeSimulacion`, `HallazgoEstadoImposible`, `ReglaEstadoImposible`, `ErrorAgregable`, `Distribucion`, `MetricasAgregadas`, `MetricasPrincipales`) según `data-model.md`.
- [X] T005 [P] Definir el tipo `PerfilJugador` (con `id`, `descripcion` y `elegir(contexto)`) y el perfil por defecto aleatorio uniforme en `src/simulacion/perfiles.ts`.
- [X] T006 [P] Definir la configuración base (una) en `src/simulacion/configuraciones.ts`.
- [X] T007 Implementar `jugarCarrera({ input, banco, perfil, parametros })` en `src/simulacion/jugar.ts`: usa `crearPartida → siguientePaso → elegir → continuar` hasta `Paso.fin`; registra situaciones servidas, opciones elegidas, atributos finales, premios, duración y errores; sin `Math.random()`/`Date.now()` (RNG vía `rngPara`).
- [X] T008 Crear la superficie pública del módulo en `src/simulacion/index.ts` (exports de T004–T007).

**Checkpoint**: módulo importable que juega una carrera determinista de punta a punta.

---

## Phase 3: User Story 1 - Informe de balance en una sola orden (Priority: P1) 🎯 MVP

**Goal**: con una sola orden, correr N carreras con el perfil por defecto y producir el informe global
de balance por consola.

**Independent Test**: `npm run simular -- 200` termina sin errores y muestra todas las métricas mínimas
de US1; `npm run simular -- 10000` completa en < 30 s.

### Tests for User Story 1 ⚠️ (escribir primero y verlos fallar)

- [X] T009 [P] [US1] Test de métricas globales en `src/simulacion/__tests__/estadisticas.test.ts` (fases, premios, duración, años de pico, atributos) sobre un conjunto controlado.
- [X] T010 [P] [US1] Test de orquestación y determinismo en `src/simulacion/__tests__/simular.test.ts` (mismas opciones → informe idéntico; N carreras completadas).

### Implementation for User Story 1

- [X] T011 [US1] Implementar la agregación global en `src/simulacion/estadisticas.ts`: `% pisa final`, `% no supera cuartos`, `% no supera preliminares`, `% no concursó nunca`, distribución de mejor fase, media de primeros premios, distribución de premios, duración media, distribución de años de pico y min/máx/media de atributos (FR-008 a FR-015, FR-018).
- [X] T012 [US1] Implementar `formatearInforme(informe)` en `src/simulacion/informe.ts` con los bloques 1–4, 7–9 de `contracts/cli.md`.
- [X] T013 [US1] Implementar el orquestador `simular(opciones)` en `src/simulacion/simular.ts`: N carreras con `seed = <seedBase>-<i>`, perfil/config por defecto, agregación y `meta.generadoConError` (FR-004, FR-006, FR-007, FR-027).
- [X] T014 [US1] Implementar el CLI en `scripts/simular.ts`: parseo de `N` posicional, resolución del banco (fixtures **con nota de deuda**), informe de texto y código de salida 0/1 (FR-001, FR-002, FR-027).
- [X] T015 [US1] Añadir validación de argumentos y `--help` en `scripts/simular.ts` (código de salida 2 para N no entero, ≤ 0 o > 100.000; FR-003).
- [X] T016 [US1] Ejecutar el escenario 1 (200 carreras) y el 2 (10.000 carreras) de `quickstart.md`; registrar resultados y confirmar < 30 s (FR-023).

**Checkpoint**: `npm run simular -- 10000` entrega el informe global completo. MVP listo.

---

## Phase 4: User Story 2 - Jugadores y configuraciones variadas (Priority: P2)

**Goal**: tres perfiles de decisión y un catálogo de configuraciones, con informe desglosado por perfil
y por configuración.

**Independent Test**: `npm run simular -- 3000` muestra tres perfiles con resultados distintos y 1000
carreras por perfil; el desglose por configuración aparece con las métricas principales.

### Tests for User Story 2 ⚠️

- [X] T017 [P] [US2] Test de perfiles en `src/simulacion/__tests__/perfiles.test.ts`: determinismo y comportamiento esperado de `aleatorio`, `codicioso` y `erratico`.
- [X] T018 [P] [US2] Test de reparto y desglose en `src/simulacion/__tests__/variedad.test.ts`: con `n = k·P·C` cada perfil/config recibe `k` carreras; aparecen `porPerfil` (todas las métricas) y `porConfiguracion` (mejor fase, premios, duración).

### Implementation for User Story 2

- [X] T019 [US2] Añadir los perfiles `codicioso` (mayor suma artística) y `erratico` (riesgo con RNG) y `PERFILES_POR_DEFECTO` en `src/simulacion/perfiles.ts` (FR-005).
- [X] T020 [US2] Ampliar el catálogo en `src/simulacion/configuraciones.ts` para cubrir modalidades, variantes, géneros y localidades (FR-005).
- [X] T021 [US2] Añadir la agregación `MetricasAgregadas` (por perfil) y `MetricasPrincipales` (por configuración) en `src/simulacion/estadisticas.ts` (FR-028).
- [X] T022 [US2] Implementar el reparto balanceado por índice de carrera en `src/simulacion/simular.ts` (research D4).
- [X] T023 [US2] Renderizar los bloques de desglose por perfil y configuración en `src/simulacion/informe.ts` (FR-028).
- [X] T024 [US2] Añadir el flag `--perfiles <ids>` (validación y selección) en `scripts/simular.ts`.

**Checkpoint**: US1 y US2 funcionan; el informe distingue perfiles y configuraciones.

---

## Phase 5: User Story 3 - Contenido muerto y estados imposibles (Priority: P2)

**Goal**: ranking de situaciones, lista de situaciones nunca vistas, condicionales nunca disparados y
detector de estados imposibles con el catálogo amplio.

**Independent Test**: con el banco de pruebas, el informe lista "nunca vistas"/"nunca disparados" y
"estados imposibles: ninguno detectado"; con un banco manipulado, aparece el hallazgo esperado.

### Tests for User Story 3 ⚠️

- [X] T025 [P] [US3] Test de auditoría en `src/simulacion/__tests__/auditoria.test.ts`: un caso por regla del catálogo FR-019 (13 reglas).
- [X] T026 [P] [US3] Test de contenido muerto en `src/simulacion/__tests__/contenido-muerto.test.ts`: ranking de frecuencias, nunca vistas y condicionales nunca disparados.

### Implementation for User Story 3

- [X] T027 [US3] Implementar `auditarCarrera(registro)` en `src/simulacion/auditoria.ts` con las 13 reglas de FR-019 y `REGLAS_ESTADO_IMPOSIBLE`, sin lanzar excepciones.
- [X] T028 [US3] Añadir a `src/simulacion/estadisticas.ts` el ranking de situaciones (top 10 más y top 10 menos frecuentes), la lista de nunca vistas y los condicionales nunca disparados (FR-016, FR-017).
- [X] T029 [US3] Integrar la auditoría en el registro de carrera y agregar `estadosImposibles` en `src/simulacion/simular.ts`.
- [X] T030 [US3] Renderizar el bloque de situaciones/condicionales/estados imposibles y el mensaje explícito "ninguno detectado" en `src/simulacion/informe.ts` (FR-024).

**Checkpoint**: el informe detecta contenido muerto y estados imposibles.

---

## Phase 6: User Story 4 - Resultado exportable y comparable (Priority: P3)

**Goal**: volcado del informe a JSON comparable entre corridas.

**Independent Test**: `npm run simular -- 1000 --seed base-a --json a.json` dos veces produce archivos
idénticos.

### Tests for User Story 4 ⚠️

- [X] T031 [P] [US4] Test de JSON en `src/simulacion/__tests__/informe-json.test.ts`: `informeAJson` es `JSON.parse`-able y estable; el tiempo de ejecución queda fuera.

### Implementation for User Story 4

- [X] T032 [US4] Implementar `informeAJson(informe)` en `src/simulacion/informe.ts` con orden de claves determinista (FR-025, FR-022).
- [X] T033 [US4] Añadir los flags `--json <ruta>`, `--quiet` y `--seed <base>` en `scripts/simular.ts` (US4, FR-025).

**Checkpoint**: informes exportables y comparables.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: coherencia, no-regresión y documentación

- [X] T034 [P] Test de pureza en `src/simulacion/__tests__/pureza.test.ts`: `src/simulacion/**` no usa `Math.random()` ni `Date.now()` (Principio I).
- [X] T035 [P] Documentar el módulo en `docs/02-arquitectura-tecnica.md` §11 y en la estructura de carpetas.
- [X] T036 [P] Registrar la deuda del banco de pruebas: nota en `scripts/simular.ts` y entrada en `docs/registro/decisiones-pendientes.md`.
- [X] T037 Verificar que no se tocaron pesos ni parámetros del motor (`git diff -- src/engine/parametros.ts` vacío) y que `engine` no importa de `simulacion` (FR-020, FR-021).
- [X] T038 Ejecutar `npm run check` completo y los 7 escenarios de `quickstart.md`; presentar el informe de 10.000 carreras al usuario.
- [X] T039 [P] Test de informe interno en `src/simulacion/__tests__/informe-interno.test.ts`: `meta.usoInterno === true`, sin nombre del personaje y sin campo `destino` (FR-026).
- [X] T040 [P] Test de importaciones en `src/simulacion/__tests__/imports.test.ts`: `src/simulacion/**` solo importa de `src/engine/index`, nunca de submódulos internos del motor (FR-021).
- [X] T041 [P] Test de inyección de parámetros en `src/simulacion/__tests__/parametros.test.ts`: cambiar `parametros` altera el informe sin tocar código (SC-008).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T003)**: sin dependencias.
- **Foundational (T004–T008)**: depende de Setup; **bloquea** todas las historias.
- **US1 (T009–T016)**: depende de Foundational. Es el MVP.
- **US2 (T017–T024)**: depende de Foundational y reutiliza el orquestador de US1 (T013).
- **US3 (T025–T030)**: depende de Foundational y de la agregación de US1 (T011).
- **US4 (T031–T033)**: depende del informe de US1 (T012).
- **Polish (T034–T041)**: depende de las historias que se hayan completado; T039/T040/T041 validan
  FR-026, FR-021 y SC-008 respectivamente.

### Within Each Story

- Los tests se escriben y **fallan** antes de la implementación.
- Estadísticas → informe → orquestador → CLI.
- No hay dependencias cruzadas que rompan la independencia: US2, US3 y US4 amplían ficheros de US1 de
  forma aditiva.

### Parallel Opportunities

- Setup: T003.
- Foundational: T004, T005, T006 en paralelo.
- US1: T009 y T010 en paralelo.
- US2: T017 y T018 en paralelo.
- US3: T025 y T026 en paralelo.
- Polish: T034, T035, T036, T039, T040 y T041 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Tests de US1 en paralelo (deben fallar primero):
Task: "Test de métricas globales en src/simulacion/__tests__/estadisticas.test.ts"
Task: "Test de orquestación y determinismo en src/simulacion/__tests__/simular.test.ts"
```

```bash
# Foundational en paralelo:
Task: "Definir tipos en src/simulacion/tipos.ts"
Task: "Definir Decidir y perfil aleatorio en src/simulacion/perfiles.ts"
Task: "Definir configuración base en src/simulacion/configuraciones.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup (T001–T003).
2. Foundational (T004–T008).
3. US1 (T009–T016).
4. **STOP y VALIDAR**: `npm run simular -- 10000` y revisar el informe con el usuario.

### Incremental Delivery

1. US1 → informe global (MVP).
2. US2 → variedad de perfiles/configuraciones y desglose.
3. US3 → contenido muerto y estados imposibles.
4. US4 → exportación JSON comparable.

### Restricciones permanentes

- **NO** modificar pesos ni parámetros del motor (`src/engine/parametros.ts`) en esta feature (FR-020).
- **NO** importar `src/simulacion` desde `src/engine` (FR-021).
- **NO** usar `Math.random()` ni `Date.now()` en la lógica de simulación.
- `npm run check` MUST pasar antes de dar por terminada cada fase.

## Notes

- [P] = ficheros distintos, sin dependencias.
- El banco de fixtures es deuda temporal hasta la feature de `content`; queda aislado en el CLI.
- Commit tras cada tarea o grupo lógico, solo si el usuario lo pide.
