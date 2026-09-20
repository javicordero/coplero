# Feature Specification: Tarjeta final de carrera y compartir

**Feature Branch**: `007-final-card`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Diseña e implementa la tarjeta final de carrera y los datos adecuados para compartir. Debe mostrar únicamente información que el jugador pueda conocer; NO techo, suelo, carisma oculto, volatilidad, anoPico interno ni ningún dato oculto del motor. Debe mostrar: nombre/apodo, modalidad, variante inicial, evolución de variante, años en activo, mejor fase alcanzada, primeros premios, otros premios, tres hitos narrativos, frase/resumen de carrera, si hubo cambio de modalidad y si se dejó de concursar algún año. Primero define el contrato de datos de TarjetaFinal; después implementa la presentación. El engine debe generar los datos; la UI no debe calcularlos."

## Clarifications

### Session 2026-09-20

- Q: ¿Qué alcance tiene "datos adecuados para compartir"? → A: Alcance completo: contrato de la tarjeta + presentación en el fin de carrera + código de partida en la URL (página de resultado) + imagen PNG 9:16 y 1:1 + imagen de previsualización social (Open Graph) + compartir nativo.
- Q: ¿De dónde salen los tres hitos narrativos? → A: El motor los deriva de datos que ya existen en la partida (resultado del COAC, premios, cambios de trayectoria, años sin concursar), con un orden de prioridad y relleno neutro. No se inventan ni exigen contenido nuevo.
- Q: ¿Cómo representar una carrera con varios cambios de modalidad/variante (006 permite cambiar y volver)? → A: Trayectoria cronológica completa: la tarjeta lista cada cambio con su año y la modalidad/variante resultantes, y de ahí deriva los valores inicial y final; no colapsa los cambios intermedios.
- Q: ¿Qué lleva el código de partida compartido? → A: Autocontenido y sin semilla: contiene la tarjeta ya derivada (todos los campos visibles) y su versión de esquema; no requiere re-simular ni acceso al motor, y no incluye el `seed` para que no pueda deducirse el `destino`.
- Q: ¿Qué nivel de accesibilidad deben cumplir la tarjeta y la página de resultado? → A: WCAG 2.2 nivel AA (contraste, foco visible, nombres accesibles, no depender solo del color, operable por teclado y compatible con lector de pantalla).
- Q: ¿Número "héroe" tipo OVR del ejemplo de copero.com? → A: No se incluye: se descarta la valoración global numérica por no tener sentido en Coplero. La adaptación de la referencia se limita a la estructura de póster y al conjunto de acciones de compartir.
- Q: ¿Qué muestra la fila "Trayectoria" del ejemplo? → A: Los cambios de modalidad y variante: una secuencia de chips inicio → cambios → final (con año), en orden cronológico.
- Q: ¿Qué tres datos destacados muestra la barra de estadísticas? → A: Separados y nunca sumados: (1) primeros premios del COAC, (2) mejor posición alcanzada en el COAC —relevante cuando no hay premio del COAC— y (3) otros premios (ajenos).
- Q: ¿En qué consiste mostrar los premios «separados»? → A: Los «otros premios» se desglosan por tipo con su recuento (p. ej. «Copla para Andalucía: 1», «Candela y espino: 3»); los tipos que no se han ganado no aparecen en absoluto (nunca «0 premios» ni «0 veces»). Los premios del COAC se muestran aparte.
- Q: ¿Qué páginas de resultado pueden indexarse en buscadores? → A: Opción A: la tarjeta válida es indexable y expone una URL canónica estable (`/r/<codigo>`); el código inválido, corrupto o de versión incompatible se sirve con `noindex` y sin canónica, para no ensuciar el índice.

> Nota de alcance: las mecánicas que producen los cambios de modalidad y variante se especifican y se implementan en la feature **006 · Cambios de trayectoria**. Esta feature **consume** esos datos para mostrarlos; no los genera.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver la historia completa de mi carrera al terminarla (Priority: P1)

