# Quickstart — Landing estática

Guía para validar de punta a punta la landing. Contratos en [contracts/](./contracts/) y modelo de
contenido en [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).

## 1 · Ver la landing en local

```bash
npm run dev
```

Abre `http://localhost:4321/`.

**Esperado** (SC-002, SC-005):
- Hero con "Coplero", la explicación y el **CTA a `/jugar` visible sin scroll** (360×640).
- Secciones en orden: qué es, cómo funciona, modalidades, ejemplo de tarjeta y FAQ.
- Referencia visible a **acordesgaditanos** (misma autoría).
- Pie con redes, autor (Javier Cordero Toscano), LinkedIn/GitHub y copyright.

## 2 · Comprobar la FAQ y los enlaces (SC-003, SC-004)

- La FAQ responde al menos **5** preguntas y funciona **sin JavaScript** (son `<details>` nativos).
- Todas las llamadas a la acción llevan a `/jugar`.
- Ningún enlace devuelve 404.

## 3 · Accesibilidad y flujo E2E

```bash
npx playwright test tests/e2e/landing.spec.ts
```

**Esperado**: secciones presentes, CTA correcto, enlaces externos con `target="_blank"
rel="noopener noreferrer"`, y **axe sin violaciones** (WCAG 2.2 AA) (SC-006).

## 4 · Garantizar 0 kB de JavaScript (SC-001)

```bash
npm run build
Select-String -Path dist/index.html -Pattern "<script"   # no debe haber coincidencias
npm run preview
```

Abre `http://localhost:4321/` y comprueba en la pestaña Network que **no se carga ningún JS**.

## 5 · Comprobar la preview al compartir

- El `<head>` incluye `og:title`, `og:description` y `og:image` con URL absoluta sobre el dominio.
- `og:image` apunta a `/api/og/<codigo-ejemplo>.png` y devuelve una imagen válida (depende del
  endpoint OG; ver huecos **C14/T21** para Netlify).

## 6 · Comprobación global

```bash
npm run check
```

**Esperado**: `astro check` sin errores, Biome limpio y tests verdes (SC-007: sin scroll horizontal
desde 320 px).

## Criterios cubiertos

| Paso | Criterios |
|---|---|
| 1 | SC-002, SC-005 |
| 2 | SC-003, SC-004 |
| 3 | SC-006 |
| 4 | SC-001 |
| 5 | SC-005 |
| 6 | SC-007 |

## Resultados de la validación (2026-09-21)

| Paso | Resultado |
|---|---|
| 1 · Local | `/` carga con hero, **CTA visible sin scroll** (360×640) y 7 secciones; referencia a **Acordes Gaditanos** en "qué es" y en el pie |
| 2 · FAQ y enlaces | **6** preguntas en `<details>` (sin JS); todos los enlaces internos apuntan a `/jugar`; sin enlaces legales rotos |
| 3 · E2E + axe | `tests/e2e/landing.spec.ts`: **5/5 verde**, axe WCAG 2.2 AA **sin violaciones** (SC-006) |
| 4 · 0 kB de JS | `dist/index.html` **sin `<script>`** (0), y garantizado con test (`src/landing/__tests__/estatico.test.ts`) |
| 5 · Preview al compartir | `og:title`, `og:description`, `og:image` (`/api/og/<código-ejemplo>.png`) y `canonical` sobre `https://coplero.app/` |
| 6 · Global | `npm run check` verde: **48 ficheros, 242 tests**; sin scroll horizontal desde 320 px |

Nota: el ancho de contenido de la landing en escritorio es de **680 px** (no el 420–480 del bucle jugable).
