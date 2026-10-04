# Registro · Decisiones pendientes, contradicciones y huecos

Este documento recoge todo lo **no cerrado**. Ninguna contradicción se resuelve en silencio: aquí se deja constancia. Cuando algo se decida, se actualiza primero el documento fuente (`docs/01`–`docs/06`) y después este registro.

**Las contradicciones C1–C13 y C15 y los huecos T1–T20 están resueltos, diferidos o fuera de alcance.** Quedan abiertos **C14** (endpoint OG: edge vs. Node) y **T21** (validar el OG en el deploy de Netlify). Ver `decisiones-cerradas.md` para lo resuelto.

---

## Contradicciones abiertas

### C14 · Endpoint OG "edge" (constitución/docs) frente a Function Node por `resvg-js` ⬜ Abierta (pendiente de deploy)

La constitución (Principio técnico: "Imagen OG con `satori` + `resvg-js` en endpoint **edge**") y `docs/02` §10 dicen que el endpoint OG se sirve en el **edge**. Pero `@resvg/resvg-js` es un **módulo nativo (N-API)** y **no puede ejecutarse en Netlify Edge Functions** (Deno, sin N-API). La implementación real de la 007 (`src/pages/api/og/[codigo].png.ts`, `prerender = false`, adapter con `edgeFunctions: false`) usa una **Netlify Function con runtime Node**, lo cual es coherente con `resvg-js` pero contradice la documentación.

No se resuelve en silencio. Queda **pendiente del primer deploy** para confirmar que el binario nativo (`@resvg/resvg-js-linux-x64-gnu`) se empaqueta y ejecuta bien en Netlify Functions. Resolución prevista: **(a)** corregir la constitución (PATCH) y `docs/02` §10 para decir "Netlify Function (runtime Node)"; o **(b)** si el runtime Node también falla, migrar a `@resvg/resvg-wasm` y entonces sí poder usar edge.

## Contradicciones resueltas

### C12 · "Primer premio": techo de 6 niveles frente al objetivo de 20-25% ✅ Resuelta

`02` §8 define el techo con 6 niveles y `clamp(..., suelo, techo)` como tope de la resolución normal; solo el 8% con techo `primer_premio` podría ganar, pero `01` §7 pide que el 20-25% gane alguna vez. **Decisión (a):** el techo `podio` también permite ganar (puestos 1-3) y `primer_premio` gana con más facilidad, de modo que el 30% (podio + primer_premio) puede ganar y el objetivo es alcanzable manteniendo la estructura de 6 niveles. Además, la implementación vuelve a la estructura de 6 niveles (antes colapsaba `podio` y `primer_premio` en `final`).

### C13 · "tema_social dos años seguidos" frente a `unicaVez: true` ✅ Resuelta

`docs/03` pedía `tema_social` **dos años seguidos** para el condicional "El público espera otra vez tu registro social". Al **retirar los tipos** (2026-10-04) el pool de verano pasó a un único conjunto y toda situación sigue siendo `unicaVez: true`; el tema ya no se repite con la frecuencia necesaria para exigir `veces: 2`, así que la condición quedaría **inalcanzable**. **Decisión:** el condicional `cv_registro_social` se dispara con `tema_social` visto **una vez** (`{ tipo: "flag", flag: "tema_social" }`). La regla de repetición general se mantiene: una situación **no** sale dos años seguidos, pero puede volver más tarde por reciclado.

### Derogación del aviso de guardado descartado (feature 005 → feature 018) ✅ Resuelta (2026-10-01)

La feature **005** decidió mostrar un **aviso puntual** cuando un guardado no se podía restaurar. La feature **018** deroga ese aviso: con la **entrada directa** (sin pantalla de inicio obligatoria) el descarte pasa a ser **silencioso** y el juego arranca directo en la creación de personaje. Se retiró `AVISO_GUARDADO_DESCARTADO` de `src/juego/presentacion.ts`. Actualizado `decisiones-cerradas.md`.

### C15 · "Las decisiones no afectan al resultado" frente al modelo de atributos ✅ Resuelta (2026-09-20)

Diseño: las decisiones **no afectan al resultado**; lo fijan el `destino` oculto y el azar. Los **atributos parten de un valor estándar** y solo cambian por **excepciones declaradas** (unas pocas, con intercambio visible). Implementado en la feature **008**: se añadió `Opcion.excepcion` (regla Zod `efectos` ⇔ `excepcion`), se retiraron **los 80 `efectos`** del banco (quedan 4 opciones excepción en 2 situaciones) y se **recalibró** solo con parámetros, **sin tocar `coac.ts` ni las situaciones**.

