# Contrato: módulo de estado y guardado

## `src/juego/estado.svelte.ts`

Fábrica de estado reactivo. No usa estado de módulo (evita fugas en SSR).

```ts
export function crearJuego(): Juego

export interface Juego {
  pantalla: Pantalla                       // $state
  partida: Partida | null                  // $state
  paso: Paso | null                        // $state
  resumen: ResumenCarrera | null           // $state
  error: ErrorMotor | null                 // $state
  aviso: string | null                     // $state
  hayGuardado: boolean                     // $derived

  empezar(): void
  crearPersonaje(datos: DatosCreacion): void
  elegirModalidad(modalidad: Modalidad): void
  elegirVariante(variante: VarianteId): void
  elegirOpcion(opcionId: string): void
  continuar(): void
  reiniciar(): void
  continuarPartida(): void
}
```

### Garantías

- Cada acción delega en el motor (`crearPartida`, `siguientePaso`, `elegir`, `continuar`, `resumen`); no reimplementa reglas.
- Tras `crearPersonaje` la semilla queda fija en la partida; repetir la carrera con la misma semilla y decisiones da el mismo resultado.
- Si el motor devuelve un `Paso` de tipo `error` o un `Resultado` fallido, se rellena `error` y `pantalla = "error"`; la isla nunca queda bloqueada.
- Tras cada acción que cambie la partida se guarda (ver `persistencia.ts`).
- `reiniciar()` limpia partida, guardado y avisos, y vuelve a `intro`.

## `src/juego/persistencia.ts`

```ts
export const CLAVE_GUARDADO = "coplero:partida"
export const VERSION_GUARDADO = VERSION_PARTIDA

export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

export function guardar(almacen: Almacen, partida: Partida): void
export function cargar(almacen: Almacen): { partida: Partida | null; descartado: boolean }
export function borrar(almacen: Almacen): void
```

### Garantías

- `guardar` escribe `{ version: VERSION_GUARDADO, partida: serializar(partida) }`.
- `cargar` valida `version` y usa `deserializar` del motor; ante JSON corrupto, versión distinta o forma inválida devuelve `partida: null, descartado: true` (nunca lanza).
- Se guarda en **cada elección**, no al final.
- El almacén es inyectable: en el navegador `localStorage`; en tests, un objeto en memoria.

## `src/juego/presentacion.ts` (funciones puras)

```ts
export function tituloDelJuego(genero: Genero): string          // Coplero / Coplera / Coplere
export function etiquetaMomento(momento: Momento): string        // Verano / Febrero
export function etiquetaFase(fase: FaseCOAC): string             // Preliminares / Cuartos / Semifinales / Final
export function etiquetaPremio(tipo: PremioTipo): string
export function normalizarNombre(valor: string): string          // trim + colapsar + máx. 24
```

### Garantías

- `normalizarNombre` recorta, colapsa espacios y trunca a 24 caracteres.
- Ninguna función lee ni escribe estado; son puras y testables sin DOM.

## `src/content/variantes.ts` (datos)

```ts
export interface Variante { id: string; modalidad: Modalidad; titulo: string; subtitulo: string }
export const VARIANTES: Variante[]
export function variantesDe(modalidad: Modalidad): Variante[]
```

Variantes según `docs/01` §2. Sin lógica de juego.
