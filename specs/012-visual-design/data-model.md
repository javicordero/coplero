# Fase 1 — Modelo del sistema de diseño

**Feature**: 012-visual-design | **Fecha**: 2026-09-21

Esta fase no introduce datos de juego: no hay motor, contenido ni persistencia. Las "entidades" son el vocabulario del sistema de diseño, su forma y sus reglas de validación. Todo lo de abajo se declara **una vez** en `src/ui/tokens.css` (fuente canónica para el navegador) y se refleja en `src/ui/tokens.ts` (para tests y para el endpoint edge del OG).

---

## E1 · Token de color

```ts
interface TokenColor {
  nombre: string       // p. ej. "--c-acento"
  valor: string        // hex de 6 dígitos, en minúsculas
  rol: string          // semántica: "marca", "verano", "error"…
  sobre: string[]      // fondos admitidos sobre los que debe cumplir AA
}
```

**Valores (tema oscuro único)**

| Nombre | Valor | Rol | Debe cumplir |
|---|---|---|---|
| `--c-fondo` | `#0a0a0a` | plano base de la app | — (es fondo) |
| `--c-superficie` | `#141414` | tarjetas, opciones, tiles | — |
| `--c-superficie-alta` | `#1d1d1d` | estados elevados/hover de superficie | — |
| `--c-separador` | `#262b33` | filetes decorativos | **exento** (no es componente de UI) |
| `--c-borde-control` | `#6b6b6b` | contorno de control interactivo | ≥ 3:1 sobre fondo y superficies |
| `--c-texto` | `#ededed` | texto principal | ≥ 7:1 sobre fondo y superficies |
| `--c-texto-suave` | `#b3bdca` | texto secundario, etiquetas | ≥ 4.5:1 sobre fondo y superficies |
| `--c-acento` | `#f6ad55` | marca, CTA, momento **verano** | ≥ 4.5:1 sobre fondo; ≥ 3:1 como borde |
| `--c-acento-fuerte` | `#ffc477` | hover del acento | ≥ 4.5:1 para `--c-sobre-acento` |
| `--c-acento-2` | `#7fd1c1` | momento **febrero**, selección, éxito | ≥ 4.5:1 sobre fondo; ≥ 3:1 como borde |
| `--c-sobre-acento` | `#1a1206` | texto sobre fondo de acento | ≥ 4.5:1 sobre `--c-acento` |
| `--c-error` | `#fc8181` | errores y acciones destructivas | ≥ 4.5:1 sobre fondo |

**Reglas de validación**

1. Todo valor MUST ser hex de 6 dígitos en minúsculas (los 3 dígitos complican el cálculo de contraste y la lectura).
2. Ningún componente fuera de `src/ui/` MUST declarar un literal de color (test anti-hex, R10).
3. Dos tokens distintos MUST NOT tener el mismo rol semántico (evita la duplicación actual de tres grises).
4. El color MUST NOT ser el único canal de información: todo significado cromático lleva texto o icono acompañante (FR-006).
5. Los pares de la columna "Debe cumplir" MUST superar el umbral indicado (WCAG 2.2 AA); el umbral es parte del test, no una recomendación.
6. La distinción **decorativo vs. componente de interfaz** es normativa: un filete decorativo no necesita 3:1, pero cualquier contorno que ayude a identificar un control sí.

---

## E2 · Familia tipográfica y escala

```ts
interface FamiliaTipografica {
  nombre: string    // "Anton" | "Atkinson Hyperlegible"
  rol: "display" | "texto"
  licencia: string  // "OFL-1.1"
  ficheros: {
    web: string[]   // woff2 subseteados (latin, latin-ext)
    og: string      // ttf para satori (solo servidor)
  }
  preload: boolean  // solo display + latin
}
```

**Tokens de familia**

- `--fuente-display` → marca, `h1`, número de año, titular de la tarjeta.
- `--fuente-texto` → todo lo demás, incluidos botones y formularios.
- `--fuente-reserva` → pila del sistema, sin dependencia de red.

**Escala y ritmo**

| Token | Valor | Uso |
|---|---|---|
| `--texto-xs` / `--texto-sm` | `0.75rem` / `0.875rem` | etiquetas, metadatos |
| `--texto-base` | `1rem` | cuerpo (mínimo; nunca por debajo) |
| `--texto-lg` / `--texto-xl` | `1.125rem` / `1.375rem` | subtítulos |
| `--texto-2xl` / `--texto-3xl` | `1.75rem` / `clamp(2.25rem, 10vw, 3.5rem)` | titulares y hero |
| `--interlinea-apretada` / `-normal` / `-holgada` | `1.15` / `1.5` / `1.65` | según tamaño |
| `--medida` | `65ch` | longitud máxima de línea de prosa |
| `--peso-normal` / `--peso-fuerte` | `400` / `700` | jerarquía (la familia de texto solo tiene dos pesos reales: no se falsifican) |

**Reglas de validación**

1. El cuerpo MUST usar al menos `--texto-base` (1 rem) (FR-003, SC-007).
2. Toda prosa MUST limitarse con `--medida` en pantallas anchas (SC-007).
3. Las fuentes MUST declararse con `font-display: swap` y reserva local del sistema (FR-004).
4. La escala MUST ser monótona creciente: ningún token es menor que el anterior (se testea).
5. La tipografía MUST sobrevivir sin conexión a la fuente: el layout no puede depender de sus métricas (FR-004).

