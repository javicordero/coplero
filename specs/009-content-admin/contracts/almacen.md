# Contrato · Almacén local (`content-admin/data/situaciones.json`)

## Formato

```jsonc
{
  "version": 1,
  "situaciones": [ /* Situacion[] conforme a src/content/schema.ts */ ]
}
```

- `version` es obligatorio y vale `1` en esta versión. Un valor distinto hace fallar la lectura
  (migración pendiente; no se inventa comportamiento).
- `situaciones` puede estar vacío. Los `id` de situación son únicos en todo el almacén.
- El objeto es **estricto**: campos desconocidos se rechazan (evita deriva silenciosa).

## Módulo `src/panel/almacen.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `RUTA_ALMACEN` | `string` | Ruta absoluta a `content-admin/data/situaciones.json`. |
| `existeAlmacen()` | `boolean` | `true` si el fichero existe. |
| `leerAlmacen()` | `Almacen` | Lee, parsea JSON y valida con `AlmacenSchema`. Si no existe, devuelve `{ version: 1, situaciones: [] }`. Si el JSON está corrupto o no valida, **lanza** `ErrorAlmacen` con detalle legible. |
| `escribirAlmacen(almacen)` | `void` | Valida, hace **copia de seguridad** y escribe **atómicamente** (temporal + `rename`). Si la validación falla, no escribe nada. |
| `copiaDeSeguridad()` | `string` | Copia el almacén actual a `backups/<ISO>.json` y devuelve la ruta. |

## Escritura segura

1. Serializa el almacén validado (2 espacios, salto final).
2. Escribe `.situaciones.json.tmp`.
3. `rename` sobre `situaciones.json` (atómico en el mismo volumen).

## Copias de seguridad

- Directorio `content-admin/data/backups/`, **ignorado en git**.
- Formato de nombre: `situaciones-YYYYMMDDTHHmmss.json`.
- Se crea una antes de cada escritura y antes de cada **importación**.

## Errores

- `ErrorAlmacen` (mensaje legible + `causa`): JSON inválido, versión desconocida o contenido que no
  cumple el esquema. Nunca se borra el fichero bueno ante un error.

## Git

- `content-admin/data/situaciones.json` → **versionado**.
- `content-admin/data/backups/` → **ignorado** (añadir a `.gitignore`).
- `content-admin/data/.gitkeep` → versionado para que exista la carpeta.
