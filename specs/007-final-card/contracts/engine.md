# Contrato — API del motor (feature 007)

Funciones puras. Ninguna usa DOM, `Math.random()` ni `Date.now()`. El motor no importa `content` ni `web`.

## Tipos públicos nuevos

```ts
// types.ts
export interface LogroCOAC {
  ano: number
  puesto: number
  tipo: "primer_premio" | "podio"
}

export interface PremioResumen {
  tipo: PremioTipo
  veces: number
  anos: number[]
}

export interface HitoTarjeta {
  tipo: TipoHito
  ano: number | null
  texto: string
}

export interface TarjetaFinal {
  nombre: string | null
  modalidadInicial: Modalidad
  modalidadFinal: Modalidad
  varianteInicial: VarianteId
  varianteFinal: VarianteId
  cambios: CambioTrayectoria[]
  anosDeCarrera: number
  anosEnActivo: number
  anosSinConcursar: number[]
  mejorFase: FaseCOAC
  mejorPuesto: number | null
  primerosPremios: LogroCOAC[]
  hitosProgreso: HitoProgreso[]  // debut y primera vez en cada fase
  otrosPremios: PremioResumen[]
  hitos: HitoTarjeta[]          // exactamente 3
  fraseCierre: string
}

export interface TextosTarjeta {
  hitos: Record<TipoHito, string[]>
  frases: Record<BucketFrase, string[]>
}

export interface BancoContenido {
  // ...campos existentes...
  textosTarjeta?: TextosTarjeta
}

export type Paso =
  | { tipo: "decision"; momento: Momento; situacion: SituacionPublica }
  | { tipo: "variante"; modalidad: Modalidad }
  | { tipo: "resultado"; temporada: Temporada }
  | { tipo: "fin"; tarjeta: TarjetaFinal }   // antes: resumen: ResumenCarrera
  | { tipo: "error"; error: ErrorMotor }

export const VERSION_TARJETA = 1
```

`ResumenCarrera` y `construirResumen` se **retiran**.

## Funciones

### `construirTarjeta(p: Partida, banco: BancoContenido) → TarjetaFinal`

- Deriva identidad y trayectoria de `p.trayectoria`; resultado de `p.temporadas` y `p.premios`.
- `anosEnActivo` = temporadas con `!fueraDeConcurso`; `anosSinConcursar` = años con `fueraDeConcurso`; `anosDeCarrera` = `temporadas.length`.
- `mejorFase` / `mejorPuesto` = mejores entre temporadas en concurso.
- `primerosPremios` = temporadas `fase === "final"` y `puesto <= 3`.
- `otrosPremios` = `p.premios` agrupados por `tipo` (con `veces` y `anos`), sin tipos a cero.
- `hitos` = 3 primeros candidatos por prioridad (relleno neutro).
- `fraseCierre` y variantes de texto desde `banco.textosTarjeta`, con hash FNV-1a de campos visibles.
- **Nunca** lee `p.destino` ni copia campos ocultos.
- Pura y determinista (misma `p` + mismo `banco` ⇒ misma tarjeta).

### `sinNombre(tarjeta: TarjetaFinal) → TarjetaFinal`

- Devuelve una copia con `nombre: null`. Sin efectos sobre el resto de campos.

### `hashEstable(texto: string) → number` (interno exportado para tests)

- FNV-1a de 32 bits. Puro y estable entre plataformas.

### `siguientePaso(p, banco) → Paso`

- Si `p.fase === "fin"` → `{ tipo: "fin", tarjeta: construirTarjeta(p, banco) }`.
- El resto de casos, sin cambios.

### `resumen(p, banco) → TarjetaFinal`

- Reemplaza al antiguo `resumen(p) → ResumenCarrera`. Devuelve `construirTarjeta(p, banco)`.

## Invariantes que el motor garantiza

1. `tarjeta.hitos.length === 3` para cualquier carrera terminada.
2. `tarjeta.otrosPremios` no contiene tipos con `veces === 0`.
3. Ningún campo de `destino` aparece en `TarjetaFinal`, en `Paso` ni en el código.
4. Misma seed + mismas decisiones + mismo `banco` ⇒ misma `TarjetaFinal`.
5. La tarjeta con `nombre: null` no contiene el nombre en ningún campo.

## Compatibilidad

- `VERSION_PARTIDA` no cambia (2): la forma de `Partida` es idéntica.
- El motor deja de exportar `ResumenCarrera`/`construirResumen`; los consumidores pasan a `TarjetaFinal`/`construirTarjeta`.
