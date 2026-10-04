# Quickstart — Validación del modo dev y del resultado del año

Guía para validar la feature de punta a punta. No incluye implementación; los detalles están en [contracts/ui.md](./contracts/ui.md) y [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).
- La isla `/jugar` y el modo dev ya establecido (`?dev=fin`) operativos.

## 1. Modo dev de resultado (validación manual)

```bash
npm run dev
```

Abrir en el navegador (solo funciona en desarrollo):

| URL | Comprobación |
|---|---|
| `http://localhost:4321/jugar?dev=resultado` | Caso por defecto (`campeon`), sin jugar nada |
| `http://localhost:4321/jugar?dev=resultado&caso=podio` | Fase/puesto/distinciones del caso `podio` |
| `http://localhost:4321/jugar?dev=resultado&caso=finalista` | Final sin puesto ni distinciones |
| `http://localhost:4321/jugar?dev=resultado&caso=preliminares` | «Te has quedado en Preliminares» |
| `http://localhost:4321/jugar?dev=resultado&caso=sin-premios` | Cuartos sin distinciones |
| `http://localhost:4321/jugar?dev=resultado&caso=fuera-de-concurso` | Año fuera de concurso |
| `http://localhost:4321/jugar?dev=resultado&caso=distinciones` | Dos distinciones en fila (roseta y nombre debajo) |
| `http://localhost:4321/jugar?dev=resultado&caso=todas` | Las **tres** distinciones en fila, cada texto del color de su roseta |
| `http://localhost:4321/jugar?dev=resultado&caso=inexistente` | Cae al caso por defecto |

**Resultado esperado**: la pantalla se monta al instante; el indicador dice `Año N · Resultado`; «Continuar» está dentro del panel y no avanza; no se crea ni modifica ninguna partida guardada.

**No regresión del dev de fin**: `http://localhost:4321/jugar?dev=fin` sigue funcionando igual.

## 2. Indicador de contexto (validación manual)

- Entrar al juego normal (`http://localhost:4321/jugar`), crear personaje y avanzar.
- En una **decisión**: el indicador dice `Año N · Verano` o `Año N · Febrero`.
- En el **resultado** del año: el indicador dice `Año N · Resultado` y nunca `Febrero`.

## 3. Rediseño como panel de creación (validación manual)

- Recorrer los casos dev en vista móvil (DevTools, 320 px y 390 px de ancho):
  - Tema **oscuro** por defecto, como las pantallas de creación.
  - Contenido en un **panel** (superficie, borde, sombra), etiquetas en mayúsculas, **sin cabecera centrada**.
  - Sin scroll horizontal.
  - Distinciones en **una fila**: nombre encima y **roseta** debajo.
  - Botón «Continuar» **dentro del panel**.

## 4. Tests automáticos

```bash
# Unit: fixtures del modo dev, etiqueta del indicador y rosetas
npm run test -- fixturesResultado presentacion

# E2E: modo dev, indicador, rosetas, panel, responsive y accesibilidad
npm run test:e2e -- resultado-dev

# No regresión del flujo y del layout (incluye INV-5 del indicador)
npm run test:e2e -- layout-estable jugar entrada-directa compartir pantalla-final

# Puerta completa
npm run check
```

**Resultado esperado**:
- Todos los casos dev existen y son `Temporada` válidos; caso desconocido → por defecto.
- `etiquetaMomento("resultado") === "Resultado"`; `ROSETAS` cubre los tres tipos.
- E2E verde, `axe` sin violaciones `critical`/`serious` y sin scroll horizontal a 320 px.
- `npm run check` pasa.

## 5. Producción

```bash
npm run build
```

- La rama dev no aparece en el bundle y `?dev=resultado` no tiene efecto en producción.
- El flujo normal (reanudar, decisiones, resultado, fin) no cambia.
