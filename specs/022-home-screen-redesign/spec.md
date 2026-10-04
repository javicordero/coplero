# Feature Specification: Rediseño de la portada al estilo del juego

**Feature Branch**: `022-home-screen-redesign`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "ahora tenemos que modificar la pantalla de inicio para que se ajuste con el estilo del esto de pantallas. Tambien yo la haria mas corta, deja los 3 bloques que tienen. Pero adapta el estilo un poco. Quita el svg ese de arriba de que es coplero y como funciona. De hecho los 2 primeros bloques casi que los fusionaría en uno, aunque no tengo claro como"

## Clarifications

### Session 2026-10-04

- Q: ¿Cómo se fusionan los dos primeros bloques (hero y «Qué es Coplero y cómo funciona»)? → A: **3 bloques**. La apertura se mantiene breve (título + frase + CTA) y, justo debajo, va un bloque compacto con la explicación y los pasos; la «fusión» es **visual** (mismo lenguaje, sin corte perceptible), no estructural.
- Q: ¿Qué SVG decorativo se retira de la portada? → A: **solo el compás que encabeza la sección explicativa**, y se **sustituye por un separador tipográfico** acorde al lenguaje del juego. **Revisión (2026-10-04):** el compás se retira **también** del bloque de ejemplo; la portada no conserva ningún compás.
- Q: ¿Cómo se mide el acortado de la portada (SC-003)? → A: **sin métrica numérica**: basta con que la portada se perciba más corta que la actual; no se fija ningún porcentaje.
- Q: ¿El bloque explicativo conserva un encabezado de sección visible? → A: **sí, un h2** (texto tipo «Qué es Coplero y cómo funciona»), integrado visualmente con la apertura; se mantiene la jerarquía `h1` → `h2` → `h3`.
- Q: ¿Qué forma tiene el separador tipográfico que sustituye al compás? → A: un **ornamento tipográfico decorativo** (p. ej. `···` o `///`) en color acento, **sin texto nuevo**.
- Q: ¿A qué tarjeta final se refiere el cambio de contenido? → A: a **ambas**: la de la portada (`EJEMPLO_TARJETA`, que también genera la imagen OG de `/`) y la del modo dev de la pantalla final (caso `campeon`), con el **mismo contenido**.
- Q: ¿Cómo se reparten los premios y la trayectoria del ejemplo? → A: carrera **2027–2040** (14 años); progresión 2027 preliminares (debut) → 2029 cuartos → 2032 semifinales → 2035 final; **podio 2037**, **primer premio 2038** y **podio 2040**; distinciones **2 agujas de oro (2036, 2039)** y **1 coplas por Andalucía (2034)**.
- Q: ¿Cómo se concilia la trayectoria más larga del ejemplo con la portada «más corta»? → A: el **acortado** se aplica a la **apertura + bloque explicativo**; se acepta que la tarjeta de ejemplo crezca con la nueva carrera.
- Q: Revisión de la portada ya implementada (2026-10-04) → A: se **mantiene el ornamento** (el compás sigue fuera del bloque explicativo); **más aire** entre bloques y hero que arranca más abajo; **hero estilizado** con `eyebrow`; la **referencia a Acordes Gaditanos pasa al hero**; se quitan el micro y el 2.º párrafo de `#que-es`; el 1.º se reescribe; los pasos **conservan su subtítulo**; **se descarta el acortado**. **Revisión (2026-10-04):** el hero llena la primera pantalla (`100svh − cabecera`), con un **fondo nocturno a sangre** (navy/índigo de la paleta, con velo y fundido inferior que se disuelve en el fondo); el contenido sigue dentro del marco.
- Q: Revisión final de la portada (2026-10-04) → A: el hero **llena la primera pantalla** con el **fondo nocturno a sangre** y el contenido dentro del marco; el **titular es grande** (`min(22vw, 7rem)`) y justo debajo va el **subtítulo «Del creador de Acordes Gaditanos»** en versalitas (enlace **sin subrayado**); el **CTA va a todo el ancho**; los bloques ganan aire; el **cuerpo de texto sube a `--texto-lg`** (interlineado 1.5) y los **subtítulos de los pasos se aprietan a 1.3** (títulos a `--texto-xl`); se actualizan los textos de los 4 pasos y la descripción de «Tu tarjeta final».

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender y empezar desde una portada coherente con el juego (Priority: P1)

