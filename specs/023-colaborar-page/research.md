# Phase 0 — Research: Página de colaboración (apoyo y sugerencias)

Resultado de la fase de investigación. Todas las incógnitas del contexto técnico quedan resueltas;
no hay `NEEDS CLARIFICATION`.

## R1. Formulario sin JavaScript sobre una página estática

**Decision**: el formulario se envía con un **POST HTML clásico** (`<form action="…" method="POST">`)
a un servicio externo de formularios (**Formspree**, endpoint `https://formspree.io/f/mdeanyjr`).
Tras el envío, el propio servicio muestra su página de confirmación.

**Rationale**: la página debe seguir a **0 kB de JavaScript** (FR-019, Principio IV). Un POST nativo
no requiere script; la validación se delega en HTML5 (`required`, `type="email"`, `maxlength`). El
plan gratuito de Formspree admite formularios ilimitados, filtro antispam y campo trampa, y muestra
una página de agradecimiento propia (no permite página de gracias personalizada ni redirección, que
son de pago).

**Alternatives considered**:
- *AJAX (fetch) como en acordesgaditanos*: descartado; exige JavaScript y rompe la regla de 0 kB.
- *Backend propio / endpoint Astro*: descartado; el proyecto v1 no tiene backend y añade superficie
  (Principio V).
- *Servicio distinto*: no aporta; Formspree ya se usa en el ecosistema del autor.

## R2. Página única de colaboración

**Decision**: una sola página `/colaborar` que agrupa **donación** y **sugerencias** (y CTA a
`/jugar`), en lugar de páginas separadas.

**Rationale**: es la clarificación del usuario (Q de sesión: una página). Reduce rutas, mantiene el
proyecto simple (Principio V) y concentra el descubrimiento en un único destino.

**Alternatives considered**:
- *Separar `/contacto` y `/sugerencias`*: descartado; más rutas y superficie sin necesidad.

## R3. Donación reutilizando la cuenta existente

**Decision**: enlace a `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero`, abierto en
pestaña nueva (`target="_blank"`, `rel="noopener noreferrer"`). Solo Buy Me a Coffee (sin PayPal).

**Rationale**: respeta la decisión cerrada de `docs/05` §5 (reutilizar la cuenta verificada y
distinguir el origen). El usuario confirmó que no quiere cuenta nueva ni otros canales; una página
de BMC distinta exigiría otro email, otra verificación y otro cobro, y el donante vería igualmente
"Acordes Gaditanos" salvo cuenta nueva.

**Alternatives considered**:
- *Cuenta nueva "Coplero"*: descartado por el usuario (coste y fragmentación).
- *Añadir PayPal*: descartado; la decisión solo contempla la plataforma de café.

## R4. Constantes compartidas de donación y formulario

**Decision**: declarar las constantes de la feature en `src/sitio/contenido.ts` (URL de donación,
endpoint del formulario y longitud máxima del mensaje), reutilizables por `/colaborar`, por la
portada (`index.astro`) y por la isla (`FinCarrera.svelte`).

**Rationale**: evita duplicar la URL de donación en dos sitios (página y pantalla final) y sigue el
patrón existente (`src/sitio/contenido.ts` es contenido estático del sitio, no lógica de juego). El
endpoint de Formspree es público (viaja en el HTML), así que no es un secreto.

**Alternatives considered**:
- *Hardcodear la URL en cada fichero*: descartado; riesgo de divergencia.
- *Meterlo en `engine`/`content`*: descartado; rompe las reglas de dependencia (es presentación web).

## R5. Campos y protección antispam del formulario

**Decision**: campos `mensaje` (textarea requerido, `maxlength="500"`), `tipo` (select requerido:
`situacion` / `opcion` / `otro`), `email` (opcional, `type="email"`), y ocultos `_subject`
("Coplero — Nueva sugerencia"), `origen=coplero` y `_gotcha` (campo trampa invisible).

**Rationale**: cubre FR-008/FR-009/FR-010. El límite de 500 sigue `docs/05` §7. `_gotcha` es el
honeypot estándar de Formspree; `_subject` fija el asunto del correo; `origen` identifica la
procedencia. Sin JavaScript, la validación se apoya en HTML5.

