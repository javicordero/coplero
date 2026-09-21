# Feature Specification: Diseño visual (identidad, juego y compartir)

**Feature Branch**: `012-visual-design`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "FASE 30 — Diseño visual. No cambies arquitectura ni modelo de juego. A partir de ahora puedes trabajar sobre: tipografía, colores, layout, responsive, animaciones, microinteracciones, estados y accesibilidad. Mantén mobile-first. El juego debe sentirse como una experiencia de Carnaval de Cádiz, pero evita convertirlo en una parodia visual recargada. Prioriza: legibilidad, velocidad, personalidad, sensación de juego y facilidad de compartir."

> **Nota**: la feature es una **capa de diseño** sobre lo ya construido. No se tocan motor, contenido, datos ni rutas; no se añaden dependencias de animación. Se documenta aparte si se instala la skill externa de revisión (Apple HIG) como lente de auditoría.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leer y jugar con comodidad y rapidez (Priority: P1)

Cualquier persona abre Coplero desde el móvil y lo lee sin esfuerzo: textos claros, buen contraste, tamaños cómodos, nada que obligue a hacer zoom ni a desplazarse en horizontal, y la página carga igual de rápido que antes.

**Why this priority**: sin legibilidad no hay juego. Es la base sobre la que se apoya todo lo demás y no puede comprometer la velocidad.

**Independent Test**: abrir las pantallas principales en un móvil pequeño (320–390 px) y comprobar que todo el texto se lee cómodamente, sin scroll horizontal y sin que aumente el peso de la página.

**Acceptance Scenarios**:

1. **Given** una pantalla de móvil estrecha, **When** se recorre cualquier pantalla, **Then** no hay scroll horizontal y el texto se lee sin zoom.
2. **Given** cualquier texto sobre fondo, **When** se mide su contraste, **Then** cumple el mínimo de accesibilidad.
3. **Given** la portada y las páginas estáticas, **When** se cargan, **Then** siguen sin ejecutar JavaScript.

---

### User Story 2 - Sentir personalidad y que es un juego (Priority: P2)

La persona que juega nota que esto es Carnaval de Cádiz y que está jugando: una identidad propia (color, tipografía, ritmo, un elemento reconocible), respuestas claras al tocar y transiciones que acompañan sin retrasar.

**Why this priority**: es lo que diferencia Coplero de un formulario. Depende de que la base sea legible y rápida.

**Independent Test**: recorrer el flujo de una partida y comprobar que hay identidad reconocible, que cada acción tiene respuesta visual inmediata y que las transiciones duran poco y se pueden desactivar.

**Acceptance Scenarios**:

1. **Given** el flujo de juego, **When** se interactúa con botones y opciones, **Then** hay una respuesta visual clara (hover, pulsado, deshabilitado, foco).
2. **Given** un cambio de pantalla, **When** ocurre, **Then** la transición es breve y no bloquea.
3. **Given** alguien con reducción de movimiento activada, **When** usa el juego, **Then** las animaciones se reducen o desaparecen.
4. **Given** la identidad visual, **When** se compara con un formulario genérico, **Then** se reconoce un carácter carnavalesco propio sin resultar recargado.

---

### User Story 3 - Compartir con orgullo (Priority: P3)

Cuando la persona termina su carrera, la tarjeta final y la página compartida se ven cuidadas, legibles y listas para lucir en redes, con las acciones de compartir claras.

**Why this priority**: compartir es la mitad del producto; el resultado debe estar a la altura, pero depende de la identidad y la legibilidad ya resueltas.

**Independent Test**: generar una tarjeta final y su enlace, y comprobar que se ve bien en vertical y cuadrada, y que los botones de compartir son claros.

**Acceptance Scenarios**:

1. **Given** una tarjeta final, **When** se muestra en móvil, **Then** se lee entera y con jerarquía clara.
2. **Given** las acciones de compartir, **When** se muestran, **Then** son claras y accesibles.
3. **Given** la imagen que acompaña al enlace, **When** se comparte, **Then** mantiene la identidad visual del juego.

---

### Edge Cases

- **Personas mayores o poca vista**: el aumento de tamaño del texto (zoom 200%) no debe romper el layout.
- **Reducción de movimiento**: las animaciones no deben ser imprescindibles para entender la pantalla.
- **Fuentes que no cargan**: debe verse correctamente con la fuente de reserva del sistema.
- **Pantallas muy pequeñas (320 px)** y muy grandes (escritorio): sin scroll horizontal ni líneas de texto demasiado largas.
- **Contraste en el elemento firma**: los adornos con personalidad no pueden incumplir contraste.
- **Rendimiento**: la identidad no puede añadir peso relevante (fuentes pesadas, fondos grandes, librerías).

## Requirements *(mandatory)*

### Functional Requirements

**Sistema de diseño**

