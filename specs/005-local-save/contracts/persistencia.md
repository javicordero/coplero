# Contract: módulo de persistencia (`src/juego/persistencia.ts`)

Contrato interno de la capa de guardado local. Es la única puerta al `localStorage`; el resto de la isla depende de esta interfaz, no del almacenamiento concreto.

## Tipos

```ts
interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

interface ContenidoGuardado {
  version: number
  partida: string
}

type EstadoGuardado = "ninguno" | "en-curso" | "terminada"

interface ResultadoCarga {
  partida: Partida | null
  descartado: boolean
}
```

## Constantes

| Nombre | Valor | Descripción |
|---|---|---|
| `CLAVE_GUARDADO` | `"coplero:partida"` | Clave única en el almacén |
| `VERSION_GUARDADO` | `1` | Versión del formato del sobre |

## Operaciones

### `guardar(almacen, partida): void`

- **Entrada**: almacén y `Partida` del `engine`.
- **Efecto**: escribe `JSON.stringify({ version: VERSION_GUARDADO, partida: serializar(partida) })` en `CLAVE_GUARDADO`.
- **Postcondiciones**: no lanza nunca; si el almacén falla (cuota, permiso, no-op) se ignora en silencio.
- **Requisitos**: FR-001, FR-002, FR-005.

### `cargar(almacen): ResultadoCarga`

- **Comportamiento** (en orden):
  1. Sin sobre ⇒ `{ partida: null, descartado: false }`.
  2. JSON inválido ⇒ eliminar sobre, `{ partida: null, descartado: true }`.
  3. `version` ausente, no numérica o ≠ `VERSION_GUARDADO` ⇒ eliminar sobre, `descartado: true`.
  4. `partida` no es `string` ⇒ eliminar sobre, `descartado: true`.
  5. `deserializar(partida)` falla (`VERSION_INCOMPATIBLE` o datos inválidos) ⇒ eliminar sobre, `descartado: true`.
  6. Correcto ⇒ `{ partida, descartado: false }`.
- **Postcondiciones**: no lanza nunca; un `descartado: true` implica que el sobre ya no está en el almacén (aviso puntual, Q3-A).
- **Requisitos**: FR-003, FR-004, FR-006, FR-007, FR-008.

### `borrar(almacen): void`

- Elimina el sobre. Idempotente. No lanza. → FR-009, FR-010.

### `estadoGuardado(partida): EstadoGuardado`

- `null` ⇒ `"ninguno"`; `partida.fase === "fin"` ⇒ `"terminada"`; otro caso ⇒ `"en-curso"`. → FR-016.

### `almacenNavegador(): Almacen`

- **Comportamiento**: si existe `localStorage`, escribe y borra una clave de prueba (`try/catch`); si funciona, devuelve `localStorage`; en cualquier otro caso devuelve un almacén **no-op** (`getItem → null`, escrituras y borrados ignorados).
- **Postcondiciones**: el almacén devuelto nunca lanza. → FR-012.

## Invariantes

1. Ninguna función de este módulo propaga excepciones.
2. Un sobre `descartado` se elimina en el mismo `cargar`.
3. El contenidio del sobre nunca se interpreta parcialmente.