Calibración final (`parametros.ts`, 10.000 carreras): pesos del techo `7/3/47/16/18/9`; umbrales `42/45/48/54/57`; `volatilidad` 0,4–1,3; `bonoAnoPico` 14; `probabilidadCrack` 0,003 / `bonusCrack` 12. Resultado: final 43,6 % · no cuartos 10,4 % · no preliminares 7,1 % · ≥1 primer premio 26,1 % · ≥3 11,4 % · ≥5 6,3 % · ≥10 0,4 % · ≥15 0,1 %. Actualizados `docs/01` §2 y `docs/02` §8. El efecto diferido y el 60/40 quedan fuera de alcance.

### T23 · Racha de posiciones idénticas en el borde del objetivo (feature 013)

Tras retirar los **tipos y categorías** (2026-10-04) la selección cambia de situación por año, lo que **desplaza ligeramente el RNG de desenlace**: en el mismo conjunto de 10.000 carreras (`seedBase: "forma-carrera"`) la peor racha de posición idéntica pasó de **8 a 9 años** (una sola carrera; media 2,47; racha >4 años 5,0 %). El resto de métricas de forma y de dificultad siguen dentro de los objetivos de `docs/01` §7 (final 43,5 %, no cuartos 13,7 %, ≥1 primer premio 25,2 %, ≥3 8,6 %). El test `forma-carrera` S-01/S-07 está calibrado a 8 y ahora falla por ese caso aislado.

**No se resuelve en silencio.** Se ajustará **solo con parámetros de forma** (p. ej. `amplitudForma`), nunca tocando situaciones, o se documentará que el objetivo pasa a ≤ 9. Medición pendiente de decidir.

---

## A. Diferido explícitamente (se hará más adelante)

### T22 · Valores de la curva de carrera (feature 013)

Los parámetros de la 013 (`curvaSubida`/`curvaDeclive` 30, `curvaExponente` 2, `objetivoEnTecho` 1, `anchoObjetivo` 12, `memoriaForma` 0,3, `amplitudForma` 4, `aporteAtributosMax` 6) están **calibrados contra los objetivos medibles**: la distribución de `01` §7, las frecuencias de premios de `01` §3 y los objetivos de forma (racha ≤ 4 años en el 90 %, ≥ 6 posiciones distintas, arco en el 60 %). Lo que **no** está validado todavía es el **tacto**: si una carrera de 20 años se sigue haciendo larga, si la racha de 5 años en el 5 % de carreras molesta o si el declive final se percibe demasiado pronto. Se ajustará **solo con parámetros** (nunca tocando situaciones) después de jugar partidas reales.

### T2 · Flags del premio "Coplas por Andalucía"

`01` §3 usa "flags de temática andaluza o de tierra" que aún **no existen** en el banco. Se añadirán al banco en el futuro.

### T5 · Eventos especiales y micro-eventos

Los eventos de febrero (`04`) y los micro-eventos sin decisión (`05` §1) no tienen aún tipo ni módulo. **No es relevante ahora mismo.**

### T12 · CI

`02` §6 cita `.github/workflows/ci.yml`. Se resolverá mediante **integración en Netlify** o GitHub Actions en el futuro.

### T13 · Valores numéricos del juego

Cierres previos (2026-09-19): `multiplicadorRuido` 6. **Recalibrado el 2026-09-20 (feature 008, al retirar los `efectos` del banco)**: **pesos del techo** `7/3/47/16/18/9`, **umbrales de nivel** `42/45/48/54/57`, `volatilidad` 0,4–1,3, `bonoAnoPico` 14 y **factor crack** `probabilidadCrack` 0,003 / `bonusCrack` 12, verificados con el simulador (10.000 carreras: final 43,6 %, no cuartos 10,4 %, no preliminares 7,1 %, ≥1 26,1 %, ≥3 11,4 %, ≥5 6,3 %, ≥10 0,4 %, ≥15 0,1 %). Sin cerrar: afinidades de premios y modificadores por creación de personaje (edad, localidad, género).

### T17 · Banco real de contenido para la simulación ✅ Resuelto

