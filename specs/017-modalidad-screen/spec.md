# Feature Specification: Pantalla de selección de modalidad y cabecera estable del flujo previo

**Feature Branch**: `017-modalidad-screen`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Extrapolar los estilos de la pantalla de creación de personaje a la de selección de modalidad; que la cabecera (título y subtítulo) cuadre exactamente en el mismo punto que en crear personaje; añadir un subtítulo tipo 'Purpurina o plumero'; que los botones de Comparsista y Chirigotero compartan el estilo de las tarjetas de género; extrapolar el fondo de puntos; y definir cómo fijar la posición del título y el subtítulo en todos los dispositivos (como se hizo en las pantallas de verano e invierno)."

## Clarifications

### Session 2026-10-01

- Q: ¿Alcance de pantallas a homogeneizar? → A: Modalidad y variante. La intro se abordará más adelante, pero mantendrá este mismo estilo.
- Q: ¿Alcance del fondo de puntos? → A: Todas las pantallas del juego (incluidas verano, febrero, resultado y fin) y también la portada (index) y la intro, pero siempre **por detrás** de las escenas SVG, que lo tapan donde son opacos.
- Q: ¿Texto literal del subtítulo? → A: "Purpurina o plumero".
- Q: ¿El objetivo principal es que el título y el subtítulo de modalidad queden en la misma posición y con el mismo estilo que los de crear-personaje? → A: Sí; es el objetivo principal de la feature (posición idéntica y estilo idéntico).
- Q: ¿La cabecera debe permanecer fija también en ventanas bajas (con scroll) y con contenidos de distinta altura? → A: Sí; debe mantenerse a la misma posición en todas las pantallas y tamaños (causa detectada: el centrado del contenedor desplazaba la sección según su contenido).
- Q: ¿La pantalla de selección de variante también lleva subtítulo? → A: Sí, “Elige tu estilo”.
- Q: ¿Cómo debe comportarse la textura de puntos respecto al pie y a la escena? → A: El pie NO lleva textura; los puntos solo se ven en la cabecera y fuera del área de juego, nunca sobre la escena SVG, de forma consistente en todas las pantallas. (La parte de “cabecera” queda sustituida por la decisión del header negro sin textura, más abajo.)
- Q: ¿Alcance de la textura tras la revisión visual? → A: Solo en las pantallas previas a partida (crear-personaje, modalidad y variante) y en la portada. Se retira por completo (cabecera incluida) en verano, febrero, resultado y fin; también en la intro. (Sustituye a la respuesta anterior sobre la escena.)
- Q: ¿Cómo debe ser el header del sitio? → A: Fondo negro plano (`--c-fondo`) y anclado arriba con `position: sticky; top: 0` en todas las páginas, sin textura de puntos, sin alterar la altura `--alto-cabecera` ni los cálculos de altura del resto de pantallas.
- Q: ¿Se mantiene la textura de puntos en alguna pantalla? → A: No; se retira de todas partes (portada, intro, flujo previo, escenas y header). Sustituye a las respuestas anteriores sobre el alcance de la textura.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir modalidad con el mismo lenguaje visual que crear personaje (Priority: P1)

Tras crear su personaje, el jugador llega a la pantalla de selección de modalidad y la percibe como una continuación natural de la anterior: mismo título y subtítulo, misma tipografía y color de acento, fondo de puntos y dos tarjetas seleccionables para Comparsista y Chirigotero con el mismo aspecto que las tarjetas de género. El mismo lenguaje se mantiene en la siguiente pantalla de selección de variante.

**Why this priority**: es el objetivo central de la petición y lo que el jugador ve de inmediato; sin esto, el salto entre pantallas se percibe como un producto distinto.

**Independent Test**: partiendo de la creación de personaje, avanzar y comprobar que la pantalla de modalidad muestra título, subtítulo y dos tarjetas con el mismo lenguaje visual; al pulsar una tarjeta, el flujo avanza como hasta ahora.

**Acceptance Scenarios**:

1. **Given** el jugador ha completado la creación de personaje, **When** aparece la pantalla de modalidad, **Then** ve un título, un subtítulo y dos tarjetas (Comparsista y Chirigotero) con el mismo lenguaje visual que la pantalla anterior.
2. **Given** la pantalla de modalidad, **When** el jugador pulsa una de las dos tarjetas, **Then** el flujo avanza a la selección de variante como hasta ahora.
3. **Given** el jugador ha elegido modalidad, **When** aparece la pantalla de variante, **Then** mantiene el mismo lenguaje visual (cabecera, fondo de puntos y tarjetas) que modalidad y creación.

---

### User Story 2 - Cabecera idéntica en posición y estilo entre pantallas (Priority: P2)

El título y el subtítulo de la pantalla de modalidad aparecen exactamente en la misma posición vertical **y con el mismo estilo** (tipografía, tamaño, color y uso de mayúsculas) que los de la creación de personaje, de modo que al avanzar la cabecera no “salta” ni cambia de aspecto. Este es el objetivo principal de la feature.

