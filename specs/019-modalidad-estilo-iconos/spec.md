# Feature Specification: Estilo de las tarjetas de modalidad y variante: nombres, cita e icono

**Feature Branch**: `019-modalidad-estilo-iconos`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "tenemos ahora que darle algo de estilo a la pantalla de modalidad pero no tengo claro como hacerlo, para empezar en modalidad en vez de Comparsista y Chirigotero vamos a poner la modalidad en si para escoger, es decir, Comparsa o Chirigota; el subtitulo de Comparsa '¡Pasión decía Paco Alba, la comparsa es pasión!' y que sea en cursiva porque es una cita de un autor; el de chirigota no se que poner, dejalo de momento como está; había pensado en añadir un icono en la esquina derecha superior del cuadro de seleccion, rollo con el mismo color del subtitulo, algo sutil, pero no se que exactamente, pon de momento un icono generico en cada una para ver si nos gusta"

## Clarifications

### Session 2026-10-03

- Q: ¿Dónde debe aplicarse el cambio de "Comparsista/Chirigotero" a "Comparsa/Chirigota"? → A: Solo en la pantalla de selección de modalidad, de momento; el resto del producto mantiene las etiquetas actuales.
- Q: ¿Cómo se renderizan los iconos? → A: SVG inline monocromo (`fill: currentColor`) del color del subtítulo (Chirigota, `caja.svg`).
- Q: ¿El tratamiento se extiende a otra pantalla? → A: Sí, a la pantalla de selección de variante; el resto del producto sigue igual.
- Q: ¿Título de la pantalla de variante? → A: "Elige tu estilo"; el subtítulo se mantiene como está.
- Q: ¿Iconos en las tarjetas de variante? → A: De momento la guitarra, salvo "Clásico" (comparsa), que usa el bigote; el resto se decidirá más adelante. Solo en la elección inicial de variante, no en el cambio de variante.
- Q: ¿Qué subtítulos van en cursiva? → A: Los de modalidad (son citas) y los de variante marcados como cita; el resto de variantes, en redonda. En variante, "Evolución con raíces" (comparsa) y "Clásico" (chirigota) son citas.
- Q: ¿Cómo se marca si un subtítulo de variante es cita? → A: Con una propiedad `cita` en cada variante del catálogo.
- Q: ¿Cómo se distinguen visualmente las citas? → A: En cursiva y entre comillas “ ”.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir la modalidad misma (Comparsa o Chirigota) (Priority: P1)

Tras crear su personaje, el jugador llega a la pantalla de modalidad y elige **la modalidad en sí** —Comparsa o Chirigota—, no el rol de "comparsista" o "chirigotero". Cada tarjeta muestra, bajo su nombre, un subtítulo en cursiva y entre comillas “ ” (todos son citas): el de Comparsa es "¡Pasión, decía Paco Alba, la comparsa es pasión!" y el de Chirigota conserva por ahora el que ya tenía.

**Why this priority**: es el cambio de contenido que el jugador ve de inmediato y el que fija qué se está eligiendo; sin esto no hay feature.

**Independent Test**: llegar a la pantalla de modalidad y comprobar que hay dos tarjetas tituladas "Comparsa" y "Chirigota", con sus subtítulos en cursiva; al pulsar una, el flujo avanza como hasta ahora.

**Acceptance Scenarios**:

1. **Given** el jugador ha completado la creación de personaje, **When** aparece la pantalla de modalidad, **Then** ve exactamente dos tarjetas tituladas "Comparsa" y "Chirigota".
2. **Given** la tarjeta de Comparsa, **When** el jugador la observa, **Then** su subtítulo es "¡Pasión, decía Paco Alba, la comparsa es pasión!" y aparece en cursiva.
3. **Given** la tarjeta de Chirigota, **When** el jugador la observa, **Then** conserva el subtítulo que ya mostraba antes de esta feature.
4. **Given** la pantalla de modalidad, **When** el jugador pulsa cualquiera de las dos tarjetas, **Then** el flujo avanza a la selección de variante como hasta ahora.

---

### User Story 2 - Icono decorativo sutil en cada tarjeta (Priority: P2)

