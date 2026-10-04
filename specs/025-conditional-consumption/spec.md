# Feature Specification: Consumo de flags por condicional

**Feature Branch**: `025-conditional-consumption`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "el consume podemos quitarlo de las situaciones normales. En los condicionales que se den por una flag al consume automáticamente" — con las siguientes decisiones de diseño acordadas en conversación: (1) se retira el consumo manual del modelo y del panel (`consume` en la opción y `consumeFlag` en el condicional); (2) al dispararse un condicional se consumen automáticamente las flags de su requisito **que estaban activas**; (3) el consumo es **por condicional**: solo impide que ese condicional vuelva a salir, sin bloquear a otros condicionales que usen la misma flag.

## Contexto

Una **flag** es una huella que deja una opción en el historial del personaje (por ejemplo `tema_social`).
Una **situación condicional** es una situación que solo puede entrar en la baraja si se cumple un
requisito (normalmente, que exista cierta flag) dentro de una ventana de años.

Hoy el modelo permite **consumir** flags de dos formas manuales: una opción puede marcar flags como
consumidas (`consume`) y un condicional puede consumir su propia flag al dispararse (`consumeFlag`).
Sin embargo: ninguna opción ni condicional del banco actual usa esa capacidad, y el motor ni siquiera
consulta la marca de "consumida" al evaluar requisitos. Además, una marca de consumo **global** sobre
la flag impediría que **otros** condicionales que comparten esa flag pudieran salir, algo que no se
quiere.

Esta feature retira el consumo manual y convierte el consumo en una regla **automática y por
condicional**: el condicional que se dispara "se agota" a sí mismo, pero deja la flag disponible para
los demás.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un condicional basado en una flag se agota solo (Priority: P1)

Cuando un condicional que depende de una flag se dispara, ese condicional no vuelve a salir durante la
partida. Otros condicionales que usen la misma flag siguen pudiendo salir con normalidad. El jugador no
hace nada especial: es una regla del motor.

**Why this priority**: es el comportamiento central que se quiere; sin esto, el resto no aporta.

**Independent Test**: jugar una partida forzando que se dispare un condicional basado en una flag y
comprobar que no vuelve a salir, mientras que otro condicional que comparte esa misma flag sí puede
salir.

**Acceptance Scenarios**:

1. **Given** un condicional `c` cuyo requisito depende de una flag, **When** `c` se dispara, **Then** `c` no vuelve a aparecer en el resto de la partida.
2. **Given** dos condicionales que comparten la misma flag, **When** uno de ellos se dispara, **Then** el otro sigue pudiendo dispararse.
3. **Given** un condicional cuyo requisito depende de una flag que no está activa, **When** se evalúa, **Then** no se dispara.

---

### User Story 2 - Retirada del consumo manual (Priority: P1)

El modelo y el panel dejan de ofrecer el consumo manual: las opciones ya no tienen un campo de flags a
consumir, y los condicionales ya no tienen una casilla de "consume la flag al dispararse". El consumo
es siempre automático.

**Why this priority**: es la simplificación pedida; hoy el consumo manual no se usa y confunde.

**Independent Test**: comprobar que en el formulario de una opción ya no aparece el control de
"consume", que en el de un condicional ya no aparece la casilla de consumo, y que el banco validado no
contiene ningún campo de consumo manual.

**Acceptance Scenarios**:

1. **Given** el formulario de una opción, **When** se abre, **Then** solo ofrece el selector de flags que la opción deja, no el de flags que consume.
2. **Given** el formulario de un condicional, **When** se abre, **Then** no ofrece ninguna casilla de consumo manual.
3. **Given** el banco de contenido, **When** se valida, **Then** ninguna opción ni condicional declara consumo manual.

---

### User Story 3 - Compatibilidad del estado guardado (Priority: P2)

El estado de partida cambia de forma (la información de consumo se guarda por condicional, no por
flag). Una partida guardada con el formato anterior deja de ser compatible y debe rechazarse con un
mensaje claro en lugar de continuar con datos incoherentes.

**Why this priority**: evita corromper partidas a medias; es importante, pero no altera la mecánica.

**Independent Test**: cargar una partida con el formato anterior y comprobar que el motor responde con
un error de versión incompatible y no continúa.

**Acceptance Scenarios**:

