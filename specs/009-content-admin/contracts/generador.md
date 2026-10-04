# Contrato · Volcado al juego (`npm run panel:volcar`)

Convierte el almacén JSON (situaciones **y** condicionales) en los ficheros de contenido del juego
`src/content/decisiones/**` y `src/content/condicionales/**`.

> Actualizado por la feature 024 (2026-10-05): el panel gestiona el banco completo y los condicionales
> pasan a ser ficheros **generados** (antes se editaban a mano).

## Comando

```bash
npm run panel:volcar          # valida, genera y escribe los 4 ficheros
npm run panel:volcar -- --check   # solo valida y comprueba que no habría cambios (no escribe)
```

## Módulo `src/panel/generador.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `agruparPorMomento(entidades)` | `Record<Momento, T[]>` | Agrupa por `momento` y **ordena por `id`**. Genérico y puro. |
| `serializar(fichero, entidades)` | `string` | Genera el texto TS completo (cabecera + import + export). Puro. |
| `volcar(almacen)` | `{ ficheros: FicheroVolcado[], banco: BancoContenido }` | Valida el **banco completo del almacén** (situaciones + condicionales + variantes/modalidades/textos vigentes) y devuelve los 4 ficheros a escribir, sin tocar disco. Lanza `ErrorVolcado` con `{ ruta, mensaje }[]` si no valida. |
| `escribirVolcado(resultado)` | `string[]` | Escribe los ficheros en `src/content/{decisiones,condicionales}/**` y devuelve las rutas. |

Ficheros: `FICHEROS_SITUACIONES` (decisiones/verano.ts → `situacionesVerano`, decisiones/febrero.ts →
`situacionesFebrero`) y `FICHEROS_CONDICIONALES` (condicionales/verano.ts → `condicionalesVerano`,
condicionales/febrero.ts → `condicionalesFebrero`).

## Garantías

- **Sin pérdida (FR-017/SC-005)**: `concatenar(agruparPorMomento(entidades))` es deep-equal a las
  entidades del almacén.
- **Determinista e idempotente (FR-019/SC-006)**: mismo almacén → mismos bytes; ejecutar dos veces no
  cambia nada.
- **Formato estable**: 2 espacios, comillas dobles, coma final, salto final; compatible con Biome.
- **No toca** `textos/**`, `variantes.ts` ni `index.ts`.
- **Atómico**: si el banco no valida, **no** sobrescribe ningún `.ts` (FR-018/SC-004).
- Los ficheros generados llevan cabecera `// GENERADO … no editar a mano.`

## Validación (reutilizada)

Se reutiliza `BancoContenidoSchema` de `src/content/schema.ts` construyendo el banco con
`{ situaciones: almacen.situaciones, condicionales: almacen.condicionales, variantes, modalidades,
textosTarjeta }` (las variantes/modalidades/textos vigentes). Así se comprueban id único global, flags
referenciadas, catálogo de variantes y existencia de situación común por `momento`.

## Salida por consola

- Éxito: ficheros escritos y número de entidades por fichero (situaciones y condicionales).
- Error: lista `ruta: mensaje` y **exit code 1**, sin escribir.