Cada tarjeta de modalidad muestra, de momento, un **icono provisional** en su esquina superior derecha, en el mismo color que el subtítulo y con una presencia discreta. La tarjeta de Chirigota usa el recurso `caja.svg` y la de Comparsa `guitarra.svg`, insertados como **SVG inline de un solo color** (el del subtítulo). El objetivo es puramente exploratorio: ver si los iconos encajan en el estilo de la tarjeta antes de decidir su versión definitiva.

**Why this priority**: es un ajuste estético de apoyo; aporta identidad, pero la feature sigue siendo válida y comprensible sin él.

**Independent Test**: observar las dos tarjetas y comprobar que cada una muestra un icono en la esquina superior derecha, en el color del subtítulo, sin solaparse con el texto y sin captar la interacción.

**Acceptance Scenarios**:

1. **Given** la pantalla de modalidad, **When** se observan las dos tarjetas, **Then** cada una muestra un icono provisional en su esquina superior derecha (la de Comparsa, la guitarra; la de Chirigota, la caja).
2. **Given** una tarjeta con su icono, **When** se compara con su subtítulo, **Then** el icono usa el mismo color que el subtítulo y su presencia es sutil (no compite con el texto).
3. **Given** una tarjeta con su icono, **When** el jugador la pulsa, **Then** la interacción es la misma que sin icono (un solo toque, sin elementos que se interpongan).

---

### User Story 3 - Elegir tu estilo con el mismo tratamiento (Priority: P2)

En la pantalla de variante, el jugador ve el título **"Elige tu estilo"** (su subtítulo se mantiene tal cual) y una tarjeta por variante con el mismo aspecto que las de modalidad: título, subtítulo (en cursiva y entre comillas “ ” si es cita; normal si no) y un icono provisional en la esquina superior derecha. En comparsa cada variante tiene su icono (**bigote**, **raíces**, **nueva escuela**); en chirigota, de momento la **guitarra**; más adelante se afinarán. Este tratamiento no se aplica a la pantalla de cambio de variante que aparece durante la carrera.

**Why this priority**: extiende la identidad visual ya definida a la segunda pantalla del flujo previo, sin introducir todavía iconos definitivos.

**Independent Test**: llegar a la pantalla de variante y comprobar el título "Elige tu estilo", que cada tarjeta muestra su icono en la esquina superior derecha y que elegir avanza como antes.

**Acceptance Scenarios**:

1. **Given** el jugador ha elegido modalidad, **When** aparece la pantalla de variante, **Then** el título es "Elige tu estilo" y su subtítulo se mantiene.
2. **Given** la pantalla de variante, **When** se observan sus tarjetas, **Then** cada una muestra su icono en su esquina superior derecha, del color del subtítulo (en comparsa: bigote, raíces y nueva escuela; en chirigota: guitarra).
3. **Given** la pantalla de cambio de variante durante la carrera, **When** se observan sus tarjetas, **Then** no muestran icono.
4. **Given** la pantalla de variante, **When** el jugador pulsa una tarjeta, **Then** la carrera continúa sin pasos añadidos.
5. **Given** una variante cuyo subtítulo es una cita, **When** se observa, **Then** aparece en cursiva; si no es cita, aparece en redonda.

---

### User Story 4 - Sin impacto en flujo, accesibilidad ni otras pantallas (Priority: P3)

Los cambios se limitan a la presentación de las pantallas de modalidad y variante: el flujo, el motor, el contenido y el resto de pantallas (indicador de contexto, tarjeta final, imagen compartible, portada) no cambian. Las pantallas siguen siendo accesibles y los iconos no añaden ruido a lectores de pantalla.

**Why this priority**: protege el producto de regresiones y limita el alcance a lo pedido.

**Independent Test**: recorrer el flujo previo a partida y una carrera completa y comprobar que solo cambian modalidad y variante; verificar con lector de pantalla que las opciones se anuncian igual que antes.

**Acceptance Scenarios**:

1. **Given** cualquier punto del juego o del resto del sitio, **When** se revisa una etiqueta de modalidad fuera de modalidad y variante, **Then** mantiene el texto que tenía antes de la feature.
2. **Given** las pantallas de modalidad y variante con lector de pantalla, **When** se recorren, **Then** cada opción se anuncia por su título y subtítulo y el icono no se anuncia.
3. **Given** modalidad o variante, **When** se elige una opción, **Then** la carrera continúa sin pasos añadidos y sin cambios en la partida generada.

