# Feature Specification: Modo dev y rediseño de la pantalla de resultado del año

**Feature Branch**: `021-year-result-screen`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Ahora necesito estilar la pantalla de resultado del año. El flujo es decision verano, decision febrero, resultado. Esa pantalla esta muy simple ahora mismo, sólo con las lineas de cuaderno. Empieza por crear un modo dev como el de la pantalla final pero para esta pantalla y luego nos metemos a desarrollarla y a estilarla. Lo primero que cambiariamos seria el titulo que ahora muestta año 1 febrero y deberia ser año 1 resultado"

## Contexto

El bucle jugable encadena cada año **decisión de verano → decisión de febrero → resultado del año**. Hoy la pantalla de resultado es una hoja sobria («acta») sobre líneas de cuaderno, con el membrete, la fase alcanzada, el puesto, los premios del año y el botón «Continuar». Antes de rediseñarla hace falta una forma rápida de verla y recorrer sus variantes sin jugar un año completo: el mismo tipo de **modo dev** que ya existe para la pantalla final (`/jugar?dev=fin`).

Además, el indicador de contexto permanente de esa pantalla muestra hoy «Año N · Febrero»; debe pasar a mostrar «Año N · Resultado», ya que el resultado no es un momento de juego (verano/febrero) sino el cierre del año.

## Clarifications

### Session 2026-10-04

