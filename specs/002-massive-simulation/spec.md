# Feature Specification: Simulación masiva del motor

**Feature Branch**: `002-massive-simulation`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Ahora crea la herramienta de simulación masiva del engine. Poder ejecutar `npm run simular -- 10000` o equivalente. Debe: crear partidas con seeds distintas, jugadores/configuraciones variadas, jugar decisiones automáticamente, completar carreras, recoger estadísticas. Debe informar como mínimo: % que pisa final, % que no supera cuartos, % que no supera preliminares, distribución de mejor fase, número medio de primeros premios, distribución de premios, duración media, distribución de años de pico, situaciones más/menos frecuentes, condicionales que nunca aparecen, atributos mínimos/máximos/medios, posibles estados imposibles. NO cambies los pesos para intentar acertar todavía. Primero genera el simulador y enséñame los resultados."

## Clarifications

### Session 2026-09-18

- Q: ¿Qué conjunto de perfiles de decisión debe traer la herramienta por defecto? → A: Tres perfiles: aleatorio uniforme, codicioso simple y errático.
- Q: ¿Qué reglas debe comprobar el detector de estados imposibles? → A: El catálogo más amplio posible: todas las incoherencias derivables de las reglas del juego (ampliable).
- Q: ¿Cómo debe presentarse y poder guardarse el informe? → A: Informe legible en consola y volcado opcional del mismo informe a un archivo JSON.
- Q: ¿Qué debe hacer la herramienta ante un error en una carrera? → A: Continuar la corrida, contar los errores por tipo y terminar con código de salida distinto de cero si hubo alguno.
- Q: ¿Con qué granularidad debe desglosarse el informe? → A: Agregado global + todas las métricas por perfil + métricas principales por configuración (mejor fase, premios y duración).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Informe de balance en una sola orden (Priority: P1)

Como responsable de balance del juego, quiero lanzar una simulación de muchas carreras automáticas con una sola orden y obtener un informe legible, para saber cómo se comporta hoy el motor sin cambiar nada.

**Why this priority**: Es el núcleo de la herramienta y la única forma de equilibrar el juego con datos en lugar de a ojo. Sin este informe el resto de análisis no existe.

**Independent Test**: Ejecutar la orden con un número reducido de carreras y comprobar que termina, no lanza errores y presenta todas las métricas mínimas exigidas.

**Acceptance Scenarios**:

1. **Given** una orden de simulación sin argumentos, **When** se ejecuta, **Then** corre la cantidad por defecto de carreras y muestra un informe con las métricas mínimas.
2. **Given** una orden de simulación con un número concreto (p. ej. 10.000), **When** se ejecuta, **Then** corre exactamente ese número de carreras, las completa todas y muestra el informe.
3. **Given** una simulación en curso, **When** termina, **Then** el informe indica: % que pisa la final, % que no supera cuartos, % que no supera preliminares, distribución de mejor fase, número medio de primeros premios, distribución de premios, duración media, distribución de años de pico, atributos mínimos/máximos/medios.
4. **Given** el mismo número de carreras y la misma semilla base, **When** se repite la orden, **Then** el informe presenta exactamente los mismos números.

---

### User Story 2 - Jugadores y configuraciones variadas (Priority: P2)

Como responsable de balance, quiero que la simulación incluya perfiles de jugador y configuraciones de partida distintas, para cubrir estilos de juego diferentes y no sesgar el informe a un único comportamiento.

**Why this priority**: Un solo perfil (por ejemplo, elegir siempre la primera opción) produce conclusiones falsas sobre la dificultad real. Sin variedad, el informe no es representativo.

**Independent Test**: Ejecutar una simulación con varios perfiles declarados y comprobar que cada perfil aparece reflejado en el informe y que las decisiones tomadas difieren entre perfiles.

**Acceptance Scenarios**:

