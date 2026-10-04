# Feature Specification: Página de colaboración (apoyo y sugerencias)

**Feature Branch**: `023-colaborar-page`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Quiero añadir algo para que la gente done, tipo Buy Me a Coffee como el que tengo en acordesgaditanos, y un botón o algo que lleve a un formulario para que la gente haga sugerencias de situaciones y opciones. No sé dónde ponerlo."

## Clarifications

### Session 2026-10-04

- Q: ¿Se añade un menú de navegación como el de acordesgaditanos? → A: **No**. La cabecera sigue siendo **solo la marca** (decisión ya cerrada en la feature 011) y las páginas estáticas mantienen 0 kB de JavaScript, por lo que un menú con JS quedaría descartado.
- Q: ¿Dónde se ofrece la donación? → A: En una **página propia de colaboración** (enlazada desde el pie, presente en todas las páginas) y en un **enlace discreto en la pantalla final del juego**.
- Q: ¿Se crea una cuenta nueva de Buy Me a Coffee para Coplero? → A: **No**. Se reutiliza la cuenta de acordesgaditanos como marca el registro de decisiones, apuntando el enlace con un parámetro que identifique el origen Coplero.
- Q: ¿Dónde vive el formulario de sugerencias? → A: En la **misma página de colaboración**, junto a la donación.
- Q: ¿Cómo se envía el formulario si las páginas van a 0 kB de JS? → A: Con un **envío HTML clásico** (sin JavaScript) a un **servicio externo de formularios sin backend**; tras enviar, el propio servicio muestra su confirmación.
- Q: ¿Qué propone el usuario en el formulario? → A: Una **situación** o una **opción** (con un campo de tipo), más un **mensaje** y un **email opcional** de contacto.
- Q: ¿Qué pasa con la política de privacidad? → A: Se **actualiza** para reflejar que el formulario envía datos a un proveedor externo.
- Q: ¿Qué ruta debe tener la página de colaboración? → A: **`/colaborar`**, con el enlace "Colaborar".
- Q: ¿Dónde va el enlace a `/colaborar` dentro del pie? → A: **Ubicación a criterio de implementación** (un enlace de texto "Colaborar" en el pie); el pie se rediseñará más adelante, así que la posición exacta no es relevante ahora.
- Q: ¿El formulario muestra algún aviso de privacidad? → A: **No**: no lleva aviso ni checkbox; el deber de información se cubre únicamente con la política de privacidad.
- Q: ¿Qué canales de donación ofrece la página? → A: **Solo Buy Me a Coffee** (sin PayPal ni otros canales).
- Q: ¿Qué ofrece la invitación de la pantalla final? → A: **Ambos enlaces**: uno directo a la donación (Buy Me a Coffee) y otro a la página `/colaborar`.
- Q: ¿Qué se considera un «clic» en SC-002? → A: **1 clic** en el botón de donación de `/colaborar` abre la plataforma; no se cuenta la navegación previa hasta la página.
- Q: ¿Se añade el botón de donación a la portada? → A: **Sí**: un botón de Buy Me a Coffee (con icono y texto), **dentro del bloque del ejemplo y justo debajo de su CTA final** (el último "Empezar a jugar"); no se añade un bloque nuevo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apoyar económicamente el proyecto (Priority: P1)

Un jugador que ha disfrutado del juego quiere devolver el gesto con una donación voluntaria. Desde el **botón de la portada**, la página de colaboración o el enlace de la pantalla final llega a la plataforma de donaciones y puede aportar en pocos pasos, sin registro y sin salir de una experiencia clara.

**Why this priority**: es una de las dos razones de ser de la feature; sin un canal de donación visible no hay forma de que el proyecto reciba apoyo.

**Independent Test**: abrir la portada y la página de colaboración y comprobar que existe un botón de donación visible, que abre la plataforma externa en una pestaña nueva y que enlaza al destino correcto del proyecto.

**Acceptance Scenarios**:

