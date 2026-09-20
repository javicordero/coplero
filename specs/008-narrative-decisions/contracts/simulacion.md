# Contrato — Simulación y validación (feature 008)

El balance y la ausencia de estrategia dominante se demuestran con `src/simulacion/` + `scripts/simular.ts`, nunca a ojo.

## Reglas de auditoría (nuevas/actualizadas)

| Regla | Qué comprueba |
|---|---|
| `efectoNoDeclarado` | Ninguna opción del banco tiene `efectos` sin `excepcion: true` (coherente con el esquema; se re-verifica desde el content/informe). |
| `excepcionesExcesivas` | El número de opciones con `excepcion: true` no supera el umbral acordado (orden de 3–6). |
| (existentes) | `estadosImposibles`, `tarjetaIncoherente`, alcanzabilidad, etc. se mantienen. |

## Validación de "sin estrategia dominante" (SC-001)

- Ejecutar los perfiles existentes (`aleatorio`, `codicioso`, `erratico`) sobre el mismo número de carreras.
- Comparar la tasa de "pisa la final" (y premios) por perfil.
- Criterio: la diferencia entre el mejor y el peor perfil queda dentro de un **margen** (p. ej. ≤ 5 puntos porcentuales) — el perfil que elige "mejor" no gana por ello.
- El test vive en `src/simulacion/__tests__/` y se apoya en el módulo puro de simulación.

## Validación de la distribución objetivo (SC-005)

- Tras recalibrar, la distribución de `docs/01` §7 debe reproducirse: ~45% pisa la final, ~10% no pasa de cuartos, ~7% no pasa de preliminares (y los objetivos de premios de T13).
- Se ajustan `pesosTecho`, `umbralesNivel` y `multiplicadorRuido` (y `bonoAnoPico` si hace falta), **nunca** las situaciones.

## Presupuesto

- La simulación de 10.000 carreras mantiene el presupuesto existente (~30 s).
