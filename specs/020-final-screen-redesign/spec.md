# Feature Specification: Rediseño de la pantalla final

**Feature Branch**: `020-final-screen-redesign`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "ahora que hemos hecho esto vamos a realizar una modificacion total de la interfaz de esta pantalla para que el estilo cuadre mas con el resto de la acplicacion
lo que deberia aparecer seria 
NOMBRE
MODALIDAD - ESTILO
MEJOR POSICION
PREMIOS
(lista)
OTROS PREMIOS
(lista)

el resto que hay ahora mismo no deberia aparecer
ya luego estructuramos y vamos dandole forma bien"

**Ampliación (2026-10-04)**: rediseño de la presentación como **palmarés** de la carrera: línea temporal de premios, distinciones como colección de logros y frase de cierre narrativa.

## Clarifications

### Session 2026-10-03

- Q: ¿Qué fondo usa la pantalla final? → A: **Ninguno de los fondos estacionales** (verano/febrero). Por ahora la pantalla va **sin fondo** (tratamiento neutro/liso); un fondo distinto queda como posible iteración futura.
- Q: ¿Qué muestra la lista de «Premios»? → A: **Premios del COAC** (podio y primer premio), cada uno con su **año y puesto**.
- Q: ¿Cómo muestra cada entrada la lista de «Distinciones» (antes «Otros premios»)? → A: **Tipo de premio + número de veces** (agrupado).
- Q: ¿Cómo se muestra la lista de «Premios»? → A: **Medalla + año**, en ese orden y separados por un espacio (🥇 / 🥈 / 🥉 según el puesto del COAC).
- Q: ¿En qué orden se listan los premios? → A: **Por puesto** (primero todos los 1.º, luego los 2.º y luego los 3.º) y, dentro de cada puesto, por **año**.
- Q: ¿Se renombra «Otros premios»? → A: Sí, pasa a llamarse **«Distinciones»**.
- Q: ¿Llevan icono las distinciones? → A: Sí: **Aguja de oro** → aguja dorada; **Coplas por Andalucía** → bandera de Andalucía; **Candela y espino** → icono por defecto (candela). Formato: **una roseta por victoria** (icono del premio en el centro); sin texto.
- Q: ¿Qué opciones de orden de premios hay? → A: **Opción 1**: agrupados por puesto y, dentro, por año. **Opción 2**: solo por año. **Opción 3** (activa): medalla + todos los años de ese puesto seguidos, separados por comas. Pendiente de decisión del usuario.
- Q: ¿Qué años muestra la línea temporal de «Premios» (rediseño en exploración)? → A: **Solo los años con premio del COAC** (podio/1º); no se muestran los años sin premio.
- Q: ¿La línea temporal es interactiva? → A: **No**; palmarés estático, sin tocar años/premios.
- Q: ¿La pantalla se convierte directamente en la imagen 9:16? → A: **No**; la imagen la genera el endpoint OG (satori) **calcando el palmarés**, con el **mismo lenguaje visual**.
- Q: ¿Hay jerarquía entre distinciones? → A: **No**; todas al **mismo peso** visual, sin destacar ninguna.
- Q: ¿Nivel de decoración carnavalesca? → A: **Sutil**: separadores ornamentales discretos, algún detalle SVG y dorados puntuales, sin recargar.
- Q: ¿Qué pasa si no hay premios de un tipo? → A: **Se oculta la sección** correspondiente (sin ceros ni placeholders).
- Q: ¿Qué acciones se mantienen en la pantalla final? → A: **Compartir**, **Imagen 9:16** y **Empezar de nuevo**; se eliminan «Copiar texto», «Imagen 1:1» y «Copiar enlace».

### Session 2026-10-04

