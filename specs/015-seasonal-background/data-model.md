# Phase 1 — Modelo del fondo estacional (tres estilos)

**Feature**: 015-seasonal-background | **Fecha**: 2026-09-30

Sin datos de juego nuevos. Las "entidades" son el vocabulario visual y sus reglas. Todo color se declara **una vez** en `src/ui/tokens.css` (canónico) y se refleja en `src/ui/tokens.ts` (paridad V-03); el remapeo, los fondos, las gotas y el teatro se aplican en `Juego.svelte`.

---

## E1 · Paleta de verano (tema claro)

```ts
interface TokenVerano {
  nombre: string   // "--c-verano-*"
  valor: string    // hex de 6 dígitos en minúsculas
  rol: string      // "cielo", "arena", "sol", "texto", "superficie", "borde", "acento-texto"
  sobre: string[]  // primer plano que debe cumplir AA sobre él
}
```

| Nombre | Rol | Debe cumplir (sobre él) |
|---|---|---|
| `--c-verano-cielo` | fondo superior (cielo) | `--c-verano-texto` ≥ 4.5:1 · `--c-verano-texto-suave` ≥ 4.5:1 |
| `--c-verano-arena` | franja inferior (playa) | `--c-verano-texto` ≥ 4.5:1 · `--c-verano-texto-suave` ≥ 4.5:1 |
| `--c-verano-sol` | disco del sol (esquina superior derecha) | decorativo |
| `--c-verano-texto` | texto principal (oscuro) | ≥ 4.5:1 sobre cielo y arena |
| `--c-verano-texto-suave` | texto secundario (oscuro) | ≥ 4.5:1 sobre cielo y arena |
| `--c-verano-superficie` | tarjetas/opciones | `--c-verano-texto` ≥ 4.5:1 |
| `--c-verano-superficie-alta` | hover/elevación (crema cálida de sol) | `--c-verano-texto` ≥ 4.5:1 |
| `--c-verano-separador` | filete decorativo | exento (WCAG 1.4.11) |
| `--c-verano-borde-control` | contorno de control | ≥ 3:1 sobre cielo/arena/superficies |
| `--c-verano-acento-texto` | acento usado como texto (naranja oscuro) | ≥ 4.5:1 sobre cielo/arena |
| `--c-verano-acento-borde` | contorno de hover (naranja vivo) | ≥ 3:1 sobre superficies claras |

Además, las **escenas** (D7/D8) usan tokens **decorativos** (sin umbral de contraste): `--c-verano-mar`, `--c-verano-mar-hondo`, `--c-verano-espuma`, `--c-verano-nube`, `--c-verano-arena-humeda`, `--c-verano-arena-sombra`, `--c-verano-concha` y la paleta festiva (`--c-verano-rojo/naranja/amarillo/verde/turquesa/azul/rosa/coral/lila/metal`). En invierno: `--c-invierno-luna`, `--c-invierno-nube`, la paleta `--c-carnaval-oro/magenta/turquesa/rojo/azul/verde/violeta/naranja` y los tonos del Falla (`--c-falla-piedra`, `--c-falla-luz`, `--c-falla-sombra`, `--c-falla-camino`). Los elementos que caen bajo el texto (`--c-verano-cielo`, `--c-verano-arena` en claro; el negro de `--c-fondo` en oscuro) deben cumplir AA con su texto (V-09), por lo que la escena mantiene los elementos claros por debajo del bloque de decisión y, en febrero, las nubes son oscuras.

> **Ilustración con paleta propia**: `FondoVerano.svelte` y `FondoFebrero.svelte` se tratan como **superficie de ilustración** (excluida de V-04, como `panel-ui`): pueden declarar matices propios del dibujo sin pasar por el sistema de tokens. El resto de componentes MUST usar tokens.

---

## E2 · Paleta de acta (resultado)

```ts
interface TokenActa {
  nombre: string  // "--c-acta-*"
  valor: string   // hex de 6 dígitos
  rol: string     // "papel" | "tinta" | "linea" | "sello"
}
```

| Nombre | Rol |
|---|---|
| `--c-acta-papel` | papel crema (fondo del acta) |
| `--c-acta-papel-alta` | papel para la "hoja"/superficie |
| `--c-acta-tinta` | tinta principal (texto oscuro) |
| `--c-acta-tinta-suave` | tinta secundaria y contornos |
| `--c-acta-linea` | líneas/filetes decorativos del documento |
| `--c-acta-sello` | rojo de sello (acento de texto) |