1. **Given** un jugador en la página de colaboración, **When** pulsa el botón de donación, **Then** se abre la plataforma de donaciones en una pestaña nueva y segura.
2. **Given** el enlace de donación, **When** se inspecciona su destino, **Then** identifica el origen Coplero mediante un parámetro de la URL.
3. **Given** la pantalla final de una partida, **When** el jugador la lee, **Then** ve una invitación discreta a apoyar el proyecto con un enlace directo.
4. **Given** la portada, **When** el visitante llega al final (bloque del ejemplo), **Then** ve un botón de donación con icono que abre la plataforma en una pestaña nueva con el origen Coplero.

---

### User Story 2 - Proponer una situación u opción (Priority: P1)

Un jugador con ideas sobre el Carnaval quiere aportar una situación nueva o una opción para el banco de decisiones. Desde la página de colaboración rellena un formulario sencillo que llega al autor, sin crear cuenta ni instalar nada.

**Why this priority**: es la otra razón de ser de la feature y la vía más barata de ampliar el banco de situaciones; sin formulario, la comunidad no tiene cauce.

**Independent Test**: rellenar el formulario de la página de colaboración sin JavaScript y comprobar que se envía correctamente y que el usuario recibe una confirmación.

**Acceptance Scenarios**:

1. **Given** un jugador en la página de colaboración, **When** rellena el mensaje y lo envía, **Then** la propuesta se registra en el buzón del autor y el usuario ve una confirmación.
2. **Given** el formulario, **When** el usuario no aporta email, **Then** el envío sigue siendo posible (el email es opcional).
3. **Given** el formulario, **When** el usuario escribe una propuesta, **Then** puede indicar si es una **situación**, una **opción** u otra cosa.
4. **Given** la página cargada sin JavaScript, **When** el usuario envía el formulario, **Then** el envío funciona igual (no depende de scripts del cliente).

---

### User Story 3 - Descubrir la colaboración desde cualquier punto del sitio (Priority: P2)

Un visitante que no conoce la página de colaboración la encuentra con facilidad: la portada añade un botón de donación al final, el pie la enlaza en todas las páginas y la pantalla final del juego la ofrece en el momento de mayor satisfacción.

**Why this priority**: sin descubrimiento, las dos historias anteriores no se activan; aun así, depende de que existan la página y sus canales.

**Independent Test**: recorrer la portada, `/como-jugar` y `/r/codigo-invalido` y comprobar que el pie incluye un enlace `a[href="/colaborar"]`, que la portada ofrece el botón de donación al final, y que la pantalla final (`/jugar?dev=fin`) ofrece donación y `/colaborar`.

**Acceptance Scenarios**:

1. **Given** cualquier página del sitio, **When** se llega al pie, **Then** aparece un enlace a la página de colaboración.
2. **Given** la portada, **When** se abre, **Then** el botón de donación está **dentro del bloque del ejemplo** (bajo su CTA final) y el enlace "Colaborar" en el pie, sin añadir un bloque nuevo a la portada.
3. **Given** la pantalla final del juego, **When** termina la partida, **Then** se ofrecen dos enlaces: uno directo a la donación y otro a la página de colaboración.

---

### Edge Cases

- **JavaScript desactivado**: la página de colaboración, el botón de la portada y el envío del formulario deben funcionar igual (todo es HTML/CSS y un envío clásico).
- **Errores del servicio externo**: si el envío falla, el usuario no debe quedarse en una pantalla rota; el servicio externo devuelve su propia respuesta de error.
- **Spam o envíos automatizados**: el formulario debe contar con una protección antispam básica (campo trampa) y un límite de longitud del mensaje.
- **Mensaje demasiado largo**: el texto de la sugerencia debe limitarse (longitud máxima) sin romper el layout ni el envío.
- **Email inválido**: si el usuario indica un email con formato incorrecto, el formulario debe avisarlo antes de enviar (validación nativa del navegador).
- **Pantallas muy estrechas (< 320 px)**: el formulario, el botón de la portada y sus botones no deben provocar scroll horizontal.
- **Plataforma de donación no disponible**: los enlaces de donación (portada, página y pantalla final) simplemente no cargan su destino; las páginas no dependen de ella para mostrarse.
- **Contraste y foco**: textos, campos y botones (incluido el de la portada) deben mantener contraste WCAG 2.2 AA y foco visible.
- **Enlaces externos**: los enlaces a servicios de terceros deben abrirse en pestaña nueva de forma segura.