Un visitante que abre el enlace en el móvil llega a `/` y percibe de inmediato que está dentro del mismo producto que el juego: la misma tipografía, superficies, acentos y tono. Entiende qué es Coplero y cómo funciona en los dos primeros bloques, presentados con continuidad visual, y encuentra un botón claro para empezar a jugar.

**Why this priority**: la portada es la puerta de entrada y el primer paso de la conversión. Hoy su lenguaje visual (hero grande, textos sueltos, compás decorativo) no se parece al de las pantallas del juego, lo que rompe la continuidad al pulsar «Empezar a jugar».

**Independent Test**: abrir `/` en móvil y comprobar que, sin JavaScript, se ve el nombre del juego, la apertura con el CTA, la explicación de qué es y cómo funciona, y todo con la identidad visual de las pantallas del juego.

**Acceptance Scenarios**:

1. **Given** un visitante nuevo, **When** abre `/`, **Then** ve el nombre «Coplero» y una frase que explica qué es, seguidos de la explicación de cómo funciona y los pasos.
2. **Given** los dos primeros bloques, **When** se recorren, **Then** se perciben como una unidad con el mismo lenguaje visual, sin un corte que los separe como secciones ajenas.
3. **Given** el CTA principal, **When** lo pulsa, **Then** llega a `/jugar`.
4. **Given** la portada cargada, **When** se compara con las pantallas del juego, **Then** comparte su lenguaje visual (tipografía display en mayúsculas, superficies y bordes, acento cálido, misma jerarquía).

---

### User Story 2 - Ver una tarjeta final de ejemplo (Priority: P2)

El visitante curioso quiere saber cómo termina una partida antes de empezar. La portada le muestra una tarjeta final de ejemplo **más larga y con varias distinciones**, realzada con el mismo lenguaje visual del juego.

**Why this priority**: hace tangible la recompensa (la tarjeta compartible) y refuerza la continuidad visual, pero no bloquea el hecho de empezar a jugar.

**Independent Test**: recorrer `/` y comprobar que el ejemplo de tarjeta final se ve, es legible sin JavaScript, sigue el nuevo lenguaje visual y muestra una trayectoria larga con varias distinciones.

**Acceptance Scenarios**:

1. **Given** `/` cargada, **When** se recorre, **Then** se muestra una tarjeta final de ejemplo tal como la obtendría un jugador.
2. **Given** la sección del ejemplo, **When** se lee, **Then** se explica brevemente que así termina una carrera y que se puede compartir.
3. **Given** la tarjeta de ejemplo, **When** se inspecciona, **Then** muestra una carrera de **2027 a 2040** (debut 2027, cuartos 2029, semifinales 2032, final 2035, primer premio 2038) con **2 agujas de oro y 1 coplas por Andalucía**.

---

### User Story 3 - Compás sustituido por ornamento y portada con aire (Priority: P3)

El visitante encuentra una portada sin el elemento decorativo de compás en la sección explicativa (sustituido por un ornamento tipográfico), con más aire entre bloques y con la apertura arrancando más abajo.

**Why this priority**: reduce fricción y ruido visual y da respiro a la entrada, pero es una mejora de acabado sobre las dos anteriores.

**Independent Test**: recorrer `/` y comprobar que el compás de la sección explicativa ya no está (en su lugar hay un ornamento), que no se ha perdido información del juego y que la portada respira más.

**Acceptance Scenarios**:

1. **Given** `/` cargada, **When** se inspecciona la parte superior de la sección explicativa, **Then** no aparece el SVG decorativo de compás, sino un ornamento acorde al lenguaje del juego.
2. **Given** la portada anterior y la nueva, **When** se comparan a la misma anchura, **Then** la apertura arranca más abajo y los bloques quedan más separados.

---

### Edge Cases

- **JavaScript desactivado**: la portada debe verse y funcionar igual; todo el contenido y los CTAs son HTML/CSS.
- **Pantallas muy estrechas (< 320 px)**: los títulos, textos y la tarjeta de ejemplo no deben provocar scroll horizontal.
- **Textos largos** (frase de qué es, títulos de pasos): no deben romper el layout ni desbordar.
- **Ejemplo más alto**: la tarjeta de ejemplo, al ser más larga y con más distinciones, no debe desbordar ni provocar scroll horizontal a 320 px.
- **Contraste**: al adoptar el lenguaje visual del juego (texto sobre superficies oscuras y acentos), se debe mantener el contraste WCAG 2.2 AA.
- **Movimiento reducido**: cualquier animación o transición debe neutralizarse con `prefers-reduced-motion`.
- **Zoom al 200%**: la portada debe seguir siendo legible y utilizable.
- **Pruebas existentes**: las comprobaciones de la portada (sección `#que-es`, número de pasos y ejemplo de tarjeta) deben actualizarse para reflejar la nueva estructura sin perder cobertura útil.

