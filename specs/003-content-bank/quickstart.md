# Quickstart: validar el banco de contenido real

Guía de validación end-to-end. No contiene implementación; describe cómo comprobar que el feature funciona.

## Prerequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Rama/feature: `003-content-bank`.

## 1. El contenido es válido y el motor lo consume

```bash
npm run check
```

Esperado: `astro check` sin errores, Biome sin hallazgos y Vitest en verde, incluidos:

- `src/content/__tests__/integridad.test.ts` — reglas de integridad.
- `src/content/__tests__/compatibilidad.test.ts` — el banco satisface `BancoContenido`.

## 2. Una carrera completa con el banco real

Ver `specs/003-content-bank/contracts/contenido.md` para el uso:

```ts
import { bancoContenido } from "./src/content"
import { crearPartida, siguientePaso, elegir } from "./src/engine"
```

Esperado: se completan los años sin error `CONTENIDO_INSUFICIENTE` para las cuatro configuraciones (comparsista/chirigotero × variantes), y la carrera termina con resumen.

## 3. Informe de integridad

```bash
npm run contenido:informe
```

Esperado (valores del banco documentado):

- Situaciones de verano: **18**
- Situaciones de febrero: **9**
- Condicionales: **11**
- Flags declaradas y referenciadas: listadas; **ninguna referenciada sin declarar**
- Situaciones potencialmente inalcanzables: listado (o "ninguna")

## 4. Simulación masiva sobre el banco real (T17)

```bash
npm run simular -- 10000
```

Esperado: informe con distribución de fases, frecuencias por situación, condicionales nunca disparados y atributos; código de salida `0`. No se recalibra: las cifras pueden diferir del banco de pruebas.

## 5. Compatibilidad y capas

- `content` no importa de `engine` ni de `web`.
- `engine` no importa de `content`.
- `scripts/simular.ts` no importa de `src/engine/__tests__/`.

## Criterios de aceptación cubiertos

| Criterio | Comprobación |
|---|---|
| SC-001 | Paso 2 |
| SC-002 | Paso 3 (recuentos) |
| SC-003 | Paso 1 |
| SC-004 | `integridad.test.ts` (casos negativos) |
| SC-005 | Paso 3 |
| SC-006 | Paso 5 |
| SC-007 | Paso 4 |
