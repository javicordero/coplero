# Contrato — Verificación

**Feature**: 013-career-arc | **Fecha**: 2026-09-21

Los umbrales son normativos. **No se relaja ninguno para que un test pase**: si un número no cuadra, se recalibra el motor con el simulador, nunca el test.

## 1. Comandos

| Comando | Qué cubre |
|---|---|
| `npm run check` | `astro check` + `biome check .` + `vitest run` — puerta única |
| `npm run simular -- 10000` | calibración y comprobación de los agregados |
| `npm run test:e2e` | regresión funcional (la experiencia no cambia de forma) |

## 2. Vitest — determinismo y unidades

| ID | Prueba | Umbral | Requisito |
|---|---|---|---|
| V-01 | Misma semilla + mismas decisiones ⇒ misma `Partida` **y misma secuencia de resultados** (10.000 carreras) | 100 % | FR-009, I-01 |
| V-02 | `aptitud`: extremos exactos, monotía por tramos, definida con `pico` en los bordes | sin excepciones | E1 |
| V-03 | `forma`: determinista, autocorrelación positiva, decaimiento, acotada; `ρ = 0` ⇒ ruido blanco | sin excepciones | E2 |
| V-04 | La puntuación de una carrera **no es constante**: siempre hay variación entre años | varianza > 0 | FR-001 |
| V-05 | El `bonoAnoPico` es observable también con techo = preliminares | sin excepciones | FR-004 |
| V-06 | El puesto cae en la banda de su nivel y es monótono con la puntuación; `1 ≤ puesto ≤ 50` | sin excepciones | E4, I-07 |
| V-07 | Ninguna carrera supera su techo salvo milagro | sin excepciones | I-06 |
| V-08 | El estado serializado **no contiene** `techo`, `suelo`, `anoPico`, `volatilidad` ni `carisma` | 0 fugas | I-05 |
| V-09 | `Partida` conserva su forma: ni campos nuevos ni cambios de tipo; `VERSION_PARTIDA` sin tocar | igualdad exacta | I-04 |
| V-10 | Snapshot de la partida de referencia actualizado y explicado | 1 fichero | III |

## 3. Simulación masiva — forma de la carrera (10.000 carreras)

| ID | Prueba | Umbral | Requisito |
|---|---|---|---|
| S-01 | **Ninguna carrera plana**: racha máxima de posiciones idénticas | ninguna > **8** años | SC-008, FR-013 |
| S-02 | Racha máxima de posiciones idénticas | ≤ **4** años en ≥ **90 %** de las carreras | SC-001 |
| S-03 | Posiciones distintas por carrera | media ≥ **6** | SC-002 |
| S-04 | Arco visible: el mejor tramo de 3 años es posterior al primer tercio | ≥ **60 %** de las carreras (no 70: `docs/01` §7 quiere también ascensos rápidos) | SC-003 |
| S-05 | Las 5 secuencias de resultados más frecuentes | < **15 %** del total | SC-007 |
| S-06 | Dentro de un mismo techo, la secuencia más repetida | < **5 %** de las carreras de ese techo | SC-005, FR-008 |
| S-07 | Auditoría: hallazgo «carrera plana» | 0 hallazgos | R8, FR-013 |

## 4. Simulación masiva — dificultad preservada

| ID | Prueba | Umbral | Requisito |
|---|---|---|---|
| S-08 | Pisa la final alguna vez | 45 % ± 3 pp | SC-004 |
| S-09 | No pasa nunca de cuartos | 10 % ± 3 pp | SC-004 |
| S-10 | No pasa nunca de preliminares | 7 % ± 2 pp | SC-004 |
| S-11 | Gana al menos un primer premio | 27 % ± 3 pp | SC-004 |
| S-12 | Gana 3 o más primeros premios | 11 % ± 3 pp | SC-004 |
| S-13 | Gana 10 o más primeros premios | 0,4 % ± 0,3 pp | SC-004 |
| S-14 | Premios ajenos por carrera (aguja / copla / candela) | 0,74 / 1,98 / 1,99 (± 15 %) | FR-014 |
| S-15 | Reparto de techos | exactamente el actual `7/3/47/16/18/9` | R5 |
| S-16 | Duración de la simulación de 10.000 carreras | < 30 s (hoy ≈ 1,9 s) | rendimiento |

## 5. E2E — la experiencia no se rompe

| ID | Prueba | Umbral |
|---|---|---|
| E-01 | `npm run test:e2e` completo (25 pruebas) | 100 % verde |
| E-02 | Una carrera jugada de principio a fin muestra resultados variados en pantalla | ≥ 3 posiciones distintas |

## 6. Criterios de rechazo

Se rechaza el trabajo si ocurre cualquiera de estos:

1. Aparece una carrera con la misma posición durante toda su duración.
2. Se baja un umbral (racha, arco, diversidad o agregados) para que un test pase.
3. Los agregados de `docs/01` §7 se salen de tolerancia y se compensa tocando las situaciones.
4. Se toca `pesosTecho` o `umbralesNivel` fuera del ajuste fino de calibración.
5. Se añade estado a `Partida` o se sube `VERSION_PARTIDA` sin cambio de forma.
6. Se devuelven efectos a las decisiones (reabrir C15).
7. Se añade una dependencia.
8. `npm run check` no pasa.
