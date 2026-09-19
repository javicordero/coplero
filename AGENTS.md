# Coplero — Guía para agentes

Índice operativo y reglas para trabajar en el repositorio. **La documentación completa vive en `docs/`**; este archivo no la duplica.

- Fuente de verdad funcional y técnica: `docs/01`–`docs/06`.
- Decisiones ya cerradas: `docs/registro/decisiones-cerradas.md`.
- Pendientes, contradicciones (C*) y huecos (T*): `docs/registro/decisiones-pendientes.md`.

> Regla de oro: ante una duda que los documentos no resuelvan, **no inventar**. Consultar el registro de pendientes o preguntar.

---

## 1. Propósito de Coplero

Juego web narrativo sobre el **Carnaval de Cádiz**. El jugador crea un personaje, elige modalidad (comparsista o chirigotero) y construye su carrera en el **COAC** (Concurso Oficial de Agrupaciones Carnavalescas) a base de decisiones de verano y febrero. El objetivo no es ganar, sino construir una historia propia; la partida acaba en una tarjeta compartible. El techo de la carrera es aleatorio y permanece **oculto** siempre.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro |
| Isla interactiva | Svelte 5 |
| Validación de contenido | Zod |
| Tests unitarios | Vitest |
| Tests E2E | Playwright |
| Lint / format | Biome |
| Runtime | Node 22+ |
| Deploy | Netlify |

## 3. Arquitectura

```
engine  → TypeScript puro. Lógica de juego, RNG con semilla, estados, transiciones.
content → Datos de juego (situaciones, condicionales, textos). Sin lógica. Validado con Zod.
web     → Astro + isla Svelte. Presentación, rutas y endpoints edge.
```

Reglas de dependencia (nunca se rompen):

- `engine` **no importa** de `web` ni de `content`.
- `content` **no importa** de `engine` ni de `web`.
- `web` puede importar de `engine` y `content`.
- Proyecto **único**, sin monorepo.

## 4. Reglas inmutables del engine

1. **TypeScript puro.** Sin DOM, sin framework, sin Astro/Svelte.
2. **Prohibido el azar y el tiempo implícitos:** nada de `Math.random()` ni `Date.now()`. Todo el azar sale de un RNG sembrado (seed + año + momento + contador).
3. **Reducer puro.** API pública: `crearPartida`, `siguientePaso`, `elegir`, `resumen`. Sin mutación ni efectos secundarios.
4. **Estado serializable**, sin clases. `Partida` incluye `version`.
5. **Determinismo total:** misma seed + mismas decisiones → misma partida.
6. **El techo (`destino`) es interno:** no se muestra al jugador ni se serializa en el código compartible.

## 5. Reglas del content

1. **Son datos, no código.** Añadir situaciones no debe requerir tocar el engine.
2. Se escriben como `.ts` en `src/content/` y se validan con **Zod** en build time.
3. Toda situación y condicional lleva `momento: verano | febrero` **obligatorio**.
4. Cada año sale **una decisión de contenido + una de personaje** (nunca dos del mismo tipo).
5. Cada opción tiene **título + subtítulo**, efectos sobre atributos y la flag que deja.
6. Filtros opcionales: `modalidades` y `variantes` (si no existen, la situación es común).
7. Las flags **no se borran nunca**; lo que caduca es su ventana de disparo. "Consumir" una flag no la borra: la marca como consumida y desactiva su disparo.
8. No usar nombres reales de personas ni agrupaciones al inspirarse en hechos reales.
9. Categorías: contenido (`letra`, `musica`, `puestaEnEscena`) y personaje (`jurado`, `dinero`, `grupo`, `prensa`, `carrera`, `concurso`).
10. Las opciones que implican no concursar se marcan con `saltaCOAC: true`.

## 6. Reglas de la UI

1. **Una sola isla** (Svelte) en `/jugar`. El resto de páginas son HTML estático con 0 kB de JS.
2. **Mobile-first real**; en escritorio, mismo layout con ancho máximo (420-480 px).
3. La UI **no contiene lógica de juego**: envuelve al engine.
4. Indicador de contexto permanente: año, momento y tipo.
5. No implementar features de fases no acordadas (ver `docs/05` §9).

## 7. Estructura de carpetas

