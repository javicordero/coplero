# Quickstart — Estilo de las tarjetas de modalidad y variante (nombres, cita e icono)

Guía para comprobar que la feature funciona de extremo a extremo. No incluye implementación.

## Prerrequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Servidor de desarrollo en `http://localhost:4321` (`npm run dev`). Playwright usa su propio puerto por configuración.
- Recursos `public/iconos/caja.svg`, `public/iconos/guitarra.svg`, `public/iconos/bigote.svg`, `public/iconos/raices.svg` y `public/iconos/nueva_escuela.svg` presentes (ya versionados).

## Escenario 1 — La modalidad misma como opción

1. Abrir `http://localhost:4321/jugar` y crear el personaje (nombre + Continuar).
2. En la pantalla de modalidad, comprobar que hay exactamente **dos tarjetas**: "Comparsa" y "Chirigota".
3. Verificar que **no** aparece ninguna tarjeta con "Comparsista" ni "Chirigotero".

**Esperado**: los títulos muestran la modalidad, no el rol.

## Escenario 2 — Subtítulos de modalidad en cursiva (son citas)

1. En la tarjeta de Comparsa, comprobar que el subtítulo es literalmente "¡Pasión, decía Paco Alba, la comparsa es pasión!" y se muestra en **cursiva**.
2. En la tarjeta de Chirigota, comprobar que el subtítulo se mantiene ("Humor, tipo y crítica desde la calle.") y también va en **cursiva**.

**Esperado**: ambos subtítulos de modalidad, en cursiva.

## Escenario 3 — Iconos provisionales (monocromos, color del subtítulo)

1. En modalidad: Comparsa muestra la **guitarra** y Chirigota la **caja**, en la esquina superior derecha, de un solo color (el del subtítulo).
2. Al elegir modalidad, en la pantalla de variante comprobar el título **"Elige tu estilo"** y que cada tarjeta muestra su icono: en comparsa, **bigote** ("Clásico"), **raíces** ("Evolución con raíces") y **nueva escuela** ("Nueva escuela"); en chirigota, la **guitarra**.
3. Comprobar que ningún icono se solapa con el texto, tampoco con un subtítulo de dos líneas en un móvil estrecho.
4. Pulsar la tarjeta (incluida la zona del icono): la opción se elige y el flujo avanza.

**Esperado**: iconos decorativos que no interfieren con la lectura ni con el toque.

## Escenario 4 — Subtítulos de variante: cursiva solo si son citas

1. En la pantalla de variante (comparsa), comprobar que "Clásico" y "Nueva escuela" van en redonda y sin comillas, y que "Evolución con raíces" (cita) va en **cursiva y entre comillas “ ”**.
2. En las variantes de chirigota, comprobar el orden "Clásico" → "Interpretar el personaje" → "Lolosedismo" y que "Clásico" (“Vuelve ya el 3x4, el 3x4 bueno”) e "Interpretar el personaje" (“Aquí no deberían permitirse pasodobles de cachondeo”) van en cursiva y entre comillas; "Lolosedismo", en redonda.

**Esperado**: la cursiva y las comillas marcan exactamente los subtítulos que son citas.

## Escenario 5 — Accesibilidad y bordes

1. Recorrer modalidad y variante con lector de pantalla: cada opción se anuncia por su título y subtítulo; los iconos no se anuncian.
2. A **320 px** de ancho, comprobar que no hay desplazamiento horizontal.
3. Ejecutar axe (WCAG 2.2 AA) sobre ambas pantallas: sin violaciones graves.

**Esperado**: nombre accesible correcto, sin desborde y sin violaciones graves.

## Escenario 6 — Sin regresiones fuera de alcance

1. Completar una carrera y abrir la tarjeta final: debe seguir diciendo "Comparsista"/"Chirigotero".
2. Abrir una imagen compartible de resultado: debe seguir mostrando la etiqueta anterior.
3. Comprobar que la cabecera de modalidad ("Elige modalidad" / "Purpurina o plumero") mantiene su posición y estilo.

**Esperado**: solo cambian las tarjetas de modalidad y variante.

## Comandos de verificación

```bash
npm run check                                              # typecheck + lint + tests unitarios
npx playwright test tests/e2e/modalidad-tarjetas.spec.ts   # contenido, cursiva, iconos y 320 px (nuevo)
npx playwright test tests/e2e/layout-previo.spec.ts        # cabecera de la pantalla intacta
npx playwright test tests/e2e/jugar.spec.ts tests/e2e/chrome.spec.ts tests/e2e/layout-estable.spec.ts
```

## Criterios de aceptación (ver spec)

- Títulos de modalidad: SC-001.
- Cita literal: SC-002; cursiva solo en modalidad: SC-013.
- Iconos sin solape, del color del subtítulo: SC-003 (modalidad) y SC-010 (variante).
- Nombre accesible sin los iconos: SC-004.
- Un solo toque: SC-005.
- Sin desborde a 320/390 px: SC-006 y SC-012.
- WCAG 2.2 AA: SC-007 y SC-012.
- Sin cambios fuera de modalidad y variante: FR-008 y SC-008.

## Referencias

- Contrato de tarjetas: [contracts/modalidad.md](./contracts/modalidad.md)
- Modelo de presentación: [data-model.md](./data-model.md)
- Decisiones técnicas: [research.md](./research.md)
