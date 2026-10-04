# Contrato — UI: portada (`/`) al estilo del juego

Contrato observable de la portada rediseñada. Lo consumen los tests E2E y forma la interfaz pública de la feature. No describe implementación; fija qué es observable y verificable.

## 1. Estructura de la página

| Elemento | Selector | Contrato |
|---|---|---|
| Cabecera del sitio | `.site-header` | Sin cambios; marca `Coplero` enlazando a `/` (sin compás activo) |
| Apertura (hero) | primer bloque de `main` | `eyebrow`, `h1` «Coplero», subtítulo «Del creador de Acordes Gaditanos», claim y CTA; **llena la primera pantalla** con **fondo a sangre** |
| Bloque explicativo | `#que-es` | `h2` «Qué es Coplero y cómo funciona», 2 párrafos, `ol` con **4** `li` (pasos) y mención a acordesgaditanos |
| Separador | `[data-separador]` (en `#que-es` y `#ejemplo`) | Ornamento tipográfico **decorativo** (`aria-hidden`), sin texto accesible ni SVG |
| Ejemplo | `[data-testid="tarjeta"]` | Tarjeta final de ejemplo (`Tarjeta.svelte`) |
| Pie | `footer[role="contentinfo"]` | Sin cambios; redes, autor y enlaces legales |

**Regla de jerarquía**: un único `h1` («Coplero»); `h2` para «Qué es Coplero y cómo funciona» y «Tu tarjeta final»; `h3` para cada paso.

## 2. Retirada del compás

| Aspecto | Contrato |
|---|---|
| Bloque explicativo | **No** contiene `svg.regla-compas`; en su lugar, un `[data-separador]` decorativo |
| Bloque de ejemplo | **No** contiene `svg.regla-compas`; en su lugar, un `[data-separador]` decorativo |
| Cabecera y pie de tarjeta | **Conservan** el compás; no se tocan |

## 3. Navegación y CTAs

| Aspecto | Contrato |
|---|---|
| CTAs | Todos los enlaces de llamada a la acción apuntan a `/jugar` |
| CTA principal | Visible sin scroll a 360×640 |
| Continuar partida | **No** existe en la portada (permanece estática) |

## 4. Estilo y continuidad

- Títulos en `--fuente-display` mayúsculas; el `h2` con **sombra dura**; superficies, bordes y sombras de los tokens existentes; acento `--c-acento`.
- **Hero**: **llena la primera pantalla** (`100svh − cabecera`) con **fondo nocturno a sangre** (tokens de invierno/carnaval + velo + fundido inferior); el contenido va en el marco; **titular grande** (`min(22vw, 7rem)`) y **subtítulo** en versalitas (enlace sin subrayado); **CTA a todo el ancho**.
- **Tipografía de los bloques**: cuerpo a `--texto-lg` con interlineado 1.5; subtítulos de los pasos a 1.3; títulos de los pasos a `--texto-xl`.
- Sin cortes visuales que separen el hero del bloque explicativo como secciones ajenas.
- Sin colores (hex), tipografías, tokens, assets ni dependencias nuevas (test V-04).

## 5. Rendimiento, accesibilidad y responsive

- **0 kB de JavaScript**: sin `client:`, sin `<script>` y sin peticiones nuevas.
- Sin scroll horizontal desde **320 px** ni con zoom al **200 %**.
- `axe` (`wcag2a`, `wcag2aa`, `wcag22aa`) sin violaciones `critical` ni `serious`.
- Objetivos táctiles ≥44 px y foco visible; `prefers-reduced-motion` neutraliza el movimiento.
- Prosa ≤75 caracteres de ancho.

## 6. Contenido del ejemplo de tarjeta final

La tarjeta de ejemplo de la portada (`EJEMPLO_TARJETA`) y el caso dev `campeon` comparten la misma carrera (2027–2040):

| Aspecto | Contrato |
|---|---|
| Progresión | 2027 preliminares (Debut), 2029 cuartos, 2032 semifinales, 2035 final |
| COAC | Podio 2037 (3º), primer premio 2038 (1º), podio 2040 (2º) |
| Distinciones | 2 agujas de oro (2036, 2039) y 1 coplas por Andalucía (2034) |
| Mejor posición | `[data-testid="tarjeta-mejor-posicion"]` con tono `oro` (`data-tono="oro"`) |
| Trayectoria | `[data-testid="tarjeta-premios"]` con **7** `.hito` (premios + progresión) |
| Distinciones | `[data-testid="tarjeta-distinciones"]` con **3** `.roseta` (2 `aguja_de_oro` + 1 `copla_para_andalucia`) |
| Validez | `TarjetaFinal` válido (3 hitos, `veces` = años) y superviviente del códec |
| Imagen OG | La de `/` se compone desde el nuevo `CODIGO_EJEMPLO`; no se sube `VERSION_OG` (la URL ya cambia) |

**Regla de alcance**: se actualiza el **contenido** de las fixtures; **no** se rediseña el componente `Tarjeta.svelte`.

## 7. Producción

- La portada se prerenderiza como HTML estático; no hay isla ni script de aplicación.
- `/como-jugar`, las páginas legales, `/jugar` y `/r/[codigo]` no cambian.
