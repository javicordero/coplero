# Phase 0 — Research: Pantalla de selección de modalidad y cabecera estable del flujo previo

## R1. Cómo fijar la posición del título y el subtítulo entre pantallas

**Decision**: **cabecera anclada arriba con altura natural** (`.pantalla__cabecera`) y **cuerpo justo debajo con un gap fijo** (`margin-top: var(--esp-5)`), dentro de una sección anclada arriba (`justify-content: flex-start`) con padding superior fijo. Así la parte superior del título cae siempre en la misma `y` con independencia del contenido y del alto de la ventana.

**Rationale**: es la solución más simple que garantiza la coincidencia exacta sin tokens nuevos ni bloques de altura reservada (que dejaban un hueco vacío grande). Cumple además la petición de “subir un poco” el contenido y de dejar un gap mínimo entre cabecera y cuerpo. Verificado: `h2` a 100 px y subtítulo a 145 px en `crear-personaje`, `modalidad` y `variante` a 390×844 (0 px de diferencia; antes 145 vs 304).

**Alternatives considered**:
- *Cabecera de altura reservada / bloque de altura fija centrado (patrón 016)*: alinea, pero deja un hueco vacío grande entre la cabecera y el cuerpo y desplaza el bloque. Descartado.
- *Cuerpo centrado en el espacio bajo la cabecera*: separa el formulario ~85 px de la cabecera; descartado por el hueco.
- *Cuerpo centrado en toda la pantalla*: acerca el formulario a la cabecera, pero se solapa con ella en móviles bajos/estrechos (el formulario es alto). Descartado.
- *Alinear por JavaScript midiendo el contenido*: añade complejidad y JS, prohibido por el Principio IV (0 kB JS añadido).

## R2. Dónde centralizar el marco del flujo previo (altura de `main`)

**Decision**: el forzado de `main` (`height: calc(100dvh - cabecera)`, `min-height: 0`, `flex: 0 0 auto`, anclado arriba) se centraliza en `Juego.svelte` y aplica a `crear-personaje | modalidad | variante`, con el fallback `@media (max-height: 719px)` compartido. No hay textura de puntos que gestionar (R8).

**Rationale**: el forzado de altura es un contrato del área de juego y su dueño natural es `Juego.svelte`. Al haberse retirado la textura, el marco no necesita reglas de fondo adicionales.

**Alternatives considered**:
- *Duplicar `:global(main[data-pantalla=…])` en cada pantalla*: multiplica reglas y riesgo de divergencia. Descartado.
- *Mantener una capa de textura en `main`*: descartado al retirarse la textura del producto (R8).

## R3. Compartir estilos entre componentes Svelte sin romper el scoping

**Decision**: definir las clases del marco de pantalla (`.pantalla`, `.pantalla__cabecera`, `.pantalla__cuerpo`) como reglas **`:global` en `Juego.svelte`**; cada pantalla renderiza su propio `<section class="pantalla" data-testid=…>` y su cuerpo conserva los estilos **scoped** actuales (p. ej. `section form > input`). El lenguaje visual de tarjeta se comparte como una clase base (`.tarjeta`) más el layout propio de cada pantalla.

**Rationale**: en Svelte el CSS es scoped por componente; si la `section` viviera en un componente contenedor compartido, los selectores `section …` de cada cuerpo dejarían de casar. Mantener la `section` en cada pantalla y compartir solo las clases del marco evita ese problema sin crear un componente contenedor.

**Alternatives considered**:
- *Componente contenedor con slot/snippet*: rompe el scoping de los selectores que dependen de `section` y añade una capa. Descartado.
- *CSS Modules / hoja por componente*: introduce un patrón nuevo en el proyecto. Descartado por YAGNI.

## R4. Tokens

**Decision**: **no se añaden tokens nuevos**. La posición fija de la cabecera se consigue con el anclaje de `main`/`.pantalla` y el gap usa el token existente `--esp-5`.

**Rationale**: el layout no necesita valores nuevos; usar tokens existentes evita tocar el espejo `tokens.css`/`tokens.ts` (V-03) y mantiene el sistema simple.

**Alternatives considered**:
- *Añadir tokens de altura de cabecera/bloque*: se probó y dejaba huecos vacíos o dependía de calibrar un alto fijo; descartado. Se eliminaron.
- *Usar valores literales en el componente*: rompe la fuente única de verdad y el patrón del sistema de diseño. Descartado.

## R5. Cómo verificar la alineación

**Decision**: test E2E nuevo que mide `getBoundingClientRect().top` del `h2` y del subtítulo en las tres pantallas para un mismo viewport y exige diferencias ≤ 2 px, reutilizando los helpers de `tests/e2e/apoyo/juego.ts` (`crearPersonaje`, `avanzar`, `clavePantalla`). Además, comprobación de no desborde horizontal a 320 px y de que no se recorta contenido.

**Rationale**: es el mismo método que usa `layout-estable.spec.ts` (tolerancia de 2 px) y ya está probado en el proyecto.

**Alternatives considered**:
- *Test unitario de CSS*: no puede medir posiciones reales del layout. Descartado.
- *Snapshot visual*: frágil ante fuentes/entornos. Descartado.

## R6. Anclaje del marco y el centrado de `main`

