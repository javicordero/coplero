# Contrato — UI: página de colaboración (`/colaborar`)

Contrato observable de la página de colaboración y de sus puntos de enlace. Lo consumen los tests
E2E y forma la interfaz pública de la feature. No describe implementación; fija qué es observable y
verificable.

## 1. Estructura de la página `/colaborar`

| Elemento | Selector / rol | Contrato |
|---|---|---|
| Cabecera del sitio | `.site-header` | Sin cambios; marca "Coplero" enlazando a `/` |
| Título | `h1` | "Colaborar" (único `h1`) |
| Bloque de apoyo | primer bloque, `h2` | Texto breve (donación voluntaria) + enlace de donación |
| Bloque de sugerencias | `h2` "Sugerir…" | Texto explicativo + formulario |
| CTA final | `a[href="/jugar"]` | "Empezar a jugar" |
| Pie | `footer[role="contentinfo"]` | Incluye el enlace "Colaborar" → `/colaborar` |

**Regla de jerarquía**: un único `h1` ("Colaborar"); un `h2` por bloque.

## 2. Donación (Buy Me a Coffee)

| Aspecto | Contrato |
|---|---|
| URL | `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero` |
| Apertura | `target="_blank"` |
| Seguridad | `rel="noopener noreferrer"` |
| Nombre accesible | Sí (texto visible o `aria-label`) |
| Canales | **Solo** Buy Me a Coffee (sin PayPal) |

## 3. Formulario de sugerencias (sin JavaScript)

| Aspecto | Contrato |
|---|---|
| `action` | `https://formspree.io/f/mdeanyjr` |
| `method` | `post` |
| `textarea[name="mensaje"]` | Requerido, `maxlength="500"` |
| `select[name="tipo"]` | Requerido; opciones `situacion`, `opcion`, `otro` |
| `input[name="email"]` | `type="email"`, **opcional** |
| `input[name="_subject"]` | Oculto, valor no vacío ("Coplero — Nueva sugerencia") |
| `input[name="origen"]` | Oculto, valor `coplero` |
| `input[name="_gotcha"]` | Oculto (campo trampa); invisible y no enfocable |
| Etiquetas | Cada campo visible con su `<label>` asociado |
| Validación | HTML5 nativa (`required`, `type="email"`); sin JavaScript |
| Confirmación | Página de agradecimiento del servicio externo |

**Regla**: el texto del mensaje nunca se muestra públicamente en Coplero; llega solo al buzón del
autor a través del servicio externo.

## 4. Puntos de enlace

| Ubicación | Contrato |
|---|---|
| Pie (todas las páginas) | Enlace de texto "Colaborar" → `a[href="/colaborar"]` |
| Pantalla final (isla) | Enlace directo a la donación **y** enlace a `a[href="/colaborar"]` |
| Cabecera | **Sin** menú nuevo; solo la marca |
| Portada (bloque `#ejemplo`) | Botón de donación (Buy Me a Coffee) **dentro del bloque del ejemplo**, justo tras su CTA final; **sin** bloque nuevo |

## 5. Rendimiento, accesibilidad y responsive

- **0 kB de JavaScript** en `/colaborar`: sin `client:`, sin `<script>` y sin scripts de aplicación.
- Sin scroll horizontal desde **320 px** ni con zoom al **200 %**.
- `axe` (`wcag2a`, `wcag2aa`, `wcag22aa`) sin violaciones `critical` ni `serious`.
- Todos los controles (incluidos inputs, select, textarea, botón y enlace de donación) ≥44 px y foco
  visible; `prefers-reduced-motion` neutraliza el movimiento.

## 6. Legal

| Aspecto | Contrato |
|---|---|
| Política de privacidad | Menciona el formulario y que los datos (mensaje y email opcional) se envían a un proveedor externo |
| Política de cookies | Sin cambios funcionales (el formulario no añade cookies propias) |

## 7. Producción

- `/colaborar` se prerenderiza como HTML estático; no hay isla ni script de aplicación.
- `/`, `/como-jugar`, las páginas legales, `/jugar` y `/r/[codigo]` no cambian salvo el enlace
  "Colaborar" del pie, los dos enlaces de la pantalla final y el botón de donación dentro del bloque
  del ejemplo de la portada.
