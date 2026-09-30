# Phase 1 — Data Model: Layout estable del bucle jugable

Esta feature no introduce datos de juego ni persistencia. El "modelo" es el **modelo de layout**
(overlay del indicador, bloque de decisión, bloques fijos y tokens) que la UI debe respetar.

## Entidades de layout

### Indicador de contexto

Overlay fijo en la esquina superior izquierda del área de juego.

| Campo | Tipo | Descripción | Regla |
|-------|------|-------------|-------|
| `contenido` | texto | `Año {n} · {momento}` | Sin tipo (FR-014) |
| `pantallas` | `decisión, resultado` | Dónde aparece | Ambas (FR-006) |
| `posicion` | esquina superior izquierda | Fija, simétrica al sol/luna | Constante entre pantallas (FR-001) |
| `tamano` | token | Algo mayor que el actual | Contraste AA (FR-015) |

**Validación**: no expone `data-tipo` ni texto de tipo; su posición no varía entre decisión y
resultado (tolerancia 2 px).

### Bloque situación + opciones

Unidad centrada verticalmente en la pantalla de decisión.

| Campo | Tipo | Descripción | Regla |
|-------|------|-------------|-------|
| `altura` | token `--alto-bloque-decision` | Altura reservada constante | No depende del texto ni del nº de opciones (FR-006b) |
| `centrado` | vertical, en el medio | Posición visual | No altera los anclajes internos |
| `hijos` | título + lista de opciones | Contenido | Solo situación y opciones (FR-006b) |

**Validación**: `y` de sus elementos internos constante entre decisiones.

### Bloque fijo

Área de tamaño constante destinada a un elemento dentro del bloque de decisión.

| Bloque | Contenido | Altura | Siempre presente |
|--------|-----------|--------|------------------|
| `titulo` | `h2` de la situación | `--alto-titulo` | sí |
| `opcion` | `li` con título + subtítulo | `--alto-opcion` | primera y segunda; tercera opcional |

**Validación**:
- La altura del título es constante → el anclaje no depende del texto (FR-002).
- La lista reserva al menos dos filas → `opcion1`/`opcion2` fijas con 2 o 3 opciones (FR-003).
- Ningún bloque desborda su altura (FR-007): se comprueba el desborde real de los descendientes
  (no `scrollHeight`); en las opciones se permite rebasar la caja si no se solapa la siguiente.

## Tokens de layout (extensión de `src/ui/tokens.css`)

| Token | Valor | Uso previsto |
|-------|-------|--------------|
| `--alto-titulo` | `8rem` | Altura del bloque del título (máx. 4 líneas a 1.6rem; ~122 px con fuente de reserva) |
| `--alto-texto` | `0rem` | Altura reservada del texto descriptivo (hoy vacío en todo el banco) |
| `--alto-opcion` | `6.25rem` | Altura de cada opción (reserva título 2 líneas + descripción 2 líneas) |
| `--alto-opciones` | `calc(3 * var(--alto-opcion) + 2 * var(--esp-3))` | Reserva de 3 filas de opción (máximo del banco) |
| `--alto-bloque-decision` | `calc(titulo + texto + esp-4 + opciones)` | Altura total del bloque situación + opciones (constante) |
| `--indicador-centro` | `9%` | Altura del centro del indicador (coincide con el centro del sol/luna) |
| `--indicador-izquierda` | `var(--esp-4)` | Separación izquierda del indicador overlay |
| `--tamano-indicador` | `1.25rem` | Tamaño de fuente del indicador (mayor que el anterior `--texto-sm` de 0.875rem) |

**Validación**: los valores se calibraron midiendo el peor caso del banco a 320 px con margen. El
título de la decisión se limita a **1.6rem** para que el texto más largo quepa en **4 líneas**
(~117,7 px con Anton; ~122 px con la fuente de reserva durante la carga), de ahí la reserva de
`8rem`. En la opción, el título (1.2rem) y la descripción (1rem) reservan **2 líneas cada uno** con
altura fija y el contenido se centra, de modo que la descripción no desplaza el título; la caja mide
`6.25rem` y una descripción excepcional de 3 líneas se sale hacia el padding sin solapar la opción
siguiente. Un cambio de banco que requiera más espacio obliga a recalibrar el token o acortar el
texto (FR-013); la lista reserva **3 filas** porque el banco admite hasta 3 opciones.

## Relaciones

- `main` (área de juego) contiene: el **overlay del indicador** (absoluto) y la **sección de la
  pantalla** (en flujo).
- `bloque situación+opciones` = `bloque título` + `lista de opciones` (alturas fijas/reservadas).
- `indicador` es el **único elemento común** entre decisión y resultado.

## Transiciones de estado

No hay máquina de estados nueva. El layout es el mismo para toda situación (`verano`/`febrero`,
contenido/personaje). La única diferencia es el estilo de color por pantalla (feature 015), que no
afecta a las alturas.

## Fuera de modelo

- No se modela el contenido (sigue en `content`, validado por Zod).
- No se modela la partida ni sus atributos (sigue en `engine`).
- El tipo de decisión sigue existiendo en el paso del motor, pero **no se proyecta a la UI**.