**Why this priority**: la continuidad visual depende de que la cabecera sea idéntica en sitio y estilo; hoy la diferencia de posición medida es de ~159 px entre ambas pantallas.

**Independent Test**: en un mismo tamaño de ventana, medir la posición vertical del título y del subtítulo en ambas pantallas y comprobar que coinciden, y comparar sus estilos computados (tipografía, tamaño, color); repetir en varios tamaños soportados.

**Acceptance Scenarios**:

1. **Given** un mismo tamaño de ventana, **When** se mide la parte superior del título en la pantalla de creación y en la de modalidad, **Then** la diferencia es de 2 px o menos.
2. **Given** un mismo tamaño de ventana, **When** se mide la parte superior del subtítulo en ambas pantallas, **Then** la diferencia es de 2 px o menos.
3. **Given** las dos pantallas, **When** se comparan los estilos del título y del subtítulo, **Then** tipografía, tamaño, color y uso de mayúsculas coinciden.
4. **Given** un móvil alto y uno bajo, **When** se recorre el flujo, **Then** la cabecera mantiene su posición y ningún contenido queda recortado.

---

### User Story 3 - Sin fondo de puntos en ninguna pantalla (Priority: P3)

La textura de puntos se retira **por completo** del producto: no aparece en la portada, ni en la intro, ni en el flujo previo a partida (crear-personaje, modalidad, variante), ni en las escenas (verano, febrero, resultado, fin), ni en el header ni en el pie.

**Why this priority**: la revisión visual descarta la textura; se conserva el resto de la identidad (tipografía, color de acento y tarjetas).

**Independent Test**: recorrer portada, intro, flujo previo y una carrera completa y comprobar que no hay textura de puntos en ninguna parte.

**Acceptance Scenarios**:

1. **Given** la portada, la intro o cualquier pantalla del juego, **When** se observa el fondo, **Then** no aparece la textura de puntos.
2. **Given** el header o el pie, **When** se observan, **Then** no muestran la textura de puntos.

---

### User Story 4 - Header negro anclado en todo el sitio (Priority: P3)

El header del sitio (la marca “Coplero”) aparece sobre un **fondo negro plano** y queda **anclado arriba**: al hacer scroll se sobrepone al contenido. No muestra la textura de puntos y no altera las alturas reservadas del resto de pantallas.

**Why this priority**: da coherencia a todo el sitio y evita que la textura aparezca en la cabecera; al ser *sticky* no descuadra los cálculos `100dvh − cabecera` del juego.

**Independent Test**: en cualquier página, comprobar que el header tiene fondo opaco, `position: sticky` y `top: 0`; hacer scroll y verificar que sigue visible y que la altura `--alto-cabecera` no cambia.

**Acceptance Scenarios**:

1. **Given** cualquier página del sitio, **When** se observa el header, **Then** tiene fondo negro plano, sin textura de puntos, y está anclado arriba.
2. **Given** una página con scroll, **When** se hace scroll, **Then** el header permanece visible y se sobrepone al contenido.
3. **Given** el juego, **When** se cambia de pantalla o se hace scroll, **Then** la altura reservada `--alto-cabecera` y los cálculos `100dvh − cabecera` no cambian.

---

### Edge Cases

