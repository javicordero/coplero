# Contrato · Almacén del panel (v2)

**Módulo**: `src/panel/esquema.ts`, `src/panel/almacen.ts`

## Formato en disco (`content-admin/data/situaciones.json`)

```jsonc
{
  "version": 2,
  "situaciones": [ /* Situacion[] conforme a src/content/schema.ts */ ],
  "condicionales": [ /* Condicional[] conforme a src/content/schema.ts */ ]
}
```

- `version` es obligatorio y vale `2`. Un valor distinto de `1` o `2` hace fallar la lectura.
- `situaciones` y `condicionales` pueden estar vacíos.
- Los ids son **únicos en la unión** de situaciones y condicionales.
- El objeto es **estricto**: campos desconocidos se rechazan.

## Migración v1 → v2

- Un almacén `version: 1` es aceptado por el lector y **migrado en memoria** a
  `{ version: 2, situaciones: <las mismas>, condicionales: [] }`.
- La migración **no inventa** condicionales; para incorporarlos hay que ejecutar
  `npm run panel:importar`.
- La siguiente escritura persiste ya en v2.

## Módulo `src/panel/almacen.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `RUTA_ALMACEN` | `string` | Ruta absoluta a `content-admin/data/situaciones.json`. |
| `existeAlmacen()` | `boolean` | `true` si el fichero existe. |
| `leerAlmacen()` | `Almacen` | Lee, parsea y valida; migra v1→v2 en memoria. Si no existe, `{ version: 2, situaciones: [], condicionales: [] }`. JSON corrupto o inválido → `ErrorAlmacen` legible. |
| `escribirAlmacen(almacen)` | `void` | Valida, hace **copia de seguridad** y escribe **atómicamente** (`.tmp` + `rename`). |
| `copiaDeSeguridad()` | `string` | Copia a `backups/<ISO>.json`. |

## Validación (`AlmacenSchema`)

- `version: z.literal(2)` (con aceptación de v1 en el lector).
- `situaciones: z.array(SituacionSchema)`.
- `condicionales: z.array(CondicionalSchema)`.
- `superRefine`: ids únicos en la unión.

## Errores

- `ErrorAlmacen`: JSON inválido, versión desconocida o contenido que no cumple el esquema. Nunca se
  borra el fichero bueno ante un error.

## Git

- `content-admin/data/situaciones.json` → versionado.
- `content-admin/data/backups/` → ignorado.

## Tests (`src/panel/__tests__/almacen.test.ts`, `esquema.test.ts`)

- Un almacén v1 se migra a v2 con `condicionales: []`.
- Un almacén v2 se lee tal cual.
- Id duplicado entre situación y condicional → rechazo.
- `version: 3` → rechazo.
- Escritura atómica + backup (ya cubierto; se mantiene).