1. **Given** varios perfiles de jugador definidos, **When** se ejecuta la simulación, **Then** cada carrera se juega con uno de esos perfiles de forma determinista.
2. **Given** configuraciones variadas (modalidad, variante, género, localidad, edad), **When** se ejecuta la simulación, **Then** el informe muestra el agregado global, todas las métricas por perfil de jugador y las métricas principales (mejor fase, premios y duración) por configuración.
3. **Given** una simulación con un único perfil, **When** se ejecuta, **Then** la herramienta lo acepta y lo informa como caso de una sola estrategia.

---

### User Story 3 - Detección de contenido muerto y estados imposibles (Priority: P2)

Como responsable de contenido, quiero que el informe liste las situaciones que nunca se seleccionan, los condicionales que nunca se disparan y los estados que el sistema nunca debería producir, para limpiar el banco y detectar fallos lógicos del motor.

**Why this priority**: Detecta de golpe contenido inalcanzable y combinaciones rotas, que de otro modo pasarían desapercibidos. Es la segunda razón de ser de la herramienta.

**Independent Test**: Ejecutar la simulación sobre el conjunto actual y comprobar que devuelve (a) el ranking de situaciones más y menos frecuentes, (b) la lista de condicionales nunca disparados y (c) la lista de estados imposibles detectados, aunque esté vacía.

**Acceptance Scenarios**:

1. **Given** el banco de situaciones actual, **When** termina la simulación, **Then** el informe ordena las situaciones de más a menos frecuentes y señala las que nunca aparecieron.
2. **Given** los condicionales actuales, **When** termina la simulación, **Then** el informe lista los que nunca se dispararon.
3. **Given** una carrera simulada, **When** se auditan sus estados, **Then** la herramienta señala como "estado imposible" cualquier combinación que contradiga las reglas del juego (por ejemplo, premio ajeno sin haber concursado, temporadas que exceden la duración máxima de carrera, mejor fase inferior a una fase alcanzada en otra temporada, o flags consumidas antes de haber existido).
4. **Given** una simulación sin anomalías, **When** termina, **Then** el informe indica explícitamente que no se detectó ningún estado imposible.

---

### User Story 4 - Resultado exportable y comparable (Priority: P3)

Como responsable de balance, quiero poder guardar el informe de una simulación y compararlo con otro posterior, para medir el efecto de un cambio sin depender de la memoria.

**Why this priority**: Aporta valor cuando se empiece a calibrar, pero el análisis básico funciona sin ello.

**Independent Test**: Ejecutar dos simulaciones y comprobar que sus informes se guardan y que se pueden confrontar sus métricas principales.

**Acceptance Scenarios**:

1. **Given** una simulación terminada, **When** se solicita guardar el informe, **Then** se genera un archivo con las métricas y anomalías de esa corrida.
2. **Given** dos informes guardados, **When** se comparan, **Then** se aprecian las diferencias en las métricas principales (fases, premios, duración y atributos).

---

### Edge Cases

