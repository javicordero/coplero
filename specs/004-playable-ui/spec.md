# Feature Specification: Versión mínima jugable (/jugar)

**Feature Branch**: `004-playable-ui`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "GAME-001. Crear la versión mínima jugable completa en /jugar. Flujo: Intro → Crear personaje → Elegir modalidad → Elegir variante → Año → Decisión verano → Resultado → Decisión febrero → Resultado COAC → Siguiente año → ... → Fin de carrera. La UI debe ser deliberadamente sencilla. No hacer todavía animaciones complejas, diseño final, sonido, compartir, OG, monetización, analytics ni logros. Toda la lógica seguirá en engine; Svelte únicamente presenta estado y envía acciones al engine."

## Clarifications

### Session 2026-09-19

- Q: El flujo describe un "Resultado" tras el verano y otro tras febrero, pero el motor resuelve el COAC una vez al año. ¿Cuántas pantallas de resultado por año? → A: Una sola pantalla de resultado por año, tras la decisión de febrero (fase, puesto y premios); no hay resultado intermedio de verano.
- Q: ¿Qué alcance tiene la moderación del nombre libre en esta fase? → A: Normalizar, limitar a 24 caracteres y mostrar como texto plano; la lista de bloqueo de insultos se pospone a la fase legal/lanzamiento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jugar una carrera completa de principio a fin (Priority: P1)

Un jugador abre `/jugar`, ve una introducción, crea su personaje, elige modalidad y variante, y juega año tras año tomando una decisión de verano y una de febrero hasta que la carrera termina con un resumen.

**Why this priority**: es el objetivo del feature: comprobar que el juego se puede jugar entero sin callejones sin salida.

**Independent Test**: completar una carrera entera en `/jugar` desde la intro hasta la pantalla de fin, comprobando que todos los años tienen decisiones disponibles y que existe una pantalla final con el resumen.

**Acceptance Scenarios**:

1. **Given** la intro, **When** el jugador empieza, **Then** llega a crear personaje y no puede continuar con los campos obligatorios vacíos.
2. **Given** un personaje y una modalidad/variante elegidos, **When** comienza la carrera, **Then** cada año ofrece una decisión de verano y una de febrero con al menos dos opciones.
3. **Given** una carrera en curso, **When** se agotan los años, **Then** aparece la pantalla de fin con el resumen (nombre, modalidad, variante, años, mejor fase, premios).
4. **Given** una carrera completa, **When** se juega dos veces con las mismas decisiones desde la misma semilla, **Then** el resultado es idéntico.

---

### User Story 2 - Entender el contexto y decidir sin ambigüedad (Priority: P2)

En cada decisión el jugador ve el año y el momento (verano/febrero), el enunciado de la situación y las opciones con su título y subtítulo; tras decidir, ve el resultado de la temporada de forma legible.

**Why this priority**: sin contexto ni resultados claros el juego no se entiende, aunque sea técnicamente jugable.

**Independent Test**: recorrer varias decisiones comprobando que el indicador de contexto cambia con el año/momento y que el resultado de temporada muestra fase, puesto y premios.

**Acceptance Scenarios**:

1. **Given** cualquier decisión, **When** se muestra, **Then** aparece año y momento, la situación y sus opciones con título y subtítulo.
2. **Given** una decisión elegida, **When** termina el año, **Then** se muestra el resultado de temporada (fase alcanzada, puesto y premios si los hay).
3. **Given** una situación sin texto de cuerpo (banco actual), **When** se muestra, **Then** la pantalla no queda rota ni vacía.

---

### User Story 3 - Continuar donde lo dejaste (Priority: P3)

El jugador puede cerrar la pestaña y al volver a `/jugar` continuar la partida en el punto donde la dejó, o empezar de cero.

**Why this priority**: evita perder una carrera larga; es funcionalidad ya definida para el producto, pero no bloquea comprobar que se puede jugar entero.

**Independent Test**: empezar una partida, recargar la página y comprobar que se retoma en el mismo punto; después, empezar de cero y verificar que se reinicia.

**Acceptance Scenarios**:

1. **Given** una partida en curso, **When** se recarga la página, **Then** la partida continúa en el mismo punto.
2. **Given** una partida guardada, **When** el jugador elige empezar de cero, **Then** se descarta y arranca una nueva.
3. **Given** un guardado de una versión anterior del formato, **When** se carga, **Then** se descarta con un aviso amable y se puede empezar de nuevo.

---

### Edge Cases

