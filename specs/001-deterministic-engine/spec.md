# Feature Specification: Motor determinista de Coplero (ENGINE-001)

**Feature Branch**: `N/A (no hay hook de rama configurado)`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "ENGINE-001 — Motor determinista de Coplero. Crear el núcleo TypeScript puro que permita crear una partida, generar el destino oculto, mantener GameState serializable, avanzar por verano/febrero, seleccionar decisiones, aplicar efectos, mantener flags, resolver fases del COAC, resolver premios, registrar historial y generar resumen final. Sin UI, sin Astro del juego y sin Svelte. Debe poder ejecutarse mediante tests directamente desde Node/Vitest."

## Contexto

Esta feature cubre exclusivamente el **núcleo de lógica de juego** (el `engine`). No incluye interfaz, presentación, rutas ni contenido narrativo definitivo. El `engine` es consumido por tests y por el futuro simulador masivo; su corrección se demuestra sin UI.

Fuentes de verdad aplicables: `docs/01-diseno-juego.md`, `docs/02-arquitectura-tecnica.md`, `docs/03-banco-verano.md`, `docs/04-banco-febrero.md`, `docs/05-producto-viralidad-negocio.md`, `docs/registro/`, `AGENTS.md` y la constitución del proyecto. (Nota: el input menciona `docs/product/` y `docs/architecture/`; en el repositorio la documentación vive en rutas planas `docs/01`–`docs/06`.)

## Clarifications

### Session 2026-09-18

- Q: ¿Cómo obtiene el engine el banco de situaciones, dado que no puede importar de `content`? → A: Se inyecta como parámetro; el `engine` no importa de `content`.
- Q: ¿Cómo se determina el `puesto` de cada temporada y su papel? → A: Puesto global por banda de fase (final 1-4; semifinalistas no finalistas 5-10; eliminados en cuartos 11-16; eliminados en preliminares desde el 17), con posición exacta dentro de la banda derivada de la puntuación; el puesto forma parte de la progresión.
- Q: ¿Cómo se comporta el motor ante una versión de esquema distinta? → A: Devuelve un error explícito de versión incompatible; el consumidor decide migrar o descartar.
- Q: ¿Qué hace el motor si no hay ninguna situación válida? → A: Degradación en cadena B→D: primero relaja los filtros opcionales; si sigue sin haber candidata, reutiliza la vista más reciente. El momento y el tipo nunca se relajan.
- Q: ¿Cuándo se resuelve el COAC y qué significa `requiereFase`? → A: La decisión no depende de la fase; el resultado de la temporada se determina con el estado previo a la decisión de febrero y esa decisión no altera el resultado; el resultado se revela después de la decisión.

## User Scenarios & Testing *(mandatory)*

Los "usuarios" de esta feature son consumidores del motor: los tests automatizados, el simulador de balance y, de forma indirecta, la futura interfaz que solo lo envuelve.

### User Story 1 - Partida reproducible desde una semilla (Priority: P1)

Un consumidor crea una partida a partir de una semilla y de los datos de personaje/modalidad/variante, y obtiene siempre el mismo estado, incluido el destino oculto. La misma semilla con las mismas decisiones produce exactamente la misma carrera.

**Why this priority**: Es el cimiento del proyecto: habilita tests deterministas, repeticiones, depuración con solo la semilla y tarjetas compartibles sin base de datos.

**Independent Test**: Crear dos partidas con la misma semilla y el mismo input y comprobar que su estado serializado es idéntico; encadenar la misma secuencia de decisiones y comprobar que el estado final coincide.

**Acceptance Scenarios**:

1. **Given** una misma semilla y el mismo input de creación, **When** se crea la partida dos veces, **Then** el estado serializado resultante es idéntico.
2. **Given** una partida y una secuencia de decisiones, **When** se reproduce esa secuencia sobre la misma semilla, **Then** el estado final (atributos, flags, historial, temporadas y premios) coincide exactamente.
3. **Given** un estado de partida, **When** se serializa y se vuelve a cargar, **Then** el estado es equivalente y la partida puede continuar con idéntico resultado.

---

### User Story 2 - Ciclo estacional, decisiones, efectos y flags (Priority: P1)

El motor avanza por verano y febrero, ofrece en cada año una decisión de contenido y una de personaje, filtra las situaciones por momento, tipo, modalidad, variante y condiciones, aplica los efectos sobre los atributos, deja flags y permite consumirlas sin borrarlas.

**Why this priority**: Es el bucle jugable real; sin él no existe partida.

