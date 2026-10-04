# Research: Motor determinista de Coplero (ENGINE-001)

Fase 0. Resuelve las incógnitas técnicas del plan. Fuentes: `docs/01`–`docs/06`,
`docs/registro/`, `AGENTS.md`, la constitución y prácticas establecidas para motores deterministas.

## D1 · Algoritmo de PRNG

**Decision**: `mulberry32` (ya presente en `src/engine/seed.ts`), ampliado con derivación por
contexto.

**Rationale**: Es determinista, rápido, ocupa pocas líneas y devuelve flotantes en [0,1) de calidad
suficiente para un juego de decisiones. No requiere dependencias. El scaffold ya lo usa, evitando
reescritura.

**Alternatives considered**: `xoshiro128**` (mejor calidad estadística pero más estado y más código);
PRNG criptográfico (innecesario y no reproducible entre entornos sin más configuración).

## D2 · Derivación de la semilla por contexto

**Decision**: Una función `rngPara(seed, contexto)` crea un `mulberry32` sembrado con un hash de 32
bits (estilo `cyrb128`/`splitmix32`) de la cadena `seed|año|momento|propósito|contador`. Cada
decisión azarosa pide un flujo nuevo con su contexto en vez de compartir un único flujo global.

**Rationale**: Cumple el requisito de "hash de seed + año + momento + contador" (`docs/02` §7) y
hace que el resultado no dependa del orden accidental de llamadas: dos ejecuciones con el mismo
contexto producen el mismo valor.

**Alternatives considered**: Un único PRNG global avanzado secuencialmente (frágil ante cambios de
orden de código); usar `seed` directamente como estado (mala distribución).

**Estabilidad de claves (post-análisis)**: las claves de contexto son tokens estables y versionados
(p. ej. `'destino'`, `'seleccion_verano'`); renombrarlas es un cambio incompatible y debe hacerse
junto a un bump de versión de contenido (`FR-026`).

## D3 · Inyección del banco de contenido

**Decision**: El banco se pasa por parámetro (`BancoContenido`) a `crearPartida`, `siguientePaso` y
`elegir`. El `engine` no importa de `content` y el banco no forma parte del estado serializable.

**Rationale**: Respeta la regla de dependencias (`AGENTS.md`, constitución I/II) y la clarificación
Q1-A; permite tests con bancos mínimos y que el banco crezca sin tocar el motor.

**Alternatives considered**: importar `content` desde `engine` (viola la regla); guardar el banco en
el estado (infla la serialización y rompe la separación datos/estado).

## D4 · Serialización y versión de esquema

**Decision**: `serializar(partida): string` produce JSON; `deserializar(json): Resultado<Partida,
ErrorMotor>`. Si `version` no coincide, se devuelve un error explícito `VERSION_INCOMPATIBLE`; el
motor no migra ni descarta.

**Rationale**: Clarificación Q3-A. Mantiene el motor puro y deja la política de persistencia al
consumidor (`localStorage` en la web).

**Alternatives considered**: migración automática (compleja y prematura); descarte silencioso (pérdida
de datos sin control del consumidor).

## D5 · Ranuras fijas por momento (revisado 2026-10-04)

- **Decision**: la decisión del año se elige por **momento**: una situación de `verano` y otra de `febrero`, del pool completo de cada momento. Se retira el reparto por **tipo** (contenido/personaje) que esta decisión describía.
- **Rationale**: el tipo no aportaba mecánica (solo era una regla artificial de reparto); cada momento es un único pool (ver `docs/01` §5).
- **Alternatives considered**: mantener el reparto por tipo — descartado por complejidad sin valor.

## D5 (histórico) · Orden y tipo de las decisiones dentro del año

**Decision**: El año tiene dos ranuras (verano, febrero). Se garantiza **una situación de contenido y
una de personaje por año**. En vez de forzar "verano = contenido" (que dejaría sin usar medio banco
de verano), el motor decide al inicio del año qué ranura lleva cada tipo, eligiendo de forma
determinista (RNG) entre las combinaciones que tengan candidatas.

