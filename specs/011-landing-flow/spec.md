# Feature Specification: Reordenar la landing, cabecera/pie persistentes y páginas nuevas

**Feature Branch**: `011-landing-flow`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Quiero cambiar la landing: (1) que la cabecera y el pie se mantengan en la página de jugar, no que desaparezcan; (2) que el bloque de «qué es Coplero» aparezca donde después se va a jugar: se ve Coplero — crea tu personaje — empezar a jugar — qué es Coplero, y al pulsar «Empezar a jugar» aparece el juego; (3) fusionar «qué es Coplero» y «cómo funciona»; (4) quitar la sección «elige tu modalidad»; (5) quitar las preguntas frecuentes; (6) quitar la última sección «¿hasta dónde llega tu carrera?»; (7) el pie no se ve igual que el de acordesgaditanos: tiene otra estructura, hazlo igual."

## Clarifications

### Session 2026-09-21

- Q: ¿Qué páginas llevan cabecera y pie? → A: **todas**, incluida la tarjeta compartida `/r/[codigo]`.
- Q: ¿Qué contiene la cabecera? → A: solo la marca «Coplero» (enlace a la portada), que **cambia según el sexo elegido** para el personaje.
- Q: ¿La cabecera es fija o se va con el scroll? → A: **estática** (se va con el scroll).
- Q: ¿El pie replica también el contenido de acordesgaditanos? → A: misma estructura y mismas secciones; de momento se **reutilizan sus redes** (Coplero aún no tiene propias).
- Q: ¿Qué ve el usuario al llegar a jugar? → A: la **pantalla de inicio del juego tal cual**, dentro del marco con cabecera y pie.
- Q: ¿El bloque «qué es / cómo funciona» aparece en la página de jugar? → A: **no**, solo en la portada.
- Q: ¿Ancho de la página de jugar? → A: **todo a 680 px** en escritorio, priorizando que se vea lo mejor posible en móvil.
- Q: ¿El contenido retirado de la portada se borra o se guarda? → A: se **elimina** de la portada; se podrá reutilizar más adelante.
- Q: ¿Páginas legales? → A: **crear** privacidad y cookies con texto mínimo ajustado a la realidad del juego.
- Q: ¿Entra `/como-jugar`? → A: **sí**: reglas del juego + la **FAQ retirada**.
- Q: ¿Qué cambia en la cabecera con el sexo del personaje? (FR-006) → A: la marca pasa a **«Coplero» (masculino)**, **«Coplera» (femenino)** o **«Coplere» (no binario)**; antes de elegirlo se muestra «Coplero».
- Q: ¿El juego va a 680 px? (FR-017) → A: **no**: el **marco** (cabecera, pie y fondo) es común a 680 px y el **bucle jugable** conserva su columna de **420–480 px** centrada. No se toca la constitución.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empezar a jugar con la web alrededor (Priority: P1)

Un visitante abre la portada, entiende qué es Coplero y pulsa «Empezar a jugar». Cambia a la página de jugar y **no nota que ha cambiado de web**: la cabecera, el pie, el fondo y el ancho siguen igual, y ahí está el juego.

**Why this priority**: es el cambio que más afecta a la experiencia; hoy el juego se sirve sin cabecera ni pie y sin contexto.

**Independent Test**: pulsar «Empezar a jugar» desde la portada y comprobar que se puede jugar y que cabecera y pie siguen visibles e idénticos.

**Acceptance Scenarios**:

1. **Given** la portada, **When** el visitante pulsa «Empezar a jugar», **Then** accede a jugar con la misma cabecera, el mismo pie, el mismo fondo y el mismo ancho.
2. **Given** cualquier página del sitio, **When** se carga, **Then** muestra cabecera y pie.
3. **Given** la cabecera, **When** se pulsa la marca, **Then** se vuelve a la portada.

---

### User Story 2 - Portada más corta y directa (Priority: P2)

El visitante ve una portada breve: el bloque de Coplero con «crea tu personaje», el botón de empezar y la explicación fusionada con «cómo funciona». Sin modalidades, FAQ ni cierre.

**Why this priority**: la portada actual tiene secciones que el diseñador ya no quiere; acortarla reduce fricción.

