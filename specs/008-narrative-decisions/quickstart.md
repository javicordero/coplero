# Quickstart — validación de la feature 008 (Decisiones que no afectan al resultado)

Guía para comprobar de punta a punta que las decisiones son narrativa y que solo unas pocas excepciones afectan al resultado.

## Requisitos

- Node 22+, dependencias instaladas (`npm install`).
- Banco de contenido revisado (efectos retirados salvo excepciones) y parámetros recalibrados.

## 1. Suite completa

```bash
npm run check      # astro check + biome + vitest
```

Esperado: verde. Incluye las nuevas reglas de excepción en `src/content/__tests__/integridad.test.ts`.

## 2. Recuento de excepciones

```bash
npm run contenido:informe
```

Esperado:
- El número de opciones con `excepcion: true` es **bajo** (orden de 3–6) y aparece desglosado.
- **0** opciones con `efectos` sin `excepcion: true`.

## 3. Simulación masiva

```bash
npm run simular -- 10000
```

Esperado:
- **0 estados imposibles**, **0 efectos no declarados**, excepciones por debajo del umbral.
- Distribución objetivo (`docs/01` §7): ~45% pisa la final, ~10% no pasa de cuartos, ~7% no pasa de preliminares.
- Comparativa por perfil (`aleatorio`, `codicioso`, `erratico`): diferencias dentro del margen ⇒ **no hay estrategia dominante**.

## 4. Determinismo

```bash
npm run test -- src/engine/__tests__/determinismo.test.ts
```

Esperado: misma semilla + mismas decisiones ⇒ misma partida (sin cambios respecto a hoy).

## 5. Comprobación manual del intercambio (opcional)

1. `npm run dev`.
2. Jugar hasta una situación declarada como excepción.
3. Comprobar que el `subtitulo` explica el intercambio (qué gana y qué pierde) sin revelar el `destino`.
4. Repetir la carrera con las dos opciones y ver que el resultado no se sale del techo del destino.

## 6. Documentación

```bash
git diff docs/
```

Esperado: `docs/01` §2 y `docs/02` §8 reflejan que las decisiones no mueven atributos salvo excepción; la nota T13 y **C15** quedan actualizadas.

## Criterios de hecho

- [ ] `npm run check` verde.
- [ ] `npm run contenido:informe`: 0 efectos no declarados y excepciones dentro del umbral.
- [ ] `npm run simular -- 10000`: sin estrategia dominante y distribución objetivo.
- [ ] Determinismo intacto.
- [ ] Docs y registro actualizados.