---

## E3 · Espaciado, radios y sombras

| Grupo | Tokens | Valores |
|---|---|---|
| Espaciado | `--esp-1`…`--esp-8` | `0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4` rem |
| Radios | `--radio-sm`, `--radio-md`, `--radio-lg`, `--radio-pill` | `0.375, 0.75, 1rem`, `999px` |
| Sombras | `--sombra-1`, `--sombra-2` | dos niveles sobre negro |
| Layout | `--ancho-marco`, `--ancho-bucle` | `680px` (el bucle es alias del marco) |
| Foco | `--foco-ancho`, `--foco-offset` | `2px`, `2px` |

**Reglas de validación**

1. Espaciado y radios MUST salir de la escala; no se admiten valores sueltos fuera de `src/ui/` (mismo test anti-hardcode que los colores, extendido).
2. `--ancho-marco` MUST ser 680 px en escritorio (100 % en móvil).
3. `--ancho-bucle` MUST derivar de `--ancho-marco` (`var(--ancho-marco)`), de modo que marco y bucle coincidan siempre (Principio IV, revisado el 2026-09-30).

---

## E4 · Movimiento

```ts
interface TokenMovimiento {
  nombre: string  // "--dur-1" | "--ease-sal"…
  valor: string   // "120ms" | "cubic-bezier(...)"
}
```

| Token | Valor | Uso |
|---|---|---|
| `--dur-1` / `--dur-2` / `--dur-3` | `120ms` / `200ms` / `280ms` | feedback / cambio de estado / entrada de pantalla |
| `--ease-sal` | `cubic-bezier(.2,.7,.3,1)` | lo que aparece |
| `--ease-ent` | `cubic-bezier(.4,0,.8,.3)` | lo que desaparece |

**Reglas de validación**

1. Ninguna duración MUST superar **300 ms** (`docs/05` §1), y por eso `--dur-3` es 280 ms (SC-005).
2. Solo se animan `color`, `background-color`, `border-color`, `opacity` y `transform`; nunca propiedades de layout.
3. Bajo `prefers-reduced-motion: reduce` las duraciones MUST quedar neutralizadas y los `@keyframes` desactivados (FR-010, SC-005).
4. El significado de la pantalla MUST NOT depender de la animación.

---

## E5 · Matriz de estados

```ts
type EstadoControl =
  | "reposo" | "hover" | "active" | "focus-visible"
  | "disabled" | "seleccionado"

type EstadoPantalla = "carga" | "vacio" | "error" | "exito"
```

**Reglas de validación**

1. Todo control interactivo MUST definir los seis estados (FR-011).
2. Toda pantalla con datos MUST cubrir los cuatro estados de pantalla, con texto (FR-012).
3. `focus-visible` MUST ser perceptible con contraste ≥ 3:1 contra el fondo adyacente.
4. `disabled` MUST distinguirse sin depender solo del color (opacidad + cursor + `aria-disabled` cuando aplique).
5. Un control no puede quedarse sin estado `active` en táctil (feedback al pulsar).

---

## E6 · Elemento firma

```ts
interface ElementoFirma {
  nombre: string          // "Regla de compás"
  descripcion: string     // qué dibuja y dónde aparece
  implementacion: "css" | "svg-inline"
  decorativo: true        // siempre aria-hidden
  ubicaciones: string[]   // cabecera, separador de sección, pie de tarjeta
}
```

**Reglas de validación**

1. MUST implementarse sin fichero de imagen ni JS (coste ≈ 0).
2. MUST ser decorativo: `aria-hidden="true"` y sin texto alternativo obligatorio.
3. MUST NOT transportar información; si desaparece, la pantalla sigue siendo comprensible.
4. MUST respetar los tokens de color (nunca un hex propio).

---

## E7 · Página y superficie (referencia, no dato nuevo)

| Superficie | Rutas / componentes | Restricción de rendimiento |
|---|---|---|
| Estáticas | `/`, `/como-jugar`, legales, `/r/[codigo]` | 0 kB de JS (invariante) |
| Isla | `/jugar` → `src/juego/**` | sin nuevas dependencias |
| Imagen | `api/og/[codigo].png` → `og`, `9x16`, `1x1` | misma paleta y tipografía que la web |
| Fuera de alcance | `src/panel-ui/**`, `src/panel/**` | paleta propia, no se tokeniza |

---

## Trazabilidad requisito → entidad

| Requisito | Entidades |
|---|---|
| FR-001 tokens únicos | E1, E2, E3, E4 |
| FR-002 elemento firma | E6 |
| FR-003 legibilidad tipográfica | E2 |
| FR-004 fuentes libres y reserva | E2 |
| FR-005 texto escalable | E2 (rem + `clamp()`) |
| FR-006 contraste y no-color-solo | E1 |
| FR-007 significado del color | E1 (rol único por token) |
| FR-008 mobile-first, sin scroll horizontal | E3 (anchos), E2 (`--medida`) |
| FR-009 táctil y jerarquía | E3, E2 |
| FR-010 movimiento y reduced-motion | E4 |
| FR-011 estados de control | E5 |
| FR-012 estados de pantalla | E5 |
| FR-013 tarjeta final 9:16 y 1:1 | E2, E7 (OG) |
| FR-014 compartir y OG con identidad | E1, E2, E7 |
| FR-015 sin degradar rendimiento | E7 |
| FR-016 WCAG 2.2 AA | E1, E4, E5 |