- Número de carreras no válido (cero, negativo, no numérico o enormemente grande): la herramienta debe rechazarlo con un mensaje claro o acotarlo, nunca colgarse ni producir un informe engañoso.
- Carreras que terminan sin haber llegado a la final o sin haber concursado nunca: deben contarse correctamente en las distribuciones y no tratarse como error.
- Atributos que se salen del rango previsto (por encima del máximo o por debajo del mínimo): deben detectarse como posible estado imposible y reflejarse en los mínimos/máximos.
- Bolsa de contenido insuficiente para completar una carrera: debe informarse como error de contenido, no como fallo del simulador.
- Simulación con un solo perfil y una sola configuración: válida, y el informe lo hace explícito.
- Repetición exacta de una corrida con la misma semilla base: resultados idénticos.
- Ejecución larga (decenas de miles de carreras): debe completarse en un tiempo razonable y no agotar memoria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La herramienta MUST poder lanzarse con una única orden, del estilo `npm run simular -- 10000`, aceptando la cantidad de carreras como argumento.
- **FR-002**: En ausencia de argumento, MUST usar una cantidad por defecto de 10.000 carreras.
- **FR-003**: MUST validar el argumento de cantidad (entero positivo y como máximo 100.000) y rechazar valores no válidos con un mensaje claro.
- **FR-004**: MUST generar cada carrera con una semilla distinta derivada de una semilla base, de modo que todas las carreras sean distinguibles entre sí.
- **FR-005**: MUST soportar varios perfiles de jugador (estrategias de decisión) y varias configuraciones de partida (modalidad, variante, género, localidad, edad), combinándolos de forma determinista. Los perfiles por defecto MUST ser tres: aleatorio uniforme, codicioso simple (prioriza los atributos artísticos) y errático (prioriza riesgo/azar).
- **FR-006**: MUST jugar las decisiones de forma automática, sin intervención humana, y completar todas las carreras.
- **FR-007**: MUST recorrer la carrera completa, incluyendo las decisiones de verano y febrero y la participación en el COAC de cada año.
- **FR-008**: MUST informar del porcentaje de carreras que alcanzan la final.
- **FR-009**: MUST informar del porcentaje de carreras que no superan cuartos (mejor fase igual o inferior a cuartos).
- **FR-010**: MUST informar del porcentaje de carreras que no superan preliminares (mejor fase igual a preliminares).
- **FR-011**: MUST informar de la distribución de la mejor fase alcanzada.
- **FR-012**: MUST informar del número medio de primeros premios obtenidos por carrera.
- **FR-013**: MUST informar de la distribución de premios por tipo.
- **FR-014**: MUST informar de la duración media de las carreras (años en activo).
- **FR-015**: MUST informar de la distribución de años de pico.
- **FR-016**: MUST informar de las situaciones más y menos frecuentes (top 10 de cada extremo) y de las que nunca aparecen.
- **FR-017**: MUST informar de los condicionales que nunca se disparan.
- **FR-018**: MUST informar de los valores mínimos, máximos y medios de cada atributo.
- **FR-019**: MUST detectar y listar posibles estados imposibles en las carreras simuladas, entendidos como estados que contradicen las reglas del juego. El catálogo MUST ser el más amplio posible y, como mínimo, MUST comprobar: (1) premio ajeno obtenido sin haber concursado; (2) número de temporadas superior a la duración máxima de carrera; (3) mejor fase inferior a una fase alcanzada en otra temporada; (4) flags consumidas antes de haber existido o sin registro previo; (5) atributos fuera de rango; (6) puesto incoherente con la fase (fuera de la banda de la fase, o presente en una temporada no concursada); (7) temporadas desordenadas, duplicadas o no correlativas; (8) premio cuyo año no corresponde a ninguna temporada concursada; (9) estado de fin incoherente: carrera terminada con temporadas pendientes, o estado `fin` con resultado pendiente o con decisiones del año sin completar; (10) modalidad/variante inválidas o incompatibles entre sí; (11) fase/puesto presentes en una temporada sin haber concursado; (12) composición anual incorrecta (no exactamente una decisión de verano y una de febrero por año, o momento equivocado); (13) incoherencia entre saltar el COAC y el estado de participación. El catálogo es ampliable con cualquier otra incoherencia derivable de las reglas del juego.
- **FR-020**: MUST ejecutarse sin modificar los pesos ni los parámetros de balance del motor.
- **FR-021**: MUST usar únicamente la interfaz pública del motor, sin alterar sus reglas ni su determinismo.
- **FR-022**: MUST ser reproducible: misma semilla base, misma cantidad y mismos perfiles producen el mismo informe.
- **FR-023**: MUST completar 10.000 carreras en menos de 30 segundos en un equipo de desarrollo estándar.
- **FR-024**: MUST informar de forma explícita cuando no detecta anomalías (sin condicionales muertos, sin situaciones inalcanzables y sin estados imposibles).
- **FR-025**: MUST ofrecer el informe en formato legible por consola y MUST poder volcarlo a un archivo JSON con las mismas métricas y anomalías. La comparación entre informes es OPCIONAL: no se exige una herramienta propia de comparación, basta con que los informes exportados sean comparables.
- **FR-026**: MUST NOT exponer, en ninguna salida dirigida al jugador, el techo oculto ni los datos internos del destino; su acceso, de existir, queda restringido al diagnóstico de balance. El informe de simulación es una herramienta interna de desarrollo y MUST NOT formar parte del código compartible de la partida ni de la interfaz del jugador.
- **FR-027**: MUST reportar los errores de contenido o de motor encontrados durante la simulación de forma agregada y localizable (tipo de error y número de veces), sin abortar silenciosamente. Ante un error en una carrera, MUST continuar con el resto de la corrida y terminar con un código de salida distinto de cero si se produjo alguno.
- **FR-028**: MUST presentar el informe con agregado global, todas las métricas por perfil de jugador y las métricas principales (mejor fase, premios y duración) por configuración de partida.

