# Quickstart — Palmarés de la pantalla final

Guía para comprobar el rediseño de extremo a extremo. No incluye implementación.

## Prerrequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Servidor de desarrollo en `http://localhost:4321` (`npm run dev`).
- Acceso directo dev a la pantalla final: `/jugar?dev=fin`. Casos: `campeon` (por defecto), `podio`, `finalista`, `retirada`, `cambios`, `sin-premios`.

## Escenario 1 — El palmarés, de un vistazo

1. Abrir `http://localhost:4321/jugar?dev=fin`.
2. Comprobar, en orden: antetítulo «Carrera finalizada» (fuera), **nombre**, **modalidad** y **estilo**, **mejor posición**, **línea temporal de premios**, **distinciones** y **frase de cierre**.
3. Comprobar que **no** aparecen trayectoria, años en activo, años sin concurso, relato de hitos, compás decorativo ni marca de agua.

**Esperado**: un palmarés vertical y aireado, sin aspecto de formulario ni dashboard.

## Escenario 2 — Línea temporal de premios

1. Comprobar que los años con premio aparecen **en horizontal**, repartidos en **filas de 5** con un **carril continuo** que enlaza las filas, en orden **cronológico**, con `puesto`, nodo y `año`; sin scroll horizontal.
2. Comprobar que el año del **1º premio** se ve en **dorado** y que 2º/3º quedan atenuados.
3. Comprobar que **no** aparece ningún año sin premio.
4. Con `&caso=retirada` o `&caso=sin-premios`, comprobar que la línea temporal **no** aparece.

**Esperado**: se lee como trayectoria, no como gráfico.

## Escenario 3 — Distinciones como colección

1. Comprobar que cada distinción se muestra como **una roseta por victoria**, agrupadas por tipo.
2. Comprobar que todas tienen el **mismo peso** (ninguna destacada) y que la retícula envuelve.
3. Con `&caso=retirada` o `&caso=sin-premios`, comprobar que la sección **no** aparece.

**Esperado**: se lee como reconocimientos acumulados, no como «otros premios».

## Escenario 4 — Frase de cierre

1. Comprobar que hay una frase corta en cursiva **antes de los botones**.
2. Comprobar que **no** dice «has ganado» y que funciona igual con `&caso=retirada` (carrera sin premios).

**Esperado**: cierre narrativo válido para cualquier posición.

## Escenario 5 — Estética y fondo

1. Comprobar fondo neutro (sin escena de verano ni de febrero) en `fin`, también con `&momento=verano`/`&momento=febrero`.
2. Comprobar negro base, blanco info, naranja en destacados y **dorado solo** en el 1º premio.
3. A **320 px**, comprobar que no hay scroll horizontal.

**Esperado**: identidad Coplero, elegante y legible.

## Escenario 6 — Acciones y coherencia

1. Comprobar que hay **Compartir**, **Imagen 9:16** y **Empezar de nuevo**; y que **no** hay «Copiar texto», «Imagen 1:1» ni «Copiar enlace».
2. Abrir `/` (ejemplo de portada) y `/r/<codigo>`: deben mostrar el mismo palmarés.
3. Ejecutar axe (WCAG 2.2 AA) sobre `fin` y `/r/<codigo>`: sin violaciones graves.

**Esperado**: tres superficies coherentes y accesibles.

## Comandos de verificación

```bash
npm run check
npx playwright test tests/e2e/pantalla-final.spec.ts tests/e2e/pantalla-final-fondo.spec.ts tests/e2e/compartir.spec.ts
```

## Criterios de aceptación (ver spec)

- Zonas del palmarés y ausencia de bloques retirados: SC-001, SC-002.
- 320 px y WCAG AA: SC-003.
- Acciones: SC-004.
- Estética y dorado solo en 1º: SC-005.
- `/r` ligero: SC-006.
- Sin fondo estacional: SC-007.
- Frase sin «has ganado»: SC-008.

## Referencias

- Contrato de UI: [contracts/ui.md](./contracts/ui.md)
- Modelo de presentación: [data-model.md](./data-model.md)
- Decisiones: [research.md](./research.md)