**Independent Test**: Avanzar una partida por varios años eligiendo opciones y verificar que se respetan la separación verano/febrero, el reparto contenido/personaje, el filtrado por modalidad/variante y la evolución de atributos y flags.

**Acceptance Scenarios**:

1. **Given** un año en curso, **When** el motor presenta decisiones, **Then** ofrece exactamente una decisión de contenido y una de personaje, nunca dos del mismo tipo.
2. **Given** el momento actual, **When** se selecciona la situación, **Then** nunca aparece una situación de verano en febrero ni viceversa.
3. **Given** una situación con opciones, **When** se elige una opción, **Then** se aplican sus efectos sobre los atributos dentro del rango permitido y se dejan sus flags asociadas.
4. **Given** una flag ya consumida por una condicional, **When** se consulta el historial y las condicionales futuras, **Then** la flag sigue en el historial pero ya no dispara condicionales.
5. **Given** una flag cuya ventana de disparo ha expirado, **When** se selecciona situación, **Then** esa flag ya no abre condicionales.

---

### User Story 3 - Resolución del COAC y premios ajenos (Priority: P2)

Al cerrar cada temporada, el motor resuelve la fase alcanzada en el COAC (acotada por el destino oculto) y los premios ajenos al concurso, y lo registra en el historial de la carrera.

**Why this priority**: Da sentido a las decisiones y genera el relato de la carrera.

**Independent Test**: Dada una partida y unos atributos/flags conocidos, resolver una temporada y comprobar la fase alcanzada y los premios conforme a las reglas documentadas.

**Acceptance Scenarios**:

1. **Given** una temporada con participación en el COAC, **When** se resuelve, **Then** se registra la fase alcanzada y (cuando se conozca) el puesto, sin superar el techo oculto.
2. **Given** una temporada en la que el destino marca un `suelo`, **When** se resuelve sin batacazo, **Then** la fase alcanzada no baja del `suelo`; con batacazo, puede atravesarlo.
3. **Given** que el milagro ya se ha usado en la carrera, **When** se resuelven temporadas posteriores, **Then** el techo no vuelve a romperse.
4. **Given** una temporada sin participación en el COAC (por ejemplo, año callejero o de gira), **When** se resuelve, **Then** no se otorga ningún premio y la temporada se marca como fuera de concurso.
5. **Given** una temporada resuelta, **When** el motor evalúa los premios ajenos, **Then** aplica umbral de clasificación, afinidad por atributos/flags y selección ponderada, sin otorgar premios fuera de las condiciones documentadas.

---

### User Story 4 - Resumen mínimo de carrera (Priority: P2)

Cuando la carrera termina (retirada), el motor construye un **resumen mínimo** con los datos objetivos de la trayectoria, sin revelar nunca el techo de carrera. El resumen narrativo completo (tres hitos, evolución de variante y frase de cierre) queda pospuesto a una feature posterior.

**Why this priority**: Es el producto que el jugador comparte; define qué debe registrar el motor durante toda la carrera.

**Independent Test**: Ejecutar una carrera completa hasta la retirada y comprobar que el resumen incluye los campos mínimos y que el destino no aparece.

**Acceptance Scenarios**:

1. **Given** una carrera que llega a la retirada, **When** se solicita el resumen, **Then** incluye al menos años en activo, mejor fase alcanzada y premios obtenidos.
2. **Given** cualquier resumen, **When** se inspecciona su contenido, **Then** el techo de carrera (`destino`) no aparece por ningún lado ni se serializa en los datos compartibles.

---

### User Story 5 - Ejecución automática masiva sin interfaz (Priority: P3)

Un consumidor puede ejecutar muchas carreras completas seguidas, con jugadores aleatorios deterministas, sin UI, para validar el balance.

**Why this priority**: Es la herramienta de calibración exigida por la constitución; se apoya en que el motor es determinista y no depende de la interfaz.

**Independent Test**: Ejecutar un lote de carreras completas en un proceso Node y comprobar que terminan sin error y producen una distribución agregada.

**Acceptance Scenarios**:

1. **Given** un lote de carreras con semillas distintas, **When** se ejecutan de principio a fin sin UI, **Then** todas terminan y se puede agregar la distribución de fases alcanzadas.

---

### Edge Cases

