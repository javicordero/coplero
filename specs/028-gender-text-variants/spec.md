# Feature Specification: Textos de situación adaptados al género del personaje

**Feature Branch**: `028-gender-text-variants`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Quiero añadir una cosa para las situaciones. Si el jugador ha escogido genero femenino debemos poner las situaciones y las opciones en femenino. Por ello, la mejor opción creo que es poner un campo opcional en las situaciones y opciones en los que podamos poner el texto si el jugador es genero femenino. Podria cambiar tanto el titulo como el subtítulo. Este campo puede ser opcional, si está vacio se coge la opción por defecto. Si el campo está relleno pero el jugador es masculino o no binario se coge la opción por defecto. Si el jugador es femenino y el campo está relleno, se coge la opcion del texto femenino. Habría que añadirlo en el juego, dentro del propio motor y en el panel de creación para poder crear las situaciones teniendo en cuenta esto. Si el jugador escoge genero no binario se puede escoger cualquiera de los 2 textos, el masculino o el femenino. Pero no hablo de que salga siemprr masculino o femenino por defecto si es no binario. Hablo de que en algunos casos salga el masculino y en otros el femenino"

## Contexto

Hoy las situaciones y sus opciones se escriben en una forma por defecto que, en la práctica, se lee
en masculino. Un jugador que elige género **femenino** debería ver esos textos en femenino cuando el
contenido lo ofrezca.

La solución pedida es un campo **opcional** por cada texto: si está relleno y el personaje es
femenino, se usa; si está vacío, se usa el texto por defecto. Para género **no binario**, el texto
mostrado puede ser cualquiera de los dos: en unos casos el por defecto y en otros el femenino, nunca
fijado siempre al mismo.

La feature abarca tres frentes: **(1) el contenido** (guardar el texto femenino de cada campo),
**(2) el juego** (decidir qué texto mostrar según el género) y **(3) el panel de contenido**
(poder escribir ese texto).

> Nota de ambigüedad detectada en el enunciado: primero dice que, con género no binario y campo
> relleno, "se coge la opción por defecto"; después aclara que el no binario "puede escoger
> cualquiera de los 2 textos", alternando. Se toma como válida la aclaración posterior (el no binario
> no se fija siempre al texto por defecto). El mecanismo concreto se resolvió en la clarificación.

## Clarifications

### Session 2026-10-07

- Q: ¿Qué decide, para un personaje no binario, entre la forma por defecto y la femenina? → A: **Azar determinista sembrado** (reproducible: misma semilla, mismas decisiones y mismo género producen siempre el mismo texto).
- Q: ¿En qué nivel se elige la forma para un personaje no binario? → A: **Por cada campo de texto, de forma independiente** (título y texto de la situación; título y subtítulo de cada opción). Se acepta que una misma decisión mezcle formas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - El jugador femenino lee en femenino (Priority: P1)

Un jugador crea un personaje de género femenino. Durante la carrera, cuando una situación tiene
escrita la variante femenina, el título y el texto de la situación y los títulos y subtítulos de sus
opciones se muestran en femenino. Cuando esa variante no está escrita, se muestra la forma por
defecto sin que la partida se rompa.

**Why this priority**: es el caso que motiva la feature y el que más se percibe al jugar.

**Independent Test**: jugar con un personaje femenino sobre contenido que tenga variantes femeninas y
comprobar que los textos que la tienen salen en femenino y los que no, en su forma por defecto.

**Acceptance Scenarios**:

1. **Given** una situación con variante femenina escrita, **When** la ve un personaje femenino, **Then** el título, el texto y las opciones se muestran en femenino.
2. **Given** una situación sin variante femenina escrita, **When** la ve un personaje femenino, **Then** se muestran los textos por defecto.
3. **Given** una opción con subtítulo femenino pero título sin él, **When** la ve un personaje femenino, **Then** el subtítulo sale en femenino y el título por defecto.

---

### User Story 2 - El autor escribe la variante femenina desde el panel (Priority: P1)

