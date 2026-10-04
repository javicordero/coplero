# Phase 1 — Data Model: Rediseño de la portada al estilo del juego

La feature **no introduce estado, persistencia ni entidades de motor**. Es un rediseño de presentación de una página estática. Este documento describe el **modelo de contenido de la portada** y sus reglas de validación, que es lo que consumen los tests.

## Entidades de presentación

### `BloquePortada`

Unidad de contenido de `/` con un propósito narrativo y un orden fijo.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `"apertura" \| "explicativo" \| "ejemplo"` | Orden: apertura → explicativo → ejemplo |
| `titulo` | `string` | Display en mayúsculas; `h1` en apertura, `h2` en explicativo y ejemplo |
| `contenido` | `Párrafo[] \| Paso[] \| EjemploTarjeta` | Según el bloque |
| `cta?` | `string` | Destino `/jugar` (apertura y ejemplo) |

### `Paso` (reutiliza `PasoComoFunciona` de `src/sitio/contenido.ts`)

| Campo | Tipo | Notas |
|---|---|---|
| `numero` | `number` | 1..4 |
| `titulo` | `string` | Se muestra como `h3` |
| `texto` | `string` | Descripción de la etapa |

**Regla**: en la portada hay exactamente **4** pasos, en orden.

### `Separador`

Recurso tipográfico decorativo que sustituye al compás en **los dos bloques** de la portada (explicativo y de ejemplo).

| Aspecto | Valor |
|---|---|
| Naturaleza | Decorativo; `aria-hidden="true"` |
| Representación | CSS (glifo `///` en `--c-acento`); sin asset ni SVG nuevo |
| Texto accesible | Ninguno |
| Marcador observable | `[data-separador]` |

### `EjemploTarjeta`

Representación del resultado de una carrera; se renderiza con `Tarjeta.svelte` (ya existente). Se usa en **dos** fixtures con el mismo contenido: `EJEMPLO_TARJETA` (`src/landing/ejemploTarjeta.ts`) y el caso `campeon` (`src/juego/dev/fixturesFin.ts`).

Carrera de la fixture (2027–2040):

| Campo (`TarjetaFinal`) | Valor |
|---|---|
| `nombre` | `El Bauti` |
| `modalidadInicial` / `modalidadFinal` | `comparsista` / `comparsista` |
| `varianteInicial` / `varianteFinal` | `clasico_comparsista` / `evolucion_con_raices` |
| `cambios` | `[{ ano: 2031, modalidad: "comparsista", variante: "evolucion_con_raices" }]` |
| `anosDeCarrera` / `anosEnActivo` | `14` / `14` |
| `anosSinConcursar` | `[]` |
| `mejorFase` / `mejorPuesto` | `final` / `1` |
| `primerosPremios` | `2037` podio (3º), `2038` primer_premio (1º), `2040` podio (2º) |
| `hitosProgreso` | `2027` preliminares (debut), `2029` cuartos, `2032` semifinales, `2035` final |
| `otrosPremios` | `aguja_de_oro` ×2 (`2036`, `2039`), `copla_para_andalucia` ×1 (`2034`) |
| `hitos` | `debut` 2027, `ganar_coac` 2038, `duracion` 14 años |
| `fraseCierre` | coherente con el bucket `campeon` |

**Regla**: es contenido estático de build; no hay endpoint ni petición. `Tarjeta.svelte` deriva de ella la **trayectoria** (`primerosPremios` + `hitosProgreso` → 7 hitos) y las **distinciones** (rosetas agrupadas: 2 agujas + 1 copla = 3 rosetas).

## Relaciones

```text
/ (portada)
├── BloquePortada apertura      → eyebrow + h1 + subtítulo (Acordes Gaditanos) + claim + CTA   [fondo a sangre]
├── BloquePortada explicativo   → Separador + h2 + Párrafo + Paso[4] (título + texto)
└── BloquePortada ejemplo       → Separador + h2 + Párrafo + EjemploTarjeta + CTA
```

## Reglas de validación

- **V-01**: la portada se sirve como HTML estático: `index.astro` no usa `client:` ni `<script>` (0 kB de JS).
- **V-02**: jerarquía de encabezados `h1` → `h2` → `h3`; un único `h1` («Coplero»).
- **V-03**: el bloque explicativo (`#que-es`) conserva exactamente **4** pasos (`li`).
- **V-04**: ni en `#que-es` ni en `#ejemplo` hay `svg.regla-compas`; en ambos hay un `[data-separador]`.
- **V-05**: el compás se conserva en la cabecera y en el pie de la tarjeta; la portada no usa ningún compás.
- **V-06**: toda llamada a la acción de la portada apunta a `/jugar`.
- **V-07**: el contraste se mantiene dentro de WCAG 2.2 AA con los tokens existentes; no se añaden colores.
- **V-08**: sin scroll horizontal desde 320 px ni con zoom al 200 %.
- **V-09**: no se elimina contenido obligatorio (explicación, 4 pasos, ejemplo, mención a acordesgaditanos).
- **V-10**: la decisión cerrada del «elemento firma» (012) queda registrada como matizada por esta feature.
- **V-11**: `EJEMPLO_TARJETA` y el caso dev `campeon` comparten el mismo contenido de carrera y ambos son `TarjetaFinal` válidos.
- **V-12**: cada fixture tiene exactamente **3** `hitos` y, en cada `otrosPremios`, `veces` = longitud de `anos`.
- **V-13**: `hitosProgreso` arranca en el debut (2027) y refleja las primeras veces: cuartos 2029, semifinales 2032, final 2035.
- **V-14**: `mejorPuesto` es coherente con el mejor logro de `primerosPremios` (1 en 2038).
- **V-15**: ambas fixtures sobreviven al códec (`decodificar(codificar(x)).valor` igual a `x`).

## Transiciones de estado

No aplica: la portada es una página estática sin estado ni ciclo de vida más allá del build.