- **Nombre o apodo vacío o solo espacios**: no se permite continuar; se normaliza y se limita la longitud.
- **Nombre con caracteres especiales o marcado**: se muestra siempre como texto plano (nunca HTML crudo).
- **Recarga a mitad de una decisión**: se retoma en la misma decisión sin aplicarla dos veces.
- **Guardado incompatible tras un despliegue**: se descarta sin romper la página.
- **Sin contenido para un momento**: no debe ocurrir con el banco actual, pero la UI no puede quedarse en blanco; muestra un estado de error legible.
- **Carrera ya terminada**: volver a `/jugar` ofrece empezar de nuevo.
- **Pantalla estrecha (móvil)**: el contenido se mantiene legible y accionable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/jugar` MUST ofrecer una única isla interactiva con todas las pantallas del juego; el resto de páginas MUST seguir siendo HTML estático sin JS.
- **FR-002**: La UI MUST respetar el flujo: intro → creación de personaje → modalidad → variante → años (decisión verano → decisión febrero → resultado de temporada) → fin de carrera.
- **FR-003**: La creación de personaje MUST recoger nombre/apodo (texto libre), edad, localidad y género, y MUST mostrar el título dinámico del juego según el género (Coplero/Coplera/Coplere).
- **FR-004**: La elección de modalidad MUST ofrecer las dos modalidades jugables con su título y subtítulo.
- **FR-005**: La elección de variante MUST ofrecer las tres variantes de la modalidad elegida, con su título y subtítulo.
- **FR-006**: Cada decisión MUST mostrar el enunciado de la situación y sus opciones con título y subtítulo, y MUST permitir elegir exactamente una opción.
- **FR-007**: La UI MUST NOT contener lógica de juego: MUST limitarse a presentar el estado del motor y enviarle las acciones del jugador.
- **FR-008**: Durante toda la carrera MUST mostrarse un indicador de contexto con año y momento (verano/febrero).
- **FR-009**: Tras cada año MUST mostrarse el resultado de la temporada con la fase alcanzada, el puesto y los premios obtenidos si los hay.
- **FR-010**: La carrera MUST terminar en una pantalla de fin con un resumen: nombre, modalidad, variante, años en activo, mejor fase alcanzada y premios.
- **FR-011**: La partida MUST ser determinista: una misma semilla con las mismas decisiones MUST producir el mismo resultado, y la semilla MUST generarse una sola vez por partida.
- **FR-012**: La partida MUST guardarse localmente en cada elección con una versión de esquema, y MUST poder continuarse o reiniciarse.
- **FR-013**: El texto libre (nombre/apodo) MUST normalizarse (recortar y colapsar espacios), limitarse a 24 caracteres y mostrarse siempre como texto plano (nunca marcado crudo). La lista de bloqueo de insultos queda fuera de esta fase.
- **FR-014**: La UI MUST ser mobile-first real y en escritorio mantener el mismo layout con ancho máximo contenido (420-480 px).
- **FR-015**: El feature MUST NOT incluir compartir, imagen OG, analítica, monetización, sonido, logros, animaciones complejas ni el diseño visual final.
- **FR-016**: Si el motor informa de contenido insuficiente o de una acción inválida, la UI MUST mostrar un estado de error legible y permitir reintentar o reiniciar.
- **FR-017**: El juego MUST mostrar una única pantalla de resultado por año, tras la decisión de febrero, con la fase alcanzada, el puesto y los premios obtenidos.

### Key Entities *(include if feature involves data)*

- **Partida**: estado del juego (personaje, modalidad, variante, año, momento, fase, atributos, flags, historial, temporadas, premios, resumen). Vive en el motor; la UI solo lo presenta.
- **Personaje**: nombre/apodo, edad, localidad y género.
- **Modalidad**: comparsista o chirigotero, con su título y subtítulo.
- **Variante**: una de las tres de la modalidad, con título y subtítulo.
- **Situación mostrada**: enunciado y opciones (título y subtítulo) de la decisión actual.
- **Resultado de temporada**: fase alcanzada, puesto y premios del año.
- **Resumen de carrera**: datos de cierre para la pantalla final.
- **Guardado local**: partida persistida con versión de esquema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un jugador completa una carrera entera desde la intro hasta la pantalla de fin sin encontrar pantallas vacías ni bloqueos.
- **SC-002**: El 100% de las pantallas de decisión muestran el indicador de contexto (año, momento) y al menos dos opciones con título y subtítulo.
- **SC-003**: Alguna de las pantallas tras cada año muestra el resultado de la temporada con fase, puesto y premios cuando correspondan.
- **SC-004**: Tras recargar la página a mitad de una carrera, el jugador retoma exactamente en el punto donde estaba.
- **SC-005**: La landing y el resto de páginas no interactivas siguen sirviéndose sin JavaScript.
- **SC-006**: Repetir una carrera con la misma semilla y las mismas decisiones produce exactamente el mismo resumen final.

## Assumptions

- Las **variantes** son las documentadas en `docs/01` §2: comparsista (Clásico, Nueva escuela, Evolución con raíces) y chirigotero (Lolosedismo, Clásico, Interpretar el personaje), con título y subtítulo.
- La **semilla** se genera en el cliente una vez por partida; el motor sigue siendo determinista y sin azar implícito.
- La **duración** de la carrera la decide el motor (números ya cerrados); la UI no la elige.
- La **persistencia local** (localStorage con versión de esquema y guardado en cada elección) forma parte de GAME-001, según las decisiones ya cerradas, con opción de continuar o reiniciar.
- Los **textos de cuerpo** de las situaciones están vacíos en el banco actual; la UI debe funcionar igualmente.
- El **saneamiento** del texto libre se aplica en su parte de normalización, límite (24 caracteres) y texto plano; la lista de bloqueo de insultos de `docs/05` §7 se añade en la fase legal/lanzamiento.
- El motor resuelve el COAC **una vez por año**; su resultado se muestra después de la decisión de febrero (una sola pantalla de resultado por año).
- Quedan **fuera de alcance**: compartir, imagen OG, rutas de resultado por código, analítica, monetización, sonido, logros, y el diseño visual definitivo.
- La página de introducción puede ser estática dentro de la isla (primera pantalla) sin necesidad de una ruta propia.