El acta es un tema **claro**: el texto es tinta oscura sobre papel. `--c-acta-tinta` y `--c-acta-tinta-suave` MUST cumplir AA sobre `--c-acta-papel` (V-09); `--c-acta-linea` es decorativo (exento).

---

## E3 · Remapeo temático (aplicación en la isla)

```ts
interface RemapeoTema {
  selector: string          // "main[data-momento='verano']"
  sobrescribe: Record<string, string>  // "--c-texto" → "var(--c-verano-texto)", …
  colorScheme: "light" | "dark"
}
```

- **Verano** (`main[data-momento="verano"]`): reasigna `--c-texto`, `--c-texto-suave`, `--c-superficie`, `--c-superficie-alta`, `--c-separador`, `--c-borde-control`, `--c-acento-texto` a los `--c-verano-*`; `color-scheme: light`.
- **Febrero** (`main[data-momento="febrero"]`): hereda `:root` (oscuro); `color-scheme: dark`.
- **Resultado** (`main[data-pantalla="resultado"]`): tema oscuro (sin remapeo), más el fondo de teatro.

---

## E4 · Elementos decorativos

```ts
interface ElementoFondo {
  selector: string        // "main[data-momento='verano']" | "main[data-momento='febrero']" | "main[data-pantalla='resultado']"
  capas: string[]         // background-image compuesto
  extras?: "gotas-lluvia" // solo febrero
}
```

- **Verano**: bandas `linear-gradient` cielo → mar (con línea de horizonte) + **escena de playa** `FondoVerano.svelte` en SVG inline: sol con rayos, nubes, gaviotas, oleaje, orilla ondulada, arena moteada, conchas y sombrilla. Decorativo y sin peticiones extra.
- **Febrero**: noche oscura + resplandor turquesa inferior + **escena de carnaval** `FondoFebrero.svelte` en SVG inline: luna (círculo, esquina superior derecha), estrellas, nubes nocturnas oscuras, serpentinas, antifaces, plumeros (volando y tirados), Teatro Falla iluminado y camino en perspectiva; **gotas de lluvia** (elementos finos de 1 px con gradiente `transparent → pálido`, escalonados y animados por un único `@keyframes`). Decorativo y sin peticiones extra.
- **Resultado**: papel claro (acta) con líneas de documento y membrete "COAC"; texto en tinta oscura.

**Reglas de validación**

1. Elementos MUST ser decorativos (sin `aria-*`, sin información; si desaparecen, la pantalla se entiende igual).
2. La lluvia MUST desactivarse con `prefers-reduced-motion` (FR-011) y MUST usar `transform` (promovida a compositor), no propiedades de layout.
3. Los elementos MUST degradarse sin scroll ni bandas a 320 px.
4. Sol y luna MUST anclarse a la **esquina superior derecha** y ser círculos simples (sin halo).

---

## E5 · Momento, pantalla y tema (referencia)

- `Partida.momento: "verano" | "febrero"` → `data-momento` (estilo verano/febrero).
- `Juego.pantalla` → `data-pantalla` (estilo de resultado cuando es `"resultado"`).

No se modifica ni se añade lógica en `engine`/`content`.

---

## Trazabilidad requisito → entidad

| Requisito | Entidades |
|---|---|
| FR-001 fondo refleja `momento` | E5, E3 |
| FR-002 playa/sol/claridad vs noche/luna/lluvia, sol y luna a la derecha | E1, E4 |
| FR-003 CSS + SVG inline, sin imágenes raster | E4 (D7) |
| FR-004 contraste AA | E1, E3 |
| FR-005 sin dependencias ni peso | E4 |
| FR-006 cambio breve + reduced-motion | E4 (regla 2) |
| FR-007 estáticas sin JS ni fondo | E3 |
| FR-008 motor y content intactos | E5 |
| FR-009 coherencia por pantalla | E5 |
| FR-010 tema claro/oscuro por momento | E1, E3 |
| FR-011 lluvia real + reduced-motion | E4 |
| FR-012 resultado con estilo propio | E2, E4 |

## Trazabilidad entidad → tokens

| Entidad | Tokens |
|---|---|
| E1 paleta verano | `--c-verano-*` + `--c-acento-texto` (base) |
| E2 paleta acta | `--c-acta-papel`, `--c-acta-papel-alta`, `--c-acta-tinta`, `--c-acta-tinta-suave`, `--c-acta-linea`, `--c-acta-sello` |
