# Contrato · Volcado al juego (`npm run panel:volcar`)

Convierte el almacén JSON en los ficheros de contenido del juego `src/content/decisiones/**`.

## Comando

```bash
npm run panel:volcar          # valida, genera y escribe los 4 ficheros
npm run panel:volcar -- --check   # solo valida y comprueba que no habría cambios (no escribe)
```

## Módulo `src/panel/generador.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `agrupar(situaciones)` | `Record<Fichero, Situacion[]>` | Agrupa por `momento`+`tipo` y **ordena por `id`**. Función pura. |
| `serializar(nombre, situaciones)` | `string` | Genera el texto TS completo (cabecera + export) ya formateado. Función pura. |
| `volcar(almacen)` | `{ ficheros: Record<Fichero, string>, banco: BancoContenido }` | Valida el **banco completo** (almacén + condicionales/variantes/textos vigentes) y devuelve el contenido a escribir, sin tocar disco. Lanza `ErrorVolcado` con `{ ruta, mensaje }[]` si no valida. |
| `escribirVolcado(resultado)` | `void` | Escribe los 4 ficheros en `src/content/decisiones/**`. |

`Fichero` = `"verano" | "febrero"`.

## Garantías

- **Sin pérdida (FR-017/SC-005)**: `concatenar(agrupar(situaciones))` es deep-equal a `situaciones`.
- **Determinista e idempotente (FR-019/SC-006)**: mismo almacén → mismos bytes; ejecutar dos veces no
  cambia nada.
- **Formato estable**: 2 espacios, comillas dobles, coma final, salto final; compatible con Biome
  (no dispara `biome format`).
- **No toca** `condicionales/**`, `textos/**`, `variantes.ts` ni `index.ts`.
- **Atómico**: si el banco no valida, **no** sobrescribe ningún `.ts` (FR-018/SC-004).
- Los ficheros generados llevan cabecera `// GENERADO … no editar a mano.`

## Validación (reutilizada)

Se reutiliza `BancoContenidoSchema` de `src/content/schema.ts` construyendo el banco con:
`{ situaciones: almacen.situaciones, condicionales, variantes, modalidades, textosTarjeta }` leídos
del contenido vigente. Así se comprueban id único global, flags referenciadas, catálogo de variantes
y existencia de situación común por `momento`×`tipo`.

## Salida por consola

- Éxito: ficheros escritos y número de situaciones por fichero.
- Error: lista `ruta: mensaje` y **exit code 1**, sin escribir.