Quien redacta el contenido abre el panel, crea o edita una situación y rellena la variante femenina
de los cuatro textos (título y texto de la situación; título y subtítulo de cada opción). Al
exportar el contenido, esos textos pasan al juego sin tocar código.

**Why this priority**: sin esta vía no hay forma de introducir los textos femeninos; es tan
imprescindible como el propio juego.

**Independent Test**: crear una situación en el panel con variantes femeninas en varios campos,
exportarla y comprobar en el juego que aparecen; dejando campos vacíos, comprobar que no aparecen.

**Acceptance Scenarios**:

1. **Given** el formulario de una situación, **When** se rellena la variante femenina de un campo, **Then** el campo conserva el texto y se guarda con la situación.
2. **Given** una situación guardada con variantes femeninas, **When** se exporta el contenido, **Then** los campos rellenos se incluyen y los vacíos se omiten.
3. **Given** una situación sin ninguna variante femenina, **When** se exporta, **Then** el contenido resultante es válido y no incluye ruido.

---

### User Story 3 - El jugador no binario ve una mezcla (Priority: P2)

Un jugador crea un personaje de género no binario. A lo largo de la carrera no ve siempre la forma
por defecto ni siempre la femenina: en unos campos aparece una forma y en otros la otra (incluso
dentro de la misma decisión), de forma determinista y estable para esa partida.

**Why this priority**: es el matiz que pidió el enunciado; depende del comportamiento principal
(femenino) y queda cerrado a **azar determinista por campo**.

**Independent Test**: jugar con un personaje no binario sobre contenido con ambas variantes y
comprobar que, a lo largo de varias decisiones, aparecen las dos formas; repetir con la misma semilla
y decisiones y comprobar que el resultado es idéntico.

**Acceptance Scenarios**:

1. **Given** contenido con ambas variantes, **When** lo recorre un personaje no binario, **Then** no todos los textos son la forma por defecto.
2. **Given** la misma semilla, las mismas decisiones y el mismo género no binario, **When** se repite la partida, **Then** se muestran exactamente los mismos textos.
3. **Given** contenido con solo la forma por defecto, **When** lo ve un personaje no binario, **Then** se muestran los textos por defecto.

---

### Edge Cases

- **Campo femenino vacío o con solo espacios**: cuenta como vacío; se usa la forma por defecto.
- **Género masculino**: siempre la forma por defecto, aunque exista variante femenina.
- **Contenido parcialmente traducido**: solo algunos campos tienen variante femenina; el resto cae a la forma por defecto sin romper nada.
- **Mezcla dentro de una decisión (no binario)**: un mismo enunciado puede mostrar, por ejemplo, el título en femenino y el texto por defecto; es un resultado aceptado.
- **Condicionales**: son situaciones; heredan el mismo comportamiento sin tratamiento aparte.
- **Partida guardada y reanudada**: al volver a la decisión se muestran los mismos textos que la primera vez.
- **Contenido existente**: las situaciones que hoy no tienen campos femeninos deben seguir siendo válidas y verse exactamente igual que antes.
- **Ámbitos excluidos**: el título dinámico del juego, la tarjeta final, los textos de fase y las descripciones internas del historial no se adaptan en esta feature.
- **Identificadores**: los `id` de situación y opción no cambian ni dependen del género.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El contenido MUST permitir declarar, de forma **opcional**, una variante femenina del **título** y del **texto** de una situación.
- **FR-002**: El contenido MUST permitir declarar, de forma **opcional**, una variante femenina del **título** y del **subtítulo** de cada opción.
- **FR-003**: Los campos femeninos MUST ser opcionales; si faltan, están vacíos o contienen solo espacios, MUST usarse la forma por defecto.
- **FR-004**: Si el género del personaje es **femenino** y el campo femenino está relleno, el texto mostrado MUST ser el femenino.
- **FR-005**: Si el género del personaje es **masculino**, el texto mostrado MUST ser siempre la forma por defecto, aunque exista variante femenina.
- **FR-006**: Si el género del personaje es **no binario**, el sistema MUST elegir entre la forma por defecto y la femenina mediante **azar determinista sembrado**: la misma semilla, las mismas decisiones y el mismo género MUST producir siempre la misma elección, sin fijarse siempre en la forma por defecto.
- **FR-007**: Para un personaje no binario, la elección MUST hacerse **por cada campo de texto de forma independiente** (título y texto de la situación; título y subtítulo de cada opción). Es aceptable que una misma decisión mezcle formas.
- **FR-008**: La elección del texto MUST formar parte de la lógica del juego y no de la presentación: la pantalla MUST limitarse a pintar el texto ya resuelto.
- **FR-009**: Los condicionales MUST heredar el mismo comportamiento que las situaciones, sin tratamiento específico.
- **FR-010**: La adaptación MUST limitarse a los textos visibles de la decisión (título y texto de la situación; título y subtítulo de las opciones). Identificadores, historial interno, tarjeta final y textos de fase quedan fuera.
- **FR-011**: El panel de contenido MUST permitir crear y editar la variante femenina de los cuatro textos (título y texto de situación; título y subtítulo de opción).
- **FR-012**: El contenido exportado desde el panel MUST incluir los campos femeninos rellenos y omitir los vacíos, sin exigir ediciones manuales de código.
- **FR-013**: El contenido existente sin campos femeninos MUST seguir siendo válido y MUST producir exactamente los mismos textos que hoy.
- **FR-014**: La resolución MUST ser determinista: la misma semilla, las mismas decisiones y el mismo género MUST producir exactamente los mismos textos. Reanudar una partida guardada MUST mostrar la misma forma que en el momento de la decisión.
- **FR-015**: El juego MUST seguir funcionando con contenido sin variantes femeninas y con contenido parcialmente traducido.