**Independent Test**: recorrer la portada y comprobar que existen el bloque de Coplero y la sección fusionada, y que **no** aparecen modalidades, FAQ ni cierre.

**Acceptance Scenarios**:

1. **Given** la portada, **When** se recorre, **Then** se ve Coplero, la invitación a crear tu personaje, el botón «Empezar a jugar» y la sección fusionada de «qué es» + «cómo funciona».
2. **Given** la portada, **When** se busca «elige tu modalidad», la FAQ o el cierre, **Then** no existen esas secciones.

---

### User Story 3 - Consultar las reglas y el pie del sitio (Priority: P3)

El visitante puede entrar en «Cómo jugar» para leer las reglas y las preguntas frecuentes, y encuentra abajo un pie con la misma estructura que el de acordesgaditanos, con los avisos legales enlazados.

**Why this priority**: da soporte (reglas + FAQ) y cumplimiento legal, pero no bloquea la conversión.

**Independent Test**: abrir `/como-jugar` y comprobar que tiene reglas y FAQ; abrir el pie y comprobar los 4 bloques y que privacidad y cookies funcionan.

**Acceptance Scenarios**:

1. **Given** `/como-jugar`, **When** se abre, **Then** muestra las reglas del juego y la FAQ.
2. **Given** el pie, **When** se llega abajo, **Then** aparecen redes, autor, enlaces legales y copyright, en ese orden.
3. **Given** los enlaces de privacidad y cookies, **When** se pulsan, **Then** abren sus páginas (sin 404).

---

### Edge Cases

- **Sin JavaScript** en portada, `/como-jugar` y legales: el contenido y los enlaces deben verse igualmente.
- **Páginas legales**: deben existir antes de enlazarlas (FR-018).
- **Móvil estrecho (< 320 px)**: cabecera y pie no deben provocar scroll horizontal.
- **Jugar con partida a medias**: la cabecera y el pie no deben tapar ni desplazar los controles del juego.
- **Tarjeta compartida `/r/[codigo]`**: al añadirle cabecera y pie no debe romperse el póster ni su lectura en un enlace de WhatsApp.

## Requirements *(mandatory)*

### Functional Requirements

**Cabecera y pie persistentes**

- **FR-001**: MUST existir una **cabecera** de sitio (marca «Coplero», enlace a la portada) presente en **todas** las páginas.
- **FR-002**: MUST existir un **pie** de sitio presente en **todas** las páginas, **incluida la tarjeta compartida `/r/[codigo]`**.
- **FR-003**: La cabecera y el pie MUST permanecer visibles al jugar; MUST NOT dejarse la pantalla de juego desnuda.
- **FR-004**: Cabecera y pie MUST ser componentes reutilizables por el resto de páginas.
- **FR-005**: La cabecera MUST ser **estática** (se desplaza con el contenido; no fija).
- **FR-006**: La marca de la cabecera MUST reflejar el sexo elegido para el personaje: **«Coplero»** (masculino), **«Coplera»** (femenino) o **«Coplere»** (no binario). Antes de elegirlo MUST mostrarse «Coplero».
- **FR-007**: De momento NO habrá redes propias de Coplero: el pie MUST reutilizar las de acordesgaditanos.

**Portada**

- **FR-008**: La portada MUST mostrar arriba el bloque: «Coplero» + invitación a crear tu personaje + botón «Empezar a jugar» + «qué es Coplero».
- **FR-009**: «Qué es Coplero» y «cómo funciona» MUST quedar **fusionados** en una sola sección.
- **FR-010**: La portada MUST NOT incluir la sección «Elige tu modalidad».
- **FR-011**: La portada MUST NOT incluir la sección de preguntas frecuentes (se traslada a `/como-jugar`).
- **FR-012**: La portada MUST NOT incluir la sección final «¿Hasta dónde llega tu carrera?».
- **FR-013**: Al pulsar «Empezar a jugar» MUST **navegarse a la página de jugar**, conservando la misma **cabecera, el mismo pie y el mismo fondo**, para que el usuario perciba continuidad. La portada MUST seguir siendo **estática (0 kB de JS)**. El ancho del **marco** no cambia; la columna del juego puede ser más estrecha (ver FR-017).
- **FR-014**: La portada MUST seguir siendo indexable (título, descripción, canonical) y con la referencia a acordesgaditanos.

