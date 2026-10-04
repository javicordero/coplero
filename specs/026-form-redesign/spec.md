# Feature Specification: Formulario del panel: secciones plegables y rediseño

**Feature Branch**: `026-form-redesign`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "además quiero hacer que modalidades, variantes, flags y consume (si aplica) estén por defecto como en un acordeón pero sin desplegar, para que el formulario no ocupe tanto de primeras. Además haz un rediseño completo del formulario para que sea más claro y bonito."

## Contexto

El panel local de contenido (`/panel`, solo desarrollo) tiene formularios de alta/edición para
situaciones y condicionales, con sus opciones. Con muchas opciones y filtros, el formulario se vuelve
muy largo y cuesta encontrar lo importante. Esta feature **no cambia qué se puede hacer**, solo cómo se
presenta:

1. Las secciones secundarias (**modalidades**, **variantes** y, dentro de cada opción, **flags** —y
   `consume`, si existiera) se muestran **plegadas por defecto**, en bloques tipo acordeón.
2. Se hace un **rediseño visual** del formulario para que sea más claro y agradable.

**Dependencia**: esta feature asume el estado del panel tras la **025** (que retira el `consume`
manual). Por eso la sección de `consume` no existirá salvo que ese campo se reintroduzca; se contempla
como "si aplica".

## Clarifications

### Session 2026-10-05

- Q: ¿Qué secciones pasan a plegarse y en qué formularios? → A: `modalidades` y `variantes` plegadas en situación y condicional; `flags` (y `consume` si existiera) plegadas dentro de cada opción; el resto (título, texto, peso, minAno, efectos) sigue visible.
- Q: ¿Las secciones plegadas se abren solas si ya tienen contenido? → A: No; siempre empiezan plegadas, con un indicador visual cuando tienen contenido.
- Q: ¿Hasta dónde llega el rediseño visual? → A: Solo el formulario de situación/condicional y sus opciones (no las tablas ni la vista de detalle).
- Q: ¿Qué dirección visual tiene el rediseño? → A: Identidad **nueva** solo en el formulario (paleta y tipografía más modernas), aunque no encaje con las tablas del panel.
- Q: ¿La identidad nueva usa tipografía del sistema o una web font? → A: **Fuentes del sistema** modernas (`system-ui` y similares), sin cargar ficheros nuevos.
- Q: El bloque **Efectos** (al marcar "excepción declarada") se veía con anchos distintos. ¿Cómo debe presentarse? → A: Como una **rejilla de celdas de ancho uniforme**, alineada con el resto del formulario.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Formulario compacto con secciones plegables (Priority: P1)

El diseñador abre el formulario y las secciones secundarias aparecen plegadas, de modo que de primeras
ocupa poco. Cuando necesita tocar modalidades, variantes o los flags de una opción, despliega esa
sección, la edita y puede volver a plegarla. Si una sección tiene contenido, se indica sin necesidad de
abrirla.

**Why this priority**: es lo que más reduce el alto del formulario y el ruido; aporta valor por sí solo
aunque no se rediseñe nada más.

**Independent Test**: abrir el formulario, comprobar que modalidades/variantes (y flags en la opción)
están plegadas, desplegarlas, editarlas y comprobar que se guardan con normalidad.

**Acceptance Scenarios**:

1. **Given** el formulario de una situación o condicional, **When** se abre, **Then** las secciones de modalidades y variantes están plegadas por defecto.
2. **Given** una opción dentro del formulario, **When** se muestra, **Then** su sección de flags está plegada por defecto.
3. **Given** una sección plegada, **When** el diseñador la despliega, **Then** puede editar su contenido y volver a plegarla.
4. **Given** una sección plegada que contiene algún valor marcado, **When** se muestra, **Then** se indica visualmente que tiene contenido, sin desplegarla.
5. **Given** una sección plegada, **When** el diseñador guarda, **Then** se guardan igualmente los valores que contuviera.

---

### User Story 2 - Rediseño del formulario (Priority: P2)

El formulario de situación/condicional y sus opciones se rediseña para que sea más claro y agradable:
mejor jerarquía, espaciado, tipografía y color, secciones bien delimitadas y los bloques plegables
integrados con naturalidad.

**Why this priority**: mejora la experiencia diaria, pero no cambia lo que se puede hacer; por eso va
después de las secciones plegables.