**Rationale**: Respeta `docs/01` §5 ("una de contenido + una de personaje") sin contradecir la
distribución real del banco, y evita el sesgo del pseudo-código de `docs/02` §9.

**Alternatives considered**: forzar contenido en verano (contradice el banco: hay mucho personaje en
verano); dejar el tipo libre en ambas ranuras (podría dar dos del mismo tipo, prohibido).

**Adoptada (post-checklist)**: regla definitiva para ENGINE-001 (reflejada en `spec.md` FR-006 y
Assumptions); un cambio futuro solo afectaría a `selector.ts`.

## D6 · Cálculo del `puesto`

**Decision**: El `puesto` se compone de **banda por fase** + **posición dentro de la banda**:
finalistas 1-4; semifinalistas no finalistas 5-10; eliminados en cuartos 11-16; eliminados en
preliminares desde el 17. La posición exacta dentro de la banda se deriva de la `puntuación` de la
temporada mediante umbrales configurables (`ParametrosMotor.puesto`), con desempate por RNG.

**Rationale**: Clarificación Q2 (bandas) y Q2-A (parámetros configurables). Permite distinguir "5.º de
semifinales" de "10.º" sin simular todo el campo.

**Alternatives considered**: sortear el puesto uniformemente en la banda (pierde relación con el
mérito); modelar todos los participantes (coste y complejidad innecesarios).

**Afinidad inyectada y desempate (post-análisis)**: las definiciones de afinidad por premio se
inyectan como parámetros (`{ umbralPuesto, pesosAtributos, flagsAfinidad }`); el motor solo evalúa, sin
fijar vocabulario de contenido (`FR-011`). La selección ponderada usa **desempate determinista**
(orden estable derivado del RNG contextual).

## D7 · Modelo de errores

**Decision**: Las operaciones que pueden fallar por entrada o estado (`elegir`, `deserializar`,
`siguientePaso`) devuelven un resultado discriminado `{ ok: true, valor } | { ok: false, error }` con
códigos tipados (`VERSION_INCOMPATIBLE`, `OPCION_INVALIDA`, `CONTENIDO_INSUFICIENTE`). Los errores de
programación (invariantes internas) no se modelan como datos.

**Rationale**: Testeable y sin excepciones como flujo normal; encaja con el carácter puro del reducer.

**Alternatives considered**: lanzar excepciones para todo (peor para tests y composición);
devolver `undefined`/`null` (pierde el motivo del fallo).

## D8 · Codec de URL fuera de alcance

**Decision**: `serializar`/`deserializar` usan JSON plano. La compresión con `fflate` y la
codificación base64url (módulo `codec.ts`) quedan para una feature posterior.

**Rationale**: Los objetivos de ENGINE-001 piden estado serializable y resumen, no el enlace
compartible. Mantiene el motor sin dependencias de runtime.

**Alternatives considered**: incluir el codec ahora (añade dependencia y superficie sin necesidad).

**Confirmado en el spec**: JSON plano con campo `version` (FR-027).

## D9 · Degradación cuando no hay candidatas

**Decision**: Al no haber situaciones que cumplan todos los filtros, se aplica la cadena B→D: (1)
relajar filtros opcionales (`modalidades`, `variantes`, `minAno`); (2) si sigue sin haber candidatas,
reutilizar las vistas menos recientes ignorando `unicaVez`. El `momento` nunca se
relaja. Si aun así no hay ninguna, `CONTENIDO_INSUFICIENTE`.

**Rationale**: Clarificación Q4 (B→D) y `FR-018`.

**Alternatives considered**: error directo (rompe la partida); reutilizar sin relajar (puede fallar
aunque existan candidatas válidas cercanas).

## D10 · Momento del resultado respecto a la decisión de febrero

**Decision**: El resultado del COAC de la temporada se calcula con el estado **posterior a verano y
anterior a la decisión de febrero**; los efectos de la decisión de febrero no alteran el resultado de
esa temporada y aplican hacia adelante. El resultado se expone después de la decisión.