**Página de jugar**

- **FR-015**: La página de jugar MUST mostrar la **pantalla de inicio del juego** tal cual, dentro del marco con cabecera y pie.
- **FR-016**: La página de jugar MUST NOT repetir el bloque «qué es / cómo funciona».
- **FR-017**: Todas las páginas MUST compartir el mismo **marco** (cabecera, pie y fondo) con un ancho de **680 px** en escritorio y ancho completo en móvil. El **bucle jugable** MUST mantener su columna de **420–480 px centrada** dentro de ese marco (la constitución no cambia).

**Páginas nuevas**

- **FR-018**: MUST crearse `/como-jugar` con las **reglas del juego** y la **FAQ** retirada de la portada.
- **FR-019**: MUST crearse `/politicas/politica-de-privacidad` y `/politicas/politica-de-cookies`, con texto mínimo ajustado a la realidad (sin analítica ni cookies de terceros; `localStorage` como funcionalidad esencial).

**Pie**

- **FR-020**: El pie MUST replicar la **estructura** del de acordesgaditanos: (1) redes sociales, (2) autor con sus perfiles, (3) enlaces legales, (4) copyright.
- **FR-021**: El pie MUST incluir el aviso legal con los enlaces de privacidad y cookies, y esas páginas MUST existir.
- **FR-022**: Los enlaces de icono MUST tener nombre accesible; los externos MUST abrirse de forma segura en pestaña nueva.
- **FR-023**: El pie MUST identificar que Coplero es del mismo autor de acordesgaditanos.

**Calidad**

- **FR-024**: Todas las páginas MUST pasar **WCAG 2.2 AA**.
- **FR-025**: La transición entre la portada y el juego MUST NOT provocar saltos perceptibles en **fondo, cabecera, pie o scroll** (el ancho del marco se mantiene; la columna del juego es más estrecha por FR-017).

### Key Entities

- **Cabecera de sitio**: barra superior con la marca y enlace a la portada; la marca cambia con el sexo del personaje.
- **Pie de sitio**: bloques de redes, autor, legal y copyright.
- **Página de juego**: la pantalla de inicio del juego más el marco del sitio.
- **Página «cómo jugar»**: reglas y FAQ.
- **Páginas legales**: privacidad y cookies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La cabecera y el pie están visibles en el **100%** de las páginas (portada, juego, cómo jugar, legales y tarjeta compartida).
- **SC-002**: La portada contiene el bloque de Coplero y la sección fusionada y **0** secciones de modalidades, FAQ o cierre.
- **SC-003**: El pie presenta los **4 bloques** en el mismo orden que acordesgaditanos.
- **SC-004**: **Ningún** enlace del sitio devuelve error (0 enlaces rotos).
- **SC-005**: La portada y el juego pasan **WCAG 2.2 AA** sin violaciones graves.
- **SC-006**: Ni la cabecera ni el pie provocan scroll horizontal desde 320 px.
- **SC-007**: La transición de portada a juego conserva **el mismo fondo, cabecera y pie** (comprobable en el DOM y por captura); la valoración de "no parece otra web" se deja como aceptación manual.
- **SC-008**: `/como-jugar` responde al menos las **5** preguntas de la FAQ retirada.

## Assumptions

- **Alcance**: reordenación de la portada, cabecera/pie persistentes en todas las páginas, y creación de `/como-jugar` y las dos páginas legales.
- **Contenido retirado**: modalidades y cierre se eliminan de la portada; la FAQ pasa a `/como-jugar`.
- **Pie**: misma estructura que acordesgaditanos; contenido de redes reutilizado (Coplero no tiene cuentas propias todavía).
- **Continuidad percibida (decidido 2026-09-21)**: aunque haya navegación interna, el objetivo es que el usuario **no note** el cambio.
- **Cabecera dinámica**: la marca pasa a «Coplero» / «Coplera» / «Coplere» según el sexo del personaje (FR-006); antes de elegirlo se muestra «Coplero».
- **Marco y constitución**: el marco del sitio (cabecera, pie y fondo) es de 680 px; el bucle jugable conserva su columna de 420–480 px, por lo que el Principio IV queda **intacto**.
