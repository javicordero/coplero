# Feature Specification: Rediseño integral del panel de contenido

**Feature Branch**: `027-panel-redesign`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "podemos preparar una especificación para pasar este diseño visual a todo el panel y reconfigurar completamente el diseño del panel"

## Contexto

El panel local de contenido (`/panel`, solo desarrollo) tiene hoy **dos lenguajes visuales**: los
formularios de situación/condicional se rediseñaron con una identidad propia (feature 026), pero la
**carcasa** (cabecera, navegación, mensajes), las **tablas** y las **vistas de detalle** siguen con el
estilo antiguo. El resultado es un panel incoherente.

Esta feature **extiende la identidad visual al panel completo** y **reconfigura su diseño** para que sea
coherente, claro y agradable de usar. Es un cambio **solo de presentación**: no cambia qué se puede
hacer ni cómo se guardan los datos.

## Clarifications

### Session 2026-10-05

- Q: ¿El rediseño del panel incluye modo oscuro? → A: **No**; una sola identidad clara (sin toggle ni tema del sistema).
- Q: ¿Cómo se adaptan las tablas en móvil? → A: **Scroll horizontal dentro de un contenedor propio de la tabla** (sin que desborde la página).
- Q: ¿El rediseño incluye el encabezado y el resto de la carcasa, con foco en móvil? → A: **Sí**; en móvil la cabecera se **apila** (título + contador, y acciones y conmutador a ancho completo) y en escritorio vuelve a una fila.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidad visual unificada en todo el panel (Priority: P1)

Todas las vistas del panel (cabecera, navegación, tablas, detalle y formularios) comparten la misma
identidad: misma paleta, misma tipografía, mismo espaciado y mismos estados (foco, hover). El panel
deja de parecer dos herramientas distintas.

**Why this priority**: es el objetivo central; sin coherencia visual, el resto no se percibe como un
rediseño.

**Independent Test**: recorrer las vistas del panel (listados de situaciones y condicionales, detalle y
formulario) y comprobar que todas usan la misma paleta, tipografía y estilos de control.

**Acceptance Scenarios**:

1. **Given** el panel, **When** se abre cualquier vista (listado, detalle o formulario), **Then** todas comparten la misma identidad visual.
2. **Given** la identidad, **When** se define en un único sitio, **Then** los componentes la consumen sin duplicar valores (un cambio de color se propaga a todas las vistas).
3. **Given** una vista cualquiera, **When** se interactúa con sus controles, **Then** los estados de foco y hover son consistentes con el resto.

---

### User Story 2 - Estructura del panel reconfigurada (Priority: P1)

La carcasa del panel se reorganiza para que sea más clara: cabecera con título y acciones, conmutador
de vista (situaciones/condicionales) y estados de carga/error/vacío legibles. El panel se lee de un
vistazo y las acciones principales quedan a mano.

**Why this priority**: es la "reconfiguración completa" pedida; mejora la orientación y el uso diario.

**Independent Test**: abrir el panel y comprobar que la cabecera, el conmutador de vista y las acciones
se distinguen con claridad, y que los estados de carga, error y vacío se entienden.

**Acceptance Scenarios**:

1. **Given** el panel cargado, **When** se muestra, **Then** cabecera, conmutador de vista y acción principal se distinguen con claridad.
2. **Given** el panel sin datos, **When** se muestra, **Then** el estado vacío invita a importar el banco.
3. **Given** un error de carga, **When** ocurre, **Then** se muestra un mensaje legible con la misma identidad.

---

### User Story 3 - Listados y detalle rediseñados (Priority: P2)

Las tablas de situaciones/condicionales y las vistas de detalle se rediseñan con la identidad común:
filas legibles, jerarquía clara y, en móvil, sin desbordes (las tablas se adaptan a pantallas
estrechas).

**Why this priority**: son las vistas más usadas tras el formulario; completan la coherencia.

**Independent Test**: abrir un listado y un detalle, comprobar la legibilidad y que en móvil no hay
desbordes horizontales.

**Acceptance Scenarios**:

