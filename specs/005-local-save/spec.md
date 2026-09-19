# Feature Specification: Persistencia local de la partida

**Feature Branch**: `005-local-save`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Implementa persistencia local de la partida. Requisitos: localStorage, versión de esquema, guardar después de cada decisión, restaurar partida, detectar versión incompatible, comportamiento amable si no se puede restaurar. No introducir backend."

## Clarifications

### Session 2026-09-20

- Q: ¿Qué debe mostrar la home cuando la partida guardada ya ha terminado? → A: Mostrar el resultado final guardado y ofrecer "Empezar de cero" (sin "Continuar").
- Q: ¿Debe avisarse al jugador cuando no se puede guardar? → A: No avisar; el juego funciona igual y el jugador lo percibe al no encontrar "Continuar" después.
- Q: Tras detectar un guardado no restaurable, ¿se borra o se conserva? → A: Borrarlo del almacenamiento tras un aviso puntual (se muestra una sola vez).
- Q: ¿Cómo se resuelve el conflicto si hay dos pestañas con la partida abierta? → A: Última pestaña que guarda gana, sin detección de conflicto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Continuar la carrera donde la dejé (Priority: P1)

Un jugador empieza una partida en el móvil, elige varias decisiones a lo largo de varios días y cierra el navegador. Al volver a entrar, la app reconoce que hay una carrera en curso y le ofrece continuar exactamente en la decisión en la que la dejó, sin perder nada de lo avanzado.

**Why this priority**: sin esto, cualquier interrupción (llamada, batería, cambio de app desde WhatsApp) destruye la partida. Es la base del producto: una carrera dura muchos años de juego repartidos en varias sesiones.

**Independent Test**: crear una partida, tomar una decisión, recargar la página y comprobar que la partida se retoma en la misma decisión, año, momento, atributos y flags.

**Acceptance Scenarios**:

1. **Given** una partida en curso con al menos una decisión tomada, **When** el jugador cierra y vuelve a abrir la aplicación, **Then** la home ofrece continuar y, al hacerlo, se retoma exactamente en la misma decisión, año, momento y tipo.
2. **Given** una partida en curso, **When** el jugador toma una decisión y cierra la pestaña de inmediato, **Then** la decisión ya está guardada y no se repite ni se pierde.
3. **Given** una partida restaurada, **When** se compara con la partida original en el momento de cerrar, **Then** el estado es idéntico (mismo historial, atributos y flags).

---

### User Story 2 - Empezar de cero sin arrastrar la carrera anterior (Priority: P2)

Un jugador que ya tenía una carrera quiere empezar una nueva. La app le deja iniciar una partida nueva y sustituir el guardado anterior, con una acción explícita para descartar la partida en curso.

**Why this priority**: sin una salida clara, un guardado viejo bloquea empezar de nuevo. Es importante, pero puede convivir con un aviso mientras no exista, no rompe la experiencia principal.

**Independent Test**: con una partida guardada, iniciar una nueva y comprobar que la anterior desaparece y no se puede restaurar.

**Acceptance Scenarios**:

1. **Given** una partida guardada, **When** el jugador empieza una partida nueva y la crea, **Then** el guardado anterior se reemplaza y "continuar" ya no ofrece la carrera vieja.
2. **Given** una partida guardada, **When** el jugador elige empezar de cero, **Then** el guardado se elimina y vuelve a la pantalla inicial sin partida en curso.
3. **Given** una carrera ya terminada y guardada, **When** el jugador abre la app, **Then** ve el resultado final y se le ofrece empezar de cero, sin opción de continuar.

---

### User Story 3 - Recuperación amable ante un guardado inservible (Priority: P3)

Tras una actualización del juego, o si los datos guardados están dañados, el jugador abre la app y no puede continuar. En lugar de un error, la app le explica con calma que la partida anterior ya no es válida y le invita a empezar de cero.

**Why this priority**: protege la confianza y evita callejones sin salida; no es frecuente, pero cuando ocurre es lo que separa "se rompió" de "lo entiendo y sigo".

**Independent Test**: sembrar un guardado con versión distinta o con contenido ilegible y comprobar que la app arranca con normalidad, muestra un aviso claro y permite empezar de cero.

**Acceptance Scenarios**:

1. **Given** un guardado creado con una versión de esquema anterior a la actual, **When** el jugador abre la app, **Then** se descarta, se muestra un aviso amable y se ofrece empezar de cero, sin errores visibles.
2. **Given** un guardado dañado o ilegible, **When** el jugador abre la app, **Then** la app arranca normalmente, muestra un aviso y no queda bloqueada.
3. **Given** un dispositivo donde el almacenamiento local no está disponible o está lleno, **When** el jugador juega, **Then** puede completar la partida igualmente, aunque no se guarde, y la app no muestra errores técnicos.

---

### Edge Cases

