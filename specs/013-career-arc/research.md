# Fase 0 — Investigación y decisiones

**Feature**: 013-career-arc | **Fecha**: 2026-09-21

## R1 · Diagnóstico y causa raíz

**Decisión**: se documenta la causa exacta antes de tocar nada, porque el fallo es de *secuencia*, no de *distribución*.

**Evidencia medida en el motor actual**:

1. `Partida.atributos` arranca en 50 (`parametros.ts:119`) y **no cambia nunca** en una carrera normal: la feature 008 retiró los `efectos` de las 80 opciones.
2. `puntuacion` (`coac.ts:95-105`) = `Σ pesos·atributos` (idénticamente **50**) `+ ruido + carisma + bonoAnoPico`.
3. El ruido es `(rng·2−1) · volatilidad · multiplicadorRuido` con `volatilidad ∈ [0,4 · 1,3]` y `multiplicadorRuido = 6` ⇒ amplitud entre **±2,4 y ±7,8**.
4. Los umbrales son `42/45/48/54/57`: **bandas de 3 puntos** para una escala de 6 niveles.
5. `acotarEntreNiveles` (`coac.ts:107-111`) **recorta contra el techo**: lo que quede por encima se convierte en el techo. Como la base 50 ya supera cuartos (42) y semifinales (45), el techo se alcanza **el primer año**.
6. `puestoDe` (`coac.ts:58-63`) usa `entre()`, que **se satura en 1** cuando la puntuación está por encima de la banda (`coac.ts:42-45`). Recortado el nivel, la puntuación siempre está por encima ⇒ posición fija en el **extremo** de la banda:

| Techo | Posición que se repite | Cálculo |
|---|---|---|
| preliminares (7 %) | **17** siempre | `50 − 33` |
| cuartos (3 %) | **11** | `16 − 5` |
| **semifinales (47 %)** | **5** | `10 − 5` |
| final (16 %) | 4 | — |

7. Con techo bajo, el `bonoAnoPico` (+14) **es invisible**: sube la puntuación y el recorte la devuelve al mismo sitio.
8. Consecuencia: **no hay arco**. La carrera empieza en su techo y permanece ahí 20 años. `docs/01` §7 pide "empezar humilde → ascender → declive".

**Por qué el simulador no lo detectó**: `RegistroCarrera` guarda `mejorFase`, premios, duración y atributos finales, pero **no la secuencia de resultados por año**. Los agregados salían bien; la forma temporal era invisible. Ese es el hueco que hay que cerrar (R8).

**Rationale**: sin este diagnóstico, la tentación es "subir el ruido", que arregla la variación pero no el arco (y degrada la dificultad).

**Alternativas consideradas**: subir `multiplicadorRuido` (produce saltos aleatorios, no carreras); bajar los umbrales (empeora el problema: todo el mundo llega antes a su techo).

---

## R2 · Curva de carrera

**Decisión**: sustituir la base constante por una **aptitud que depende del año**, en forma de colina anclada al `anoPico` que ya existe.

```ts
aptitud(ano) = inicio + (cima − inicio) · u(t)

t    = ano − anoInicio
pico = anoPico − anoInicio
total = anosCarrera − 1

u(t) = t / pico                              si t ≤ pico     (0 → 1)
u(t) = 1 − (t − pico)/(total − pico)         si t > pico     (1 → 0)
```

- `cima = puntuacionObjetivo(destino.techo)` — dentro de la banda del techo, en la posición que marque `objetivoEnTecho` (ver R6).
- `inicio = cima − params.curvaSubida`.
- `fin = cima − params.curvaDeclive`.

**Rationale**: es determinista, puro, sin estado y de coste nulo. Ancla el techo donde debe estar —**en el mejor momento, no en el primero**— que es exactamente FR-006. Y reutiliza `anoPico`, que ya se sortea por carrera y hoy es decorativo: sus valores 2..18 producen por sí solos las variantes que pide `docs/01` §7 (pico en el 5-6 = ascenso rápido; pico en el 15+ = reconocimiento tardío; pico en el 2 = éxito temprano).

