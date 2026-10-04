# Contrato — Sistema de diseño

**Feature**: 012-visual-design | **Fecha**: 2026-09-21

Este contrato es la interfaz estable entre el sistema de diseño y el resto del código. Los **nombres de token son normativos**: cualquier componente que los use debe ceñirse a esta tabla. Ampliarla es una decisión de diseño, no un detalle de implementación.

## 1. Superficie pública

```text
src/ui/tokens.css   → custom properties en :root (fuente canónica del navegador)
src/ui/base.css     → reset, base tipográfica, utilidades, reduced-motion
src/ui/tokens.ts    → espejo TS de la paleta, las familias y los anchos
src/ui/contraste.ts → ratio WCAG y luminancia (funciones puras)
```

Reglas de importación:

- `Layout.astro` MUST importar `tokens.css` y `base.css` una sola vez; ninguna página los reimporta.
- `src/engine/**` y `src/content/**` MUST NOT importar nada de `src/ui/` (Principio I y II).
- `src/panel-ui/**` MUST NOT importar nada de `src/ui/` y queda excluido del test anti-hardcode (R11).
- La isla Svelte consume los tokens por herencia CSS; MUST NOT duplicar su valor en TS.

## 2. Contrato de color

| Token | Valor | Rol | Umbral mínimo |
|---|---|---|---|
| `--c-fondo` | `#0a0a0a` | plano base | fondo |
| `--c-superficie` | `#141414` | tarjetas y opciones | fondo |
| `--c-superficie-alta` | `#1d1d1d` | hover/elevación | fondo |
| `--c-separador` | `#262b33` | filetes decorativos entre secciones | **exento** (WCAG 1.4.11 no cubre elementos decorativos) |
| `--c-borde-control` | `#6b6b6b` | contorno de controles interactivos | 3:1 sobre `--c-fondo`, `--c-superficie` y `--c-superficie-alta` |
| `--c-texto` | `#ededed` | texto principal | 7:1 |
| `--c-texto-suave` | `#b3bdca` | texto secundario | 4.5:1 |
| `--c-acento` | `#f6ad55` | marca · CTA · verano | 4.5:1 |
| `--c-acento-fuerte` | `#ffc477` | hover del acento | 4.5:1 para `--c-sobre-acento` |
| `--c-acento-2` | `#7fd1c1` | febrero · selección · éxito | 4.5:1 |
| `--c-sobre-acento` | `#1a1206` | texto sobre acento | 4.5:1 sobre `--c-acento` |
| `--c-error` | `#fc8181` | error | 4.5:1 |

**Prohibido**: literales hex en cualquier componente fuera de `src/ui/**`; el color como único canal de información; reutilizar un token para un rol distinto del declarado.

> **Nota de implementación (2026-09-21)**: el contrato inicial daba 3:1 a un único token de borde. Al medirlo, los valores elegidos no lo cumplían y la corrección correcta no era bajar el umbral sino **separar dos roles que WCAG trata distinto**: 1.4.11 exige 3:1 a los **componentes de interfaz** (contorno de controles), no a los **filetes decorativos**. De ahí `--c-separador` (exento) y `--c-borde-control` (`#6b6b6b`, ≥ 3.16:1 en las tres superficies). La verificación V-01 se ajusta en consecuencia; ningún umbral se relajó.

## 3. Contrato tipográfico

| Token | Valor |
|---|---|
| `--fuente-display` | `"Anton", var(--fuente-reserva)` |
| `--fuente-texto` | `"Atkinson Hyperlegible", var(--fuente-reserva)` |
| `--fuente-reserva` | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| `--texto-base` | `1rem` (suelo del cuerpo) |
| `--medida` | `65ch` |

**Prohibido**: usar la display en párrafos de prosa; bajar del tamaño base en el cuerpo; introducir una tercera familia sin actualizar este contrato.

## 4. Contrato de movimiento

| Token | Valor |
|---|---|
| `--dur-1` / `--dur-2` / `--dur-3` | `120ms` / `200ms` / `280ms` |
| `--ease-sal` | `cubic-bezier(.2,.7,.3,1)` |
| `--ease-ent` | `cubic-bezier(.4,0,.8,.3)` |

**Prohibido**: animar propiedades de layout; superar los 300 ms que fija `docs/05` §1; dejar animaciones activas bajo `prefers-reduced-motion: reduce`.

## 5. Contrato de estados

- **Controles** (botones, opciones, campos, enlaces de acción): `reposo`, `hover`, `active`, `focus-visible`, `disabled`, `seleccionado`.
- **Pantallas con datos**: `carga`, `vacio`, `error`, `exito`, siempre con texto.
- El foco MUST ser perceptible con ≥ 3:1 y no se elimina nunca (`outline: none` está prohibido sin sustituto visible).
- Los mensajes de resultado de acciones (compartir, copiar, descargar) MUST anunciarse en una región `aria-live` (ya existe en `FinCarrera.svelte`: se conserva).

## 6. Contrato del elemento firma

| Propiedad | Valor |
|---|---|
| Nombre | Regla de compás |
| Implementación | CSS o SVG inline; sin fichero ni JS |
| Accesibilidad | decorativo, `aria-hidden="true"` |
| Ubicaciones | bajo la marca en cabecera, separador de secciones de portada, pie de la tarjeta |
| Información | ninguna (puede desaparecer sin pérdida) |

## 7. Contrato de superficies

| Superficie | Presupuesto de JS | Fuentes precargadas | Radio de acción del sistema |
|---|---|---|---|
| Estáticas (`/`, `/como-jugar`, legales, `/r/[codigo]`) | **0 kB** | display `latin` | todos los tokens |
| Isla (`/jugar`) | sin nuevas dependencias | display `latin` | todos los tokens |
| OG (`api/og/[codigo].png`) | servidor | TTF de marca | paleta, familias y composición (espejo del palmarés) vía `tokens.ts` |
| Panel (`src/panel-ui/**`) | fuera | fuera | **excluido** |
