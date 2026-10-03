# Phase 0 — Research: Estilo de las tarjetas de modalidad (nombres, cita e icono)

## R1. Dónde vive el nombre de la modalidad y el alcance del renombrado

**Decision**: cambiar solo los **títulos** de `MODALIDADES_INFO` (en `src/juego/presentacion.ts`) a "Comparsa" y "Chirigota". **No** tocar `etiquetaModalidad` ni `ETIQUETA_MODALIDAD`, que seguirán devolviendo "Comparsista"/"Chirigotero" y alimentan la tarjeta final (`Tarjeta.svelte`) y la imagen OG (`api/og/[codigo].png.ts`).

**Rationale**: la spec y la clarificación dejan el cambio acotado a la pantalla de selección de modalidad. Separar "título de la tarjeta de elección" (presentación de la pantalla) de "etiqueta de la modalidad" (usada en la carrera y al compartir) permite renombrar sin regresiones fuera de alcance ni tocar `engine`/`content`.

**Alternatives considered**:
- *Renombrar en todo el producto (indicador, tarjeta final, OG, portada)*: descartado por el usuario ("solo aquí, de momento") y porque multiplicaría los puntos de cambio y las pruebas.
- *Cambiar el valor interno `Modalidad` de `comparsista`/`chirigotero` a `comparsa`/`chirigota`*: rompería determinismo, códigos guardados y contenido; descartado.

## R2. Cómo renderizar la cursiva de los subtítulos

**Decision**: aplicar `font-style: italic` con el modificador `.tarjeta__subtitulo--cita` y envolver el texto entre comillas “ ”. En modalidad se aplica siempre (todos sus subtítulos son citas); en variante, solo cuando la variante declara `cita: true`. El dato guarda la cita sin comillas; las comillas se añaden al renderizar.

**Rationale**: en modalidad todos los subtítulos son citas, así que basta con aplicar el modificador a todas sus tarjetas; en variante son mixtos, así que la propiedad `cita` del catálogo marca cuáles lo son. Un único modificador compartido evita duplicar reglas.

**Alternatives considered**:
- *Cursiva global en `.tarjeta__subtitulo`*: marcaría en cursiva subtítulos que no son citas; descartado.
- *Sin propiedad y con listas de ids*: acopla la vista a los ids de variante; se prefiere el dato `cita` en el catálogo.

## R3. Iconos provisionales sin dependencias: asset del usuario para Chirigota, placeholder para Comparsa

**Decision**: cada tarjeta usa su recurso ya existente como **silueta monocroma** mediante CSS `mask-image`, pintada con `background-color: var(--c-texto-suave)` (el color del subtítulo): Chirigota `public/pito_y_caja.svg` (pito y caja) y Comparsa `public/guitarra.svg` (guitarra).

**Rationale**: reutiliza los assets que ha creado el usuario tal cual (sin editarlos ni duplicarlos), no añade JavaScript ni dependencias, y respeta la restricción de 0 kB de JS. La máscara usa el canal **alfa** del SVG: como todos los rellenos y degradados del recurso son opacos, el icono resultante es **de un único color plano**; la sombra del SVG tiene un desenfoque de ~6/512 del viewBox, es decir, sub-píxel al tamaño de icono, por lo que no se aprecia. Comparsa usa el recurso de guitarra con el mismo tratamiento; ambos iconos siguen siendo provisionales.

**Alternatives considered**:
- *Inline del SVG completo con overrides de relleno*: duplica un SVG de ~110 líneas y obliga a limpiar degradados y filtros; descartado por simplicidad y mantenimiento.
- *`<img>` con filtros CSS (grayscale/brightness/sepia)*: no permite fijar con exactitud el color del subtítulo; descartado.
- *Editar `pito_y_caja.svg` a monocromo*: perdería la versión a color y va contra "usar ese"; descartado.
- *Fuente de iconos o librería (`@iconify`, `lucide`)*: dependencia y peso innecesarios; descartado por YAGNI (Principio V) y Principio IV.
- *Emoji*: su color no se controla; descartado.

## R4. Posición de los iconos y anti-solape con el texto

**Decision**: el `button.tarjeta` pasa a `position: relative`; cada icono se coloca con `position: absolute` en la esquina superior derecha usando tokens de espaciado; el título y el subtítulo reservan espacio a la derecha (padding) para que la cita, aunque ocupe dos líneas, no quede nunca bajo el icono.

**Rationale**: es la solución más simple (mínimo cambio de DOM, sin envoltorios) y garantiza el requisito de no solape (FR-010) reservando el ancho del icono en el flujo de texto. El icono queda dentro del `<button>` y con `pointer-events: none`, por lo que toda la tarjeta sigue siendo un único objetivo de toque (FR-006).

