---
description: "Task list for the career arc and result variety feature"
---

# Tasks: Curva de carrera y variedad de resultados

**Input**: Design documents from `/specs/013-career-arc/`

**Prerequisites**: plan.md · spec.md · research.md · data-model.md · contracts/motor.md · contracts/verificacion.md

**Tests**: obligatorios (constitución III y `contracts/verificacion.md`). El test `S-01…S-07` **debe fallar antes de implementar**: es la regresión que se está arreglando.

**Organización**: por historia de usuario (US1 → US2 → US3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único: `src/`, `tests/`, `scripts/` en la raíz.

---

## Phase 1: Setup

**Purpose**: preparar parámetros y tipos compartidos.

- [X] T001 Añadir a `ParametrosMotor` en `src/engine/parametros.ts` los parámetros de R7 (`curvaSubida` 16, `curvaDeclive` 10, `objetivoEnTecho` 0,6, `memoriaForma` 0,5, `amplitudForma` 5) y bajar `multiplicadorRuido` a 1,5, con sus valores por defecto documentados como provisionales.
- [X] T002 Añadir `secuencia: { ano: number; fase: FaseCOAC; puesto?: number }[]` a `RegistroCarrera` en `src/simulacion/tipos.ts`.

**Checkpoint**: parámetros inyectables y el registro puede guardar la secuencia.

---

## Phase 2: Foundational (Blocking)

**Purpose**: la curva y la memoria, más el registro de la secuencia. **Bloquea las tres historias.**

**⚠️ CRITICAL**: ninguna historia empieza hasta cerrar esta fase.

- [X] T003 Crear `src/engine/carrera.ts`: `bandaDe(nivel, params)`, `puntuacionObjetivo(techo, params)` (con el caso especial de preliminares, R6) y `aptitud(ano, destino, params)` con las dos rampas y los extremos exactos (E1).
- [X] T004 [P] Crear `src/engine/forma.ts`: `forma(ano, seed, anoInicio, params)` como AR(1) derivado de `rngPara(seed, "forma", ano)` (E2, R3).
- [X] T005 [P] Escribir `src/engine/__tests__/carrera.test.ts` con V-02: extremos exactos, monotía por tramos, definida con `pico` en los bordes, `cima` dentro de la banda del techo.
- [X] T006 [P] Escribir `src/engine/__tests__/forma.test.ts` con V-03: determinismo, autocorrelación positiva, decaimiento, acotación y el caso límite `ρ = 0` ⇒ ruido blanco.
- [X] T007 Exportar `carrera.ts` y `forma.ts` desde `src/engine/index.ts` (lo necesitan el simulador y los tests).
- [X] T008 Registrar la secuencia por año en `src/simulacion/jugar.ts` (incluidos los años sin concursar, sin `puesto`).

**Checkpoint**: curva y memoria verdes por separado; la simulación ya puede mirar la secuencia.

---

## Phase 3: User Story 1 — Que cada año se sienta distinto (P1) 🎯 MVP

**Goal**: la posición deja de repetirse indefinidamente; hay variación y rachas cortas.

**Independent Test**: `npm run test -- src/simulacion/__tests__/forma-carrera.test.ts` y comprobar que **antes fallaba** y ahora pasa.

### Tests

- [X] T009 [P] [US1] Escribir `src/simulacion/__tests__/forma-carrera.test.ts` con S-01, S-02, S-03, S-05, S-06 y S-07. **Debe fallar ahora**: es la regresión concreta (FR-013).

### Implementation

- [X] T010 [US1] Reescribir la puntuación en `src/engine/coac.ts`: `aptitud(ano) + carisma + forma(ano) + ruido residual`, recortada a `[0, 100]` (E3).
- [X] T011 [US1] Sustituir `puestoDe` en `src/engine/coac.ts` por el cálculo por **mérito relativo** a la propia carrera (E4/R4), garantizando la banda y la monotonía.
- [X] T012 [US1] Ampliar `src/engine/__tests__/coac.test.ts` con V-04 (la puntuación no es constante), V-06 (banda y monotonía del puesto) y V-07 (ninguna carrera supera su techo salvo milagro).
- [X] T013 [P] [US1] Añadir las métricas de forma a `src/simulacion/estadisticas.ts` (E6): racha máxima, posiciones distintas, arco, diversidad de secuencias y diversidad por techo.
- [X] T014 [P] [US1] Añadir el hallazgo **«carrera plana»** a `src/simulacion/auditoria.ts` con umbral parametrizable (R8).
- [X] T015 [US1] Mostrar las métricas de forma en `src/simulacion/informe.ts` y en `scripts/simular.ts` (sin cambiar la interfaz del comando).
- [X] T016 [US1] Ejecutar `npm run check` y `npm run simular -- 10000`; ajustar `memoriaForma`/`amplitudForma`/`multiplicadorRuido` en `src/engine/parametros.ts` hasta que S-01…S-03 y S-05…S-07 estén verdes.

**Checkpoint**: US1 entregable por sí sola: la carrera ya varía y ninguna es plana.

---

## Phase 4: User Story 2 — Que la carrera cuente una historia (P2)

**Goal**: arco real (empezar humilde → ascender → mejor momento → declive) y año pico perceptible.

**Independent Test**: S-04 y V-05 verdes, y el informe muestra variedad de arcos.

### Implementation

- [X] T017 [US2] Usar `puntuacionObjetivo(techo, params)` para anclar la cima de la curva dentro de la banda del techo (R6), en `src/engine/carrera.ts` + `src/engine/coac.ts`.
- [X] T018 [US2] Hacer perceptible el `bonoAnoPico` **también con techos bajos** (hoy el recorte lo anula) en `src/engine/coac.ts`: sumarlo después de la curva y comprobarlo con V-05.
- [X] T019 [US2] Afinar `curvaSubida` y `curvaDeclive` en `src/engine/parametros.ts` para que aparezcan las variantes de `docs/01` §7 (pico temprano = ascenso rápido; pico tardío = reconocimiento tardío; pico en 2 = éxito temprano) y medirlo con `npm run simular`.
- [X] T020 [US2] Añadir V-05 y S-04 a los tests (`coac.test.ts` y `forma-carrera.test.ts`) y dejarlos verdes.
- [X] T021 [US2] Ejecutar `npm run check` y `npm run simular -- 10000`; dejar los tests de `src/engine/__tests__/coac.test.ts` y `src/simulacion/__tests__/forma-carrera.test.ts` verdes.

**Checkpoint**: US1 + US2; la carrera se lee como un relato.

---

## Phase 5: User Story 3 — Que el techo siga siendo un techo (P3)

**Goal**: el techo es aspiracional y oculto; la dificultad no se ha movido.

**Independent Test**: V-07, V-08, V-09 y S-15 verdes.

### Implementation

- [X] T022 [P] [US3] V-08: comprobar que el estado serializado no filtra `techo`, `suelo`, `anoPico`, `volatilidad` ni `carisma` (`codec.test.ts` / `serializacion.test.ts`).
- [X] T023 [P] [US3] V-09: comprobar que `Partida` conserva su forma y que `VERSION_PARTIDA` sigue en 2 (`serializacion.test.ts`).
- [X] T024 [US3] S-15: comprobar en `src/simulacion/__tests__/parametros.test.ts` que el reparto de techos sigue siendo exactamente `7/3/47/16/18/9` y que la cima nunca supera el techo.
- [X] T025 [US3] Verificar en `src/engine/__tests__/coac.test.ts` que el batacazo (3 %) sigue bajando un nivel y que el milagro (2 %) sigue rompiendo el techo una sola vez por carrera.

**Checkpoint**: las tres historias completas; el techo no se ha convertido en un premio de consolación.

---

## Phase 6: Polish & Cross-Cutting

- [X] T026 Ampliar `src/engine/__tests__/determinismo.test.ts` con V-01: misma semilla y decisiones ⇒ **misma secuencia de resultados** en 10.000 carreras.
- [X] T027 Actualizar `src/engine/__tests__/snapshot.test.ts` (V-10) y **explicar en el test** qué cambió y por qué.
- [X] T028 Calibrar con `npm run simular -- 10000` ajustando **solo** `src/engine/parametros.ts` hasta que S-08…S-14 (dificultad) y S-16 (rendimiento) estén dentro de tolerancia.
- [X] T029 [P] Actualizar `docs/01-diseno-juego.md` §7 (nota de la curva y de la forma) y `docs/02-arquitectura-tecnica.md` §8 (mecánica de la puntuación).
- [X] T030 [P] Registrar la decisión en `docs/registro/decisiones-cerradas.md` (curva de carrera, forma con memoria, posición por mérito, techo aspiracional) con el hallazgo de R5 sobre los pesos del techo.
- [X] T031 [P] Anotar en `docs/registro/decisiones-pendientes.md` lo que quede abierto (por ejemplo, si los valores de curva/memoria se consideran definitivos o provisionales hasta jugar).
- [X] T032 Añadir a `tests/e2e/` la comprobación E-02: una carrera jugada de principio a fin muestra al menos 3 posiciones distintas, y dejar `npm run test:e2e` verde.
- [X] T033 Ejecutar `npm run check` y comprobar que `package.json` y `package-lock.json` no han cambiado.
- [X] T034 Validar `quickstart.md` de principio a fin y anotar los resultados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)**: sin dependencias.
- **Foundational (2)**: depende de Setup y **bloquea** las tres historias.
- **US1 (3)**: depende de Foundational. Es el MVP.
- **US2 (4)**: depende de US1 (la curva necesita la puntuación nueva).
- **US3 (5)**: depende de US1; puede solaparse con US2.
- **Polish (6)**: depende de todo; T028 (calibración) es el último paso real.

