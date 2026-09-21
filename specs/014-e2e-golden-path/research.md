# Fase 0 — Investigación y decisiones

**Feature**: 014-e2e-golden-path | **Fecha**: 2026-09-21

No queda ningún `NEEDS CLARIFICATION`. Las incógnitas eran de mecánica de la prueba, no de alcance.

## R1 · Una sola prueba integrada con pasos explícitos

**Decisión**: un único `test()` en `tests/e2e/carrera-completa.spec.ts` que usa `test.step()` para
cada uno de los diez hitos.

**Rationale**: E2E-001 pide el viaje **completo en una sola ejecución**. `test.step()` da lo mejor de
los dos mundos: mantiene el hilo único (un solo arranque de navegador) y produce un informe con los
diez hitos visibles, de modo que un fallo dice exactamente en qué paso se rompió (FR-013, FR-016).
Es la práctica recomendada de Playwright para un flujo largo.

**Alternativas consideradas**:
- *Diez `test()` independientes*: cada uno arranca navegador y repite el setup; además no demuestran
  que el flujo **encadene** (era justo el hueco que E2E-001 cierra).
- *Un test monolítico sin `test.step`*: peor diagnóstico; un fallo obliga a leer el log crudo.

## R2 · Sin control de semilla

**Decisión**: no se añade ningún gancho de semilla (`?seed=`, inyección, etc.). La prueba consume la
seed aleatoria de producción (`crypto.randomUUID`) y verifica **flujo y estructura**, no valores.

**Rationale**: el determinismo del motor ya se prueba en Vitest y con la simulación de 10.000
carreras (constitución III); el E2E valida el cableado y la experiencia. Introducir un `?seed=`
obligaría a tocar `estado.svelte.ts` y/o la URL de producción solo para el test, contra la
constitución V. Los E2E actuales ya completan carreras con seed aleatoria y son estables.

**Alternativas consideradas**:
- *Parámetro `?seed=` en `/jugar`*: cambia código de producción por una necesidad de test.
- *Inyectar seed desde el test*: la isla no lo expone al navegador sin un hook, así que exige el
  mismo cambio de producción.
- *Fijar el resultado esperado*: imposible con seed aleatoria y contrario a FR-012.

## R3 · Anclajes observables (y el único hueco: `data-tipo`)

**Decisión**: la prueba observa el juego con los anclajes ya existentes y añade **uno** nuevo:

- `[data-pantalla]` en `<main>` (Intro) es la pantalla actual; junto con `data-momento` y `data-ano`
  forma la **clave de pantalla** (`pantalla|momento|ano`) que hoy ya usan `jugar.spec.ts` y
  `compartir.spec.ts`.
- `data-testid` existentes por pantalla: `empezar`, `crear-personaje`, `crear`, `modalidad`,
  `variante`, `decision`, `resultado`, `continuar-ano`, `fin`, `tarjeta`, `tarjeta-nombre`,
  `tarjeta-hitos`, `copiar-enlace`, `continuar`.
- **Nuevo**: `data-tipo` en el indicador de contexto (`IndicadorContexto.svelte`), con el valor
  `contenido | personaje` de la decisión, para comprobar FR-005 sin leer el texto visible.

**Rationale**: los `data-*` de observación ya son una convención del proyecto (los introdujeron las
features 004, 005, 011 y 013). Para FR-005 hace falta distinguir contenido de personaje y hoy solo
existe el texto ("Contenido"/"Personaje"): depender del copy es frágil. Un atributo es el anclaje
mínimo y estable; no añade lógica ni JS.

**Alternativas consideradas**:
- *Parsear el texto del indicador*: funciona hoy, pero se rompe al retocar el copy y acopla el test a
  la presentación.
- *No comprobar contenido vs. personaje*: incumple FR-005; el motor garantiza una de cada por año y
  la prueba debe evidenciarlo.
- *Añadir `data-tipo` en `<main>`*: contaminaría la clave de pantalla y mezclaría conceptos.

## R4 · Helpers compartidos en `tests/e2e/apoyo/juego.ts`

**Decisión**: extraer a un módulo de apoyo las utilidades hoy duplicadas:

- `clavePantalla(page)`: lee `pantalla|momento|ano`.
- `crearPersonaje(page, nombre)`: empezar + rellenar + crear.
- `elegirModalidadYVariante(page)`: primera modalidad y primera variante.
- `avanzar(page, clavePrevia)`: resuelve una pantalla del bucle y espera el cambio de clave.
- `completarCarrera(page)`: bucle de hasta 400 pasos hasta `fin`.
- `enlaceCompartido(page)`: pulsa `copiar-enlace` y lee el portapapeles.

`jugar.spec.ts` y `compartir.spec.ts` pasan a importarlas; el nuevo spec también.

