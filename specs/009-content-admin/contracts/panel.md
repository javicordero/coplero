# Contrato · Panel local (rutas dev-only)

Todas las rutas de este contrato son **solo de desarrollo**. En producción devuelven **404**.

## Guard común (`src/panel/guard.ts`)

```ts
export const esDesarrollo = (): boolean => import.meta.env.DEV
export const respuesta404 = (): Response => new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })
```

- En **página** (`prerender = false`): `if (!esDesarrollo()) return respuesta404()`.
- En **endpoint** (`prerender = false`): igual, antes de cualquier otra lógica.
- Ninguna página pública enlaza a `/panel`.

## `GET /panel`

- `prerender = false`.
- Fuera de desarrollo → 404. En desarrollo → HTML con `<Panel client:load />`.
- `noindex, nofollow` (meta) para que no se rastree si alguien lo abre en local con un túnel.

## `/api/panel/situaciones` (`prerender = false`)

### `GET` → `200 { situaciones: Situacion[] }`

Devuelve el almacén íntegro (el agrupado por momento lo hace la isla). Si no hay almacén,
`{ situaciones: [] }`.

### `POST` (crea)

Cuerpo: `{ situacion: Situacion }`.

- **201** con `{ situacion }` si valida.
- **422** con `{ errores: [{ ruta, mensaje }] }` si no valida (esquema, id duplicado, etc.).
- **500** con `{ errores: [...] }` ante fallo de escritura.

## `/api/panel/situaciones/:id` (`prerender = false`)

### `PUT` (actualiza)

Cuerpo: `{ situacion: Situacion }`. El `id` de la ruta debe coincidir con `situacion.id` (el id es
inmutable).

- **200** `{ situacion }` · **404** si no existe · **422** si no valida · **500** fallo de escritura.

### `DELETE` (elimina)

- **200** `{ id }` · **404** si no existe · **500** fallo de escritura.
- La confirmación previa es responsabilidad de la isla (FR-011).

## `/api/panel/importar` (`prerender = false`)

### `POST` → `200 { importadas: number }`

Ejecuta `importarBancoActual()` (ver `importador.md`): copia de seguridad e importación desde
`src/content/decisiones/**`. **422/500** con `{ errores }` si el banco actual no se puede leer.

## Formato de errores

Siempre `{ "errores": [ { "ruta": "opciones.1.efectos", "mensaje": "…" } ] }`, derivado de
`error.issues` de Zod (misma fuente que el build). La isla los muestra junto al campo cuando la ruta
lo permite y en un resumen si no.

## Códigos

| Código | Significado |
|---|---|
| 200 / 201 | éxito |
| 404 | no existe el recurso **o** el panel está fuera de desarrollo |
| 422 | validación |
| 500 | fallo de disco |
