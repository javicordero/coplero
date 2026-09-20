# Registro · Decisiones pendientes, contradicciones y huecos

Este documento recoge todo lo **no cerrado**. Ninguna contradicción se resuelve en silencio: aquí se deja constancia. Cuando algo se decida, se actualiza primero el documento fuente (`docs/01`–`docs/06`) y después este registro.

**Todas las contradicciones C1–C13 y los huecos T1–T20 están resueltos, diferidos o fuera de alcance.** No queda ningún punto abierto que bloquee el desarrollo. Ver `decisiones-cerradas.md` para lo resuelto.

---

## Contradicciones resueltas

### C12 · "Primer premio": techo de 6 niveles frente al objetivo de 20-25% ✅ Resuelta

`02` §8 define el techo con 6 niveles y `clamp(..., suelo, techo)` como tope de la resolución normal; solo el 8% con techo `primer_premio` podría ganar, pero `01` §7 pide que el 20-25% gane alguna vez. **Decisión (a):** el techo `podio` también permite ganar (puestos 1-3) y `primer_premio` gana con más facilidad, de modo que el 30% (podio + primer_premio) puede ganar y el objetivo es alcanzable manteniendo la estructura de 6 niveles. Además, la implementación vuelve a la estructura de 6 niveles (antes colapsaba `podio` y `primer_premio` en `final`).

### C13 · "tema_social dos años seguidos" frente a `unicaVez: true` ✅ Resuelta

`docs/03` pide `tema_social` **dos años seguidos** para el condicional "El público espera otra vez tu registro social", pero la clarificación Q2 de CONTENT-001 marca todas las situaciones con `unicaVez: true`: la situación que concede la flag (`v_letra_tema`) no se repite en años consecutivos, así que `flagRepetida` con `consecutivos: true` sería **inalcanzable**. **Decisión confirmada por diseño:** modelar el requisito como `flagRepetida` `veces: 2` **sin** exigir consecutivos ("el tema ha vuelto"), que sí es alcanzable. La regla de repetición queda: una situación **no** sale dos años seguidos, pero puede volver más tarde (reciclado); las flags se acumulan aunque no en años consecutivos.

---

## A. Diferido explícitamente (se hará más adelante)

### T2 · Flags del premio "Copla para Andalucía"

`01` §3 usa "flags de temática andaluza o de tierra" que aún **no existen** en el banco. Se añadirán al banco en el futuro.

### T5 · Eventos especiales y micro-eventos

Los eventos de febrero (`04`) y los micro-eventos sin decisión (`05` §1) no tienen aún tipo ni módulo. **No es relevante ahora mismo.**

### T12 · CI

`02` §6 cita `.github/workflows/ci.yml`. Se resolverá mediante **integración en Netlify** o GitHub Actions en el futuro.

### T13 · Valores numéricos del juego

Cerrados por la calibración del 2026-09-19: **pesos del techo** (`7/3/47/6/28/9`), **umbrales de nivel** (`42/54/60/62/68`), **multiplicador de ruido** (6) y **factor crack** (`probabilidadCrack` 0,01 / `bonusCrack` 10), verificados con el simulador (10.000 carreras: final 43,5%, no cuartos 10,4%, no preliminares 7,1%, ≥1 27,2%, ≥3 11,5%, ≥5 5,8%, ≥10 0,4%, ≥15 0,1%). Sin cerrar: `bonoAnoPico`, afinidades de premios y modificadores por creación de personaje (edad, localidad, género). Se revisarán cuando exista el banco real de `content`, porque dependen del crecimiento de atributos de las opciones.

### T17 · Banco real de contenido para la simulación ✅ Resuelto

Resuelto en CONTENT-001: `scripts/simular.ts` usa `bancoContenido` de `src/content` y se retiró el import del banco de pruebas. El banco de pruebas (`src/engine/__tests__/fixtures.ts`) se conserva **solo** para los tests del motor y del módulo de simulación, que lo inyectan explícitamente.

---

## B. Fuera de alcance (no se tiene en cuenta)

### T16 · Adaptador de compartición por red

`05` §2 diferencia mensajes para WhatsApp/X e imagen para Instagram/stories. **No se contempla** un fallback para navegadores sin Web Share API.

---

## C. Backlog de diseño y contenido

- [ ] Ampliar el banco a 60-80 situaciones (30-40 por momento).
- [ ] Marcar situaciones exclusivas por modalidad/variante (`modalidades`).
- [ ] Escribir el cierre de popurrí equivalente de comparsa (`04`).
- [ ] Añadir más cadenas condicionales de 3 eslabones.
- [ ] Añadir más decisiones de 3 opciones.
- [ ] Escribir textos de resultado de cada fase (pasas / te quedas fuera) y epílogos de retirada.
- [ ] Diseñar la tarjeta final compartible (datos + formato de imagen).
- [ ] Definir logros, insignias y finales alternativos por flags.
- [ ] Cerrar los valores numéricos con el simulador masivo.
- [ ] Calibrar el techo y la volatilidad contra la distribución objetivo.
- [ ] Añadir las flags de temática andaluza/tierra para Copla para Andalucía (T2).
- [x] Conectar `scripts/simular.ts` al banco real de `content` y retirar el banco de pruebas (T17).

## D. Backlog de producto / infraestructura

- [ ] Elegir herramienta de analítica sin cookies (Plausible / Umami / Cloudflare).
- [ ] Decidir dominio (`coplero.com` vs `coplero.es`) y registrador.
- [ ] Preparar CMP con Consent Mode para AdSense.
- [ ] Implementar las rutas on-demand `/r/[codigo]` y `/api/og/[codigo].png` (adapter y deps ya listos).
- [ ] Diseñar formatos de imagen 9:16 y 1:1 y su generación.

## E. Preguntas abiertas de infraestructura

- [ ] ¿Se confirma `coplero.com` en Cloudflare Registrar, o se prioriza `.es`?
- [ ] ¿Cuándo se solicita AdSense (tras qué umbral de tráfico/contenido)?
- [ ] ¿Se añade KV para estadísticas globales en v1 o se pospone?

---

## Ver también

- `decisiones-cerradas.md` — todo lo resuelto (C1–C11 y T1–T11, T14, T15).
- `docs/README.md` — mapa de documentos.
