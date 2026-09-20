# Feature Specification: Decisiones que no afectan al resultado

**Feature Branch**: `008-narrative-decisions`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Quiero dejar claro que las decisiones que tomamos no afectan al resultado de la carrera. Es decir, las decisiones no deben mejorar atributos, a menos que declaremos que esa situación específica mejora atributos, pero puede ser como un boost temporal que después provoca una caída más gorda. O una decisión en la que hay un porcentaje del 60% de que sea una buena decisión y un 40% de que sea mala. Por ejemplo, sale una situación en febrero: estás en semifinales y tienes la final a tu alcance: (a) te guardas el mejor pasodoble para la final (menos opción de pasar a la final pero mayor opción de ganar si pasas) — eso sería visible para el usuario; (b) cantas tu mejor pasodoble (más opción de pasar a la final pero menos opción de ganar si pasas). Pero eso es para momentos muy específicos. Lo que quiero decir es que si en una carrera estás destinado a no pasar ni a semifinales, no porque tomes buenas decisiones de repente se llega a la final. Porque, como hemos dicho desde el principio al crear el juego, el juego no tiene malas ni buenas decisiones: consiste en darle al usuario una historia y una narrativa. Con las mismas decisiones, una partida puede hacerte no pasar ni a semifinales y otra hacerte ganar 5 primeros premios seguidos. Obviando estos boo(s)t momentáneos de decisiones."

## Clarifications

### Session 2026-09-20

- Q: ¿Qué papel tienen los atributos y cómo se determina el resultado? → A: El resultado de base lo determinan el **destino oculto + el azar**; los atributos parten de un **valor estándar** y no cambian salvo que una decisión concreta los mejore o empeore. Cambio mínimo: no se rediseña el motor, se revisa lo justo.
- Q: ¿Cómo actúa una excepción declarada? → A: **Modificando atributos** (mejorándolos o empeorándolos), que luego influyen en el resultado a través del cálculo de puntuación, acotado por el techo del destino.
- Q: ¿Qué se hace con los `efectos` del banco actual? → A: El banco queda **mayoritariamente sin efectos**; solo **unas pocas** decisiones se conservan como excepciones declaradas. Lo importante es la historia.
- Q: ¿Entran los efectos especiales (diferido e incierto) en esta feature? → A: No. Solo excepciones **inmediatas** de atributos; el efecto diferido (impulso con caída posterior) y el resultado incierto (60/40) quedan **fuera de alcance** y se valorarán más adelante.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mis decisiones cuentan una historia, no optimizan el resultado (Priority: P1)

El jugador toma decisiones porque quiere decidir quién es y qué hace, no porque una opción sea mejor que otra. El desenlace de la carrera lo marca el destino oculto de cada partida y el azar, no una supuesta jugada óptima. Dos carreras con decisiones parecidas pueden acabar muy distintas, y no existe una "ruta ganadora".

**Why this priority**: es la promesa central del juego (historia, no estrategia). Sin esto, el jugador optimiza y el juego deja de ser Coplero.

**Independent Test**: con el mismo destino oculto, jugar combinaciones de decisiones distintas y comprobar que no existe una opción sistemáticamente mejor: la distribución de resultados no cambia de forma estadísticamente significativa por decidir de una manera u otra.

**Acceptance Scenarios**:

1. **Given** una carrera, **When** el jugador elige cualquier opción, **Then** el resultado de la temporada no depende de esa elección salvo excepciones declaradas.
2. **Given** el mismo destino oculto, **When** se simulan muchas carreras con decisiones distintas, **Then** la distribución de fases alcanzadas no favorece sistemáticamente a ninguna estrategia.
3. **Given** una carrera destinada a no pasar de cuartos, **When** el jugador "decide bien" durante toda la carrera, **Then** no llega a la final: el destino se respeta.
4. **Given** una carrera destinada a ganar, **When** el jugador decide de cualquier manera, **Then** puede ganar igualmente.

---

### User Story 2 - Momentos decisivos con efecto real y visible (Priority: P2)

