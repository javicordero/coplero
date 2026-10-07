# Quickstart · Textos de situación adaptados al género

Guía de validación manual de la feature. Referencias: [data-model.md](./data-model.md) §3,
[contracts/genero-textos.md](./contracts/genero-textos.md).

## Requisitos previos

- Node 22+ y dependencias instaladas (`npm install`).
- Ramas/ficheros de la feature 028.

## 1. Verificación automática

```bash
npm run test        # unitarios (motor, contenido, panel)
npm run check       # Astro check + Biome + tests
```

Resultado esperado: todo en verde; **sin cambios en el snapshot** de la partida de referencia
(personaje masculino).

## 2. Rellenar una variante femenina desde el panel

1. Arranca el panel solo-dev:

   ```bash
   npm run dev
   ```

2. Abre `/panel`, importa el banco si hace falta y **edita una situación**.
3. En la sección **"Variante femenina"**, escribe un `título femenino` y un `subtítulo femenino` en
   una opción. Guarda.
4. Exporta el contenido:

   ```bash
   npm run panel:volcar
   ```

5. Comprueba en `src/content/decisiones/*.ts` que aparecen los campos rellenos y **no** aparecen los
   vacíos.

## 3. Verificar el juego según el género

En `/jugar`, crea partidas con el mismo contenido y distintos géneros:

| Género | Comprobación |
|---|---|
| **Femenino** | Los textos con variante femenina salen en femenino; los que no la tienen, en la forma por defecto. |
| **Masculino** | Todo sale en la forma por defecto, exista o no variante femenina. |
| **No binario** | A lo largo de varias decisiones aparecen **ambas** formas; no todo es forma por defecto. |

## 4. Determinismo

1. Juega una partida **no binaria** hasta una decisión con variante femenina; anota los textos.
2. Recarga/continúa la partida: los textos deben ser **idénticos**.
3. Repite la partida con la **misma semilla** y las mismas decisiones: mismos textos.

## 5. Compatibilidad

1. Abre una situación **sin** variantes femeninas.
2. Con cualquier género, debe verse exactamente como antes de la feature.

## Criterios de éxito cubiertos

- SC-001/SC-002 → §3 (femenino/masculino).
- SC-003 → §3 (no binario muestra ambas formas).
- SC-004 → §2 (panel → juego sin tocar código).
- SC-005 → §4 (reanudar muestra lo mismo).
- SC-006 → §5 (contenido sin variantes).
- SC-007 → §1 (`npm run check`).
