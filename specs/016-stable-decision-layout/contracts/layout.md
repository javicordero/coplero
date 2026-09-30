# Contrato de layout — Bucle jugable (`/jugar`)

Interfaz observable que la UI del bucle debe cumplir y sobre la que se escriben los tests. Es un
contrato de presentación (no de datos ni de red).

## Ganchos estables (DOM)

| Selector | Elemento | Estado |
|----------|----------|--------|
| `[data-testid="juego"]` | Raíz de la isla; expone `data-pantalla`, `data-momento`, `data-ano` | existente |
| `[data-testid="indicador"]` | Indicador de contexto; expone `data-momento` | existente (nuevo nivel: overlay de `main`, ya **no** dentro de la sección) |
| `[data-testid="decision"]` | Sección de decisión | existente |
| `[data-testid="resultado"]` | Sección de resultado | existente |

Ganchos nuevos propuestos (para medir bloques sin depender de `tag`/clase):

| Selector | Bloque |
|----------|--------|
| `[data-bloque="titulo"]` | Bloque fijo del título |
| `[data-bloque="opcion"]` | Cada opción (`li`) |
| `[data-bloque="texto"]` | Bloque reservado del texto descriptivo |

## Invariantes verificables

1. **INV-1 — Indicador fijo**: el indicador está en la esquina superior izquierda y su `boundingBox`
   es el mismo en toda decisión y en el resultado (tolerancia 2 px). *(FR-001, FR-006)*
2. **INV-2 — Título fijo**: `boundingBox` de `[data-bloque="titulo"]` es el mismo en toda decisión
   (tolerancia 2 px). *(FR-002)*
3. **INV-3 — Opciones fijas**: `boundingBox` de la 1.ª y 2.ª `[data-bloque="opcion"]` es el mismo en
   toda decisión y con 2 o 3 opciones (tolerancia 2 px). *(FR-003)*
4. **INV-4 — Independiente del momento**: alternar `verano`↔`febrero` no cambia el indicador, el
   título ni las dos primeras opciones (**0 px**). *(FR-004, SC-004)*
5. **INV-5 — Resultado**: el `boundingBox` del indicador en `[data-testid="resultado"]` coincide con
   el de decisión (tolerancia 2 px) y muestra año y momento. *(FR-006, SC-005)*
6. **INV-6 — Sin desbordamiento horizontal**: `documentElement.scrollWidth ≤ innerWidth + 1` desde
   320 px. *(FR-008)*
7. **INV-7 — Sin desbordamiento de bloque**: se mide el desborde **real** (cajas de los
   descendientes), no `scrollHeight` (estos bloques lo reportan inflado ~4 px). Ningún bloque fijo
   deja que su contenido sobresalga de su caja; **excepción**: en las opciones, el texto puede rebasar
   la caja mientras no se solape con la opción siguiente. *(FR-007, FR-013)*
8. **INV-8 — Sin tipo en el indicador**: el indicador no contiene texto de tipo ni el atributo
   `data-tipo`. *(FR-014)*

## Reglas de implementación (no negociables)

- **Prohibido** `overflow: auto/scroll` en bloques (nada de scroll interno).
- **Prohibido** `-webkit-line-clamp` / `overflow: hidden` como recorte de texto.
- **Prohibido** autoajuste de `font-size` para encajar.
- El indicador MUST NOT vivir dentro de `[data-testid="decision"]`.
- El anclaje **no** puede depender de centrar un bloque de altura variable.
- Sin nuevas dependencias ni JS añadido (una sola isla).

## Compatibilidad

- Debe conservar contraste AA en los tres temas (verano claro, febrero oscuro, resultado acta) y el
  fondo estacional de la feature 015.
- El sol/luna permanecen en la esquina superior derecha como fondo; el indicador ocupa la izquierda.
- Debe respetar `prefers-reduced-motion` (la animación de entrada no altera la posición final).
