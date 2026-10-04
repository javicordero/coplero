# Feature Specification: Mejoras de usabilidad del formulario de situaciones

**Feature Branch**: `024-form-ux-improvements`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Quiero modificar el formulario de crear situaciones. El id no lo quiero meter a mano, que se cree automáticamente juntando las palabras del título por ejemplo. El checkbox de unica vez deberia estar marcado por defecto, las situaciones deben salir solo una vez por partida, a menos que se puedan repetir. Entonces quizas en vez de unica vez debemos poner un checkbox de repetible y desmarcado. En las opciones el id se crea igual que en la situación, juntando las palabras del titulo. Este input de texto consume (flags, por comas) deberia ser un multiselect con todas las flags que tenemos."

## Contexto

El panel local de contenido (`/panel`, solo desarrollo) permite crear y editar las situaciones del
banco. Hoy el formulario obliga a escribir a mano identificadores que podrían derivarse del título,
el control de repetición está invertido respecto al uso real, y las flags se escriben como texto
libre propenso a errores (comas, espacios, erratas). Además, los condicionales no se pueden editar
desde el panel. Esta feature mejora la **experiencia de edición** del panel y amplía su cobertura a
los condicionales; no cambia el modelo de datos ni el comportamiento del juego.

## Clarifications

### Session 2026-10-05

- Q: ¿El identificador derivado del título debe ser editable manualmente o de solo lectura? → A: Derivado y editable: se rellena solo al escribir el título y el diseñador puede ajustarlo a mano.
- Q: ¿La casilla "repetible" debe renombrar el campo de datos o ser solo etiqueta de interfaz? → A: Solo etiqueta de interfaz: el dato subyacente se mantiene como hoy; no hay migración de datos.
- Q: ¿El selector múltiple de flags aplica solo a "consume" o también al campo de flags que la opción deja? → A: Ambos: tanto "consume" como "flags" (las que la opción deja) pasan a selector múltiple.
- Q: ¿La mejora del formulario cubre solo las situaciones o también los condicionales? → A: Situaciones y condicionales: el formulario también permite editar condicionales con sus campos propios (requisito, ventana, probabilidad).
- Q: Ante un identificador derivado que ya existe, ¿el sistema propone uno alternativo o solo avisa? → A: Propone automáticamente un identificador alternativo (con sufijo) y avisa.
- Q: Con los selectores de flags cerrados, ¿cómo se introduce una flag nueva? → A: El selector de `flags` (lo que la opción deja) permite **crear una flag nueva** además de elegir las existentes; el selector de `consume` solo ofrece flags ya existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificadores automáticos a partir del título (Priority: P1)

Al crear una situación o una de sus opciones, el diseñador escribe el título y el sistema genera
solo el identificador, en formato corto y legible (minúsculas, sin acentos, palabras unidas), en
lugar de teclearlo a mano. El control deja de ser un campo que hay que rellenar y pasa a ser un
valor derivado del título que el diseñador puede revisar y ajustar manualmente.

**Why this priority**: es el punto que más fricción y más errores evita; sin esto el resto de mejoras
aporta menos.

**Independent Test**: abrir el formulario, escribir un título de situación con acentos y espacios y
comprobar que el identificador de la situación se rellena solo; repetir en una opción y comprobar que
su identificador también se genera del título.

**Acceptance Scenarios**:

1. **Given** una situación nueva sin identificador, **When** el diseñador escribe "Te dejan fuera por un punto" en el título, **Then** el identificador propuesto es del estilo `te_dejan_fuera_por_un_punto`.
2. **Given** un título con acentos, mayúsculas o signos ("¿Vas a ir al Falla?"), **When** se genera el identificador, **Then** este no contiene acentos ni signos y está en minúsculas.
3. **Given** una opción de una situación, **When** el diseñador escribe su título, **Then** el identificador de la opción se genera con la misma regla a partir de ese título.
4. **Given** un identificador generado, **When** el diseñador quiere corregirlo, **Then** puede editar el identificador manualmente antes de guardar.