- **Ventanas muy bajas**: el contenido no debe recortarse; se permite desplazamiento vertical cuando no quepa, pero la cabecera mantiene su posición.
- **Subtítulo de dos líneas**: el título no debe desplazarse ni en una pantalla ni en la otra.
- **Ancho mínimo (320 px)**: sin desbordamiento horizontal y sin que el texto de las tarjetas se parta de forma fea.
- **Textos largos en las tarjetas**: la tarjeta crece en alto sin desalinear el resto.
- **Textura de puntos**: no debe aparecer en ninguna pantalla, ni en el header ni en el pie.
- **Header anclado**: al ser *sticky* no debe alterar la altura `--alto-cabecera` ni provocar saltos de layout al hacer scroll.
- **Restaurar partida guardada**: el comportamiento existente no cambia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla de modalidad MUST mostrar un subtítulo bajo el título, con “Purpurina o plumero” como texto por defecto.
- **FR-002**: Las dos opciones de modalidad (Comparsista y Chirigotero) MUST presentarse como tarjetas seleccionables que compartan el lenguaje visual de las tarjetas de género (superficie, borde, radio y estado de hover), sin estado “seleccionado” persistente, ya que al pulsar se elige y se avanza.
- **FR-003**: El título de la pantalla de modalidad MUST aparecer en la misma posición vertical que el de la creación de personaje para un mismo tamaño de ventana (tolerancia ≤ 2 px).
- **FR-004**: El subtítulo de la pantalla de modalidad MUST aparecer en la misma posición vertical que el de la creación de personaje para un mismo tamaño de ventana (tolerancia ≤ 2 px).
- **FR-005**: Ambas pantallas MUST mantener el área de juego con la altura “ventana menos cabecera”, dejando el pie por debajo del pliegue, y MUST NOT recortar contenido en tamaños soportados.
- **FR-006**: La textura de puntos MUST NOT aparecer en ninguna pantalla, sección ni página: ni en la portada, ni en la intro, ni en el flujo previo (crear-personaje, modalidad, variante), ni en las escenas (verano, febrero, resultado, fin), ni en el header ni en el pie.
- **FR-007**: La pantalla de modalidad MUST seguir exponiendo los ganchos de interacción y observabilidad existentes (identificador de pantalla y botones de opción) para no romper el flujo ni las pruebas actuales.
- **FR-008**: El alcance de esta feature son las pantallas de modalidad y variante, la retirada de la textura de puntos (FR-006) y el tratamiento del header del sitio (FR-016); la intro queda fuera por ahora, pero mantendrá este mismo estilo cuando se aborde.
- **FR-009**: El subtítulo de la pantalla de modalidad MUST ser “Purpurina o plumero”.
- **FR-010**: La pantalla de modalidad MUST cumplir WCAG 2.2 AA (sin violaciones graves) y MUST NOT provocar desplazamiento horizontal a 320 px.
- **FR-011**: El cambio MUST limitarse a la presentación: MUST NOT alterar el motor de juego ni el contenido ni añadir pasos al flujo.
- **FR-012**: El título y el subtítulo de la pantalla de modalidad MUST compartir el mismo estilo visual que los de la creación de personaje: misma tipografía, tamaño, color y uso de mayúsculas.
- **FR-013**: Posición idéntica y estilo idéntico de la cabecera entre creación y modalidad es el objetivo principal de la feature y MUST priorizarse sobre el resto de ajustes estéticos.
- **FR-014**: La posición de la cabecera MUST NOT depender de la altura del contenido ni del centrado del contenedor: MUST mantenerse igual en ventanas altas y bajas, y con independencia de que el cuerpo sea más alto o más bajo.
- **FR-015**: La pantalla de selección de variante MUST mostrar un subtítulo, con “Elige tu estilo” como texto por defecto.
- **FR-016**: El header del sitio MUST tener fondo negro plano (`--c-fondo`) y estar anclado arriba (`position: sticky; top: 0`) en todas las páginas, MUST NOT mostrar la textura de puntos y MUST NOT alterar la altura reservada `--alto-cabecera` ni los cálculos de altura del resto de pantallas.

### Key Entities *(include if feature involves data)*

- No aplica: es un cambio de presentación. No se crean ni modifican entidades de datos; los textos de modalidad ya existen (título y descripción por modalidad).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para un mismo tamaño de ventana, la diferencia de posición vertical del título entre creación y modalidad es de 2 px o menos.
- **SC-002**: Para un mismo tamaño de ventana, la diferencia de posición vertical del subtítulo entre creación y modalidad es de 2 px o menos.
- **SC-003**: En un rango de móviles (al menos 320×640 y 390×844) no hay recorte de contenido y no aparece desplazamiento horizontal.
- **SC-004**: La pantalla de modalidad no introduce violaciones de accesibilidad graves (WCAG 2.2 AA).
- **SC-005**: La elección de modalidad sigue completándose en un solo toque y la carrera continúa sin pasos extra.
- **SC-006**: El flujo previo a partida mantiene el mismo aspecto en un único recorrido, sin saltos perceptibles de la cabecera.
- **SC-007**: El título y el subtítulo de modalidad son visualmente idénticos a los de crear-personaje: coinciden en tipografía, tamaño, color y uso de mayúsculas.
- **SC-008**: La textura de puntos no aparece en ninguna pantalla, header ni pie (portada, intro, flujo previo y escenas incluidos).
- **SC-009**: En todas las páginas, el header tiene fondo negro plano y está anclado arriba; al hacer scroll se sobrepone al contenido y la altura `--alto-cabecera` no cambia.

## Assumptions

- El texto del subtítulo de modalidad queda fijado como “Purpurina o plumero”.
- Las descripciones por modalidad (las que acompañan a Comparsista y Chirigotero) se reutilizan tal cual; no se reescriben.
- La forma de fijar la posición de la cabecera (cabecera anclada arriba con altura natural) es una decisión de plan; el requisito es solo que la posición coincida.
- El “flujo previo a partida” comprende intro, creación de personaje, modalidad y variante. Esta feature abarca modalidad y variante; la intro se abordará más adelante con este mismo estilo.
- La textura de puntos se retira por completo: no se muestra en ninguna pantalla, header ni pie.
- No se toca `engine` ni `content`; no hay nuevas entidades ni datos.
- Se mantienen los objetivos de rendimiento (mobile-first, ancho máximo en escritorio, 0 kB de JS adicionales).
