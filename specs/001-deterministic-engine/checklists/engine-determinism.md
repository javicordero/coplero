# Requirements Quality Checklist: ENGINE-001 — Determinismo y arquitectura del motor

**Purpose**: Validar la CALIDAD DE LOS REQUISITOS (no la implementación) en las áreas críticas
solicitadas: determinismo, separación engine/UI, serialización, reproducibilidad, RNG, dependencias,
testabilidad, compatibilidad con simulación masiva y ausencia de reglas de negocio en Svelte/Astro.

**Created**: 2026-09-18

**Feature**: [spec.md](../spec.md) · Plan: [plan.md](../plan.md) · Investigación: [research.md](../research.md) · Modelo: [data-model.md](../data-model.md) · Contrato: [contracts/engine-api.md](../contracts/engine-api.md)

**Nota**: Cada ítem es una "prueba unitaria del inglés de los requisitos": comprueba si lo escrito es
completo, claro, consistente y medible. No verifica comportamiento del sistema.

## Determinismo y reproducibilidad

- [x] CHK001 ¿Están enumerados y completos los inputs que determinan una partida (semilla, personaje, modalidad, variante y decisiones)? [Completeness, Spec §FR-001, Spec §FR-004]
- [x] CHK002 ¿Se especifica "misma semilla + mismas decisiones → mismo estado" como invariante que cubre creación y carrera completa? [Clarity, Spec §FR-004, Spec §SC-001]
- [x] CHK003 ¿Se delimita el alcance del determinismo (mismo proceso, distinto proceso, distinto sistema operativo y momento temporal)? [Clarity, Gap]
- [x] CHK004 ¿Se define el comportamiento esperado al reutilizar una semilla con un banco de contenido distinto? [Edge Case, Gap, research D5]
- [x] CHK005 ¿Existe un requisito explícito que prohíbe el azar y el tiempo implícitos en el motor? [Completeness, Spec §FR-014]
- [x] CHK006 ¿Se especifica que el resumen compartible es reproducible sin el destino oculto? [Coverage, Spec §US4, Spec §FR-013]

## Separación engine/UI y ausencia de lógica en Svelte/Astro

- [x] CHK007 ¿La independencia del motor respecto a UI/DOM/frameworks está expresada como restricción verificable? [Clarity, Spec §FR-014]
- [x] CHK008 ¿Se documentan las direcciones de dependencia permitidas entre `engine`, `content` y `web`? [Completeness, Spec §Assumptions, Plan §Constitution Check]
- [x] CHK009 ¿Existe un requisito que prohíbe explícitamente alojar reglas de negocio en Svelte o Astro? [Gap, Consistency]
- [x] CHK010 ¿Está definido el límite de lo que la UI puede hacer con las salidas del motor (envolver, no contener)? [Clarity, Gap]
- [x] CHK011 ¿Están especificados los inputs y outputs observables del motor de modo que la UI solo lo envuelva? [Consistency, contracts/engine-api]
- [x] CHK012 ¿Se exige que el motor no importe `content` y que el banco se inyecte como parámetro? [Consistency, Spec §FR-022, research D3]

## RNG (generador de azar)

- [x] CHK013 ¿Está especificado o acotado el algoritmo/clase de PRNG a usar? [Completeness, research D1]
- [x] CHK014 ¿Se define la derivación del azar por contexto (semilla + año + momento + contador)? [Clarity, research D2]
- [x] CHK015 ¿Se especifica la independencia entre flujos de azar para evitar resultados dependientes del orden de llamadas? [Clarity, research D2]
- [x] CHK016 ¿Se define la estabilidad del RNG ante cambios de contenido o de orden de ejecución? [Edge Case, Gap, research D2]
- [x] CHK017 ¿Está cuantificado el rango/la distribución esperada de los valores del RNG? [Measurability, research D1]
- [x] CHK018 ¿Se prohíbe instanciar fuentes de azar globales o independientes de la semilla? [Consistency, Spec §FR-014]

## Serialización

