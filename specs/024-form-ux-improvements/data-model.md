# Data Model: Mejoras de usabilidad del formulario de situaciones

**Feature**: `024-form-ux-improvements` · **Date**: 2026-10-05

Esta feature **no cambia** el modelo de datos del juego (`src/content/schema.ts`). Describe el modelo
del **almacén del panel** y las estructuras auxiliares de la interfaz.

---

## 1. Modelo del juego (SIN CAMBIOS — referencia)

### `Situacion` (idéntico a `src/content/schema.ts`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Único en el banco. No vacío. **Inmutable al editar.** Derivado del título al crear. |
| `momento` | `"verano" \| "febrero"` | Obligatorio. Determina el fichero de volcado. |
| `titulo` | `string` | No vacío. |
| `texto` | `string` | Puede ser `""`. |
| `opciones` | `Opcion[]` | Mínimo 2. |
| `modalidades?` | `Modalidad[]` | Filtro opcional. |
| `variantes?` | `string[]` | Filtro opcional. |
| `minAno?` | `number` | Entero positivo. |
| `unicaVez?` | `boolean` | **Sin cambios.** `true` = una sola vez por partida. La UI lo presenta invertido como "repetible". |
| `peso?` | `number` | Positivo. |

### `Opcion`

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Único dentro de su situación. **Inmutable al editar.** Derivado del título al crear. |
| `titulo`, `subtitulo` | `string` | No vacíos. |
| `efectos?` | `Partial<Record<Atributo, number>>` | Solo con `excepcion: true`. |
| `excepcion?` | `boolean` | Marca la excepción declarada. |
| `flags?` | `string[]` | Flags que la opción **deja**. Se eligen de la lista de flags declaradas. |
| `consume?` | `string[]` | Flags que la opción **consume**. Se eligen de la lista de flags declaradas. |
| `peso?`, `saltaCOAC?`, `cambiaModalidad?`, `cambiaVariante?` | — | Sin cambios. |

### `Condicional extends Situacion`

Añade:

| Campo | Tipo | Regla |
|---|---|---|
| `requiere` | `Requisito` | Discriminado (`flag`, `flagRepetida`, `faseAlcanzada`, `todas`, `alguna`, `ninguna`, `atributo`). |
| `ventanaAnos` | `number` | Entero positivo. |
| `probabilidad` | `number` | Entre 0 y 1. |
| `consumeFlag` | `boolean` | — |
| `prioridad?` | `number` | — |

**Origen de verdad del modelo**: `src/content/schema.ts` (`SituacionSchema`, `CondicionalSchema`,
`OpcionSchema`, `RequisitoSchema`). El panel **reutiliza** estos esquemas; no los duplica.

---

## 2. Almacén del panel (CAMBIOS)

`src/panel/esquema.ts`

### Antes (v1)

```jsonc
{
  "version": 1,
  "situaciones": [ /* Situacion[] */ ]
}
```

### Después (v2)

```jsonc
{
  "version": 2,
  "situaciones": [ /* Situacion[] */ ],
  "condicionales": [ /* Condicional[] */ ]
}
```

| Aspecto | Regla |
|---|---|
| `version` | Literal `2`. |
| `situaciones` | Puede estar vacío. Ids únicos entre situaciones **y** condicionales. |
| `condicionales` | Puede estar vacío. |
| Objeto | **Estricto** (campos desconocidos rechazados). |
| Unicidad | `superRefine` sobre la unión de ids de situaciones + condicionales (evita colisiones de id entre ambos tipos). |
| Migración v1→v2 | Un almacén `version: 1` se acepta y se migra a `{ version: 2, situaciones: <las mismas>, condicionales: [] }` al leer; se persiste como v2 en la siguiente escritura. No se inventan condicionales. |
| Validación cruzada | `BancoContenidoSchema.safeParse({ situaciones, condicionales, variantes, modalidades, textosTarjeta })` usando las situaciones y condicionales **del almacén** (antes: situaciones del almacén + condicionales vivos de `content`). |

### Ciclo de vida del almacén

```
(no existe) ──leer──▶ { version:2, situaciones:[], condicionales:[] }
version:1    ──leer──▶ migra a v2 en memoria (condicionales:[])
version:2    ──leer──▶ validada
crear/editar/eliminar ──▶ escribir (backup + .tmp + rename)
```

---

## 3. Estructuras auxiliares de la UI

### `CatalogoFlags`

Lista ordenada y sin duplicados de las flags **declaradas** por alguna opción (de situación o
condicional). Fuente: `flagsDeclaradas(banco)` de `src/content/informe.ts` (puro).

```ts
type CatalogoFlags = string[]   // p.ej. ["autor_grupo_consagrado", "tema_social", ...]
```

Se sirve en el payload del `GET` del banco (`payload.flags`) y alimenta `SelectorFlags.svelte`.

### `SelectorFlags` (propiedades)

| Prop | Tipo | Rol |
|---|---|---|
| `etiqueta` | `string` | Texto del control ("flags", "consume"). |
| `seleccion` | `string[] \| undefined` (`$bindable`) | Flags marcadas. `undefined`/vacío = ninguna. |
| `disponibles` | `string[]` | Catálogo de flags a ofrecer. |
| `permiteNuevas` | `boolean` | Si `true`, permite crear una flag nueva además de elegir las existentes (solo para `flags`; `consume` lo deja en `false`). |
| `ayuda?` | `string` | Texto de ayuda. |

Comportamiento: cero, una o varias; devuelve `undefined` si no hay ninguna (coincide con el esquema,
que usa `optional`). Si `disponibles` está vacío, muestra un aviso legible. Con `permiteNuevas`, una
flag nueva se añade al catálogo en memoria (FR-022) y queda disponible para el resto del formulario.

### `Borrador` (estado del formulario)

- `FormularioSituacion` y `FormularioCondicional` trabajan sobre un borrador clonado.
- Al crear: `id: ""`; al teclear `titulo`, si el id no se ha tocado a mano, se rellena con
  `derivarIdUnico(derivarId(titulo), usados)`.
- `repetible` (UI) ⇄ `unicaVez` (dato): `repetible = !(unicaVez ?? true)`. Al guardar,
  `unicaVez = repetible ? false : undefined` (o `true`).
- Los formularios de opción reciben `usadosDeOpciones` (ids de las otras opciones de la misma entidad)
  para desambiguar.

---

## 4. Contratos de derivación (funciones puras)

`src/panel/identificadores.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `derivarId` | `(texto: string) => string` | Slug: minúsculas, sin diacríticos, `[a-z0-9]`→`_`, colapsa y recorta `_`. Devuelve `""` si no queda nada. |
| `derivarIdUnico` | `(base: string, usados: ReadonlySet<string>) => string` | Si `base` libre, `base`; si no, `base_2`, `base_3`, … |

Restricciones: determinista, sin estado, sin `node:fs`, sin Zod. Importable por la isla.

---

## 5. Reglas de validación (heredadas, sin cambios)

- Menos de 2 opciones → rechazo.
- `efectos` sin `excepcion: true` (o al revés) → rechazo.
- Flag referenciada por un condicional y no declarada por ninguna opción → rechazo (banco cruzado).
- Variante fuera del catálogo → rechazo.
- Id duplicado (situación, condicional u opción) → rechazo.
- `probabilidad` fuera de `[0,1]` o `ventanaAnos` no positivo en un condicional → rechazo.
- Cobertura: al menos una situación común por momento → rechazo.

Estas reglas viven en `src/content/schema.ts` y `src/panel/crud.ts`; la feature solo **añade** la
validación de ids únicos conjuntos (situaciones + condicionales) en `AlmacenSchema`.
