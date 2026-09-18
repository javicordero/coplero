# Quickstart: Validación del motor (ENGINE-001)

Guía de validación del motor sin interfaz. Todo se ejecuta en Node con Vitest.

## Prerrequisitos

- Node 22+ (probado con Node 24).
- Dependencias instaladas: `npm install`.
- Workdir: raíz del repo (`coplero/`).

## Comandos

```bash
npm run test        # suite completa de Vitest
npm run check       # astro check + Biome + Vitest
```

## Escenarios de validación

### 1. Determinismo (US1, SC-001)

Dos partidas con la misma `seed`, personaje, modalidad y variante producen estados idénticos; la
misma secuencia de decisiones produce el mismo estado final.

- Ejecutar: `npm run test -- determinismo`
- Esperado: ambas ramas terminan con estados equivalentes; sin diferencias campo a campo.

### 2. Serialización (US1, FR-003, SC-002)

`deserializar(serializar(p))` reconstruye un estado equivalente y permite continuar igual. Un JSON con
`version` distinta devuelve `VERSION_INCOMPATIBLE`.

- Ejecutar: `npm run test -- serializacion`
- Esperado: round-trip sin pérdida; error explícito en versión incompatible.

### 3. Ciclo estacional y decisiones (US2, FR-005/FR-006)

En cada año se ofrecen una situación de contenido y una de personaje; nunca dos del mismo tipo; las de
verano no aparecen en febrero ni al revés.

- Ejecutar: `npm run test -- selector`
- Esperado: reparto correcto por año y filtrado por momento, modalidad y variante.

### 4. Efectos, flags y condicionales (US2, FR-008/FR-009)

Elegir una opción aplica sus efectos con clamp y deja sus flags; consumir una flag no la borra y
desactiva su disparo; una flag fuera de ventana no abre condicionales.

- Ejecutar: `npm run test -- condicionales`
- Esperado: atributos dentro de `[0, 100]`; historial conserva flags consumidas.

### 5. COAC y premios (US3, FR-010/FR-011/FR-012)

El resultado de la temporada se calcula con el estado previo a la decisión de febrero; el batacazo
puede atravesar el suelo; el milagro rompe el techo una sola vez; no hay premios en temporadas fuera
de concurso.

- Ejecutar: `npm run test -- coac` y `npm run test -- premios`
- Esperado: fases dentro de `[suelo, techo]` salvo las válvulas; premios solo con participación.

### 6. Resumen mínimo (US4, FR-013)

Una carrera completa hasta la retirada produce un resumen con años en activo, mejor fase y premios, y
**sin** el destino.

- Ejecutar: `npm run test -- resumen`
- Esperado: resumen no contiene `destino`, `techo`, `suelo`, `anoPico`, `volatilidad` ni `carisma`.

### 7. Simulación a escala (US5, SC-004)

Un lote de 10.000 carreras completas termina sin errores dentro del presupuesto provisional (30 s).

- Ejecutar: `npm run test -- simulacion`
- Esperado: 10.000 carreras completadas; agregado de fases disponible.

## Criterios de aceptación rápidos

- [ ] `npm run test` en verde.
- [ ] `npm run check` sin errores de tipo ni lint.
- [ ] Ninguna ejecución depende de `Math.random` ni `Date.now`.
- [ ] El motor se importa y ejecuta en un proceso Node sin Astro ni Svelte.

## Referencias

- Modelo de datos: [data-model.md](./data-model.md)
- Contrato de la API: [contracts/engine-api.md](./contracts/engine-api.md)
- Requisitos: [spec.md](./spec.md)