**Independent Test**: abrir el formulario y comprobar que se lee con claridad, que las secciones se
distinguen y que en móvil no hay desbordes ni controles inaccesibles.

**Acceptance Scenarios**:

1. **Given** el formulario, **When** se abre, **Then** los campos y secciones se distinguen con claridad (jerarquía, espaciado y contraste).
2. **Given** el formulario en una pantalla estrecha (móvil), **When** se muestra, **Then** no hay desbordes horizontales y los controles siguen siendo usables.
3. **Given** el formulario rediseñado, **When** se recorre con teclado, **Then** las secciones plegables se pueden abrir y cerrar y los campos se alcanzan en orden lógico.

---

### Edge Cases

- **Sección plegable con mucho contenido** (p. ej. muchos flags disponibles): al desplegarla debe seguir siendo usable y no desbordar.
- **Formulario con muchas opciones**: el plegado por defecto debe mantenerlo manejable y no perder el estado de cada opción al añadir o quitar opciones.
- **Sección plegada con contenido oculto**: el indicador debe dejar claro que hay valores marcados para que no se pasen por alto al guardar.
- **`consume` inexistente** (estado tras la 025): no se muestra ninguna sección de consumo; el plegado se aplica solo a las secciones que existen.
- **Teclado**: plegar/desplegar y navegar entre campos debe funcionar sin ratón.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: En los formularios de situación y condicional, las secciones de **modalidades** y **variantes** MUST aparecer plegadas por defecto.
- **FR-002**: En cada opción, la sección de **flags** (y **consume**, si existiera) MUST aparecer plegada por defecto.
- **FR-003**: Toda sección plegable MUST poder desplegarse y volverse a plegar.
- **FR-004**: Una sección plegable que contenga algún valor marcado MUST indicarlo visualmente sin necesidad de desplegarla.
- **FR-005**: Las secciones plegables MUST empezar siempre plegadas (no se abren solas por tener contenido).
- **FR-006**: Las secciones plegables MUST ser accesibles por teclado y exponer su estado (plegado/desplegado) de forma comprensible para lectores de pantalla.
- **FR-007**: El rediseño visual MUST limitarse al formulario de situación/condicional y sus opciones; MUST NOT rediseñar las tablas ni la vista de detalle.
- **FR-008**: El formulario rediseñado MUST ser mobile-first y no producir desbordes horizontales en pantallas estrechas.
- **FR-009**: El rediseño MUST ser solo de presentación: MUST NOT cambiar el modelo de contenido ni el comportamiento del panel (validación, guardado, carga).
- **FR-010**: El rediseño MUST NOT introducir dependencias nuevas.
- **FR-011**: Plegar una sección MUST NOT alterar ni descartar los valores que contenga; al guardar se conservan.
- **FR-012**: El formulario MUST tener una **identidad visual propia** (paleta y tipografía nuevas), distinta de las tablas y del resto del panel, ceñida al formulario.
- **FR-013**: La tipografía del formulario MUST resolverse con **fuentes del sistema** (sin cargar ficheros de fuente nuevos).
- **FR-014**: El bloque de **efectos** (visible al marcar "excepción declarada") MUST presentar sus campos con **anchos uniformes**, alineados con el resto del formulario.
- **FR-015**: El bloque de efectos MUST incluir una **explicación breve** de qué son y qué escribir en los campos (delta por atributo; vacío = sin cambio; solo las excepciones declaradas mueven atributos).

### Key Entities

No introduce entidades nuevas: trabaja sobre las existentes (situación, condicional, opción y sus
campos de modalidades, variantes y flags).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las secciones listadas (modalidades, variantes y flags) aparecen plegadas al abrir el formulario.
- **SC-002**: El formulario completo se puede recorrer, plegar/desplegar y guardar usando solo el teclado.
- **SC-003**: El formulario no produce desbordes horizontales a 360 px de ancho.
- **SC-004**: La suite de tests del panel sigue pasando tras el cambio (sin regresiones).

## Assumptions

- Esta feature **depende de la 025**: se implementa después, cuando el `consume` manual ya no existe.
- Es un cambio **solo de presentación**: no toca el motor, ni el modelo de contenido, ni la validación.
- Se mantiene el enfoque mobile-first y sin dependencias nuevas del resto del proyecto.
- La accesibilidad se limita a lo razonable para una herramienta local: teclado y estado comprensible; no se persigue una certificación WCAG completa.
