# Fase 1 — Modelo

**Feature**: 013-career-arc | **Fecha**: 2026-09-21

No hay datos nuevos persistidos: **la forma se calcula, no se guarda**. Lo que se modela son las magnitudes que intervienen en el resultado anual y las invariantes que deben cumplir. Todo vive en `src/engine/**` (motor puro) salvo E5/E6, que son instrumentación de simulación.

---

## E1 · Aptitud de carrera (curva)

```ts
interface CurvaCarrera {
  inicio: number   // puntuación al empezar la carrera
  cima: number     // puntuación en el año pico
  fin: number      // puntuación en el último año
}
```

`aptitud(t)` interpola linealmente `inicio → cima` hasta `t = pico` y `cima → fin` desde ahí hasta `t = total`.

**Reglas de validación**

1. `cima` MUST caer dentro de la banda del techo (R6) y `inicio`/`fin` MUST ser estrictamente menores que `cima`.
2. La curva MUST ser monótona creciente hasta el pico y monótona decreciente después.
3. `t = pico` MUST devolver exactamente `cima` y `t = 0` exactamente `inicio`.
4. MUST ser una función pura de `(ano, destino, params)`: sin estado, sin azar, sin tiempo.
5. Con `pico ≤ 0` o `pico ≥ total` el comportamiento MUST quedar definido (no debe producir `NaN` ni división por cero).

---

## E2 · Forma (memoria entre años)

```ts
type Forma = (ano: number) => number
```

`forma(ano) = amplitudForma · Σ_{k=0..t} ρ^(t−k) · ε_k`, con `ε_k ∈ [−1, 1]` derivado de `rngPara(seed, "forma", ano_k)`.

**Reglas de validación**

1. MUST ser determinista: la misma semilla y el mismo año MUST devolver el mismo valor.
2. MUST ser **autocorrelada** (`ρ > 0`): el valor de un año debe parecerse al anterior; la correlación decae con la distancia.
3. MUST NOT crecer sin límite: el valor MUST mantenerse dentro de un rango acotado (≈ `±amplitudForma/(1−ρ)`), y en la práctica acotado por el recorte de la puntuación.
4. MUST NOT añadir campos a `Partida` (se deriva de la semilla).
5. Con `ρ = 0` MUST degradar a ruido blanco (caso límite comprobable).

---

## E3 · Puntuación anual

```ts
puntuacion = aptitud(ano)          // E1
           + carisma               // destino (0 / +3 Cádiz / +12 crack)
           + forma(ano)            // E2
           + ruido(ano)            // blanco residual
           + bonoAnoPico           // solo si ano === destino.anoPico
```

**Reglas de validación**

1. `puntuacion` MUST recortarse a `[0, 100]`.
2. La puntuación MUST variar de un año a otro en condiciones normales (no puede ser constante).
3. El `bonoAnoPico` MUST ser perceptible **también con techos bajos** (hoy el recorte lo anula): es el año en que la carrera puede tocar su techo.
4. Todos los sumandos MUST ser deterministas para `(seed, ano)`.

---

## E4 · Mérito y posición

```ts
merito ∈ [0, 1]     // (puntuacion − pisoCarrera) / (cima − pisoCarrera)
puesto = bandaAlta(nivel) − round(merito · (bandaAlta(nivel) − bandaBaja(nivel)))
```

**Bandas** (las actuales, no cambian): preliminares `50..17`, cuartos `16..11`, semifinales `10..5`, podio `3..1`; `final` = 4 y `primer_premio` = 1 por definición del COAC.

**Reglas de validación**

1. El puesto MUST quedar dentro de la banda del nivel alcanzado.
2. El puesto MUST NOT ser constante a lo largo de una carrera cuando el mérito varía: la saturación en el extremo está prohibida.
3. El mérito MUST ser monótono con la puntuación: un año mejor no puede dar peor puesto dentro del mismo nivel.
4. `merito` MUST recortarse a `[0, 1]` (ni negativo ni mayor que uno).
5. Un `puesto` fuera de `1..50` MUST ser imposible.

---

## E5 · Secuencia de carrera (instrumentación de simulación)

```ts
interface PasoDeSecuencia {
  ano: number
  fase: FaseCOAC
  puesto?: number   // ausente si no se concursó
}

interface RegistroCarrera {
  // …campos actuales…
  secuencia: PasoDeSecuencia[]
}
```

**Reglas de validación**

1. MUST contener una entrada por año efectivamente resuelto, en orden.
2. Los años sin concursar MUST aparecer con `fueraDeConcurso` y sin `puesto` (no cuentan como racha).
3. MUST permitir reconstruir la racha máxima y la diversidad sin volver a jugar la carrera.
4. MUST NOT alterar el resultado del motor: es registro, no lógica.

---

## E6 · Métricas de forma (informe)

```ts
interface MetricasForma {
  rachaMaximaMedia: number
  rachaMaximaP95: number
  carrerasConRachaLarga: number      // % con racha > umbral
  posicionesDistintasMedia: number
  carrerasConArco: number            // % cuyo mejor tramo de 3 años es posterior al primer tercio
  diversidadSecuencias: { top: { secuencia: string; pct: number }[] }
  diversidadPorTecho: Record<NivelCOAC, { secuenciaTop: string; pct: number }>
}
```

**Reglas de validación**

1. Vigila el **mismo problema** que provocó esta feature: las métricas de forma son obligatorias en el informe, no opcionales.
2. Los umbrales (`umbralRacha`, tamaño de la ventana del arco) MUST ser parámetros de la auditoría, no números mágicos dispersos.
3. Si `carrerasConRachaLarga > 0` o la diversidad por techo supera su umbral, la auditoría MUST reportarlo como **hallazgo**, igual que hace hoy con los "estados imposibles".

---

## E7 · Techo y año pico (entidades existentes, papel nuevo)

| Campo | Antes | Ahora |
|---|---|---|
| `destino.techo` | valor donde la carrera **descansaba** desde el año 1 | valor que la carrera **alcanza en su mejor momento** (aspiracional) |
| `destino.anoPico` | `+14` en un año, invisible con techos bajos | ancla de la **cima de la curva** (R2/R6) |
| `destino.volatilidad` | única fuente de variación | dispersión del techo (se mantiene) |
| `destino.carisma` | desplazamiento constante | desplazamiento constante (se mantiene) |

**Reglas de validación**

1. El techo MUST seguir siendo interno: no se muestra, no se serializa en el código compartible y no aparece en la tarjeta.
2. Ninguna carrera MUST superar su techo salvo por el milagro (una vez por carrera) o el batacazo (hacia abajo).
3. `anoPico` MUST caer dentro de la carrera.

---

## Trazabilidad requisito → entidad

| Requisito | Entidades |
|---|---|
| FR-001 variación anual | E2, E3, E4 |
| FR-002 rachas cortas | E2 |
| FR-003 arco de carrera | E1, E7 |
| FR-004 año pico perceptible | E3, E7 |
| FR-005 variedad de arcos | E1 (`anoPico`), E7 |
| FR-006 techo aspiracional | E1, E4, E7 |
| FR-007 dificultad agregada | E7 (pesos intactos), R5 |
| FR-008 mismo techo ≠ misma carrera | E2, E4, E6 |
| FR-009 determinismo | E1, E2, E3 |
| FR-010 estado serializable | E2 (derivada), E7 |
| FR-011 decisiones sin efecto | fuera de alcance (R11) |
| FR-012/FR-013 pruebas | E5, E6 |
| FR-014 premios independientes | fuera de alcance (no cambia `premios.ts`) |
