# Phase 0 — Research: Layout estable del bucle jugable

No hay incógnitas `NEEDS CLARIFICATION` en el Technical Context. Se documentan las decisiones de
diseño derivadas de la spec y de las clarificaciones del 2026-09-30 (segunda ronda incluida).

## R1. Estabilidad posicional con centrado visual

- **Decision**: La sección de decisión contiene **solo situación + opciones** y se centra en el
  medio con un **bloque de altura reservada constante**; dentro, el título y cada opción ocupan
  **bloques de altura fija**.
- **Rationale**: garantiza que título, primera y segunda opción no se muevan con distinto texto,
  momento/tipo ni número de opciones, y a la vez cumple el requisito de "centrado pero fijo".
  Sustituye el centrado actual (`justify-content: center` sobre contenido de altura variable), que
  es la causa raíz del salto entre verano y febrero.
- **Alternatives considered**: centrado natural (rompe la estabilidad, preguntado y descartado);
  scroll interno / recorte / autoajuste de fuente (descartados en clarificación).

## R2. Indicador como overlay en la esquina superior izquierda

- **Decision**: El indicador sale del `section[data-testid="decision"]` y se renderiza como
  **overlay fijo** en la esquina superior izquierda de `main`, simétrico al sol/luna de la derecha
  (fondo de la feature 015). Se muestra en **decisión y resultado**.
- **Rationale**: libera espacio vertical para situación y opciones, alinea el indicador entre
  pantallas por construcción y encaja con la metáfora visual existente (sol/luna arriba a la
  derecha).
- **Alternatives considered**: franja superior con indicador + encabezado (descartada en
  clarificación); solo en decisión (descartada: el resultado debe conservar año y momento).

## R3. Opciones con 2 o 3 elementos

- **Decision**: La lista reserva filas de **altura fija**; el bloque reserva el máximo de opciones
  del banco (hoy 2, diseño hasta 3). La primera y la segunda fila quedan a offset fijo desde el
  inicio de la lista.
- **Rationale**: FR-003 exige anclar la primera y la segunda; `schema.ts` admite `min(2)` y el banco
  actual usa 2. Reservar el máximo evita que la altura del bloque cambie si aparece una tercera.
- **Alternatives considered**: altura proporcional al número de opciones → desplazaría el bloque
  centrado.

## R4. Contenido que no cabe en su bloque

- **Decision**: Los bloques se dimensionan con el **caso más largo del banco**; el contenido se
  escribe para caber. Una comprobación E2E falla si un bloque desborda.
- **Rationale**: la spec prohíbe scroll, recorte y autoajuste (FR-007) y exige recalibrar el bloque
  o acortar el texto si el banco crece (FR-013). En el banco actual `texto: ""` en todas las
  situaciones, así que el riesgo está en títulos y subtítulos.
- **Alternatives considered**: `overflow: hidden` (recorta) y `min-height` (crece) → descartados.

## R5. Eliminación total del tipo

- **Decision**: El indicador muestra solo **año · momento**. Se elimina el texto del tipo y el
  atributo `data-tipo` del DOM. `etiquetaTipo` se conserva en `presentacion.ts` porque `mensajeError`
  sigue usándola.
- **Rationale**: petición explícita (FR-014). Mantener una función no usada por la UI no viola YAGNI
  porque sigue teniendo un consumidor (mensajes de error).
- **Impacto en tests**: `tests/e2e/carrera-completa.spec.ts` localiza el indicador dentro de
  `[data-testid="decision"]` y lee `data-tipo`; hay que actualizar el selector (el indicador ya no
  está en la sección) y sustituir la aserción de tipos por otra comprobación (p. ej. número de
  decisiones) o mover el invariante a un test unitario.

## R6. Resultado diferido

- **Decision**: La pantalla de resultado se rediseñará más adelante. En esta feature solo se exige
  que el **indicador** (año y momento) se mantenga alineado con las decisiones.
- **Rationale**: clarificación del usuario; evita forzar la alineación del encabezado del acta con
  el título centrado de decisión.
- **Alternatives considered**: mantener la exigencia de alinear el encabezado (descartada).

## R7. Medición en tests (tolerancia 2 px)

- **Decision**: En Playwright, medir `boundingBox()` del indicador, título, primera y segunda opción
  tras `networkidle` (fuentes cargadas); tolerancia ≤ 2 px entre pantallas y **0 px** al alternar
  verano↔febrero.
- **Rationale**: la animación de entrada `entrar` (`translateY(0.5rem)`, 280 ms) altera la posición
  durante la transición; hay que medir con la animación terminada. El umbral absorbe el redondeo
  subpíxel.
- **Alternatives considered**: medir durante la animación (falsos positivos); umbral 0 entre
  pantallas (frágil).

## R8. Tokens de layout

- **Decision**: Añadir tokens en `src/ui/tokens.css`: `--alto-titulo`, `--alto-texto`,
  `--alto-opcion`, `--alto-bloque-decision`, `--indicador-arriba`, `--indicador-izquierda`,
  `--tamano-indicador`.
- **Rationale**: centraliza la calibración (FR-013) y evita números mágicos; respeta el sistema de
  diseño de 012.
- **Alternatives considered**: valores literales por componente (difíciles de recalibrar).

## R9. Sin nuevas dependencias ni JS

- **Decision**: Solo CSS + estructura de la isla; ningún cambio en `package.json`.
- **Rationale**: Principio IV y FR-010; el bucle ya es una única isla Svelte.
- **Alternatives considered**: librerías de layout / ResizeObserver → innecesarias.
