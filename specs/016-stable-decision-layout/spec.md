# Feature Specification: Layout estable del bucle jugable (anclaje de elementos)

**Feature Branch**: `016-stable-decision-layout`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Los elementos no se deben mover, en el sentido de dentro de la section decision el indicador debe aparecer siempre a la misma altura, el h2 tambien y el ul con las opciones tambien, la primera siempre a la misma altura, la segunda siempre a la misma, que no se muevan en funcion de ningun texto porque cuando cambiamos de verano a febrero actualmente no aparecen en el mismo sitio. Y en el momento del resultado igual, los elementos comunes como el indicador y el h deberian aparecer a la misma altura que en las pantallas anteriores"

> **Nota**: esta feature es una **capa de presentación** sobre la isla jugable. No se toca el motor, el contenido, los datos, las rutas ni la lógica de juego. Se estabiliza la posición de los elementos que ya se muestran y se reorganiza la pantalla de decisión.

## Clarifications

### Session 2026-09-30

- Q: Cuando el texto variable excede el espacio reservado, ¿qué comportamiento se espera? → A: **Bloques de tamaño fijo** para cada elemento (pregunta, opción 1, opción 2) dimensionados para que el contenido quepa por defecto; sin scroll interno, sin recorte "ver más" y sin reducción automática de fuente. La pregunta y las opciones se dimensionan/editan para ocupar siempre lo mismo.
- Q: Al centrar el bloque situación + opciones, ¿qué ocurre si cambia el texto o el número de opciones? → A: Se centra **visualmente pero fijo**: el bloque reserva altura constante; el título ocupa siempre el mismo espacio y las opciones aparecen siempre en el mismo sitio y con el mismo tamaño. El centrado no altera la estabilidad.
- Q: ¿Dónde y en qué pantallas vive el indicador (fuera de la sección de decisión)? → A: **Overlay fijo en la esquina superior izquierda** del área de juego (misma franja que el sol/luna de la derecha), visible tanto en **decisión** como en **resultado**.
- Q: ¿Hasta dónde eliminar el tipo (Personaje/Contenido) del indicador? → A: Se elimina **del todo**: ni texto visible ni atributo `data-tipo` en el DOM (hay que actualizar el test E2E que lo consultaba).
- Q: ¿Qué se mantiene en la pantalla de resultado y qué se exige de su alineación? → A: El único elemento común es el **indicador** (esquina, con **año y momento**), que se mantiene en el resultado. La pantalla de resultado se rediseñará más adelante; por ahora no se exige que su encabezado coincida con el título de decisión. El texto del indicador MUST ser **algo más grande** que el actual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La pantalla de decisión, estable y centrada (Priority: P1)

Quien juega ve la pantalla de decisión **estable y centrada**: el indicador de contexto (año y momento) está fijo en la esquina superior izquierda, y el bloque formado por la situación (título) y las opciones queda centrado en la pantalla con posición y tamaño constantes, sin importar la longitud del texto, el momento (verano/febrero), el tipo (contenido/personaje) ni el número de opciones.

**Why this priority**: es el núcleo de la petición. Hoy, al cambiar de verano a febrero (o entre situaciones con distinto texto y número de opciones), los elementos "saltan" de sitio y la lectura resulta incómoda e impredecible.

**Independent Test**: recorrer varias decisiones (verano/febrero, contenido/personaje, textos cortos y largos, 2 y 3 opciones) y comprobar que el indicador, el título, la primera opción y la segunda no se desplazan y que el bloque situación+opciones está centrado.

**Acceptance Scenarios**:

1. **Given** una pantalla de decisión, **When** se muestra, **Then** el indicador aparece siempre en la esquina superior izquierda, a la misma altura.
2. **Given** una pantalla de decisión, **When** se muestra, **Then** el título (`h2`) aparece siempre a la misma altura y ocupa el mismo espacio.
3. **Given** una pantalla de decisión, **When** se muestra, **Then** la lista de opciones aparece siempre a la misma altura, y la **primera** y la **segunda** opción ocupan siempre la misma posición y tamaño.
4. **Given** dos decisiones idénticas salvo el momento (`verano` vs `febrero`), **When** se alternan, **Then** el indicador, el título y las opciones no cambian de posición.
5. **Given** una situación con texto descriptivo y otra sin él, **When** se muestran, **Then** el bloque situación+opciones permanece centrado en la misma posición en ambas.
6. **Given** una situación con dos opciones y otra con tres, **When** se muestran, **Then** la primera y la segunda opción permanecen en la misma posición en ambas.
7. **Given** el indicador, **When** se muestra, **Then** solo muestra año y momento (no el tipo), con un tamaño algo mayor que el actual.

---

### User Story 2 - El indicador se mantiene en el resultado (Priority: P2)

Quien llega a la pantalla de **resultado** sigue viendo el indicador (año y momento) en la esquina superior izquierda, en la misma posición que en las decisiones, de modo que la transición no produce un salto visual.

