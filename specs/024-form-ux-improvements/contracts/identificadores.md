# Contrato · Derivación de identificadores

**Módulo**: `src/panel/identificadores.ts` (puro; sin `node:fs`, sin Zod en runtime). Importable por la
isla Svelte y por el servidor.

## Superficie pública

| Símbolo | Firma | Garantía |
|---|---|---|
| `derivarId` | `(texto: string) => string` | Devuelve el slug del texto. Determinista y sin efectos. |
| `derivarIdUnico` | `(base: string, usados: ReadonlySet<string>) => string` | Devuelve `base` si está libre; si no, `base_2`, `base_3`, … hasta uno libre. |

## Algoritmo de `derivarId`

1. `texto.normalize("NFD")` para separar diacríticos.
2. Minúsculas.
3. Eliminar marcas de combinación `[\u0300-\u036f]`.
4. Sustituir todo lo que no sea `[a-z0-9]` por `_`.
5. Colapsar `_+` en `_` y recortar `_` de los extremos.
6. Devuelve `""` si el resultado queda vacío (título vacío o solo signos).

### Ejemplos

| Entrada | Salida |
|---|---|
| `Te dejan fuera por un punto` | `te_dejan_fuera_por_un_punto` |
| `¿Vas a ir al Falla?` | `vas_a_ir_al_falla` |
| `Un cuplé no ha entrado` | `un_cuple_no_ha_entrado` |
| `  ...  ` | `""` |

## Algoritmo de `derivarIdUnico`

```
si base === ""                    → ""            (no inventa; la UI bloquea el guardado)
si base ∉ usados                  → base
n = 2; mientras `${base}_${n}` ∈ usados: n++
                                  → `${base}_${n}`
```

## Reglas

- No sobrescribe un id ya fijado por el diseñador (la UI decide cuándo llamar).
- No normaliza ids existentes: solo genera propuestas nuevas.
- Maneja `Set` vacío → devuelve `base` (o `""`).
- Independiente del orden de `usados`.

## Tests (`src/panel/__tests__/identificadores.test.ts`)

- Slugs con acentos, mayúsculas, signos y espacios.
- Cadena vacía / solo signos → `""`.
- Sin colisión → `base`.
- Colisión simple → `base_2`; dobles → `base_3`.
- Colisión con hueco (`base_2` libre pero `base_3` ocupado) → `base_2`.
- Determinismo (misma entrada y conjunto → mismo resultado).
