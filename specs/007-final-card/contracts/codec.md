# Contrato — Código de partida (feature 007)

El código transporta la **tarjeta ya derivada** en la URL. Es autocontenido: no incluye el `seed`, ni la `Partida`, ni datos de `destino`, y no requiere re-simular ni el motor para reconstruirse.

## API (`src/engine/codec.ts`)

```ts
export const VERSION_CODIGO = 1

export type ErrorCodigo =
  | { codigo: "CODIGO_INVALIDO" }
  | { codigo: "VERSION_CODIGO_INCOMPATIBLE"; versionRecibida: number; versionEsperada: number }

export function codificar(tarjeta: TarjetaFinal): string

export function decodificar(codigo: string): Resultado<TarjetaFinal, ErrorCodigo>
```

Puro, sin DOM (usa un helper base64url propio, sin `btoa` ni `Buffer`).

## Formato

```text
TarjetaFinal
  → JSON.stringify({ v: VERSION_CODIGO, t: tarjeta })
  → fflate.strToU8(...)
  → fflate.deflateSync(bytes)
  → base64url(bytes)        // alfabeto A-Z a-z 0-9 - _ , sin relleno '='
```

## Reglas

1. `codificar` es determinista: la misma `TarjetaFinal` produce el mismo código.
2. `decodificar(codificar(t))` reproduce `t` campo a campo (roundtrip).
3. La cadena resultante usa solo caracteres `[A-Za-z0-9_-]` (segura en URL).
4. Un código de una carrera completa MUST medir **< 2000 caracteres** (SC-008).
5. Fallos → `Resultado` con `ErrorCodigo`, nunca una excepción:
   - base64url inválido, `deflate` corrupto o JSON inválido → `CODIGO_INVALIDO`.
   - `v` distinto de `VERSION_CODIGO` → `VERSION_CODIGO_INCOMPATIBLE`.
   - forma mínima inválida (faltan campos obligatorios o `hitos.length !== 3`) → `CODIGO_INVALIDO`.
6. El payload MUST NOT contener las claves de `destino` (`techo`, `suelo`, `anoPico`, `anosCarrera`, `volatilidad`, `carisma`, `milagro`) ni `seed`. Un test decodifica y comprueba la ausencia de esas claves.
7. Si el jugador oculta el nombre (FR-027), se codifica la tarjeta con `nombre: null`; el código no contiene el nombre en ninguna forma.

## Uso

- **Isla** (`/jugar`): al terminar, `codificar(tarjeta)` → URL `/r/<codigo>` para compartir.
- **Página `/r/[codigo]`**: `decodificar(codigo)`; si `ok`, renderiza; si no, página amable (ver `rutas.md`).
- **Endpoint de imágenes**: `decodificar(codigo)` antes de componer el PNG.
