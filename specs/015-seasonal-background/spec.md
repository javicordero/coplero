# Feature Specification: Fondo estacional del juego (verano / febrero)

**Feature Branch**: `015-seasonal-background`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "quiero hacer que cuando sea una decision de verano cambie el fondo a algo relacionado con el verano y cuando sea de invierno a algo relacionado con el invierno… entiendo que solo habria que cambiar el fondo del juego… como lo harias? con una imagen quizas? con un fondo? en verano por ejemplo sol y playa y en febrero noche y teatro falla? o noche y frio en invierno?"

> **Nota**: esta feature es una **capa de presentación** sobre la isla jugable. No se toca el motor, el contenido, los datos, las rutas ni la lógica de juego. El estado ya expone el `momento` (`verano` | `febrero`); esta feature lo convierte en atmósfera visual.

## Clarifications

### Session 2026-09-30

- Q: ¿Qué elementos representan cada estación? → A: **verano** = playa (arena), sol y claridad; **febrero** = noche, luna y lluvia.
- Q: ¿"Claridad" = fondo claro o luz cálida sobre base oscura? → A: **verano claro** (tema de día) con texto oscuro; **febrero oscuro** con texto claro (tema claro/oscurro por `momento`).
- Q: ¿La lluvia de febrero animada o estática? → A: **animada sutil** en CSS, desactivada con reducción de movimiento.
- Q: ¿Posición del sol y la luna? → A: **esquina superior derecha**, no centrados.
- Q: ¿Efecto de lluvia? → A: efecto de **lluvia CSS real y perceptible** (gotas/estelas cayendo), no un patrón apenas visible.
- Q: ¿Estilo de la pantalla de resultado? → A: **acta/papel** (resultado oficial del COAC), claro y sobrio; se probó teatro/escenario y se descartó.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sentir la estación al jugar (Priority: P1)

Quien juega, al ver una decisión o pantalla del juego, percibe de un vistazo si está en **verano** (playa, sol, claridad) o en **febrero** (noche, luna, lluvia), sin necesidad de leer el indicador.

**Why this priority**: es el núcleo de la petición: reforzar la inmersión estacional del Carnaval de Cádiz con el fondo, de forma inmediata y sin romper nada.

**Independent Test**: abrir una partida y comprobar que cada pantalla del juego muestra un fondo coherente con su `momento` (verano o febrero), y que el cambio es visible e identificable.

**Acceptance Scenarios**:

1. **Given** una pantalla del juego con momento `verano`, **When** se muestra, **Then** el fondo evoca verano (playa, sol, claridad) y se distingue claramente del de febrero.
2. **Given** una pantalla del juego con momento `febrero`, **When** se muestra, **Then** el fondo evoca febrero (noche, luna, lluvia) y se distingue claramente del de verano.
3. **Given** el paso de verano a febrero (o viceversa) a lo largo de la carrera, **When** cambia el `momento`, **Then** el fondo cambia en consecuencia de forma perceptible.
4. **Given** la pantalla de **resultado** (anuncio del COAC), **When** se muestra, **Then** usa su estilo propio (acta/papel), distinto del de verano y del de febrero.

---

### User Story 2 - El fondo no estorba (Priority: P2)

El fondo estacional acompaña sin restar legibilidad ni velocidad: el texto sigue leyéndose bien, el juego carga igual de rápido y las páginas estáticas siguen sin JavaScript.

**Why this priority**: la identidad visual no puede degradar el rendimiento ni el contraste (principio constitucional de rendimiento y mobile-first).

**Independent Test**: medir que el peso del juego no crece de forma relevante y que el contraste de todo el texto sobre los nuevos fondos sigue cumpliendo AA.

**Acceptance Scenarios**:

1. **Given** cualquier texto sobre el fondo estacional, **When** se mide su contraste, **Then** cumple AA.
2. **Given** el juego cargado, **When** se compara con el estado anterior, **Then** el peso añadido por el fondo es despreciable (sin librerías ni imágenes pesadas).
3. **Given** alguien con reducción de movimiento activada, **When** cambia el fondo, **Then** la transición se reduce o desaparece.

---

### Edge Cases