**Alternativas consideradas**:
- *Curva paramétrica suavizada (sigmoide/campana)*: más bonita, mismos resultados, más parámetros que calibrar.
- *Aptitud almacenada como estado que crece*: rompe la pureza y obliga a subir la versión del estado sin ganar nada.
- *Escalar los umbrales por año (dificultad creciente)*: acopla la dificultad al calendario y hace ilegible la relación entre puntuación y nivel.

---

## R3 · Forma con memoria (rachas creíbles)

**Decisión**: añadir un componente **autocorrelado** derivado de la semilla, sin guardarlo en el estado:

```ts
forma(ano) = amplitudForma · Σ_{k=0..t} ρ^(t−k) · ε_k

ε_k = rngPara(seed, "forma", anoInicio + k)() · 2 − 1     // ∈ [−1, 1]
ρ   = params.memoriaForma
```

- `ρ ≈ 0,5` y `amplitudForma ≈ 5`.
- Se calcula replicando los años anteriores: O(años) por año, O(años²) por carrera = 400 operaciones, despreciable.

**Rationale**: es un AR(1) clásico (ruido con memoria): los años buenos tienden a seguir a años buenos, pero la influencia decae y **la racha se rompe en pocos años**. Es lo que convierte "resultado aleatorio" en "tuvo una buena racha" y evita el patrón alternante artificial. Al derivarse de la semilla no añade campos a `Partida`: no hay migración, no hay `VERSION_PARTIDA`, y el determinismo es inherente.

**Alternativas consideradas**:
- *Guardar `forma` en el estado*: añade estado mutable serializable a cambio de nada (la semilla ya contiene la información).
- *Ruido blanco con más amplitud*: no crea rachas; crea ruido.
- *Cadena de Markov sobre el nivel*: produce secuencias plausibles pero desconecta el resultado de la puntuación y de la curva; se pierde la coherencia con los premios y la tarjeta.

---

## R4 · Posición no saturada

**Decisión**: la posición dentro del nivel se calcula con un **mérito normalizado propio de la carrera**, no con la puntuación absoluta frente a umbrales fijos.

```ts
merito = (puntuacion − pisoCarrera) / (cima − pisoCarrera)   // recortado a [0, 1]
puesto = bandaAlta(nivel) − round(merito · (bandaAlta − bandaBaja))
```

Donde la banda es la del nivel alcanzado (preliminares `50..17`, cuartos `16..11`, semifinales `10..5`, podio `3..1`).

**Rationale**: `entre()` contra umbrales fijos se satura en cuanto el nivel está recortado — de ahí el 17 y el 5 eternos. Con el mérito relativo a la propia carrera, los primeros años caen en la parte baja de la banda, el pico en la alta y el declive vuelve a bajar: la posición **cuenta el arco**, y además varía cada año porque el mérito incorpora la forma y el ruido. Es la pieza que satisface FR-001 y FR-002 directamente.

**Alternativas consideradas**:
- *Añadir un jitter aleatorio a la posición*: da variedad, pero aleatoria: "17, 22, 18, 25…" no cuenta ninguna historia.
- *Repartir la posición con una distribución por nivel*: rompe la relación entre lo bien que fue el año y su resultado.

---

## R5 · No se reequilibra el techo (hallazgo durante la planificación)

**Decisión**: **no** se tocan `pesosTecho` ni `umbralesNivel` salvo recalibración fina para cuadrar la tabla objetivo.

**Rationale**: una versión previa de la spec pedía que ningún techo superara el 25 % de las carreras. Al comprobarlo se vio que los pesos actuales `7/3/47/16/18/9` **son** los que materializan `docs/01` §7:

| Objetivo (`docs/01` §7) | Consecuencia del reparto actual |
|---|---|
| No pasa nunca de cuartos ~10 % | `preliminares + cuartos` = 7 + 3 = **10 %** |
| No pasa nunca de preliminares ~7 % | `preliminares` = **7 %** |
| Pisa la final ~45 % | `final + podio + primer_premio` = 16 + 18 + 9 = **43 %** (+ milagro) |
| Gana al menos un primer premio ~27 % | `podio + primer_premio` = **27 %** |