**Decision**: en las pantallas previas a partida, `main` MUST anclarse arriba (`justify-content: flex-start`) y el marco (`.pantalla`) MUST NOT depender del centrado del contenedor para colocar la cabecera.

**Rationale**: `main` es una columna flex con `justify-content: center`. En ventanas altas `.pantalla` (height 100%) llena el área y el centrado no actúa; pero en ventanas bajas (fallback) `main` pasa a `height: auto`, el `height: 100%` de la sección no resuelve y **el centrado coloca la sección según su contenido**, desplazando la cabecera (medido: a 390×700 el `h2` estaba a 124 px en creación y a 238 px en modalidad). Anclar arriba elimina esa dependencia: la cabecera queda a la misma `y` con independencia del contenido y del alto de la ventana.

**Alternatives considered**:
- *Forzar altura definida a `main` también en el fallback*: mantendría el centrado pero seguiría desplazando la sección si el contenido crece. Descartado.
- *Cabecera en `position: fixed`/`absolute`*: saca el título del flujo y complica la accesibilidad y el scroll. Descartado.
- *Rejilla con la cabecera en la primera fila y el cuerpo con scroll propio*: más complejo y añade scroll interno. Descartado por simplicidad.

## R7. Cabecera de altura natural en lugar de token de altura reservada

**Decision**: **no se añade ningún token** (`--alto-cabecera-pantalla` se descartó). La cabecera (`.pantalla__cabecera`) tiene **altura natural** y el cuerpo va justo debajo con un gap fijo (`--esp-5`), dentro de una sección anclada arriba.

**Rationale**: un alto reservado fijo dejaba un hueco vacío grande y dependía de calibrar un valor; con la cabecera anclada arriba su parte superior ya cae siempre en la misma `y` con independencia del contenido y del alto de la ventana (verificado: `h2` a 100 px y subtítulo a 145 px en crear/modalidad/variante a 390×844). Evita tocar el espejo `tokens.css`/`tokens.ts` (V-03).

**Alternatives considered**:
- *Token de altura reservada (`--alto-cabecera-pantalla`)*: se probó; dejaba hueco vacío y exigía calibrar un alto fijo. Descartado y eliminado.
- *Valores literales en el componente*: rompe la fuente única de verdad. Descartado.

## R8. Textura de puntos retirada por completo (FR-006, SC-008)

**Decision**: se elimina la textura de puntos: se borra la regla `body.textura-puntos::before` de `src/ui/base.css`, se retira la prop `textura` de `src/layouts/Layout.astro` y su uso en las páginas, y se elimina el `$effect` de `Juego.svelte` que activaba la clase. No aparece en ninguna pantalla, header ni pie.

**Rationale**: la revisión visual descarta la textura; retirarla del todo es más simple que mantenerla acotada y evita cualquier punto en la cabecera. La identidad se sostiene con tipografía, color de acento y tarjetas.

**Alternatives considered**:
- *Mantener la textura solo en el flujo previo y la portada*: era el diseño anterior; el usuario pidió quitarla en todos lados. Descartado.
- *Mantener la textura en todas las pantallas y taparla por escena*: complejidad innecesaria. Descartado.
- *Dejar la regla CSS sin usar*: código muerto; se elimina. Descartado.

## R9. Header negro anclado sin alterar las alturas (FR-016, SC-009)

**Decision**: el header del sitio (`.site-header`) usa `position: sticky; top: 0` con `background: var(--c-fondo)` (negro plano) y `z-index` por encima del contenido de `main`.

**Rationale**: `sticky` mantiene el header en el flujo (no lo saca como `fixed`), así el `$effect` que mide `.site-header` y publica `--alto-cabecera` sigue funcionando y los `height: calc(100dvh - var(--alto-cabecera))` no cambian; al hacer scroll el header se sobrepone. El fondo opaco del sitio (`--c-fondo`) da al header el aspecto negro plano acordado.

**Alternatives considered**:
- *`position: fixed`*: saca el header del flujo; habría que compensar con un `padding-top`/`margin` y recalcular `--alto-cabecera`, con riesgo de descuadrar las pantallas. Descartado.
- *Header transparente con la textura de fondo*: es lo que se quiere evitar (puntos en la cabecera). Descartado.
- *Header sticky solo en `/jugar`*: el usuario pidió coherencia en todo el sitio. Descartado.

## R10. Altura estable del área de juego: `svh` en vez de `dvh`

**Decision**: la altura del área de juego usa `100svh` (con `100vh` como reserva) en lugar de `100dvh`.

**Rationale**: en móvil, `100dvh` crece cuando la barra del navegador se oculta al scrollear; como el bloque de juego fija su altura con ese valor, el bloque **saltaba** de tamaño durante el scroll. `100svh` es constante (viewport pequeño), así el bloque no cambia al scrollear. En escritorio `svh` = viewport, sin cambio.

**Alternatives considered**:
- *`100dvh`*: es la causa del salto; descartado.
- *`100lvh`*: también constante, pero dimensiona al viewport grande, desplazando el centrado inicial del contenido; descartado.
- *`100vh` solo*: estable en móvil (viewport grande) y sirve de reserva, pero `svh` es más preciso para el área visible inicial; se usa `100vh` como fallback.