1. **Given** un listado con muchas filas, **When** se muestra, **Then** se lee con claridad (jerarquía, contraste, espaciado).
2. **Given** un listado en pantalla estrecha, **When** se muestra, **Then** no hay desbordes horizontales y se puede consultar.
3. **Given** una vista de detalle, **When** se abre, **Then** usa la identidad común y su jerarquía es clara.

---

### Edge Cases

- **Tablas en móvil**: con muchas columnas, el listado se consulta con **scroll horizontal dentro de su propio contenedor**, sin que la página desborde.
- **Nombres/ids largos**: títulos o identificadores largos no deben romper la maquetación.
- **Estados de carga/error/vacío**: deben existir y verse bien en todas las vistas.
- **Sin datos**: el panel vacío invita a importar el banco.
- **El juego no se toca**: `/jugar` y las páginas públicas no cambian (siguen con 0 kB de JS y su diseño propio).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todas las vistas del panel (cabecera, navegación, listados, detalle y formularios) MUST compartir una **identidad visual única** (paleta, tipografía, espaciado y estados).
- **FR-002**: La identidad MUST definirse en **un único lugar** y ser consumida por los componentes, sin duplicar valores por vista.
- **FR-003**: La **carcasa** del panel (cabecera, conmutador de vista, acciones y mensajes) MUST rediseñarse con la identidad común; en móvil la cabecera MUST **apilarse** (título y contador, y acciones y conmutador a ancho completo) y en escritorio MUST volver a una fila.
- **FR-004**: Las **tablas** de situaciones y condicionales MUST rediseñarse con la identidad común y ser consultables en móvil mediante **scroll horizontal dentro de un contenedor propio**, sin desbordar la página.
- **FR-005**: Las **vistas de detalle** de situación y condicional MUST rediseñarse con la identidad común.
- **FR-006**: El panel MUST ser mobile-first y no producir desbordes horizontales en pantallas estrechas (360 px).
- **FR-007**: Los estados de **carga, error y vacío** MUST mostrarse con la identidad común y ser legibles.
- **FR-008**: El panel MUST seguir siendo navegable por teclado, con foco visible y orden lógico.
- **FR-009**: El rediseño MUST ser **solo de presentación**: MUST NOT cambiar el comportamiento del panel (carga, validación, guardado, importación).
- **FR-010**: El rediseño MUST NOT introducir dependencias nuevas ni cargar ficheros de fuente (fuentes del sistema).
- **FR-011**: El rediseño MUST limitarse al **panel**; MUST NOT afectar al juego (`/jugar`) ni a las páginas públicas.
- **FR-012**: La **primera columna** de las tablas MUST permanecer visible (fija) al hacer scroll horizontal.
- **FR-013**: El encabezado del formulario MUST mostrar el botón de volver **arriba, solo con el icono y alineado a la izquierda**, y el **título debajo**.

### Key Entities

No introduce entidades nuevas. Trabaja sobre las existentes (situación, condicional, opción) y sobre
las vistas del panel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las vistas del panel (listados, detalle y formularios) usan la misma identidad visual (misma paleta y tipografía).
- **SC-002**: El panel no produce desbordes horizontales a 360 px de ancho.
- **SC-003**: El panel completo se puede recorrer y usar con el teclado, con foco visible.
- **SC-004**: Un cambio de un valor de identidad (p. ej. el color principal) se refleja en todas las vistas sin tocar cada componente por separado.
- **SC-005**: La suite de tests existente sigue pasando (sin regresiones).

## Assumptions

- **Solo el panel**: el juego (`/jugar`) y las páginas públicas quedan fuera de alcance y no cambian.
- **Sin modo oscuro** en esta versión: una sola identidad clara.
- **Sin dependencias nuevas** ni ficheros de fuente; tipografía del sistema (coherente con la 026).
- **Densidad cómoda**: se prioriza la legibilidad frente a la máxima compacidad.
- La identidad se **extrae** del formulario ya rediseñado (026) para reutilizarla en todo el panel; el
  lugar técnico donde vive (un módulo de estilos compartido) se decide en el plan.
- La accesibilidad se limita a lo razonable para una herramienta local: teclado, foco y contraste.