- El banco de situaciones aplicables se agota para un momento/tipo: el motor relaja primero los filtros opcionales y, si aún no hay candidata, reutiliza las vistas menos recientes ignorando la marca de "solo una vez"; el momento y el tipo nunca se relajan.
- Temporada marcada como "no concursa": no hay resolución de COAC ni premios y queda registrada como fuera de concurso.
- Una flag necesaria para una condicional existe pero su ventana ya expiró.
- El milagro ya se ha consumido: el techo deja de poder romperse.
- Un atributo supera el máximo o cae por debajo del mínimo tras aplicar efectos: se acota al rango permitido.
- La carrera termina al cierre del año en que se alcanzan los años de carrera (tras la resolución del COAC); no existe retirada a mitad de año.
- Datos de partida con una versión de esquema distinta a la esperada: el motor devuelve un error explícito de versión incompatible.
- Se elige un identificador de opción que no pertenece a la situación presentada: el motor devuelve un error explícito y no modifica el estado.
- No existe ninguna situación válida para la combinación de momento, tipo, modalidad y variante del personaje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El motor MUST permitir crear una partida a partir de una semilla y de los datos de creación (personaje, modalidad y variante).
- **FR-002**: El motor MUST generar, al crear la partida y de forma derivada de la semilla, un destino oculto con techo, suelo, año pico, años de carrera, volatilidad y carisma.
- **FR-003**: El estado de partida MUST ser serializable y deserializable sin pérdida, incluyendo una versión de esquema. Si la versión del estado no coincide con la esperada, el motor MUST devolver un error explícito de versión incompatible y MUST NOT continuar; migrar o descartar es responsabilidad del consumidor. La serialización completa del estado incluye el destino oculto (artefacto interno de la partida); el código de partida compartible, que excluye el destino, queda fuera de esta feature.
- **FR-004**: Una misma semilla combinada con las mismas decisiones MUST producir exactamente el mismo estado final. El determinismo MUST ser independiente del proceso, del sistema operativo y del momento de ejecución: el resultado solo puede depender de la semilla, del input de creación, de las decisiones y de la versión del banco de contenido.
- **FR-005**: El motor MUST avanzar por el ciclo estacional verano → febrero, año a año, hasta la retirada. El orden dentro de cada año MUST ser: decisión de verano → decisión de febrero → resolución del COAC de la temporada.
- **FR-006**: En cada año el motor MUST seleccionar una situación de contenido y una de personaje, filtradas por momento, tipo, modalidad, variante, año mínimo y no vistas. El filtro de fase queda fuera del alcance de esta feature: las decisiones no dependen de la fase. El filtro `variantes` se evalúa contra la variante actual del personaje; dado que en esta feature la variante no cambia, las situaciones cuyo filtro de variantes no incluya la variante inicial solo pueden aparecer mediante la degradación de FR-018. La validación de integridad MUST considerar esas reglas de degradación para decidir si una situación es realmente inalcanzable.
- **FR-007**: El motor MUST evaluar requisitos de condicionales mediante un árbol lógico que admita: flag presente, flag repetida un número de veces (con opción de exigir años consecutivos), fase ya alcanzada dentro de la misma partida, combinaciones "todas/alguna/ninguna" y umbrales de atributo.
- **FR-008**: El motor MUST aplicar los efectos de la opción elegida sobre los atributos, acotándolos al rango permitido.
- **FR-009**: El motor MUST registrar las flags que deja cada opción y MUST marcarlas como consumidas cuando corresponda, sin borrarlas del historial; MUST dejar de disparar condicionales cuando la ventana de la flag expire.
- **FR-010**: El motor MUST resolver la fase del COAC de la temporada acotándola entre el suelo y el techo del destino, permitiendo que el batacazo atraviese el suelo y que el milagro rompa el techo una única vez por carrera.
- **FR-011**: El motor MUST resolver los premios ajenos al COAC a partir de **definiciones inyectadas** (umbral de puesto por premio y pesos de afinidad sobre atributos y flags), con desempate determinista, y MUST no otorgar premios en temporadas sin participación. Las flags temáticas concretas que alimentan cada afinidad se añadirán al banco en una fase posterior.
- **FR-012**: El motor MUST registrar cada temporada resuelta en el historial de la carrera, con fase, puesto (cuando se conozca), premios obtenidos y marca de fuera de concurso. El **puesto** es una posición global por banda de fase: finalistas 1-4, semifinalistas no finalistas 5-10, eliminados en cuartos 11-16 y eliminados en preliminares desde el 17 en adelante. La posición exacta dentro de la banda se deriva de la puntuación de la temporada.
- **FR-013**: El motor MUST construir un **resumen mínimo** de carrera con, al menos, años en activo, mejor fase alcanzada y premios obtenidos. El resumen narrativo extendido (tres hitos, evolución de variante, frase de cierre) queda fuera del alcance de esta feature (pospuesto por clarificación Q3-C).
- **FR-014**: El `engine` MUST NOT depender de interfaz, DOM ni framework, y MUST NOT usar fuentes implícitas de azar o tiempo (`Math.random`, `Date.now`).
- **FR-015**: El motor MUST ser determinista y sin efectos secundarios: aplicar una decisión sobre un estado MUST devolver un estado nuevo sin mutar el anterior.
- **FR-016**: El número de decisiones por año MUST ser parametrizable, aunque el valor por defecto acordado sea dos (una de contenido y una de personaje). En ENGINE-001 el valor efectivo es 2; otros valores (modos rápido/lento) quedan fuera de alcance.
- **FR-017**: El motor MUST soportar opciones que implican no concursar ese año, marcando la temporada como fuera de concurso y saltando la resolución del COAC. La opción `saltaCOAC` consume la decisión del momento en que aparece y el reparto anual (una de contenido + una de personaje) se mantiene.
- **FR-018**: El motor MUST distinguir entre situaciones base y condicionales. Cuando no haya candidatas que cumplan todos los filtros, MUST degradar en cadena: primero relajar los filtros opcionales (modalidad, variante y año mínimo), y solo si aun así no hay ninguna, reutilizar las situaciones vistas menos recientes ignorando la marca de "solo una vez". El momento y el tipo nunca se relajan.
- **FR-019**: El motor MUST registrar la modalidad y la variante del personaje en el estado. El mecanismo de cambio de variante queda **fuera del alcance** de esta feature (pospuesto a una feature posterior, clarificación Q3-C); no se implementan disparadores de cambio.
- **FR-020**: El número de años de carrera MUST ser parametrizable; el valor por defecto provisional es 20 años / 40 decisiones (2 por año), pendiente de cierre definitivo en la calibración.
- **FR-021**: El motor MUST resolver la fase y los premios con **parámetros numéricos configurables** (umbrales de puntuación por fase, bono de año pico, volatilidad, carisma, afinidades de premios y modificadores de creación). Los valores por defecto serán provisionales y se calibrarán con el simulador masivo.
- **FR-022**: El `engine` MUST recibir el banco de situaciones por **inyección de parámetro** y MUST NOT importarlo de `content`; los tests y el simulador MUST poder inyectar bancos propios. El banco de situaciones no forma parte del estado serializable de la partida.
- **FR-023**: El motor MUST exponer la progresión del personaje de forma que dos temporadas con la misma fase pero distinto puesto (por ejemplo, 5.º frente a 10.º de semifinales) se distingan, y el puesto MUST tenerse en cuenta en la resolución de premios y en el relato de progresión.
- **FR-024**: El resultado del COAC de una temporada MUST calcularse con el estado previo a la decisión de febrero (tras los efectos de verano) y MUST NOT verse alterado por los efectos de esa decisión; el resultado se da a conocer después de la decisión. Para ello el motor MUST conservar los atributos resultantes tras los efectos de verano.
- **FR-025**: La interfaz (Astro/Svelte) MUST NOT contener reglas de negocio ni lógica de juego; MUST limitarse a presentar el estado y a invocar la API del `engine`. Toda regla de negocio MUST residir en `engine` (código) o `content` (datos).
- **FR-026**: La obtención de azar MUST derivarse del contexto (semilla + año + momento + propósito + contador), de modo que el resultado no dependa del orden de llamadas ni de refactorizaciones internas. El RNG MUST devolver valores en `[0, 1)`. Un cambio en el banco de contenido MAY alterar resultados y MUST tratarse como una nueva versión de contenido.
- **FR-027**: La serialización de esta feature MUST ser JSON plano con un campo `version`; la compresión y la codificación base64url quedan fuera de alcance (feature posterior).

