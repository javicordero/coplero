# Contrato · Volcado (situaciones + condicionales)

**Módulo**: `src/panel/generador.ts` · **Script**: `npm run panel:volcar`

## Ficheros generados

| Fichero | Exportación | Momento |
|---|---|---|
| `src/content/decisiones/verano.ts` | `situacionesVerano` | verano |
| `src/content/decisiones/febrero.ts` | `situacionesFebrero` | febrero |
| `src/content/condicionales/verano.ts` | `condicionalesVerano` | verano |
| `src/content/condicionales/febrero.ts` | `condicionalesFebrero` | febrero |

Todos con cabecera `// GENERADO por `npm run panel:volcar` — no editar a mano.` (los de condicionales
pasan a ser generados; hoy se editan a mano).

## Funciones

| Función | Firma | Comportamiento |
|---|---|---|
| `agruparSituaciones` | `(Situacion[]) => Record<Momento, Situacion[]>` | Filtra por momento, ordena por id. |
| `agruparCondicionales` | `(Condicional[]) => Record<Momento, Condicional[]>` | Ídem. |
| `serializar` | `(def, entidades) => string` | Salida determinista (mismo formato que hoy). |
| `volcar` | `(almacen) => ResultadoVolcado` | Valida el banco **completo del almacén** con `BancoContenidoSchema`. Devuelve los 4 ficheros sin tocar disco. |
| `escribirVolcado` | `(resultado) => string[]` | Escribe los 4 ficheros y devuelve rutas. |

## Garantías

- **Determinismo**: mismo almacén → mismo texto byte a byte.
- **Sin pérdida**: toda situación/condicional del almacén aparece en exactamente un fichero.
- **Validación previa**: si el banco no valida, lanza `ErrorVolcado` y no escribe nada.
- El banco validado se construye con las `situaciones` y `condicionales` **del almacén** (ya no mezcla
  los condicionales vivos de `content`).

## Script

- `npm run panel:volcar` → `volcar` + `escribirVolcado` + `biome format --write` + resumen por fichero.
- `npm run panel:volcar -- --check` → solo valida; no escribe.

## Tests (`src/panel/__tests__/generador.test.ts`)

- Agrupado sin pérdida para ambas entidades.
- Cada entidad cae en el fichero de su momento.
- `serializar` determinista.
- Banco inválido → `ErrorVolcado` (incluye condicionales inválidos).
- Volcado válido genera los 4 ficheros con cabecera.