- Q: ¿Qué lenguaje visual debe adoptar la pantalla de resultado? → A: **Hoja clara refinada** (opción B): se conserva el tratamiento claro tipo acta, pulido y sin líneas de cuaderno. *(Dirección sustituida por la decisión de estilo de creación registrada más abajo.)*
- Q: ¿Cómo debe construirse el modo dev de resultado? → A: **Instantánea aislada** (opción A): un resultado de ejemplo escrito a mano más el año, sin partida real; «Continuar» queda inerte en dev.
- Q: ¿Qué elementos de las pantallas de creación adopta la pantalla de resultado? → A: **Solo el panel** (opción B): se conserva la estructura actual (fase, puesto y premios) **sin cabecera centrada**, pero el contenido va en un panel con superficie, borde y sombra, con etiquetas en mayúsculas, sobre el **tema oscuro** por defecto.
- Q: ¿Cómo se presentan las distinciones (roseta y texto) del año? → A: Todas en **una única fila**, en **orden fijo** (aguja de oro, candela y espino y coplas por Andalucía al final); cada distinción con la **roseta encima y el nombre debajo**, en texto sutil **del color de su roseta** (aguja en dorado, coplas en verde, candela en rojo), **sin card**. No puede haber dos del mismo tipo en el mismo año, pero sí dos tipos distintos.
- Q: ¿Dónde se coloca el botón «Continuar»? → A: **Dentro del panel**, al final, como en las pantallas de creación. *(Se prueba así; queda anotado revisar más adelante la variante **fuera del panel**.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir la pantalla de resultado directamente en desarrollo (Priority: P1)

Quien desarrolla necesita ver la pantalla de resultado del año sin jugar las dos decisiones previas. Con un enlace directo de desarrollo abre la pantalla ya montada con datos de ejemplo y puede alternar entre los distintos desenlaces del año (con premio, sin premio, fuera de concurso, distintas fases y puestos) para iterar sobre el diseño.

**Why this priority**: es el habilitador de todo el rediseño; sin esta entrada rápida cada iteración exige jugar un año completo.

**Independent Test**: en desarrollo, abrir el enlace directo de la pantalla de resultado y comprobar, para cada caso disponible, que la pantalla se muestra con esos datos; comprobar que en un build de producción la entrada directa no existe.

**Acceptance Scenarios**:

1. **Given** el entorno de desarrollo, **When** se abre el enlace directo de resultado sin indicar caso, **Then** se muestra la pantalla de resultado con el caso por defecto, sin recorrer ninguna decisión.
2. **Given** el enlace directo con un caso concreto, **When** se abre, **Then** la pantalla muestra exactamente ese desenlace (fase, puesto, premios y estado de concurso).
3. **Given** la lista de casos de ejemplo, **When** se recorre, **Then** cubre al menos: año con premio del COAC, año con distinciones, año sin premios, año fuera de concurso y varios puestos/fases.
4. **Given** un build de producción, **When** se abre el juego, **Then** la entrada directa no está disponible y el flujo normal no cambia.

---

### User Story 2 - El indicador dice «Resultado», no «Febrero» (Priority: P1)

En la pantalla de resultado, el indicador de contexto permanente muestra «Año N · Resultado» en lugar de «Año N · Febrero». En las pantallas de decisión el indicador sigue mostrando «Verano» o «Febrero».

**Why this priority**: es el primer cambio concreto pedido y afecta a la lectura del contexto en el punto más sensible del bucle.

**Independent Test**: abrir el resultado del año y comprobar que el indicador dice «Año N · Resultado»; abrir una decisión y comprobar que conserva «Verano»/«Febrero».

**Acceptance Scenarios**:

1. **Given** la pantalla de resultado del año, **When** se muestra el indicador, **Then** reza «Año N · Resultado» y nunca «Febrero».
2. **Given** una pantalla de decisión de verano o de febrero, **When** se muestra su indicador, **Then** sigue rezándose «Verano» o «Febrero».
3. **Given** un año cualquiera de la carrera, **When** llega el resultado, **Then** el año mostrado corresponde al año en curso.

---

### User Story 3 - Pantalla de resultado con el estilo de Coplero (Priority: P2)

La pantalla de resultado deja de ser una hoja con líneas de cuaderno y adopta el estilo de las pantallas de creación: un panel con superficie, borde y sombra sobre el tema oscuro, con etiquetas en mayúsculas, presentando con claridad lo que ha pasado ese año y manteniendo la acción de continuar.

**Why this priority**: es el objetivo de fondo, pero se aborda con el modo dev ya disponible y con la dirección visual de **panel de creación** ya decidida.

**Independent Test**: recorrer el resultado del año en cada caso de ejemplo y comprobar que la información se lee con claridad, que el aspecto encaja con el resto de Coplero y que «Continuar» avanza el año.

**Acceptance Scenarios**:

1. **Given** la pantalla de resultado de cualquier caso, **When** se muestra, **Then** presenta la información del año (fase alcanzada, puesto si lo hay, premios del año o su ausencia y el caso de fuera de concurso) con el estilo del juego.
2. **Given** la pantalla de resultado, **When** se compara con el resto de Coplero, **Then** conserva el lenguaje de las pantallas de creación (panel con superficie/borde/sombra, etiquetas en mayúsculas, tema oscuro), sin las líneas de cuaderno.
3. **Given** la pantalla de resultado, **When** se pulsa «Continuar», **Then** el juego avanza al año siguiente como hoy.

---

### Edge Cases

- **Sin premios ese año**: la pantalla lo comunica sin listas vacías ni ceros.
- **Año fuera de concurso**: se distingue claramente del año con concurso; puede darse junto con años previos.
- **Sin puesto registrado**: la pantalla no muestra un puesto vacío.
- **Varios premios en un mismo año**: se muestran todos en **una fila** (como máximo tres tipos distintos) sin desbordar ni provocar scroll horizontal.
- **Caso dev desconocido**: se cae al caso por defecto sin romper.
- **Sin partida guardada en dev**: la pantalla se muestra igualmente; «Continuar» queda inerte y no debe corromper ni reutilizar una partida real guardada.
- **Nombres de premio largos**: se ajustan sin desbordar.
- **320 px de ancho**: sin scroll horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir abrir la pantalla de resultado directamente en desarrollo mediante un enlace con parámetro, en paralelo al modo dev ya existente para la pantalla final.
- **FR-002**: El modo dev de resultado MUST aceptar un selector de caso y MUST ofrecer casos que cubran, como mínimo: premio del COAC, distinciones, sin premios, fuera de concurso y varios puestos y fases.
- **FR-003**: El modo dev de resultado MUST NOT ser accesible ni incluirse en el build de producción, y MUST NOT alterar el flujo normal del juego.
- **FR-004**: Los datos de ejemplo del modo dev MUST NOT modificar el motor, el contenido ni las partidas guardadas.
- **FR-005**: En la pantalla de resultado, el indicador de contexto MUST mostrar el año y la etiqueta **«Resultado»** (p. ej. «Año 1 · Resultado»); MUST NOT mostrar «Febrero».
- **FR-006**: En las pantallas de decisión, el indicador MUST seguir mostrando «Verano» o «Febrero» según el momento.
- **FR-007**: La pantalla de resultado MUST seguir presentando el desenlace del año: fase alcanzada, puesto cuando exista, los premios de ese año (o la ausencia de premios) y el caso de fuera de concurso.
- **FR-008**: La pantalla de resultado MUST conservar la acción «Continuar» que avanza al año siguiente, colocada **dentro del panel**, al final, como en las pantallas de creación.
- **FR-009**: La pantalla de resultado MUST adoptar el lenguaje de las pantallas de creación: el contenido MUST ir en un **panel** con superficie, borde y sombra sobre el **tema oscuro** por defecto, con las etiquetas en mayúsculas; MUST NOT incluir cabecera centrada ni conservar las líneas de cuaderno. Criterios concretos: el **puesto** es el elemento protagonista (mayor peso) por encima de la fase; los premios (o su ausencia) se leen sin ambigüedad.
- **FR-010**: La pantalla MUST ser mobile-first, MUST NOT provocar scroll horizontal desde 320 px y MUST cumplir WCAG 2.2 AA (contraste, estructura semántica y foco operable).
- **FR-011**: El rediseño MUST ser solo de presentación: MUST NOT cambiar reglas del motor ni el banco de contenido.
- **FR-012**: El modo dev de resultado MUST funcionar como **instantánea aislada** (resultado de ejemplo más el año) sin partida real; en modo dev, la acción «Continuar» MUST quedar inerte y MUST NOT reutilizar ni corromper una partida guardada.
- **FR-013**: La pantalla de resultado MUST mostrar las distinciones del año en una **única fila**, en **orden fijo**: aguja de oro, candela y espino y coplas por Andalucía (siempre la última). Cada una con la **roseta encima y el nombre debajo** en texto sutil **del color de su roseta** (aguja en dorado, coplas en verde, candela en rojo), **sin card ni recuadro**, reutilizando las rosetas de la pantalla final; MUST NOT listarlas solo como texto sin roseta. Como máximo hay una distinción de cada tipo por año.

### Key Entities *(include if feature involves data)*

- **Resultado del año**: desenlace de una temporada. Atributos: año, fase alcanzada, puesto (opcional), premios del año y si se concursó o no.
- **Distinción**: premio ajeno al COAC (Aguja de oro, Coplas por Andalucía, Candela y espino) ganado en el año, con su **roseta**; como máximo una por tipo y año.
- **Indicador de contexto**: etiqueta permanente que combina el año en curso y el tipo de pantalla/momento («Verano», «Febrero», «Resultado»).
- **Caso de desarrollo**: conjunto de datos de ejemplo que representa un desenlace del año, seleccionable desde el enlace directo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un desarrollador llega a la pantalla de resultado, ya montada, con un **único enlace** y sin jugar ninguna decisión.
- **SC-002**: El **100%** de los casos de ejemplo previstos (premio del COAC, distinciones, sin premios, fuera de concurso y varios puestos/fases) es visible desde el modo dev.
- **SC-003**: En producción, **0** formas de invocar el modo dev quedan accesibles y **0** comportamientos del flujo normal cambian.
- **SC-004**: En la pantalla de resultado, el **100%** de los indicadores dice «Resultado» y **0** dice «Febrero»; en las decisiones, el **100%** conserva «Verano»/«Febrero».
- **SC-005**: **0** problemas de scroll horizontal a 320 px y **0** violaciones graves de accesibilidad (WCAG 2.2 AA).
- **SC-006**: La acción «Continuar» funciona en el **100%** de los casos en el flujo real.

## Assumptions

- **Nombre del parámetro dev**: se usa `dev=resultado`, en paralelo a `dev=fin`.
- **Dirección visual**: decidida el **panel de las pantallas de creación** (superficie, borde y sombra, etiquetas en mayúsculas) sobre el **tema oscuro** por defecto, sin cabecera centrada; se retira la hoja clara de acta.
- **Contenido intacto**: la pantalla sigue mostrando el resultado que produce el motor; no se añaden ni quitan datos.
- **Botón «Continuar»**: se coloca **dentro del panel** en esta iteración; la variante **fuera del panel** queda anotada para revisarla más adelante.
- **Alcance**: la pantalla final y la tarjeta compartida quedan fuera; solo se toca el resultado del año.
- **Una sola isla**: el modo dev vive dentro de la isla de juego existente y no añade dependencias ni rutas nuevas.
- **Compatibilidad de guardado**: el modo dev no debe dejar una partida guardada que rompa la pantalla de reanudación.