Un jugador termina la última temporada de su carrera y, en lugar de un final escueto, ve una tarjeta con su historia completa: quién fue (nombre o apodo), con qué modalidad y variante empezó, cuántos años estuvo en activo, hasta dónde llegó, los premios que se llevó y una frase que resume su carrera. Todo lo que aparece es información que el jugador ha vivido y puede conocer.

**Why this priority**: es el cierre del bucle jugable y el pago emocional de toda la partida. Sin una tarjeta completa, el juego no cumple su promesa ("construye tu historia") y no hay nada que compartir.

**Independent Test**: completar una carrera de referencia hasta el fin y comprobar que la tarjeta aparece con todos los campos requeridos, que los datos coinciden con lo vivido y que no se filtra ningún dato oculto del motor.

**Acceptance Scenarios**:

1. **Given** una carrera terminada, **When** el jugador llega al final, **Then** ve la tarjeta con nombre/apodo, modalidad, variante inicial, años en activo y mejor fase alcanzada.
2. **Given** una carrera terminada con primeros premios y otros premios, **When** se muestra la tarjeta, **Then** ambos tipos de premio aparecen diferenciados y con su año.
3. **Given** una carrera terminada, **When** se muestra la tarjeta, **Then** contiene su frase de cierre y, exactamente, tres hitos narrativos.
4. **Given** cualquier carrera terminada, **When** se inspecciona la tarjeta, **Then** no aparece el techo, el suelo, el carisma, la volatilidad, el año pico ni el milagro como datos reconocibles.
5. **Given** una carrera terminada, **When** se repite la partida con la misma semilla y las mismas decisiones, **Then** la tarjeta es idéntica.

---

### User Story 2 - Ver los giros de guion de mi carrera (Priority: P2)

La tarjeta cuenta lo que hizo singular a esa carrera: si el jugador cambió de modalidad, si su estilo evolucionó de una variante a otra, o si se tomó años sin concursar. Todos esos giros, ya registrados por el motor, se narran como parte de la historia sin que el jugador haya tenido que tomar nota de nada.

**Why this priority**: es lo que hace que dos tarjetas no se parezcan y lo que da ganas de contarla y de rejugar. Sin esto, la tarjeta es un marcador.

**Independent Test**: construir carreras de referencia con cambio de modalidad, con cambio de variante y con años sin concursar, y comprobar que la tarjeta los refleja; y una carrera sin ninguno de esos giros y comprobar que no se inventan.

**Acceptance Scenarios**:

1. **Given** una carrera con uno o varios cambios de modalidad, **When** se muestra la tarjeta, **Then** se listan, en orden cronológico, todos los cambios con su año y la modalidad resultante, y se derivan la modalidad inicial y la final.
2. **Given** una carrera en la que la variante final difiere de la inicial, **When** se muestra la tarjeta, **Then** se narra la evolución (de dónde a dónde, con el año del cambio).
3. **Given** una carrera con años sin concursar, **When** se muestra la tarjeta, **Then** esos años se recogen como parte de la historia, con sus años.
4. **Given** una carrera sin cambios de modalidad ni variante y sin años fuera de concurso, **When** se muestra la tarjeta, **Then** no se inventan cambios ni ausencias.

---

### User Story 3 - Compartir la tarjeta con otros (Priority: P3)

Al terminar, el jugador quiere enseñar su carrera a alguien de fuera del juego. Obtiene un enlace con su tarjeta que se puede abrir en cualquier dispositivo, una imagen lista para stories o publicaciones y una previsualización atractiva cuando pega el enlace en una red social. Todo ello sin revelar nada que el jugador no sepa.

**Why priority**: es el motor de crecimiento del juego, pero solo aporta valor cuando la tarjeta existe y es fiel. Se puede entregar después de las historias P1 y P2.

