# Contrato · UI del panel

**Componentes**: `src/panel-ui/*.svelte` · **API**: `src/pages/api/panel/*`

## Endpoints (solo desarrollo; 404 en producción)

| Método | Ruta | Cuerpo | Respuesta OK | Errores |
|---|---|---|---|---|
| `GET` | `/api/panel/situaciones` | — | `200 { situaciones, condicionales, flags }` | `500 { errores }` |
| `POST` | `/api/panel/situaciones` | `{ situacion }` | `201 { situacion }` | `422 { errores }` · `500` |
| `PUT` | `/api/panel/situaciones/[id]` | `{ situacion }` | `200 { situacion }` | `404` · `422` · `500` |
| `DELETE` | `/api/panel/situaciones/[id]` | — | `200 { id }` | `404` · `500` |
| `POST` | `/api/panel/condicionales` | `{ condicional }` | `201 { condicional }` | `422` · `500` |
| `PUT` | `/api/panel/condicionales/[id]` | `{ condicional }` | `200 { condicional }` | `404` · `422` · `500` |
| `DELETE` | `/api/panel/condicionales/[id]` | — | `200 { id }` | `404` · `500` |
| `POST` | `/api/panel/importar` | — | `200 { importadas }` | `500` |

- El `GET` devuelve el banco completo y el **catálogo de flags** (`flags: string[]`) para el
  multiselect, en una sola petición.
- Sobre de error uniforme: `{ "errores": [{ "ruta", "mensaje" }] }`.
- Todas las rutas llaman primero a `bloqueoFueraDeDesarrollo()`.

## Componentes

| Componente | Props principales | Rol |
|---|---|---|
| `Panel.svelte` | — | Carga banco + flags; conmutador de vista Situaciones/Condicionales; alta/edición/borrado. |
| `SelectorFlags.svelte` | `etiqueta`, `seleccion` ($bindable), `disponibles`, `permiteNuevas`, `ayuda?` | Multiselect de flags; con `permiteNuevas` admite crear una flag nueva. |
| `FormularioSituacion.svelte` | `inicial?`, `guardando`, `errores`, `alGuardar(s)`, `alCancelar()`, `flags: string[]`, `usados: Set<string>` | Alta/edición de situación; id derivado; casilla "repetible". |
| `FormularioCondicional.svelte` | igual + campos propios | Alta/edición de condicional (requisito, ventana, probabilidad, consumeFlag). |
| `FormularioOpcion.svelte` | `opcion` ($bindable), `indice`, `puedeEliminar`, `alEliminar()`, `flags: string[]`, `usados: Set<string>` | Opción; id derivado; `SelectorFlags` para `flags` y `consume`. |
| `DetalleSituacion.svelte` / `DetalleCondicional.svelte` | `entidad`, `alCerrar()` | Vista de solo lectura. |
| `TablasMomentos.svelte` | `grupos`, `tipo`, callbacks | Listado agrupado por momento con etiqueta situación/condicional. |

## Reglas de interacción

1. Al crear, el campo `id` empieza vacío y se rellena al teclear `titulo` si el diseñador no lo ha
   tocado a mano (`derivarIdUnico(derivarId(titulo), usados)`).
2. Si el id derivado difiere del slug "natural" por colisión, se muestra un aviso ("se ha ajustado a
   `…` para no repetir").
3. Al editar, el campo `id` está deshabilitado.
4. La casilla "repetible" mapea `repetible = !(unicaVez ?? true)`; al guardar, `unicaVez`.
5. `SelectorFlags` ofrece el catálogo; si está vacío, aviso legible y no bloquea (no hay flags). El selector de `flags` (dejar) usa `permiteNuevas` para admitir una flag nueva; el de `consume` no.
6. El formulario de condicionales reutiliza los mismos controles de opción y flag.

## Tests

- La lógica pura (slug, flags, esquema, crud, generador, importador) se cubre con Vitest.
- La UI no se cubre con tests automatizados (panel solo-dev; ver research R8).