Y la medición actual (10.000 carreras) da 43,6 % / 26,1 % / 10,4 % / 7,1 %: cuadra. **Tocar los pesos rompería la dificultad.** El problema nunca fue compartir techo, sino que compartir techo significara compartir carrera. Se reformulan SC-005 y FR-008 en la spec y se mantiene el reparto.

**Alternativas consideradas**: repartir el techo y volver a calibrar todo (más trabajo y peor alineación con `docs/01`); dejar el techo plano (mantiene el fallo).

---

## R6 · Anclaje de la cima al techo

**Decisión**: la cima de la curva se sitúa **dentro de la banda del techo**, en la posición que indique `params.objetivoEnTecho` (arranque sugerido: `0,6`, es decir algo por encima del centro de la banda).

- `puntuacionObjetivo(techo)` = `umbralBase + objetivoEnTecho · (umbralTope − umbralBase)`, con `umbralBase/umbralTope` los límites de la banda del techo.
- Caso especial `preliminares`: su banda es `[0, 42)`; se ancla en la parte alta (≈ 40) para que el mejor año quede cerca del corte y la carrera cuente "se quedó a las puertas" en vez de "naufragó siempre".

**Rationale**: el objetivo del pico controla dos cosas a la vez: que el techo se **alcance** en el mejor momento (y por tanto "pisa la final" siga siendo `P(techo ≥ final)`) y cuánto margen queda para que la forma empuje un nivel más arriba (podio → primer premio), que es lo que sostiene el ~27 % de "gana al menos un primer premio". Es el parámetro de calibración principal.

**Alternativas consideradas**: anclar el pico al *principio* de la banda (el techo casi nunca se alcanza: incumple la tabla objetivo); anclar por encima de la banda (todo el mundo supera su techo: rompe el recorte y el techo deja de significar nada).

---

## R7 · Parámetros nuevos

**Decisión**: añadir a `ParametrosMotor` (todos inyectables, con valores por defecto):

| Parámetro | Valor final | Papel |
|---|---|---|
| `curvaSubida` / `curvaDeclive` | `30` / `30` | amplitud del arco: la carrera empieza y acaba en el mismo punto |
| `curvaExponente` | `2` | afila la cima (con 1 la meseta dura demasiados años) |
| `objetivoEnTecho` | `1` | dónde se ancla la cima en la banda del techo |
| `anchoObjetivo` | `12` | ancho máximo de la banda de anclaje |
| `margenPreliminares` | `2` | con techo de preliminares, la cima se queda a las puertas del corte |
| `memoriaForma` | `0,3` | `ρ` del AR(1) |
| `amplitudForma` | `4` | escala de la forma |
| `multiplicadorRuido` | `6 → 1,5` | ruido blanco residual |
| `aporteAtributosMax` | `6` | tope del aporte de atributos (R12) |

**Rationale**: mantiene la filosofía del proyecto —los números se calibran con el simulador, no a ojo (`AGENTS.md` §11, constitución III) y son inyectables sin tocar el motor. La amplitud es el hallazgo clave: con 16 puntos de arco y bandas de 3 puntos de ancho, la puntuación se queda dentro de la banda del techo **muchos años** (meseta ancha = carrera plana). Con 30, la curva cruza los umbrales con pendiente fuerte y el techo se toca pocos años.

**Alternativas consideradas**: reutilizar `volatilidad` para escalar también la forma (acopla dos cosas distintas: dispersión del techo y memoria); codificar los valores en constantes del módulo (rompe la inyectabilidad y los tests de parámetros).

---

## R12 · El desplazamiento permanente (segunda causa raíz)

**Decisión**: acotar el aporte de atributos con `aporteAtributosMax` (±6 puntos).

