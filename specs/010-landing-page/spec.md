# Feature Specification: Landing estática

**Feature Branch**: `010-landing-page`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "FASE 29 — Landing. La ruta `/` con hero, explicación, CTA, cómo funciona, modalidades, ejemplo de tarjeta, FAQ y footer (tomando como referencia la estructura del footer de acordesgaditanos). En algún sitio de la página se debe referenciar acordesgaditanos para que se sepa que es el mismo creador. La landing debe seguir siendo principalmente estática: `/` y `/como-jugar` a 0 kB de JS; `/jugar` es la isla; `/r/[codigo]` es el resultado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender el juego y empezar a jugar (Priority: P1)

Un visitante que abre el enlace (normalmente desde el móvil y desde WhatsApp) llega a `/`, entiende en segundos qué es Coplero, para quién es y qué tiene que hacer, y encuentra un botón claro para empezar a jugar sin registrarse ni instalar nada.

**Why this priority**: es la puerta de entrada del producto y el primer paso de la conversión. Sin hero + explicación + CTA no hay juego.

**Independent Test**: abrir `/` en móvil y comprobar que, sin hacer scroll y sin JavaScript, se ve el nombre, una frase que explica el juego y un CTA que lleva a `/jugar`.

**Acceptance Scenarios**:

1. **Given** un visitante nuevo, **When** abre `/`, **Then** ve el nombre "Coplero", una frase que explica qué es y un CTA principal hacia `/jugar`.
2. **Given** la página cargada, **When** pulsa el CTA principal, **Then** llega a `/jugar`.
3. **Given** un visitante con conocimiento cero del COAC, **When** lee la explicación y "cómo funciona", **Then** entiende que crea un personaje, elige modalidad y toma decisiones de verano y febrero hasta una tarjeta final.

---

### User Story 2 - Ver cómo funciona, las modalidades y una tarjeta de ejemplo (Priority: P2)

El visitante curioso quiere saber en qué consiste jugar antes de empezar: cómo se avanza, qué diferencia hay entre ser comparsista o chirigotero, y cómo es el resultado que podrá compartir.

**Why this priority**: reduce el abandono de quien no conoce el Carnaval y hace tangible la recompensa (la tarjeta), pero no bloquea el "empezar a jugar".

**Independent Test**: recorrer `/` y comprobar que existen las secciones "cómo funciona", "modalidades" (comparsista y chirigotero) y un ejemplo de tarjeta final, todo visible sin JavaScript.

**Acceptance Scenarios**:

1. **Given** `/` cargada, **When** se recorre, **Then** hay una sección "cómo funciona" con los pasos del juego en orden.
2. **Given** la sección de modalidades, **When** se lee, **Then** se explican las dos modalidades (comparsista y chirigotero) y en qué deciden.
3. **Given** la sección de ejemplo, **When** se ve, **Then** se muestra una tarjeta final de ejemplo (póster) tal como la obtendría un jugador.

---

### User Story 3 - Resolver dudas y reconocer al autor (Priority: P3)

El visitante que duda (¿es gratis?, ¿me registro?, ¿cuánto dura?, ¿de dónde salen las situaciones?, ¿quién lo ha hecho?) encuentra respuestas en una FAQ y, en el pie, las redes, al autor y el enlace a acordesgaditanos para confirmar que es el mismo creador.

**Why this priority**: genera confianza, mejora el SEO y prepara el terreno legal (privacidad/cookies), pero es prescindible para la primera conversión.

**Independent Test**: comprobar que la FAQ responde al menos cinco dudas y que el pie incluye redes, autor, copyright y enlace a acordesgaditanos.

**Acceptance Scenarios**:

1. **Given** `/`, **When** se abre la FAQ, **Then** hay al menos cinco preguntas con su respuesta, legibles sin JavaScript.
2. **Given** el pie, **When** se lee, **Then** muestra el autor, sus redes sociales, un enlace a acordesgaditanos y el aviso de copyright.
3. **Given** el enlace a acordesgaditanos, **When** se pulsa, **Then** abre el sitio en una pestaña nueva.

---

### Edge Cases

- **JavaScript desactivado**: la página debe verse y funcionar igual (todo el contenido es HTML/CSS).
- **Enlaces a páginas que aún no existen** (privacidad/cookies): el pie no debe contener enlaces rotos.
- **Pantallas muy estrechas (< 320 px)**: el hero y las tablas/secciones no deben desbordar ni provocar scroll horizontal.
- **Textos largos** (títulos de modalidad, preguntas): no deben romper el layout.
- **Lectores de pantalla**: los enlaces que solo muestran un icono deben tener nombre accesible.
- **Sin conexión a las redes externas**: los enlaces del pie simplemente no cargan su destino; la página no depende de ellas.

## Requirements *(mandatory)*

### Functional Requirements

**Estructura y contenido de la landing**

