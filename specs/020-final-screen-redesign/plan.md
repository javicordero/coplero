# Implementation Plan: Rediseño de la pantalla final como palmarés

**Branch**: `020-final-screen-redesign` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-final-screen-redesign/spec.md`

## Summary

Convertir la pantalla de fin de carrera en un **palmarés de Carnaval**: composición **vertical y aireada** sobre negro con la identidad de Coplero (blanco para la información, naranja en destacados, **dorado solo en el primer premio**, separadores ornamentales sutiles). La sección **Premios** pasa a una **línea temporal vertical** (un año con premio por fila, orden cronológico, sin interacción); las **Distinciones** pasan a una **colección de rosetas** (una por victoria, con el icono del premio, todas al mismo peso); y se añade una **frase de cierre** breve antes de los botones. Se retira el lenguaje de panel de formulario. Se conservan las acciones **Compartir**, **Descargar imagen** y **Jugar de nuevo**. El cambio vive en la UI (`src/juego`): el componente compartido `Tarjeta.svelte` (pantalla de fin, ejemplo de portada y página de resultado), `FinCarrera.svelte` y el fondo neutro de `Juego.svelte`. Del `engine` solo se añade un campo derivado (`TarjetaFinal.hitosProgreso`); no se toca `content`. La imagen OG (pieza hermana) **se actualiza para calcar el mismo palmarés** en sus tres formatos, con la URL versionada para invalidar caché.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro + Svelte 5 (runes)

**Primary Dependencies**: ninguna nueva; tokens CSS existentes (`src/ui/tokens.css`), utilidades de compartir (`src/utilities/compartir.ts`), endpoint OG (`satori` + `resvg-js`, ahora espejo del palmarés) e iconos SVG propios

**Storage**: N/A

**Testing**: Vitest (unitario de presentación) + Playwright (E2E) + `@axe-core/playwright` (accesibilidad); `npm run check`

**Target Platform**: web mobile-first desde 320 px; ancho máximo de marco en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; la portada y `/r/[codigo]` siguen siendo HTML estático; sin peticiones nuevas

**Constraints**: no tocar `content` (el motor solo gana `hitosProgreso`); una sola isla; WCAG 2.2 AA; sin scroll horizontal a 320 px; dorado solo en el primer premio; se conservan fuentes y tokens; el endpoint OG **se alinea con el palmarés** (mismos `rem`, fuentes y pesos), sin cambiar su contrato de datos

**Scale/Scope**: 1 componente compartido (`Tarjeta.svelte`) + `FinCarrera.svelte` + fondo de `Juego.svelte` + el endpoint OG (`api/og/[codigo].png.ts`); 3 iconos SVG de distinción; ~3 specs E2E y 1 unit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | El motor solo gana un campo derivado y puro (`hitosProgreso`); no cambia el azar ni el contenido. | ✅ PASS |
| **II. Contenido como datos, no código** | No se tocan esquemas ni el banco; la frase de cierre es texto de presentación. | ✅ PASS |
| **III. Verificación determinista y balance** | Se actualizan tests E2E deterministas y la cobertura de accesibilidad; `npm run check` es la puerta. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Solo CSS/markup/SVG; 0 kB JS añadido; `/r` sigue estático; mobile-first desde 320 px; sin dependencias nuevas. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Se editan componentes existentes y se reutilizan tokens/utilidades; sin capas ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: palmarés es presentación pura salvo `hitosProgreso` (derivado y determinista) (I, II); verificación por E2E/axe existentes (III); sin JS ni dependencias nuevas y `/r` estático (IV); se reutilizan componentes, tokens y rosetas (V). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/020-final-screen-redesign/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── ui.md            # Contrato de la pantalla y de la tarjeta
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/juego/
├── Tarjeta.svelte                       # Palmarés: identidad + mejor posición + línea temporal + rosetas
├── pantallas/
│   └── FinCarrera.svelte                # Antetítulo + tarjeta + frase de cierre + acciones; hook `data-codigo`
├── presentacion.ts                      # Textos/formatos: mejor posición, medallas, agrupaciones y frase
└── Juego.svelte                         # Fondo neutro en `fin` (sin estacional)

src/pages/api/og/
└── [codigo].png.ts                      # Imagen OG (espejo del palmarés; formatos og/9x16/1x1)

public/rosetas/
├── roseta_andalucia.svg                 # Roseta verde/blanca (Coplas por Andalucía)
├── roseta_aguja_oro.svg                 # Roseta dorada (Aguja de oro)
└── roseta_candela.svg                   # Roseta roja (Candela y espino)

tests/e2e/
├── apoyo/juego.ts                       # `enlaceCompartido` (data-codigo)
├── pantalla-final.spec.ts               # Contenido del palmarés
├── pantalla-final-fondo.spec.ts         # Fondo neutro + antetítulo
└── compartir.spec.ts                    # Acciones + enlace + axe
```