- Q: ¿Se mantiene el encabezado de la pantalla? → A: Sí, pero como **antetítulo sutil por encima del nombre** (tratamiento de subtítulo, color atenuado); el **nombre** es el título principal.
- Q: ¿Cómo se presenta la tarjeta final? → A: Se **conserva la tarjeta** (el nombre y los datos van **dentro**, como antes) pero con el **lenguaje visual del formulario «Crea tu personaje»** (panel con superficie, borde, radio y sombra; etiquetas en mayúsculas). «Carrera finalizada» queda **fuera** de la tarjeta y se retira el fondo estacional (el de febrero).
- Q: ¿La modalidad y el estilo van juntos o separados? → A: **Dos elementos diferenciados** (uno para modalidad y otro para estilo) con **tratamientos visuales distintos**.
- Q: ¿Cuál de los dos es el principal? → A: La **modalidad** lleva el **tratamiento principal** (acento, negrita, mayúsculas); el **estilo** lleva un **secundario destacado** (tono de acento más claro, mismo tamaño, peso normal) que resalta por debajo del nombre y de la modalidad.
- Q: ¿Tamaño y color de la modalidad? → A: La modalidad baja de tamaño (`--texto-base`) y el estilo sube al mismo tamaño con un tono de acento más claro; el nombre sigue siendo el mayor.
- Q: ¿Se mantiene el panel tipo formulario «Crea tu personaje»? → A: **No**. La nueva dirección es un **palmarés elegante y aireado** sobre negro, con **separadores ornamentales sutiles**; sin aspecto de formulario administrativo ni de dashboard. Deroga el lenguaje de panel de formulario.
- Q: ¿Formato de la línea temporal de «Premios»? → A: **Horizontal**, en filas con **columnas automáticas** según el ancho disponible (`puesto · nodo · año`) y orden cronológico; cada fila con su **carril de borde a borde** y **sin conexión entre filas**; **sin scroll**; el **1º premio** se destaca en **dorado** y 2º/3º quedan atenuados. Debe leerse como trayectoria, no como gráfico.
- Q: ¿Formato de «Distinciones»? → A: **Rosetas**: una por victoria y agrupadas por tipo (estilo Copero); todas al **mismo peso**.
- Q: ¿Frase de cierre? → A: Frase breve en cursiva **antes de los botones**, con separadores ornamentales; por defecto **«La copla termina. La historia queda.»** (tono elegante; hay alternativas por tono documentadas). No debe decir «has ganado».
- Q: ¿Se mantiene la tipografía y los tokens actuales? → A: **Sí**; se conservan las fuentes (Anton + Atkinson) y los tokens de Coplero.
- Q: ¿Se muestra la frase de cierre? → A: **No de momento**; se retira temporalmente para ganar espacio y que el palmarés quepa a simple vista. El texto se conserva para más adelante.
- Q: ¿La imagen compartible (OG) reproduce el palmarés? → A: Sí; el endpoint OG **calca** `Tarjeta.svelte` en sus tres formatos (9:16, apaisado y 1:1), con los títulos de sección en Anton y el pie de marca dentro de la tarjeta. Su URL se **versiona** (`?v=`, `VERSION_OG`) para invalidar la caché al cambiar el diseño.
- Q: ¿Cómo se llama la acción de imagen? → A: **«Descargar imagen»** (antes «Imagen 9:16»); sigue generando el PNG 9:16.
- Q: ¿Dónde se sitúa el palmarés en la pantalla? → A: **Centrado verticalmente** en la isla y en la página de resultado `/r`; el pie de la página queda bajo el pliegue hasta hacer scroll.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el palmarés de la carrera (Priority: P1)

Al terminar una carrera, el jugador ve el palmarés de su personaje: su nombre, la modalidad y el estilo con que acabó, su mejor posición, una **línea temporal de premios del COAC** y una **colección de distinciones**. No ve ningún otro bloque de información.

**Why this priority**: es el corazón del rediseño; define qué cuenta la pantalla.

**Independent Test**: abrir la pantalla final en desarrollo (`/jugar?dev=fin`) o recorrer una carrera y comprobar las cinco zonas y la frase.

**Acceptance Scenarios**:

1. **Given** una carrera con premios y distinciones, **When** el jugador ve la pantalla final, **Then** aparecen el nombre, modalidad y estilo, la mejor posición, la línea temporal (un año por premio, orden cronológico) y la colección de distinciones.
2. **Given** una carrera sin premios del COAC ni distinciones, **When** el jugador ve la pantalla final, **Then** esas secciones se omiten sin quedar vacías ni con ceros.
3. **Given** una carrera con un primer premio, **When** el jugador ve la línea temporal, **Then** ese año se destaca en dorado sin parecer «el resultado de la carrera actual».
4. **Given** una carrera terminada, **When** el jugador ve la pantalla final, **Then** no aparece la trayectoria en fichas, ni los años en activo, ni los años sin concursar, ni el relato de hitos, ni el compás decorativo, ni la marca de agua.
5. **Given** la pantalla final, **When** el jugador la ve, **Then** «Carrera finalizada» aparece como antetítulo **fuera** de la tarjeta y el nombre es el título principal.

---

### User Story 2 - Un palmarés elegante y coherente (Priority: P2)

El jugador percibe la pantalla como un palmarés de Carnaval: composición **vertical y aireada** sobre negro, blanco para la información, naranja de Coplero en los destacados, dorado puntual en el primer premio y separadores ornamentales sutiles. Se mantiene la identidad (tipografía y tokens) y no parece un formulario ni un dashboard.

**Why this priority**: la nueva dirección visual es lo que convierte la lista en un palmarés con carácter.

