# Contrato de observabilidad y arnés E2E

**Feature**: 014-e2e-golden-path

Lo que la prueba E2E-001 puede dar por garantizado de la aplicación y lo que el arnés le ofrece. Si
alguno de estos anclajes cambia, la prueba debe actualizarse: es su interfaz de observación.

## 1 · Arnés (Playwright)

| Elemento | Valor | Notas |
|---|---|---|
| Directorio de tests | `tests/e2e` | `testDir` actual de `playwright.config.ts` |
| Servidor | `npm run dev`, puerto `4321` | `webServer` ya configurado; `reuseExistingServer` fuera de CI |
| Timeout por prueba | 30 s por defecto; E2E-001 declara `90_000` | objetivo real < 60 s (SC-004) |
| Navegador | Chromium headless | `headless: true` |
| Reintentos | 1 | config actual |
| Contexto limpio | `localStorage` es por origen | para el hito 10 se limpia antes de abrir el enlace |

**Permisos**: el spec MUST declarar `test.use({ permissions: ["clipboard-read", "clipboard-write"] })`
para poder leer el enlace copiado (igual que `compartir.spec.ts`).

**Prohibido en la prueba**: `waitForTimeout` y cualquier espera fija; toda espera MUST ser por estado
observable (`waitForSelector`/`waitForFunction` sobre `[data-pantalla]`).

## 2 · Anclajes de pantalla

`<main data-testid="juego">` (isla `Juego.svelte`) expone:

- `data-pantalla`: `intro | crear-personaje | modalidad | variante | cambio-variante | decision |
  resultado | fin | error`.
- `data-momento`: `verano | febrero | ""`.
- `data-ano`: entero o `""`.

La **clave de pantalla** es la concatenación `pantalla|momento|ano`.

## 3 · Anclajes por paso

| Hito | Anclaje | Garantía |
|---|---|---|
| 1 | `[data-testid="empezar"]` | hay intro y botón de empezar cuando no hay partida |
| 2 | `[data-testid="crear-personaje"]`, `[data-testid="crear"]`, `getByLabel("Nombre o apodo")` | crear personaje valida el nombre y avanza |
| 3 | `[data-testid="modalidad"] button` | hay al menos una modalidad |
| 4 | `[data-testid="variante"] button` | hay al menos una variante |
| 5 | `[data-testid="decision"] button`, `[data-testid="indicador"][data-tipo]` | cada decisión expone opciones y su tipo |
| 6 | `[data-pantalla]`, `[data-testid="continuar-ano"]` | el bucle siempre progresa a un estado nuevo |
| 7 | `[data-testid="fin"]`, `[data-testid="tarjeta"]`, `[data-testid="tarjeta-nombre"]` | el fin del bucle renderiza la tarjeta con el nombre |
| 8 | `[data-testid="continuar"]` tras recargar | con partida en curso, la intro ofrece continuar |
| 9 | `[data-testid="copiar-enlace"]` | en el fin se puede copiar el enlace |
| 10 | `[data-testid="tarjeta"]`, `[data-testid="tarjeta-nombre"]` en `/r/<codigo>` | el enlace reproduce la tarjeta |

### Anclaje nuevo

- `IndicadorContexto.svelte` MUST exponer `data-tipo` con el valor de la decisión
  (`contenido | personaje`) cuando está presente. Es el único añadido requerido por la prueba; no
  cambia el texto ni el comportamiento visible.

## 4 · Forma del enlace

- El botón `copiar-enlace` copia una URL absoluta que MUST contener `/r/<codigo>`.
- `codigo` procede de `codificar(tarjeta)` en el engine (base64url comprimido con `fflate`); la prueba
  MUST NOT construir el código a mano ni parsearlo.
- Ruta de reproducción: `/r/[codigo]` (SSR, `prerender = false`), que renderiza `Tarjeta.svelte`.

## 5 · Qué NO es contrato

- Posiciones, fases, premios, número de años y frase de cierre: **varían con la semilla** y la prueba
  no puede asercionarlos.
- El texto exacto de los títulos/subtítulos de opciones (contenido editable).
- El formato interno de `localStorage` (solo importa su efecto observable: el botón `continuar`).
