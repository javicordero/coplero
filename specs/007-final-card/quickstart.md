# Quickstart — Validación de la feature 007 (tarjeta final y compartir)

Guía para comprobar de punta a punta que la tarjeta, el código, la página de resultado y las imágenes funcionan sin romper el motor, el contenido ni la persistencia.

## Requisitos

- Node 22+, dependencias instaladas (`npm install`).
- Contratos: [`contracts/engine.md`](./contracts/engine.md), [`contracts/codec.md`](./contracts/codec.md), [`contracts/rutas.md`](./contracts/rutas.md), [`contracts/ui.md`](./contracts/ui.md).
- Modelo de datos: [`data-model.md`](./data-model.md).

## 1. Puertas de calidad

```bash
npm run check      # typecheck + lint + tests
npm run test       # Vitest (engine, content y juego)
```

Resultado esperado: 0 errores; tests de tarjeta, codec, contenido y estado en verde.

## 2. Motor: contrato y determinismo (unitario)

Escenarios que deben existir y pasar:

1. **Campos completos**: una carrera de referencia produce una `TarjetaFinal` con identidad, trayectoria, resultado, narración y premios.
2. **Tres hitos**: `tarjeta.hitos.length === 3` en carreras con muchos y con ningún logro (relleno neutro).
3. **Sin datos ocultos**: ninguna clave de `destino` (techo, suelo, anoPico, anosCarrera, volatilidad, carisma, milagro) aparece en la tarjeta ni en el código.
4. **Premios separados**: `otrosPremios` agrupa por tipo con recuento y nunca incluye tipos con `veces === 0`; `primerosPremios` va aparte.
5. **Mejor posición**: se expone cuando no hay premio del COAC.
6. **Nombre oculto**: `sinNombre` devuelve `nombre: null` y no deja el nombre en ningún campo.
7. **Determinismo**: misma seed + mismas decisiones ⇒ misma `TarjetaFinal`.

```bash
npx vitest run src/engine/__tests__/tarjeta.test.ts
```

## 3. Codec (unitario)

```bash
npx vitest run src/engine/__tests__/codec.test.ts
```

Comprobar:

- Roundtrip: `decodificar(codificar(t))` reproduce `t`.
- Caracteres URL-safe y tamaño < 2000 caracteres para una carrera completa.
- `CODIGO_INVALIDO` y `VERSION_CODIGO_INCOMPATIBLE` en los casos corruptos.
- El payload no contiene `seed` ni claves de `destino`.

## 4. Contenido

```bash
npx vitest run src/content/__tests__/integridad.test.ts
npm run contenido:informe
```

Comprobar que el catálogo `textosTarjeta` valida con Zod y cubre todos los tipos de hito y buckets de frase usados por el motor.

## 5. Simulación masiva

```bash
npm run simular -- --n 10000
```

Resultado esperado:

- 0 hallazgos `tarjetaIncoherente` (siempre 3 hitos, sin datos ocultos, sin tipos de premio a cero).
- La distribución de fases se mantiene en el rango objetivo (la tarjeta no altera el resultado del COAC).

## 6. Recorrido manual (isla y página)

```bash
npm run dev
```

1. Terminar una carrera y comprobar la **tarjeta-póster**: identidad, datos destacados (COAC / mejor posición / otros premios por tipo), fila de trayectoria, tres hitos, frase y pie con la marca de agua. Sin número héroe.
2. Probar el **toggle de nombre** y ver que la tarjeta se re-renderiza sin el nombre.
3. Compartir/copiar/descargar: obtener el enlace `/r/<codigo>` y abrirlo en una ventana limpia (sin `localStorage`); la tarjeta debe reproducirse íntegra.
4. Abrir `/api/og/<codigo>.png`, `?t=9x16` y `?t=1x1`: formatos, pie de marca y **composición espejo del palmarés** (la URL incluye `?v=`, `VERSION_OG`).
5. Provocar un código inválido (`/r/xx`) y comprobar la página amable con enlace a `/jugar`.

## 7. E2E

```bash
npm run test:e2e
```

Debe recorrer fin → tarjeta → acciones de compartir y ejecutar una auditoría automática de accesibilidad (WCAG 2.2 AA) sin violaciones críticas o serias.

## 8. Criterios de aceptación cubiertos

| Criterio | Cómo se comprueba |
|---|---|
| SC-001 | Test: tarjeta con todos los campos |
| SC-002 | `npm run simular` sin datos ocultos en 10.000 carreras |
| SC-003 | Test/simulación: exactamente tres hitos |
| SC-004 | Revisión/E2E: tarjeta en una pantalla móvil, sin red en el bucle |
| SC-005 | Test de determinismo de la tarjeta |
| SC-007 | Abrir `/r/<codigo>` en contexto limpio |
| SC-008 | Test de tamaño del código < 2000 |
| SC-009 | Endpoint de imágenes 9:16/1:1 con marca de agua |
| SC-010 | Página amable con código inválido |
| SC-011 | Tests con y sin cambios de trayectoria |
| SC-012 | Auditoría de accesibilidad en E2E |
| SC-013 | Composición completa y sin número héroe |
