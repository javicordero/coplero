# Contrato · Consumo de flags por condicional

**Módulos**: `src/engine/condicionales.ts`, `src/engine/selector.ts`, `src/engine/partida.ts`

Contrato de comportamiento del consumo. Es un cambio de reglas del motor: no hay endpoints nuevos.

## Funciones

| Función | Firma | Comportamiento |
|---|---|---|
| `requisitoCumplido` | `(req: Requisito, estado: { flags; atributos; temporadas }, consumidor?: string) => boolean` | `flag`/`flagRepetida` devuelven `false` si `consumidor` está en `flag.consumidaPor`. Los compuestos (`todas`/`alguna`/`ninguna`) propagan `consumidor` a sus hijos. |
| `consumirFlagsDeRequisito` | `(flags: Record<string, Flag>, req: Requisito, condicionalId: string) => Record<string, Flag>` | Devuelve una copia con `condicionalId` añadido a `consumidaPor` de las flags **referenciadas por `req` que existan** en `flags`. Nunca borra flags. No duplica el id. |
| `actualizarFlags` | `(flags, opcion, ano) => Record<string, Flag>` | Registra las flags de `opcion.flags` (acumula `veces`/`anosConsecutivos`); ya **no** procesa `consume`. Al crear una flag, `consumidaPor: []`; al re-ganar, conserva `consumidaPor`. |

## Selección (`selector.ts`)

Al filtrar condicionales, se evalúa `requisitoCumplido(c.requiere, p, c.id)`: el condicional `c` no
"ve" las flags que él mismo ya consumió. La ventana (`dentroDeVentana`) no cambia.

## Resolución (`partida.ts`)

Al elegir la opción de un condicional, tras registrar las flags de la opción, se llama
**siempre** (ya no depende de un flag `consumeFlag`):

```
flags = consumirFlagsDeRequisito(flags, situacion.requiere, situacion.id)
```

## Garantías

- **Un condicional, una vez**: un condicional que se dispara no vuelve a cumplir su requisito por las
  flags que consumió → no reaparece (FR-001).
- **Flags compartidas intactas**: consumir para `c` no afecta a `d` (FR-002).
- **Solo flags activas**: si una flag referenciada no existe, no se toca (FR-003); `ninguna` no consume
  (FR-004); sin flags, nada (FR-005).
- **No se borran**: `consumirFlagsDeRequisito` solo añade a `consumidaPor`; la flag permanece (FR-009).
- **Determinismo**: todo es función pura del estado; misma seed + decisiones → misma partida.

## Versión del estado

- `VERSION_PARTIDA = 3`. `serializar`/`deserializar` rechazan cualquier versión distinta con
  `VERSION_INCOMPATIBLE` (FR-010). El código compartible (`VERSION_CODIGO`) **no** cambia: la tarjeta no
  incluye flags (FR-012).

## Campos retirados

- `Opcion.consume` y `Condicional.consumeFlag` desaparecen del esquema de contenido (FR-006/FR-007) y,
  por tanto, del banco validado (FR-008).

## Tests que fijan el contrato

- `engine/__tests__/condicionales.test.ts`: consumo por condicional; flag compartida; `alguna` consume
  solo la activa; `ninguna` no consume; re-ganar conserva `consumidaPor`.
- `engine/__tests__/serializacion.test.ts`: `VERSION_PARTIDA === 3`; round-trip; rechazo de versión.
- `engine/__tests__/snapshot.test.ts`: snapshot regenerado.
- `simulacion/__tests__/auditoria.test.ts`: `flagConsumidaSinRegistro` con `consumidaPor`.
- `content/__tests__/integridad.test.ts`: sin la comprobación de `consume`.
