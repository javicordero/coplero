# Feature Specification: Cambios de trayectoria (modalidad y variante)

**Feature Branch**: `006-trajectory-change`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Implementar la posibilidad de cambiar de modalidad a mitad de carrera mediante 2 situaciones de verano (chirigotero → comparsista y comparsista → chirigotero), con 2 opciones cada una: seguir con la modalidad actual o cambiarla. Tras cambiar, el jugador elige una variante de la nueva modalidad. La variante también puede cambiar durante la carrera mediante situaciones normales: internamente es explícito (el motor lo registra), pero para el jugador es una situación más."

## Clarifications

### Session 2026-09-20

- Q: ¿Cómo se cambia de modalidad? → A: Con 2 situaciones de verano, una por dirección (chirigotero → comparsista y comparsista → chirigotero), cada una con exactamente 2 opciones: seguir con la actual o cambiar.
- Q: ¿Cómo cambia la variante? → A: Mediante situaciones que, para el jugador, son decisiones ordinarias; internamente la opción elegida desplaza la variante y el motor lo registra.
- Q: Tras cambiar de modalidad, ¿qué variante tiene el personaje? → A: El jugador elige una variante de la nueva modalidad antes de continuar la carrera.
- Q: ¿Cuántas veces puede cambiarse de modalidad en una carrera? → A: Sin tope fijo: se puede cambiar y volver más adelante, y rechazar la situación no la descarta (puede reaparecer en otro año). Eso sí, las situaciones son de baja frecuencia y nunca salen el primer año.
- Q: ¿Hacia dónde y cuántas veces evoluciona la variante? → A: Cambios libres y repetibles entre las variantes de la modalidad (se puede ir y volver), siempre con baja frecuencia y sin presentarse como mecánica.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cambiar de modalidad a mitad de carrera (Priority: P1)

Llegado un verano, al jugador le sale una situación que le plantea seguir en la modalidad de siempre o dar el salto a la otra. Si decide cambiar, pasa a la otra modalidad y elige cómo quiere trabajar en ella; a partir de ahí, el resto de la carrera discurre con su nueva modalidad.

**Why this priority**: es la mecánica central de esta feature y una fuente directa de historias singulares; sin ella, la tarjeta final no puede narrar cambios de modalidad. Completa lo descrito en `docs/01` §2.

**Independent Test**: llevar una carrera hasta el verano en que aparece la situación, elegir cambiar, comprobar que el flujo pide la nueva variante y que las decisiones siguientes son de la nueva modalidad.

**Acceptance Scenarios**:

1. **Given** una carrera que alcanza el año en que puede aparecer la situación de cambio de modalidad, **When** se muestra, **Then** ofrece exactamente dos opciones: seguir con la modalidad actual o cambiarla.
2. **Given** esa situación, **When** el jugador elige cambiar, **Then** la modalidad vigente pasa a ser la otra y el flujo le pide elegir una variante de la nueva modalidad antes de continuar.
3. **Given** un cambio de modalidad ya resuelto, **When** se seleccionan las decisiones siguientes, **Then** usan la nueva modalidad y la nueva variante.
4. **Given** que el jugador elige seguir, **When** continúa la carrera, **Then** la modalidad y la variante no cambian.

---

### User Story 2 - Evolución de estilo sin que se note la mecánica (Priority: P2)

A lo largo de la carrera, algunas decisiones normales van desplazando el estilo del personaje (su variante) sin que la interfaz lo anuncie: el jugador ve una decisión más, pero por dentro su forma de trabajar ha cambiado y las decisiones posteriores se adaptan a ese nuevo estilo.

**Why this priority**: enriquece la carrera y da material a la tarjeta final, pero puede entregarse después del cambio de modalidad sin romper la experiencia.

**Independent Test**: forzar una situación de cambio de variante, comprobar que se presenta como una decisión ordinaria, que la variante cambia por dentro y que las decisiones siguientes usan la nueva variante.

**Acceptance Scenarios**:

1. **Given** una situación cuyo efecto interno cambia la variante, **When** se muestra al jugador, **Then** aparece como una decisión más, sin ninguna referencia a "cambio de variante".
2. **Given** que el jugador elige la opción que desplaza la variante, **When** se aplica la elección, **Then** la variante vigente queda actualizada.
3. **Given** un cambio de variante aplicado, **When** se seleccionan decisiones posteriores, **Then** los filtros de contenido usan la nueva variante.

