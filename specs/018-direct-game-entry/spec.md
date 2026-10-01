# Feature Specification: Entrada directa al juego y reanudación solo cuando hay partida guardada

**Feature Branch**: `018-direct-game-entry`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "la pantalla de empezar a jugar esta creo que seria mejor eliminarla y en la pantalla de intro podemos darle la opcion al usuario de empezar a jugar o continuar partida, asi quitamos una pantalla intermedia que no aporta mucho, me entiendes? es viable hacerlo?"

## Clarifications

### Session 2026-10-01

- Q: ¿Cuál de las dos pantallas de arranque se elimina? → A: la **pantalla intermedia de `/jugar`** (la que pide pulsar «Empezar»). La portada conserva una única llamada a la acción.
- Q: ¿Dónde se ofrecen «Empezar» y «Continuar» si la portada sigue siendo estática? → A: en `/jugar`. Al entrar se **detecta si hay partida empezada**: si la hay, se ofrecen las opciones actuales (nueva partida y continuar); si **no** la hay, el juego **empieza directamente**.
- Q: ¿Qué pasa con una carrera terminada guardada? → A: se trata como si no hubiera nada guardado: al volver se empieza directamente en la creación de personaje, sin pantalla de reanudación (la tarjeta final no se recupera localmente; sigue accesible por su enlace compartido).
- Q: ¿Dónde se muestra el aviso de guardado descartado, ahora que la pantalla de inicio puede no aparecer? → A: en ningún sitio: el descarte es **silencioso**; se retira el aviso puntual de la feature 005.
- Q: ¿Qué ocurre con la partida en curso al pulsar «Nueva partida»? → A: se **conserva hasta que la nueva partida se cree** (sin confirmación ni borrado inmediato); así un clic accidental no destruye el progreso.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empezar a jugar sin pantalla intermedia (Priority: P1)

Un visitante nuevo (sin partida guardada) entra en el juego y aparece **directamente la creación de personaje**. No tiene que pulsar ningún botón de «Empezar» intermedio antes de crear su personaje.

**Why this priority**: es el camino de la inmensa mayoría de primeras visitas; elimina un clic y una pantalla que no aportaban nada.

**Independent Test**: abrir el juego en un navegador limpio (sin partida guardada) y comprobar que lo primero que se ve es la creación de personaje, sin pantalla de inicio previa.

**Acceptance Scenarios**:

1. **Given** un navegador sin partida guardada, **When** el visitante entra a jugar, **Then** el juego muestra directamente la pantalla de creación de personaje.
2. **Given** la portada, **When** el visitante pulsa la llamada a la acción, **Then** llega al juego y puede crear su personaje sin un paso adicional.
3. **Given** un visitante que empieza a jugar sin guardado, **When** completa la creación de personaje, **Then** continúa el flujo normal (modalidad → variante → carrera) sin cambios.

---

### User Story 2 - Reanudar una partida en curso (Priority: P2)

Un jugador que dejó una partida a medias vuelve al juego y se le ofrece **continuar donde lo dejó** o **empezar una partida nueva**, antes de mostrar nada más.

**Why this priority**: evita perder el progreso de quien vuelve, sin imponer la pantalla de arranque a quien no tiene nada guardado.

**Independent Test**: crear una partida, avanzar un par de decisiones, recargar y comprobar que aparece la pantalla de reanudación con ambas opciones y que «Continuar» retoma el punto exacto.

**Acceptance Scenarios**:

1. **Given** una partida guardada en curso, **When** el jugador entra al juego, **Then** ve las opciones de continuar y de empezar una partida nueva.
2. **Given** la pantalla de reanudación, **When** el jugador elige continuar, **Then** retoma la partida en el punto exacto en que la dejó.
3. **Given** la pantalla de reanudación, **When** el jugador elige nueva partida, **Then** accede a la creación de personaje y el progreso anterior se conserva hasta que la nueva partida se cree.
4. **Given** una partida en curso, **When** el jugador recarga el juego, **Then** vuelve a ver la pantalla de reanudación (no entra directo a mitad de carrera).

---

### User Story 3 - Volver a empezar tras terminar la carrera (Priority: P3)

Un jugador que ya terminó su carrera y vuelve más tarde entra **directamente a crear un personaje nuevo**; no se le ofrece reanudar la carrera anterior ni se le bloquea con una pantalla intermedia.

**Why this priority**: mantiene el arranque igual de directo que en la primera visita y evita una pantalla extra; la tarjeta de la carrera anterior queda en su enlace compartido.

**Independent Test**: completar una carrera, recargar el juego y comprobar que se accede directo a la creación de personaje, sin opción de reanudar.

**Acceptance Scenarios**:

1. **Given** una carrera terminada guardada, **When** el jugador entra al juego, **Then** empieza directamente en la creación de personaje.
2. **Given** una carrera terminada guardada, **When** el jugador crea un personaje nuevo, **Then** el resultado anterior no reaparece ni bloquea la partida nueva.

---

### Edge Cases