En contados momentos de la carrera el jugador se enfrenta a una disyuntiva de verdad: una opción mejora unos atributos y empeora otros (por ejemplo, guardarse el mejor pasodoble para la final), y el jugador **ve** la contrapartida. Siguen sin ser "buenas" o "malas": son apuestas con contrapartida, acotadas por el destino.

**Why this priority**: rompe la monotonía y da los momentos memorables que hacen la historia interesante, pero solo tiene sentido cuando la regla base (US1) ya está garantizada.

**Independent Test**: llegar a una situación declarada como excepción, elegir cada opción y comprobar que mueve los atributos declarados, que el intercambio es visible y que el efecto queda acotado por el destino.

**Acceptance Scenarios**:

1. **Given** una situación declarada como excepción, **When** el jugador elige una opción, **Then** los atributos cambian (suben o bajan) según lo declarado y, con ellos, el desenlace de esa temporada dentro del techo.
2. **Given** esa misma situación, **When** se muestra al jugador, **Then** el intercambio es visible y comprensible sin explicaciones externas.
3. **Given** el intercambio "mejora unos atributos y empeora otros", **When** se simula muchas veces, **Then** ambas opciones producen tasas distintas y acordes a lo declarado.
4. **Given** una excepción en una carrera con techo bajo, **When** se elige la opción más favorable, **Then** el resultado sigue sin superar el techo del destino.

---

### Edge Cases

- **Decisiones con el mismo efecto en todas las opciones**: no deben introducir diferencias de resultado (serían excepciones vacías).
- **Excepción que empujaría por encima del techo**: se acota; el destino manda.
- **Excepciones repetidas en la misma carrera**: debe quedar claro si se acumulan o no.
- **Sin excepciones en toda una carrera**: es lo normal; no debe pasar nada especial.
- **Contenido antiguo con efectos por defecto**: debe declararse como excepción o perder el efecto; nunca colarse como mecánica oculta.
- **El jugador no puede deducir el destino**: las excepciones no deben delatar el techo.
- **Determinismo**: mismas decisiones y misma semilla ⇒ mismo resultado, siempre.

## Requirements *(mandatory)*

### Functional Requirements

**Regla base: las decisiones no afectan al resultado**

- **FR-001**: Por defecto, una opción MUST NOT modificar atributos ni el desenlace de la carrera; los atributos parten de un **valor estándar** y solo cambian por excepciones declaradas.
- **FR-002**: El desenlace de cada temporada MUST depender del destino oculto (suelo y techo), del azar y de los modificadores globales de la carrera, no de las decisiones del jugador, salvo excepciones declaradas.
- **FR-003**: MUST NOT existir una estrategia óptima: ninguna secuencia de decisiones puede mejorar sistemáticamente el resultado.
- **FR-004**: Una carrera con techo bajo MUST NOT poder alcanzar un resultado por encima de ese techo por "decidir bien" (salvo el milagro ya existente).
- **FR-005**: La UI MUST NOT presentar pistas de cuál es la opción "mejor"; no hay opciones buenas ni malas.

**Excepciones declaradas**

- **FR-006**: Las excepciones declaradas MUST actuar **modificando atributos** (mejorándolos o empeorándolos); su efecto llega al resultado a través del cálculo de puntuación, siempre acotado por `[suelo, techo]`. No modifican directamente el avance ni la victoria.
- **FR-007**: El efecto de una excepción MUST ser visible y comprensible para el jugador antes de elegir (no puede ser una mecánica oculta).
- **FR-008**: Las excepciones MUST estar declaradas por el contenido, no deducidas de forma implícita por el motor.
- **FR-009**: Las excepciones MUST respetar el destino: su efecto MUST quedar acotado por `[suelo, techo]`, salvo el milagro ya contemplado.
- **FR-010**: MUST poder modelarse disyuntivas con intercambio (una opción mejora unos atributos y empeora otros, de modo que el jugador ve una contrapartida).
- **FR-011**: Una excepción MUST NOT alterar la regla base para el resto de decisiones: solo afecta a su propia situación o temporada.

**Contenido y datos**

