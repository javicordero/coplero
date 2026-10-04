# Phase 0 — Research: Modo dev y rediseño de la pantalla de resultado del año

## R1. Forma del modo dev: instantánea aislada

**Decision**: el modo dev de resultado es una **instantánea aislada**: un `Temporada` de ejemplo más el año, **sin partida real**. La isla arranca en la pantalla de resultado con `partida = null`; «Continuar» queda inerte porque el reducer retorna temprano cuando no hay partida.

**Rationale**: es la analogía del modo dev de la pantalla final. La iteración visual es inmediata y no hay riesgo de tocar una partida guardada real. Responde a la clarificación del usuario.

**Alternatives considered**:
- *Partida real con `resultadoPendiente`*: descartado; añade montaje y estado real para algo que solo se mira.
- *Partida sintética mínima*: descartada; obligaría a rellenar todos los campos de `Partida`.

## R2. Dispatcher dev unificado

**Decision**: `src/juego/dev/arranque.ts` expone `arranqueDevDesdeUrl(search)` con una unión discriminada `{ pantalla: "fin" | "resultado", ... } | null`. `fixturesFin.ts` se conserva intacto.

**Rationale**: `Juego.svelte` necesita una sola comprobación `import.meta.env.DEV`; evita ramas paralelas y no rompe los tests de `fixturesFin`.

**Alternatives considered**:
- *Dos variables dev en `Juego.svelte`*: descartado por ruido.
- *Reescribir `fixturesFin.ts`*: descartado por churn.

## R3. Modelo de la etiqueta «Resultado»

**Decision**: extender el mapa de etiquetas con `resultado → "Resultado"` y tipar `Indicador.momento` como `Momento | "resultado"`.

**Rationale**: cambio mínimo; conserva `data-momento` como atributo observable y no modela «resultado» como estado del motor.

**Alternatives considered**:
- *Campo `etiqueta` separado*: más invasivo para un solo caso.
- *Nuevo tipo de pantalla en el indicador*: sobrediseño (YAGNI).

## R4. Casos de ejemplo

**Decision**: `campeon` (defecto), `podio`, `finalista`, `preliminares`, `sin-premios`, `fuera-de-concurso` y `distinciones`. Caso desconocido → por defecto.

**Rationale**: cubre premio/ausencia, concurso/fuera de concurso, fase de preliminares (texto propio) y varias fases y puestos.

**Alternatives considered**:
- *Un único caso*: no permite validar estados vacíos.
- *Casos aleatorios*: rompe el determinismo de los tests.

## R5. Dirección visual: panel de las pantallas de creación

**Decision**: retirar la hoja clara de acta y adoptar el **panel de las pantallas de creación** sobre el **tema oscuro** por defecto: `background: var(--c-superficie)`, borde `var(--c-separador)`, `border-radius` y `box-shadow`, con etiquetas en mayúsculas. **Sin cabecera centrada**.

**Rationale**: decisión explícita del usuario (opción B de la clarificación): «solo el panel», conservando la estructura actual. Da cohesión con el inicio del juego sin reabrir el lenguaje de formulario completo.

**Alternatives considered**:
- *Marco completo con cabecera centrada*: descartado por el usuario (la cabecera se había retirado por redundante).
- *Fondo estacional de febrero*: descartado; el resultado usa el tema neutro oscuro.
- *Lenguaje oscuro del palmarés final*: descartado; el usuario pidió parecerse a las pantallas de creación.

## R6. Dónde vive el estilo

**Decision**: el estilo del panel vive en los estilos scoped de `Resultado.svelte`; en `Juego.svelte` se **elimina** el bloque `main[data-pantalla="resultado"]` (tema claro de acta) para que el resultado herede el tema oscuro por defecto.

**Rationale**: el fondo del `main` ya es responsabilidad de `Juego.svelte`; el contenido pertenece a `Resultado.svelte`. Retirar el override evita mantener dos paletas.

**Alternatives considered**:
- *Mantener el override claro y repintar todo el panel*: descartado; duplicaría el manejo de color.

## R7. Indicador y `data-ano` en dev

**Decision**: en la pantalla de resultado, el indicador y `data-ano` usan el año de la fixture dev cuando no hay partida; el render no exige `juego.partida`.

**Rationale**: sin partida, `juego.partida?.anoActual` es `null`; sin este ajuste el modo dev no mostraría ni el año ni el indicador.

**Alternatives considered**:
- *Año fijo hardcodeado*: válido, pero se prefiere el año de la fixture.

## R8. Distinciones: fila con nombre y roseta

**Decision**: las distinciones del año se muestran en **una única fila**; cada una con el **nombre encima y la roseta debajo**, reutilizando `public/rosetas/`. El mapa `ROSETAS` se comparte en `presentacion.ts` y lo usan `Resultado.svelte` y `Tarjeta.svelte`.

**Rationale**: decisión del usuario. Como máximo hay una distinción de cada tipo por año (máx. 3), así que caben en una fila. Compartir el mapa evita duplicar rutas de assets.

**Alternatives considered**:
- *Agrupar por tipo con recuento*: innecesario; no hay dos del mismo tipo en un año.
- *Solo texto sin roseta*: descartado por el usuario.
- *Duplicar el mapa de rosetas*: descartado (DRY).

## R9. Botón «Continuar» dentro del panel

**Decision**: el botón «Continuar» va **dentro del panel**, al final, como en las pantallas de creación. Queda anotado revisar la variante fuera del panel.

**Rationale**: decisión del usuario; refuerza el panel como bloque único.

**Alternatives considered**:
- *Fuera del panel*: anotado para revisar más adelante.

## R10. Estrategia de verificación

**Decision**:
- **Unit** (`fixturesResultado.test.ts`): casos válidos, caso desconocido → por defecto, `dev=resultado`, dispatcher separa `fin`/`resultado`.
- **Unit** (`presentacion.test.ts`): `etiquetaMomento("resultado")`; `ROSETAS` cubre los tres tipos.
- **E2E** (`resultado-dev.spec.ts`): casos por URL; indicador «Resultado»; distinciones en fila con nombre y roseta; botón dentro del panel; «Continuar» inerte; 320 px sin scroll; `axe` sin violaciones graves.
- **E2E** (`layout-estable.spec.ts`): INV-5 exige `/Resultado/i`.
- No regresión: `jugar`, `entrada-directa`, `compartir`, `pantalla-final`.
- `npm run check` como puerta.

**Rationale**: cubre el contrato del modo dev, el cambio de etiqueta, las rosetas, el panel y la accesibilidad con la infraestructura existente.

**Alternatives considered**:
- *Solo snapshot visual*: frágil.
- *Confiar en el flujo real sin tests dev*: descartado; el modo dev es un contrato observable.
