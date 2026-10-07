# Phase 1 · Data Model — Textos de situación adaptados al género

Sin entidades nuevas. Se añaden **campos opcionales** a `Situacion` y `Opcion` (tanto en
`src/content/schema.ts` como en `src/engine/types.ts`, que se mantienen en sincronía) y se describe la
**resolución** que hace el motor.

---

## 1. Entidades

### Situacion

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | `string` | Sí | Identificador estable; **no depende del género**. |
| `momento` | `"verano" \| "febrero"` | Sí | Ya existente. |
| `titulo` | `string` | Sí | **Forma por defecto** del título. |
| `texto` | `string` | Sí | **Forma por defecto** del texto (puede ser `""`). |
| `tituloFemenino` | `string` | No | **Variante femenina** del título. Ausente = usar `titulo`. |
| `textoFemenino` | `string` | No | **Variante femenina** del texto. Ausente = usar `texto`. |
| `opciones` | `Opcion[]` | Sí | Ya existente (mínimo 2). |
| `modalidades`, `variantes`, `minAno`, `unicaVez`, `peso` | — | No | Ya existentes, sin cambios. |

### Opcion

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | `string` | Sí | Identificador estable; **no depende del género**. |
| `titulo` | `string` | Sí | **Forma por defecto** del título. |
| `subtitulo` | `string` | Sí | **Forma por defecto** del subtítulo. |
| `tituloFemenino` | `string` | No | **Variante femenina** del título. Ausente = usar `titulo`. |
| `subtituloFemenino` | `string` | No | **Variante femenina** del subtítulo. Ausente = usar `subtitulo`. |
| `efectos`, `excepcion`, `flags`, `peso`, `saltaCOAC`, `cambiaModalidad`, `cambiaVariante` | — | No | Ya existentes, sin cambios. |

`Condicional extends Situacion`: hereda los campos femeninos sin tratamiento aparte (FR-009).

### Entidades del motor (salida pública) — sin cambios

- `SituacionPublica { id, momento, titulo, texto, opciones: OpcionPublica[] }`
- `OpcionPublica { id, titulo, subtitulo }`

`toPublica` rellena `titulo`/`texto`/`subtitulo` con la **forma ya resuelta**. La forma pública no
incorpora los campos femeninos.

---

## 2. Validación (Zod, `src/content/schema.ts`)

- Los cuatro campos se añaden como `z.string().optional()` dentro de sus `strictObject`.
- Un campo desconocido sigue **rechazándose** (strict).
- `""` o cadena con solo espacios es **válido** a nivel de esquema; el motor lo trata como ausente
  (R5). El panel no guarda vacíos.
- No se altera ninguna regla cruzada existente (ids únicos, flags, variantes, comunes por momento).

---

## 3. Tabla de resolución (comportamiento observable)

Sea `D` la forma por defecto y `F` la variante femenina (normalizando: `F` solo cuenta si no está
vacía ni en blanco).

| Género | `F` ausente/vacía | `F` presente |
|---|---|---|
| `masculino` | `D` | `D` |
| `femenino` | `D` | `F` |
| `no_binario` | `D` | `F` si `azar(campo) < 0.5`, si no `D` |

La resolución se aplica **independientemente a cada uno de los cuatro textos** (FR-007). Puede darse
mezcla dentro de una misma decisión y se acepta.

### Clave de azar (determinismo)

```
rngPara(seed, "genero", situacionId, campo)  →  número en [0, 1)
campo ∈ { "titulo", "texto", "opcion:<opcionId>:titulo", "opcion:<opcionId>:subtitulo" }
```

- La clave **no incluye** año ni contador → el mismo campo se resuelve igual siempre para esa semilla
  (reanudar/repetir muestra la misma forma).
- El token `"genero"` es un stream **nuevo**: no consume del de selección, condicionales ni COAC.

---

## 4. Estados y transiciones

No hay máquina de estados nueva. La resolución es una **función pura** aplicada al construir el paso
`decision` (`siguientePaso`). No muta la `Partida` ni añade estado serializado; por tanto
`VERSION_PARTIDA` no cambia.

---

## 5. Invariantes verificables

1. **INV-1**: para `masculino`, `toPublica` con contexto devuelve exactamente lo mismo que sin
   contexto (formas por defecto).
2. **INV-2**: para `femenino`, cada campo con `F` presente devuelve `F`; sin `F`, `D`.
3. **INV-3**: `F` vacía/en blanco equivale a ausente para cualquier género.
4. **INV-4**: para `no_binario`, repetir `toPublica` con la misma semilla/situación/campo da el mismo
   resultado.
5. **INV-5**: el contenido sin campos femeninos valida y produce los mismos textos que antes.

---

## 6. Volumen y rendimiento

- 4 campos opcionales por entidad; el banco actual (~decenas) no supone cambio apreciable de tamaño.
- La resolución realiza como máximo 4 tiradas `rngPara` por decisión (solo si el género es no
  binario). Coste despreciable.
