# Phase 1 — Data Model: Tarjeta final de carrera y compartir

Convenciones: todo TypeScript puro, serializable y sin clases. `engine` no importa de `content` ni de `web`. Ningún tipo de este documento incluye campos de `destino`.

## Entidades

### TarjetaFinal

Agregado de solo lectura que representa una carrera terminada tal y como se le muestra al jugador. Lo produce `construirTarjeta(p, banco)`.

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | `string \| null` | Nombre/apodo saneado (≤ 24 caracteres). `null` cuando el jugador elige ocultarlo antes de compartir. |
| `modalidadInicial` | `Modalidad` | De `trayectoria.modalidadInicial`. |
| `modalidadFinal` | `Modalidad` | Modalidad vigente al terminar. |
| `varianteInicial` | `VarianteId` | De `trayectoria.varianteInicial`. |
| `varianteFinal` | `VarianteId` | Variante vigente al terminar. |
| `cambios` | `CambioTrayectoria[]` | Copia de `trayectoria.cambios`, orden cronológico. |
| `anosDeCarrera` | `number` | `temporadas.length` (años vividos). |
| `anosEnActivo` | `number` | Temporadas con `!fueraDeConcurso`. |
| `anosSinConcursar` | `number[]` | Años con `fueraDeConcurso`, orden ascendente. |
| `mejorFase` | `FaseCOAC` | Mejor fase entre las temporadas en concurso (por defecto `preliminares`). |
| `mejorPuesto` | `number \| null` | Menor `puesto` entre las temporadas en concurso; `null` si nunca concursó. |
| `primerosPremios` | `LogroCOAC[]` | Resultados de podio/ganador del COAC, con año y puesto. |
| `otrosPremios` | `PremioResumen[]` | Premios ajenos **agrupados por tipo** con recuento. Nunca incluye tipos con `veces === 0`. |
| `hitos` | `HitoTarjeta[]` | **Exactamente 3**, en orden de prioridad; si faltan, se completan con hitos neutros. |
| `fraseCierre` | `string` | Frase de cierre elegida de forma determinista por el motor. |

### LogroCOAC

Resultado destacado del COAC (primer premio o podio).

| Campo | Tipo | Reglas |
|---|---|---|
| `ano` | `number` | Año del resultado. |
| `puesto` | `number` | Puesto dentro de la final (1 = primer premio; 2-3 = podio). |
| `tipo` | `"primer_premio" \| "podio"` | `primer_premio` si `puesto === 1`; `podio` si `puesto` 2-3. |

Derivación: temporadas con `fase === "final"` y `puesto <= 3` (las temporadas con `puesto === 4` son finalistas sin premio y no entran aquí; se narran como hito de final).

### PremioResumen

Premio ajeno agrupado por tipo para la fila de premios.

| Campo | Tipo | Reglas |
|---|---|---|
| `tipo` | `PremioTipo` | `copla_para_andalucia`, `aguja_de_oro` o `candela_y_espino`. |
| `veces` | `number` | Nº de veces ganado. MUST ser ≥ 1. |
| `anos` | `number[]` | Años en que se ganó, orden ascendente. |

### HitoTarjeta

Suceso narrado en la tarjeta.

| Campo | Tipo | Reglas |
|---|---|---|
| `tipo` | `TipoHito` | Categoría del hito (ver enum). |
| `ano` | `number \| null` | Año asociado; `null` para hitos de total (p. ej. duración). |
| `texto` | `string` | Texto ya resuelto desde el catálogo de contenido, con `{ano}` sustituido. |

### Enumeraciones

```ts
type TipoHito =
  // destacados (orden de prioridad)
  | "ganar_coac" | "podio" | "final"
  | "premio_aguja" | "premio_copla" | "premio_candela"
  | "cambio_modalidad" | "cambio_variante" | "anos_sin_concursar"
  // neutros (relleno)
  | "debut" | "duracion" | "mejor_resultado"

type BucketFrase =
  | "campeon" | "podio" | "finalista"
  | "semifinales" | "cuartos" | "preliminares" | "retirada"
```