**Rationale**: al medir se descubrió una **segunda causa de planicie, independiente de la primera**. Las 6 excepciones declaradas son intercambios pequeños (letra −1, popularidad +1…), pero se aplican decenas de veces a lo largo de la carrera y **se acumulan**: en una carrera real medida, `letra` pasó de 50 a 75 y el aporte a la puntuación llegó a **+11,6** (solo +3 era carisma). Ese desplazamiento permanente mantenía la puntuación por encima del umbral del techo *desde el primer año*, y ninguna curva puede arreglarlo porque es aditivo y sin límite. Con el tope, el desplazamiento sigue existiendo (y se nota en la posición) pero no puede anular el arco.

**Alternativas consideradas**: hacer las excepciones de un solo uso (cambia la semántica de C15, que sigue cerrada); dejarlo como estaba (la carrera sigue plana).

---

## R13 · Bandas mono-valuadas y carreras "crack"

**Decisión**: las métricas de forma **excluyen a los cracks** (`carisma ≥ bonusCrack`), y `final`/`primer_premio` conservan sus bandas de un solo valor (`[4,4]` y `[1,1]`).

**Rationale**: llegar a la final significa ser 4.º y ganar significa ser 1.º: son bandas de un valor por definición del COAC, así que un año en ese nivel repite posición necesariamente. La variedad tiene que venir de que la carrera **no esté** en ese nivel todos los años, y eso es lo que aporta la curva. Al medir, la única carrera de 10.000 con una racha de 9 posiciones era un **crack** (carisma 15) ganando nueve años seguidos: eso es la carrera legendaria que `docs/01` §7 pide, no un fallo. Queda fuera de la auditoría de planicie y de las métricas de forma, y se informa como `cracksExcluidos`.

**Alternativas consideradas**: ensanchar la banda de la final a `[1,4]` (haría que "ganar" dejara de depender del techo y rompería la semántica de los premios); endurecer la auditoría y aceptar falsos positivos sobre carreras legendarias.

---

## R14 · Recalibración de los premios ajenos

**Decisión**: subir la probabilidad **por aparición** de los premios ajenos: aguja `0,21 → 0,39`; copla y candela `0,15 → 0,63`.

**Rationale**: con el arco, una carrera pasa **menos años** en la parte alta (de ~13 a ~3-6), así que manteniendo las probabilidades antiguas la frecuencia por carrera se desplomaba (copla 1,98 → 0,26). El objetivo de `docs/01` §3 es el **resultado medido** (aguja 0,74; copla 1,98; candela 1,99 por carrera) y su regla es "azar puro por aparición": para conservar el resultado con menos apariciones hay que subir la probabilidad de cada una. Es exactamente el tipo de ajuste que la constitución III permite —parámetros, nunca situaciones— y la recalibración es lo que hace que **todos** los objetivos cuadren a la vez.

**Alternativas consideradas**: dejar las probabilidades y aceptar premios ajenos casi inexistentes (empobrece la carrera); ensanchar la banda de la final (R13); alargar la meseta del arco (devuelve la planicie).

---

## R8 · El simulador aprende a mirar la secuencia

**Decisión**: `RegistroCarrera` incorpora la **secuencia por año** y se añaden métricas de forma al informe.

- `RegistroCarrera.secuencia: { ano: number; fase: FaseCOAC; puesto?: number }[]` (o dos arrays compactos: `fases` y `puestos`).
- Métricas nuevas: **racha máxima** de posiciones idénticas, **nº de posiciones distintas por carrera**, **detección de arco** (¿el mejor tramo de 3 años es posterior al primer tercio?), **diversidad de secuencias** (top-N y su peso), y **diversidad dentro de un mismo techo**.
- `auditoria.ts` gana un hallazgo **"carrera plana"** cuando una carrera repite la misma posición más de `umbralRacha` años.

**Rationale**: es la lección del fallo. El simulador medía el *qué* (cuántos llegan a la final) y no el *cómo* (en qué orden). Con la secuencia registrada, este tipo de regresión no puede volver a pasar desapercibida, y el informe pasa a ser una herramienta de experiencia, no solo de dificultad.