- **Versión incompatible**: el guardado se creó con un formato anterior (o posterior) al vigente; debe descartarse con aviso puntual y eliminarse, nunca interpretarse parcialmente.
- **Datos manipulados o corruptos**: contenido ilegible, campos que faltan o tipos inesperados; se tratan como "no restaurable", se eliminan y se avisa una sola vez.
- **Almacenamiento no disponible**: modo privado, permisos, o cuota agotada; la partida sigue siendo jugable sin guardado y sin aviso adicional al jugador.
- **Cierre a mitad de decisión**: el guardado debe reflejar siempre la última decisión confirmada, nunca un estado intermedio.
- **Carrera terminada**: al acabar la carrera, el guardado se conserva; la pantalla inicial muestra el resultado final y ofrece empezar de cero, sin ofrecer continuar.
- **Guardado de una partida ya no reproducible**: si al restaurar el motor no puede continuar (por ejemplo, contenido retirado), se descarta con aviso amable y se elimina.
- **Datos ocultos**: el guardado no debe mostrar al jugador ni revelar información que el juego mantiene oculta (el techo de carrera).
- **Varias pestañas**: si la partida está abierta en dos pestañas, la última que guarde es la que prevalece; no se detecta ni se resuelve el conflicto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST guardar la partida automáticamente después de cada decisión confirmada, sin acción del jugador.
- **FR-002**: System MUST guardar también en el momento de crear la partida, para que la carrera quede registrada desde el inicio.
- **FR-003**: System MUST restaurar la partida guardada reproduciendo exactamente el mismo estado (historial de decisiones, año, momento, tipo, atributos y flags).
- **FR-004**: System MUST detectar que hay una partida guardada al abrir la app y ofrecer continuarla como acción principal de la pantalla inicial.
- **FR-005**: System MUST marcar cada guardado con una versión de esquema.
- **FR-006**: System MUST detectar un guardado con versión de esquema distinta a la vigente, eliminarlo del almacenamiento y no intentar interpretarlo parcialmente.
- **FR-007**: System MUST tratar un guardado ilegible, incompleto o con tipos inesperados como no restaurable, eliminándolo del almacenamiento.
- **FR-008**: Users MUST ver un aviso claro y amable cuando un guardado no se puede restaurar, con una vía para empezar de cero, sin mensajes técnicos ni pantallas bloqueadas.
- **FR-009**: Users MUST poder empezar de cero, eliminando el guardado existente.
- **FR-010**: System MUST reemplazar el guardado anterior al crear una partida nueva.
- **FR-011**: System MUST mantener un único guardado por navegador/dispositivo (una sola carrera en curso).
- **FR-012**: System MUST permitir jugar la partida completa aunque el almacenamiento local no esté disponible, degradando sin errores visibles y sin aviso al jugador.
- **FR-013**: System MUST funcionar sin backend, sin cuentas de usuario y sin conexión a red.
- **FR-014**: System MUST NOT exponer ni revelar al jugador información oculta del juego (el techo de carrera) a través del guardado o de sus avisos.
- **FR-015**: System MUST NOT almacenar datos personales más allá de los que el jugador introduce para crear su personaje.
- **FR-016**: System MUST distinguir una partida en curso de una terminada; si la carrera ha finalizado, la pantalla inicial MUST mostrar el resultado final y ofrecer empezar de cero, sin ofrecer continuar.

### Key Entities *(include if feature involves data)*

- **Partida guardada**: la carrera en un momento dado (personaje, modalidad y variante actuales, año, momento, atributos, flags e historial de decisiones), junto con la versión de esquema con la que se escribió. Puede representar una carrera **en curso** o **terminada**; la pantalla inicial distingue ambos casos.
- **Versión de esquema**: identificador que permite saber si un guardado es interpretable por la versión actual del juego.
- **Almacén local**: el medio del navegador donde vive el guardado, único por dispositivo e independiente de cualquier servidor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las partidas guardadas se retoman en la misma decisión, año y momento en que se dejaron (verificado con partidas de referencia).
- **SC-002**: Recargar la página nunca pierde una decisión ya confirmada (0 pérdidas en una carrera completa de prueba).
- **SC-003**: Un jugador puede reanudar su carrera en 2 toques o menos desde la pantalla inicial.
- **SC-004**: El 100% de los guardados corruptos o de versión incompatible se resuelven con un aviso amable y la opción de empezar de cero, sin errores visibles ni pantallas bloqueadas.
- **SC-005**: La partida sigue siendo jugable de principio a fin en el 100% de los casos en que el almacenamiento local no esté disponible.
- **SC-006**: El guardado de una partida completa ocupa menos del 1% del límite de almacenamiento local típico de un navegador.
- **SC-007**: 0 peticiones de red relacionadas con guardar o restaurar la partida.

## Assumptions

- **Una sola ranura**: se guarda una única carrera en curso por navegador; no hay múltiples partidas simultáneas ni perfiles.
- **Sin migración en v1**: ante una versión de esquema distinta, se descarta el guardado con un aviso puntual y se elimina del almacenamiento; no se conservan compatibilidades antiguas (coherente con "detectar versión incompatible" y "comportamiento amable").
- **Tecnología confirmada**: `docs/02` §10 fija `localStorage` con versión de esquema y guardado en cada elección; no se introduce backend ni base de datos.
- **Privacidad**: el guardado local es funcionalidad esencial del servicio, no requiere consentimiento (solo mención en la política de privacidad, `docs/05` §7).
- **Carrera terminada**: al acabar la carrera el guardado se conserva y la pantalla inicial muestra el resultado final con la opción de empezar de cero (sin "Continuar").
- **Tamaño**: el guardado debe ser compacto (unos pocos KB) para no acercarse a los límites del navegador.
- **Contexto de implementación**: ya existe una primera capa de persistencia introducida con la UI jugable (feature 004); esta feature la consolida, la verifica contra estos requisitos y cubre los huecos (almacenamiento no disponible, avisos, carrera terminada).
- **Avisos**: los textos amables de "guardado incompatible" y "datos dañados" se definirán en diseño; en cambio, **no se avisa** cuando el almacenamiento no está disponible (la ausencia de "Continuar" es la señal).
- **Sin sincronización**: no se sincroniza la partida entre dispositivos ni se recupera si el jugador borra los datos del navegador; tampoco se sincroniza entre pestañas (gana la última que guarde).