**Independent Test**: terminar una carrera, obtener el enlace y abrirlo en un navegador limpio (sin guardado local): la tarjeta se reproduce íntegra y sin datos ocultos; generar las dos imágenes y comprobar formatos y previsualización social.

**Acceptance Scenarios**:

1. **Given** una carrera terminada, **When** el jugador comparte, **Then** obtiene un enlace cuyo código reproduce la tarjeta en otro dispositivo sin depender del guardado local.
2. **Given** un enlace compartido, **When** alguien lo abre, **Then** ve la tarjeta y una previsualización social, y nunca datos ocultos.
3. **Given** una carrera terminada, **When** se generan las imágenes, **Then** se obtienen versiones 9:16 y 1:1 con una marca de agua discreta del juego.
4. **Given** un código de partida inválido, manipulado o de versión incompatible, **When** se abre, **Then** se muestra una página amable, sin errores técnicos y sin pantallas bloqueadas.
5. **Given** una carrera terminada, **When** se genera el texto a compartir, **Then** no contiene datos técnicos ni del motor que el jugador no pueda conocer.

---

### Edge Cases

- **Carrera sin premios**: la tarjeta se muestra igualmente; la ausencia de premios es parte de la historia, no un hueco.
- **Carrera que nunca pasó de preliminares**: la tarjeta sigue siendo digna y narra la trayectoria, sin exponer que se topó con el techo.
- **Menos de tres hitos "destacados"**: se completan con hitos neutros de trayectoria (debut, duración, mejor resultado); nunca se inventan sucesos ni se rellena con datos ocultos.
- **Todos o casi todos los años fuera de concurso**: se trata como relato coherente de retirada o ausencia, no como error.
- **Cambio de modalidad o variante en el último año**: la tarjeta debe reflejarlo correctamente.
- **Varios cambios de modalidad y vuelta a la modalidad inicial**: se narran todos en orden cronológico, sin colapsarlos ni descartar la vuelta.
- **Nombre/apodo con caracteres especiales o intento de inyección**: se sanea y se escapa siempre; nunca se interpreta como HTML ni se incrusta crudo en la imagen social.
- **Milagro o batacazo**: no pueden aparecer como tales ni delatarse; se narran como un buen o mal año.
- **Código de partida corrupto o de otra versión**: se descarta con aviso claro y se ofrece jugar; nunca se interpreta a medias.
- **Códigos inválidos e indexación**: las páginas de error de resultado nunca deben aparecer en buscadores, aunque el enlace se comparta muchas veces.
- **Imagen social con campos vacíos o texto largo**: la composición debe resistir nombres vacíos, carreras sin premios y nombres al límite de longitud.
- **Determinismo**: misma semilla + mismas decisiones ⇒ misma tarjeta, siempre.

## Requirements *(mandatory)*

### Functional Requirements

**Generación y presentación de la tarjeta**