- **FR-001**: `/` MUST servirse como HTML estático con **0 kB de JavaScript**: sin islas, sin scripts y sin dependencias que añadan JS al cliente.
- **FR-002**: `/` MUST mostrar un **hero** con el nombre "Coplero", una frase corta que explique qué es y un **CTA principal** que lleve a `/jugar`.
- **FR-003**: `/` MUST incluir una sección de **explicación** del juego: qué es, para quién y qué se logra (construir una historia propia que acaba en una tarjeta que se puede compartir).
- **FR-004**: `/` MUST incluir una sección **"cómo funciona"** con los pasos del juego (crear personaje → elegir modalidad y variante → decidir en verano y febrero → recibir la tarjeta final).
- **FR-005**: `/` MUST incluir una sección de **modalidades** que explique las dos modalidades (comparsista y chirigotero) y aquello en lo que deciden.
- **FR-006**: `/` MUST incluir un **ejemplo de tarjeta final** que muestre el resultado típico de una partida.
- **FR-007**: `/` MUST incluir una **FAQ** con al menos cinco preguntas frecuentes y sus respuestas.
- **FR-008**: `/` MUST mencionar y **enlazar a acordesgaditanos** como proyecto del mismo autor, de forma visible.

**Pie de página**

- **FR-009**: `/` MUST incluir un **pie de página** que siga la estructura del de acordesgaditanos: bloque de redes sociales, bloque de autor, enlaces legales y aviso de copyright.
- **FR-010**: El pie MUST mostrar el nombre del autor y enlaces a sus perfiles (LinkedIn y GitHub).
- **FR-011**: Los enlaces externos del pie MUST abrirse en pestaña nueva de forma segura.
- **FR-012**: Los **enlaces a las redes sociales** MUST mostrarse como iconos con nombre accesible, sin recurrir a texto visible.
- **FR-013**: El pie MUST ser un **componente reutilizable** por el resto de páginas estáticas del sitio.
- **FR-014**: El pie MUST NOT contener **enlaces rotos**: los enlaces legales (privacidad/cookies) solo se mostrarán cuando esas páginas existan.

**CTA y navegación**

- **FR-015**: Todas las llamadas a la acción de la landing MUST llevar a `/jugar`.
- **FR-016**: El CTA principal MUST ser visible sin hacer scroll en una pantalla de móvil habitual.

**Presentación, SEO y accesibilidad**

- **FR-017**: La landing MUST ser **mobile-first real**: en móvil ocupa el ancho completo con padding lateral; en escritorio, el contenido se centra con un **ancho máximo de 680 px**. (El rango 420–480 px es del **bucle jugable**, no de la landing.)
- **FR-018**: `/` MUST ser **indexable** por buscadores (título, descripción, canonical; sin `noindex`).
- **FR-019**: `/` MUST cumplir **WCAG 2.2 AA**: jerarquía de encabezados coherente, contraste suficiente, foco visible, texto alternativo en imágenes y nombres accesibles en enlaces de icono.
- **FR-020**: `/` MUST incluir metadatos para compartir (Open Graph/Twitter) con título, descripción e imagen del juego.
- **FR-021**: Todo el texto visible de la landing MUST estar en **español**.

### Key Entities

- **Sección de la landing**: bloque de contenido de `/` con un propósito narrativo (hero, explicación, cómo funciona, modalidades, ejemplo, FAQ, pie); tiene orden y jerarquía.
- **Pregunta frecuente**: par pregunta/respuesta de la FAQ.
- **Enlace social**: perfil externo mostrado en el pie (icono, nombre accesible y destino).
- **Referencia al autor**: mención/enlace a acordesgaditanos y datos del autor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/` se sirve sin **ningún** kilobyte de JavaScript (0 scripts de cliente) y con todo el contenido presente en el HTML.
- **SC-002**: Un visitante nuevo ve el **CTA principal sin hacer scroll** en un móvil de 360×640.
- **SC-003**: El **100%** de los enlaces de la página (CTA, FAQ, pie, autor) funciona: ninguno devuelve error ni página inexistente.
- **SC-004**: La FAQ responde al menos **5** dudas frecuentes (gratuidad, registro, duración, origen de las situaciones, autoría).
- **SC-005**: El pie muestra redes, autor, copyright y la referencia a acordesgaditanos en el **100%** de las cargas.
- **SC-006**: La auditoría automática de accesibilidad (WCAG 2.2 AA) no reporta violaciones en `/`.
- **SC-007**: La página no provoca scroll horizontal en anchos de **320 px** en adelante.

## Assumptions

- **Alcance**: esta feature cubre la landing (`/`) y el **pie de página compartido**. La página `/como-jugar` y las páginas legales (privacidad/cookies) quedan **fuera de alcance** (se harán después y podrán reutilizar el pie).
- **Sin dependencias nuevas**: los iconos sociales se resuelven como SVG en línea (el footer de acordesgaditanos usa `astro-icon`, que aquí se evita para no añadir dependencias ni JS).
- **Redes sociales**: hasta que Coplero tenga cuentas propias, se reutilizan las de acordesgaditanos (decisión registrada en `docs/05` §3), que es además prueba de la misma autoría.
- **Ejemplo de tarjeta**: se renderiza con el **componente real** (`Tarjeta.svelte`) en build, que produce HTML/CSS estático —sin isla ni JS de cliente—; no se usa el endpoint dinámico de imagen para mostrarla.
- **Enlaces legales**: no existen todavía las páginas de privacidad/cookies, así que el pie no las enlaza hasta que existan (FR-014).
- **Tema y tono**: se parte del tema oscuro y del tono carnavalesco ya usados en el proyecto; el modo claro/oscuro automático queda para más adelante (`docs/05` §9).
- **Relación con acordesgaditanos**: se enlaza en la explicación y en el pie; el enlace inverso (banner en acordesgaditanos) es responsabilidad del otro proyecto.
- **Fuera de alcance**: analítica, AdSense, Buy Me a Coffee y buzón de sugerencias (fases posteriores).
