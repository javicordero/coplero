# Phase 1 — Data Model: Cambios de trayectoria (modalidad y variante)

Convenciones: todo es TypeScript puro, serializable y sin clases. `engine` no importa de `content` ni de `web`.

## Entidades

### Trayectoria

Recorrido de la carrera en cuanto a modalidad y variante.

| Campo | Tipo | Reglas |
|---|---|---|
| `modalidadInicial` | `Modalidad` | Obligatorio. Modalidad con la que se creó la partida. |
| `varianteInicial` | `VarianteId` | Obligatorio. Variante con la que se creó la partida. |
| `cambios` | `CambioTrayectoria[]` | Puede estar vacío. Ordenado por año ascendente (y por orden de aplicación dentro del mismo año). |

**Invariante**: si `cambios` no está vacío, la última entrada coincide con `Partida.modalidad` y `Partida.variante`.

### CambioTrayectoria

Estado resultante tras un cambio, con su año.

| Campo | Tipo | Reglas |
|---|---|---|
| `ano` | `number` | Año en que se aplicó el cambio. |
| `modalidad` | `Modalidad` | Modalidad vigente tras el cambio. |
| `variante` | `VarianteId` | Variante vigente tras el cambio. Debe pertenecer a `modalidad`. |

### Elección de nueva variante (paso de UI)

No es una entidad persistida: es un **paso** transitorio del motor entre la decisión de verano y la de febrero.

| Campo | Tipo | Reglas |
|---|---|---|
| `tipo` | `"variante"` | Literal del discriminante `Paso`. |
| `modalidad` | `Modalidad` | Modalidad vigente (la nueva) de la que se ofrecen variantes. |

## Extensiones a entidades existentes

### `Partida` (engine/types.ts)

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `trayectoria` | `Trayectoria` | Obligatorio. Se inicializa en `crearPartida` con los valores iniciales y `cambios: []`. |

`Partida.modalidad` y `Partida.variante` siguen existiendo como valores vigentes.

### `Opcion` (engine/types.ts y content/schema.ts)

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `cambiaModalidad` | `Modalidad?` | Si al elegir la opción difiere de la vigente, cambia la modalidad y abre el paso de variante. Solo válido en situaciones de verano (validado en tests de integridad). |
| `cambiaVariante` | `VarianteId?` | Si al elegir la opción difiere de la vigente, cambia la variante y registra el cambio. Debe pertenecer a la modalidad vigente. |

Nota: si una opción declara `cambiaModalidad`, debe declarar también la variante objetivo mediante el paso de elección (no se admite `cambiaVariante` simultáneo con `cambiaModalidad`). Se valida en integridad.

### `Situacion` (engine/types.ts y content/schema.ts)

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `peso` | `number?` | Peso relativo para la selección. Ausente = 1. Debe ser > 0. |

### `BancoContenido` (engine/types.ts y content/schema.ts)

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `variantes` | `{ id: VarianteId; modalidad: Modalidad }[]?` | Catálogo de variantes válidas, para que el motor valide la elección sin importar `content`. |

### `FasePartida` (engine/types.ts)

| Valor nuevo | Significado |
|---|---|
| `"variante"` | La partida está esperando la elección de la nueva variante tras un cambio de modalidad. |

### `Paso` (engine/types.ts)

| Variante nueva | Significado |
|---|---|
| `{ tipo: "variante"; modalidad: Modalidad }` | La UI debe ofrecer las variantes de `modalidad`. |

### `ErrorMotor` (engine/types.ts)

| Código nuevo | Significado |
|---|---|
| `VARIANTE_INVALIDA` (`varianteId`) | La variante elegida no existe o no pertenece a la modalidad vigente. |

### `ResumenCarrera` (engine/types.ts) y `construirResumen`

| Campo nuevo | Tipo | Reglas |
|---|---|---|
| `trayectoria` | `Trayectoria` | Se copia de `Partida`. Permite a la tarjeta final (007) narrar la evolución sin leer `destino`. |

## Máquina de estados (flujo del motor)

```text
decision (verano)
   ├─ opción normal ─────────────────────────────► decision (febrero, resultadoPendiente fijado)
   └─ opción cambia modalidad
        ├─ Partida.modalidad = nueva
        └─ fase = "variante"  ──► Paso { tipo: "variante", modalidad: nueva }
                                    └─ elegirVarianteDeCambio
                                         ├─ valida pertenencia (si no → VARIANTE_INVALIDA)
                                         ├─ Partida.variante = elegida
                                         ├─ trayectoria.cambios += { ano, modalidad, variante }
                                         └─ fase = "decision"  ──► decision (febrero)

decisión con opción cambiaVariante
   └─ Partida.variante = nueva (pertenece a la modalidad vigente)
      trayectoria.cambios += { ano, modalidad vigente, variante nueva }
```

## Reglas de validación

1. Toda `Situacion`/`Condicional` debe declarar `momento` (ya existente). *(El `tipo`/`categoria` se retiraron el 2026-10-04.)*
2. `peso`, si existe, MUST ser un número > 0.
3. `cambiaModalidad`, si existe, MUST ser una modalidad válida y distinta de la vigente en la situación que la declara (validado en integridad por contexto de modalidad).
4. `cambiaModalidad` MUST NOT aparecer en situaciones de febrero.
5. `cambiaVariante`, si existe, MUST ser un id del catálogo y pertenecer a la modalidad de la situación.
6. Una opción MUST NOT declarar `cambiaModalidad` y `cambiaVariante` a la vez.
7. Los filtros `variantes` de una situación MUST referenciar ids del catálogo y pertenecer a las `modalidades` declaradas (o a cualquier modalidad si no declara `modalidades`).
8. La trayectoria MUST NOT contener nunca datos de `destino` (techo, suelo, año pico, volatilidad, carisma, milagro).
9. La trayectoria MUST ser determinista: mismas decisiones ⇒ misma trayectoria.

## Impacto en persistencia

- `Partida.version` pasa a 2 (`VERSION_PARTIDA`), porque la forma del estado cambia.
- El sobre de guardado (`VERSION_GUARDADO` = 1) no cambia: sigue distinguiendo el formato del contenedor.
- Un guardado con `Partida.version` 1 se descarta con el aviso puntual ya implementado en 005 (sin migración).
- La trayectoria viaja dentro de la `Partida` serializada; no hay campos transitorios fuera del estado (`fase = "variante"` es parte del estado, así que un guardado a mitad de elección se restaura correctamente y vuelve a pedir la variante).