- **FR-001**: El sistema MUST generar, al terminar la carrera, una **TarjetaFinal** completa a partir del estado final de la partida, sin intervención del jugador.
- **FR-002**: La generación MUST ser pura y determinista (misma semilla y mismas decisiones ⇒ misma tarjeta).
- **FR-003**: La tarjeta MUST contener únicamente información que el jugador pueda conocer.
- **FR-004**: La tarjeta MUST NOT contener, exponer ni permitir deducir el techo, el suelo, el carisma, la volatilidad, el año pico, el milagro ni ningún otro dato interno del motor.
- **FR-005**: La tarjeta MUST mostrar el nombre o apodo, la modalidad inicial y la final (si difieren), la variante inicial y los años en activo.
- **FR-006**: La tarjeta MUST mostrar la mejor fase alcanzada.
- **FR-007**: La tarjeta MUST mostrar separados los primeros premios del COAC y los otros premios. Los **otros premios** MUST agruparse por tipo con su recuento (p. ej., «Copla para Andalucía: 1», «Candela y espino: 3»); los tipos sin premio MUST omitirse por completo (nunca «0 premios» ni «0 veces»). Los premios del COAC se muestran con su año.
- **FR-008**: La tarjeta MUST mostrar la evolución de variante (valor inicial, valor final y año de cada cambio) en orden cronológico, siempre que la variante haya cambiado durante la carrera; los cambios de variante pueden pertenecer a modalidades distintas si hubo cambio de modalidad.
- **FR-009**: La tarjeta MUST listar, en orden cronológico, cada cambio de modalidad con su año y la modalidad resultante, y MUST derivar de ahí la modalidad inicial y la final; MUST soportar cambios repetidos y la vuelta a una modalidad anterior.
- **FR-010**: La tarjeta MUST recoger los años sin concursar como parte de la narración, con sus años.
- **FR-011**: La tarjeta MUST incluir exactamente tres hitos narrativos, derivados de datos ya presentes en la partida; si no hay tres hitos destacados, MUST completarse con hitos neutros de trayectoria sin inventar sucesos.
- **FR-012**: La tarjeta MUST incluir una frase/resumen de carrera que cierre la historia, elegida de forma determinista por el motor.
- **FR-013**: La presentación de la tarjeta MUST limitarse a renderizar los datos del motor; la UI MUST NOT calcular, resumir ni derivar información de juego.
- **FR-014**: Todo texto libre mostrado (nombre/apodo) MUST sanearse y escaparse; nunca se interpreta como HTML.
- **FR-015**: La tarjeta MUST ser legible en móvil sin desplazamiento horizontal y MUST NOT provocar cargas de red adicionales dentro del bucle jugable. La tarjeta y la página de resultado MUST cumplir **WCAG 2.2 nivel AA** (contraste suficiente, foco visible, nombres accesibles, sin depender solo del color, operables por teclado y compatibles con lector de pantalla).
- **FR-016**: La tarjeta MUST presentar el fin de carrera de forma comprensible aunque la carrera haya sido discreta, sin juicios de valor sobre el resultado.

**Compartir**

- **FR-017**: El sistema MUST codificar la tarjeta en un código de partida compacto que viaje en la URL. El código MUST ser autocontenido (contiene la tarjeta ya derivada y su versión de esquema) y MUST NOT incluir el `seed`, información oculta del motor ni la partida completa; reconstruir la tarjeta MUST NOT requerir re-simulación ni acceso al motor.
- **FR-018**: El sistema MUST renderizar una página de resultado a partir del código de partida, en un dispositivo distinto y sin acceso al guardado local del jugador original.
- **FR-019**: El sistema MUST generar una imagen de la tarjeta en formato 9:16 y otra en 1:1.
- **FR-020**: El sistema MUST generar una imagen de previsualización social para el enlace compartido.
- **FR-021**: El sistema MUST ofrecer compartir nativo con un texto y/o una imagen adecuados al destino.
- **FR-022**: Las imágenes y el texto compartidos MUST incluir una marca de agua discreta con la dirección del juego y MUST NOT contener datos ocultos ni texto sin sanear.
- **FR-023**: El texto a compartir MUST NOT contener datos técnicos ni información del motor que el jugador no pueda conocer.
- **FR-024**: Ante un código inválido, corrupto o de versión incompatible, el sistema MUST mostrar una página amable con una vía para jugar, sin errores técnicos ni pantallas bloqueadas.

**Composición de la tarjeta (adaptación de la referencia externa)**