## Requirements *(mandatory)*

### Functional Requirements

**Página de colaboración**

- **FR-001**: MUST existir una página de colaboración en la ruta **`/colaborar`** (enlace "Colaborar"), servida como **HTML estático con 0 kB de JavaScript** (sin islas ni scripts), indexable y en español.
- **FR-002**: La página MUST incluir una sección de **apoyo económico** con un texto breve que explique que la donación es voluntaria, y un botón/enlace claro hacia la **plataforma de donaciones del proyecto (solo Buy Me a Coffee; sin PayPal ni otros canales)**.
- **FR-003**: La página MUST incluir una sección de **sugerencias** con una explicación de qué se puede proponer (situaciones y opciones de contenido).
- **FR-004**: La página MUST enlazar a una llamada a la acción para empezar a jugar (coherente con el resto del sitio).

**Donación**

- **FR-005**: Todos los enlaces de donación (portada, página y pantalla final) MUST apuntar al destino del proyecto en la plataforma ya decidida (cuenta reutilizada) e incluir un parámetro que identifique el origen Coplero.
- **FR-006**: Todos los enlaces de donación MUST tener un **nombre accesible** y abrirse en pestaña nueva (seguro, conforme a FR-020).

**Sugerencias**

- **FR-007**: El formulario MUST funcionar **sin JavaScript**: el envío se realiza con un envío HTML clásico a un servicio externo, sin backend propio.
- **FR-008**: El formulario MUST recoger un **mensaje** de la propuesta, con un **límite de longitud** acotado, y un **tipo** (situación, opción u otro).
- **FR-009**: El formulario MUST permitir un **email opcional** de contacto y no exigirlo para enviar.
- **FR-010**: El formulario MUST incluir una **protección antispam básica** (campo trampa oculto) y marcar el **origen Coplero** en el envío.
- **FR-011**: Tras un envío correcto, el usuario MUST recibir una **confirmación** por parte del servicio externo; el flujo no debe terminar en un error visible.
- **FR-012**: El formulario MUST NOT mostrar públicamente el texto enviado por el usuario (las sugerencias llegan solo al autor).

**Descubrimiento y puntos de enlace**

- **FR-013**: El **pie de página** MUST incluir un enlace de texto "Colaborar" a la página de colaboración, presente en todas las páginas del sitio. La posición exacta dentro del pie es secundaria (el pie se rediseñará en el futuro).
- **FR-014**: La **pantalla final del juego** MUST incluir una invitación discreta con **dos enlaces**: uno **directo a la donación** (Buy Me a Coffee) y otro a la página **`/colaborar`**.
- **FR-015**: La **cabecera** MUST NOT incorporar un menú de navegación nuevo; sigue mostrando solo la marca.
- **FR-016**: La portada MUST mantener sus **tres bloques** actuales (feature 022) y MUST NOT añadir un bloque de contenido nuevo. **Dentro del bloque del ejemplo, justo debajo de su CTA final**, MUST mostrarse un **botón de donación de Buy Me a Coffee** (con icono y texto, mismo destino con origen Coplero y abierto en pestaña nueva); es un elemento del último bloque, no un bloque propio.

**Legal, privacidad y calidad**

- **FR-017**: La **política de privacidad** MUST actualizarse para informar de que el formulario envía datos (mensaje y email opcional) a un proveedor externo y con qué finalidad. El formulario NO mostrará aviso ni checkbox de consentimiento: el deber de información se cubre con la política de privacidad.
- **FR-018**: La página de colaboración y el botón de donación de la portada MUST cumplir **WCAG 2.2 AA** (etiquetas de formulario asociadas, contraste, foco visible, nombres accesibles) y ser **mobile-first** (sin scroll horizontal desde 320 px).
- **FR-019**: El sitio MUST mantener la regla de **una sola isla interactiva** y 0 kB de JavaScript en sus páginas estáticas (incluida la portada con el botón de donación).
- **FR-020**: Los enlaces externos MUST abrirse en pestaña nueva de forma segura (`noopener`/`noreferrer`).
- **FR-021**: Todo el texto visible de la página de colaboración y del **botón de donación de la portada** MUST estar en **español**.

