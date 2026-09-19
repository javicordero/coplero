# Data Model: Versión mínima jugable (/jugar)

Modelo de la capa de presentación. La partida completa (atributos, flags, temporadas…) vive en el motor (`Partida`); aquí solo se describe lo que la UI mantiene y muestra.

## Entidad: `EstadoJuego`

Estado reactivo de la isla (fábrica `crearJuego()`).

| Campo | Tipo | Regla |
|---|---|---|
| `pantalla` | `Pantalla` | Pantalla actual (ver máquina de estados). |
| `partida` | `Partida \| null` | Partida del motor; `null` antes de crearla. |
| `paso` | `Paso \| null` | Último paso devuelto por el motor. |
| `resumen` | `ResumenCarrera \| null` | Resumen al terminar la carrera. |
| `error` | `ErrorMotor \| null` | Error legible si el motor lo devuelve. |
| `aviso` | `string \| null` | Aviso no bloqueante (p. ej. guardado descartado). |

### Acciones (todas delegan en el motor)

| Acción | Efecto |
|---|---|
| `empezar()` | Pasa de `intro` a `crear-personaje`. |
| `crearPersonaje(datos)` | Genera semilla, llama a `crearPartida`, avanza a `modalidad`. |
| `elegirModalidad(modalidad)` | Guarda la modalidad, avanza a `variante`. |
| `elegirVariante(variante)` | Fija la variante y arranca la carrera (primer `siguientePaso`). |
| `elegirOpcion(opcionId)` | Llama a `elegir`; recalcula el paso. |
| `continuar()` | Llama a `continuar` tras un resultado; recalcula el paso. |
| `reiniciar()` | Descarta el guardado y vuelve a `intro`. |
| `continuarPartida()` | Retoma el guardado y recalcula el paso. |

## Entidad: `DatosCreacion`

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | `string` | Normalizado (trim + colapsar espacios), `1..24` caracteres. |
| `edad` | `number` | Entero dentro del rango presentado. |
| `localidad` | `string` | No vacío; opción predefinida o texto corto. |
| `genero` | `Genero` | `masculino`, `femenino` o `no_binario`. |

## Entidad: `Variante` (datos en `src/content/variantes.ts`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `VarianteId` | Único. |
| `modalidad` | `Modalidad` | A la que pertenece. |
| `titulo` | `string` | No vacío. |
| `subtitulo` | `string` | No vacío. |

Catálogo documentado (`docs/01` §2): comparsista → clásico, nueva escuela, evolución con raíces; chirigotero → lolosedismo, clásico, interpretar el personaje.

## Entidad: `Guardado`

| Campo | Tipo | Regla |
|---|---|---|
| `version` | `number` | Igual a `VERSION_PARTIDA`; si no, se descarta con aviso. |
| `partida` | `string` | `serializar(partida)` del motor. |

Clave de almacenamiento: `coplero:partida`.

## Máquina de estados de pantallas (`Pantalla`)

```text
intro ──empezar──▶ crear-personaje ──crearPersonaje──▶ modalidad ──elegirModalidad──▶ variante
variante ──elegirVariante──▶ [ciclo de carrera]
     │
     ├─ paso.tipo = "decision"  ──elegirOpcion──▶ (mismo ciclo) ──▶ decision
     ├─ paso.tipo = "resultado" ──continuar────▶ resultado ──continuar──▶ (decision | fin)
     ├─ paso.tipo = "fin"       ─────────────▶ fin
     └─ paso.tipo = "error"     ─────────────▶ error ──reiniciar──▶ intro

fin ──reiniciar──▶ intro
```

Reglas:

- `decision` solo es alcanzable con un `Paso` de tipo `decision` (nunca se muestra una decisión ya resuelta).
- `resultado` solo tras la decisión de febrero (una vez por año).
- `fin` requiere `resumen` no nulo.
- `error` se recupera con `reiniciar` (nunca deja la isla bloqueada).

## Datos que se muestran por pantalla

| Pantalla | Datos |
|---|---|
| `Intro` | Título del juego, texto de bienvenida, botón empezar o continuar. |
| `CrearPersonaje` | Título dinámico por género; campos nombre, edad, localidad, género. |
| `ElegirModalidad` | Modalidades con título y subtítulo. |
| `ElegirVariante` | Variantes de la modalidad, con título y subtítulo. |
| `Decision` | Indicador (año, momento, tipo), enunciado, opciones (título, subtítulo). |
| `Resultado` | Indicador, fase alcanzada, puesto, premios del año. |
| `FinCarrera` | Nombre, modalidad, variante, años en activo, mejor fase, premios. |
| `Error` | Mensaje legible y acción de reinicio. |