---

### Edge Cases

- **Cita de dos líneas**: el subtítulo de Comparsa puede partirse en dos líneas en pantallas estrechas; el título no debe desplazarse de forma que descuadre la tarjeta y el icono no debe solaparse con el texto.
- **Ancho mínimo (320 px)**: no debe aparecer desplazamiento horizontal y el texto de las tarjetas no debe partirse de forma ilegible.
- **Tarjetas de distinta longitud**: la tarjeta de Comparsa (cita larga) y la de Chirigota (subtítulo corto) deben verse equilibradas; ninguna debe romper la alineación de la otra.
- **Icono y foco/hover**: el estado de foco o hover debe seguir siendo visible en toda la tarjeta, incluida la zona del icono.
- **Icono decorativo**: si el icono no carga o se retira, la tarjeta debe seguir siendo plenamente legible y seleccionable.
- **Cursiva y legibilidad**: la cursiva de los subtítulos no debe reducir la legibilidad ni el contraste por debajo de lo exigible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las dos opciones de la pantalla de modalidad MUST titularse con la modalidad misma: "Comparsa" y "Chirigota", sustituyendo a "Comparsista" y "Chirigotero" en esta pantalla.
- **FR-002**: El subtítulo de la tarjeta de Comparsa MUST ser, de forma literal, "¡Pasión, decía Paco Alba, la comparsa es pasión!".
- **FR-003**: El subtítulo de la tarjeta de Chirigota MUST conservar el texto que ya mostraba antes de esta feature; no se reescribe en este momento.
- **FR-004**: Cada tarjeta de modalidad MUST mostrar, de momento, un icono provisional en su esquina superior derecha, del mismo color que el subtítulo y con presencia sutil. La tarjeta de Chirigota MUST usar el recurso `caja.svg` y la de Comparsa el recurso `guitarra.svg`, insertados como **SVG inline de un solo color** (el del subtítulo).
- **FR-005**: El icono MUST ser decorativo: MUST NOT anunciarse a tecnologías de asistencia ni alterar el nombre accesible de la opción, y MUST NOT capturar ni alterar la interacción de selección.
- **FR-006**: Elegir modalidad MUST seguir completándose en un solo toque y MUST NOT añadir pasos al flujo.
- **FR-007**: La pantalla MUST seguir exponiendo sus ganchos de interacción y observabilidad existentes para no romper el flujo ni las pruebas actuales.
- **FR-008**: El cambio MUST ser de presentación: MUST NOT alterar el motor de juego, el contenido ni el resultado de la partida, y MUST NOT modificar pantallas ni etiquetas ajenas a la selección de modalidad y variante.
- **FR-009**: La pantalla MUST cumplir WCAG 2.2 AA (sin violaciones graves) y MUST NOT provocar desplazamiento horizontal a 320 px.
- **FR-010**: El icono MUST NOT solaparse con el título ni con el subtítulo, en ningún ancho soportado ni con el subtítulo partido en dos líneas.
- **FR-011**: El título de la pantalla de selección de variante MUST ser "Elige tu estilo".
- **FR-012**: El subtítulo de la pantalla de variante MUST mantenerse como está.
- **FR-013**: Las tarjetas de variante MUST mostrar, de momento, un icono en su esquina superior derecha: bigote en "Clásico", raíces en "Evolución con raíces" y nueva escuela en "Nueva escuela" (comparsa), y guitarra en las variantes de chirigota; con el mismo tratamiento que en modalidad (color del subtítulo, decorativo y sin solape).
- **FR-014**: El icono de las tarjetas de variante MUST mostrarse solo en la elección inicial de variante; la pantalla de cambio de variante durante la carrera MUST NOT mostrar icono.
- **FR-015**: La pantalla de variante MUST cumplir WCAG 2.2 AA (sin violaciones graves) y MUST NOT provocar desplazamiento horizontal a 320 px.
- **FR-016**: Los subtítulos de las tarjetas de modalidad (citas) y los de variante marcados como cita MUST mostrarse en cursiva y entre comillas “ ”; los subtítulos de variante no marcados MUST ir en redonda y sin comillas.
- **FR-017**: Cada variante del catálogo MUST poder declarar si su subtítulo es una cita, de modo que el marcado determine la cursiva.