**Rationale**: Clarificación Q5 (`FR-024`). Coherente con "la decisión no afecta al resultado".

**Alternatives considered**: dejar que febrero afecte al mismo año (contradice Q5).

## D11 · Estrategia de test y presupuesto de rendimiento

**Decision**: Suites Vitest por módulo (determinismo, selector, condicionales, coac, premios,
serialización, resumen) más una simulación de **10.000 carreras** con **presupuesto provisional de 30
s** en hardware de desarrollo. El presupuesto es un valor de partida a ajustar con la calibración.

**Rationale**: `docs/02` §11 y constitución III. El presupuesto concreto era un punto diferido (SC-004).

**Alternatives considered**: no fijar umbral (regresiones no detectadas); benchmark por entorno (poco
práctico en CI inicial).

## D12 · Inmutabilidad

**Decision**: El reducer devuelve siempre un objeto nuevo. Se usan copias superficiales (`{ ...p }`)
y reconstrucción de los subobjetos que cambian (atributos, flags, arrays). No se muta la entrada.

**Rationale**: `FR-015`; evita bugs de estado compartido y facilita tests de pureza.

**Alternatives considered**: mutar y devolver (rompe la pureza y el determinismo perceptual).

## D13 · Alcance del determinismo y estabilidad

**Decision**: El determinismo se delimita así: el estado final depende **solo** de la semilla, el
input de creación, la secuencia de decisiones y la versión del banco de contenido. Es independiente
del proceso, del sistema operativo y del momento de ejecución. La obtención de azar se deriva del
contexto (D2), por lo que alterar el orden de llamadas o refactorizar módulos no cambia resultados
para la misma semilla, input y banco. Añadir o modificar situaciones del banco **sí** puede cambiar
resultados y se considera una nueva versión de contenido.

**Rationale**: `FR-004` y `FR-026`; permite comparar resultados entre entornos y evita regresiones
accidentales por refactor.

**Alternatives considered**: aceptar dependencia del orden de ejecución (rompe reproducibilidad);
congelar el banco por hash dentro del estado (complejidad innecesaria en esta fase).

## D14 · Alcance del snapshot de referencia

**Decision**: El snapshot captura el **estado serializado completo** (`Partida`, incluido `destino`)
y el `ResumenCarrera` de una carrera de referencia con semilla y secuencia de decisiones fijas. El
banco se inyecta desde fixtures y **no** se captura. Sirve como test de regresión, no como dato
compartible.

**Rationale**: `SC-002`/`FR-003`; el `destino` es interno, así que puede aparecer en un artefacto de
test, pero nunca en el resumen compartible (`FR-002`).

**Alternatives considered**: capturar solo el resumen (no detecta regresiones internas); capturar el
banco (ruido y acoplamiento innecesarios).

## D15 · Refinamientos post-análisis

**Decision**: tras el análisis de consistencia se fijan: (a) el orden anual es verano → febrero →
COAC, y la retirada se evalúa al cierre del año (sin retirada a mitad de año); (b) `serializar`
incluye el destino (estado interno) y el código compartible que lo excluye queda fuera de alcance;
(c) el filtro `variantes` contra una variante no alcanzable se detecta como contenido inalcanzable;
(d) la afinidad de premios se inyecta; (e) el año base es una constante fija; (f) desempate
determinista en selecciones ponderadas.

**Rationale**: Resuelve C1–C3, U7, U8, U10 (spec/plan/tasks/contratos) y mantiene la coherencia con la
constitución (Principios I–III).

**Alternatives considered**: dejar la ambigüedad para implementación (riesgo de rework y de romper
determinismo).

## Sin NEEDS CLARIFICATION pendientes

Todas las incógnitas del `Technical Context` quedan resueltas. La asignación de tipo por momento (D5)
se adopta como definitiva para ENGINE-001 y la serialización queda fijada en JSON plano (D8).