Selección determinista (sin `seed`): el motor ordena los hitos candidatos por prioridad (ganar el COAC → podio → final → premio ajeno con la Aguja de oro destacada → cambio de modalidad → cambio de variante → años sin concursar → neutros) y toma los **3 primeros**. La variante de texto de cada tipo y la frase del bucket se eligen con un hash estable FNV-1a sobre una cadena canónica de campos visibles (`mejorFase`, `anosEnActivo`, número de premios, número de cambios).

## Contenido inyectado (feature 007)

### TextosTarjeta (`src/content/textos/tarjeta.ts`)

| Campo | Tipo | Reglas |
|---|---|---|
| `hitos` | `Record<TipoHito, string[]>` | Al menos una plantilla por tipo. Puede contener `{ano}`. |
| `frases` | `Record<BucketFrase, string[]>` | Al menos una frase por bucket. |

Validado con `TextosTarjetaSchema` (Zod) y añadido a `BancoContenido.textosTarjeta`. El motor usa la primera plantilla como respaldo si un tipo falta o el hash sale de rango.

## Extensiones a entidades existentes

### `Paso` (`engine/types.ts`)

| Cambio | Detalle |
|---|---|
| `fin` | Pasa de `{ tipo: "fin"; resumen: ResumenCarrera }` a `{ tipo: "fin"; tarjeta: TarjetaFinal }`. |

### `BancoContenido` (`engine/types.ts` y `content/schema.ts`)

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `textosTarjeta` | `TextosTarjeta?` | Catálogo de textos de la tarjeta. Sin él, el motor cae a textos neutros internos. |

### Tipos retirados

| Tipo | Motivo |
|---|---|
| `ResumenCarrera` | Sustituido por `TarjetaFinal`; `construirResumen` se retira a favor de `construirTarjeta`. |

## Código de partida (codec)

### Payload

```ts
interface CodigoTarjeta {
  v: number          // VERSION_CODIGO (versión del esquema del código)
  t: TarjetaFinal    // tarjeta completa (con nombre: null si se ocultó)
}
```

- Serialización: `JSON.stringify` → `fflate` (`strToU8` + `deflateSync`) → **base64url** puro.
- No contiene `seed`, ni `destino`, ni la `Partida`.
- `VERSION_CODIGO` es independiente de `VERSION_PARTIDA`.

### ErrorCodigo

```ts
type ErrorCodigo =
  | { codigo: "CODIGO_INVALIDO" }
  | { codigo: "VERSION_CODIGO_INCOMPATIBLE"; versionRecibida: number; versionEsperada: number }
```

## Reglas de validación

1. `hitos.length === 3` siempre.
2. Ningún campo de `destino` (techo, suelo, carisma, volatilidad, anoPico, milagro) aparece en `TarjetaFinal` ni en el payload del código.
3. `otrosPremios` nunca contiene entradas con `veces === 0` (los tipos no ganados se omiten).
4. `primerosPremios` se separa siempre de `otrosPremios`; nunca se suman entre sí.
5. `nombre`, si no es `null`, está saneado y limitado a 24 caracteres.
6. `mejorPuesto` solo existe si hubo al menos una temporada en concurso.
7. El codec es determinista: misma `TarjetaFinal` ⇒ mismo código, y `decodificar(codificar(t))` reproduce `t`.
8. El código de una carrera completa MUST caber en < 2000 caracteres (SC-008).

## Impacto en persistencia

- **Sin cambios**: la tarjeta es un agregado derivado; no se persiste. `VERSION_PARTIDA` sigue en 2 y `VERSION_GUARDADO` en 1.
- El código compartido tiene **su propia versión** (`VERSION_CODIGO`); un código de versión desconocida no se interpreta (frase amable + enlace a `/jugar`).