---

### User Story 2 - Repetición clara y por defecto segura (Priority: P1)

El diseñador crea situaciones que, por defecto, aparecen una sola vez por partida; solo las marca como
repetibles cuando el diseño lo requiere. El control refleja esa intención de forma directa: una casilla
de "repetible" que por defecto está desmarcada, en lugar de una casilla de "única vez" que hay que
recordar marcar.

**Why this priority**: invertir el valor por defecto elimina un error silencioso muy común (olvidar
marcar "única vez") que hace que situaciones pensadas para salir una vez reaparezcan.

**Independent Test**: crear una situación sin tocar la casilla de repetición y comprobar que se guarda
como no repetible; marcarla y comprobar que se guarda como repetible.

**Acceptance Scenarios**:

1. **Given** una situación nueva, **When** el formulario se abre, **Then** la casilla "repetible" está desmarcada.
2. **Given** una situación con la casilla "repetible" desmarcada, **When** se guarda, **Then** la situación aparece una sola vez por partida.
3. **Given** una situación con la casilla "repetible" marcada, **When** se guarda, **Then** la situación puede volver a aparecer.
4. **Given** una situación existente que se edita, **When** se abre el formulario, **Then** la casilla refleja si esa situación es repetible o no.

---

### User Story 3 - Selección de flags sin texto libre (Priority: P2)

Al elegir qué flags deja o consume una opción, el diseñador selecciona de una lista de todas las flags
existentes en el banco (y, en las flags que la opción **deja**, puede crear una nueva) en lugar de
escribirlas a mano separadas por comas. El resultado sigue permitiendo más de una flag a la vez, tanto
para las flags que la opción deja como para las que consume.

**Why this priority**: evita erratas y flags inexistentes, pero es secundario frente a las dos
mejoras anteriores.

**Independent Test**: abrir una opción, abrir los selectores de flags (dejar y consumir) y comprobar
que aparecen todas las flags del banco y que se pueden marcar varias en cada uno.

**Acceptance Scenarios**:

1. **Given** una opción, **When** el diseñador abre los controles de flags, **Then** ve la lista de flags existentes en el banco tanto para las que deja como para las que consume.
2. **Given** una lista de flags, **When** el diseñador marca varias, **Then** la opción guarda exactamente esas flags en el campo correspondiente.
3. **Given** una opción que ya dejaba o consumía flags, **When** se abre el formulario, **Then** esas flags aparecen marcadas en su selector.
4. **Given** que el banco no tiene ninguna flag declarada, **When** se abre el formulario, **Then** el control lo indica de forma legible y no bloquea el guardado.
5. **Given** una opción, **When** el diseñador escribe una flag nueva en el selector de flags (dejar), **Then** queda añadida y disponible para el resto del formulario.

---

### User Story 4 - Edición de condicionales con las mismas mejoras (Priority: P2)

Además de las situaciones, el diseñador puede editar los **condicionales** desde el panel
(las situaciones que solo entran en la baraja si su flag está activa), con sus campos propios
(requisito, ventana de años, probabilidad y si consume la flag). Los condicionales se benefician
de las mismas mejoras: identificador derivado del título, marca de repetición clara y selectores de
flags en sus opciones.

**Why this priority**: completa el banco editable, pero las situaciones cubren ya el grueso del trabajo
diario; los condicionales son un volumen menor.

**Independent Test**: abrir la lista de condicionales en el panel, crear uno rellenando sus campos
propios y comprobar que se guarda validado como los demás.

**Acceptance Scenarios**:

1. **Given** el panel, **When** el diseñador consulta el banco, **Then** puede ver y distinguir situaciones y condicionales.
2. **Given** un condicional nuevo, **When** el diseñador rellena título, requisito, ventana y probabilidad, **Then** se guarda validado.
3. **Given** un condicional, **When** se edita, **Then** sus opciones usan los mismos selectores de flags y la misma regla de identificador que las situaciones.
4. **Given** un condicional con datos inválidos (p. ej. probabilidad fuera de rango o requisito mal formado), **When** se intenta guardar, **Then** se rechaza con un mensaje legible.