- **FR-012**: Las opciones del banco sin excepción declarada MUST quedar sin `efectos` mecánicos.
- **FR-013**: El banco MUST quedar mayoritariamente **sin efectos**; solo **unas pocas** decisiones MUST conservarse como excepciones declaradas con efecto sobre atributos. Las opciones del banco actual que hoy tienen `efectos` MUST revisarse para conservar solo esas pocas; el resto queda como narrativa pura.
- **FR-014**: Debe quedar claro, para quien edita contenido, cómo se marca una excepción. Solo hay un tipo: **cambio inmediato de atributos**, con intercambio visible.

**Determinismo y verificación**

- **FR-015**: El sistema MUST seguir siendo determinista: misma semilla y mismas decisiones ⇒ mismo resultado, excepciones incluidas.
- **FR-016**: MUST verificarse con simulación masiva que no existe estrategia dominante y que las excepciones no rompen el techo.

### Key Entities *(include if data involved)*

- **Decisión (narrativa)**: elección del jugador que da forma a la historia y NO altera el desenlace por defecto.
- **Excepción declarada**: situación u opción marcada explícitamente como con efecto real sobre esa temporada, visible para el jugador y acotada por el destino.
- **Intercambio**: disyuntiva en la que una opción mejora unos atributos y empeora otros.
- **Destino (oculto)**: techo, suelo, año pico, volatilidad y carisma; sigue siendo el que manda en el resultado y nunca se muestra.
- **Atributos**: estado del personaje; parten de un valor estándar y no cambian por decidir, salvo excepciones declaradas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una simulación de al menos 10.000 carreras, ninguna estrategia de decisión mejora sistemáticamente la distribución de resultados (diferencias dentro del margen estadístico).
- **SC-002**: En el 100% de los casos, ninguna carrera alcanza un resultado por encima de su techo por efecto de decisiones (salvo el milagro ya existente).
- **SC-003**: El 100% de las opciones que producen efecto sobre el resultado están declaradas como excepciones; 0 efectos implícitos.
- **SC-004**: El 100% de las excepciones muestran al jugador su intercambio antes de elegir.
- **SC-005**: La distribución objetivo del diseño (`docs/01` §7: ~45% pisa la final, ~10% no pasa de cuartos, ~7% no pasa de preliminares) se mantiene sin depender de las decisiones.
- **SC-006**: Repetir la misma partida (semilla + decisiones) produce exactamente el mismo resultado en el 100% de los casos.

## Assumptions

- **Cambio mínimo (2026-09-20)**: se conserva el cálculo de puntuación actual (`coac.ts`); no se rediseña el motor. El resultado se fía al destino + azar, y los atributos se quedan en su valor estándar salvo excepciones declaradas.
- **El destino oculto sigue mandando**: techo, suelo, añopico, volatilidad y carisma no cambian con esta feature; nunca se muestran.
- **Revisa decisiones cerradas**: esta feature **matiza** `docs/01` §2 ("cada opción lleva… los atributos que mueve"), la fórmula de resultado de `docs/02` §8 (`puntuación = 0.40·letra + …` acotada por `[suelo, techo]`) y la calibración T13, que hoy asume que los atributos crecen con las decisiones. La contradicción queda registrada en `docs/registro/decisiones-pendientes.md` (C15).
- **Las excepciones son la excepción, no la norma**: la mayoría de las decisiones del banco serán narrativa pura.
- **Fuera de alcance (2026-09-20)**: el efecto **diferido** (impulso con caída posterior) y el resultado **incierto** (60/40) no entran en esta feature; se valorarán más adelante como contenido o como mecánica.
- **Sigue el determinismo**: todo el azar (incluido el de las excepciones) sale del RNG sembrado; nada de `Math.random()` ni `Date.now()`.
- **Dependencia inversa**: la feature **009 · Panel de contenido** depende de esta, porque define si una opción tiene efecto y de qué tipo; se retoma después.
- **Sin cambios de UI en esta feature**: la UI actual (una isla, mobile-first) sigue igual; a lo sumo, mostrará el intercambio de una excepción.
- **El simulador es la herramienta de validación** (`npm run simular`), como en el resto del proyecto.
