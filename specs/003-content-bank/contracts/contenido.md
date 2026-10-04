# Contrato: datos de contenido

## Superficie pública

`src/content/index.ts` exporta:

| Símbolo | Tipo | Garantía |
|---|---|---|
| `bancoContenido` | `BancoContenido` | Banco ensamblado y **validado** con Zod. Compatible con el motor. |
| `BancoContenidoSchema` | `ZodType` | Esquema raíz (reutilizable por quien quiera validar). |
| `SituacionSchema`, `OpcionSchema`, `CondicionalSchema`, `RequisitoSchema` | `ZodType` | Esquemas por entidad. |
| `CATEGORIAS`, `MOMENTOS`, `TIPOS_DECISION`, `ATRIBUTOS`, `MODALIDADES_*` | constantes | Listas cerradas de valores válidos. (`CATEGORIAS`/`TIPOS_DECISION` retirados el 2026-10-04.) |

## Disposición de ficheros

```text
src/content/
├── schema.ts
├── modalidades.ts
├── decisiones/verano.ts
├── decisiones/febrero.ts
├── condicionales/verano.ts
├── condicionales/febrero.ts
└── index.ts
```

Cada fichero de datos exporta un array tipado (`Situacion[]` / `Condicional[]`); `index.ts` los concatena y valida.

## Invariantes (fallan la construcción si se incumplen)

1. `id` único en todo el banco (situaciones + condicionales).
2. `momento` presente y en enum.
3. `opciones.length >= 2`, cada una con `titulo` y `subtitulo` no vacíos e `id` único en la situación.
4. Toda flag referenciada existe declarada en alguna opción.
5. `modalidades`/`variantes` solo con valores válidos.
6. Al menos una situación común por momento.
7. Sin situaciones inventadas: el conjunto coincide con `docs/03` + `docs/04`.
8. Sin nombres reales de personas o agrupaciones.

## Reglas de dependencia

- `content` NO importa de `engine` ni de `web`.
- `engine` NO importa de `content`.
- Consumidores (test de compatibilidad, `web`, `scripts/`) importan `content` y se lo inyectan al motor.

## Uso por el motor

```ts
import { bancoContenido } from "./content"
import { crearPartida } from "./engine"

const partida = crearPartida(input, bancoContenido)
```

No se requiere adaptación: la forma satisface `BancoContenido`.
