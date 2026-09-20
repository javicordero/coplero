# Contrato — API del motor (feature 006)

El motor expone estas funciones puras. Ninguna usa DOM, `Math.random()` ni `Date.now()`.

## Tipos públicos nuevos/ampliados

```ts
// types.ts
export interface CambioTrayectoria {
  ano: number
  modalidad: Modalidad
  variante: VarianteId
}

export interface Trayectoria {
  modalidadInicial: Modalidad
  varianteInicial: VarianteId
  cambios: CambioTrayectoria[]
}

export interface Opcion {
  // ...campos existentes...
  cambiaModalidad?: Modalidad
  cambiaVariante?: VarianteId
}

export interface Situacion {
  // ...campos existentes...
  peso?: number
}

export interface BancoContenido {
  // ...campos existentes...
  variantes?: { id: VarianteId; modalidad: Modalidad }[]
}

export type FasePartida = "creacion" | "decision" | "variante" | "coac" | "fin"

export type Paso =
  | { tipo: "decision"; momento: Momento; situacion: SituacionPublica }
  | { tipo: "variante"; modalidad: Modalidad }
  | { tipo: "resultado"; temporada: Temporada }
  | { tipo: "fin"; resumen: ResumenCarrera }
  | { tipo: "error"; error: ErrorMotor }

export type ErrorMotor =
  | { codigo: "VERSION_INCOMPATIBLE"; versionRecibida: number; versionEsperada: number }
  | { codigo: "OPCION_INVALIDA"; opcionId: string }
  | { codigo: "VARIANTE_INVALIDA"; varianteId: string }
  | { codigo: "CONTENIDO_INSUFICIENTE"; momento: Momento; tipo: TipoDecision }

export interface ResumenCarrera {
  // ...campos existentes...
  trayectoria: Trayectoria
}

export const VERSION_PARTIDA = 2
```

## Funciones

### `crearPartida(input, banco, params?) → Partida`

- Inicializa `trayectoria = { modalidadInicial: input.modalidad, varianteInicial: input.variante, cambios: [] }`.
- No cambia el resto del contrato.

### `siguientePaso(p, banco) → Paso`

- Si `p.fase === "variante"` → `{ tipo: "variante", modalidad: p.modalidad }`.
- El resto de casos, igual que hoy.
- Precondición: `p.fase === "variante"` solo puede ocurrir tras una opción con `cambiaModalidad`.

### `elegir(p, opcionId, banco, params?) → Resultado<Partida, ErrorMotor>`

- Requiere `p.fase === "decision"`; si no, `OPCION_INVALIDA` (comportamiento actual).
- Además de los efectos actuales:
  - Si `opcion.cambiaModalidad` existe y es distinta de `p.modalidad`:
    - `p.modalidad = opcion.cambiaModalidad`.
    - El momento pasa a `"febrero"` como en cualquier decisión de verano (el resultado del COAC ya se calculó).
    - `p.fase = "variante"`.
    - **No** se registra todavía el cambio de trayectoria (se registra junto con la variante elegida).
  - Si `opcion.cambiaVariante` existe y es distinta de `p.variante`:
    - `p.variante = opcion.cambiaVariante`.
    - `p.trayectoria.cambios += { ano, modalidad: p.modalidad, variante: p.variante }`.
    - `p.fase` no cambia (sigue el flujo normal).
  - Si ninguno de los dos existe, comportamiento actual sin tocar la trayectoria.
- Si una opción declara ambos, `cambiaModalidad` tiene prioridad y `cambiaVariante` se ignora (el contenido lo prohíbe; se valida en integridad).

### `elegirVarianteDeCambio(p, varianteId, banco, params?) → Resultado<Partida, ErrorMotor>`

- Precondición: `p.fase === "variante"`. Si no, `OPCION_INVALIDA`.
- Valida `varianteId` contra `banco.variantes` y exige `modalidad === p.modalidad`. Si no, `VARIANTE_INVALIDA`.
- Aplica:
  - `p.variante = varianteId`.
  - `p.trayectoria.cambios += { ano: p.anoActual, modalidad: p.modalidad, variante: varianteId }`.
  - `p.fase = "decision"` (el momento ya es febrero; la siguiente decisión es la de febrero).
- Puro y determinista.

### `construirResumen(p) → ResumenCarrera`

- Añade `trayectoria: p.trayectoria` (copia) al resumen actual. No incluye `destino`.

### `elegirDe` (interno de `selector.ts`)

- Pondera con `s.peso ?? 1` en lugar de 1 fijo.

## Invariantes que el motor garantiza

1. `p.variante` siempre pertenece a `p.modalidad` mientras `p.fase !== "variante"`.
2. `p.trayectoria.cambios` nunca contiene dos entradas del mismo año para el mismo tipo de cambio lógico (una elección de variante por cambio de modalidad).
3. Ningún campo de `destino` aparece en `Paso`, en `Trayectoria` ni en `ResumenCarrera`.
4. Misma seed + mismas decisiones ⇒ misma `Partida` y misma `trayectoria`.

## Compatibilidad

- `VERSION_PARTIDA` 1 → 2: un `deserializar` de un JSON con `version: 1` devuelve `VERSION_INCOMPATIBLE`. La capa web (005) lo trata como guardado no restaurable.
