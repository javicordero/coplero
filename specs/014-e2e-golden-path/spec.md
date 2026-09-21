# Feature Specification: Recorrido E2E de una carrera completa (E2E-001)

**Feature Branch**: `014-e2e-golden-path`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Implementa E2E-001. Crea tests Playwright para: 1. entrar en /jugar 2. crear personaje 3. elegir modalidad 4. elegir variante 5. completar varias decisiones 6. completar una carrera 7. comprobar que aparece tarjeta final 8. recargar y recuperar partida 9. generar código compartible 10. abrir /r/[codigo]"

> **Contexto verificado en el repo**: hoy los diez hitos existen dispersos entre `tests/e2e/jugar.spec.ts` (crear, decidir, completar carrera, recargar) y `tests/e2e/compartir.spec.ts` (tarjeta, enlace, `/r/[codigo]`), pero **no hay una prueba que recorra el viaje entero de principio a fin en una sola ejecución**. E2E-001 es esa prueba de humo integrada del camino feliz: la que responde "¿sigue funcionando el juego completo?" cuando toca motor, contenido o interfaz. La semilla de partida es aleatoria en producción (`crypto.randomUUID`), de modo que la prueba verifica **el flujo y la estructura**, nunca posiciones ni premios concretos.

## Clarifications

### Session 2026-09-21

- Q: ¿E2E-001 debe cubrir la recarga con la carrera ya terminada además de la de mitad de carrera? → A: Solo la recarga a mitad de carrera; la recarga tras el fin queda fuera de alcance.
- Q: ¿E2E-001 debe cubrir la generación del enlace con el nombre oculto? → A: No; queda fuera de alcance y ya lo cubre `compartir.spec.ts`.
- Q: ¿Cómo se verifica el límite de tiempo del recorrido (SC-004)? → A: Se mide y se anota la duración real en `quickstart.md`, sin aserción dura.
- Q: ¿Cómo se verifica que la prueba no hace peticiones externas (SC-005)? → A: Con un listener de peticiones que falla ante cualquier origen distinto del servidor local.
- Q: ¿Cómo se trata el requisito de ejecución «en integración continua» (FR-014)? → A: Se reformula a «compatible con CI (T12, hoy diferida)», sin exigir que exista.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - El viaje completo de principio a fin (Priority: P1)

Quien mantiene Coplero quiere una única prueba que abra `/jugar`, cree un personaje, elija modalidad y variante, atraviese varias decisiones, complete la carrera entera y confirme que aparece la tarjeta final. Si un cambio rompe cualquier eslabón del camino feliz, esta prueba lo señala.

**Why this priority**: es el corazón de E2E-001 y el mayor valor: demuestra que el juego se puede jugar de principio a fin tras cualquier cambio. Cubre los hitos 1–7.

**Independent Test**: ejecutar solo esta prueba sobre la app construida y comprobar que recorre los siete primeros hitos y termina en verde.

**Acceptance Scenarios**:

1. **Given** la app arrancada y sin partida previa, **When** se abre `/jugar` y se pulsa empezar, **Then** se accede a la creación de personaje.
2. **Given** la pantalla de creación, **When** se introduce un nombre y se confirma, **Then** la app pasa a la elección de modalidad y después a la de variante.
3. **Given** una partida en curso, **When** se avanza por las decisiones y los resultados de cada año, **Then** el recorrido progresa sin quedarse atascado en ninguna pantalla del bucle.
4. **Given** una carrera completada, **When** se llega al final, **Then** aparece la tarjeta final con el nombre del personaje.

---

### User Story 2 - La partida sobrevive a una recarga (Priority: P2)

Quien juega cierra la pestaña o recarga a mitad de carrera y, al volver, puede continuar exactamente donde lo dejó. La prueba lo comprueba recargando y recuperando la carrera en curso.

**Why this priority**: el guardado local es una promesa central del producto; una regresión aquí hace perder carreras enteras. Cubre el hito 8.

**Independent Test**: jugar unos años, recargar la página y comprobar que se ofrece continuar y que se retoma la partida guardada.

**Acceptance Scenarios**:

