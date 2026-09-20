# Research — Decisiones que no afectan al resultado (feature 008)

Fase 0. Resuelve las incógnitas del *Technical Context* y fija las decisiones de diseño antes de modelar.

## R1 · Cómo se marca una excepción en el contenido

**Decision**: añadir un campo booleano opcional a la opción de contenido: `excepcion?: boolean`. Una opción **solo** puede llevar `efectos` si `excepcion === true`; `excepcion: true` sin `efectos` es un error. El motor ignora `excepcion` (solo consume `efectos`).

**Rationale**: es explícito y verificable ("0 efectos implícitos", FR-012/FR-014). Mantiene el motor intacto y la regla en el esquema Zod del contenido (Principio II).

**Alternatives considered**: deducir la excepción de la mera presencia de `efectos` (rechazado: entonces todo efecto es "declarado" y no se puede auditar el recuento ni distinguir un efecto heredado); campo por situación en vez de por opción (rechazado: el efecto es de la opción).

## R2 · ¿Se toca el motor?

**Decision**: **No**. Se conserva `resolverCoac` tal cual (atributos → puntuación → `clamp(nivel, suelo, techo)`), y `aplicarEfectos`/`atributos.ts` sin cambios.

**Rationale**: con los atributos en su valor estándar (`atributosIniciales`) y sin efectos en la mayoría de opciones, la puntuación base es constante y el desenlace lo fijan `destino` + ruido + bono de año pico + carisma: justo el resultado deseado. Cambiar la fórmula no aporta y rompe "no modificar tanto" y el Principio V.

**Alternatives considered**: sacar los atributos de la fórmula (rechazado: más cambio y recalibración total sin ganancia); motor nuevo de "modificadores de resultado" (rechazado: lo pide la spec fuera de alcance; el 60/40 y el diferido quedan fuera).

## R3 · Cómo ve el jugador el intercambio

**Decision**: el intercambio de una excepción se comunica en el **texto de la opción** (título/subtítulo), redactado por contenido. No se añade UI nueva.

**Rationale**: FR-007 exige que el efecto sea visible y comprensible; el subtítulo ya es el canal natural y evita tocar la isla (Principio IV: la UI no contiene lógica de juego).

**Alternatives considered**: mostrar los efectos numéricos en la UI (rechazado de momento: cambia UI y revela mecánica; reevaluable más adelante).

## R4 · Qué se conserva del banco actual

**Decision**: revisar las 27 situaciones + 15 condicionales y **retirar `efectos`** de todas las opciones salvo un puñado declaradas como excepción (orden de **3–6 opciones** en todo el banco). El resto queda como narrativa pura.

**Rationale**: FR-013 y tu decisión ("muy pocas decisiones de estas; lo importante es la historia"). El recuento se vigila con un umbral en los tests/informe.

**Alternatives considered**: retirar todos los efectos (rechazado: perdería los momentos puntuales que quieres conservar); mantener los actuales (contradice el objetivo).

## R5 · Cómo se valida "sin estrategia dominante"

**Decision**: usar los perfiles de simulación existentes (`aleatorio`, `codicioso`, `erratico`) y añadir un test que compruebe que la tasa de "pisa la final" de cada perfil queda dentro de un **margen** del resto (el perfil `codicioso` no gana por elegir "mejor"). Se conserva además la comprobación de la distribución objetivo (`docs/01` §7).

**Rationale**: es la prueba directa de SC-001 sin inventar mecánica nueva; reutiliza el módulo de simulación.

**Alternatives considered**: análisis estático de "qué opción es mejor" (rechazado: no captura el efecto acumulado); solo revisión manual (rechazado: no es medida).

## R6 · Recalibración obligatoria

**Decision**: al retirar la mayoría de `efectos`, los atributos dejan de crecer; hay que **recalibrar** `pesosTecho`, `umbralesNivel` y `multiplicadorRuido` (y, si hace falta, `bonoAnoPico`) para volver a la distribución objetivo de `docs/01` §7.

**Rationale**: la calibración T13 medía con atributos crecientes. La Constitución III manda ajustar pesos/umbrales/ruido, **nunca** las situaciones.

**Alternatives considered**: aceptar la nueva distribución (rechazado: rompería los objetivos de diseño); devolver efectos a las situaciones para cuadrar (prohibido por la Constitución III).

## R7 · Fuera de alcance confirmado

**Decision**: el efecto **diferido** (impulso con caída posterior) y el resultado **incierto** (60/40) **no** se implementan en esta feature. No se añade soporte de esquema ni de motor para ellos.

**Rationale**: decisión del usuario (2026-09-20); evita complejidad sin necesidad (Principio V).

**Alternatives considered**: modelarlos por contenido (flags/condicionales) — pospuesto; mecánica nueva en el motor — descartado ahora.

## R8 · Determinismo

**Decision**: sin cambios. Todo el azar sigue saliendo del RNG sembrado; ninguna decisión introduce azar en tiempo de edición.

**Rationale**: Principio I; la feature no toca `seed.ts` ni el uso del RNG.

**Alternatives considered**: ninguno aplicable.

## R9 · Documentación y registro

**Decision**: actualizar `docs/01` §2 (la decisión no mueve atributos salvo excepción), `docs/02` §8 (matiz: los atributos parten de un valor estándar y el resultado se fía al destino + azar), la nota de calibración T13 y cerrar **C15** en `docs/registro/`.

**Rationale**: gobernanza ("las contradicciones se registran; cuando se decide, se actualiza primero el documento fuente").
