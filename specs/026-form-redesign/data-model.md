# Data Model: Formulario del panel: secciones plegables y rediseño

**Feature**: `026-form-redesign` · **Date**: 2026-10-05

Esta feature **no cambia el modelo de datos** del juego ni del contenido. Solo introduce una abstracción
de interfaz (la sección plegable) y reorganiza el marcado del formulario.

## Modelo del dominio (SIN CAMBIOS)

No se tocan `Situacion`, `Condicional`, `Opcion`, `Flag`, `Partida` ni el esquema Zod de `content`. La
validación, el guardado y la carga se mantienen idénticos.

## Abstracción de UI: `SeccionPlegable`

Componente `src/panel-ui/Seccion.svelte` (no es una entidad de datos; es presentación).

| Prop | Tipo | Por defecto | Rol |
|---|---|---|---|
| `titulo` | `string` | — | Texto del encabezado (`<summary>`). |
| `tieneContenido` | `boolean` | `false` | Si `true`, muestra un indicador de que hay valores marcados. |
| `children` | `Snippet` | — | Contenido de la sección (Svelte 5). |

**Estado**: usa el estado nativo de `<details>` (plegado salvo que tenga `open`). No se fija `open`, así
que **siempre empieza plegada** (FR-005). El estado no se persiste (al re-renderizar, plegada de nuevo),
lo que es aceptable para una herramienta local.

**Regla del indicador** (FR-004): el formulario calcula `tieneContenido` a partir de los datos
vinculados:

| Sección | `tieneContenido` |
|---|---|
| Modalidades | `(borrador.modalidades?.length ?? 0) > 0` |
| Variantes | `(borrador.variantes?.length ?? 0) > 0` |
| Flags (opción) | `(opcion.flags?.length ?? 0) > 0` |

## Ubicación de las secciones

| Formulario | Secciones plegables | Campos visibles |
|---|---|---|
| `FormularioSituacion` | Modalidades, Variantes | id, momento, título, texto, minAno, peso, repetible, opciones |
| `FormularioCondicional` | Modalidades, Variantes | id, momento, título, texto, ventana, probabilidad, minAno, peso, repetible, requisito, opciones |
| `FormularioOpcion` | Flags | id, título, subtítulo, peso, saltaCOAC, excepción/efectos, cambiaModalidad, cambiaVariante |

## Invariantes

1. Plegar/desplegar **no** altera ni descarta valores (FR-011): el contenido sigue montado.
2. El indicador es **decorativo** para la vista (`aria-hidden`) pero con texto accesible.
3. No se introduce ningún campo nuevo ni se cambia el esquema.