1. **Given** una carrera empezada y con avance guardado, **When** se recarga la página, **Then** se ofrece continuar la partida.
2. **Given** la oferta de continuar, **When** se acepta, **Then** se retoma la carrera en el mismo punto observable en que se dejó, sin volver a empezar.

---

### User Story 3 - El resultado se comparte y se reproduce (Priority: P3)

Quien termina su carrera genera un enlace para compartirlo y, al abrirlo otra persona (o él mismo en otro dispositivo), ve la misma tarjeta. La prueba cubre la generación del enlace y su apertura en `/r/[codigo]`.

**Why this priority**: compartir es el mecanismo de viralidad del juego; sin él, la tarjeta no cumple su función. Cubre los hitos 9–10.

**Independent Test**: terminar una carrera, obtener el enlace compartible y abrirlo en un contexto limpio para comprobar que reproduce la tarjeta del mismo personaje.

**Acceptance Scenarios**:

1. **Given** una carrera terminada con tarjeta visible, **When** se genera el enlace compartible, **Then** el enlace apunta a una ruta de resultado con código.
2. **Given** un enlace compartible, **When** se abre en un contexto sin partida previa, **Then** se reproduce la tarjeta del mismo personaje.

---

### Edge Cases

- **Semilla aleatoria**: cada partida usa una semilla distinta; la prueba NO puede fijar posiciones, premios ni años concretos, solo el flujo y la estructura.
- **Pantallas intermedias del bucle**: además de las decisiones, la carrera muestra resultados anuales y puede pedir un cambio de variante; la prueba debe resolver cualquier pantalla que aparezca en vez de asumir una única transición.
- **Recarga a mitad de carrera**: recargar durante el bucle debe ofrecer «Continuar» y retomar el mismo punto observable. La recarga con la carrera ya terminada (botón «Ver resultado») queda **fuera de alcance** de E2E-001; ya la cubren los tests de persistencia (feature 005).
- **Contexto limpio al abrir el enlace**: el enlace debe abrirse sin arrastrar la partida guardada anterior, para que lo que se vea sea lo que el código codifica.
- **Nombre oculto al compartir** *(fuera de alcance de E2E-001)*: la generación del enlace con el nombre oculto ya está cubierta por `compartir.spec.ts`; E2E-001 no oculta el nombre.
- **Sin red**: ni el recorrido ni el enlace dependen de servicios externos.
- **Fallo diagnóstico**: si un hito no se alcanza, la prueba debe indicar en cuál se quedó y no fallar de forma genérica por tiempo agotado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir una prueba automatizada de recorrido completo que parta de `/jugar` sin partida previa y cubra los diez hitos de E2E-001 en una sola ejecución.
- **FR-002**: La prueba MUST crear un personaje con nombre y confirmarlo, y MUST comprobar que se accede a la elección de modalidad.
- **FR-003**: La prueba MUST elegir una modalidad y comprobar que se accede a la elección de variante.
- **FR-004**: La prueba MUST elegir una variante y comprobar que la carrera arranca.
- **FR-005**: La prueba MUST completar varias decisiones, incluyendo al menos una de contenido y una de personaje, a lo largo de varios años.
- **FR-006**: La prueba MUST completar la carrera entera resolviendo todas las pantallas intermedias del bucle (decisiones, resultados anuales y posibles cambios de variante) hasta el final.
- **FR-007**: Al terminar, la prueba MUST comprobar que aparece la tarjeta final y que contiene el nombre del personaje.
- **FR-008**: La prueba MUST recargar la página a mitad de carrera y comprobar que se ofrece continuar y que la partida se retoma en el mismo punto observable.
- **FR-009**: La prueba MUST generar el enlace compartible y comprobar que apunta a una ruta de resultado con código.
- **FR-010**: La prueba MUST abrir el enlace compartible en un contexto sin partida previa y comprobar que reproduce la tarjeta del mismo personaje.
- **FR-011**: La prueba MUST ser determinista en su veredicto: las mismas decisiones producen el mismo resultado observable, con independencia de la semilla aleatoria de la partida.
- **FR-012**: La prueba MUST NOT depender de valores concretos de posición, fase, premios o número de años, salvo las garantías estructurales que el juego promete (por ejemplo, que la tarjeta final siempre aparece).
- **FR-013**: La prueba MUST fallar de forma diagnóstica, indicando el hito concreto que no se alcanzó.
- **FR-014**: La prueba MUST ejecutarse en el arnés de pruebas del proyecto, en modo headless y sin requerir red ni servicios externos; MUST ser **compatible con una futura integración continua** (T12, hoy diferida), sin exigir que esta exista.
- **FR-015**: La prueba MUST NOT romper ni degradar las pruebas E2E existentes; puede compartir utilidades con ellas.
- **FR-016**: La prueba MUST abarcar los diez hitos solicitados y hacer explícito, al leer su resultado, cuáles se han verificado.
- **FR-017**: La prueba MUST usar esperas por estado observable del juego y evitar esperas fijas o frágiles; su tiempo total MUST mantenerse acotado.

