# Data Model: Simulación masiva del motor

**Feature**: `002-massive-simulation` | **Date**: 2026-09-18

Todos los tipos son **serializables y sin clases**, en TypeScript puro. El informe completo debe poder
volcarse a JSON (FR-025).

## Entidades

### PerfilJugador (no serializable; se identifica por `id`)

Estrategia automática de decisión.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | `"aleatorio" \| "codicioso" \| "erratico"` |
| `descripcion` | `string` | Texto para el informe |
| `elegir` | `(contexto: ContextoDecision) => string` | Devuelve el `opcionId` elegido; determinista vía RNG del perfil |

Reglas:
- MUST ser determinista: mismo contexto → misma opción (FR-022).
- MUST elegir siempre un `id` presente en `paso.situacion.opciones`.
- Los tres perfiles por defecto son los de FR-005.

### ContextoDecision (entrada de `PerfilJugador.elegir`)

| Campo | Tipo | Descripción |
|---|---|---|
| `paso` | `Extract<Paso, { tipo: "decision" }>` | Situación y opciones servidas por el motor |
| `partida` | `Partida` | Estado actual (solo lectura; el perfil no lo muta) |
| `rng` | `() => number` | RNG del perfil, derivado de `rngPara(seed, "jugador", perfilId, …)` |

### ConfiguracionPartida

Combinación inicial de una carrera.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador estable para el informe |
| `modalidad` | `Modalidad` | `comparsista \| chirigotero` |
| `variante` | `VarianteId` | variante declarada en el catálogo |
| `genero` | `Genero` | `masculino \| femenino \| no_binario` |
| `localidad` | `string` | Localidad del personaje |
| `edad` | `number` | Edad inicial (entero positivo) |

Reglas:
- El catálogo por defecto MUST cubrir las dos modalidades (FR-005).
- `variante` provisional: se toma del catálogo declarado hasta que exista el banco real de `content`.

### OpcionesSimulacion (entrada de `simular`)

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `banco` | `BancoContenido` | sí | Banco inyectado (FR sin dependencia de banco concreto) |
| `n` | `number` | sí | Número de carreras (entero > 0) |
| `seedBase` | `string` | sí | Base de las seeds; `seed = <seedBase>-<i>` (FR-004) |
| `perfiles` | `PerfilJugador[]` | no | Por defecto, los tres de FR-005 |
| `configuraciones` | `ConfiguracionPartida[]` | no | Por defecto, catálogo declarado |
| `parametros` | `Partial<ParametrosMotor>` | no | Inyectables SOLO para experimentos; el CLI no los cambia (FR-020) |

Validación:
- `n` MUST ser entero positivo y como máximo 100.000 (FR-003).
- `perfiles` y `configuraciones` MUST tener al menos un elemento.

### RegistroCarrera (interno; base de la agregación y auditoría)

| Campo | Tipo | Descripción |
|---|---|---|
| `seed` | `string` | Seed de la carrera |
| `perfilId` | `string` | Perfil usado |
| `configuracionId` | `string` | Configuración usada |
| `mejorFase` | `FaseCOAC` | Mejor fase concursada (FR-011) |
| `participo` | `boolean` | `false` si nunca concursó |
| `duracion` | `number` | Nº de temporadas (FR-014) |
| `primerosPremios` | `number` | Temporadas con `fase === "final"` y `puesto === 1` (FR-012) |
| `premios` | `Premio[]` | Premios ajenos de toda la carrera (FR-013) |
| `atributosFinales` | `Atributos` | Estado final por atributo (FR-018) |
| `anoPico` | `number` | `partida.destino.anoPico` (dato interno; FR-015) |
| `situacionesVistas` | `string[]` | Ids servidos en los pasos de decisión (FR-016/017) |
| `errores` | `ErrorAgregable[]` | Errores de motor/contenido de esta carrera (FR-027) |
| `hallazgos` | `HallazgoEstadoImposible[]` | Estados imposibles detectados (FR-019) |

### InformeSimulacion (salida de `simular`)

