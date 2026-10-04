# 04 · Banco de decisiones · Febrero

> 🎭 Todas las situaciones de esta página llevan `momento: febrero`. Ocurren durante el concurso: escenario del Falla, jurado, grada, prensa y resultados. Nada de presupuestos, fichajes ni elección de tipo: eso vive en Verano.

---

### 🎤 Repertorio sobre el escenario

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Hay que cerrar el popurrí de la final *(solo chirigotero)* | **Vámonos por Cai** · Al 3x4 de Cádiz, a lo grande — Música +2, Popularidad +2 | **Canto a la vida** · Apóyate en las esdrújulas, la fórmula más auténtica — Letra +2, Música +1 | `cierre_himno` / `cierre_esdrujulas` |
| Un cuplé no ha entrado en preliminares | **Cambiarlo para cuartos** · Si no ríe, fuera — Letra +1, Cohesión -1 | **Mantenerlo** · El chiste necesita otra grada — Cohesión +1, Popularidad -1 | `cuple_cambiado` / `cuple_mantenido` |
| Te toca actuar en la primera sesión de la fase | **Sacar el mejor pasodoble ya** · Que se hable de nosotros desde el día uno — Popularidad +2, Letra +1 | **Guardarlo para la siguiente fase** · Reservar la bala buena — Letra +2, Popularidad -1 | `ensenar_las_cartas` / `guardo_la_bala` |

> ⚠️ La primera situación usa `modalidades: ["chirigotero"]`. Falta su equivalente de comparsa (cierre del popurrí: apoteosis coral vs. cierre a capela).

---

### ⚖️ Jurado y concurso

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Sientes que el jurado te trata injustamente | **No ir al COAC el año que viene** · Que no me arruinen el carnaval — Popularidad -1, Cohesión +1 | **Seguir en el COAC** · Aquí se viene a competir — Popularidad +1 | `year_sabatico` / `sigo_compitiendo` |
| Te dejan fuera por un punto | **Reclamar públicamente** · Que se sepa lo que pienso — Popularidad +2, Cohesión -1 | **Callar y trabajar** · El año que viene hablo cantando — Letra +1, Cohesión +1 | `bronca_publica` / `silencio_digno` |
| Pasas a la siguiente fase con lo justo | **Repescar el repertorio** · Ajustar lo que no funcionó — Letra +1, Música +1, Cohesión -1 | **Mantener todo igual** · Si algo funciona, no se toca | `repertorio_retocado` / `repertorio_intacto` |

### 📣 Prensa y público

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Una letra se ha hecho viral, mal interpretada | **Salir a explicarla** · Que quede claro el mensaje — Popularidad +1 | **Dejar que se hable** · La polémica también es carnaval — Popularidad +2, Cohesión -1 | `di_explicaciones` / `deje_correr_polemica` |
| El público del Falla te pide un tema puntual | **Complacer al público** · Dar lo que se espera — Popularidad +2, Letra -1 | **Ir a tu aire** · El artista manda, no la grada — Letra +2, Popularidad -1 | `complazco_grada` / `voy_a_mi_aire` |
| Una radio local te pide entrevista en plena semana de cuartos | **Ir a la radio** · Sumar público — Popularidad +2, Música -1 | **Encerrarse a ensayar** · Lo importante es el escenario — Música +1, Popularidad -1 | `promocion_si` / `promocion_no` |

---

## 🔁 Condicionales de febrero

| Situación condicional | Se abre si | Ventana / prob. | Opción 1 | Opción 2 |
| --- | --- | --- | --- | --- |
| Un político te contesta en la prensa local | `pasodoble_duro` | 2 años · 60% | **Doblar la apuesta** · Otro pasodoble al mismo — Popularidad +2 | **Dejarlo estar** · Ya lo dije cantando — Letra +1 |
| Te llaman de la tele por la polémica | `deje_correr_polemica` | 1 año · 50% | **Ir al programa** · Aprovechar el foco — Popularidad +3, Letra -1 | **No ir** · Yo hablo en el Falla — Popularidad -1, Cohesión +1 |
| Tu antiguo compañero triunfa en otra agrupación | `historico_se_fue` o `fiche_fuera` | 3 años · 40% | **Llamarlo para volver** · La puerta sigue abierta — Cohesión +2, Popularidad -1 | **Seguir tu camino** · Aquí no falta nadie — Cohesión +1 |
| Un editor de una tele nacional quiere hacer un documental sobre tu agrupación | Haber llegado a la final alguna vez | 2 años · 8% | **Abrir las puertas** · Que se vea el carnaval de dentro — Popularidad +3, Cohesión -1 | **Decir no** · El ensayo es sagrado — Cohesión +2, Popularidad -1 |

---

## ⚡ Eventos especiales de febrero

No son decisiones: son alteraciones del concurso que el motor puede lanzar con baja probabilidad y que se narran en el resumen del año.

| Evento | Prob. anual | Efecto |
| --- | --- | --- |
| Año sin preliminares por circunstancias excepcionales | 3% (no antes del año 4) | Ese año el concurso arranca en cuartos con un cupo reducido; menos margen para corregir repertorio y más peso del azar |
| Avería o incidencia técnica en tu pase | 4% | Penalización puntual de Puesta en escena en la fase en curso |
| Ovación histórica en tu pase | 4% | Bono puntual de Popularidad y hito narrativo en la tarjeta final |

---

## Pendiente de este bloque

> ✅ Importado en CONTENT-001 a `src/content/decisiones/febrero/` y `src/content/condicionales/febrero.ts` (9 situaciones + 4 condicionales). Los **eventos especiales** siguen fuera de alcance (T5).

- [ ] Ampliar el pool base de febrero a 30-40 situaciones.
- [ ] Escribir el equivalente de comparsa del cierre de popurrí.
- [ ] Textos de resultado de cada fase (pasas / te quedas fuera) por modalidad.
