---
description: "Task list for feature 004-playable-ui"
---

# Tasks: Versión mínima jugable (/jugar)

**Input**: Design documents from `/specs/004-playable-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos. La investigación (D9) decide tests unitarios de estado/persistencia/presentación y un smoke E2E de una carrera completa; no es TDD obligatorio pero sí verificación.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1, US2, US3 (mapea a `spec.md`)
- Todas las descripciones incluyen la ruta exacta del fichero

## Path Conventions

Proyecto único Astro: `src/`, `tests/` en la raíz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Limpiar el scaffold y preparar la estructura de la isla

- [X] T001 Retirar el ejemplo `src/components/GameIsland.svelte` y dejar `src/pages/index.astro` como landing estática sin isla (0 kB de JS)
- [X] T002 [P] Crear la estructura `src/juego/pantallas/`, `src/juego/__tests__/` y `tests/e2e/`
- [X] T003 [P] Verificar que Biome excluye `.svelte` (`biome.json`) y que `astro check` cubre `.svelte` y `.svelte.ts`; ajustar solo si no lo hace

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Datos de variantes, presentación, persistencia, estado y shell de la isla. Todas las historias dependen de esta fase.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [X] T004 Añadir el catálogo de variantes como datos en `src/content/variantes.ts` (interfaz `Variante`, `VARIANTES`, `variantesDe(modalidad)` según `docs/01` §2) y re-exportarlo en `src/content/index.ts`
- [X] T005 [P] Implementar `src/juego/presentacion.ts`: `tituloDelJuego`, `etiquetaMomento`, `etiquetaFase`, `etiquetaPremio`, `normalizarNombre` (trim + colapsar + máx. 24). `etiquetaTipo` se retiró el 2026-10-04.
- [X] T006 Implementar `src/juego/persistencia.ts` según `contracts/estado.md`: `Almacen`, `guardar`, `cargar`, `borrar`, clave `coplero:partida`, versión de esquema y descarte sin lanzar
- [X] T007 Implementar `src/juego/estado.svelte.ts`: fábrica `crearJuego()` con runes y acciones (`empezar`, `crearPersonaje`, `elegirModalidad`, `elegirVariante`, `elegirOpcion`, `continuar`, `reiniciar`, `continuarPartida`) que delegan en el motor y auto-guardan
- [X] T008 Crear `src/pages/jugar.astro` (shell estático que monta `<Juego client:load />`) y `src/juego/Juego.svelte` (raíz que enruta por `estado.pantalla`, sin lógica de juego)
- [X] T009 [P] Test de `src/juego/presentacion.ts` en `src/juego/__tests__/presentacion.test.ts` (títulos por género, etiquetas y normalizarNombre)
- [X] T010 [P] Test de `src/juego/persistencia.ts` en `src/juego/__tests__/persistencia.test.ts` con almacén en memoria (guardar/cargar/borrar y descarte por versión o JSON corrupto)

**Checkpoint**: datos, estado, persistencia y shell listos; las historias pueden empezar

---

## Phase 3: User Story 1 - Jugar una carrera completa de principio a fin (Priority: P1) 🎯 MVP

**Goal**: Recorrer intro → personaje → modalidad → variante → años de decisiones → resultado → fin, con el motor gobernando el flujo.

**Independent Test**: completar una carrera entera en `/jugar` sin pantallas vacías ni bloqueos y llegar a la pantalla de fin con resumen.

### Implementation for User Story 1

- [X] T011 [P] [US1] Crear `src/juego/pantallas/Intro.svelte` (bienvenida y botón empezar; props/acciones según `contracts/pantallas.md`)
- [X] T012 [P] [US1] Crear `src/juego/pantallas/CrearPersonaje.svelte` (título dinámico por género; campos nombre, edad, localidad, género; valida nombre no vacío y normaliza)
- [X] T013 [P] [US1] Crear `src/juego/pantallas/ElegirModalidad.svelte` (las dos modalidades con título y subtítulo)
- [X] T014 [P] [US1] Crear `src/juego/pantallas/ElegirVariante.svelte` (tres variantes de la modalidad con título y subtítulo, vía `variantesDe`)
- [X] T015 [P] [US1] Crear `src/juego/pantallas/Decision.svelte` (enunciado y opciones con título y subtítulo; soporta `texto` vacío sin romperse)
- [X] T016 [P] [US1] Crear `src/juego/pantallas/Resultado.svelte` (resultado básico de la temporada y acción continuar)
- [X] T017 [P] [US1] Crear `src/juego/pantallas/FinCarrera.svelte` (resumen: nombre, modalidad, variante, años, mejor fase, premios)
- [X] T018 [US1] Conectar las pantallas en `src/juego/Juego.svelte`: transiciones del `Paso` del motor (decision/resultado/fin/error) y ciclo de carrera
- [X] T019 [P] [US1] Test del ciclo completo en `src/juego/__tests__/estado.test.ts` (crear → decisiones → resultado → fin con semilla fija, sin errores de motor)
- [X] T020 [US1] Smoke E2E en `tests/e2e/jugar.spec.ts` y configurar `playwright.config.ts` (webServer) para completar una carrera entera en `/jugar`

**Checkpoint**: el juego se puede jugar entero — MVP

---

## Phase 4: User Story 2 - Entender el contexto y decidir sin ambigüedad (Priority: P2)

**Goal**: Indicador de contexto permanente y resultado de temporada legible.

**Independent Test**: recorrer decisiones comprobando que el indicador cambia con año/momento y que el resultado muestra fase, puesto y premios.

### Implementation for User Story 2

- [X] T021 [P] [US2] Crear `src/juego/pantallas/IndicadorContexto.svelte` (año y momento con `presentacion.ts`)
- [X] T022 [US2] Integrar el indicador en `Decision.svelte` y `Resultado.svelte`, y completar `Resultado.svelte` con fase alcanzada, puesto y premios del año
- [X] T023 [P] [US2] Ampliar `src/juego/__tests__/presentacion.test.ts` con la composición del indicador y las etiquetas de fase/puesto/premios

**Checkpoint**: contexto y resultados claros

---

## Phase 5: User Story 3 - Continuar donde lo dejaste (Priority: P3)

**Goal**: Continuar la partida guardada o empezar de cero, con descarte amable de guardados incompatibles.

**Independent Test**: empezar, recargar y retomar en el mismo punto; después reiniciar y comprobar que arranca de nuevo.

### Implementation for User Story 3

- [X] T024 [US3] Añadir a `Intro.svelte` "Continuar" (cuando `hayGuardado`) y "Empezar de cero", conectados a `continuarPartida()`/`reiniciar()` de `estado.svelte.ts`
- [X] T025 [US3] Mostrar el aviso de guardado descartado (`aviso`) en `Intro.svelte` y `src/juego/Juego.svelte`
- [X] T026 [P] [US3] Ampliar `src/juego/__tests__/estado.test.ts` con `continuarPartida` y `reiniciar` (retoma el mismo punto y limpia el guardado)

**Checkpoint**: la partida se retoma o se reinicia correctamente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mínimos de presentación, accesibilidad y validación final

- [X] T027 [P] Aplicar layout mobile-first (ancho máximo 420-480 px) en `src/juego/Juego.svelte` o `src/layouts/Layout.astro`
- [X] T028 [P] Accesibilidad mínima en las pantallas de `src/juego/pantallas/`: `label` asociado a cada control, foco visible y controles nativos
- [X] T029 Ejecutar la validación de `specs/004-playable-ui/quickstart.md`, `npm run check` y `npm run test:e2e`, y dejar todo en verde

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA las tres historias
- **US1 (Phase 3)**: depende de Foundational; es el MVP
- **US2 (Phase 4)**: depende de US1 (integra el indicador en las pantallas de decisión y resultado)
- **US3 (Phase 5)**: depende de Foundational (persistencia/estado) y de `Intro` de US1
- **Polish (Phase 6)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational
- **US2 (P2)**: necesita `Decision.svelte` y `Resultado.svelte` de US1
- **US3 (P3)**: necesita `Intro.svelte` de US1 y el módulo de persistencia de Foundational

### Within Each User Story

- Componentes antes del cableado en `Juego.svelte`
- Cableado antes de los tests de ciclo completo y del smoke E2E

### Parallel Opportunities

- T002/T003 en Setup
- T005/T009/T010 en Foundational (ficheros distintos)
- T011–T017 (siete pantallas) son paralelizables entre sí
- T021 y T023 en US2
- T027 y T028 en Polish

---

## Parallel Example: User Story 1

```bash
# Crear las pantallas en paralelo:
Task: "Crear src/juego/pantallas/Intro.svelte"
Task: "Crear src/juego/pantallas/CrearPersonaje.svelte"
Task: "Crear src/juego/pantallas/ElegirModalidad.svelte"
Task: "Crear src/juego/pantallas/ElegirVariante.svelte"
Task: "Crear src/juego/pantallas/Decision.svelte"
Task: "Crear src/juego/pantallas/Resultado.svelte"
Task: "Crear src/juego/pantallas/FinCarrera.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1 (Setup)
2. Completar Phase 2 (Foundational) — CRÍTICO
3. Completar Phase 3 (US1)
4. **PARAR Y VALIDAR**: una carrera entera en `/jugar`
5. Ya se puede comprobar que el juego es jugable de principio a fin

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → carrera completa (MVP)
3. US2 → contexto y resultado legibles
4. US3 → continuar/reiniciar
5. Polish → mobile-first, accesibilidad y validación

### Notes

- [P] = ficheros distintos, sin dependencias pendientes
- La UI no contiene lógica de juego: solo presenta estado y despacha acciones al motor
- Fuera de alcance: compartir, OG, analítica, monetización, sonido, logros, animaciones complejas y diseño final
- `npm run check` debe pasar al cerrar cada fase que toque `src/`
