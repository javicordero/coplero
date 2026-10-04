# Phase 0 — Research: Cambios de trayectoria (modalidad y variante)

Todas las incógnitas del Technical Context quedan resueltas aquí. No quedan `NEEDS CLARIFICATION`.

## R1 · Cómo modelar la trayectoria

**Decisión**: Guardar un historial de cambios con el **estado resultante** y mantener, además, la modalidad y variante vigentes en la `Partida`.

```ts
interface CambioTrayectoria { ano: number; modalidad: Modalidad; variante: VarianteId }
interface Trayectoria {
  modalidadInicial: Modalidad
  varianteInicial: VarianteId
  cambios: CambioTrayectoria[]   // cada entrada = estado tras el cambio
}
```

`Partida.modalidad` y `Partida.variante` siguen siendo el estado vigente (no se calculan en cada selección). Invariante: si `cambios` no está vacío, su última entrada coincide con los valores vigentes.

**Rationale**: el motor necesita el valor vigente en caliente (filtros de contenido) y la tarjeta final (007) necesita el recorrido. Guardar solo los cambios evita duplicar todo el estado y es directamente narrable ("empezaste como X y acabaste como Y"). Determinista y serializable (sin clases).

**Alternativas consideradas**:
- Guardar la modalidad y variante en cada `Temporada`: más pesado y mezcla el resultado del COAC con la trayectoria.
- Reconstruir la trayectoria desde el `historial` de eventos: frágil y acopla la tarjeta a los ids de opción.

## R2 · Cómo pausar la partida para elegir la nueva variante

**Decisión**: Añadir una fase y un paso:

- `FasePartida` gana el valor `"variante"`.
- `Paso` gana `{ tipo: "variante"; modalidad: Modalidad }`.
- Nueva función de motor `elegirVarianteDeCambio(p, varianteId, banco, params?) → Resultado<Partida, ErrorMotor>`.

Flujo: en verano, una opción con `cambiaModalidad` actualiza `Partida.modalidad`, deja `Partida.fase = "variante"` y **no** registra aún el cambio; `siguientePaso` devuelve el paso `variante`; al elegir, se fija `Partida.variante`, se registra **un** `CambioTrayectoria` (modalidad + variante, con el año) y `Partida.fase` vuelve a `"decision"` (el momento ya es febrero).

**Rationale**: el estado sigue siendo serializable y el flujo respeta el orden verano → (cambio + nueva variante) → febrero. Reutiliza la pantalla de variante existente. El simulador y la isla pueden manejar un único tipo de paso nuevo.

**Alternativas consideradas**:
- Resolver el cambio con una situación "de variante" normal: no permite mostrar las 3 variantes de la nueva modalidad ni garantiza una elección válida.
- Un campo `pendienteVariante` sin fase: complica `siguientePaso` y la persistencia (estados intermedios menos claros).

**Restricción de contenido**: `cambiaModalidad` solo tiene sentido en verano. Se valida en los tests de integridad (una situación de febrero con `cambiaModalidad` es un error de contenido).

## R3 · Cómo garantizar que la variante elegida pertenece a la nueva modalidad

**Decisión**: Incluir el **catálogo de variantes** como datos del banco inyectado. `BancoContenido` gana `variantes?: { id: VarianteId; modalidad: Modalidad }[]`; `content/index.ts` lo rellena desde `VARIANTES`. `elegirVarianteDeCambio` valida la pertenencia y devuelve `{ codigo: "VARIANTE_INVALIDA" }` si no.

**Rationale**: el motor no puede importar `content` (constitución I), así que el catálogo viaja con el banco, igual que las situaciones. La validación en el motor evita estados imposibles aunque el llamador sea la simulación o un guardado manipulado.

**Alternativas consideradas**:
- Confiar solo en la UI: no protege al motor ni al simulador (SC-002 exige 0 carreras con variante inválida).
- Mapa `Record<Modalidad, VarianteId[]>`: equivalente, pero la lista de objetos con `modalidad` reutiliza el tipo `Variante` existente del contenido.

## R4 · Cómo hacer que las situaciones de cambio no aparezcan siempre

