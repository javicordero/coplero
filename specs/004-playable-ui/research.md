# Research: Versión mínima jugable (/jugar)

Fase 0. Decisiones de diseño para la primera UI. Ninguna introduce reglas de juego: la lógica sigue en `engine`.

## D1 · Estado reactivo como fábrica, no como módulo

- **Decision**: el estado vive en `src/juego/estado.svelte.ts` como una **fábrica** (`crearJuego()`) que se invoca al montar `Juego.svelte`; no hay estado a nivel de módulo. Los runes (`$state`, `$derived`) se crean dentro de la fábrica.
- **Rationale**: Astro renderiza (SSR) el componente antes de hidratarlo; un `$state` de módulo se compartiría entre peticiones y filtraría partidas entre usuarios.
- **Alternatives considered**: store de Svelte (`writable`) — evita runes y mezcla paradigmas; estado de módulo con flag `browser` — frágil y propenso a fugas.

## D2 · Pantallas derivadas del `Paso` del motor

- **Decision**: `Juego.svelte` decide qué pantalla mostrar a partir del estado de la partida y del `Paso` devuelto por el motor:
  - sin partida creada → `Intro` → `CrearPersonaje` → `ElegirModalidad` → `ElegirVariante`;
  - `paso.tipo === "decision"` → `Decision`;
  - `paso.tipo === "resultado"` → `Resultado`;
  - `paso.tipo === "fin"` → `FinCarrera`;
  - `paso.tipo === "error"` → `Error`.
- **Rationale**: el motor ya modela las fases y el orden de decisión; la UI no duplica esa máquina de estados.
- **Alternatives considered**: replicar las fases en la UI — duplicaría lógica y se desincronizaría.

## D3 · Orden real del año

- **Decision**: tras crear la partida, el año sigue el orden del motor: **decisión de verano → decisión de febrero → resultado de temporada**. El resultado se calcula con el estado previo a la decisión de febrero y se revela después (una sola pantalla por año). Confirmado en la clarificación.
- **Rationale**: es exactamente lo que expone `siguientePaso`/`elegir`/`continuar`; no requiere cambios de motor.
- **Alternatives considered**: una pantalla de resultado intermedia tras el verano — no existe tal resultado en el motor y exigiría inventar contenido.

## D4 · Semilla generada en el cliente

- **Decision**: la semilla se genera una vez por partida con `crypto.randomUUID()` en el momento de crear el personaje y se guarda en la partida. El motor sigue siendo el único que consume azar, siempre desde `rngPara`.
- **Rationale**: el motor prohíbe `Math.random`/`Date.now`, pero la UI sí puede generar el punto de entrada; con la semilla fija la partida es reproducible.
- **Alternatives considered**: pedir la semilla al jugador — fricción innecesaria para el MVP; derivarla del reloj — no determinista.

## D5 · Catálogo de variantes como datos

- **Decision**: añadir `src/content/variantes.ts` con las variantes por modalidad (id, título, subtítulo) según `docs/01` §2: comparsista (clásico, nueva escuela, evolución con raíces) y chirigotero (lolosedismo, clásico, interpretar el personaje). La UI solo lo presenta.
- **Rationale**: las modalidades y variantes son datos de juego; viven en `content`, no en la isla.
- **Alternatives considered**: hardcodearlas en la UI — viola "contenido como datos" y duplica el catálogo.

## D6 · Persistencia con almacén inyectable

- **Decision**: `src/juego/persistencia.ts` expone `guardar(almacen, partida)` y `cargar(almacen)` sobre una interfaz tipo `Storage`; en el navegador se le pasa `localStorage`, en tests un almacén en memoria. Usa la clave `coplero:partida` con `{ version, partida }`, valida con `deserializar` del motor y descarta guardados incompatibles.
- **Rationale**: guardar en cada elección (decisión ya cerrada), con versión de esquema, y poder testear sin `jsdom`.
- **Alternatives considered**: usar `localStorage` directo — no testeable en `environment: node`; cifrar el guardado — innecesario.

## D7 · Nombre libre: normalizar, limitar y texto plano

- **Decision**: `normalizarNombre` recorta, colapsa espacios y **trunca a 24 caracteres**; el nombre se renderiza como texto (Svelte escapa por defecto, nunca `{@html}`). Sin lista de bloqueo en esta fase (clarificación Q2=A).
- **Rationale**: cumple el mínimo de `docs/05` §7 sin introducir contenido nuevo.
- **Alternatives considered**: lista de bloqueo — requiere definir el listado, fuera de esta fase.

## D8 · Título dinámico y etiquetas centralizadas

- **Decision**: `src/juego/presentacion.ts` concentra los textos de presentación: título según género (Coplero/Coplera/Coplere), nombres de fase, momento y tipo, y etiquetas de premios. Son funciones puras y testables.
- **Rationale**: evita dispersar cadenas por las pantallas y facilita testearlas sin DOM.
- **Alternatives considered**: literales en cada `.svelte` — difícil de mantener y de testear.

## D9 · Verificación de punta a punta

- **Decision**: tests unitarios en Vitest para estado, persistencia y presentación; un **smoke E2E con Playwright** (`tests/e2e/jugar.spec.ts`) que completa una carrera entera en `/jugar`.
- **Rationale**: el objetivo del feature es demostrar que se puede jugar de principio a fin; el E2E lo prueba de verdad.
- **Alternatives considered**: solo tests unitarios — no demuestran el flujo real del navegador.

## D10 · Cero lógica de juego en la UI

- **Decision**: la isla solo presenta estado y despacha acciones; toda decisión de reglas (qué situación sale, efectos, resolución del COAC, premios) la toma el motor. `presentacion.ts` solo traduce etiquetas.
- **Rationale**: mandato explícito del usuario y del Principio IV de la constitución.
- **Alternatives considered**: precalcular opciones o textos en la UI — riesgo de divergencia con el motor.

## Incógnitas resueltas

No quedan `NEEDS CLARIFICATION`. D1–D10 cubren estado, navegación, orden del año, semilla, variantes, persistencia, nombre, textos, test y separación de responsabilidades.