| Campo | Tipo | Descripción |
|---|---|---|
| `meta` | `{ n, seedBase, perfiles, configuraciones, generadoConError, usoInterno }` | Metadatos de la corrida; `usoInterno` siempre `true` (FR-026) |
| `fases` | `{ pisanFinal, noSuperanCuartos, noSuperanPreliminares, distribucion }` | FR-008/009/010/011 |
| `premios` | `{ mediaPrimerosPremios, porTipo, carrerasConPremio }` | FR-012/013 |
| `duracionMedia` | `number` | FR-014 |
| `anosPico` | `Distribucion<number>` | FR-015 (dato interno, solo diagnóstico) |
| `situaciones` | `{ ranking, nuncaVistas }` | FR-016: `ranking` = top 10 más frecuentes y top 10 menos frecuentes (con recuento y %) |
| `condicionales` | `{ disparados, nuncaDisparados }` | FR-017 |
| `atributos` | `Record<Atributo, { min, max, media }>` | FR-018 |
| `estadosImposibles` | `HallazgoEstadoImposible[]` | FR-019 |
| `porPerfil` | `Record<string, MetricasAgregadas>` | FR-028 |
| `porConfiguracion` | `Record<string, MetricasPrincipales>` | FR-028 (mejor fase, premios, duración) |
| `errores` | `ErrorAgregable[]` | FR-027 |

Reglas:
- `generadoConError` MUST ser `true` si `errores` no está vacío (determina el código de salida ≠ 0).
- El informe MUST NOT incluir datos del jugador final (nombre del personaje) ni exponerse en producto dirigido al jugador (FR-026).

### MetricasAgregadas

Subconjunto reutilizable para `porPerfil`: fases (pisan final, no superan cuartos, no superan
preliminares, distribución), media de primeros premios, distribución de premios y duración media.

### MetricasPrincipales (para `porConfiguracion`)

Solo mejor fase (distribución + pisan final), premios (media de primeros premios y carreras con premio)
y duración media.

### Distribucion<T>

`Record<string, { n: number; pct: number }>` — recuento y porcentaje por clave, ordenada de mayor a menor.

### HallazgoEstadoImposible

| Campo | Tipo | Descripción |
|---|---|---|
| `regla` | `ReglaEstadoImposible` | Una de las del catálogo FR-019 |
| `seed` | `string` | Carrera donde se detectó |
| `perfilId` | `string` | Perfil de esa carrera |
| `detalle` | `string` | Descripción localizable (p. ej. `premio:aguja_de_oro,ano:5`) |

`ReglaEstadoImposible` (catálogo FR-019, ampliable): `premioSinConcurso`, `temporadasExcedidas`,
`mejorFaseIncoherente`, `flagConsumidaSinRegistro`, `atributoFueraDeRango`, `puestoIncoherente`,
`temporadasDesordenadas`, `premioAnoInexistente`, `finIncoherente` (estado `fin` con
`resultadoPendiente` no nulo, `decisionesTomadasAno` incompletas o número de temporadas distinto de la
duración esperada), `modalidadVarianteInvalida`, `faseEnNoConcurso`, `composicionAnualIncorrecta`,
`saltaCOACIncoherente`.

### ErrorAgregable

| Campo | Tipo | Descripción |
|---|---|---|
| `codigo` | `string` | Código del `ErrorMotor` o `"EXCEPCION"` |
| `n` | `number` | Número de veces que ocurrió |

## Diagrama de relaciones

```text
OpcionesSimulacion ──(banco)──> BancoContenido (engine)
        │
        ├── perfiles: PerfilJugador[]
        └── configuraciones: ConfiguracionPartida[]
                │
          (N veces, reparto D4)
                ▼
          RegistroCarrera ──> InformeSimulacion.agregado
                │                    ├── porPerfil
                │                    ├── porConfiguracion
                │                    └── estadosImposibles
                └── hallazgos ───────┘
```

## Transiciones de estado

La carrera simulada reutiliza el ciclo del motor: `creacion → decision (verano/febrero) → coac →
resultado → ... → fin`. El simulador no altera ese ciclo; solo sirve opciones al motor mediante
`elegir` y avanza con `continuar` hasta `Paso.fin`.