**Alternatives considered**:
- *Captcha visible*: descartado; añade fricción y dependencia de JS.
- *No limitar el texto*: descartado; `docs/05` §7 exige límite.

## R6. Accesibilidad del formulario y de la página

**Decision**: `<label>` asociados a cada campo, altura ≥44 px en controles, foco visible,
contraste WCAG 2.2 AA y sin scroll desde 320 px. El enlace de donación lleva nombre accesible.

**Rationale**: FR-018 y el Principio IV; además el test E-03 del proyecto exige ≥44 px a todos los
controles y E-04 el foco visible. Los inputs/select por defecto suelen medir menos de 44 px, así que
el estilo debe forzar `min-height`.

**Alternatives considered**:
- *Placeholders en lugar de labels*: descartado; peor accesibilidad.

## R7. Alcance de la actualización del pie y de la pantalla final

**Decision**: añadir un **botón de donación** dentro del **bloque del ejemplo de la portada**
(`index.astro`, bajo su CTA final), un enlace de texto "Colaborar" en `Footer.astro` (posición exacta
secundaria) y, en `FinCarrera.svelte`, dos enlaces (donación directa y `/colaborar`). No se añade
menú ni bloque nuevo en la portada.

**Rationale**: FR-013/FR-014/FR-015/FR-016. El pie es global, así que cubre todas las páginas; la
pantalla final es el momento de máxima satisfacción. El usuario decidió no añadir menú y aplazar el
rediseño del pie.

**Alternatives considered**:
- *Menú con hamburguesa tipo acordesgaditanos*: descartado; exige JS y rompe la cabecera mínima.

## R8. Impacto en los tests existentes

**Decision**: ampliar los tests existentes donde el cambio los afecta:
- `landing.spec.ts`: el test de "enlaces internos de la portada" comprueba que todo `a[href^="/"]`
  pertenece a un conjunto conocido; al añadir `/colaborar` al pie hay que **añadir la ruta a
  `RUTAS_INTERNAS`** (si no, el test falla).
- `visual.spec.ts`: añadir `/colaborar` a `ESTATICAS` para cubrir axe, 320 px, 200 %, ≥44 px, foco
  y reduced-motion, y comprobar que no carga scripts de aplicación.
- `chrome.spec.ts`: añadir `/colaborar` a `RUTAS` (cabecera y pie presentes en todas las páginas).
- `estatico.test.ts`: añadir `colaborar.astro` y su HTML construido a las listas de 0 kB.

**Rationale**: mantiene la cobertura del contrato (marco, enlaces internos, accesibilidad, 0 kB) y
evita regresiones silenciosas. Es exactamente donde el nuevo enlace del pie y la nueva ruta
repercuten.

**Alternatives considered**:
- *No tocar los tests*: descartado; el enlace del pie rompería el test de enlaces internos.

## R9. Verificación del envío sin JavaScript

**Decision**: en `tests/e2e/colaborar.spec.ts`, además del contrato estático del formulario, un test
rellena los campos y envía, **interceptando la petición a Formspree** con `page.route` para no tocar
la red, y comprueba que el `POST` incluye `mensaje`, `tipo`, `origen` y `_subject`.

**Rationale**: demuestra SC-003 (funciona sin JS) de forma hermética y sin dependencia de un servicio
externo en CI.

**Alternatives considered**:
- *Enviar de verdad a Formspree*: descartado; no determinista y contamina un buzón real.
- *Solo comprobar atributos*: insuficiente para SC-003.

## R10. Privacidad

**Decision**: ampliar `politica-de-privacidad.astro` con un apartado que explique que el formulario
envía el mensaje y un email opcional a **Formspree** como proveedor externo, con la finalidad de
recibir sugerencias, y que el envío es voluntario. Actualizar la fecha.

**Rationale**: FR-017. El formulario introduce un tratamiento de datos que hoy la política no
recoge. La política de cookies no cambia (no añade cookies propias).

**Alternatives considered**:
- *No actualizar la política*: descartado; incumple FR-017 y el deber de información.
- *Añadir aviso/checkbox en el formulario*: descartado por el usuario (opción C de la clarificación).