**Structure Decision**: proyecto único existente. El rediseño se concentra en la isla de juego y sus rosetas; se reutiliza el componente compartido `Tarjeta.svelte` para que fin, portada y `/r` no diverjan. No se crean dependencias, capas ni rutas.

## Design

### Composición de la pantalla (vertical, aireada)

1. **Antetítulo** fuera de la tarjeta: «Carrera finalizada», atenuado.
2. **Identidad**: nombre (título principal) + modalidad y estilo (dos elementos, tratamientos distintos).
3. **Mejor posición**: placa de honor con el puesto protagonista; color por puesto/fase.
4. **Línea temporal de Premios** (si hay): ver abajo.
5. **Colección de Distinciones** (si hay): ver abajo.
6. **Frase de cierre** (cursiva, con separadores ornamentales).
7. **Acciones**: Compartir, Descargar imagen, Jugar de nuevo.

Sin panel de formulario: contenedor sutil (o inexistente), mucho aire, separadores ornamentales entre secciones.

### Línea temporal de Premios (`Tarjeta.svelte`)

- Solo años con premio del COAC; **orden cronológico**; **sin interacción**.
- Una fila por año: `año` (atenuado) · nodo sobre un carril vertical fino · `puesto` (`1º`/`2º`/`3º`).
- **1º premio**: nodo y `1º` en **dorado**. 2º/3º: nodos y texto atenuados.
- Carril: línea vertical sutil (1 px) que puede apoyarse en el motivo de compás; sin ejes, cuadrículas ni leyendas.
- Escala: cada año ocupa una fila compacta; con muchos años crece hacia abajo sin romperse. Sin tope ni agrupación en esta iteración.

### Colección de Distinciones (`Tarjeta.svelte`)

- **Rosetas**: una por victoria, agrupadas por tipo y pegadas dentro del grupo.
- Cada premio tiene su SVG (`public/rosetas/`): Andalucía verde/blanco, Aguja dorada, Candela roja, con el icono en el centro.
- El nombre y el recuento van **ocultos** (lectores de pantalla) y como `title`; todas al **mismo peso**.
- Tratamiento distinto al de la línea temporal (no cronológico), para que no parezca «otros premios».

### Frase de cierre (`FinCarrera.svelte`)

- Línea corta en cursiva antes de los botones, con separadores ornamentales.
- Texto por defecto: **«La copla termina. La historia queda.»** (tono elegante). Alternativas por tono en `research.md`.
- Debe funcionar con cualquier posición y no decir «has ganado».

### Estética

Negro base + blanco info + naranja Coplero en destacados + **dorado solo en el 1º premio**; separadores ornamentales sutiles (compás); fuentes y tokens actuales; sin tarjetas pesadas ni aspecto de dashboard.

### Imagen OG (espejo del palmarés)

- El endpoint `/api/og/[codigo].png` **calca el palmarés** en sus tres formatos: identidad, mejor posición, trayectoria y distinciones, con el **pie de marca dentro** de la tarjeta.
- Se define en las mismas unidades `rem` que la web y se multiplica por la escala del formato (`9x16` 2.7, `1x1` 1.5, `og` 1.35 apaisado); los **títulos de sección** van en Anton, como los `<h3>`.
- La URL se **versiona** (`?v=`, `VERSION_OG` + `urlImagenOg()`) para poder invalidar la caché `immutable` al cambiar el diseño.
- La acción de la pantalla final pasa a llamarse **«Descargar imagen»**; la isla y `/r` **centran** el palmarés verticalmente.

### Tests

- **`pantalla-final.spec.ts`**: zonas del palmarés; línea temporal (un año por premio, orden cronológico, 1º dorado, sin años sin premio); distinciones (rosetas, una por victoria); ausencia de bloques retirados; 320 px; axe.
- **`pantalla-final-fondo.spec.ts`**: fondo neutro en `fin` y antetítulo fuera de la tarjeta.
- **`compartir.spec.ts`**: acciones (Compartir/Descargar imagen/Jugar de nuevo), enlace por `data-codigo`, endpoint OG en los tres formatos y axe en fin y `/r`.
- **Unit**: formatos de presentación (puesto/medalla, agrupaciones) y frase.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
