# Research: Simulación masiva del motor

**Feature**: `002-massive-simulation` | **Date**: 2026-09-18

Resuelve las decisiones abiertas del plan. No había `NEEDS CLARIFICATION` en el Technical Context
(la spec ya se clarificó), así que se documentan las decisiones de diseño y sus alternativas.

## D1. Ubicación del simulador

- **Decision**: módulo puro en `src/simulacion/` + CLI delgado en `scripts/simular.ts`.
- **Rationale**: la lógica (perfiles, estadísticas, auditoría) debe ser testeable con Vitest sin lanzar
  procesos; el CLI solo parsea argumentos, resuelve el banco y presenta el informe. Mantiene el motor
  intacto y cumple las reglas de dependencia (`engine` nunca importa del simulador).
- **Alternatives considered**: (a) meter todo en `scripts/simular.ts` — imposible de testear bien y
  mezcla presentación con lógica; (b) añadirlo a `src/engine/` — viola el Principio I (el motor es solo
  lógica de juego, no perfiles de jugador ni agregación).

## D2. Convención sobre el azar del simulador

- **Decision**: el simulador no usa `Math.random()` ni `Date.now()`. Las decisiones del jugador se
  toman con `rngPara(seed, "jugador", perfilId, paso)`, ya exportado por el motor.
- **Rationale**: reproducibilidad exacta de un informe (FR-022) y coherencia con el Principio I. El
  tiempo de ejecución puede medirse con `performance.now()` **solo para informar**, y queda fuera del
  JSON comparable.
- **Alternatives considered**: RNG propio del simulador — duplicaría lógica y arriesgaría divergencias;
  `Math.random()` — rompe la reproducibilidad.

## D3. Definición de los tres perfiles

- **Decision**:
  - `aleatorio`: elige uniformemente entre las opciones del paso.
  - `codicioso`: elige la opción con mayor suma de efectos positivos en atributos artísticos
    (`letra`, `musica`, `puestaEnEscena`); empates resueltos por orden determinista de aparición.
  - `errático`: con probabilidad 1/2 (RNG del perfil) elige la opción de mayor cambio absoluto total
    (la más "arriesgada"); en caso contrario, uniforme.
- **Rationale**: cubre suelo (aleatorio), techo ingenuo (codicioso) y una estrategia de riesgo
  (errático) sin heurísticas complejas. Todas son deterministas y baratas.
- **Alternatives considered**: perfiles guiados por `flags` o por `saltaCOAC` — dependen de semántica de
  contenido que aún no existe; se pueden añadir como datos en el futuro.

## D4. Reparto de perfiles y configuraciones

- **Decision**: reparto balanceado por índice de carrera. Con `P` perfiles y `C` configuraciones,
  `perfil = perfiles[i % P]`, `configuracion = configuraciones[floor(i / P) % C]`, y
  `seed = <seedBase>-<i>`.
- **Rationale**: garantiza muestra equilibrada por perfil y configuración con una regla trivial de
  reproducir; evita sesgos de un reparto puramente aleatorio en muestras pequeñas.
- **Alternatives considered**: reparto por RNG — reproducible pero con varianza innecesaria; reparto
  exhaustivo de todas las combinaciones — innecesario en esta fase.

## D5. Banco de contenido inyectado

- **Decision**: `simular()` recibe un `BancoContenido` obligatorio. El CLI lo resuelve; mientras no
  exista el banco real de `content`, usa el banco de pruebas con una nota de deuda visible.
- **Rationale**: la spec exige no depender de un banco concreto (Assumptions). La dependencia del banco
  de fixtures queda aislada en el CLI, no en el módulo.
- **Alternatives considered**: importar el banco desde `src/content/` — aún no existe; hardcodear un
  banco — acoplaría el simulador a datos que cambiarán.

## D6. Uso del destino interno

- **Decision**: la auditoría y el informe de años de pico leen `Partida.destino` (dato interno). Ese
  acceso es solo de diagnóstico; nada de la salida se dirige al jugador.
- **Rationale**: FR-015 (años de pico) y varias reglas de estados imposibles necesitan el techo y la
  duración de carrera. El Principio I prohíbe exponer el destino al jugador, no inspeccionarlo en una
  herramienta interna de balance.
- **Alternatives considered**: no usar `destino` — imposibilitaría métricas exigidas por la spec.

## D7. Definición de métricas ambiguas

- **Decision**:
  - "No supera una fase" = la mejor fase alcanzada es igual o anterior a esa fase.
  - "No supera preliminares" = mejor fase `preliminares`.
  - "No concursó nunca" se cuenta aparte (todas las temporadas `fueraDeConcurso`).
  - "Primeros premios" = temporadas con `fase === "final"` y `puesto === 1`; se informa media por carrera.
  - "Premios" = premios ajenos por tipo (recuento total y % de carreras que lo logran).
  - "Duración" = número de temporadas registradas.
  - "Atributos mín/máx/medios" = sobre el estado final de cada carrera.
- **Rationale**: fija una interpretación única y testable de cada métrica mínima exigida.
- **Alternatives considered**: medir atributos por temporada — más ruido y menos útil para balance.

## D8. Auditoría de estados imposibles

- **Decision**: una función pura `auditarCarrera(partida)` devuelve una lista de hallazgos, uno por
  regla incumplida, con `{ regla, seed, perfilId, detalle }`. Implementa el catálogo de FR-019
  (13 reglas) y está diseñada para ampliarse.
- **Rationale**: FR-019 pide el catálogo más amplio posible; centralizar las reglas en una función pura
  facilita tests por regla y futuras ampliaciones.
- **Alternatives considered**: validaciones dispersas dentro de la agregación — difícil de testear y de
  ampliar.

## D9. Salida del informe

- **Decision**: `formatearInforme(informe): string` para consola y serialización JSON del mismo objeto.
  El flag `--json <ruta>` vuelca el informe; sin él, solo texto.
- **Rationale**: cubre US4 con coste mínimo y sin herramienta de diff propia (decidido en `/speckit.clarify`).
- **Alternatives considered**: JSON por defecto — peor lectura humana; comando de comparación — alcance extra.

## D10. Errores y código de salida

- **Decision**: ante un `Paso` de tipo `error` o una excepción en una carrera, el simulador la registra
  agregada por tipo, continúa con el resto y, si hubo algún error, el proceso termina con código ≠ 0.
- **Rationale**: decisión de `/speckit.clarify` Q4; no se pierde el informe y se detecta en automatización.
- **Alternatives considered**: abortar al primer error — pierde el resto de la muestra.

## D11. Rendimiento

- **Decision**: un único proceso, sin concurrencia, sin dependencias nuevas; recorrer 10.000 carreras
  en memoria. Si no se cumpliera el objetivo de 30 s, se evaluaría `worker_threads` como última opción.
- **Rationale**: la simulación actual de 10.000 carreras tarda ~1,3 s; el margen es amplio y YAGNI
  desaconseja concurrencia prematura.
- **Alternatives considered**: paralelizar con workers — complejidad no justificada por los datos.

## D12. Gestión de "situaciones más/menos frecuentes" y condicionales

- **Decision**: durante la partida se registra el `id` de cada situación servida por `siguientePaso`
  (incluidas las condicionales). Al final, se cruza con el banco: situaciones del banco nunca vistas,
  condicionales del banco nunca disparados, y ranking de frecuencia.
- **Rationale**: `Paso.decision.situacion.id` y el banco permiten responder FR-016 y FR-017 sin tocar
  el motor.
- **Alternatives considered**: instrumentar el motor para emitir eventos — innecesario y violaría la
  separación.
