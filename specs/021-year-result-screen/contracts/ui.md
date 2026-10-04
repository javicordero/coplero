# Contrato — UI: modo dev, indicador y pantalla de resultado del año

Contrato observable de la pantalla de resultado del año y de su modo de desarrollo. Lo consumen los tests E2E y forma la interfaz pública de la feature.

## 1. Entrada dev de resultado

| Aspecto | Contrato |
|---|---|
| Ruta | `GET /jugar?dev=resultado[&caso=<caso>]` |
| Efecto | La isla arranca directamente en la pantalla de resultado, sin jugar decisiones |
| Caso por defecto | `campeon` |
| Caso desconocido | Se cae al caso por defecto |
| Entorno | Solo desarrollo (`import.meta.env.DEV`); ausente y eliminada del bundle en producción |
| Persistencia | No escribe en `localStorage`; no reutiliza partidas guardadas |
| «Continuar» | Inerte en dev (no avanza) |

**Casos disponibles**: `campeon`, `podio`, `finalista`, `preliminares`, `sin-premios`, `fuera-de-concurso`, `distinciones`, `todas`.

**Compatibilidad**: `GET /jugar?dev=fin` conserva su contrato actual sin cambios.

## 2. Indicador de contexto

Selector: `[data-testid="indicador"]`.

| Pantalla | Texto | `data-momento` |
|---|---|---|
| Decisión de verano | `Año <N> · Verano` | `verano` |
| Decisión de febrero | `Año <N> · Febrero` | `febrero` |
| Resultado del año | `Año <N> · Resultado` | `resultado` |

**Regla**: en la pantalla de resultado el indicador **nunca** dice «Febrero». El año `<N>` corresponde al año en curso (o al de la fixture en dev). En el resultado, el indicador usa el **tono del texto suave** de la pantalla (el mismo que la etiqueta de llegada).

## 3. Pantalla de resultado

| Elemento | Selector | Contrato |
|---|---|---|
| Contenedor | `[data-testid="resultado"]` | Visible en `main[data-pantalla="resultado"]` |
| Año | `main[data-ano]` | `<año>` del resultado (de la partida o de la fixture dev) |
| Momento | `main[data-momento]` | `febrero` en el resultado real (atributo del contenedor `main`; **no confundir** con el `data-momento="resultado"` del indicador) |
| Panel | `.panel` | Superficie, borde, sombra y etiquetas en mayúsculas; **sin cabecera centrada** |
| Llegada y fase | dentro de `[data-testid="resultado"]` | «Has llegado a» / «Te has quedado en» + fase alcanzada; el puesto solo si existe |
| Distinciones | `.distincion` | Una por distinción del año, **en una fila** y en **orden fijo** (aguja, candela y coplas al final); ocupa ~**1/2** del ancho, **sin card**, con `.distincion__roseta` (encima) y `.distincion__nombre` (debajo, texto sutil del color de su roseta) |
| Avanzar | `[data-testid="continuar-ano"]` | **Dentro del panel** (`.panel [data-testid="continuar-ano"]`); en el flujo real avanza al año siguiente |

**Regla de estilo**: tema **oscuro por defecto** (como las pantallas de creación); el contenido va en un panel con `--c-superficie`, borde `--c-separador` y sombra; etiquetas en mayúsculas. **No** se usa la hoja clara de acta ni las líneas de cuaderno; **no** se muestran los fondos estacionales.

**Regla de distinciones**: como máximo una por tipo y año; si no hay distinciones, la fila se omite (sin placeholders). Se reutilizan las rosetas de `public/rosetas/` a través de `ROSETAS` (`presentacion.ts`).

**Regla de alcance**: no se altera el contenido del resultado; solo su presentación.

## 4. Accesibilidad y responsive

- Sin scroll horizontal desde 320 px.
- `axe` (`wcag2a`, `wcag2aa`, `wcag22aa`) sin violaciones `critical` ni `serious`.
- Estructura semántica con encabezado de pantalla y foco operable en «Continuar».

## 5. Producción

- `?dev=` no existe en el build de producción: la rama se elimina del bundle.
- El flujo normal (reanudar / crear personaje / decisiones / resultado / fin) no cambia.