1. **Given** una partida guardada con la versión de estado anterior, **When** se intenta continuar, **Then** el motor responde con un error explícito de versión incompatible y no continúa.
2. **Given** una partida creada con la versión nueva, **When** se serializa y se vuelve a cargar, **Then** es equivalente (ida y vuelta sin pérdida).

---

### Edge Cases

- **Requisito compuesto del tipo "una u otra"** (`alguna`): al dispararse, solo se consume la flag que estaba activa y cumplió el requisito, no las demás.
- **Requisito del tipo "ninguna"** (prohibir): no consume ninguna flag.
- **Condicional sin flag** (por ejemplo, requisito de fase alcanzada o requisito vacío): no consume nada.
- **Flag compartida por varios condicionales**: que uno se agote no impide que los demás la usen.
- **Flag que se vuelve a ganar** después de haber sido consumida por un condicional: se mantiene el consumo de ese condicional (no vuelve a dispararse por el mero hecho de re-ganar la flag). *(Decisión acordada.)*
- **Condicional sin requisito efectivo** (repetible y limitado por modalidad/variante): no consume nada y puede repetirse según sus reglas actuales.
- **Las flags no se borran nunca**: el consumo no elimina la flag del historial; sigue disponible para la tarjeta final y los logros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Un condicional que se dispara MUST quedar agotado y MUST NOT volver a aparecer en el resto de la partida.
- **FR-002**: El agotamiento MUST ser **por condicional**: MUST NOT impedir que otros condicionales que usen la misma flag puedan dispararse.
- **FR-003**: Al dispararse un condicional, el sistema MUST marcar como consumidas solo las flags de su requisito que estuvieran activas en ese momento.
- **FR-004**: Un requisito del tipo "ninguna" MUST NOT consumir ninguna flag.
- **FR-005**: Un condicional cuyo requisito no dependa de ninguna flag MUST NOT consumir nada.
- **FR-006**: El campo de consumo manual de las opciones MUST desaparecer del modelo de contenido y del formulario del panel.
- **FR-007**: El campo de consumo manual de los condicionales MUST desaparecer del modelo de contenido y del formulario del panel.
- **FR-008**: El banco de contenido validado MUST NOT contener ningún campo de consumo manual.
- **FR-009**: Las flags MUST seguir sin borrarse nunca; el consumo MUST NOT eliminarlas del historial.
- **FR-010**: El estado de partida MUST cambiar de versión al cambiar la forma en que se registra el consumo, y una partida guardada con la versión anterior MUST rechazarse con un error explícito de versión incompatible.
- **FR-011**: La serialización y deserialización del estado con la versión nueva MUST ser equivalentes (ida y vuelta sin pérdida).
- **FR-012**: El código de partida compartible y la tarjeta final MUST mantener su comportamiento (no incluyen las flags).

### Key Entities *(include if feature involves data)*

- **Flag**: huella del historial; además de cuándo y cuántas veces se ganó, registra **qué condicionales la han consumido** (lista de identificadores de condicional).
- **Condicional**: situación que entra en la baraja si se cumple un requisito; al dispararse, se agota a sí misma.
- **Opción**: ya no declara flags a consumir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100% de las partidas, un condicional basado en una flag aparece como máximo una vez.
- **SC-002**: En el 100% de los casos, dos condicionales que comparten una flag pueden dispararse ambos (ninguno bloquea al otro).
- **SC-003**: El banco de contenido validado contiene **0** campos de consumo manual.
- **SC-004**: El formulario del panel no ofrece ningún control de consumo manual (0 controles).
- **SC-005**: La suite de tests del motor y del contenido pasa (salvo los 2 fallos preexistentes de `forma-carrera`, ajenos a esta feature).

## Assumptions

- **No se migran partidas guardadas**: al ser un juego en desarrollo y cambiar la forma del estado, una partida guardada con la versión anterior se descarta con un error explícito (FR-010); el jugador reinicia. No se implementa migración.
- El **código de partida compartible** no incluye las flags, así que no cambia.
- Se mantiene la regla vigente de que las flags **no caducan**: lo que caduca es su ventana de disparo.
- El matiz acordado: re-ganar una flag **no** limpia el consumo previo de un condicional.
- No se cambia ninguna otra regla del selector (momento, modalidad, variante, ventana, probabilidad, `unicaVez`).
