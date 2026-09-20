# Quickstart — Validación de la feature 006 (cambios de trayectoria)

Guía para comprobar de punta a punta que los cambios de modalidad y variante funcionan sin romper el motor, el contenido ni la persistencia.

## Requisitos

- Node 22+, dependencias instaladas (`npm install`).
- Contexto de contratos: [`contracts/engine.md`](./contracts/engine.md) y [`contracts/pantalla.md`](./contracts/pantalla.md).
- Modelo de datos: [`data-model.md`](./data-model.md).

## 1. Puertas de calidad

```bash
npm run check      # typecheck + lint + tests
npm run test       # Vitest (incluye engine, content y juego)
```

Resultado esperado: 0 errores; los tests de trayectoria, determinismo, integridad y mantenimiento del motor en verde.

## 2. Determinismo e integridad de la trayectoria (unitario)

Escenarios que deben existir y pasar:

1. **Cambio de modalidad**: una carrera que elige la opción `cambiaModalidad` pasa a la otra modalidad, entra en el paso `{ tipo: "variante" }`, y tras `elegirVarianteDeCambio` la partida tiene la nueva modalidad y una variante válida de ella.
2. **Variante inválida**: `elegirVarianteDeCambio` con un id que no pertenece a la modalidad vigente devuelve `{ codigo: "VARIANTE_INVALIDA" }`.
3. **Cambio de variante**: una opción con `cambiaVariante` actualiza `Partida.variante` y añade una entrada a `trayectoria.cambios` con el año correcto.
4. **Selección posterior**: tras un cambio, las decisiones usan la modalidad y variante vigentes (los filtros `modalidades`/`variantes` respetan los valores nuevos).
5. **Determinismo**: misma seed + mismas decisiones ⇒ misma `trayectoria`.
6. **Persistencia**: guardar una partida con `fase = "variante"` y restaurarla vuelve a pedir la variante; guardar/restaurar una trayectoria completa la conserva intacta.
7. **Versión**: un JSON con `version: 1` se rechaza con `VERSION_INCOMPATIBLE`.

Comando sugerido:

```bash
npx vitest run src/engine/__tests__/trayectoria.test.ts
npx vitest run src/engine/__tests__/determinismo.test.ts src/engine/__tests__/serializacion.test.ts
```

## 3. Integridad del contenido

```bash
npx vitest run src/content/__tests__/integridad.test.ts src/content/__tests__/integridad-negativos.test.ts
npm run contenido:informe
```

Comprobar:

- Las 2 situaciones de cambio de modalidad existen, tienen 2 opciones y no son de febrero.
- Los ids de `variantes` y `cambiaVariante` pertenecen al catálogo de su modalidad.
- Ninguna opción declara `cambiaModalidad` y `cambiaVariante` a la vez.
- Las situaciones nuevas no son inalcanzables.

## 4. Simulación masiva

```bash
npm run simular -- --n 10000
```

Resultado esperado:

- 0 hallazgos `trayectoriaIncoherente` y 0 `varianteInvalida`.
- Se observan carreras con cambio de modalidad y con evolución de variante.
- La distribución de fases se mantiene en el rango objetivo (los cambios no alteran el resultado del COAC, que no depende de la modalidad).

## 5. Recorrido manual en la isla (`/jugar`)

```bash
npm run dev
```

Con una partida de prueba que llegue a un verano con la situación de cambio:

1. Al elegir **cambiar de modalidad**, aparece la pantalla de elección de variante con las 3 variantes de la nueva modalidad (sin etiquetas que revelen mecánicas internas).
2. Al elegir, la carrera continúa en febrero con la nueva modalidad.
3. Recargar la página en el paso de variante mantiene la pantalla de cambio y no pierde la modalidad ya cambiada.
4. Terminar la carrera y comprobar que `resumen.trayectoria` refleja el recorrido (la tarjeta visual llega en 007).

## 6. Criterios de aceptación cubiertos

| Criterio | Cómo se comprueba |
|---|---|
| SC-001 | Test: la situación de cambio de modalidad ofrece 2 opciones |
| SC-002 | `npm run simular` sin `varianteInvalida` en 10.000 carreras |
| SC-003 | Test/simulación: decisiones posteriores usan modalidad/variante nuevas |
| SC-004 | Test de persistencia con trayectoria y con `fase = "variante"` |
| SC-005 | Test de determinismo |
| SC-006 | Revisión de la UI: sin etiquetas de mecánica |
| SC-007 | Revisión: la UI y el resumen no exponen `destino` |