### Key Entities

- **Partida**: carrera en curso con personaje, modalidad, variante y avance; es lo que se guarda y se recupera.
- **Personaje**: nombre/apodo y datos de creación; aparece en la tarjeta final.
- **Carrera / temporada**: secuencia de años con decisiones y resultados; tiene una duración fija.
- **Pantalla del bucle**: cada paso observable del juego (decisión, resultado, cambio de variante, fin); la prueba las resuelve sin asumir orden fijo.
- **Tarjeta final**: resumen compartible de la carrera; contiene el nombre y los hitos.
- **Enlace compartible / código**: representación de la tarjeta que viaja en la URL y se reproduce en `/r/[codigo]`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Existe una prueba que recorre los **10 de 10** hitos de E2E-001 en una sola ejecución y pasa con la aplicación actual.
- **SC-002**: La prueba detecta la rotura de cualquiera de los diez hitos: al desactivar o alterar un hito, la prueba falla señalando ese hito (verificado forzando al menos una rotura representativa).
- **SC-003**: La prueba es reproducible: **5 ejecuciones consecutivas** dan el mismo veredicto, con o sin semilla distinta.
- **SC-004**: Una ejecución completa termina en menos de **60 segundos** en local y no supera el tiempo máximo que el arnés permite por prueba. La duración real se **mide y se anota** en `quickstart.md` (sin aserción dura, para no acoplar la prueba al hardware de CI).
- **SC-005**: La prueba no realiza peticiones de red a servicios externos durante el recorrido; se comprueba con un **listener de peticiones** que falla ante cualquier origen distinto del servidor local.
- **SC-006**: Las pruebas E2E existentes siguen pasando sin cambios ni pérdida de cobertura.
- **SC-007**: El fallo de la prueba identifica en su mensaje el hito no alcanzado (por ejemplo, "no se llegó a la tarjeta final").

## Assumptions

- **Es una prueba de verificación, no una feature de producto**: no cambia el motor, ni el contenido, ni el comportamiento del juego. Si el recorrido descubre un fallo real, se registra en el backlog y se decide aparte.
- **Playwright es el arnés aprobado** por el stack cerrado del proyecto (constitución y `docs/02`); esta spec describe el recorrido observable y deja la mecánica de la prueba al plan.
- **La semilla es aleatoria en producción**; la prueba verifica flujo y estructura, no resultados concretos. No se introduce un control de semilla solo para el test salvo que el plan lo justifique.
- **Recorrido con primeras opciones**: como en los E2E existentes, la prueba elige la primera opción disponible en cada decisión; no busca maximizar ni forzar un desenlace.
- **Puntos de anclaje existentes**: la prueba se apoya en los atributos observables ya usados por los E2E (pantalla actual, `data-testid`, marca) y solo añade el mínimo anclaje que falte.
- **Duración de carrera fija y sin red**: el bucle avanza dentro de una sola página sin cargas entre pantallas, lo que permite recorrerlo con esperas por estado.
- **Fuera de alcance**: casos de error (código inválido, guardado corrupto) y auditorías de accesibilidad, que ya tienen sus propias pruebas; E2E-001 cubre únicamente el camino feliz completo.
- **Un solo hito por ejecución**: la prueba es un recorrido lineal único, no una batería de casos independientes; cualquier ampliación se registra como prueba aparte.
