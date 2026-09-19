# Quickstart — Validar la persistencia local

Guía de validación de la feature. Detalles de tipos y reglas en [data-model.md](./data-model.md) y [contracts/](./contracts/).

## Requisitos

- Node 22+, dependencias instaladas (`npm install`).
- Chromium de Playwright instalado (`npx playwright install chromium`).

## Validación automática

```bash
npm run check        # astro check + Biome + Vitest (puerta de calidad, Principio III)
npm run test:e2e     # smoke de navegador (incluye recargar y continuar)
```

Resultado esperado: 0 errores; se añaden tests de persistencia y estado (ver tareas).

## Escenarios manuales (dev)

```bash
npm run dev          # abre http://localhost:4321/jugar
```

### 1. Guardar tras cada decisión y restaurar (P1)

1. Crea el personaje, elige modalidad y variante.
2. Toma **una** decisión.
3. Recarga la página (F5).

**Esperado**: la intro ofrece **"Continuar donde lo dejaste"**; al pulsarla, la carrera retoma en la **misma decisión, año y momento** (mismo `data-momento` y `data-ano`).

### 2. Cerrar de inmediato no pierde la decisión

1. Con una carrera en curso, decide y cierra la pestaña al instante.
2. Vuelve a abrir `/jugar`.

**Esperado**: la decisión ya estaba guardada; no se repite ni se pierde.

### 3. Empezar de cero / nueva partida (P2)

1. Con una carrera guardada, pulsa "Empezar de cero".

**Esperado**: vuelve a la intro sin "Continuar"; en `localStorage` ya no existe `coplero:partida`.

### 4. Guardado incompatible (P3)

1. En DevTools → Application → Local Storage, edita `coplero:partida` y pon `{"version":999,"partida":"{}"}`.
2. Recarga.

**Esperado**: la app arranca sin errores, muestra un **aviso amable** y ofrece "Empezar". El sobre queda **eliminado** (el aviso no reaparece al recargar de nuevo).

### 5. Guardado dañado

1. Pon `coplero:partida` = `{ no-json`.
2. Recarga.

**Esperado**: mismo comportamiento que el escenario 4.

### 6. Carrera terminada (Q1)

1. Juega una carrera hasta el final (`[data-testid="fin"]`).
2. Recarga.

**Esperado**: la intro ofrece **"Ver resultado"** y "Empezar de cero"; **no** aparece "Continuar".

### 7. Almacenamiento no disponible (Q2)

1. Bloquea el almacenamiento (por ejemplo, navegación privada restrictiva o deshabilitar `localStorage` en DevTools).
2. Juega una carrera.

**Esperado**: la partida se juega de principio a fin **sin errores ni avisos**; al recargar no hay "Continuar".

### 8. Varias pestañas (Q4)

1. Abre la carrera en dos pestañas y decide distinto en cada una.

**Esperado**: gana la última que guardó; no hay avisos de conflicto.

## Comprobación de tamaño

En DevTools → Application → Local Storage, inspecciona `coplero:partida` en el punto más avanzado de una carrera: debe quedar **muy por debajo de 51 KB** (el 1% del límite típico de 5 MB); medido ≈14 KB (SC-006).

## No-regresión

- La landing y "cómo jugar" siguen sin JavaScript de isla (Principio IV).
- `engine` sigue sin referencias a `localStorage`/DOM: `grep -r "localStorage" src/engine` → sin resultados.