### Key Entities

- **Página de colaboración**: página estática del sitio que agrupa el apoyo económico y el envío de sugerencias, con una llamada a empezar a jugar.
- **Canal de donación**: enlace externo a la plataforma de donaciones del proyecto, identificado con su origen; se ofrece en la portada (botón), en la página de colaboración y en la pantalla final.
- **Formulario de sugerencia**: conjunto de campos (mensaje, tipo, email opcional y campo trampa) que se envía a un buzón externo.
- **Sugerencia**: aportación de la comunidad sobre una situación u opción del banco de decisiones del juego.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La página de colaboración se sirve con **0 kB de JavaScript** (0 scripts de cliente) y todo su contenido está presente en el HTML; la portada sigue a 0 kB con el botón de donación.
- **SC-002**: Un visitante inicia una donación con **1 clic** en cualquier botón de donación (portada o página de colaboración); ese clic abre la plataforma en una pestaña nueva.
- **SC-003**: El **100%** de los envíos del formulario realizados desde un navegador sin JavaScript llegan al buzón del autor y muestran confirmación.
- **SC-004**: El enlace a la colaboración aparece en el pie del **100%** de las páginas; la portada incluye un botón de donación en su bloque final; y la pantalla final del juego ofrece donación y `/colaborar`.
- **SC-005**: La auditoría automática de accesibilidad (WCAG 2.2 AA) no reporta violaciones en la página de colaboración ni en la portada.
- **SC-006**: La página de colaboración y la portada no provocan scroll horizontal en anchos de **320 px** en adelante.
- **SC-007**: El **100%** de los enlaces de la página de colaboración, del botón de la portada y de la pantalla final (donación, formulario, volver a jugar) funciona; ninguno devuelve error ni página inexistente.
- **SC-008**: La política de privacidad menciona el formulario y el proveedor externo que trata los datos antes de que la página salga a producción.

## Assumptions

- **Alcance**: esta feature crea la página de colaboración, añade el **botón de donación en la portada** (dentro del bloque del ejemplo), la enlaza desde el pie y añade la invitación en la pantalla final; actualiza la política de privacidad.
- **Sin menú**: la navegación no cambia; la cabecera sigue siendo solo la marca (feature 011). El descubrimiento se hace por la portada, el pie y la pantalla final.
- **Sin bloque nuevo en la portada**: la portada conserva sus **tres bloques** actuales (feature 022); el **botón de donación** es un elemento **dentro del bloque del ejemplo**, no un bloque propio.
- **Cuenta de donaciones reutilizada**: se usa la cuenta ya existente de acordesgaditanos con un parámetro de origen, conforme a la decisión registrada en `docs/05` §5; no se crea una cuenta nueva.
- **Servicio de formularios sin backend**: se usa un servicio externo de formularios (sin servidor propio), en un **plan gratuito** que muestra su propia página de confirmación tras el envío. Mantener al usuario en el sitio exigiría JavaScript y quedaría descartado por la restricción de 0 kB.
- **Moderación del texto libre**: al no mostrarse públicamente, la moderación se apoya en el límite de longitud del mensaje y en el filtro antispam del servicio externo (`docs/05` §7).
- **Privacidad**: el tratamiento de datos del formulario se rige por la política de privacidad del sitio, que se actualiza en esta feature.
- **Fuera de alcance**: analítica (no se porta el `gtag` de acordesgaditanos), AdSense, sistema de cuentas, una página de contacto separada, el buzón *dentro* del juego y cualquier forma de publicidad o marcas.
- **Restricción de rendimiento**: se mantiene la regla del proyecto de 0 kB de JavaScript en las páginas estáticas (portada incluida) y una única isla interactiva en `/jugar`.
