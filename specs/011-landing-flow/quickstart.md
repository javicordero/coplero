# Quickstart — Reordenar la landing, cabecera/pie persistentes y páginas nuevas

Guía para validar el marco común, la portada corta y las páginas nuevas. Contratos en
[contracts/](./contracts/) y modelo en [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).

## 1 · Marco en todas las páginas (SC-001)

```bash
npm run dev
```

Recorre `/`, `/jugar`, `/como-jugar`, `/politicas/politica-de-privacidad`,
`/politicas/politica-de-cookies` y una tarjeta `/r/<codigo>`.

**Esperado**: en **todas** se ve la **cabecera** arriba y el **pie** abajo, con el mismo fondo y el
mismo ancho de marco.

## 2 · Marca dinámica (FR-006)

En `/jugar`, crea un personaje eligiendo **femenino** y luego **no binario**.

**Esperado**: la marca de la cabecera pasa a **«Coplera»** y **«Coplere»** respectivamente; antes de
elegir sexo muestra **«Coplero»**.

## 3 · Portada corta (SC-002)

Abre `/` y recórrela.

**Esperado**: hero (Coplero + crear personaje + Empezar a jugar) y una única sección que fusiona
«qué es» y «cómo funciona». **No** aparecen modalidades, FAQ ni el cierre. El CTA lleva a `/jugar`
conservando el marco.

## 4 · `/como-jugar` (SC-008)

Abre `/como-jugar`.

**Esperado**: reglas del juego, las dos modalidades y la FAQ (≥5 preguntas), todo sin JavaScript.

## 5 · Pie y legal (SC-003, SC-004)

Baja al pie.

**Esperado**: cuatro bloques en orden (redes → autor → legal → copyright); todos los enlaces
funcionan, incluidos privacidad y cookies (sin 404).

## 6 · 0 kB en las páginas estáticas (SC-005)

```bash
npm run build
Select-String -Path dist/index.html,dist/como-jugar/index.html -Pattern "<script"
```

**Esperado**: sin coincidencias (0 scripts).

## 7 · Accesibilidad y E2E

```bash
npx playwright test tests/e2e/chrome.spec.ts tests/e2e/landing.spec.ts
```

**Esperado**: cabecera/pie en todas las páginas, marca dinámica, sin scroll horizontal desde 320 px y
**axe WCAG 2.2 AA** sin violaciones.

## 8 · Comprobación global

```bash
npm run check
```

**Esperado**: `astro check` sin errores, Biome limpio y tests verdes.

## Criterios cubiertos

| Paso | Criterios |
|---|---|
| 1 | SC-001 |
| 2 | FR-006 |
| 3 | SC-002 |
| 4 | SC-008 |
| 5 | SC-003, SC-004 |
| 6 | SC-005 (0 kB) |
| 7 | SC-005, SC-006, SC-007 |

## Resultados de la validación (2026-09-21)

| Paso | Resultado |
|---|---|
| 1 · Marco | Cabecera y pie visibles en `/`, `/jugar`, `/como-jugar`, las dos legales y `/r/codigo-invalido` (E2E) |
| 2 · Marca | Tras elegir **femenino** en la creación, la marca pasa a **«Coplera»**; antes, «Coplero» (E2E verde) |
| 3 · Portada | Hero + sección fusionada «Qué es Coplero y cómo funciona» + tarjeta de ejemplo; **sin** modalidades, FAQ ni cierre |
| 4 · `/como-jugar` | Reglas + 2 modalidades + **6** preguntas frecuentes (`<details>`, sin JS) |
| 5 · Pie | 4 bloques (redes → autor → legal → copyright) y los 7 enlaces externos + 2 legales, sin 404 |
| 6 · 0 kB | `dist/index.html`, `dist/como-jugar/index.html` y las dos legales: **0 `<script>`** |
| 7 · E2E + axe | **17/17** pruebas verdes (chrome, landing, jugar y compartir); axe WCAG 2.2 AA sin violaciones |
| 8 · Global | `npm run check` verde: **48 ficheros, 242 tests**; continuidad de fondo/cabecera/pie verificada entre `/` y `/jugar` |