**Why this priority**: el indicador es el único elemento común entre pantallas; mantenerlo anclado da continuidad sin forzar el resto del acta.

**Independent Test**: comparar la posición del indicador entre una pantalla de decisión y la de resultado y verificar que coincide y que muestra año y momento.

**Acceptance Scenarios**:

1. **Given** la pantalla de resultado, **When** se muestra, **Then** el indicador aparece en la esquina superior izquierda, a la misma altura que en las decisiones.
2. **Given** la pantalla de resultado, **When** se muestra, **Then** el indicador muestra el año y el momento vigentes.
3. **Given** la transición de una decisión al resultado, **When** cambia la pantalla, **Then** el indicador no se desplaza.

---

### User Story 3 - La estabilidad no rompe el contenido (Priority: P3)

Aunque los elementos estén anclados, **todo el texto sigue siendo legible**: en pantallas pequeñas o con textos largos nada se recorta ni se solapa ni genera scroll horizontal.

**Why this priority**: la estabilidad posicional nunca debe sacrificar la legibilidad ni la accesibilidad (mobile-first).

**Independent Test**: mostrar el caso más largo (título y opciones extensas) en una pantalla de 320 px y comprobar que todo el contenido es accesible y no hay desbordamiento horizontal.

**Acceptance Scenarios**:

1. **Given** el texto más largo del banco, **When** se muestra en 320 px, **Then** todo el contenido es legible sin recortes ni solapamientos.
2. **Given** cualquier pantalla del bucle, **When** se muestra, **Then** no aparece scroll horizontal.
3. **Given** la situación con el texto más largo del banco, **When** se muestra, **Then** el texto cabe en su bloque y el indicador, el título y las opciones mantienen su posición.

---

### Edge Cases

- **Situación con texto vs sin texto**: la presencia o ausencia del párrafo descriptivo no debe mover la lista de opciones.
- **Número de opciones**: dos o tres opciones; la primera y la segunda mantienen su posición aunque la tercera exista o no.
- **Longitud de títulos y subtítulos**: opciones con textos muy cortos o muy largos no desplazan las demás; los textos cortos dejan espacio libre dentro de su bloque sin cambiar su posición.
- **Texto que no cabe en su bloque**: si un texto excede el bloque fijo, se recalibra el bloque o se acorta el texto; nunca se añade scroll, recorte ni autoajuste de fuente.
- **Momento**: alternar `verano` y `febrero` no cambia ninguna posición.
- **Tipo**: decisiones de contenido y de personaje comparten los mismos anclajes; el tipo no se muestra.
- **Repetición de decisiones**: pantallas con una sola opción (o con muchas) mantienen al menos los anclajes comunes.
- **Resultado**: el indicador (año y momento) se mantiene; el resto del acta no condiciona los anclajes de decisión.
- **Viewport corto (landscape o teclado abierto)**: la estabilidad se mantiene sin forzar desbordamiento horizontal.
- **Pantalla de 320 px**: los anclajes se mantienen y el contenido degrada con elegancia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El **indicador de contexto** MUST mostrarse como **overlay fijo en la esquina superior izquierda** del área de juego (simétrico al sol/luna de la derecha), a la misma posición en todas las pantallas del bucle.
- **FR-002**: En la pantalla de decisión, el **título de la situación (`h2`)** MUST aparecer siempre a la misma altura y ocupar el **mismo espacio fijo**.
- **FR-003**: En la pantalla de decisión, la **lista de opciones (`ul`)** MUST empezar siempre a la misma altura, y la **primera** y la **segunda** opción MUST ocupar siempre la misma posición y tamaño.
- **FR-004**: Las posiciones anteriores MUST ser independientes de la **longitud del texto** (situación, título y opciones), del **momento** (`verano` | `febrero`), del **tipo** (contenido | personaje) y del **número de opciones**.
- **FR-005**: Cada elemento visible (título de la situación, texto descriptivo y cada opción) MUST ocupar un **bloque de tamaño fijo**, de modo que su presencia, ausencia o longitud no desplace los anclajes. Los bloques MUST dimensionarse para que el contenido del banco quepa por defecto, aprovechando el espacio disponible en pantalla.
- **FR-006**: El **indicador de contexto** MUST mostrarse en la pantalla de **decisión** y en la de **resultado**, en la esquina superior izquierda, con **año y momento**.
- **FR-006b**: La sección de decisión MUST contener **únicamente la situación y las opciones**; MUST NOT incluir el indicador. El bloque situación+opciones MUST **centrarse verticalmente en el medio** del área de juego con **altura reservada constante**, de modo que el centrado no dependa del texto ni del número de opciones.
- **FR-007**: MUST NOT usarse **scroll interno** dentro de ningún bloque, ni **recorte** del texto ("ver más"), ni **reducción automática** del tamaño de fuente para encajar el contenido. El contenido de la situación y de las opciones MUST escribirse/dimensionarse para caber en su bloque fijo.
- **FR-008**: Ninguna pantalla del bucle MUST generar **scroll horizontal** en ningún ancho soportado (desde 320 px).
- **FR-009**: La feature MUST ser **solo presentación**: el motor (`engine`), el contenido (`content`), los datos, las rutas y la lógica de juego MUST NOT verse modificados.
- **FR-010**: La feature MUST NOT añadir dependencias ni librerías, y MUST NOT aumentar el JavaScript servido (sigue habiendo una sola isla en `/jugar`).
- **FR-011**: La estabilidad MUST mantenerse en **mobile-first** (desde 320 px) y en el layout de escritorio (ancho máximo 420–480 px).
- **FR-012**: La feature MUST convivir con el **fondo estacional** (verano/febrero) y el **estilo de resultado (acta/papel)** sin alterar sus colores ni su atmósfera.
- **FR-013**: Si al crecer el banco un texto dejara de caber en su bloque fijo, MUST recalibrarse el tamaño del bloque (contenido/diseño) o acortarse el texto; MUST NOT introducirse scroll, recorte ni autoajuste de fuente como solución.
- **FR-014**: El **tipo de decisión (contenido | personaje)** MUST NOT mostrarse en el indicador: ni como texto visible ni como atributo `data-tipo` en el DOM. El test E2E que lo consultaba MUST actualizarse.
- **FR-015**: El texto del **indicador** MUST presentarse con un tamaño **algo mayor** que el actual, manteniendo el contraste AA sobre el fondo.