Objetivo según `docs/02` §6 (adaptado al repo `coplero/`):

```
src/
├── engine/            # TS puro
│   ├── index.ts       # API pública
│   ├── types.ts       # personaje, atributos, decision, partida, coac
│   ├── seed.ts        # PRNG con semilla
│   ├── partida.ts     # reducer puro
│   ├── destino.ts     # techo oculto
│   ├── selector.ts    # elección de situación
│   ├── condicionales.ts
│   ├── atributos.ts
│   ├── coac.ts
│   ├── premios.ts
│   ├── narrativa.ts
│   ├── resumen.ts
│   ├── codec.ts
│   └── __tests__/
├── content/
│   ├── schema.ts      # Zod
│   ├── modalidades.ts
│   ├── decisiones/{verano,febrero}/{contenido,personaje}.ts
│   ├── condicionales/{verano,febrero}.ts
│   ├── textos/{fases,premios,epilogos}.ts
│   ├── nombres.ts
│   └── __tests__/integridad.test.ts
├── juego/             # isla Svelte: pantallas y componentes
├── ui/                # (fase 2) tokens
├── layouts/           # Base.astro, Compartir.astro
├── pages/             # index, como-jugar, jugar, r/[codigo], api/og/[codigo].png.ts
├── componentes/       # .astro estáticos
└── styles/
public/fonts/          # fuentes para la imagen OG
scripts/simular.ts     # balance masivo
docs/                  # documentación (fuente de verdad)
```

Estado del scaffold actual y desviaciones de nombres: ver huecos **C10**, **C11** y **T8**–**T12** en `docs/registro/decisiones-pendientes.md`.

## 8. Modelo conceptual del juego

- **Personaje:** nombre/apodo, edad, localidad, género. Título dinámico según género.
- **Modalidad y variante:** 2 modalidades × 3 variantes. La variante puede cambiar durante la carrera.
- **COAC:** 4 fases por modalidad (preliminares → cuartos → semifinales → final).
- **Premios ajenos:** Copla para Andalucía, Aguja de oro, Candela y espino.
- **Decisiones:** 2 por año (verano del año anterior + febrero del año del carnaval), 2-3 opciones.
- **Atributos:** artísticos (`letra`, `musica`, `puestaEnEscena`) y de personaje (`popularidad`, `cohesion`, `dinero`).
- **Flags y condicionales:** requisito + ventana + probabilidad.
- **Destino:** techo, suelo, año pico, años de carrera, volatilidad, carisma (secreto).

Detalle en `docs/01-diseno-juego.md` y `docs/02-arquitectura-tecnica.md` §7–§8.

## 9. Comandos principales

```bash
npm run dev          # Desarrollo local (Astro)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run check        # Typecheck + lint + format + tests
npm run lint         # Biome lint
npm run format       # Biome format
npm run test         # Vitest
npm run test:watch   # Vitest en watch
npm run test:e2e     # Playwright (cuando existan tests)
```

Planificado (documentado, no implementado): `npm run simular`.

## 10. Estrategia de testing

- Tests del engine en `src/engine/__tests__/`.
- Tests de integridad del content en `src/content/__tests__/`.
- Un fichero por módulo.
- Tests que importan:
  1. **Determinismo** — misma seed + decisiones → misma partida.
  2. **Integridad de contenido** — ids únicos, flags referenciadas existen, toda situación tiene `momento`, nada inalcanzable.
  3. **Snapshot** de una partida de referencia.
- E2E con Playwright en `tests/e2e/`.

## 11. Estrategia de simulación

`scripts/simular.ts` (documentado en `docs/02` §11) lanza **10.000 partidas** con jugadores aleatorios y reporta: distribución de fases, frecuencia de cada situación, condicionales que nunca se disparan y atributos desbocados. Es la herramienta de balance: si la distribución real no cuadra con la objetivo (`docs/01` §7), se ajustan los pesos del techo y el ruido, **nunca las situaciones**.

## 12. Reglas para trabajar con contenido

