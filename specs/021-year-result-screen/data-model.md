# Phase 1 — Data Model: Modo dev y rediseño de la pantalla de resultado del año

La feature no introduce estado en el motor ni persistencia nueva. Reutiliza `Temporada` y añade únicamente tipos de presentación, un modo de arranque dev y un mapa de rosetas compartido.

## Entidades reutilizadas del motor

### `Temporada` (engine, sin cambios)

Resultado de un año de carrera. Es lo que consume la pantalla de resultado.

| Campo | Tipo | Notas |
|---|---|---|
| `ano` | `number` | Año de la temporada |
| `fase` | `FaseCOAC` | `preliminares` \| `cuartos` \| `semifinales` \| `final` |
| `puesto?` | `number` | Opcional; puede faltar |
| `premios` | `Premio[]` | `{ tipo: PremioTipo; ano: number }[]` — distinciones del año |
| `fueraDeConcurso` | `boolean` | Cuando no se concursó |

## Tipos de presentación (nuevos o ampliados)

### `Indicador` (ampliado, `presentacion.ts`)

Etiqueta del overlay de contexto.

| Campo | Tipo | Notas |
|---|---|---|
| `ano` | `number` | Año en curso mostrado |
| `momento` | `Momento \| "resultado"` | `verano` \| `febrero` en decisiones; `resultado` en el cierre del año |

**Regla**: `etiquetaMomento` mapea `resultado → "Resultado"`; el resto sin cambios.

### `ROSETAS` (nuevo, `presentacion.ts`)

Mapa compartido del asset de cada distinción.

| Clave (`PremioTipo`) | Valor |
|---|---|
| `copla_para_andalucia` | `/rosetas/roseta_andalucia.svg` |
| `aguja_de_oro` | `/rosetas/roseta_aguja_oro.svg` |
| `candela_y_espino` | `/rosetas/roseta_candela.svg` |

**Regla**: lo consumen `Resultado.svelte` (fila de distinciones) y `Tarjeta.svelte` (palmarés); no se duplica.

### `OpcionesJuego.resultadoInicial` (ampliado, `estado.svelte.ts`)

Arranque dev de la isla en la pantalla de resultado, sin partida.

| Campo | Tipo | Notas |
|---|---|---|
| `temporada` | `Temporada` | Resultado de ejemplo |
| `ano` | `number` | Año para `data-ano` y el indicador cuando no hay partida |

**Regla**: si llega, `pantalla = "resultado"` y `paso = { tipo: "resultado", temporada }`; `partida = null`.

### `ArranqueDev` (nuevo, `dev/arranque.ts`)

Resultado de interpretar la query `dev=`.

| Variante | Campos | Origen |
|---|---|---|
| `fin` | `tarjeta: TarjetaFinal`, `momento: Momento` | `dev/fixturesFin.ts` (existente) |
| `resultado` | `temporada: Temporada`, `ano: number`, `momento: Momento` | `dev/fixturesResultado.ts` |

**Regla**: `dev` ausente o desconocido → `null`. `dev=resultado` sin `caso` → caso por defecto. `caso` desconocido → caso por defecto.

## Casos de ejemplo del modo dev (`fixturesResultado.ts`)

| Caso | Fase | Puesto | Distinciones | Fuera de concurso |
|---|---|---|---|---|
| `campeon` (por defecto) | final | 1 | Coplas por Andalucía | no |
| `podio` | final | 2 | — | no |
| `finalista` | final | 5 | — | no |
| `preliminares` | preliminares | 30 | — | no |
| `sin-premios` | cuartos | 12 | — | no |
| `fuera-de-concurso` | preliminares | — | — | sí |
| `distinciones` | semifinales | 7 | Aguja de oro + Candela y espino | no |
| `todas` | final | 4 | Aguja de oro + Coplas por Andalucía + Candela y espino | no |

Cada caso se compone sobre un `Temporada` literal válido. El año del caso se declara en el propio arranque (`ano`).

## Presentación en la pantalla (panel de creación)

| Zona | Contenido | Notas |
|---|---|---|
| Panel | Superficie, borde, sombra, etiquetas en mayúsculas | Tema oscuro por defecto; sin cabecera centrada |
| Llegada | «Has llegado a» / «Te has quedado en» | Preliminares usa «Te has quedado en» |
| Fase | Fase alcanzada en tipografía display | — |
| Puesto | `puesto N` (si existe) | Acento del tema |
| Distinciones | Una **fila** en orden fijo (aguja, candela y coplas al final); cada una con **roseta encima** y **nombre debajo**, en texto sutil del color de su roseta, sin card | Máx. una por tipo y año |
| Acción | Botón «Continuar» **dentro del panel** | En dev, inerte |

## Reglas de validación

- **V-01**: todo caso debe ser un `Temporada` con `fase` válida y `premios` con `tipo` válido.
- **V-02**: un caso conocido debe estar en la lista; uno desconocido cae al de por defecto.
- **V-03**: `ROSETAS` debe cubrir los tres `PremioTipo`.
- **V-04**: el modo dev no debe escribir en `localStorage` ni reutilizar partidas guardadas.
- **V-05**: en dev sin partida, `continuar()` debe seguir siendo inerte.
- **V-06**: una temporada no repite el mismo `tipo` de distinción en el mismo año.

## Transiciones de estado

Sin cambios en las transiciones del motor. La única transición afectada es la de la isla al arrancar:

```text
URL dev=fin        → pantalla "fin"       (partida null, tarjeta fixture)
URL dev=resultado  → pantalla "resultado" (partida null, paso resultado fixture)
URL normal         → flujo actual (reanudar | crear-personaje)
```

En la pantalla de resultado real, «Continuar» sigue llamando a `continuar()` y avanza al siguiente paso como hoy.
