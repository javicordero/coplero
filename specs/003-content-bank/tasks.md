---
description: "Task list for feature 003-content-bank"
---

# Tasks: Banco de contenido real (importación del banco documentado)

**Input**: Design documents from `/specs/003-content-bank/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos y obligatorios. La constitución (Principio III) exige tests de integridad del contenido (incluida la alcanzabilidad) y el usuario los pidió explícitamente.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1, US2, US3 (mapea a `spec.md`)
- Todas las descripciones incluyen la ruta exacta del fichero

## Path Conventions

Proyecto único: `src/`, `scripts/`, `docs/` en la raíz del repositorio.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de carpetas y comprobación del toolchain

- [X] T001 Crear la estructura de carpetas de contenido: `src/content/decisiones/verano/`, `src/content/decisiones/febrero/`, `src/content/condicionales/`, `src/content/__tests__/`
- [X] T002 [P] Verificar que Vitest (`vitest.config.ts`, patrón `src/**/__tests__/**/*.test.ts`) y Biome recogen `src/content/__tests__/`; ajustar solo si no lo hacen

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Esquema, catálogos y ensamblado compartidos por las tres historias

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [X] T003 [P] Definir catálogos cerrados (`MOMENTOS`, `TIPOS_DECISION`, `CATEGORIAS`, `ATRIBUTOS`, `MODALIDADES`) en `src/content/modalidades.ts`
- [X] T004 Implementar los esquemas Zod (`OpcionSchema`, `SituacionSchema`, `CondicionalSchema`, `RequisitoSchema`, `BancoContenidoSchema`) y sus tipos `z.infer` en `src/content/schema.ts`, sustituyendo el esquema obsoleto `ScenarioSchema`/`DecisionSchema`; el esquema debe rechazar ids duplicados, exigir `>=2` opciones con `titulo`/`subtitulo` no vacíos y validar `modalidades`
- [X] T005 Crear los seis ficheros de datos con arrays tipados vacíos (`Situacion[]` / `Condicional[]`): `src/content/decisiones/verano/contenido.ts`, `decisiones/verano/personaje.ts`, `decisiones/febrero/contenido.ts`, `decisiones/febrero/personaje.ts`, `src/content/condicionales/verano.ts`, `src/content/condicionales/febrero.ts`
- [X] T006 Ensamblar y validar el banco en `src/content/index.ts`: concatenar los seis arrays, `BancoContenidoSchema.parse(...)` y exportar `bancoContenido` (más esquemas y catálogos)
- [X] T007 [P] Test de compatibilidad estructural en `src/content/__tests__/compatibilidad.test.ts`: asignar `bancoContenido` a una variable `BancoContenido` importada de `../engine/index` y comprobar que no hay error de tipos

**Checkpoint**: Esquema y ensamblado listos; las historias pueden empezar

---

## Phase 3: User Story 1 - Una carrera completa se juega con el contenido real (Priority: P1) 🎯 MVP

**Goal**: Importar las 27 situaciones base y los 11 condicionales documentados, de modo que una carrera completa se juegue con el banco real.

**Independent Test**: ejecutar una carrera completa con `bancoContenido` en las cuatro configuraciones de modalidad/variante sin `CONTENIDO_INSUFICIENTE` y con resumen final.

### Implementation for User Story 1

- [X] T008 [P] [US1] Importar las 7 situaciones de contenido de verano (`docs/03` §Letra y Música) en `src/content/decisiones/verano/`, con `unicaVez: true`, `texto: ""` y sin nombres reales
- [X] T009 [P] [US1] Importar las 11 situaciones de personaje de verano (`docs/03` §§Dinero, Grupo, Carrera y Concurso) en `src/content/decisiones/verano/personaje.ts`, con `unicaVez: true`, `texto: ""`, sin nombres reales, incluida la de 3 opciones "Enfado con el COAC" con `saltaCOAC: true` en "Pa la calle" y "Gira por España"
- [X] T010 [P] [US1] Importar las 3 situaciones de contenido de febrero (`docs/04` §Repertorio) en `src/content/decisiones/febrero/contenido.ts`, con `unicaVez: true`, `texto: ""`, sin nombres reales y `modalidades: ["chirigotero"]` en el cierre del popurrí
- [X] T011 [P] [US1] Importar las 6 situaciones de personaje de febrero (`docs/04` §§Jurado, Prensa) en `src/content/decisiones/febrero/personaje.ts`, con `unicaVez: true`, `texto: ""`, sin nombres reales y `saltaCOAC: true` en "No ir al COAC el año que viene" (`year_sabatico`)
- [X] T012 [P] [US1] Importar los 7 condicionales de verano (`docs/03` §Condicionales) en `src/content/condicionales/verano.ts`, mapeando requisitos según research D2 (`flag`, `flagRepetida`, `alguna`)
- [X] T013 [P] [US1] Importar los 4 condicionales de febrero (`docs/04` §Condicionales) en `src/content/condicionales/febrero.ts`, incluido "llegar a la final" como `faseAlcanzada`
- [X] T014 [US1] Comprobar que `bancoContenido` valida y expone 18 situaciones de verano, 9 de febrero y 11 condicionales; ajustar `src/content/index.ts` si el ensamblado lo requiere
- [X] T015 [US1] Test de carrera completa con el banco real en `src/content/__tests__/carrera.test.ts` usando las 4 configuraciones de `CONFIGURACIONES_POR_DEFECTO` de `src/simulacion` (comparsista, chirigotero, comparsista-femenino, chirigotero-no-binario), sin `CONTENIDO_INSUFICIENTE` y con `fin`/`resumen` (SC-001)

**Checkpoint**: El banco real permite jugar una carrera completa — MVP

---

## Phase 4: User Story 2 - El contenido incorrecto se detecta antes de publicar (Priority: P2)

**Goal**: Reglas de integridad y validación con mensajes que señalan el elemento culpable, sin situaciones inalcanzables y sin acoplamiento al motor.

**Independent Test**: introducir contenido inválido en un banco de prueba y comprobar que la validación falla señalando id/campo/flag.

### Tests for User Story 2

- [X] T016 [P] [US2] Test de integridad sobre el banco real en `src/content/__tests__/integridad.test.ts`: ids únicos, `momento` válido, `>=2` opciones con título y subtítulo, flags referenciadas existentes, modalidades válidas, cobertura por momento, `saltaCOAC` donde la doc lo indica, recuento exacto 18/9/11, ninguna opción usa `consume` (FR-006) y revisión de ausencia de nombres reales (FR-016) (SC-002, SC-004)
- [X] T017 [P] [US2] Test de casos negativos con cobertura de **todas** las reglas de integridad en `src/content/__tests__/integridad-negativos.test.ts`: id duplicado, falta de `momento`, flag huérfana, modalidad/variante no permitida, menos de 2 opciones, cobertura de momento ausente, `saltaCOAC` ausente en opción que no concursa y recuento de contenido erróneo (SC-004)
- [X] T018 [P] [US2] Test de alcanzabilidad (Principio III) en `src/content/__tests__/alcanzabilidad.test.ts`: ninguna situación ni condicional es inalcanzable; combinar análisis estático de filtros y las "nunca vistas" de una simulación de 10.000 carreras con el banco real
- [X] T019 [P] [US2] Test de frontera de imports (FR-013, SC-006) en `src/content/__tests__/imports.test.ts`: leer los `.ts` de `src/content` y comprobar que ningún fichero importa de `engine` ni de `web`

### Implementation for User Story 2

- [X] T020 [US2] Formatear los errores de validación en `src/content/index.ts` para que indiquen situación id, campo y flag culpables (preprocesar `error.issues` de Zod antes de lanzar)
- [X] T021 [US2] Corregir el contenido que las reglas de integridad marquen hasta dejar T016–T019 en verde

**Checkpoint**: Contenido inválido detectado con mensaje accionable; banco íntegro y alcanzable

---

## Phase 5: User Story 3 - Informe de integridad del banco (Priority: P3)

**Goal**: Informe con recuentos, flags declaradas/referenciadas y situaciones potencialmente inalcanzables.

**Independent Test**: ejecutar `npm run contenido:informe` y comprobar que los totales cuadran con lo documentado.

### Implementation for User Story 3

- [X] T022 [P] [US3] Implementar los cálculos estáticos en `src/content/informe.ts`: situaciones por momento, condicionales, flags declaradas vs referenciadas, flags sin declarar y alcanzabilidad estática (filtros `modalidades`/`variantes` imposibles)
- [X] T023 [US3] Implementar la CLI `scripts/informe-contenido.ts` (texto, `--json <ruta>`, `--n <carreras>`, `--help`; códigos 0/1/2) usando `src/content/informe.ts` y `simular` de `src/simulacion` con el banco real para las "nunca vistas" (SC-005)
- [X] T024 [P] [US3] Test del informe en `src/content/__tests__/informe.test.ts`: recuentos esperados, detección de flag sin declarar y de filtro imposible
- [X] T025 [US3] Añadir el script `contenido:informe` a `package.json` (ejecuta `tsx scripts/informe-contenido.ts`)

**Checkpoint**: Informe de integridad disponible y correcto

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar la deuda T17, documentar y validar de punta a punta

- [X] T026 [P] Conectar `scripts/simular.ts` al banco real (`import { bancoContenido } from "../src/content"`), retirando el import del banco de pruebas y el comentario de deuda (FR-021, SC-007)
- [X] T027 [P] Test de guardia de integración en `src/content/__tests__/integracion.test.ts`: leer `scripts/simular.ts` y comprobar que no importa de `src/engine/__tests__/` y que usa `bancoContenido`
- [X] T028 [P] Actualizar documentación: `docs/02-arquitectura-tecnica.md` (§9/§11 banco real), `docs/03`/`docs/04` (marcar pendientes cubiertos) y `docs/registro/decisiones-pendientes.md` (cerrar T17; anotar que T13 debe revisarse con el banco real)
- [X] T029 Ejecutar la validación de `specs/003-content-bank/quickstart.md` y `npm run check` (astro check + Biome + Vitest) y dejar todo en verde

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA las tres historias
- **US1 (Phase 3)**: depende de Foundational; sin dependencias de otras historias
- **US2 (Phase 4)**: depende de Foundational y de los datos de US1 (T021 trabaja sobre T008–T013)
- **US3 (Phase 5)**: depende de Foundational y del banco de US1 (T023 usa `bancoContenido`)
- **Polish (Phase 6)**: depende de US1 (T026/T027 necesitan el banco real); T028/T029 al final

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational — es el MVP
- **US2 (P2)**: necesita el banco poblado (US1) para sus tests sobre datos reales; T019 (imports) y T018 (alcanzabilidad) dependen solo del ensamblado
- **US3 (P3)**: necesita el banco poblado (US1); su test estático es independiente del motor

### Within Each User Story

- Datos (T008–T013) antes de comprobar/validar (T014) y de los tests de carrera (T015)
- Tests de integridad (T016–T019) pueden escribirse antes de T021 (corrección guiada por fallo)
- Cálculos estáticos (T022) antes de la CLI (T023) y el test (T024)

### Parallel Opportunities

- T003 y T007 son paralelizables dentro de Foundational
- T008–T013 son seis ficheros independientes: paralelizables entre sí
- T016, T017, T018 y T019 son cuatro ficheros de test independientes: paralelizables
- T022 y T024 son paralelizables
- T026, T027 y T028 son paralelizables en Polish

---

## Parallel Example: User Story 1

```bash
# Importar los seis ficheros de datos en paralelo:
Task: "Importar contenido de verano en src/content/decisiones/verano/contenido.ts"
Task: "Importar personaje de verano en src/content/decisiones/verano/personaje.ts"
Task: "Importar contenido de febrero en src/content/decisiones/febrero/contenido.ts"
Task: "Importar personaje de febrero en src/content/decisiones/febrero/personaje.ts"
Task: "Importar condicionales de verano en src/content/condicionales/verano.ts"
Task: "Importar condicionales de febrero en src/content/condicionales/febrero.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1 (Setup)
2. Completar Phase 2 (Foundational) — CRÍTICO
3. Completar Phase 3 (US1)
4. **PARAR Y VALIDAR**: carrera completa con `bancoContenido`
5. Ya hay contenido jugable

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → carrera jugable con contenido real (MVP)
3. US2 → red de seguridad de integridad, alcanzabilidad y fronteras
4. US3 → informe de integridad
5. Polish → simulador sobre banco real (T17), docs y validación final

### Notes

- [P] = ficheros distintos, sin dependencias pendientes
- Los valores de efecto se copian literalmente de `docs/03`/`docs/04`; no se calibran aquí (T13)
- No inventar situaciones, textos ni nombres reales
- `npm run check` debe pasar al cerrar cada fase que toque `content`