### Key Entities *(include if feature involves data)*

- **Corrida de simulación**: una ejecución concreta de la herramienta; se define por cantidad de carreras, semilla base, conjunto de perfiles y configuraciones. De ella sale un informe y un conjunto de anomalías.
- **Perfil de jugador**: estrategia automática de decisión (por ejemplo, aleatoria uniforme, o sesgada hacia un tipo de atributo) con la que se juegan las decisiones.
- **Configuración de partida**: combinación inicial del personaje y de la modalidad/variante con la que arranca una carrera.
- **Carrera simulada**: resultado de una partida completa: semilla, perfil, configuración, evolución por año (fase, puesto, premios, atributos), mejor fase, duración y datos de diagnóstico.
- **Informe**: resumen agregado de una corrida con todas las métricas mínimas exigidas.
- **Anomalía**: hallazgo del análisis; puede ser situación nunca seleccionada, condicional nunca disparado o estado imposible, con su descripción localizable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede obtener el informe completo de balance con una sola orden, sin editar código ni encadenar pasos manuales.
- **SC-002**: El informe de una corrida incluye el 100% de las métricas mínimas exigidas en esta especificación.
- **SC-003**: 10.000 carreras se completan en menos de 30 segundos y sin ninguna carrera abortada.
- **SC-004**: Repetir una corrida con la misma semilla base, cantidad y perfiles produce exactamente los mismos números.
- **SC-005**: El informe identifica el 100% de las situaciones que nunca aparecen y de los condicionales que nunca se disparan para el banco que se esté usando.
- **SC-006**: Ante una configuración de contenido con un problema conocido, el informe señala el estado imposible correspondiente en el 100% de los casos, sin falsos negativos.
- **SC-007**: Cambiar entre dos corridas de calibración comparables permite observar la variación de las métricas principales sin herramientas externas.
- **SC-008**: Un cambio de balance no requiere tocar la herramienta: se recalibran parámetros y se vuelve a lanzar la misma orden.

## Assumptions

- Es una herramienta de desarrollo y balance: no se sirve al jugador ni forma parte del bucle jugable.
- La ejecución es local, desde la línea de órdenes, con el runtime y las dependencias ya previstos por el proyecto.
- "No supera una fase" significa que la mejor fase alcanzada es igual o anterior a esa fase.
- "Primeros premios" se interpreta como el número de temporadas en que la carrera obtiene el primer puesto del COAC (puesto 1 en la final); los demás "premios" son los premios ajenos al concurso, contados por tipo.
- El número por defecto de carreras es 10.000 y el máximo aceptado es 100.000, para evitar abusos.
- Mientras el banco real de contenido no exista, la herramienta trabaja con el banco disponible; su diseño no debe depender de un banco concreto.
- Los perfiles de jugador por defecto son tres (aleatorio uniforme, codicioso simple y errático) y las configuraciones son un conjunto por defecto declarado; no se espera que el usuario escriba perfiles nuevos en esta fase.
- El informe se presenta en texto legible por la consola y puede volcarse a un archivo JSON con el mismo contenido; el formato de máquina es comparable pero no se implementa una herramienta de diff propia.
- El techo oculto y el resto del destino pueden inspeccionarse para diagnóstico de balance, pero nunca se divulgan en productos dirigidos al jugador.
- No entra en esta fase la calibración de dificultad ni el cambio de pesos: llegarán en una fase posterior usando este mismo informe.
