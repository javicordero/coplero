# Phase 1 — Data Model: Página de colaboración (apoyo y sugerencias)

La feature **no introduce estado, persistencia ni entidades de motor**. Es una página de
presentación estática más dos enlaces (pie y pantalla final). Este documento describe el **modelo de
contenido de `/colaborar`** y sus reglas de validación, que es lo que consumen los tests.

## Entidades de presentación

### `PaginaColaboracion`

Página estática con tres bloques ordenados y un título principal.

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `string` | `h1` "Colaborar" |
| `bloques` | `BloqueColaboracion[]` | Orden: apoyo → sugerencias → jugar |
| `cta` | `{ texto: string, href: "/jugar" }` | Llamada a la acción final |

### `BloqueColaboracion`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `"apoyo" \| "sugerencias" \| "jugar"` | Orden fijo |
| `titulo` | `string` | `h2` del bloque |
| `contenido` | `EnlaceDonacion \| FormularioSugerencia \| { texto, href }` | Según el bloque |

### `EnlaceDonacion`

| Campo | Tipo | Notas |
|---|---|---|
| `url` | `string` | `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero` |
| `etiqueta` | `string` | Nombre accesible ("Invítame a un café") |
| `target` | `"_blank"` | Pestaña nueva |
| `rel` | `"noopener noreferrer"` | Seguridad |

### `FormularioSugerencia`

| Campo | Tipo | Notas |
|---|---|---|
| `action` | `string` | `https://formspree.io/f/mdeanyjr` |
| `method` | `"POST"` | Envío HTML clásico (sin JavaScript) |
| `campos` | `CampoFormulario[]` | Visibles (ver abajo) |
| `ocultos` | `Record<string, string>` | `_subject`, `origen`, `_gotcha` |
| `confirmacion` | `"servicio-externo"` | Página de gracias del proveedor |

### `CampoFormulario`

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `mensaje` | `textarea` | Sí | `maxlength="500"` |
| `tipo` | `select` | Sí | Opciones: `situacion` ("Una situación"), `opcion` ("Una opción"), `otro` ("Otro") |
| `email` | `input type="email"` | No | Formspree lo usa como *reply-to* |

**Campos ocultos**:

| Nombre | Valor | Función |
|---|---|---|
| `_subject` | `Coplero — Nueva sugerencia` | Asunto del correo |
| `origen` | `coplero` | Identifica la procedencia |
| `_gotcha` | (vacío) | Campo trampa antispam; invisible y no enfocable |

### `Sugerencia` (carga enviada)

Datos que el formulario entrega al servicio externo. No se persisten en Coplero ni se muestran
públicamente.

| Campo | Tipo | Obligatorio |
|---|---|---|
| `mensaje` | `string` (≤500) | Sí |
| `tipo` | `"situacion" \| "opcion" \| "otro"` | Sí |
| `email` | `string` | No |
| `origen` | `"coplero"` | Sí (oculto) |

## Componentes compartidos modificados

### `Footer` (pie de página)

| Aspecto | Valor |
|---|---|
| Añadido | Enlace de texto "Colaborar" → `/colaborar` |
| Alcance | Presente en **todas** las páginas (componente compartido) |
| Posición | Secundaria (el pie se rediseñará) |
| Estilo | Igual que los demás enlaces del pie; objetivo táctil ≥44 px |

### `FinCarrera` (pantalla final de la isla)

| Aspecto | Valor |
|---|---|
| Añadido | Línea discreta con **dos enlaces**: donación directa (Buy Me a Coffee) y `/colaborar` |
| Ubicación | Bajo las acciones de compartir/descargar/reiniciar |
| Naturaleza | La isla ya es JavaScript; añadir anclas no afecta a la regla de 0 kB de las páginas estáticas |

### `Index` (portada)

| Aspecto | Valor |
|---|---|
| Añadido | Botón de donación (Buy Me a Coffee) con icono de café (SVG en línea) y texto |
| Ubicación | Dentro del bloque `#ejemplo`, justo debajo de su CTA final |
| Alcance | No crea un bloque nuevo; la portada conserva sus 3 bloques |
| Destino | `DONACION` (con origen Coplero), `target="_blank"`, `rel="noopener noreferrer"` |
| JavaScript | Ninguno; la portada sigue a 0 kB |

## Relaciones

```text
/colaborar
├── BloqueColaboracion "apoyo"        → h2 + Párrafo + EnlaceDonacion
├── BloqueColaboracion "sugerencias"  → h2 + Párrafo + FormularioSugerencia
└── BloqueColaboracion "jugar"        → h2/Párrafo + CTA "/jugar"

Portada (`#ejemplo`)     → botón de donación (Buy Me a Coffee)
Footer (global)          → enlace "Colaborar" → /colaborar
FinCarrera (isla)        → enlace donación + enlace /colaborar
Política de privacidad   → apartado del formulario (proveedor externo)
```

## Reglas de validación

- **V-01**: `/colaborar` se sirve como HTML estático: `colaborar.astro` no usa `client:` ni
  `<script>` (0 kB de JS).
- **V-02**: un único `h1` ("Colaborar"); cada bloque con su `h2` (jerarquía `h1` → `h2`).
- **V-03**: el enlace de donación apunta exactamente a
  `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero`, con `target="_blank"` y
  `rel="noopener noreferrer"`, y tiene nombre accesible.
- **V-04**: el formulario tiene `action="https://formspree.io/f/mdeanyjr"` y `method="post"`.
- **V-05**: existe un `textarea[name="mensaje"]` requerido con `maxlength="500"`.
- **V-06**: existe un `select[name="tipo"]` requerido con las tres opciones (`situacion`, `opcion`,
  `otro`).
- **V-07**: el campo `email` es `type="email"` y **no** es requerido.
- **V-08**: existen los ocultos `_subject` (con asunto no vacío), `origen="coplero"` y `_gotcha`,
  este último invisible y no enfocable.
- **V-09**: todos los controles (input, select, textarea, botón y enlace de donación) tienen altura
  ≥44 px y foco visible.
- **V-10**: el formulario no depende de JavaScript: el envío se hace con POST nativo y la validación
  con atributos HTML5.
- **V-11**: el pie contiene un enlace `a[href="/colaborar"]` en todas las páginas.
- **V-12**: la pantalla final contiene un enlace a la donación y un enlace a `/colaborar`.
- **V-13**: `/colaborar` pasa axe WCAG 2.2 AA sin violaciones y no provoca scroll horizontal desde
  320 px ni con zoom al 200 %.
- **V-14**: la política de privacidad menciona el formulario y el proveedor externo que trata los
  datos.
- **V-15**: todo el texto visible está en español.
- **V-16**: el **botón de donación de la portada** está dentro de `#ejemplo` y después de su CTA final; la portada no usa `client:` ni `<script>` (sigue a 0 kB).

## Transiciones de estado

No aplica: `/colaborar` es una página estática sin estado ni ciclo de vida más allá del build. El
único cambio de estado es la navegación del navegador al enviar el formulario (a la confirmación del
servicio externo) o al abrir la donación (pestaña nueva).