- **FR-025**: La tarjeta MUST presentarse como una composición visual tipo póster (identidad, datos destacados, fila de trayectoria, fila de premios y pie con marca de agua y llamada a la acción), no como una lista de texto.
- **FR-026**: La tarjeta MUST NOT incluir una valoración global ni un número "héroe" (no procede en Coplero).
- **FR-027**: La tarjeta MUST permitir ocultar el nombre/apodo de quien comparte (privacidad) antes de compartir; con el nombre oculto, ni la tarjeta, ni el código, ni las imágenes lo muestran.
- **FR-028**: La fila de trayectoria MUST mostrar la secuencia inicio → cambios → final de modalidad y variante, con el año de cada cambio, en orden cronológico.
- **FR-029**: La barra de datos destacados MUST mostrar tres cifras separadas y nunca sumadas entre sí: (a) primeros premios del COAC, (b) mejor posición alcanzada en el COAC —que debe verse cuando no haya premio del COAC— y (c) otros premios (ajenos), desglosados por tipo con su recuento y omitiendo los tipos no ganados.
- **FR-030**: La tarjeta MUST ofrecer el conjunto de acciones de compartir de la referencia: compartir nativo, copiar texto/enlace, descargar la imagen y copiar o abrir el enlace de resultado.
- **FR-031**: La página de resultado MUST ser indexable cuando la tarjeta es válida y MUST exponer una URL canónica estable (`/r/<codigo>`); cuando el código es inválido, corrupto o de versión incompatible, MUST marcarse como `noindex` y MUST NOT declarar canónica.

### Key Entities *(include if feature involves data)*

- **TarjetaFinal**: agregado de solo lectura que representa una carrera terminada tal y como se le muestra al jugador. Reúne identidad (nombre/apodo, modalidad y variante iniciales), trayectoria, resultado (años en activo, mejor fase, mejor posición en el COAC, primeros premios del COAC y otros premios, separados), narración (hitos y frase de cierre) y los datos necesarios para compartirla. Nunca incluye información oculta del motor.
- **Trayectoria**: recorrido de la carrera en cuanto a modalidad y variante (valores iniciales, cambios cronológicos con su año y valores finales) y años sin concursar. La produce el motor con los datos de la feature 006; la tarjeta solo la presenta.
- **Hito narrativo**: suceso destacado de la carrera, con una etiqueta textual y el año en que ocurrió. Se deriva de datos existentes (resultado del COAC, premios, cambios de trayectoria, años sin concursar) y puede ser un hito neutro de trayectoria.
- **Premio**: distinción obtenida por el personaje, clasificada como primer premio del COAC u otro premio, con su año.
- **Código de partida**: representación compacta y compartible de la tarjeta ya derivada que viaja en la URL y permite reconstruir la tarjeta sin el guardado original, sin re-simular y sin incluir el `seed`.
- **Datos ocultos (excluidos)**: techo, suelo, carisma, volatilidad, año pico, milagro y cualquier otro campo interno del motor. No forman parte de la tarjeta, del código de partida ni de las imágenes bajo ningún concepto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las carreras terminadas producen una tarjeta con todos los campos requeridos y coherentes con lo vivido.
- **SC-002**: En una simulación de al menos 10.000 carreras, 0 tarjetas revelan techo, suelo, carisma, volatilidad, año pico o milagro de forma reconocible.
- **SC-003**: El 100% de las tarjetas muestran exactamente tres hitos narrativos.
- **SC-004**: El 100% de las tarjetas se muestran en una sola pantalla de móvil sin desplazamiento horizontal y sin peticiones de red adicionales dentro del bucle jugable.
- **SC-005**: Repetir la misma partida (misma semilla y decisiones) produce una tarjeta idéntica en el 100% de los casos.
- **SC-006**: Un jugador termina la carrera y comprende su resultado y su historia sin explicaciones externas (verificado con al menos 5 personas ajenas al proyecto).
- **SC-007**: El 100% de los enlaces compartidos reproducen la tarjeta en un dispositivo sin guardado local y sin revelar información oculta.
- **SC-008**: El código de una carrera completa cabe en una URL razonable (menos de 2000 caracteres) para poder pegarse en cualquier red social.
- **SC-009**: El 100% de las carreras compartidas generan correctamente las imágenes 9:16 y 1:1 con marca de agua y sin datos ocultos.
- **SC-010**: El 100% de los códigos inválidos o corruptos se resuelven con una página amable y una vía para jugar, sin errores visibles.
- **SC-011**: Las carreras con cambio de modalidad y/o variante reflejan la trayectoria completa en el 100% de los casos; las que no los tienen no inventan cambios.
- **SC-012**: La tarjeta y la página de resultado superan una auditoría automática de accesibilidad de WCAG 2.2 nivel AA sin violaciones de severidad crítica o seria.
- **SC-013**: El 100% de las tarjetas muestran la composición completa (identidad, datos destacados, trayectoria, premios y pie) y ninguna incluye una valoración global ni un número héroe.
- **SC-014**: El 100% de las tarjetas válidas exponen una URL canónica y son indexables; el 100% de los códigos inválidos, corruptos o de versión incompatible se sirven con `noindex`.

