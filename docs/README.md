# Documentación de Coplero

Índice de la documentación funcional y técnica del proyecto. Los documentos numerados son la **fuente de verdad** y se conservan fieles a lo acordado. El directorio `registro/` es **derivado** y lo mantiene el agente.

## Mapa de documentos

| Documento | Qué cubre | Depende de |
|---|---|---|
| `01-diseno-juego.md` | Personaje, modalidades/variantes, COAC, premios ajenos, sistema de decisiones, condicionales, duración y curva de carrera | — |
| `02-arquitectura-tecnica.md` | Elección de stack, principio rector, estructura del repo, modelo de datos del engine, techo oculto, selección de decisión, rutas, build/CI | `01` |
| `03-banco-verano.md` | Situaciones y condicionales de verano | `01` |
| `04-banco-febrero.md` | Situaciones, condicionales y eventos de febrero | `01` |
| `05-producto-viralidad-negocio.md` | UI/UX, viralidad, comunidad, difusión, monetización, analítica, legal, rendimiento y orden de fases | `01`, `02` |
| `06-infraestructura-dominio-adsense.md` | AdSense, dominio vs subdominio, precios, migración, registradores y cookies | `05` |

## Registro derivado

| Documento | Qué contiene |
|---|---|
| `registro/decisiones-cerradas.md` | Decisiones ya cerradas, extraídas de los documentos fuente |
| `registro/decisiones-pendientes.md` | Backlog abierto, contradicciones (C*) e incompatibilidades técnicas / huecos (T*) sin resolver |

## Reglas de esta documentación

1. Los documentos `01`–`06` son **fieles** al material acordado. No se editan para resolver contradicciones.
2. Cualquier conflicto, ambigüedad o hueco detectado se registra en `registro/decisiones-pendientes.md` y **no se resuelve en silencio**.
3. `AGENTS.md` (raíz del repo) es el **índice operativo** para el agente: resume reglas y enlaza aquí. No duplica el contenido completo.
4. Cuando una contradicción o decisión pendiente se resuelva, se actualiza primero el documento fuente `01`–`06` y después el registro.