- **FR-001**: MUST existir un **sistema de diseño único** (colores, tipografía, espaciado, radios, sombras y tiempos) definido como tokens y usado por todo el sitio, sin valores sueltos repetidos.
- **FR-002**: El sistema MUST documentar el **elemento firma** que da personalidad (un detalle reconocible, no un adorno recargado).

**Legibilidad y tipografía**

- **FR-003**: La tipografía MUST ser **legible** (tamaño base cómodo, interlineado holgado y longitud de línea contenida) y con **personalidad propia**.
- **FR-004**: Las fuentes MUST ser **libres y autoalojadas** (o la fuente del sistema), con **fuente de reserva** y sin bloquear el texto mientras cargan.
- **FR-005**: El texto MUST escalar bien con el aumento de tamaño del navegador sin romper el layout.

**Color y contraste**

- **FR-006**: La paleta MUST cumplir **contraste mínimo AA** en todo el texto y en los controles, y no depender solo del color para transmitir información.
- **FR-007**: Debe quedar claro qué significa cada color (momento de verano / febrero, éxito, aviso, error) y ser coherente en todo el sitio.

**Layout y responsive**

- **FR-008**: MUST mantenerse **mobile-first**, sin scroll horizontal desde 320 px, con la misma estructura en móvil y escritorio.
- **FR-009**: Las áreas interactivas MUST ser cómodas al tacto (objetivos táctiles amplios) y la jerarquía visual clara en cada pantalla.

**Movimiento y microinteracciones**

- **FR-010**: Las animaciones y transiciones MUST ser **breves** (no bloqueantes) y MUST respetar la preferencia de **reducción de movimiento**.
- **FR-011**: Cada acción interactiva MUST tener respuesta visual en sus estados: reposo, hover, pulsado, deshabilitado y foco.

**Estados**

- **FR-012**: Todas las pantallas con datos MUST cubrir **carga, vacío, error y éxito**, con mensajes claros y sin dejar la pantalla muda.

**Compartir y resultado**

- **FR-013**: La **tarjeta final** MUST mantener una jerarquía clara y leerse bien en formato vertical (9:16) y cuadrado (1:1).
- **FR-014**: Las acciones de compartir MUST ser claras y accesibles, y la **imagen para enlaces** MUST mantener la identidad visual.

**Rendimiento y accesibilidad**

- **FR-015**: La capa de diseño MUST NOT degradar el rendimiento: la portada y las páginas estáticas MUST seguir sin JavaScript y el juego MUST NOT añadir librerías de animación.
- **FR-016**: MUST cumplirse **WCAG 2.2 AA** (contraste, foco visible, operación por teclado, texto escalable).

### Key Entities

- **Token de diseño**: valor reutilizable (color, tipografía, espaciado, radio, sombra, tiempo).
- **Elemento firma**: detalle visual que identifica a Coplero sin recargar.
- **Estado de interfaz**: reposo, hover, pulsado, deshabilitado, foco, carga, vacío, error, éxito.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El **100%** de los textos y controles cumple contraste AA.
- **SC-002**: **0** pantallas con scroll horizontal entre 320 px y escritorio.
- **SC-003**: El **100%** de los controles interactivos tiene objetivo táctil cómodo (≥ 44×44 px).
- **SC-004**: Las páginas estáticas siguen con **0 kB de JavaScript** y el paquete del juego **no añade dependencias**.
- **SC-005**: Ninguna transición supera **300 ms** y todas se desactivan con reducción de movimiento activada.
- **SC-006**: La auditoría automática de accesibilidad (WCAG 2.2 AA) no reporta violaciones.
- **SC-007**: En móvil, el texto de cuerpo tiene tamaño cómodo y la línea no supera ~75 caracteres en escritorio.
- **SC-008**: La tarjeta final se lee entera y con jerarquía clara en los formatos 9:16 y 1:1.

## Assumptions

- **Sin cambios estructurales**: no se tocan motor, contenido, datos, rutas ni lógica; es una capa de presentación.
- **Un solo tema**: se mantiene el tema oscuro actual; el modo claro/oscuro automático queda fuera de esta fase (`docs/05` §9).
- **Sin dependencias nuevas**: nada de librerías de animación ni frameworks de UI; CSS propio.
- **Tipografía libre**: la fuente con personalidad debe ser de licencia libre y autoalojada, con reserva del sistema.
- **Auditoría de diseño**: se usan las skills locales `frontend-design` y `accessibility`; la skill externa de revisión basada en las HIG de Apple se valora como **lente de auditoría** (accesibilidad y craft), nunca como dirección de arte, porque está orientada a apps nativas y su estética por defecto choca con la personalidad carnavalesca y el rendimiento exigido.
- **Fuera de alcance**: modo claro, nuevos assets gráficos pesados, ilustraciones o texturas de fondo, y cualquier cambio de UX que altere flujos.
