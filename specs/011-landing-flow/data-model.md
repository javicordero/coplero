# Phase 1 — Data Model: Reordenar la landing, cabecera/pie persistentes y páginas nuevas

No hay datos persistidos nuevos. Lo que sigue es el modelo de contenido del sitio y el inventario de
páginas; son datos estáticos, sin lógica.

## Marca (cabecera)

La marca reutiliza el mapeo que ya existe en `src/juego/presentacion.ts` (`TITULOS_POR_GENERO`,
expuesto como `tituloDelJuego`):

| `Genero` del personaje | Marca |
|---|---|
| (sin personaje todavía) | Coplero |
| `masculino` | Coplero |
| `femenino` | Coplera |
| `no_binario` | Coplere |

Reglas: antes de elegir sexo se muestra «Coplero»; en cuanto se elige, la cabecera pasa a la forma
correspondiente y se mantiene durante la partida. No se inventan valores nuevos.

## Contenido del sitio (`src/sitio/`)

| Entidad | Campos | Uso |
|---|---|---|
| `EnlaceSocial` | `id`, `nombre`, `url` | Redes del pie (X, YouTube, TikTok, Instagram, LinkedIn, GitHub) |
| `PreguntaFAQ` | `pregunta`, `respuesta` | `/como-jugar` (≥5) |
| `PasoComoFunciona` | `numero`, `titulo`, `texto` | Portada (sección fusionada) |
| `ModalidadResumen` | `id`, `nombre`, `descripcion`, `enQueDecide` | `/como-jugar` |
| `Regla` | `titulo`, `texto` | Reglas de `/como-jugar` (cómo se avanza, tipos de decisión, la tarjeta) |
| `Autor` | `nombre`, `nombreProyecto` | Pie y páginas legales |
| `ACORDES_GADITANOS` | `url` | Referencia al mismo autor |

## Inventario de páginas

| Ruta | Render | JS | Marco (cabecera+pie) | Contenido |
|---|---|---|---|---|
| `/` | Estático | 0 kB | Sí | Hero + «qué es + cómo funciona» fusionados |
| `/jugar` | Estático + isla | isla | Sí | Juego (pantalla de inicio + bucle) |
| `/como-jugar` | Estático | 0 kB | Sí | Reglas, modalidades y FAQ |
| `/politicas/politica-de-privacidad` | Estático | 0 kB | Sí | Privacidad |
| `/politicas/politica-de-cookies` | Estático | 0 kB | Sí | Cookies |
| `/r/[codigo]` | SSR | 0 kB | Sí | Tarjeta compartida |
| `/panel` | Solo-dev (404 en prod) | isla dev | No | Panel interno |

## Transiciones

- **Portada → juego**: navegación con el mismo marco, fondo y ancho; sin saltos (FR-025).
- **Marca**: cambia en `/jugar` cuando el jugador elige sexo (evento único desde la partida).
