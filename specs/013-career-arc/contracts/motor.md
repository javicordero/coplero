# Contrato — Motor

**Feature**: 013-career-arc | **Fecha**: 2026-09-21

Este contrato fija qué puede cambiar y qué **no** puede cambiar del motor. Es lo que impide que una mejora de experiencia rompa las garantías del proyecto.

## 1. Superficie pública (no cambia)

```text
crearPartida(input, banco, params?) → Partida
siguientePaso(partida, banco)       → Paso
elegir(partida, opcionId, banco, params?) → Resultado<Partida, ErrorMotor>
continuar(partida)                  → Partida
resumen(partida, banco)             → TarjetaFinal
```

- Las firmas MUST NOT cambiar.
- Módulos nuevos: `src/engine/carrera.ts` (curva) y `src/engine/forma.ts` (memoria). Ambos son funciones puras exportables y testeables por separado.
- El motor MUST NOT importar de `web`, `content` ni de ningún framework (Principio I).

## 2. Invariantes que MUST permanecer

| # | Invariante | Cómo se comprueba |
|---|---|---|
| I-01 | **Determinismo total**: misma semilla + mismas decisiones ⇒ misma `Partida`, **incluida la secuencia de resultados por año** | `determinismo.test.ts` ampliado |
| I-02 | **Sin azar ni tiempo implícitos**: cero `Math.random()`, cero `Date.now()` | `pureza.test.ts` (ya existe) |
| I-03 | **Reducer puro**: sin mutación ni efectos secundarios | `pureza.test.ts` |
| I-04 | **Estado serializable y sin clases**; `Partida` conserva su forma actual (no gana campos) | `serializacion.test.ts` |
| I-05 | **El techo es interno**: no se muestra, no se serializa en el código compartible, no aparece en la tarjeta | `codec.test.ts` / `tarjeta.test.ts` |
| I-06 | **Ninguna carrera supera su techo**, salvo el milagro (una vez por carrera); el batacazo solo baja | `coac.test.ts` |
| I-07 | **La puntuación se recorta a [0, 100]**; el puesto siempre cae en `1..50` y dentro de la banda de su nivel | `coac.test.ts` |
| I-08 | **Todo el azar sale de `rngPara`** con claves de contexto estables | `pureza.test.ts` + revisión |
| I-09 | **Los parámetros son inyectables**: ningún valor numérico de calibración vive como constante dentro de la lógica | `simulacion/__tests__/parametros.test.ts` |

## 3. Cambios permitidos y esperados

| Cambio | Detalle |
|---|---|
| Sustituir la base constante de 50 por `aptitud(ano)` | la puntuación deja de ser una constante desplazada |
| Añadir `forma(ano)` (AR(1) derivada de la semilla) | nueva fuente de variación con memoria |
| Reducir `multiplicadorRuido` (6 → ≈1,5) | la variación la aporta la memoria, no el ruido |
| Calcular el puesto por mérito relativo | deja de saturarse en el extremo de la banda |
| Añadir 6 parámetros a `ParametrosMotor` (R7) | calibrables con el simulador |
| Añadir la secuencia a `RegistroCarrera` y métricas de forma al informe | instrumentación, fuera del motor puro |

## 4. Cambios prohibidos

1. Tocar `pesosTecho` o `umbralesNivel` más allá del ajuste fino de calibración (R5: son la distribución objetivo).
2. Devolver efectos a las decisiones del jugador (reabriría C15).
3. Tocar `src/content/**` o el banco de situaciones.
4. Guardar la forma o la curva en `Partida` (el estado no crece).
5. Subir `VERSION_PARTIDA` sin que cambie la forma del estado.
6. Introducir dependencias nuevas.
7. Cambiar la interfaz del bucle jugable o de la tarjeta.

## 5. Contrato de la curva (E1)

- `aptitud(0) = inicio`, `aptitud(pico) = cima` exactos.
- Monótona creciente en `[0, pico]` y decreciente en `[pico, total]`.
- `cima` dentro de la banda del techo (R6).
- Definida (sin `NaN`) para cualquier `pico ∈ [0, total]`.

## 6. Contrato de la forma (E2)

- Determinista para `(seed, ano)`.
- Autocorrelada con `ρ > 0` y decaimiento geométrico.
- Acotada.
- `ρ = 0` ⇒ ruido blanco (caso límite).
- No añade estado a `Partida`.

## 7. Contrato de la posición (E4)

- El puesto cae siempre dentro de la banda del nivel alcanzado.
- Monótono con la puntuación dentro del nivel.
- **Prohibido** que el puesto sea constante a lo largo de una carrera con mérito variable (es la regresión que esta feature elimina).