Resuelto en CONTENT-001: `scripts/simular.ts` usa `bancoContenido` de `src/content` y se retiró el import del banco de pruebas. El banco de pruebas (`src/engine/__tests__/fixtures.ts`) se conserva **solo** para los tests del motor y del módulo de simulación, que lo inyectan explícitamente.

### T21 · Validar el endpoint OG (`resvg-js`) en el deploy de Netlify ⬜ Pendiente de deploy

El endpoint `/api/og/[codigo].png` (OG-001, feature 007) usa `satori` + `@resvg/resvg-js`. `resvg-js` es un módulo **nativo**: el build local solo empaqueta el binario de la plataforma de compilación (aquí `@resvg/resvg-js-win32-x64-msvc`). Falta validar en **Linux x64** (imagen de build de Netlify) que se empaqueta y ejecuta `@resvg/resvg-js-linux-x64-gnu`.

**RECORDATORIO EN EL PRIMER DEPLOY**: al desplegar en Netlify, comprobar `/api/og/<codigo>.png`, `?t=9x16` y `?t=1x1` (deben devolver `image/png` con la tarjeta). Señal de fallo en los logs de Functions: `Cannot find module '@resvg/resvg-js-linux-x64-gnu'` o `... *.node`. Si aparece, aplicar la **opción B** de C14 (`@resvg/resvg-wasm`) antes de dar OG-001 por cerrado. Cerrar C14 y esta tarea a la vez.

> Nota: la validación real exige construir en Linux (CI de Netlify o WSL); construir en Windows no sirve porque empaqueta el binario `win32-x64`.

---

## B. Fuera de alcance (no se tiene en cuenta)

### T16 · Adaptador de compartición por red

`05` §2 diferencia mensajes para WhatsApp/X e imagen para Instagram/stories. **No se contempla** un fallback para navegadores sin Web Share API.

---

## C. Backlog de diseño y contenido

- [ ] Ampliar el banco a 60-80 situaciones (30-40 por momento).
- [ ] Marcar situaciones exclusivas por modalidad/variante (`modalidades`).
- [ ] Reducir la situación "Te separas de tu grupo" a una sola variante de texto (quedó duplicada al unificar contenido y personaje en un único pool de verano).
- [ ] Escribir el cierre de popurrí equivalente de comparsa (`04`).
- [ ] Añadir más cadenas condicionales de 3 eslabones.
- [ ] Añadir más decisiones de 3 opciones.
- [ ] Escribir textos de resultado de cada fase (pasas / te quedas fuera) y epílogos de retirada.
- [ ] Diseñar la tarjeta final compartible (datos + formato de imagen).
- [ ] Definir logros, insignias y finales alternativos por flags.
- [ ] Cerrar los valores numéricos con el simulador masivo.
- [ ] Calibrar el techo y la volatilidad contra la distribución objetivo.
- [ ] Añadir las flags de temática andaluza/tierra para Coplas por Andalucía (T2).
- [x] Conectar `scripts/simular.ts` al banco real de `content` y retirar el banco de pruebas (T17).
- [ ] Cambiar por iconos definitivos los que aún usan la **guitarra**: las variantes de **chirigota** («Clásico», «Interpretar el personaje», «Lolosedismo») y confirmar si la guitarra es la definitiva en la **modalidad Comparsa**.

## D. Backlog de producto / infraestructura

- [ ] Elegir herramienta de analítica sin cookies (Plausible / Umami / Cloudflare).
- [ ] Decidir dominio (`coplero.com` vs `coplero.es`) y registrador.
- [ ] Preparar CMP con Consent Mode para AdSense.
- [x] Rutas on-demand `/r/[codigo]` y `/api/og/[codigo].png` implementadas (feature 007). Queda **validar el OG en Netlify** (T21).
- [x] Formatos de imagen `og` 1200×630, `9:16` 1080×1920 y `1:1` 1080×1080 implementados y su generación (feature 007).

## E. Preguntas abiertas de infraestructura

- [ ] ¿Se confirma `coplero.com` en Cloudflare Registrar, o se prioriza `.es`?
- [ ] ¿Cuándo se solicita AdSense (tras qué umbral de tráfico/contenido)?
- [ ] ¿Se añade KV para estadísticas globales en v1 o se pospone?

---

## Ver también

- `decisiones-cerradas.md` — todo lo resuelto (C1–C11 y T1–T11, T14, T15).
- `docs/README.md` — mapa de documentos.