## Assumptions

- **Interpretación de "primeros premios" y "otros premios"**: los *primeros premios* son los resultados de podio/ganador en el COAC; los *otros premios* son los premios ajenos al concurso (Copla para Andalucía, Aguja de oro, Candela y espino). Ambos se muestran por separado y con su año.
- **Sin edad, localidad ni género en la tarjeta**: no forman parte de los campos solicitados; se dejan fuera salvo que diseño los reclame más adelante.
- **Orden de prioridad de los hitos**: el motor prioriza ganar el COAC, alcanzar el podio o la final, ganar un premio ajeno (especialmente la Aguja de oro), el cambio de modalidad, el cambio de variante y los años sin concursar; completa con hitos neutros de trayectoria (debut, duración, mejor resultado).
- **Textos de hitos y frase de cierre**: el motor decide *qué* se narra de forma determinista; los textos concretos podrán vivir como contenido y se irán puliendo; si falta un texto, se usa un texto neutro, nunca un dato oculto.
- **El código no incluye el `seed`**: esto ajusta la mención de `docs/02` §10 (que listaba el seed en el código). La tarjeta compartida es autocontenida; las elecciones de texto se derivan de sus datos visibles, nunca del `seed`, para no permitir deducir el `destino`.
- **Dependencia de la feature 006**: la tarjeta presupone que el motor ya registra la trayectoria (cambios de modalidad y variante). Sin 006, esos campos estarían siempre vacíos.
- **El destino permanece interno** (`docs/02` §8, constitución I): la tarjeta, el código de partida y las imágenes jamás lo exponen, ni directa ni indirectamente.
- **Presentación dentro de la isla existente**: la tarjeta se muestra en la pantalla de fin de carrera del bucle jugable (móvil, ancho máximo 420-480 px).
- **Sin fallback de compartir**: no se contempla un plan alternativo para navegadores sin capacidad de compartir nativo (hueco T16, fuera de alcance).
- **Adaptación de la referencia externa (copero.com)**: se adopta la estructura de tarjeta-póster (identidad, datos destacados, fila de trayectoria, premios, pie con marca de agua y CTA) y el conjunto de acciones de compartir, pero **sin** número héroe. El listado de "ver jugadores"/ranking de la referencia queda **fuera de alcance** (no hay backend ni ranking en la v1).
- **Privacidad del nombre**: por defecto la tarjeta muestra el nombre/apodo; el jugador puede ocultarlo antes de compartir (FR-027). Ocultarlo afecta a la tarjeta, al código y a las imágenes.
- **Saneamiento** según `docs/05` §7 (nombre/apodo: recorte, colapso de espacios, límite de longitud y escapado; también en la generación de imágenes).
- **La página de resultado y las imágenes son HTML/imagen estática o de borde**, sin base de datos: el código viaja en la URL (coherente con la constitución y `docs/02` §10).
- **Dependencia interna**: `ResumenCarrera` (`src/engine/resumen.ts`) es el antecedente directo de la tarjeta y se ampliará o sustituirá según el contrato final.