- **Guardado descartado por incompatibilidad**: el descarte MUST ser **silencioso**; el juego empieza directamente en la creación de personaje sin mostrar ningún aviso. (Deroga el aviso puntual de la feature 005.)
- **Sin almacenamiento disponible** (modo privado, almacenamiento bloqueado): el juego MUST empezar directamente, sin errores visibles.
- **Recarga a mitad de carrera**: MUST aparecer la pantalla de reanudación, nunca entrar directo a la decisión en curso.
- **Carrera terminada guardada**: al volver, MUST NOT aparecer la pantalla de reanudación; el juego empieza directo en la creación de personaje y la tarjeta anterior no se recupera localmente.
- **Nueva partida con guardado existente**: el progreso anterior MUST conservarse hasta que la nueva partida se cree; si el jugador abandona antes de crearla, la partida anterior debe poder recuperarse.
- **Enlace compartido de resultado (`/r/[codigo]`)**: MUST seguir funcionando igual y no verse afectado por este cambio.
- **Botón atrás del navegador**: volver al juego tras abandonarlo MUST resolver el estado guardado con el mismo criterio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La portada MUST mantener una **única** llamada a la acción para jugar y MUST permanecer **estática (0 kB de JS)**; MUST NOT mostrar la opción de continuar.
- **FR-002**: Al entrar al juego, el sistema MUST comprobar si existe una partida guardada recuperable antes de decidir qué mostrar.
- **FR-003**: Si **no** existe partida guardada, el juego MUST empezar **directamente** en la creación de personaje, sin ninguna pantalla intermedia de inicio.
- **FR-004**: Si existe una partida **en curso**, el sistema MUST mostrar una pantalla de reanudación con las opciones de **continuar** y de **empezar una partida nueva**.
- **FR-005**: Si existe una carrera **terminada**, el sistema MUST NOT ofrecer reanudación: MUST empezar directamente en la creación de personaje, como si no hubiera nada guardado.
- **FR-006**: La opción **continuar** MUST retomar la partida en el punto exacto en que se dejó, conservando decisiones, atributos y año.
- **FR-007**: La opción **nueva partida** MUST llevar a la creación de personaje **sin borrar todavía** el guardado anterior; el guardado previo MUST sobrescribirse solo cuando la nueva partida se cree. Si el jugador abandona antes, la partida anterior MUST seguir siendo recuperable.
- **FR-008**: El descarte de un guardado no recuperable MUST ser **silencioso**: MUST NOT mostrarse ningún aviso al jugador. Esto **deroga** el aviso puntual de guardado descartado aprobado en la feature 005.
- **FR-009**: El **motor y el contenido** MUST NOT verse afectados por este cambio; el comportamiento del juego es idéntico una vez iniciada la partida.
- **FR-010**: El flujo MUST seguir concentrándose en una **única isla** de juego y MUST NOT añadir JavaScript a la portada ni a las páginas estáticas.
- **FR-011**: La primera pantalla de la partida (creación de personaje) MUST conservar su cabecera, disposición y comportamiento actuales.
- **FR-012**: El sistema MUST resolver el estado guardado de forma consistente al recargar, al volver con el botón atrás y al abrir el juego desde la portada.
- **FR-013**: El juego MUST NOT mostrar errores visibles cuando el almacenamiento no esté disponible o el guardado sea inválido; en su lugar, empezará directamente.

### Key Entities

- **Estado de partida guardada**: indica si no hay nada guardado, si hay una partida en curso o si hay una carrera terminada. Solo una partida **en curso** da lugar a la pantalla de reanudación; "ninguno" y "terminada" se comportan igual (entrada directa).
- **Pantalla de reanudación**: pantalla condicional que aparece **solo cuando hay una partida en curso**, con las opciones de continuar y de nueva partida.
- **Pantalla de creación de personaje**: primera pantalla del juego cuando se empieza de cero.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con un navegador sin guardado, el número de clics desde la portada hasta estar creando el personaje se reduce de **2 a 1**.
- **SC-002**: El **100%** de las primeras visitas sin guardado empiezan en la creación de personaje, con **0** pantallas intermedias.
- **SC-003**: Con una partida **en curso** guardada, aparece exactamente **1** pantalla de reanudación y ofrece **2** opciones (continuar / nueva partida); al elegir continuar se retoma el mismo punto en el **100%** de los casos.
- **SC-004**: La portada sigue sirviéndose con **0 kB de JavaScript** y sin opción de continuar.
- **SC-005**: El flujo afectado pasa **WCAG 2.2 AA** sin violaciones graves y sin scroll horizontal desde 320 px.
- **SC-006**: **0** regresiones en el determinismo de la partida: iniciar con la misma semilla y decisiones produce el mismo resultado que antes.
- **SC-007**: Con una carrera **terminada** guardada, aparecen **0** pantallas intermedias y el juego empieza directamente en la creación de personaje.

## Assumptions

- **Alcance**: arranque del juego (`/jugar`) y su relación con la portada; no cambia el bucle de juego ni el contenido.
- **Portada**: se mantiene tal cual (una sola llamada a la acción, estática); no se le añade detección de guardado.
- **«Partida empezada»**: se refiere a una partida **en curso**. Una carrera terminada se considera terminada y no se reanuda: la tarjeta final solo queda accesible por su enlace compartido, no por el guardado local.
- **Reutilización visual**: la pantalla de reanudación puede reutilizar los textos y el lenguaje visual del inicio actual, presentándose ahora de forma condicional.
- **Almacenamiento**: la detección se apoya en el guardado local existente; cuando no esté disponible, se comporta como si no hubiera partida.
- **Descarte silencioso**: se elimina el aviso puntual de guardado descartado (feature 005); el registro de decisiones cerradas deberá reflejar esta derogación.
- **Compatibilidad**: los códigos de partida y las tarjetas compartidas no cambian.