**Alternativas consideradas**: medir solo en los tests (el simulador seguiría ciego en cada calibración manual); guardar solo un resumen agregado de rachas (imposible de auditar caso a caso).

---

## R9 · El test que vigila la regresión concreta

**Decisión**: un test dedicado (`src/simulacion/__tests__/forma-carrera.test.ts`) que falla si el comportamiento antiguo reaparece:

1. **Ninguna carrera plana**: ninguna de las 10.000 simuladas repite la misma posición más de 8 años seguidos; en ≥ 90 % la racha máxima es ≤ 4.
2. **Arco**: en ≥ 70 % de las carreras el mejor tramo de 3 años es posterior al primer tercio.
3. **Diversidad**: media de posiciones distintas ≥ 6; las 5 secuencias más frecuentes < 15 %.
4. **Mismo techo ≠ misma carrera**: dentro de un techo, la secuencia más repetida < 5 %.

**Rationale**: FR-012 y FR-013 exigen que la prueba **detecte la regresión concreta**. Un test que solo comprobara la distribución agregada habría pasado con el motor roto, que es exactamente lo que ocurrió.

**Alternativas consideradas**: confiar en el snapshot (frágil y opaco: cambia por cualquier motivo sin explicar por qué).

---

## R10 · Persistencia y versión del estado

**Decisión**: **no** se sube `VERSION_PARTIDA`. La forma del estado no cambia (la forma/memoria se derivan de la semilla y la curva se calcula). Se documenta el efecto: una partida guardada a medias **continúa** con el criterio nuevo, así que sus años futuros pueden no parecerse a los que habría tenido.

**Rationale**: subir la versión descartaría partidas en curso sin necesidad técnica —el estado sigue siendo válido y el motor lo puede resolver—, y el proyecto ya tiene un mecanismo amable para descartar estados incompatibles si algún día hace falta. Añadir estado solo para poder versionarlo sería empeorar el diseño para justificar una migración.

**Alternativas consideradas**: subir la versión y descartar las partidas en curso (pierde continuidad sin ganar corrección); guardar la forma en el estado (R3).

---

## R11 · Lo que no se toca

**Decisión**: quedan **fuera de alcance** y no se modifican:

- Las decisiones del jugador siguen **sin afectar al resultado** (C15 permanece cerrada). Paquete C de las propuestas: no.
- El banco de contenido (`src/content/**`), las 27 situaciones y las 15 condicionales.
- `pesosTecho`, `umbralesNivel` (salvo ajuste fino de calibración) y las 6 excepciones declaradas.
- El batacazo (3 %), el milagro (2 %) y el `crack` (0,3 %): siguen existiendo y notándose.
- La duración (20 años) y las decisiones por año (2).
- La interfaz: ni el bucle jugable ni la tarjeta final necesitan cambios; se alimentan de los mismos datos.

**Rationale**: acota el cambio al motor y al simulador, que es donde está el fallo, y evita reabrir decisiones cerradas.

**Alternativas consideradas**: aprovechar para devolver efectos a las decisiones (paquete C: reabre C15 y obliga a rebalancear el banco).

---

## Resumen de decisiones

| # | Decisión | Impacto |
|---|---|---|
| R1 | Causa raíz documentada | evita "subir el ruido" a ciegas |
| R2 | Curva de carrera anclada al año pico | crea el arco |
| R3 | Forma AR(1) derivada de la semilla, sin estado | rachas creíbles, cero migración |
| R4 | Posición por mérito relativo | mata la saturación (17/5/11 eternos) |
| R5 | **No** reequilibrar el techo | preserva la dificultad de `docs/01` §7 |
| R6 | Cima anclada dentro de la banda del techo | parámetro principal de calibración |
| R7 | 6 parámetros nuevos inyectables | calibrable con el simulador |
| R8 | Simulador con secuencia + métricas de forma | el fallo no puede volver a esconderse |
| R9 | Test dedicado a detectar la regresión | FR-013 |
| R10 | Sin subida de `VERSION_PARTIDA` | continuidad y menos estado |
| R11 | Alcance acotado al motor y el simulador | no reabre C15 |