- **Transición entre momentos**: el cambio de fondo no debe causar parpadeo ni salto de layout.
- **Contraste en ambos temas**: el texto oscuro sobre el verano claro y el texto claro sobre el febrero oscuro deben cumplir AA.
- **Reducción de movimiento**: la transición de fondo y la animación de la lluvia deben desactivarse.
- **Pantallas muy pequeñas (320 px)**: el fondo y sus elementos deben degradarse con elegancia sin generar scroll ni bandas.
- **Otras pantallas del bucle**: la pantalla de **resultado** debe mostrar su estilo propio (acta/papel); decisión y fin, el del momento vigente.
- **Páginas estáticas**: portada, "cómo jugar" y resultado compartido quedan fuera y no se ven afectadas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El fondo del bucle jugable MUST reflejar el `momento` vigente de la partida (`verano` o `febrero`), sin introducir lógica de juego.
- **FR-002**: MUST existir un tratamiento visual para **verano** que evoque playa (arena), sol y claridad, y uno para **febrero** que evoque noche, luna y lluvia, claramente distinguibles entre sí. El **sol** (verano) y la **luna** (febrero) MUST ubicarse en la **esquina superior derecha**, no centrados.
- **FR-003**: Los fondos y sus elementos (sol, luna, playa/arena, lluvia) MUST construirse con **CSS puro** (gradientes, tonos, formas y animaciones CSS), sin imágenes ilustrativas ni librerías, para no añadir peso.
- **FR-004**: Los fondos MUST NOT degradar la legibilidad: todo el texto y los controles MUST mantener contraste AA sobre su fondo. En **verano** (tema claro) el texto MUST ser oscuro; en **febrero** (tema oscuro) el texto MUST ser claro.
- **FR-005**: El fondo MUST NOT añadir dependencias ni librerías, y el peso añadido MUST ser despreciable para una apertura desde enlace en 4G.
- **FR-006**: El cambio de fondo entre momentos MUST ser breve y MUST respetar la preferencia de **reducción de movimiento**.
- **FR-007**: Las **páginas estáticas** (portada, cómo jugar, resultado compartido) MUST permanecer sin JavaScript y sin el fondo estacional.
- **FR-008**: El motor (`engine`) y el contenido (`content`) MUST NOT verse modificados; la feature consume el `momento` ya existente como dato, sin añadir reglas ni campos.
- **FR-009**: El fondo MUST ser coherente en **todas las pantallas del bucle**: decisión y fin según el `momento` vigente; resultado con su estilo propio.
- **FR-010**: Verano MUST usar un **tema claro** (fondo claro + texto oscuro) y febrero el **tema oscuro** actual (texto claro), alternando los colores de texto y controles según el `momento` sin salir del sistema de tokens.
- **FR-011**: La **lluvia** de febrero MUST ser un **efecto de lluvia CSS real y perceptible** (gotas/estelas cayendo) y MUST desactivarse con la preferencia de reducción de movimiento.
- **FR-012**: La pantalla de **resultado** MUST usar un **tercer estilo propio** (**acta/papel**: resultado oficial del COAC, claro y sobrio), distinto de verano y de febrero, aplicado por pantalla y no por `momento`.

### Key Entities

- **Momento**: valor de partida (`verano` | `febrero`) que ya existe y determina qué fondo y qué tema se muestran.
- **Tratamiento de fondo**: la presentación visual de cada momento — verano: playa (arena), sol y claridad; febrero: noche, luna y lluvia.
- **Tema por momento**: juego de colores de texto y controles — claro (texto oscuro) en verano, oscuro (texto claro) en febrero.
- **Tema de resultado**: estilo propio de la pantalla de resultado — acta/papel (resultado oficial del COAC), distinto de verano y febrero.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El **100%** de las pantallas del bucle jugable muestra su estilo correspondiente (verano, febrero o resultado-teatro).
- **SC-002**: Los **tres** estilos (verano, febrero y resultado) se distinguen entre sí a simple vista por parte de un usuario nuevo.
- **SC-003**: El **100%** de los textos y controles cumple contraste AA sobre su tema correspondiente (verano claro con texto oscuro; febrero oscuro con texto claro).
- **SC-004**: El peso del juego no crece de forma relevante por el fondo (sin imágenes pesadas ni librerías nuevas).
- **SC-005**: Las páginas estáticas siguen con **0 kB de JavaScript**.
- **SC-006**: El cambio de fondo no supera **300 ms** y se desactiva con reducción de movimiento activada.

## Assumptions

- **Solo presentación**: no se tocan motor, contenido, datos, rutas ni lógica; es una capa visual sobre la isla existente.
- **"Invierno" = febrero**: el usuario habla de "invierno", pero el dominio del juego usa `febrero` como momento de Carnaval; el fondo de invierno corresponde a `febrero`.
- **Alcance**: el cambio afecta únicamente al fondo del bucle jugable (`/jugar`); las páginas estáticas quedan fuera.
- **Rendimiento primero**: cualquier tratamiento visual debe respetar el principio de apertura rápida desde 4G (evitar imágenes grandes o librerías).
- **Solo CSS, sin imágenes**: los fondos y sus elementos (playa/arena, sol, luna, lluvia, papel/líneas) se construyen con gradientes, formas y animaciones CSS; el estilo de resultado evoca un acta oficial (papel + tinta), sin imágenes.
- **Estilo de resultado**: se implementa **acta/papel** (resultado oficial del COAC), claro y sobrio. El teatro/escenario (opción A) se descartó.
- **Tema claro en verano**: verano introduce un tema claro puntual (texto oscuro) con su variante de tokens; febrero conserva el tema oscuro actual. Implica ampliar el sistema de tokens con una paleta clara para el verano.
- **Contradicción con 012**: la feature 012 declaraba "fuera de alcance" las texturas de fondo; esta feature lo revisa expresamente a petición del usuario, limitándolo a un fondo estacional ligero.
