# Feature Specification: Curva de carrera y variedad de resultados

**Feature Branch**: `013-career-arc`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "He jugado 2 partidas seguidas en las que en una he quedado en la posición 17 muchas veces seguidas y en la otra en la posición 5 muchas veces seguidas. ¿Por qué sucede esto? ¿Cómo funciona el algoritmo? No es un comportamiento que deseemos, ya que eso no es divertido para el usuario. ¿Puede ser que sea por el tema del techo, que una vez que se llega al techo se queda ahí? Pero deberíamos cambiarlo, propónme soluciones."

> **Contexto verificado en el motor**: la hipótesis del usuario es **correcta**. La puntuación de cada año parte de unos atributos que ya no cambian (feature 008) y el azar anual se mueve en una banda estrecha; el nivel alcanzado se recorta contra el techo oculto y la posición dentro del nivel se satura en el extremo de la banda. Resultado: en una carrera con techo de preliminares la posición es siempre 17, y con techo de semifinales es siempre 5. Además `semifinales` concentra el 47 % de los techos, así que casi la mitad de las partidas viven el mismo año veinte veces. La carrera no tiene arco: empieza ya en su techo y se queda ahí. Esto contradice `docs/01` §7 ("empezar humilde → ascender → declive").
>
> **Corrección durante la planificación (2026-09-21)**: una versión previa de esta spec proponía reequilibrar los pesos del techo para que ningún nivel superara el 25 %. Se comprobó que esos pesos **son** los que materializan la distribución objetivo de `docs/01` §7 (7/3/47/16/18/9 ⇒ P(no pasa de cuartos) 10 %, P(pisa la final) 43 %, P(gana un primer premio) 27 %), de modo que tocarlos habría roto la dificultad. El fallo no estaba en el reparto de techos sino en que todas las carreras con el mismo techo eran idénticas. Los pesos **no se tocan**; SC-005 y FR-008 se reformulan en consecuencia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Que cada año se sienta distinto (Priority: P1)

Quien juega recorre su carrera y nota que los años no son el mismo año repetido: la posición cambia, hay años buenos y años flojos, y una racha se rompe en pocos años. Deja de ver "17, 17, 17, 17…" o "5, 5, 5, 5…".

**Why this priority**: es la queja directa y lo que hace que la partida parezca rota. Sin esto, lo demás no se percibe.

**Independent Test**: jugar una carrera completa y comprobar, año a año, que la posición deja de repetirse de forma indefinida; verificable también sobre miles de partidas simuladas contando rachas.

**Acceptance Scenarios**:

1. **Given** una carrera en curso, **When** se encadenan las temporadas, **Then** la misma posición no se repite un número ilimitado de años seguidos.
2. **Given** una carrera terminada, **When** se lee su historial de resultados, **Then** contiene varias posiciones distintas y no una sola.
3. **Given** dos carreras con el mismo techo, **When** se comparan sus resultados, **Then** no son la misma secuencia repetida.

---

### User Story 2 - Que la carrera cuente una historia (Priority: P2)

La carrera tiene forma: se empieza humilde, se asciende, hay un mejor momento y al final se declina. El año pico se nota. Hay variedad de arcos: ascensos rápidos, reconocimiento tardío y algún caso raro de éxito temprano.

**Why this priority**: es el arco que `docs/01` §7 exige y lo que convierte una lista de resultados en un relato compartible. Depende de que exista variedad, pero no se reduce a ella.

**Independent Test**: simular muchas carreras y comprobar que en la mayoría el mejor tramo llega después del arranque y que existe un declive final.

**Acceptance Scenarios**:

1. **Given** una carrera cualquiera, **When** se miran sus resultados en orden, **Then** el mejor tramo no coincide con los primeros años en la mayoría de los casos.
2. **Given** una carrera con un año pico marcado, **When** se llega a ese año, **Then** el resultado lo refleja de forma perceptible.
3. **Given** muchas carreras simuladas, **When** se agrupan por forma, **Then** aparecen tanto ascensos rápidos como tardíos y algún éxito temprano raro.

---

### User Story 3 - Que el techo siga siendo un techo (Priority: P3)

El techo oculto sigue sin verse y sigue significando "hasta dónde puedes llegar en tu mejor momento", no "el sitio donde te sientas desde el primer año". Alcanzarlo es un logro, no el punto de partida.

**Why this priority**: preserva la promesa del juego (techo oculto, nunca mostrado) y evita que la variedad se consiga simplemente subiendo a todo el mundo.

**Independent Test**: comprobar que la dificultad agregada no se ha ablandado y que el techo se toca en los mejores momentos, no en todos los años.

**Acceptance Scenarios**:

1. **Given** una carrera con techo bajo, **When** avanza, **Then** sus resultados varían dentro de su banda sin alcanzar cotas que su techo no permite.
2. **Given** una carrera con techo alto, **When** llega su mejor momento, **Then** alcanza su techo; fuera de ese momento, no descansa en él.
3. **Given** cualquier carrera, **When** el jugador la comparte, **Then** el techo sigue sin aparecer en ningún dato visible ni en el código compartido.

---

### Edge Cases