### Key Entities

- **Situación**: unidad narrativa con `título` y `texto`; incorpora variantes femeninas **opcionales** de ambos. Se identifica por un `id` estable que no depende del género.
- **Opción**: alternativa de una situación con `título` y `subtítulo`; incorpora variantes femeninas **opcionales** de ambos. Se identifica por un `id` estable que no depende del género.
- **Personaje (género)**: dato de la partida (`masculino` / `femenino` / `no binario`) que determina qué forma se muestra. No se introduce ninguna entidad nueva.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con un personaje femenino, el 100 % de los textos que tienen variante femenina se muestran en femenino, y los que no la tienen en su forma por defecto.
- **SC-002**: Con un personaje masculino, el 100 % de los textos se muestran en su forma por defecto, haya o no variante femenina.
- **SC-003**: Con un personaje no binario, sobre contenido que ofrece ambas variantes, a lo largo de una evaluación de 100 campos se muestran las dos formas (no el 100 % por defecto ni el 100 % femenino).
- **SC-004**: Una persona autora puede añadir el texto femenino a una situación y a una opción desde el panel y verlo en el juego tras exportar, sin escribir código.
- **SC-005**: Al reanudar una partida guardada se muestran exactamente los mismos textos que en el momento de la decisión.
- **SC-006**: El contenido existente, sin variantes femeninas, se ve exactamente igual que antes de la feature.
- **SC-007**: La batería de tests del proyecto sigue en verde (actualizando los snapshots que corresponda).

## Assumptions

- **Alcance**: solo los textos visibles de la decisión. El título dinámico del juego (Coplero / Coplera / Coplere), la tarjeta final, los textos de fase y las descripciones internas del historial ya existen o quedan fuera.
- **La forma por defecto no cambia**: no se renombra ni se reescribe; sigue siendo el respaldo cuando no hay variante femenina.
- **Traducción progresiva**: el banco se irá rellenando poco a poco; no se exige adaptar ahora todas las situaciones existentes.
- **Vacío = sin variante**: un campo con solo espacios cuenta como vacío.
- **Sin dependencias nuevas**.
- **Determinismo**: la elección para no binario es **azar determinista sembrado** (misma semilla, mismas decisiones y mismo género → mismo texto), decidida por cada campo de texto de forma independiente.
- **Compatibilidad**: las partidas y el contenido previos siguen funcionando sin migración manual.