1. Antes de añadir una situación, consultar `docs/03` y `docs/04` (el banco actual) y el estado del backlog.
2. Cada situación nueva se archiva en el fichero de su **momento**, **tipo** y **categoría**.
3. Garantizar: `id` único, `momento`, `tipo`, `categoría`, opciones con título y subtítulo, flags coherentes.
4. Toda flag que se consuma en un requisito debe existir en alguna opción.
5. No cambiar valores numéricos "a ojo": se calibran con el simulador.
6. No resolver contradicciones del banco en silencio: registrarlas.

## 13. Reglas de Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- **No commitear sin petición explícita.**
- Antes de commitear: revisar `git status`, `git diff` y el estilo de commits reciente; no incluir secretos.
- No reescribir historia ni hacer force-push salvo petición explícita.

## 14. Decisiones técnicas ya cerradas

Resumen operativo (detalle en `docs/registro/decisiones-cerradas.md`):

- Astro solo; nunca Angular ni Astro + Angular Elements. Isla en **Svelte**.
- Proyecto único, sin monorepo.
- `engine` TS puro; `content` datos; `web` presentación.
- Partida determinista por seed.
- Duración **fija** de carrera (número aún por determinar); decisiones por año **parametrizables**.
- Techo oculto, nunca mostrado. El batacazo puede atravesar el `suelo`.
- Código de partida en URL (base64url comprimido con `fflate`), sin BD en v1.
- `localStorage` con versión de esquema.
- Imagen OG con `satori` + `resvg-js` en endpoint edge; adapter `@astrojs/netlify` configurado.
- Deploy en Netlify; AdSense requiere dominio propio y CMP.
- Buy Me a Coffee reutiliza la cuenta de acordesgaditanos.
- Analítica sin cookies recomendada.
- Saneamiento y moderación de texto libre definidos (`docs/05` §7).

## 15. Decisiones pendientes

**No resolverlas en silencio.** Ver `docs/registro/decisiones-pendientes.md`. Estado actual:

- **Abiertos:** ninguno.
- **Diferidos:** T2 (flags de Copla para Andalucía), T5 (eventos), T12 (CI), T13 (valores numéricos).
- **Fuera de alcance:** T16 (fallback de Web Share API).
- **Ya cerrados:** C1–C11 y T1, T3, T4, T6, T7, T8, T9, T10, T11, T14, T15 (ver `decisiones-cerradas.md`).
- **Backlog de contenido:** ampliar banco a 60-80, cierres de popurrí, textos de fase, tarjeta final, logros.

## 16. Skills disponibles

Las skills viven en `.agents/skills/`. Usar la skill adecuada antes de tocar la tecnología correspondiente:

| Skill | Cuándo usarla |
|---|---|
| `astro` | Crear/editar páginas, layouts, rutas, content collections, deploy estático |
| `svelte5-best-practices` | Escribir o revisar componentes Svelte 5 (runes, snippets, SvelteKit) |
| `svelte-code-writer` | Documentación y análisis de Svelte 5 antes de crear/editar `.svelte` |
| `typescript-advanced-types` | Tipos avanzados, utilidades, genéricos en el engine |
| `zod` | Schemas de validación del content (`z.object`, `safeParse`, `z.infer`) |
| `vitest` | Tests unitarios del engine y del content |
| `playwright-best-practices` | Tests E2E cuando llegue la fase |
| `nodejs-backend-patterns` | Servicios Node, si aparecen |
| `nodejs-best-practices` | Decisiones de arquitectura Node |
| `frontend-design` | Diseño de UI distintiva y de calidad |
| `accessibility` | Auditoría WCAG y accesibilidad |
| `seo` | Meta tags, structured data, sitemap |
| `speckit-agent-context-update` | Actualizar la sección gestionada por Spec Kit en este archivo |

Notas: Biome no lintea `.svelte` (excluidos) y relaja `noUnused*` en `.astro` por falsos positivos con la sintaxis de plantilla.

<!-- SPECKIT START -->
Plan de implementación activo: `specs/003-content-bank/plan.md`
Spec: `specs/003-content-bank/spec.md`
Investigación: `specs/003-content-bank/research.md`
Modelo de datos: `specs/003-content-bank/data-model.md`
Contratos: `specs/003-content-bank/contracts/contenido.md`, `specs/003-content-bank/contracts/integridad.md`, `specs/003-content-bank/contracts/simulador.md`
Validación: `specs/003-content-bank/quickstart.md`
<!-- SPECKIT END -->
