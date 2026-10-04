# Contrato · Formulario del panel (plegado y rediseño)

**Componentes**: `src/panel-ui/Seccion.svelte`, `FormularioSituacion.svelte`,
`FormularioCondicional.svelte`, `FormularioOpcion.svelte`, `SelectorFlags.svelte`,
`EditorRequisito.svelte`.

## Componente `Seccion.svelte`

```svelte
<Seccion titulo="Modalidades" tieneContenido={hayModalidades}>
  <!-- contenido -->
</Seccion>
```

| Prop | Tipo | Obligatorio | Comportamiento |
|---|---|---|---|
| `titulo` | `string` | sí | Encabezado del `<summary>`. |
| `tieneContenido` | `boolean` | no (`false`) | Muestra un indicador (punto + texto accesible) cuando hay valores. |
| `children` | `Snippet` | sí | Contenido de la sección; **permanece montado** al plegar. |

**Marcado**: `<details class="seccion"><summary>…</summary><div class="contenido">…</div></details>`,
sin atributo `open` (plegada por defecto).

## Reglas de interacción

1. **Plegado por defecto**: ninguna sección se abre sola, tenga o no contenido (FR-005).
2. **Indicador**: visible en el encabezado si `tieneContenido` (FR-004).
3. **Conservación**: plegar no desmonta el contenido; al guardar se conservan los valores (FR-011).
4. **Teclado**: `<summary>` es foco y se activa con Enter/Espacio (nativo) (FR-006, SC-002).
5. **Orden de tabulación**: el foco recorre encabezados y campos en orden lógico.

## Alcance

- **Incluye**: `FormularioSituacion`, `FormularioCondicional`, `FormularioOpcion`, `SelectorFlags`,
  `EditorRequisito` y el nuevo `Seccion`.
- **Excluye**: `TablasMomentos`, `DetalleSituacion`, `DetalleCondicional` y `Panel` (salvo lo
  imprescindible) (FR-007).

## Presentación

- **Identidad propia del formulario** (FR-012): paleta moderna distinta de las tablas del panel; el formulario no tiene por qué encajar con ellas.
- **Tipografía con fuentes del sistema** (FR-013): pila tipo `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; sin cargar ficheros.
- `summary` con chevron y **foco visible**.
- Rejilla responsive que colapsa a una columna en móvil; sin desbordes a 360 px (FR-008, SC-003).
- Sin dependencias nuevas (FR-010) y sin cambios de comportamiento/validación (FR-009).

## Validación

- `astro check` compila los `.svelte`; `biome check` los `.ts`; `vitest` no regresiona.
- Escenarios manuales del `quickstart.md` (abrir, plegar/desplegar, indicador, guardado, teclado,
  móvil).
