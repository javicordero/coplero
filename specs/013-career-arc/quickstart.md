# Quickstart — Validar la curva de carrera

**Feature**: 013-career-arc | **Fecha**: 2026-09-21

Guía para comprobar que la carrera tiene arco, que los años se diferencian y que la dificultad no se ha movido. Los umbrales están en [`contracts/verificacion.md`](./contracts/verificacion.md); aquí solo está cómo ejecutarlo.

## Requisitos previos

- Node 22+ y dependencias instaladas (`npm install`).
- Ninguna dependencia nueva: si `package.json` cambia, es un fallo (criterio de rechazo 7).

## 1. Unidades y determinismo

```bash
npm run test -- src/engine/__tests__/carrera.test.ts src/engine/__tests__/forma.test.ts
npm run test -- src/engine/__tests__/coac.test.ts src/engine/__tests__/determinismo.test.ts
```

**Resultado esperado**: V-01…V-10 verdes. La curva y la forma son puras y la secuencia de resultados por año es reproducible.

## 2. La carrera deja de ser plana

```bash
npm run test -- src/simulacion/__tests__/forma-carrera.test.ts
```

**Resultado esperado**: S-01…S-07 verdes. Este es **el test que falla con el motor actual**: antes de implementar, compruébalo (debe fallar con "carrera plana").

## 3. La dificultad no se ha movido

```bash
npm run simular -- 10000
```

**Resultado esperado** (medición con la que se cerró la fase):

| Métrica | Antes | Ahora | Objetivo |
|---|---|---|---|
| Pisa la final | 43,6 % | **43,3 %** | 45 % ± 3 pp |
| No pasa de cuartos | 10,4 % | **12,7 %** | 10 % ± 3 pp |
| No pasa de preliminares | 7,1 % | **7,8 %** | 7 % ± 2 pp |
| ≥ 1 primer premio | 26,1 % | **25,2 %** | 27 % ± 3 pp |
| ≥ 3 primeros premios | 11,4 % | **8,4 %** | 11 % ± 3 pp |
| ≥ 5 primeros premios | 6,3 % | **4,7 %** | 6 % ± 3 pp |
| ≥ 10 primeros premios | 0,4 % | 0,1 % | 0,4 % ± 0,3 pp |
| Premios por carrera (aguja / copla / candela) | 0,74 / 1,98 / 1,99 | **0,73 / 2,00 / 2,02** | ± 15 % |
| Reparto de techos | 7/3/47/16/18/9 | **idéntico** | sin tocar |

Y las nuevas, que son la razón de la fase:

| Métrica | Antes | Ahora | Objetivo |
|---|---|---|---|
| Racha máxima de posiciones idénticas | 20 años | media **2,5**, peor **8** | ≤ 4 en ≥ 90 %; nunca > 8 |
| Carreras con racha > 4 | ~99 % | **5,1 %** | ≤ 10 % |
| Posiciones distintas por carrera | 2,0 | **11,6** | ≥ 6 de media |
| Carreras con arco visible | ~0 % | **65,6 %** | ≥ 60 % |
| Auditoría «carrera plana» | miles | **ninguna** | 0 |

## 4. Comprobación manual (la experiencia)

```bash
npm run dev
```

1. Abrir `/jugar` y completar una carrera entera.
2. Anotar las posiciones año a año: deben **empezar peor de lo que acaban en el mejor momento** y volver a bajar al final, no repetirse.
3. Repetir con dos o tres carreras más: dos carreras deben leerse distintas aunque acaben en fases parecidas.
4. Comprobar que el año pico se nota (una subida clara en la pantalla de resultado).
5. Terminar la carrera y mirar la tarjeta: la trayectoria y los premios deben seguir siendo coherentes.

## 5. Puerta final

```bash
npm run check
npm run test:e2e
git diff --stat package.json package-lock.json
```

**Resultado esperado**: `check` verde (unidades + simulación), `test:e2e` verde (la interfaz no se rompe) y `package.json` sin cambios.

## Referencias

- Qué cambia y qué no: [`contracts/motor.md`](./contracts/motor.md)
- Entidades e invariantes: [`data-model.md`](./data-model.md)
- Decisiones y alternativas: [`research.md`](./research.md)
- Umbrales y criterios de rechazo: [`contracts/verificacion.md`](./contracts/verificacion.md)
