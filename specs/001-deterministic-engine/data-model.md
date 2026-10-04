# Data Model: Motor determinista de Coplero (ENGINE-001)

Fase 1. Modelo de datos del `engine`. Tipos TS puros, serializables y sin clases. Referencias:
`docs/02` §7, spec `FR-001`–`FR-024` y clarificaciones Q1–Q5.

## Convenciones

- **Serialización**: JSON plano. `Partida.version` entero (actual `1`). Sin funciones ni clases.
- **Glosario**: «año» = «temporada» = una iteración anual con decisión de verano, decisión de febrero y resolución del COAC. «carrera» = secuencia de temporadas hasta la retirada.
- **Año base**: `ANO_BASE` es una constante fija; `anoInicio` la usa por defecto y nunca se deriva del reloj.
- **Ids**: strings estables y únicos por banco (validados por Zod en `content`). El motor no los genera.
- **Inmutabilidad**: cada transición devuelve un objeto nuevo (D12).
- **Rangos**: atributos acotados a `[0, 100]`.
- **Azar**: nunca global; siempre `rngPara(seed, contexto)` (D1, D2).

## Tipos base

### `Atributo` / `Atributos`
- `Atributo = 'letra' | 'musica' | 'puestaEnEscena' | 'popularidad' | 'cohesion' | 'dinero'`.
- `Atributos = Record<Atributo, number>`, entero `0..100` con clamp (`FR-008`).

### `Momento`
- `Momento = 'verano' | 'febrero'`.

> `TipoDecision` y `Categoria` se **retiraron** el 2026-10-04 (el motor selecciona por momento, sin reparto por tipo ni etiqueta de categoría).

### `Genero`, `Modalidad`, `VarianteId`
- `Genero = 'masculino' | 'femenino' | 'no_binario'` → título dinámico Coplero/Coplera/Coplere.
- `Modalidad = 'comparsista' | 'chirigotero'` (v1).
- `VarianteId = string` acotado por modalidad en `content`; en esta feature solo se registra.

## Banco de contenido (inyectado, no serializado — `FR-022`, D3)

### `BancoContenido`
- `situaciones: Situacion[]` — pool base.
- `condicionales: Condicional[]` — pool condicional.
- `modalidades?: Modalidad[]` y metadatos opcionales asociados al banco.

### `Opcion`
| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | único dentro de la situación |
| `titulo` | string | — |
| `subtitulo` | string | — |
| `efectos` | `Partial<Atributos>` | se aplican con clamp (`FR-008`) |
| `flags` | `string[]?` | flags que deja (`FR-009`) |
| `peso` | number? | peso para la selección/balance |
| `saltaCOAC` | boolean? | la temporada no resuelve COAC (`FR-017`) |

### `Situacion`
| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | único global |
| `momento` | `Momento` | obligatorio (`FR-005`) |
| `titulo`, `texto` | string | — |
| `opciones` | `[Opcion, Opcion, Opcion?]` | 2 o 3 |
| `modalidades` | `Modalidad[]?` | filtro opcional (ausente = común) |
| `variantes` | `VarianteId[]?` | filtro opcional |
| `minAno` | number? | año mínimo de aparición |
| `unicaVez` | boolean? | por defecto `true` |

> `requiereFase` se **excluye** de esta feature por la clarificación Q5 (las decisiones no dependen de la fase).
>
> El filtro `variantes` se evalúa contra la variante actual; como en ENGINE-001 la variante no cambia, una
> situación cuyos `variantes` no incluyan la variante inicial solo puede aparecer mediante la degradación B→D;
> la validación de integridad decide la inalcanzabilidad considerando esa degradación (`FR-006`, `FR-018`).

### `Condicional extends Situacion`
| Campo extra | Tipo | Reglas |
|---|---|---|
| `requiere` | `Requisito` | árbol lógico (`FR-007`) |
| `ventanaAnos` | number | años desde la activación de la flag |
| `probabilidad` | number | `0..1`, tirada anual |
| `prioridad` | number? | orden si compiten varias |

### `Requisito` (árbol)
- `{ tipo: 'flag'; flag }`
- `{ tipo: 'flagRepetida'; flag; veces; consecutivos? }`
- `{ tipo: 'faseAlcanzada'; fase }` — dentro de la misma partida (`FR-007`, T1)
- `{ tipo: 'todas' | 'alguna' | 'ninguna'; de: Requisito[] }`
- `{ tipo: 'atributo'; atributo; min?; max? }`

## Estado de la partida (serializable)

### `Personaje`
- `nombre: string` (texto libre ya saneado por el consumidor), `edad: number` (18-99), `localidad: string`, `genero: Genero`.

### `Flag`
- `ano: number` — año de activación.
- `veces: number` — nº de activaciones.
- `consumidaPor: string[]` — ids de los condicionales que la han consumido; desactiva el disparo **solo para esos** condicionales; permanece en el historial (`FR-009`, revisado 2026-10-05).