**Independent Test**: comparar con el resto de pantallas y comprobar identidad, aire, decoración sutil y ausencia de aspecto de formulario/dashboard; revisar a 320 px.

**Acceptance Scenarios**:

1. **Given** la pantalla final, **When** se compara con el resto de Coplero, **Then** comparte fuentes y tokens y no usa el lenguaje de panel de formulario.
2. **Given** una pantalla de 320 px, **When** se muestra, **Then** no hay scroll horizontal y todo es legible.
3. **Given** la pantalla final, **When** el jugador la ve, **Then** no aparece el fondo estacional de verano ni de febrero, sino un fondo neutro.

---

### User Story 3 - Seguir compartiendo la carrera (Priority: P3)

El jugador puede compartir su palmarés, descargarlo como imagen 9:16 y empezar una carrera nueva.

**Why this priority**: compartir es el objetivo del final de partida; el rediseño no debe romperlo.

**Independent Test**: desde la pantalla final, usar compartir, descargar la imagen 9:16 y empezar de nuevo, y comprobar que cada acción responde correctamente.

**Acceptance Scenarios**:

1. **Given** la pantalla final rediseñada, **When** el jugador pulsa «Compartir» o «Descargar imagen», **Then** la acción funciona con un código de partida válido.
2. **Given** la pantalla final rediseñada, **When** el jugador pulsa «Jugar de nuevo», **Then** vuelve al inicio para crear un personaje nuevo.

---

### Edge Cases

- **Sin premios del COAC**: la línea temporal no se muestra.
- **Sin distinciones**: la colección de distinciones no se muestra.
- **Muchos años con premio**: cada año ocupa una fila compacta; la línea escala sin romperse ni convertirse en infografía.
- **Sin puesto registrado**: «Mejor posición» muestra solo la fase alcanzada.
- **Nombre o estilo largos**: el contenido se ajusta sin desbordar ni provocar scroll horizontal.
- **Carrera con cambios de modalidad o estilo**: se muestran los **finales**; no se listan los cambios intermedios.
- **Tarjeta sin nombre**: se mantiene el tratamiento ya previsto para nombre ausente.
- **Fondo futuro**: un fondo distinto (no estacional) podría definirse más adelante; esta iteración usa fondo neutro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La tarjeta final MUST mostrar el **nombre** del personaje.
- **FR-002**: La tarjeta final MUST mostrar la **modalidad** y el **estilo** finales como **dos elementos diferenciados**, cada uno con su propio tratamiento visual.
- **FR-003**: La tarjeta final MUST mostrar la **mejor posición** como una **placa de honor** centrada: etiqueta «Mejor posición» y el **puesto** como protagonista (tipografía display, 40–48 px); sin puesto, el protagonista es la fase. El color MUST seguir la jerarquía: **1º dorado** (`--c-carnaval-oro`), **2º/3º atenuados** y un **tono propio por fase** (finalista, semifinales, cuartos, preliminares). MUST NOT usar emoji ni etiquetar «campeón».
- **FR-004**: La tarjeta final MUST representar la **trayectoria** como una **línea temporal horizontal** en orden **cronológico**, con los **premios del COAC** (medallas: **1º dorado**, **2º plata**, **3º bronce**) y los **hitos de progresión** (debut y primera vez en cada fase, con el **tono de esa fase**); en un año con premio, el premio prevalece. La **primera fila** MUST repartir el **ancho completo** si está llena, y las siguientes MUST cuadrar con esas columnas. Cada fila lleva su propio **carril** de borde a borde, **sin conexión entre filas**. MUST NOT parecer un gráfico estadístico ni provocar scroll horizontal.
- **FR-005**: La tarjeta final MUST representar las **Distinciones** como una **colección de rosetas**: por cada tipo, **una roseta por victoria** (SVG propio del premio), agrupadas por tipo; el nombre y el recuento van ocultos para lectores de pantalla; todas al **mismo peso**. MUST NOT parecer una pantalla genérica de logros.
- **FR-006**: La tarjeta final MUST NOT mostrar la trayectoria en fichas, los años en activo, los años sin concursar, el relato de hitos, el compás decorativo ni la marca de agua.
- **FR-007**: Las secciones de premios y distinciones MUST omitirse cuando no haya datos, sin placeholders ni ceros.
- **FR-008**: La pantalla final MUST ofrecer las acciones **Compartir**, **Descargar imagen** (PNG 9:16) y **Jugar de nuevo**, generando un código de partida válido; MUST NOT mostrar «Copiar texto», «Imagen 1:1» ni «Copiar enlace».
- **FR-009**: La pantalla MUST presentar una estética **elegante, oscura y aireada** (negro base, blanco para la información, naranja de Coplero en destacados, dorado puntual en el primer premio) con **separadores ornamentales sutiles**; MUST NOT parecer un formulario administrativo ni un dashboard. Se conservan fuentes y tokens actuales.
- **FR-010**: La pantalla MUST ser mobile-first, mantener el ancho máximo de lectura existente y no provocar scroll horizontal desde 320 px.
- **FR-011**: La pantalla MUST cumplir WCAG 2.2 AA (contraste, estructura semántica y foco operable).
- **FR-012**: El contenido MUST NOT modificarse. El motor solo añade el campo derivado `TarjetaFinal.hitosProgreso`; la pantalla sigue mostrando la tarjeta que produce la partida.
- **FR-013**: La tarjeta que se muestra en la portada (ejemplo) y en la página de resultado compartido MUST reflejar el mismo diseño, para no divergir del resultado real.
- **FR-014**: La pantalla final MUST NOT mostrar el fondo estacional (verano ni febrero); MUST presentarse sobre un tratamiento neutro.
- **FR-015**: La pantalla final MUST mostrar, **fuera de la tarjeta**, un **antetítulo** breve y atenuado (p. ej. «Carrera finalizada»); el **nombre** MUST ir **dentro** como título principal.
- **FR-017**: La decoración MUST ser **sutil** (separadores ornamentales y detalles SVG), MUST NOT tapar información ni convertir la pantalla en una infografía.
- **FR-018**: El palmarés MUST caber a simple vista: los espaciados verticales (secciones, línea temporal, rosetas y acciones) MUST ser compactos, y la pantalla MUST empezar cerca del borde superior.