**Rationale**: el bucle de hasta 400 pasos está **copiado** en los dos specs actuales; el nuevo sería
la tercera copia. Extraer da una única definición de "cómo se juega" y hace que un cambio de anclaje
se arregle en un sitio. Es la única abstracción que se introduce.

**Alternativas consideradas**:
- *Copiar otra vez*: tres fuentes de verdad que divergen.
- *Page Object completo*: sobreingeniería para tres specs; contra la constitución V.

## R5 · Recuperación tras recarga (hito 8)

**Decisión**: a mitad de carrera, capturar la clave de pantalla, `page.reload()`, comprobar que
aparece el botón `continuar` (estado guardado "en-curso"), pulsarlo y verificar que la clave
observable coincide con la de antes de recargar; después, seguir hasta el final.

**Rationale**: es el comportamiento que la feature 005 ya garantiza y el que promete continuidad al
jugador. Reutilizar la clave de pantalla evita aserciones sobre datos concretos y es resistente a
cualquier seed. El botón `continuar` (no `ver-resultado`) confirma que la partida estaba **en curso**,
no terminada.

**Alternativas consideradas**:
- *Recargar en el fin y comprobar la tarjeta guardada*: no prueba la recuperación a mitad de carrera.
- *Leer y comparar el JSON de `localStorage`*: frágil y acoplado al formato interno; el contrato es lo
  que se ve en pantalla.

## R6 · Compartir y abrir el enlace (hitos 9–10)

**Decisión**: al llegar al fin, pulsar `copiar-enlace`, leer el portapapeles, comprobar que contiene
`/r/`, limpiar `localStorage` y navegar a ese enlace; verificar que la tarjeta muestra el mismo
nombre del personaje.

**Rationale**: `copiar-enlace` es el camino fiable en headless; el botón "Compartir" usa
`navigator.share`, que Chromium headless no implementa y degrada a un aviso. Limpiar `localStorage`
simula "otra persona" abriendo el enlace (aunque `/r/[codigo]` es SSR y no lee el almacén, deja el
escenario explícito). Se necesitan permisos de portapapeles:
`test.use({ permissions: ["clipboard-read", "clipboard-write"] })`, como en `compartir.spec.ts`.

**Alternativas consideradas**:
- *Usar el botón Compartir*: no disponible en headless; probaría el aviso, no el enlace.
- *Abrir en un contexto nuevo*: más coste sin diferencia real, porque `/r/` no depende del estado
  guardado.
- *Construir la URL a mano*: no verificaría que el juego **genera** el enlace (FR-009).

## R7 · Tiempo, esperas y permisos

**Decisión**: `test.setTimeout(90_000)` con objetivo real **< 60 s** (SC-004); esperas por estado
(`waitForSelector`/`waitForFunction` sobre `[data-pantalla]`), nunca `waitForTimeout`; permisos de
portapapeles declarados en el spec. `playwright.config.ts` **no** cambia.

**Rationale**: un recorrido de ~20 años son ~60 interacciones; hay margen sobre los 30 s por defecto
del config. Las esperas por estado ya evitan flakiness en los specs actuales. Subir el timeout global
afectaría a toda la suite y enmascararía lentitudes.

**Alternativas consideradas**: subir el timeout global; usar esperas fijas (frágil y lento);
reducir años jugados (dejaría de ser "la carrera completa", FR-006).

## R8 · Lo que no se toca

**Decisión**: quedan fuera de alcance y no se modifican:

- `engine` y `content` (ni el banco, ni las condicionales, ni los parámetros del motor).
- Los casos de error (código inválido, guardado corrupto) y las auditorías axe: ya tienen sus specs
  (`compartir.spec.ts`, `chrome.spec.ts`, `landing.spec.ts`).
- `playwright.config.ts` y la clave/formato de `localStorage`.
- La lógica del juego en la UI: el único toque en `src/` es el atributo `data-tipo`.

**Rationale**: acota la feature a la verificación del camino feliz y evita duplicar cobertura o
reabrir decisiones cerradas.

## Resumen de decisiones

| # | Decisión | Impacto |
|---|---|---|
| R1 | Una prueba con `test.step()` por hito | el viaje completo en una ejecución, con diagnóstico por paso |
| R2 | Sin control de semilla | cero cambios de producción por el test; se verifica flujo, no valores |
| R3 | Anclajes existentes + `data-tipo` | único hueco de observación cubierto con un atributo |
| R4 | Helpers compartidos en `apoyo/juego.ts` | una sola definición de "cómo se juega"; sin Page Object |
| R5 | Recarga → `continuar` → misma clave | prueba real de recuperación a mitad de carrera |
| R6 | Copiar enlace → abrir `/r/` | verifica generación y reproducción del enlace |
| R7 | Timeout 90 s, objetivo < 60 s, esperas por estado | estable y dentro de SC-004 |
| R8 | Nada de engine/content/errores/axe | alcance acotado, sin duplicar cobertura |
