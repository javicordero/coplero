# Registro · Decisiones pendientes, contradicciones y huecos

Este documento recoge todo lo **no cerrado**. Ninguna contradicción se resuelve en silencio: aquí se deja constancia. Cuando algo se decida, se actualiza primero el documento fuente (`docs/01`–`docs/06`) y después este registro.

**Todas las contradicciones C1–C11 y los huecos T1–T16 están resueltos, diferidos o fuera de alcance.** No queda ningún punto abierto que bloquee el desarrollo. Ver `decisiones-cerradas.md` para lo resuelto.

---

## A. Diferido explícitamente (se hará más adelante)

### T2 · Flags del premio "Copla para Andalucía"

`01` §3 usa "flags de temática andaluza o de tierra" que aún **no existen** en el banco. Se añadirán al banco en el futuro.

### T5 · Eventos especiales y micro-eventos

Los eventos de febrero (`04`) y los micro-eventos sin decisión (`05` §1) no tienen aún tipo ni módulo. **No es relevante ahora mismo.**

### T12 · CI

`02` §6 cita `.github/workflows/ci.yml`. Se resolverá mediante **integración en Netlify** o GitHub Actions en el futuro.

### T13 · Valores numéricos del juego

Sin cerrar: `bonoAnoPico`, umbrales de `faseSegunPuntuacion`, `volatilidad·15`, afinidades de premios y modificadores por creación de personaje (edad, localidad, género). **Todo lo del juego se definirá más adelante** y se calibrará con el simulador.

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