---

### Edge Cases

- **Título vacío o sin caracteres válidos**: si el título aún no se ha escrito (o solo tiene signos), no se puede derivar ningún identificador; el campo queda sin valor y el formulario no debe inventar uno silenciosamente.
- **Identificador ya en uso**: si el identificador derivado del título coincide con el de otra situación (o de otra opción), el sistema propone automáticamente uno alternativo (con sufijo) y avisa; si aun así el guardado no es válido, falla con un mensaje legible.
- **Títulos muy largos o repetidos**: varios títulos distintos pueden producir el mismo identificador; se aplica la misma regla de desambiguación automática.
- **Edición de una situación existente**: cambiar el título no debe cambiar en silencio un identificador ya usado (referencias existentes dependen de él).
- **Flags con nombres de cualquier longitud**: la selección debe funcionar con listas grandes sin perder legibilidad.
- **Nueva flag inexistente**: el selector de **flags** (lo que la opción deja) permite **crear una flag nueva** además de elegir las existentes, porque dejar una huella es el origen de toda flag; el selector de **consume** solo ofrece flags ya existentes (no tiene sentido consumir una que no existe).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al crear una situación, el identificador MUST derivarse automáticamente del título (minúsculas, sin acentos ni signos, palabras unidas por guion bajo), sin que el diseñador tenga que teclearlo.
- **FR-002**: El identificador derivado MUST mostrarse al diseñador antes de guardar y MUST poder ajustarse manualmente: el sistema lo rellena a partir del título y el diseñador puede corregirlo.
- **FR-003**: Al crear una opción, su identificador MUST derivarse del título de la opción con la misma regla que el de la situación, y también MUST poder ajustarse manualmente.
- **FR-004**: La derivación de identificadores MUST aplicarse también a situaciones nuevas creadas desde cualquier entrada del panel que use el formulario.
- **FR-005**: El formulario MUST NOT permitir guardar una situación u opción sin identificador; si el título no permite derivarlo, el guardado MUST impedirse con un mensaje legible.
- **FR-006**: Al editar una situación existente, su identificador MUST permanecer invariable aunque cambie el título.
- **FR-007**: El formulario MUST exponer la repetición de una situación como una casilla **"repetible"** que, por defecto, está **desmarcada**.
- **FR-008**: Una situación con la casilla "repetible" desmarcada MUST comportarse como una situación que aparece **una sola vez por partida**.
- **FR-009**: Una situación con la casilla "repetible" marcada MUST comportarse como una situación que puede volver a aparecer.
- **FR-010**: Al editar una situación existente, la casilla "repetible" MUST reflejar el estado real de esa situación.
- **FR-011**: Los controles de flags de una opción MUST ser selectores múltiples: `flags` (flags que deja) MUST ofrecer las flags existentes y permitir **crear una flag nueva**; `consume` (flags que consume) MUST ofrecer solo flags existentes. Ninguno MUST requerir que se escriban a mano separadas por comas.
- **FR-012**: Cada selector de flags MUST permitir seleccionar cero, una o varias flags y guardar exactamente lo seleccionado.
- **FR-013**: Los selectores de flags MUST mostrar como seleccionadas las flags que la opción ya tenía al abrir el formulario.
- **FR-014**: Los cambios de esta feature MUST limitarse a la experiencia de edición del panel; el modelo de contenido validado y el comportamiento del motor MUST mantenerse equivalentes.
- **FR-015**: Los campos de texto libre de flags de la opción (`consume` y `flags`) MUST dejar de existir en el formulario.
- **FR-016**: El campo de datos que expresa la repetición MUST mantenerse como hoy; la casilla "repetible" es una etiqueta de interfaz y NO requiere migración de datos ni cambio de esquema.
- **FR-017**: El panel MUST permitir consultar y editar también los **condicionales**, distinguiéndolos de las situaciones.
- **FR-018**: La edición de un condicional MUST incluir sus campos propios: el requisito, la ventana de años, la probabilidad y si consume la flag.
- **FR-019**: Los condicionales MUST recibir las mismas mejoras de esta feature: identificador derivado del título, marca de repetición y selectores de flags en sus opciones.
- **FR-020**: Un condicional con datos inválidos (p. ej. probabilidad fuera de rango o requisito mal formado) MUST rechazarse al guardar con un mensaje legible.
- **FR-021**: Si el identificador derivado ya está en uso, el sistema MUST proponer automáticamente un identificador alternativo (por ejemplo, añadiendo un sufijo numérico) y avisar de que lo ha hecho, en lugar de limitarse a bloquear el guardado.
- **FR-022**: Al crear una flag nueva desde el selector de `flags`, el sistema MUST añadirla al catálogo de flags disponibles para el resto del formulario y MUST NOT permitir duplicarla si ya existe.

