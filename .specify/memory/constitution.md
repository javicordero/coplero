<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0
- Ratification: 2026-09-18
- Last amended: 2026-10-05
- Modified principles: II. Contenido como datos, no código (redefinición de "consumir" una flag:
  pasa de marca global a consumo **por condicional**, automático; se retira el consumo manual)
- Reason: feature 025. El consumo manual (`consume` en la opción, `consumeFlag` en el condicional) se
  retira; al dispararse un condicional se marcan sus flags activas como consumidas por ese condicional,
  sin gastar las flags compartidas. `Flag.consumida` → `Flag.consumidaPor: string[]`; `VERSION_PARTIDA`
  2→3.
- Added sections: None
- Removed sections: None
- Templates reviewed:
  - .specify/templates/plan-template.md    (✅ Constitution Check ya es genérico)
  - .specify/templates/spec-template.md    (✅ sin cambios necesarios)
  - .specify/templates/tasks-template.md   (✅ nota de tests alineada con el Principio III)
  - .specify/templates/commands/*          (N/A: el directorio no existe)
- Follow-up TODOs: None
--
Histórico:
- 1.0.0 (2026-09-18): adopción inicial (principios I–V).
- 1.1.0 (2026-10-05): retirada de `tipo`/`categoría` del Principio II y del flujo de desarrollo.
-->

# Coplero Constitution

Fuente de verdad funcional y técnica: `docs/01`–`docs/06` y `docs/registro/`. Esta constitución
protege decisiones **ya cerradas**; no introduce reglas de producto nuevas.

## Core Principles

### I. Motor independiente y determinista

El `engine` es TypeScript puro, aislado de la presentación y reproducible.

- El `engine` MUST NOT importar de `web`, de `content` ni de ningún framework (Astro, Svelte).
- El `engine` MUST NOT usar APIs de DOM ni de navegador.
- El `engine` MUST NOT usar `Math.random()` ni `Date.now()` ni ninguna fuente implícita de azar o tiempo.
- Todo el azar MUST provenir de un RNG sembrado (seed + año + momento + contador).
- El `engine` MUST exponer un reducer puro (`crearPartida`, `siguientePaso`, `elegir`, `resumen`) sin mutación ni efectos secundarios.
- El estado MUST ser serializable, sin clases, e incluir `version`.
- Una misma seed con las mismas decisiones MUST producir exactamente la misma partida.
- `destino` (techo, suelo, año pico, años de carrera, volatilidad, carisma) MUST permanecer interno: nunca se muestra al jugador ni se serializa en el código compartible.

**Rationale:** el determinismo habilita tests fiables, replays, tarjetas compartibles sin base de datos
y depuración con solo la seed; separar el motor permite cambiar la UI sin reescribir la lógica.

### II. Contenido como datos, no código

El banco de situaciones vive como datos validados, no como lógica.

- `content` MUST NOT contener lógica de juego; son objetos de datos.
- Todo contenido MUST validarse con Zod en build time.
- Toda situación y condicional MUST declarar `momento: verano | febrero`; el motor filtra por ese campo.
- Cada año MUST resolver una decisión de verano y una de febrero, nunca dos del mismo momento.
- Las situaciones MUST poder filtrarse por `modalidades` y `variantes` opcionales; ausencia de esos campos significa que la situación es común.
- Las flags MUST persistir en el historial durante toda la carrera; lo que caduca MUST ser su ventana de disparo, no la flag.
- "Consumir" una flag MUST NOT borrarla: MUST marcarla como consumida **por el condicional que la consume** y desactivar solo su disparo para ese condicional, nunca para otros que compartan la flag. El consumo manual MUST NOT existir: es automático al dispararse un condicional (feature 025).
- Las opciones que implican no concursar MUST marcarse con `saltaCOAC: true`.
- MUST NOT usarse nombres reales de personas o agrupaciones al inspirarse en hechos reales.

**Rationale:** añadir situaciones no debe obligar a tocar código; la separación por momento
mantiene la coherencia narrativa del Carnaval y del COAC.

### III. Verificación determinista y balance por simulación

La corrección se demuestra con tests y el equilibrio con datos, no a ojo.

- Los tests del `engine` MUST ser deterministas: misma seed + mismas decisiones, mismo resultado.
- MUST existir tests de integridad del contenido: ids únicos, toda flag referenciada existe en alguna opción, toda situación tiene `momento` y ninguna situación es inalcanzable.
- MUST existir un snapshot de una partida de referencia.
- El balance MUST validarse con simulación masiva (`scripts/simular.ts`, del orden de 10.000 partidas).
- Los ajustes de dificultad MUST aplicarse sobre los pesos del techo y el ruido; MUST NOT cambiarse las situaciones para cuadrar la distribución.
- `npm run check` MUST pasar antes de dar por válido un cambio de `engine` o `content`.

**Rationale:** sin determinismo no hay balance reproducible; sin simulación masiva el ajuste de
dificultad es a ciegas.

### IV. Rendimiento y mobile-first como requisito de producto

El rendimiento no es un extra: es parte del producto.

- La UI MUST ser mobile-first real; en escritorio MUST mantenerse el mismo layout con ancho máximo (420–480 px).
- La landing, "cómo jugar" y las páginas de resultado MUST servirse como HTML estático con 0 kB de JS.
- El bucle jugable MUST concentrarse en una única isla (Svelte) en `/jugar`.
- La UI MUST NOT contener lógica de juego: envuelve al `engine`.
- El rendimiento MUST medirse con datos de campo (Core Web Vitals), no solo con Lighthouse local.
- Las decisiones MUST viajar en el bundle (no hay carga entre pantallas); MUST precargarse fuentes e imágenes, no decisiones.

**Rationale:** el caso de uso real es un enlace abierto desde WhatsApp en 4G en la calle; cada 100 kB
de más son conversiones perdidas.

### V. Simplicidad arquitectónica y proyecto único

Se elige la solución arquitectónica más simple que cumpla el diseño.

- El proyecto MUST ser único, sin monorepo.
- MUST NOT introducirse complejidad arquitectónica sin una necesidad demostrada (YAGNI).
- `engine` y `content` MUST permanecer dentro de `src/` hasta que exista un segundo consumidor real; extraerlos a paquetes es un refactor posterior, no una decisión previa.
- MUST NOT usarse Angular ni Astro + Angular Elements.
- Cualquier desviación de estas reglas MUST justificarse en la tabla **Complexity Tracking** del plan (`plan-template.md`).

**Rationale:** un solo proyecto y un solo toolchain evitan el impuesto de mantenimiento de un
monorepo y de dos ecosistemas; el aislamiento lógico se logra con carpetas disciplinadas.

## Restricciones técnicas y de producto

- Stack cerrado: Astro + una isla Svelte 5, TypeScript, Zod, Vitest, Playwright, Biome, Node 22+, Netlify.
- Un solo toolchain de calidad: Biome (nunca ESLint + Prettier).
- v1 sin base de datos: el código de partida viaja en la URL (base64url comprimido con `fflate`).
- Persistencia local con `localStorage` y versión de esquema.
- Imagen OG con `satori` + `resvg-js` en endpoint edge (`prerender = false`, adapter `@astrojs/netlify`).
- El techo de carrera es oculto y nunca visible.
- AdSense exige dominio propio y CMP con Consent Mode; la analítica sin cookies es la opción recomendada.
- Saneamiento y moderación de texto libre según `docs/05` §7.
- Las dependencias MUST mantenerse con `npm audit` sin vulnerabilidades; los `overrides` MUST estar justificados.

## Flujo de desarrollo y puertas de calidad

- Ante una duda no resuelta por la documentación, MUST consultarse el registro o preguntar; MUST NOT inventarse reglas.
- Las contradicciones MUST registrarse en `docs/registro/decisiones-pendientes.md`; MUST NOT resolverse en silencio.
- Toda situación nueva MUST archivarse en su momento (`verano`/`febrero`), con `id` único, título y subtítulo, y flags coherentes.
- Los valores numéricos MUST calibrarse con el simulador, nunca a ojo.
- Los commits MUST seguir Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`); MUST NOT commitearse sin petición explícita.
- Antes de commitear MUST revisarse `git status`, `git diff` y el estilo reciente, sin incluir secretos.
- `npm run check` MUST pasar antes de considerar terminada una tarea de `engine` o `content`.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica o preferencia. Si entra en conflicto con `AGENTS.md` o la documentación, prevalece la constitución y el artefacto en conflicto MUST actualizarse.
- Las enmiendas MUST documentarse: cambio en esta constitución, actualización del documento fuente en `docs/` y registro en `docs/registro/`.
- Versionado semántico:
  - **MAJOR**: eliminación o redefinición incompatible de un principio.
  - **MINOR**: nuevo principio o sección, o expansión material de uno existente.
  - **PATCH**: aclaraciones, redacción o correcciones no semánticas.
- Toda revisión de plan o PR MUST verificar el cumplimiento de estos principios; cualquier violación MUST justificarse en la tabla **Complexity Tracking** de `.specify/templates/plan-template.md`.
- La guía de desarrollo en tiempo de ejecución vive en `AGENTS.md` y `docs/`; esta constitución no la duplica.

**Version**: 1.2.0 | **Ratified**: 2026-09-18 | **Last Amended**: 2026-10-05