### Key Entities *(include if feature involves data)*

- **Tarjeta final**: resumen visible de una carrera terminada. Atributos relevantes: nombre, modalidad final, estilo final, mejor fase, mejor puesto, premios del COAC y distinciones.
- **Pantalla final**: contenedor de la tarjeta, la frase de cierre y las acciones.
- **Premio del COAC**: resultado de concurso con **año** y **puesto** (1º/2º/3º); alimenta la línea temporal.
- **Distinción**: premio ajeno a la clasificación, por **tipo** (Aguja de Oro, Coplas por Andalucía, Candela y espino) con su **número de veces**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La pantalla muestra exactamente las zonas del palmarés (nombre, modalidad, estilo, mejor posición, línea temporal, distinciones y frase) y **0** zonas de las eliminadas.
- **SC-002**: El **100%** de las carreras, con o sin premios/distinciones, se muestran sin secciones vacías ni marcadores «0».
- **SC-003**: **0** problemas de scroll horizontal a 320 px y **0** violaciones graves de accesibilidad (WCAG 2.2 AA).
- **SC-004**: El **100%** de las acciones disponibles (Compartir, Descargar imagen y Jugar de nuevo) funciona correctamente.
- **SC-005**: **0** rasgos de formulario administrativo o dashboard; el **dorado** se usa **solo** en el primer premio de la línea temporal.
- **SC-006**: La página de resultado compartido se mantiene tan ligera como hoy, sin ganar interactividad.
- **SC-007**: **0** capas de fondo estacional (verano o febrero) visibles en la pantalla final.
- **SC-008**: La identidad, la mejor posición, la línea temporal y las distinciones caben **a simple vista** en un móvil de 390×844 px sin desplazarse.

## Assumptions

- **Alcance del rediseño**: se rediseña la pantalla de fin y, por ser la misma tarjeta, el ejemplo de la portada y la página de resultado compartido.
- **"Premios"**: son los premios/posiciones del COAC (año y puesto).
- **"Distinciones"** (antes «otros premios»): premios ajenos a la clasificación (Coplas por Andalucía, Aguja de oro, Candela y espino), con su recuento y su icono.
- **"Estilo"**: la variante de trabajo vigente al terminar la carrera.
- **Modalidad y estilo mostrados**: los **finales**.
- **Línea temporal**: solo años con premio del COAC; sin interacción; orden cronológico; 1º en dorado.
- **Frase de cierre**: **retirada temporalmente** (no se muestra) para que el palmarés quepa a simple vista; el texto («La copla termina. La historia queda.») se conserva para más adelante.
- **Estética**: elegante, oscura y aireada; se conservan tipografía y tokens de Coplero; decoración sutil.
- **Imagen 9:16**: la genera el endpoint OG (satori) **calcando el palmarés** (mismo lenguaje visual), con la URL versionada (`?v=`, `VERSION_OG`).
- **Sin cambios en `content`**: el motor solo añade el campo derivado `hitosProgreso`.

## Presentación del palmarés (decidida)

Las antiguas «opciones de lista» (agrupada por puesto / solo por año / medalla + años) quedan **retiradas**: la presentación elegida es el palmarés descrito arriba (línea temporal vertical de premios + rosetas de distinciones).