### Key Entities

- **Indicador de contexto**: overlay de la esquina superior izquierda que muestra **año y momento** (sin tipo), presente en decisión y resultado.
- **Bloque situación+opciones**: unidad centrada verticalmente en la pantalla de decisión con altura reservada constante; contiene el título y la lista de opciones.
- **Bloque fijo**: área de tamaño constante destinada a un elemento (título, texto descriptivo u opción) que evita que el contenido desplace las posiciones. Se dimensiona para que el contenido quepa por defecto.
- **Anclaje**: posición de referencia de un elemento (indicador, título, primera opción, segunda opción) dentro de la pantalla del bucle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el **100%** de las pantallas de decisión (cualquier momento, tipo, longitud de texto y número de opciones), la posición del indicador varía **≤ 2 px** respecto a la referencia.
- **SC-002**: En el **100%** de las pantallas de decisión, la altura del título varía **≤ 2 px** y ocupa siempre el mismo espacio.
- **SC-003**: En el **100%** de las pantallas de decisión, la posición de la primera opción y de la segunda varían **≤ 2 px** respecto a la referencia.
- **SC-004**: Al alternar `verano` y `febrero`, el indicador, el título y las dos primeras opciones **no se desplazan** (0 px de diferencia).
- **SC-005**: En la pantalla de resultado, el indicador (año y momento) coincide con el de las decisiones con una tolerancia de **≤ 2 px**.
- **SC-006**: Ninguna pantalla del bucle produce **scroll horizontal** desde 320 px y todo el texto sigue siendo legible.
- **SC-007**: El JavaScript servido no aumenta (una sola isla; páginas estáticas sin cambios) y no se añaden dependencias.

## Assumptions

- **Solo presentación**: no se tocan motor, contenido, datos, rutas ni lógica; se reorganiza el layout de las vistas existentes.
- **Medida**: la posición se mide por el borde superior/superior-izquierdo de cada elemento respecto al origen del área de juego, con una tolerancia de 2 px.
- **Indicador en la esquina**: el indicador sale de la sección de decisión y pasa a un overlay fijo arriba a la izquierda; el sol/luna permanecen arriba a la derecha como parte del fondo estacional (feature 015).
- **Resultado diferido**: la pantalla de resultado se rediseñará más adelante; en esta feature solo se garantiza que el indicador (año y momento) se mantiene y está alineado. No se exige alinear su encabezado con el título de decisión.
- **Bloques de tamaño fijo**: el título y cada opción ocupan un bloque de altura constante, dimensionado para que el contenido quepa por defecto. No se usa scroll, recorte ni autoajuste de fuente.
- **Contenido existente**: los textos actuales caben en su bloque; el bloque se dimensiona con el caso más largo conocido y se recalibra (o se acorta el texto) si el banco crece.
- **Tipo fuera de la UI**: `data-tipo` desaparece del DOM; el test de variedad de contenido (`carrera-completa.spec.ts`) debe actualizarse para no depender de él.
- **Una sola isla**: la solución vive dentro de la isla Svelte existente en `/jugar`; no se introduce lógica de juego.
- **Convive con 015**: se mantiene el fondo estacional por `momento` y el estilo acta del resultado; el trabajo es de disposición (layout), no de color.