---

### User Story 3 - Trayectoria coherente y registrada (Priority: P3)

La carrera recuerda de dónde venía el personaje y por dónde pasó: la modalidad y la variante con las que empezó, cada cambio con su año y los valores con los que acabó. Esa memoria se conserva al guardar y restaurar y es la que después alimenta la tarjeta final.

**Why this priority**: es la base de datos de la historia; sin ella, los cambios se aplicarían pero se perdería el relato. Depende de que existan cambios (P1/P2).

**Independent Test**: completar una carrera con al menos un cambio de modalidad y otro de variante, guardar, restaurar y comprobar que la trayectoria registrada es idéntica.

**Acceptance Scenarios**:

1. **Given** una carrera con cambios, **When** se consulta su trayectoria, **Then** contiene los valores iniciales, cada cambio con su año y los valores finales.
2. **Given** una partida con cambios guardada, **When** se restaura, **Then** la trayectoria se conserva intacta.
3. **Given** la misma semilla y las mismas decisiones, **When** se repite la partida, **Then** la trayectoria es exactamente la misma.

---

### Edge Cases

- **Situación de cambio en el primer año**: no debe poder aparecer; el cambio de modalidad solo tiene sentido con carrera previa.
- **Cambio de modalidad repetido**: la misma situación puede reaparecer tras rechazarla y la situación inversa puede ofrecerse tras un cambio (para volver), siempre con baja frecuencia; nunca de forma sistemática.
- **Cambio en el último año**: debe poder resolverse (incluida la elección de nueva variante) y cerrar la carrera de forma coherente.
- **Variante elegida tras el cambio**: debe pertenecer siempre a la nueva modalidad; nunca puede quedar una variante de la modalidad anterior.
- **Filtros de contenido tras el cambio**: no deben seleccionarse situaciones filtradas por la modalidad o variante antiguas.
- **Cambio de variante dentro de la misma modalidad**: debe poder ocurrir sin alterar la modalidad, en cualquier dirección y más de una vez a lo largo de la carrera, siempre con baja frecuencia.
- **Contenido mal declarado**: una situación que declare variantes que no pertenecen a su modalidad debe considerarse inválida en la validación de contenido.
- **Sin variantes disponibles para la nueva modalidad**: no debería ocurrir (cada modalidad tiene 3), pero el sistema no debe quedar bloqueado ni en un estado inválido.
- **Persistencia**: un cambio de trayectoria guardado y restaurado debe conservarse igual (integración con la persistencia local).
- **Datos ocultos**: el cambio no debe exponer ni insinuar el techo ni ningún otro dato interno del motor.
- **Determinismo**: misma semilla + mismas decisiones ⇒ misma trayectoria, siempre.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El motor MUST permitir que una opción de una situación cambie la modalidad vigente del personaje.
- **FR-002**: El motor MUST permitir que una opción de una situación cambie la variante vigente del personaje.
- **FR-003**: Al aplicar un cambio, el motor MUST actualizar el valor vigente correspondiente y registrar el cambio con su año.
- **FR-004**: La trayectoria MUST conservar la modalidad y la variante iniciales, cada cambio con su año y los valores finales.
- **FR-005**: El sistema MUST incluir 2 situaciones de verano para el cambio de modalidad: una para chirigotero → comparsista y otra para comparsista → chirigotero, cada una con exactamente 2 opciones (seguir con la actual / cambiar).
- **FR-006**: Las situaciones de cambio de modalidad MUST ser **repetibles** (rechazarlas MUST NOT descartarlas para siempre) y MUST aparecer con **baja frecuencia**, nunca en el primer año ni de forma sistemática. El jugador MUST poder cambiar de modalidad y volver más adelante a la anterior.
- **FR-007**: Tras elegir cambiar de modalidad, el sistema MUST pedir al jugador que elija una variante de la nueva modalidad antes de continuar.
- **FR-008**: La variante elegida tras un cambio de modalidad MUST pertenecer a la nueva modalidad.
- **FR-009**: Tras un cambio de modalidad o variante, la selección de decisiones MUST usar la modalidad y la variante vigentes.
- **FR-010**: El cambio de variante MUST producirse a través de situaciones que, para el jugador, sean decisiones ordinarias; la interfaz MUST NOT etiquetarlas como "cambio de variante".
- **FR-011**: La trayectoria MUST formar parte del estado serializable de la partida y MUST conservarse al guardar y restaurar.
- **FR-012**: La generación y la aplicación de los cambios MUST ser deterministas (misma semilla y decisiones ⇒ misma trayectoria).
- **FR-013**: La interfaz MUST NOT calcular ni decidir cambios: se limita a presentar lo que decide el motor.
- **FR-014**: El sistema MUST NOT exponer información oculta del motor (el destino y sus derivados) durante el cambio ni en la elección de variante.
- **FR-015**: Las situaciones que cambian modalidad o variante MUST validarse con el esquema de contenido y MUST referenciar únicamente variantes válidas de su modalidad.
- **FR-016**: Los cambios de variante MUST poder producirse en cualquier dirección entre las variantes de la modalidad, MUST ser repetibles y MUST aparecer con baja frecuencia; nunca de forma sistemática y sin mostrarse como mecánica.