### Key Entities *(include if feature involves data)*

- **Partida (estado de juego)**: estado completo y serializable de una carrera; incluye semilla, personaje, modalidad, variante, momento y año en curso, fase del bucle, atributos, flags, situaciones vistas, historial, temporadas, premios y destino oculto. El banco de situaciones no forma parte de este estado: se inyecta al invocar el motor.
- **Personaje**: nombre/apodo, edad, localidad y género; determina el título dinámico y modificadores de creación.
- **Destino**: conjunto oculto que define techo, suelo, año pico, años de carrera, volatilidad y carisma.
- **Situación**: decisión del banco, con momento, tipo, categoría, título, texto, opciones y filtros de aparición (modalidad, variante, año mínimo).
- **Condicional**: situación que además exige un requisito lógico, una ventana de años y una probabilidad.
- **Banco de contenido**: conjunto de situaciones y condicionales inyectado al motor; no forma parte del estado serializable.
- **Opción**: alternativa de una situación con título, subtítulo, efectos, flags que deja, flags que consume y marca de no concurso.
- **Flag**: marca persistente en el historial, con año de aparición y número de veces; alimenta condicionales dentro de su ventana.
- **Temporada**: resultado de un año: fase, puesto cuando se conozca, premios y si quedó fuera de concurso.
- **Premio**: galardón ajeno al COAC obtenido en un año.
- **Evento de historial**: entrada de la trayectoria del personaje para la cronología y el resumen.
- **Resumen de carrera**: vista pública mínima del final de la partida (años en activo, mejor fase, premios), sin el destino.
- **Parámetros del motor**: constantes numéricas configurables (pesos, umbrales, afinidades de premios y defaults provisionales) inyectadas al motor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las partidas creadas con la misma semilla y la misma secuencia de decisiones produce un estado final idéntico.
- **SC-002**: El 100% de los estados de partida sobrevive a un ciclo de guardado y recuperación sin pérdida de información y con continuidad idéntica.
- **SC-003**: Una carrera completa puede recorrerse de principio a fin en un proceso Node sin interfaz ni navegador.
- **SC-004**: Un lote de 10.000 carreras completas se ejecuta sin errores en menos de 30 s (umbral provisional) en la máquina de desarrollo del proyecto (Node 22+).
- **SC-005**: Añadir una situación al banco no requiere modificar el motor.
- **SC-006**: Ninguna decisión del jugador puede producir un estado incoherente (atributos fuera de rango, dos decisiones del mismo tipo en un año, o situación de un momento en el momento equivocado).