- [x] CHK019 ¿Están enumerados los campos del estado serializable, incluida la versión de esquema? [Completeness, Spec §FR-003, data-model]
- [x] CHK020 ¿Está especificado el comportamiento ante versión incompatible y de quién es la responsabilidad de migrar/descartar? [Clarity, Spec §FR-003, Spec §Clarifications Q3]
- [x] CHK021 ¿La pérdida cero en el ciclo guardar/recuperar está formulada como criterio medible? [Measurability, Spec §SC-002]
- [x] CHK022 ¿Se especifica que el banco de contenido y el destino oculto quedan fuera de la serialización? [Consistency, Spec §FR-022, Spec §US4]
- [x] CHK023 ¿Está definido o acotado el formato/codificación de serialización (JSON, compresión, base64url)? [Clarity, Gap, research D8]
- [x] CHK024 ¿Se cubren los requisitos de serializar partidas en curso entre versiones de esquema? [Coverage, Spec §FR-003]

## Dependencias

- [x] CHK025 ¿Se limita explícitamente el motor a cero dependencias de runtime (o a una lista permitida)? [Completeness, Spec §FR-014, research D8]
- [x] CHK026 ¿Está recogida la prohibición de `Math.random`, `Date.now` y APIs de plataforma como restricción de dependencias? [Completeness, Spec §FR-014]
- [x] CHK027 ¿Están documentadas las fronteras de librerías externas (Zod en `content`, `fflate` fuera de alcance)? [Consistency, research D8]
- [x] CHK028 ¿Existe una política documentada para justificar la introducción de nuevas dependencias? [Gap, Plan §Constitution Check G9]

## Testabilidad

- [x] CHK029 ¿Están especificadas las categorías de test obligatorias (determinismo, integridad de contenido, snapshot, lote)? [Completeness, Plan §Constitution Check G7, Spec §SC-004]
- [x] CHK030 ¿Se define cómo los tests inyectan un banco de contenido propio, independiente del de producción? [Clarity, Spec §FR-022, research D3]
- [x] CHK031 ¿Los criterios de aceptación de determinismo, serialización y selección son objetivamente medibles? [Measurability, Spec §SC-001, Spec §SC-002, Spec §SC-006]
- [x] CHK032 ¿Se especifica el entorno de ejecución esperado de los tests (Node, sin UI)? [Clarity, Spec §Contexto]
- [x] CHK033 ¿Está definido qué captura exactamente el snapshot de partida de referencia? [Clarity, Gap, Spec §Plan T032]

## Compatibilidad con simulación masiva

- [x] CHK034 ¿La ejecución de carreras completas por lotes está especificada como requisito de primer nivel? [Completeness, Spec §US5]
- [x] CHK035 ¿Está cuantificado el tamaño del lote y/o el umbral de rendimiento de la simulación? [Measurability, Spec §SC-004, research D11]
- [x] CHK036 ¿Se definen las salidas agregadas esperadas de la simulación (distribución de fases, condicionales nunca disparadas, atributos desbocados)? [Completeness, docs/02 §11]
- [x] CHK037 ¿Se especifica que los "jugadores" simulados son deterministas y reproducibles? [Clarity, Spec §US5]
- [x] CHK038 ¿Se exige que la simulación no dependa de UI ni de red? [Consistency, Spec §US5, research D11]

## Casos límite y manejo de fallos

- [x] CHK039 ¿Están definidos los requisitos de agotamiento de contenido y la degradación antes de fallar? [Edge Case, Spec §FR-018]
- [x] CHK040 ¿Está especificado el comportamiento ante un identificador de opción inválido? [Edge Case, Spec §FR-015, Spec §Edge Cases]
- [x] CHK041 ¿Están definidos los requisitos de una temporada sin concurso respecto a fase, premios e historial? [Coverage, Spec §FR-017]
- [x] CHK042 ¿Se abordan los escenarios de fuga del destino oculto en todas las salidas del motor? [Coverage, Spec §FR-002, Spec §US4]

## Ambigüedades, conflictos y trazabilidad