### Key Entities *(include if feature involves data)*

- **Situación**: decisión del banco con identificador derivado del título, y una marca de repetición (repetible / una sola vez).
- **Condicional**: situación que solo entra en la baraja bajo un requisito de flag y dentro de una ventana de años, con una probabilidad de disparo; se edita con los mismos controles que una situación más sus campos propios.
- **Opción**: alternativa de una situación o condicional, con identificador derivado de su título y un conjunto de flags que deja (`flags`) y otro de flags que consume (`consume`), ambos elegidos de la lista de flags existentes.
- **Flag**: huella del historial que una opción puede dejar o consumir; la lista de flags existentes es el origen de los selectores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las situaciones nuevas creadas desde el formulario obtienen un identificador sin que el diseñador lo teclee.
- **SC-002**: El 100% de las situaciones nuevas se guardan como "una sola vez por partida" salvo que el diseñador marque explícitamente "repetible".
- **SC-003**: El 100% de las opciones nuevas obtienen su identificador a partir del título de la opción.
- **SC-004**: Ninguna opción guardada desde el formulario contiene flags (dejadas o consumidas) que no existan en el banco.
- **SC-005**: Crear una situación completa (con sus opciones) requiere teclear cero identificadores y cero listas de flags separadas por comas.
- **SC-006**: El 100% de los condicionales creados o editados desde el panel se guardan validados o se rechazan con un mensaje legible; ninguno se persiste con datos inválidos.
- **SC-007**: El 100% de las colisiones de identificador derivado se resuelven con una propuesta automática, sin requerir que el diseñador la edite a mano.

## Assumptions

- El panel es una herramienta local de desarrollo (feature 009) y un único usuario (el diseñador); no hay requisitos de permisos ni de concurrencia.
- El campo de datos que expresa la no-repetición se mantiene internamente como hoy y no se renombra: la casilla "repetible" es una etiqueta de interfaz que invierte su presentación. No hay migración del **modelo de contenido** ni cambio del esquema Zod de `content`; el almacén del panel sí sube de versión (v1→v2) al incorporar condicionales, según el plan.
- La regla de derivación de identificadores produce texto corto y legible (minúsculas, sin acentos, palabras separadas por guion bajo), como los identificadores existentes del banco (`v_ruptura_grupo`, `tema_social`).
- El identificador de una situación/opción sigue siendo **inmutable al editar una situación ya guardada** (ya es una regla actual del panel); la derivación y el ajuste manual aplican al momento de la creación.
- La derivación automática rellena el identificador mientras el diseñador no lo haya tocado a mano; una vez ajustado manualmente, no se sobrescribe en silencio.
- La lista de flags existentes se obtiene del propio banco (las flags que declaran las opciones), que ya se calcula para el informe de integridad.
- La edición de condicionales se apoya en el mismo modelo de datos que ya existe; no se inventan campos nuevos ni se cambia su esquema de validación.