## Assumptions

- Las fuentes de verdad son `docs/01`–`docs/06`, `docs/registro/`, `AGENTS.md` y la constitución. El input cita `docs/product/` y `docs/architecture/`, que no existen como tales en el repositorio.
- **Clarificaciones resueltas (2026-09-18)**: Q1-B → duración parametrizable con provisional 20 años / 40 decisiones. Q2-A → los valores numéricos se implementan como parámetros configurables provisionales y se calibran después con el simulador. Q3-C → el cambio de variante y el resumen narrativo extendido quedan fuera de esta feature; ENGINE-001 solo registra la variante inicial y genera un resumen mínimo.
- La calibración numérica del juego está diferida (T13); se resuelve implementando parámetros configurables provisionales.
- **Reparto de participantes clarificado**: final 4, semifinales 10, cuartos 16 y preliminares todas; coincide con `docs/01-diseno-juego.md`.
- El resultado de una temporada se calcula con el estado previo a la decisión de febrero; esa decisión no altera el resultado de la temporada y se revela después (Q5). Las decisiones no dependen de la fase.
- El motor garantiza una decisión de contenido y una de personaje por año; el reparto concreto entre verano y febrero lo decide el motor de forma determinista al inicio del año, entre las combinaciones que tengan candidatas (ver research D5). Regla adoptada como definitiva para ENGINE-001.
- La calibración fina de umbrales y premios es provisional: en esta feature prima que el mecanismo funcione con los valores por defecto; el ajuste se hará con el simulador en una fase posterior.
- El snapshot de referencia captura el estado serializado completo (incluido el destino) de una carrera con semilla y decisiones fijas; el banco se inyecta y no se captura (ver research D13).
- Las definiciones de afinidad de premios se inyectan como parámetros; las flags temáticas concretas (por ejemplo, para Coplas por Andalucía) se añadirán al banco en una fase posterior.
- El año base (`anoInicio`) y cualquier valor temporal por defecto MUST ser constantes fijas, nunca derivadas del reloj.
- Las claves de contexto del RNG son tokens estables y versionados; renombrarlas es un cambio incompatible.
- La selección ponderada (premios y azar de selección) MUST incluir desempate determinista.
- El banco de contenido inicial es reducido; el motor debe tolerar el agotamiento de situaciones mediante reciclaje.
- Esta feature no incluye interfaz, rutas, Astro del juego, Svelte, imagen OG, persistencia local ni analítica.
- El motor se valida exclusivamente mediante pruebas automatizadas que se ejecutan directamente en Node.