**Decisión**: Añadir `peso?: number` a `Situacion` (motor y esquema Zod) y usar `s.peso ?? 1` en la ponderación de `seleccionarSituacion`. Las situaciones de cambio se declaran con `minAno` (no en los primeros años) y una frecuencia baja (`peso`, o `probabilidad` si se modelan como condicionales). Las de modalidad son **repetibles** y rechazarlas no las descarta.

**Rationale**: hoy `elegirDe` pondera todas las situaciones por igual; sin un peso, una situación de cambio aparecería en cuanto fuese elegible. El peso es un campo de datos, no lógica.

**Alternativas consideradas**:
- Modelarlas como `Condicional` con `probabilidad`: forzaría un `requiere` artificial y mezcla el concepto de "condicional por flags" con "situación rara de base".
- Limitar por años exactos: rígido y menos narrativo.

## R5 · Serialización y versión del estado

**Decisión**: La `Partida` cambia de forma (gana `trayectoria`), así que `VERSION_PARTIDA` sube de **1 a 2**. Sin migración: un guardado v1 se descarta con el aviso puntual ya existente (feature 005). Se actualizan snapshot y tests de serialización.

**Rationale**: el deserializador actual solo comprueba `version`; dejar el número en 1 restauraría partidas sin `trayectoria` y rompería la selección. La política de "sin migración en v1" ya está cerrada (`docs/02` §10).

**Alternativas consideradas**:
- `trayectoria` opcional con valor por defecto al cargar: introduce dos formas de estado y deuda técnica; el proyecto aún no tiene usuarios reales.

## R6 · Simulación masiva

**Decisión**: `src/simulacion/jugar.ts` maneja el paso `"variante"` eligiendo una variante válida de `paso.modalidad` con `rngPara(seed, "variante-cambio", contador)` y llamando a `elegirVarianteDeCambio`. `auditoria.ts` añade comprobaciones de trayectoria (variante vigente válida, última entrada coherente con el estado).

**Rationale**: el bucle actual trataría cualquier paso que no sea `fin`/`error`/`resultado` como decisión y fallaría con `situacion` indefinida. La simulación es la que demuestra SC-002/SC-003.

**Alternativas consideradas**: ignorar el paso (rompería el estado); elegir siempre la primera variante (sesgaría el balance).

## R7 · Contenido a añadir

**Decisión**: Añadir al banco de verano:

- **2 situaciones de cambio de modalidad**, una por dirección:
  - `v_salto_a_comparsista` (filtrada a `modalidades: ["chirigotero"]`) → opción que aplica `cambiaModalidad: "comparsista"`.
  - `v_salto_a_chirigotero` (filtrada a `modalidades: ["comparsista"]`) → opción que aplica `cambiaModalidad: "chirigotero"`.
  - Ambas con 2 opciones (seguir / cambiar), `minAno` ≥ 4 y frecuencia baja. **No** `unicaVez`: pueden reaparecer tras rechazarlas y permiten cambiar y volver.
- **Situaciones de cambio de variante**, filtradas por la variante de partida, con una opción que aplica `cambiaVariante` a otra variante de la misma modalidad, en cualquier dirección y repetibles. Se arranca con un conjunto semilla revisable (2-4 situaciones) y el catálogo completo crece en el backlog de contenido. Para el jugador son decisiones normales (el título no menciona la variante).

**Rationale**: desbloquea la evolución narrable que necesita la tarjeta (007) y permite ir y volver entre variantes, con el mínimo contenido revisable; el catálogo completo de transiciones queda como backlog de contenido.

**Alternativas consideradas**:
- Cambiar la variante según flags de decisiones existentes: más complejo y menos controlable; el usuario pidió que fuera "una situación".

## R8 · Impacto en la UI

**Decisión**: La isla añade una pantalla `"cambio-variante"` que reutiliza el componente `ElegirVariante` con las variantes de `paso.modalidad`. `presentacion.ts` aporta el texto del paso. El indicador de contexto no cambia.

**Rationale**: mínimo código nuevo; la pantalla de variante ya existe y es accesible (botones ≥ 44 px, foco visible).

**Alternativas consideradas**: crear un componente nuevo; innecesario.