### Within Each Story

- El test S-01…S-07 se escribe **antes** (T009) y debe fallar: es la prueba de que la regresión existía.
- Curva y memoria antes de la puntuación; puntuación antes de la posición.
- La calibración **solo** toca parámetros; nunca situaciones.

### Parallel Opportunities

- T004, T005 y T006 en paralelo.
- T013 y T014 en paralelo (ficheros distintos).
- T022 y T023 en paralelo.
- T029, T030 y T031 en paralelo.

---

## Parallel Example: Phase 2

```bash
Task: "Crear src/engine/forma.ts (AR(1) derivado de la semilla)"
Task: "Escribir src/engine/__tests__/carrera.test.ts (V-02)"
Task: "Escribir src/engine/__tests__/forma.test.ts (V-03)"
```

---

## Implementation Strategy

### MVP First (solo US1)

1. Setup + Foundational.
2. US1 completa.
3. **PARAR Y VALIDAR**: S-01…S-03 y S-05…S-07 verdes, y una carrera jugada a mano que ya no repita posición.
4. Commit intermedio si se pide.

### Incremental

1. US1 → validar → la partida deja de ser plana.
2. US2 → validar → la partida cuenta una historia.
3. US3 → validar → el techo sigue significando lo mismo.
4. Polish → calibrar la dificultad y cerrar la documentación.

### Reglas de la fase

- **No** se tocan `src/content/**`, `content-admin/**` ni la persistencia del jugador.
- **No** se toca `pesosTecho` ni `umbralesNivel` fuera del ajuste fino de calibración.
- **No** se devuelven efectos a las decisiones (C15 sigue cerrada).
- **No** se añaden dependencias.
- **No** se baja un umbral para pasar un test.
- Los commits se hacen **solo cuando se pidan**.
