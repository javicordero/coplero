# Data Model: Rediseño integral del panel de contenido

**Feature**: `027-panel-redesign` · **Date**: 2026-10-05

Esta feature **no cambia el modelo de datos** del juego ni del contenido. Solo introduce una
abstracción de presentación (la identidad/tokens) y reorganiza el marcado de las vistas del panel.

## Modelo del dominio (SIN CAMBIOS)

No se tocan `Situacion`, `Condicional`, `Opcion`, `Flag`, `Partida` ni el esquema Zod de `content`. La
carga, validación, guardado e importación se mantienen idénticos.

## Identidad del panel: tokens

Fuente única: `src/panel-ui/estilos.css` (importado en `panel.astro`). Se declaran en `:root` y los
consumen todos los componentes.

| Token | Rol |
|---|---|
| `--panel-primary` | Color de marca (acciones principales, focos, acentos). |
| `--panel-primary-hover` | Estado hover del color de marca. |
| `--panel-surface` | Fondo de tarjetas, tablas y controles. |
| `--panel-border` | Bordes y separadores. |
| `--panel-text` | Texto principal. |
| `--panel-muted` | Texto secundario y ayudas. |
| `--panel-hover` | Fondo de estados hover sutiles. |
| `--panel-danger` | Errores y acciones destructivas. |
| `--panel-radius` | Radio de esquinas. |
| `--panel-gap` | Espaciado base. |

Base global: fondo de la página, color de texto y **tipografía del sistema** (sin cargar ficheros).

**Invariante (FR-002, SC-004)**: ningún componente redefine los valores de la identidad; todos usan
`var(--panel-*)`. Cambiar un token se refleja en todas las vistas.

## Vistas del panel

| Vista | Componente | Qué se rediseña |
|---|---|---|
| Carcasa | `Panel.svelte` | Cabecera, conmutador de vista, acción principal, estados (carga/error/vacío). |
| Listados | `TablasMomentos.svelte` | Tablas por momento; **contenedor con scroll horizontal** en móvil. |
| Detalle situación | `DetalleSituacion.svelte` | Tarjeta de campos + opciones. |
| Detalle condicional | `DetalleCondicional.svelte` | Tarjeta de campos + opciones. |
| Formularios | `Seccion`, `FormularioSituacion`, `FormularioCondicional`, `FormularioOpcion`, `SelectorFlags`, `EditorRequisito` | Pasan a consumir los tokens compartidos. |

## Invariantes

1. **Solo presentación**: no cambia ningún comportamiento (FR-009).
2. **Sin desbordes de página** a 360 px; las tablas se desplazan dentro de su contenedor (FR-006, SC-002).
3. **Foco visible** y orden de tabulación lógico (FR-008, SC-003).
4. **Sin dependencias** ni ficheros de fuente (FR-010).
5. El **juego no se toca** (FR-011).
