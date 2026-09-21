# Contrato — Verificación

**Feature**: 012-visual-design | **Fecha**: 2026-09-21

Define qué demuestra que la fase está terminada. Los umbrales son normativos: si un cambio no los cumple, no está listo, y **no se relaja el test para que pase**.

## 1. Comandos

| Comando | Qué cubre |
|---|---|
| `npm run check` | `astro check` + `biome check .` + `vitest run` — puerta única |
| `npm run test:e2e` | Playwright: suite existente + `visual.spec.ts` |
| `npm run build` | verifica que las estáticas se generan sin JS añadido |

## 2. Vitest — pruebas puras (`src/ui/__tests__/`)

| ID | Prueba | Umbral | Requisito |
|---|---|---|---|
| V-01 | Contraste de cada par token/fondo declarado en `contracts/ui.md` §2 | ≥ 7:1 texto principal; ≥ 4.5:1 texto secundario y acentos; ≥ 3:1 **contorno de control** sobre fondo y superficies; `--c-separador` exento | FR-006, SC-001 |
| V-02 | Contraste de `--c-sobre-acento` sobre `--c-acento` | ≥ 4.5:1 | FR-006 |
| V-03 | Integridad `tokens.css` ↔ `tokens.ts`: mismo conjunto de nombres y mismos valores | igualdad exacta | R1 |
| V-04 | Anti-hardcode: ningún `#rrggbb` en `src/**` salvo `src/ui/**`, `src/panel-ui/**`, `src/engine/**`, `src/content/**` | 0 infracciones | FR-001 |
| V-05 | Escala tipográfica monótona y `--texto-base` ≥ 1 rem | sin excepciones | FR-003 |
| V-06 | `--ancho-marco` = 680 px y 420 ≤ `--ancho-bucle` ≤ 480 px | exacto | Principio IV |
| V-07 | Duraciones ≤ 300 ms (`docs/05` §1) y existencia de la regla `prefers-reduced-motion` en `base.css` | sin excepciones | FR-010, SC-005 |
| V-08 | Cada `@font-face` de `base.css` declara `font-display: swap` y su woff2 existe en `public/fonts/`; la pila de reserva es local | sin excepciones | FR-004 |

## 3. Playwright + axe — pruebas de navegador (`tests/e2e/visual.spec.ts`)

| ID | Prueba | Umbral | Requisito |
|---|---|---|---|
| E-01 | axe WCAG 2.2 AA en `/`, `/como-jugar`, `/jugar`, `/r/[codigo]` y legales | 0 violaciones | FR-016, SC-006 |
| E-02 | Sin scroll horizontal a 320 px de ancho en todas las rutas | `scrollWidth ≤ clientWidth` | FR-008, SC-002 |
| E-03 | Objetivos táctiles de todos los controles interactivos | ≥ 44×44 px | FR-009, SC-003 |
| E-04 | Foco visible por teclado en el primer control de cada pantalla del bucle | `outline` perceptible | FR-016 |
| E-05 | Con `prefers-reduced-motion: reduce` emulado, ninguna transición supera 1 ms | sin excepciones | SC-005 |
| E-06 | Las páginas estáticas no ejecutan JS: 0 peticiones de script de aplicación ni `<script>` inline | 0 | FR-015, Principio IV |
| E-07 | Regresión funcional: la suite existente (`landing`, `jugar`, `compartir`, `chrome`) sigue verde | 100 % | FR-015 |
| E-08 | Con el texto al 200 %, ninguna ruta desborda en horizontal; y la prosa no supera 75 `ch` medidos | sin excepciones | FR-005, SC-007 |

## 4. Manual / campo

| ID | Prueba | Criterio |
|---|---|---|
| M-01 | Tarjeta final en 9:16 y 1:1 | se lee entera, con jerarquía clara y sin recortes (SC-008) |
| M-02 | Vista previa del enlace compartido (OG `og`) | misma paleta y tipografía que la web (FR-014) |
| M-03 | Zoom de navegador al 200 % | sin scroll horizontal ni solapamientos (FR-005) — cubierto por E-08 |
| M-04 | Core Web Vitals tras el deploy | sin regresión respecto al baseline previo a la fase (FR-015) |

## 5. Criterios de rechazo

Se rechaza el trabajo si ocurre cualquiera de estos:

1. Aparece un color hex fuera de `src/ui/` (salvo exclusiones declaradas).
2. Se añade una dependencia al `package.json` para esta fase.
3. Alguna página estática ejecuta JavaScript.
4. Se baja un umbral de contraste, tamaño táctil o duración para que un test pase.
5. La imagen OG queda con tipografía o paleta distintas de la web.
6. Se toca `src/engine/**`, `src/content/**`, `content-admin/**` o el almacén de partidas.