### Key Entities *(include if feature involves data)*

- **Trayectoria**: recorrido de la carrera en cuanto a modalidad y variante. Guarda los valores iniciales, cada cambio con su año y los valores finales. Forma parte del estado de la partida y es la fuente del relato de la tarjeta final.
- **Cambio de trayectoria**: registro de que la modalidad o la variante ha cambiado en un año concreto, con el valor anterior y el nuevo. Puede tener un año de efecto y una modalidad/variante asociada.
- **Situación de cambio**: situación de verano cuyo resultado puede modificar la modalidad o la variante. Las de modalidad son explícitas (seguir / cambiar); las de variante se presentan como decisiones ordinarias.
- **Elección de nueva variante**: paso intermedio que obliga a elegir una variante válida de la nueva modalidad tras un cambio de modalidad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las veces que aparece la situación de cambio de modalidad ofrece exactamente dos opciones (seguir / cambiar).
- **SC-002**: En una simulación de al menos 10.000 carreras, 0 carreras terminan con una variante que no pertenezca a su modalidad vigente.
- **SC-003**: En una simulación de al menos 10.000 carreras, el 100% de las decisiones tomadas después de un cambio usan la modalidad y la variante nuevas.
- **SC-004**: El 100% de las carreras con cambios conservan su trayectoria al guardar, cerrar y restaurar.
- **SC-005**: Repetir la misma partida (misma semilla y decisiones) produce la misma trayectoria en el 100% de los casos.
- **SC-006**: El 100% de las situaciones de cambio de variante se muestran como decisiones ordinarias, sin etiquetas que revelen la mecánica.
- **SC-007**: 0 revelaciones de información oculta del motor en la interfaz de cambio y elección de variante.

## Assumptions

- **Tipo y categoría de las situaciones de cambio de modalidad**: se añaden como situaciones de verano del tipo personaje (categoría "carrera"), **repetibles** y nunca en el primer año, con baja frecuencia (peso o probabilidad bajos) para que no aparezcan de forma sistemática. Los valores concretos se calibran con el simulador en el plan.
- **Situaciones de cambio de variante**: se apoyan en el mismo efecto interno y pueden ser situaciones nuevas o adaptaciones de las existentes; permiten cambios libres y repetibles entre las variantes de la modalidad, con baja frecuencia. El número y el texto exactos se detallan en el plan. Para el jugador no son distintas de una decisión normal.
- **Reutilización de la elección de variante**: el paso de elegir la nueva variante tras un cambio de modalidad reutiliza la pantalla de elección de variante ya existente.
- **Modalidades**: solo las 2 actuales (comparsista y chirigotero); corista y cuartetero siguen fuera de alcance.
- **Sin tarjeta final en esta feature**: los cambios se registran y se aplican, pero su presentación en la tarjeta final corresponde a la feature 007.
- **Persistencia**: la trayectoria se añade al estado serializable y hereda el comportamiento de guardado/restauración ya definido (`docs/02` §10).
- **El destino permanece interno**: la trayectoria no incluye ni expone el techo ni ningún otro campo oculto.
- **Dependencia de contenido**: las situaciones nuevas deben cumplir las reglas del banco (momento, tipo, categoría, título + subtítulo, flags coherentes) y validarse con Zod.
