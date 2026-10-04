# Contrato — Presentación y compartir (feature 007)

La UI **no calcula lógica de juego**: renderiza la `TarjetaFinal` que produce el motor y acciona compartir.

## Componente `Tarjeta.svelte` (`src/juego/Tarjeta.svelte`)

```ts
interface Props {
  tarjeta: TarjetaFinal
}
```

Reutilizado por la isla (`FinCarrera.svelte`) y por `/r/[codigo].astro`. Sin directiva `client:*` en Astro no se envía JS.

### Composición (adaptación de la referencia, sin número héroe)

| Zona | Contenido | Requisito |
|---|---|---|
| Identidad | Nombre/apodo (u "Anónimo" si `nombre === null`), modalidad y variante finales | FR-005, FR-027 |
| Datos destacados | (a) primeros premios del COAC, (b) mejor posición en el COAC si no hay premio COAC, (c) otros premios por tipo con recuento | FR-029 |
| Fila de trayectoria | Chips inicio → cambios → final (modalidad/variante + año) | FR-028 |
| Trayectoria sin cambios | Texto neutro "toda la carrera en <modalidad> · <variante>"; nunca inventar cambios | US2 esc. 4 |
| Premios | Primeros premios COAC con año, **separados** de otros premios (por tipo, con recuento; los tipos no ganados no aparecen) | FR-007 |
| Narración | Exactamente tres hitos (texto + año cuando exista) y la frase de cierre | FR-011, FR-012 |
| Pie | Marca de agua con la dirección del juego y llamada a la acción para jugar | FR-022, FR-025 |

- **No** hay valoración global ni número héroe (FR-026).
- Los tipos sin premio se omiten; nunca "0 premios" / "0 veces" (FR-007).
- Mobile-first, sin scroll horizontal; WCAG 2.2 AA.

## Panel de compartir (`FinCarrera.svelte`)

| Acción | Comportamiento | Requisito |
|---|---|---|
| Compartir nativo | `navigator.share` con texto + URL; añade la imagen cuando el destino la admite | FR-021, FR-030 |
| Copiar | Copia texto y enlace al portapapeles | FR-030 |
| Descargar imagen | Descarga el PNG 9:16 (`/api/og/<codigo>.png?t=9x16`, vía `urlImagenOg`) | FR-019, FR-030 |
| Enlace | Copia o abre `/r/<codigo>` | FR-018, FR-030 |
| Ocultar nombre | Toggle que aplica `sinNombre(tarjeta)` y re-codifica antes de compartir | FR-027 |

- El código y la URL se calculan con el codec del motor (`codificar`), no en la vista.
- Sin fallback para navegadores sin Web Share (T16).
- El texto a compartir no contiene datos técnicos ni internos (FR-023).
- La acción de imagen se renombró a **«Descargar imagen»** (feature 020) y solo ofrece 9:16.
- La imagen OG (endpoint) **calca la tarjeta** (`Tarjeta.svelte`); ver `rutas.md`.

## Estado (`estado.svelte.ts`)

- El paso `fin` expone `tarjeta: TarjetaFinal` (antes `resumen`).
- Acciones nuevas: `ocultarNombre()` (recalcula la tarjeta sin nombre) y `codigoYEnlace()` (código + URL) reutilizando `codificar`.
- La pantalla de fin renderiza `Tarjeta.svelte` + panel de compartir.

## Accesibilidad (WCAG 2.2 AA)

- Botones con nombre accesible y foco visible; área táctil ≥ 44 px.
- Contraste suficiente; no depender solo del color para premios o hitos.
- Estructura semántica (encabezados y listas), texto alternativo en imágenes.
- Verificable con una auditoría automática en el E2E de compartir.