- [x] CHK043 ¿Es inequívoca la asignación de tipo (contenido/personaje) a verano/febrero? [Ambiguity, research D5, Spec §Assumptions]
- [x] CHK044 ¿Están definitivamente acotados los años de carrera y las decisiones por año (fijos vs parametrizables)? [Clarity, Spec §FR-016, Spec §FR-020]
- [x] CHK045 ¿Están especificados el rango de atributos y la regla de acotado (clamp)? [Clarity, Spec §FR-008]
- [x] CHK046 ¿Es inequívoco el método de cálculo del `puesto` y su relación con los umbrales de premios? [Clarity, Spec §FR-012, research D6]
- [x] CHK047 ¿Es inequívoca la exposición del resultado respecto a la decisión de febrero? [Clarity, Spec §FR-024, Spec §Clarifications Q5]
- [x] CHK048 ¿Están plenamente especificados o parametrizados los umbrales de elegibilidad de los premios ajenos? [Clarity, Spec §FR-011, Spec §FR-021]
- [x] CHK049 ¿Existe un esquema de identificadores para requisitos y criterios de aceptación que permita trazabilidad? [Traceability, Spec §Requirements]
- [x] CHK050 ¿Se ha verificado la consistencia entre el contrato de API y los requisitos funcionales (nombres, errores, retornos)? [Consistency, contracts/engine-api, Spec §FR-003, Spec §FR-015]

## Notas

- Marcar los ítems completados: `[x]`.
- Un ítem marcado como `[Gap]`, `[Ambiguity]` o `[Conflict]` indica que el requisito debe aclararse
  antes de implementar; no es un fallo del código.
- Referencias: `Spec §FR-*` / `Spec §SC-*` / `Spec §US*` (requisitos), `research D#` (decisiones),
  `data-model` y `contracts/engine-api`.

## Resolución de ítems (2026-09-18)

Resueltos y reflejados en los documentos:

- [x] CHK003 — `FR-004` y `research D13`: alcance del determinismo (independiente de proceso, SO y momento).
- [x] CHK009 — `FR-025`: prohibición explícita de reglas de negocio en Astro/Svelte.
- [x] CHK016 — `FR-026` y `research D2`/`D13`: azar contextual, independiente del orden de llamadas.
- [x] CHK017 — `FR-026`: rango `[0, 1)`.
- [x] CHK022 — `FR-003`/`FR-022`: banco fuera del estado; serialización completa incluye destino interno.
- [x] CHK023 — `FR-027` y `research D8`: JSON plano con `version`.
- [x] CHK024 — `FR-003`: versiones de esquema incompatibles devuelven error.
- [x] CHK031 — Criterios medibles (`SC-001`, `SC-002`, `SC-006`).
- [x] CHK033 — `research D14`: alcance del snapshot de referencia.
- [x] CHK039 — `FR-018`: degradación B→D y error si persiste.
- [x] CHK040 — `FR-015`/Edge Cases: opción inválida → error.
- [x] CHK041 — `FR-017`: temporada sin concurso.
- [x] CHK042 — `FR-002`/`US4`: destino no aparece en salidas públicas.
- [x] CHK043 — `research D5` adoptada como definitiva.
- [x] CHK044 — `FR-016`/`FR-020`: duración y decisiones parametrizables.
- [x] CHK045 — `FR-008`: rango y clamp.
- [x] CHK046 — `FR-012`/`research D6`: bandas y posición.
- [x] CHK047 — `FR-024`/Q5: exposición del resultado.
- [x] CHK048 — `FR-011`/`FR-021`: premios parametrizados.
- [x] CHK049 — Esquema de ids `FR-###`/`SC-###`/`US#`/`CHK###`.
- [x] CHK050 — Contrato y requisitos consistentes; tipos referenciados en `data-model.md`.

Cuarta pasada (2026-09-18): marcados como cubiertos el resto de ítems por el spec, plan, tasks, data-model y contrato. **Estado: 50/50.**

Simulación masiva (CHK034–CHK038): requisito cubierto; presupuesto de 30 s provisional, sin calibración fina en esta fase.