## Requirements *(mandatory)*

### Functional Requirements

**Estructura y contenido**

- **FR-001**: `/` MUST conservar los **tres bloques de contenido actuales** (apertura, «Qué es Coplero y cómo funciona» y ejemplo de tarjeta final) sin eliminar información. La fusión solicitada afecta a la presentación de los dos primeros, no al borrado de contenido (ver FR-002).
- **FR-002**: Los dos primeros bloques actuales MUST presentarse con **continuidad visual** (mismo lenguaje, jerarquía y ritmo, sin un corte que los haga parecer secciones ajenas): primero una **apertura breve** con el nombre, la frase que explica qué es y el CTA, y justo debajo un **bloque compacto** con la explicación y los pasos. El bloque explicativo MUST conservar su propio encabezado de sección (`h2`), manteniendo la jerarquía `h1` → `h2` → `h3`. Se mantienen los 3 bloques; la fusión es visual, no estructural.
- **FR-003**: La portada MUST retirar los SVG decorativos de compás (tanto el del bloque explicativo como el del ejemplo) y MUST sustituirlos por un **separador tipográfico decorativo** (p. ej. un ornamento `···` o `///` en color acento), **sin texto nuevo** y acorde al lenguaje del juego.
- **FR-004**: La apertura y el bloque explicativo MUST mantener la explicación de qué es Coplero (juego narrativo del Carnaval de Cádiz, crear personaje, elegir modalidad, decidir en verano y febrero, terminar en una tarjeta para compartir).
- **FR-005**: El bloque explicativo MUST mantener los pasos de «cómo funciona» (crear personaje → elegir modalidad y estilo → decidir cada año → recibir la tarjeta).
- **FR-006**: La portada MUST mantener el ejemplo de tarjeta final y una frase breve que explique que así termina una carrera.
- **FR-007**: La portada MUST mantener la mención y el enlace a acordesgaditanos como obra del mismo autor.
- **FR-008**: La portada MUST mantener una o más llamadas a la acción que lleven a `/jugar`.

**Estilo y continuidad visual**

- **FR-009**: La portada MUST adoptar el lenguaje visual de las pantallas del juego (tipografía display en mayúsculas para los encabezados, superficies oscuras con bordes y sombras, acento cálido de marca, tarjetas de opción con su tratamiento de hover, separadores tipográficos).
- **FR-010**: La portada MUST dar **aire** entre bloques: la apertura arranca más abajo (`min-height`) y la separación vertical es generosa. El objetivo de **acortar la portada queda descartado** (revisión de 2026-10-04).
- **FR-011**: La portada MUST mantener el tema oscuro y los tokens de diseño existentes; no se introducen colores ni tipografías nuevas.

**Calidad, alcance y accesibilidad**

- **FR-012**: `/` MUST seguir sirviéndose como **HTML estático con 0 kB de JavaScript**: sin islas, sin scripts y sin dependencias que añadan JS al cliente.
- **FR-013**: El CTA principal MUST ser visible sin hacer scroll en un móvil de 360×640.
- **FR-014**: La portada MUST ser **mobile-first**: ancho completo en móvil y contenido centrado con el ancho máximo del marco en escritorio.
- **FR-015**: `/` MUST cumplir **WCAG 2.2 AA** (jerarquía de encabezados coherente, contraste suficiente, foco visible, nombres accesibles).
- **FR-016**: `/` MUST seguir siendo **indexable** (título, descripción, canonical; sin `noindex`) y conservar los metadatos para compartir.
- **FR-017**: La portada MUST NOT ofrecer opción de «continuar partida» (permanece estática), conforme a la decisión ya cerrada sobre la entrada directa al juego.
- **FR-018**: Todo el texto visible de la portada MUST estar en **español**.
- **FR-021**: El hero MUST **llenar la primera pantalla** (`100svh − cabecera`, con reserva `100vh`) y llevar un **fondo nocturno a sangre** construido con los tokens de la paleta (velo + fundido inferior hacia `--c-fondo`); el contenido MUST permanecer dentro del marco de 680 px.
- **FR-022**: El **cuerpo de texto** de los bloques MUST ir a `--texto-lg` con interlineado normal (1.5); los **subtítulos de los pasos** a interlineado 1.3 y sus **títulos** a `--texto-xl`; el **titular del hero** MUST ser grande (`min(22vw, 7rem)`).