**Alternatives considered**:
- *Envolver título + icono en una fila flex (`space-between`)*: robusto, pero añade un nivel de DOM y cambia la estructura del contenido; se descarta por simplicidad.
- *Icono fuera del botón*: rompería el objetivo de toque y la semántica; descartado.

## R5. Pintado del icono: máscara monocroma en el color del subtítulo

**Decision**: los iconos se pintan con `mask-image`, `mask-size: contain`, `mask-repeat: no-repeat` y `background-color: var(--c-texto-suave)`: Chirigota con `url("/pito_y_caja.svg")` y Comparsa con `url("/guitarra.svg")`. El tamaño es reducido (orden de `1.25rem`).

**Rationale**: la máscara produce una silueta **de un solo color** exactamente igual al del subtítulo, que es lo pedido ("sin color", monocromo tintado). La sutileza se consigue por tamaño y posición. No se añaden tokens nuevos (el tamaño es un valor local del componente, como otros ya presentes en el proyecto), evitando tocar el espejo `tokens.css`/`tokens.ts` (V-03).

**Alternatives considered**:
- *Nuevo token de color/tamaño de icono*: implicaría actualizar el espejo TS y sus tests para un único uso; descartado por YAGNI.
- *Bajar la opacidad para atenuar*: alteraría el color efectivo respecto al subtítulo; descartado.
- *Fondo con `currentColor` heredado del estado hover*: el hover del `.tarjeta` cambia el color; se fija explícitamente `--c-texto-suave` para que el icono no cambie al pasar el ratón.

## R6. Accesibilidad de los iconos decorativos

**Decision**: los iconos llevan `aria-hidden="true"` (y `focusable="false"` en el SVG), además de `pointer-events: none`; no aportan texto accesible. El nombre accesible de la opción sigue siendo "título + subtítulo".

**Rationale**: los iconos son adorno; no deben añadir ruido a lectores de pantalla ni alterar el nombre accesible ni la interacción (FR-005, SC-004).

**Alternatives considered**:
- *Icono con `role="img"` y `aria-label`*: lo anunciaría y cambiaría el nombre accesible; descartado.
- *Iconos como pseudo-elementos CSS (`::after` con máscara)*: complicaría el test de presencia y el gancho observable; se prefiere un nodo real `.tarjeta__icono`.

## R7. Estrategia de verificación

**Decision**:
- **Unitaria** (`presentacion.test.ts`): títulos `["Comparsa", "Chirigota"]`; subtítulo de Comparsa literal; subtítulo de Chirigota sin cambios.
- **E2E** (`tests/e2e/modalidad-tarjetas.spec.ts`): títulos en pantalla; `font-style` computado `italic` en los subtítulos de modalidad y en los de variante marcados con `cita` (y `normal` en el resto); cada tarjeta con un nodo `.tarjeta__icono` `aria-hidden` sin texto accesible; Comparsa con `.tarjeta__icono--guitarra`, Chirigota con `.tarjeta__icono--caja` y "Clásico" (comparsa) con `.tarjeta__icono--bigote`; sin desborde horizontal a 320 px; axe sin violaciones graves.
- `npm run check` (typecheck + lint + tests) como puerta de calidad.

**Rationale**: cubre el contenido (unit), el aspecto y la accesibilidad (E2E) y la no regresión de layout (`layout-previo.spec.ts` sigue midiendo la cabecera de la pantalla, que no cambia). El color pintado y el origen de la máscara son observables con `getComputedStyle`, así que el monocromo y el uso del asset son verificables, no solo visuales.

**Alternatives considered**:
- *Solo snapshot visual*: frágil ante fuentes y entornos; descartado.
- *Solo unitario*: no verifica cursiva real, posición del icono ni desborde; descartado.

## R8. Degradación si el asset no carga

**Decision**: si `/pito_y_caja.svg` no carga, la máscara deja el nodo transparente y la tarjeta permanece legible y seleccionable; no hay texto alternativo ni hueco reservado visible más allá del espacio de texto que ya se reserva.

**Rationale**: cumple el edge case de la spec ("si el icono no carga o se retira, la tarjeta debe seguir siendo plenamente legible y seleccionable") sin lógica de fallback ni JS.

**Alternatives considered**:
- *Fallback a un icono inline si falla la carga*: añadiría lógica/JS y complejidad; descartado por YAGNI.
- *Icono inline embebido en lugar del asset*: duplicaría el recurso; descartado (R3).