### Key Entities *(include if feature involves data)*

- No aplica: es un cambio de presentación. Solo se ajustan los textos mostrados y se añade un adorno visual; no se crean ni modifican entidades de datos del motor ni del contenido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las visitas a la pantalla de modalidad muestra exactamente dos tarjetas tituladas "Comparsa" y "Chirigota", y 0 tarjetas con las etiquetas anteriores.
- **SC-002**: La tarjeta de Comparsa muestra el texto literal "¡Pasión, decía Paco Alba, la comparsa es pasión!" en el 100% de los casos.
- **SC-013**: Todos los subtítulos de modalidad y los de variante marcados como cita se muestran en cursiva y entre comillas “ ”; el resto de subtítulos de variante, en redonda y sin comillas.
- **SC-003**: Cada una de las dos tarjetas muestra un icono visible en su esquina superior derecha, del mismo color que su subtítulo, sin solaparse con el texto, desde 320 px de ancho.
- **SC-004**: El nombre accesible de cada opción coincide con su título y subtítulo; el icono no añade texto anunciable (0 diferencias respecto a antes).
- **SC-005**: Elegir modalidad sigue requiriendo 1 solo toque y 0 pasos extra.
- **SC-006**: No aparece desplazamiento horizontal a 320 px ni a 390 px de ancho.
- **SC-007**: La pantalla no introduce violaciones de accesibilidad graves (WCAG 2.2 AA).
- **SC-008**: 0 cambios en el resultado de la partida: misma semilla y mismas decisiones producen la misma carrera que antes, y 0 etiquetas de modalidad cambian fuera de modalidad y variante.
- **SC-009**: La pantalla de variante muestra el título "Elige tu estilo" en el 100% de los casos y su subtítulo se mantiene.
- **SC-010**: El 100% de las tarjetas de variante muestra su icono en su esquina superior derecha (el bigote en "Clásico"; la guitarra en el resto), del color de su subtítulo, sin solaparse con el texto, desde 320 px.
- **SC-011**: La pantalla de cambio de variante muestra 0 iconos.
- **SC-012**: Modalidad y variante no introducen desplazamiento horizontal a 320 px ni violaciones de accesibilidad graves (WCAG 2.2 AA).

## Assumptions

- **Alcance**: la feature se limita a la presentación de las pantallas de selección de modalidad y de variante; el resto de pantallas y etiquetas del sitio (indicador de contexto, tarjeta final, imagen compartible, portada) mantienen sus textos actuales.
- **Título de Chirigota**: al pasar a la modalidad, la tarjeta se titula "Chirigota"; solo su subtítulo queda "como está" por ahora, según lo pedido.
- **Título de variante**: el título y el subtítulo de la pantalla quedan ambos como "Elige tu estilo" por decisión del usuario; se revisará si más adelante se quiere diferenciar.
- **Icono de variante**: en comparsa, bigote ("Clásico"), raíces ("Evolución con raíces") y nueva escuela ("Nueva escuela"); en chirigota, de momento la guitarra.
- **Icono provisional**: Chirigota usa `public/iconos/caja.svg`; "Clásico", "Evolución con raíces" y "Nueva escuela" (comparsa) usan `public/iconos/bigote.svg`, `public/iconos/raices.svg` y `public/iconos/nueva_escuela.svg`; el resto de variantes, `public/iconos/guitarra.svg`. Todos insertados como SVG inline de un solo color (el del subtítulo). Son provisionales y su versión definitiva (o su retirada) se decidirá más adelante tras verlos.
- **Cita**: los subtítulos de modalidad son citas y van en cursiva; en variante, la propiedad `cita` marca los que lo son ("Evolución con raíces" en comparsa; "Clásico" e "Interpretar el personaje" en chirigota) y el resto van en redonda.
- **Orden de variantes de chirigota**: "Clásico" → "Interpretar el personaje" → "Lolosedismo".
- **Sin nuevos datos**: no se toca `engine` ni `content`; no hay nuevas entidades ni textos de datos que validar.
- **Identidad visual**: se conservan el lenguaje visual, la tipografía, la paleta y los objetivos de rendimiento (mobile-first, ancho máximo en escritorio, sin JavaScript adicional).