- **Carreras de techo mínimo** (las que nunca pasan de preliminares): deben seguir contando algo —variación dentro de la banda baja— en vez de veinte años en el mismo puesto.
- **Años sin concursar**: no cuentan como racha ni como posición.
- **Premio excepcional o milagro**: los mecanismos raros (batacazo, milagro, crack) deben seguir existiendo y notándose.
- **Partida guardada de una versión anterior**: debe descartarse de forma amable con el aviso ya existente, sin romper la experiencia.
- **Carrera con muy pocas temporadas jugadas**: el arco debe leerse igual con carreras cortas.
- **La tarjeta final**: debe seguir siendo coherente con los resultados (trayectoria, premios, hitos y frase de cierre).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El resultado de cada temporada MUST variar respecto al de los años inmediatamente anteriores; la repetición indefinida de una misma posición MUST ser un caso imposible o extremadamente raro.
- **FR-002**: Las rachas (varios años seguidos en resultados parecidos) MUST existir y MUST romperse en pocos años, para que se perciban como racha y no como estancamiento.
- **FR-003**: La carrera MUST seguir la forma de arco de `docs/01` §7 (inicio humilde → ascenso → mejor momento → declive) en la mayoría de las partidas.
- **FR-004**: El año pico MUST tener un efecto perceptible en el resultado de esa temporada.
- **FR-005**: MUST existir variedad de arcos: ascensos rápidos, ascensos lentos, reconocimiento tardío y una minoría de éxitos tempranos.
- **FR-006**: El techo oculto MUST seguir siendo un límite no visible, alcanzable en el mejor momento de la carrera y no un valor en el que se permanezca de forma continuada.
- **FR-007**: La dificultad agregada MUST mantenerse alineada con la distribución objetivo de `docs/01` §7.
- **FR-008**: Dos carreras con el mismo techo MUST diferenciarse: compartir el techo no puede implicar compartir la secuencia de resultados.
- **FR-009**: El resultado MUST seguir siendo determinista: la misma semilla con las mismas decisiones MUST producir exactamente la misma carrera, incluida la secuencia de resultados temporada a temporada.
- **FR-010**: El estado MUST seguir siendo serializable y sin clases, y el techo MUST seguir sin serializarse en el código compartible.
- **FR-011**: La variación MUST NOT provenir de las decisiones del jugador: los efectos de las decisiones sobre el resultado siguen fuera de alcance (no se reabre C15).
- **FR-012**: El cambio MUST venir acompañado de pruebas que verifiquen determinismo, forma del arco, longitud de rachas, diversidad de carreras y distribución agregada.
- **FR-013**: Las pruebas MUST ser capaces de detectar la regresión concreta: una carrera con la misma posición repetida durante toda su duración MUST fallar.
- **FR-014**: Los premios ajenos al COAC MUST seguir resolviéndose de forma independiente cada año.

### Key Entities

- **Carrera**: conjunto ordenado de temporadas con una duración fija; tiene una forma (arco) reconocible.
- **Temporada**: un año con su fase alcanzada, su posición y sus premios; es la unidad que debe variar.
- **Techo oculto**: límite superior interno de la carrera, nunca visible ni compartible.
- **Año pico**: el año en que la carrera alcanza su mejor momento; debe notarse.
- **Racha**: sucesión corta de temporadas con resultados parecidos; debe existir y romperse.
- **Forma del arco**: la silueta de la carrera a lo largo del tiempo (ascenso, pico, declive).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En al menos el **90 %** de las carreras simuladas, la racha más larga con la **misma posición** no supera **4 años**, y en ninguna supera **8**.
- **SC-002**: Cada carrera muestra de media **6 o más posiciones distintas** (hoy muestra 1 o 2).
- **SC-003**: En al menos el **60 %** de las carreras, el mejor tramo de tres años es **posterior al primer tercio**, es decir, hay ascenso visible. (Umbral corregido al medir: `docs/01` §7 pide **también** ascensos rápidos —pico en el año 5-6— y éxitos tempranos, así que una parte de las carreras pica en el primer tercio a propósito. El motor anterior daba ~0 %.)
- **SC-004**: La distribución agregada se mantiene dentro de **±3 puntos porcentuales** de la tabla objetivo de `docs/01` §7.
- **SC-005**: Compartir techo no es compartir carrera: **dentro de un mismo nivel de techo**, la secuencia de resultados más repetida no supera el **5 %** de las carreras de ese nivel. (Nota: los pesos del techo **no** se cambian; son los que materializan la distribución objetivo de `docs/01` §7 — P(preliminares) 7 %, P(cuartos) 3 %, P(≥ final) 43 %, P(≥ podio) 27 %.)
- **SC-006**: El **100 %** de las carreras simuladas es reproducible: misma semilla y mismas decisiones devuelven la misma secuencia de resultados.
- **SC-007**: Las **cinco secuencias de resultados más frecuentes** no superan en conjunto el **15 %** de las carreras.
- **SC-008**: Una carrera con la misma posición durante toda su duración **no puede generarse** (la comprobación falla si ocurre).

## Assumptions

- **C15 permanece cerrada**: las decisiones siguen sin afectar al resultado. Hacer que el jugador "decida" su carrera sería otra feature.
- **No se toca el contenido**: ni las situaciones, ni las condicionales, ni el banco. Se recalibran parámetros del motor.
- **No cambian duración ni cadencia**: 20 años de carrera y 2 decisiones por año se mantienen (siguen siendo parametrizables).
- **El mecanismo es decisión del plan**: la spec fija el comportamiento observable (arco, variedad, rachas, techo aspiracional). Cómo se consigue —curva de carrera, memoria entre años, reequilibrio del techo, forma de repartir la posición— se decide en el plan y se calibra con el simulador masivo.
- **La calibración se hace con el simulador**, nunca tocando las situaciones (`docs/01` §7, constitución III).
- **La interfaz no cambia**: ni el bucle jugable ni la tarjeta necesitan rediseño; se alimentan de los mismos datos.
- **Subir la versión de partida es aceptable**: las partidas guardadas antiguas se descartan con el aviso ya existente y se ofrece empezar de cero.
- **Objetivo del cambio**: que la partida sea divertida y contable. Un resultado plano y repetido es el fallo a eliminar.
