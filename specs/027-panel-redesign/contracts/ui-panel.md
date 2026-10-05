# Contrato · Identidad y vistas del panel

**Superficie**: `src/pages/panel.astro` + `src/panel-ui/**` (isla Svelte solo-dev).

## Hoja de identidad `src/panel-ui/estilos.css`

- Importada **una vez** desde `panel.astro` (estilo global).
- Declara en `:root` los tokens `--panel-*` (ver `data-model.md`) y la base (fondo, color, tipografía del sistema).
- **Ningún componente** redefine esos valores; todos los consumen con `var(--panel-*)` (FR-002).

## Vistas y su contrato

| Vista | Contrato |
|---|---|
| `Panel.svelte` (carcasa) | Cabecera con título y contador; conmutador de vista con estado activo; acción principal; estados de carga/error/vacío legibles. En **móvil** la cabecera se **apila** (acciones y conmutador a ancho completo); en escritorio, una fila. No define el fondo global (lo hace `estilos.css`). |
| `TablasMomentos.svelte` | Tabla por momento dentro de un **contenedor con `overflow-x: auto`**; encabezados y filas con la identidad; acciones (abrir/editar/eliminar) accesibles por teclado. |
| `DetalleSituacion.svelte` / `DetalleCondicional.svelte` | Tarjeta con cabecera, campos (`dl`) y opciones; identidad común. |
| Formularios (`Seccion`, `Formulario*`, `SelectorFlags`, `EditorRequisito`) | Consumen `var(--panel-*)`; mismo comportamiento que en la 026 (plegado, indicador, etc.). |

## Reglas de presentación

1. **Identidad única** en todas las vistas (FR-001).
2. **Sin desbordes de página** a 360 px; la tabla se desplaza **dentro de su contenedor** (FR-004/FR-006).
3. **Foco visible** y orden lógico de tabulación (FR-008).
4. **Estados** de carga/error/vacío con la identidad (FR-007).
5. **Sin dependencias** ni ficheros de fuente; tipografía del sistema (FR-010).
6. **Solo presentación**: sin cambios de comportamiento (FR-009).

## Alcance

- **Incluye**: `panel.astro`, `estilos.css`, `Panel.svelte`, `TablasMomentos.svelte`, `DetalleSituacion.svelte`, `DetalleCondicional.svelte` y los componentes del formulario.
- **Excluye**: el juego (`/jugar`), las páginas públicas, el motor y el contenido (FR-011).

## Validación

- `astro check` compila los `.svelte`; `biome check` los `.ts`; `vitest` no regresiona.
- Escenarios manuales del `quickstart.md`.