### `Destino` (oculto — nunca se expone, `FR-002`)
- `techo: FaseCOAC`, `suelo: FaseCOAC`, `anoPico: number`, `anosCarrera: number`,
  `volatilidad: number` (`0..1`), `carisma: number`.
- Generado al crear la partida desde la semilla + modificadores provisionales de creación.

### `Temporada`
- `ano: number`, `fase: FaseCOAC`, `puesto?: number`, `premios: Premio[]`, `fueraDeConcurso: boolean`.
- `FaseCOAC = 'preliminares' | 'cuartos' | 'semifinales' | 'final'`.
- Bandas de `puesto` (Q2/D6): final 1-4; semifinal 5-10; cuartos 11-16; preliminares ≥17.

### `Premio`
- `tipo: 'copla_para_andalucia' | 'aguja_de_oro' | 'candela_y_espino'`, `ano: number`.

### `EventoHistorial`
- `ano: number`, `momento: Momento`, `tipo: 'decision' | 'resultado' | 'hito'`,
  `situacionId?: string`, `opcionId?: string`, `descripcion: string`.

### `Partida` (GameState)
| Campo | Tipo | Reglas |
|---|---|---|
| `version` | `1` | versión de esquema (`FR-003`) |
| `seed` | string | semilla de partida |
| `personaje` | `Personaje` | — |
| `modalidad` | `Modalidad` | — |
| `variante` | `VarianteId` | solo se registra (Q3-C) |
| `anoInicio`, `anoActual` | number | — |
| `momento` | `Momento` | momento pendiente |
| `fase` | `FasePartida` | `'creacion' \| 'decision' \| 'coac' \| 'fin'` |
| `atributos` | `Atributos` | `0..100` |
| `flags` | `Record<string, Flag>` | nunca se borran |
| `vistas` | `string[]` | ids de situaciones ya mostradas |
| `historial` | `EventoHistorial[]` | cronología |
| `temporadas` | `Temporada[]` | resultado por año |
| `premios` | `Premio[]` | acumulado |
| `decisionsPorAno` | number | parametrizable, por defecto 2 (`FR-016`) |
| `contador` | number | contador determinista de contexto |
| `destino` | `Destino` | **interno**, no se serializa en el código compartible |

> El banco **no** forma parte de `Partida` (D3). `destino` se omite al construir el resumen compartible.

## Parámetros configurables (`ParametrosMotor`, provisionales — `FR-021`, Q2-A)

Todos con valores por defecto provisionales, inyectables y sustituibles sin tocar el motor:
- `pesosDestino` (techo ponderado), `generacionSuelo`, `generacionAnoPico`, `generacionVolatilidad`, `carismaBase`.
- `puntuacion` (pesos de atributos), `ruido`, `bonoAnoPico`.
- `umbralesFase` (`faseSegunPuntuacion`), `batacazo` (0,03), `milagro` (0,02).
- `premios`: definiciones por premio `{ umbralPuesto, pesosAtributos, flagsAfinidad }` con desempate determinista.
- `modificadoresCreacion` (edad, localidad).
- `puesto` (mapeo banda → posición).
- `anosCarreraPorDefecto` (20) y `decisionesPorAno` (2).

## Transiciones de estado

```text
creacion --(personaje+modalidad+variante)--> decision(momento=verano)
decision(verano) --elegir--> decision(momento=febrero)   # efectos de verano aplicados
decision(febrero) --elegir--> coac                        # efectos de febrero aplicados (para el futuro)
coac --resolver--> fin | decision(verano del año siguiente)  # temporada y premios persistidos y expuestos
fin --resumen--> (resumen mínimo)
```

Reglas de transición:
- El resultado de la temporada se calcula al entrar en `coac`, con el **snapshot posterior a verano y
  previo a la decisión de febrero** (`FR-024`, D10), y se expone después de la decisión de febrero.
- Cada año: exactamente una situación de verano y una de febrero (`FR-006`); las ranuras son fijas
  (D5). Una opción `saltaCOAC` consume la decisión de su momento sin romper el reparto anual (`FR-017`).
- `saltaCOAC`: la temporada pasa a `fueraDeConcurso`, sin fase ni premios (`FR-017`).
- La retirada se evalúa al cierre del año (tras `coac`): si se alcanzan los años de carrera,
  `fase = 'fin'`; no hay retirada a mitad de año (`FR-020`).

## Validaciones (trazabilidad)

| Regla | Requisito |
|---|---|
| Atributos `0..100` con clamp | FR-008, SC-006 |
| Una decisión de contenido + una de personaje por año | FR-006, SC-006 |
| `momento` filtrado (verano ≠ febrero) | FR-005, FR-006 |
| Flags persistentes; consumo no borra; ventana | FR-009 |
| Batacazo atraviesa `suelo`; milagro rompe techo una vez | FR-010 |
| Sin premios fuera de concurso | FR-011 |
| `puesto` por banda + posición | FR-012, FR-023 |
| Versión incompatible → error explícito | FR-003 |
| Opción inválida → error explícito | FR-015 |
| No candidatas → degradación B→D → error si persiste | FR-018 |
