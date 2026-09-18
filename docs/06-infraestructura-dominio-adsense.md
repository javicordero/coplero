# 06 · Infraestructura · Dominio, hosting en Netlify y AdSense

Notas sobre alojamiento y monetización del proyecto "Coplero", para tener en cuenta al construir la infraestructura.

## Preguntas de partida

- ¿Aprobaría Google AdSense esta web para generar ingresos?
- ¿Se puede alojar en Netlify usando el sufijo gratuito (`tuproyecto.netlify.app`)?
- ¿Entraría la gente igual con ese sufijo, sin tener en cuenta la monetización?
- ¿Hay que comprar dominio propio sí o sí? ¿Cuánto cuesta?
- Si se empieza con el sufijo de Netlify y luego se compra el dominio (.es o .com), ¿cómo se hace el cambio?

Referencia: ya existe otro proyecto propio, **acordesgaditanos**, alojado con dominio propio y ya aprobado en AdSense. Sirve de precedente de que Google no pone pegas al tema "carnaval de Cádiz" en sí.

## Análisis y respuestas

### AdSense

- Es posible que apruebe la web, pero no está garantizado. Depende más del contenido y el tráfico que del tema.
- Hoy en día la aprobación es más difícil que hace años porque Google revisa manualmente cada sitio, lo que alarga los tiempos de espera.
- Pesa mucho tener contenido propio, útil y suficiente: no solo el juego interactivo en sí, sino también páginas de explicación, contexto/historia del carnaval, FAQ, etc.
- Conviene tener algo de tráfico real antes de solicitar la revisión.
- El precedente de acordesgaditanos (mismo tema, ya aprobado) es una buena señal de que el nicho no es problemático para Google.

### Subdominio de Netlify vs dominio propio

- **No sirve** el sufijo `.netlify.app` para darse de alta en AdSense. Google exige que la URL registrada sea de propiedad del solicitante, sin rutas y sin subdominios de terceros. `.netlify.app` es un subdominio de Netlify, no del proyecto, así que queda excluido por política.
- Para AdSense hace falta dominio propio sí o sí (tipo `coplero.es` o `coplero.com`), apuntado a Netlify.
- Sin tener en cuenta la monetización, el sufijo `.netlify.app` funciona perfectamente para jugar: carga igual de rápido y no supone ninguna limitación funcional. Es válido para lanzar, probar y compartir en redes mientras se decide si merece la pena comprar el dominio.

### Precio del dominio

- Un `.com` ronda los 9-15 €/año en registradores serios.
- Un `.es` ronda los 8 €/año.
- Cuidado con las promociones agresivas de primer año: suelen subir mucho en la renovación. Para un proyecto pensado para mantenerse en el tiempo, mirar el precio de renovación real, no solo el de bienvenida.

### Migración de `.netlify.app` a dominio propio

- Netlify permite añadir un dominio propio de forma gratuita y genera automáticamente el certificado SSL para él; no hay coste extra aparte del propio dominio.
- El proceso es: comprar el dominio → apuntarlo a Netlify (vía DNS o desde el propio panel de Netlify) → la misma web pasa a servirse también (o solo) desde el dominio propio.
- Si ya se han compartido enlaces con el sufijo `.netlify.app` (por ejemplo, en redes o con gente que probó el juego), conviene configurar una redirección automática desde ese sufijo hacia el dominio nuevo, para no dejar enlaces rotos. Esto también se gestiona desde el panel de Netlify, marcando el dominio propio como principal y dejando el `.netlify.app` como redirección.
- Una vez el dominio propio esté funcionando así, ya se puede dar de alta en la solicitud de AdSense, aunque técnicamente sea la misma web y el mismo hosting de siempre.

## Recomendación / plan sugerido

1. Lanzar primero en el subdominio gratuito de Netlify para validar que el juego funciona y engancha, sin coste añadido.
2. Comprar el dominio propio (10-15 € el primer año aprox.) en cuanto haya intención seria de solicitar AdSense, ya que sin dominio propio no hay solicitud posible.
3. Apuntar el dominio a Netlify y configurar redirección desde el sufijo antiguo.
4. Reforzar el sitio con contenido propio adicional (explicación del juego, contexto histórico del carnaval, FAQ) antes de solicitar la revisión de AdSense, para aumentar las probabilidades de aprobación.

## Dónde comprar el dominio más barato

| Registrador | Fuerte en | Nota |
| --- | --- | --- |
| **Cloudflare Registrar** | `.com` | Vende a precio de coste (~10 €/año) y no sube en la renovación. No ofrece `.es`. |
| **Porkbun** / **Namecheap** | `.com` | Barato, con WHOIS privado incluido; mirar el precio de renovación, no el de alta. |
| **Dinahosting** / **DonDominio** | `.es` | Registradores españoles, ~8-12 €/año, soporte en castellano. |

Recomendación: `.com` en Cloudflare Registrar si el nombre está libre, porque el precio de renovación es estable a largo plazo. Un `.es` solo si se quiere reforzar el carácter local. En ambos casos, el dominio se apunta a Netlify y el hosting sigue siendo el mismo.

## Cookies y consentimiento

- Con **analítica sin cookies** (Plausible, Umami, Cloudflare Web Analytics) no hace falta banner de consentimiento: basta declararla en la política de privacidad.
- Con **Google Analytics 4** sí hace falta banner y bloqueo previo del script.
- Con **AdSense activo, el banner es obligatorio** y tiene que ser un CMP certificado por Google con Consent Mode. Conviene tenerlo en cuenta antes de solicitar la revisión.

Detalle completo en `05-producto-viralidad-negocio.md`.