**Contenido del ejemplo de tarjeta final**

- **FR-019**: Las fixtures de la tarjeta de ejemplo —`EJEMPLO_TARJETA` (portada) y el caso `campeon` del modo dev de la pantalla final— MUST actualizarse a una **carrera más larga y con más distinciones**: 2027–2040; debut 2027, cuartos 2029, semifinales 2032 y final 2035; **podio 2037**, **primer premio 2038** y **podio 2040**; **2 agujas de oro (2036, 2039)** y **1 coplas por Andalucía (2034)**.
- **FR-020**: Ambas fixtures MUST seguir siendo un `TarjetaFinal` válido y coherente (progresión, mejor fase y puesto, exactamente **3 hitos**, distinciones con `veces` = nº de años) y MUST sobrevivir al códec; la **imagen OG** de la portada MUST reflejar el nuevo ejemplo.

### Key Entities

- **Bloque de portada**: unidad de contenido de `/` con un propósito narrativo (apertura, bloque explicativo y ejemplo de tarjeta); tiene orden y jerarquía.
- **Paso de «cómo funciona»**: par título/texto que resume una etapa del juego; se muestra dentro del bloque explicativo.
- **CTA**: llamada a la acción que lleva a `/jugar`, visible sin scroll.
- **Ejemplo de tarjeta final**: representación de la tarjeta que obtendría un jugador al terminar una carrera.
- **Separador**: recurso tipográfico **decorativo** (ornamento sin texto nuevo) que sustituye al SVG de compás sobre el bloque explicativo y marca el ritmo entre secciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/` se sirve sin **ningún** kilobyte de JavaScript (0 scripts de cliente) y con todo el contenido presente en el HTML.
- **SC-002**: Un visitante nuevo ve el **CTA principal sin hacer scroll** en un móvil de 360×640.
- **SC-003**: La portada se percibe **más aireada** que la versión ajustada: la apertura arranca más abajo y los bloques quedan claramente separados, sin recortar contenido obligatorio. (Se descarta el criterio de «más corta»; revisión de 2026-10-04.)
- **SC-004**: El **100%** de los encabezados de sección, botones y tarjetas de la portada usan el mismo lenguaje visual que las pantallas del juego (revisión de diseño).
- **SC-005**: Los tres bloques de la portada comparten el mismo lenguaje visual y los dos primeros se perciben como una unidad (revisión de diseño); «qué es» y «cómo funciona» no aparecen como secciones ajenas.
- **SC-006**: La auditoría automática de accesibilidad (WCAG 2.2 AA) no reporta violaciones en `/`.
- **SC-007**: La página no provoca scroll horizontal en anchos de **320 px** en adelante.
- **SC-008**: El **100%** de los enlaces internos y externos de la portada funciona; ninguno devuelve error ni página inexistente.

## Assumptions

- **Alcance**: esta feature cubre exclusivamente la portada (`/`). `/como-jugar`, las páginas legales, el pie y la cabecera compartidos quedan fuera de alcance y se mantienen como están.
- **Sin pérdida de contenido**: la reorganización visual conserva los cuatro pasos de «cómo funciona» (con su subtítulo) y la explicación de qué es el juego.
- **Elemento decorativo sustituido**: el compás se retira de **los dos bloques** de la portada (explicativo y ejemplo) y se sustituye por el ornamento; se conserva en la **cabecera** y en el **pie de la tarjeta**.
- **Decisión cerrada afectada**: retirar el compás de la portada matiza la decisión registrada del «elemento firma» (feature 012); el cambio se registrará en `docs/registro/`.
- **Tema**: se parte del tema oscuro y de los tokens ya existentes; no se añaden dependencias ni archivos de imagen nuevos.
- **CTA**: la acción principal sigue siendo «Empezar a jugar» y apunta a `/jugar`; la portada no incorpora «continuar partida».
- **Continuidad**: el objetivo es que portada y pantallas del juego se perciban como la misma aplicación; **no** se rediseña el componente `Tarjeta`, solo se actualiza el **contenido** de las fixtures de ejemplo (portada y dev `campeon`).
- **Altura**: se da prioridad al **aire** sobre el acortado; la portada puede ser más alta que la versión ajustada (revisión de 2026-10-04).
