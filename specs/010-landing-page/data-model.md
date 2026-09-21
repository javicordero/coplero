# Phase 1 — Data Model: Landing estática

No hay datos persistidos ni entidades del juego. Lo que sigue es el **modelo de contenido** de la
página: son datos estáticos (constantes de `src/landing/contenido.ts`) y un **fixture** tipado con
los tipos reales del motor (`TarjetaFinal`), sin lógica.

## SeccionLanding

Bloque de la landing, en orden de aparición.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Ancla (`hero`, `que-es`, `como-funciona`, `modalidades`, `ejemplo`, `faq`). |
| `titulo` | string | Encabezado visible. |
| `orden` | number | Orden de aparición en la página. |

Secciones obligatorias y su ancla: **hero** (sin ancla), **qué es** (`#que-es`), **cómo funciona**
(`#como-funciona`), **modalidades** (`#modalidades`), **ejemplo de tarjeta** (`#ejemplo`), **FAQ**
(`#faq`) y **pie** (sin ancla).

## PasoComoFunciona

Paso del juego dentro de "cómo funciona" (FR-004).

| Campo | Tipo | Reglas |
|---|---|---|
| `numero` | number | 1..4, orden mostrado. |
| `titulo` | string | "Crea tu personaje", "Elige modalidad y estilo", "Decide cada año", "Recibe tu tarjeta". |
| `texto` | string | Una frase explicativa. |

## ModalidadResumen

Resumen de cada modalidad para la sección "modalidades" (FR-005).

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `"comparsista" \| "chirigotero"` | Debe existir en `MODALIDADES` del contenido. |
| `nombre` | string | Nombre mostrado. |
| `descripcion` | string | En qué consiste. |
| `enQueDecide` | string | El foco creativo de esa modalidad (letra/música/interpretación). |

## PreguntaFAQ

Par pregunta/respuesta de la FAQ (FR-007). Mínimo **5** entradas.

| Campo | Tipo | Reglas |
|---|---|---|
| `pregunta` | string | no vacía |
| `respuesta` | string | no vacía |

Cobertura mínima: gratuidad, registro, duración de una partida, de dónde salen las situaciones y
quién lo ha hecho (con enlace al autor).

## EnlaceSocial

Enlace externo del pie (FR-009, FR-012).

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador del icono (`x`, `youtube`, `tiktok`, `instagram`, `linkedin`, `github`, `acordesgaditanos`). |
| `nombre` | string | Nombre accesible (`aria-label`). |
| `url` | string | URL absoluta. |
| `icono` | string | SVG en línea asociado. |

## Autor y referencia externa

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | "Javier Cordero Toscano". |
| `linkedin` | string | URL del perfil. |
| `github` | string | URL del perfil. |
| `acordesgaditanos` | string | `https://acordesgaditanos.com` (referencia al mismo autor). |

## FixtureTarjeta (ejemplo de tarjeta)

`src/landing/ejemploTarjeta.ts` exporta un `TarjetaFinal` **completo y válido** (el mismo tipo que
produce el motor) y su **código OG** derivado:

| Campo | Tipo | Reglas |
|---|---|---|
| `EJEMPLO_TARJETA` | `TarjetaFinal` | Debe cumplir el tipo del motor (`nombre`, modalidades y variantes con `variantes.ts`, años, mejor fase/puesto, premios, 3 hitos, frase). |
| `CODIGO_EJEMPLO` | string | Resultado de codificar `EJEMPLO_TARJETA` con el códec del motor; se usa en `og:image`. |

**Sin estado ni transiciones**: la página es estática; no hay ciclo de vida ni validación en tiempo
de ejecución más allá del tipado en build.
