# Contract: módulo `src/simulacion`

**Feature**: `002-massive-simulation` | **Type**: Contrato de API interna (TypeScript puro)

`src/simulacion/` importa **solo** la API pública de `src/engine`. El motor nunca importa de aquí.

## Superficie pública (`src/simulacion/index.ts`)

```ts
// --- Orquestador ---
export function simular(opciones: OpcionesSimulacion): InformeSimulacion

// --- Presentación ---
export function formatearInforme(informe: InformeSimulacion): string
export function informeAJson(informe: InformeSimulacion): string

// --- Piezas reutilizables / testeables ---
export function jugarCarrera(args: {
  input: CrearPartidaInput
  banco: BancoContenido
  perfil: PerfilJugador
  parametros?: Partial<ParametrosMotor>
}): RegistroCarrera

export function auditarCarrera(carrera: RegistroCarrera): HallazgoEstadoImposible[]

// --- Catálogos y tipos ---
export const PERFILES_POR_DEFECTO: readonly PerfilJugador[]
export const CONFIGURACIONES_POR_DEFECTO: readonly ConfiguracionPartida[]
export const REGLAS_ESTADO_IMPOSIBLE: readonly ReglaEstadoImposible[]
export type {
  OpcionesSimulacion,
  InformeSimulacion,
  RegistroCarrera,
  PerfilJugador,
  ConfiguracionPartida,
  HallazgoEstadoImposible,
  ReglaEstadoImposible,
  MetricasAgregadas,
  ErrorAgregable,
}
```

## Postcondiciones

- `simular` es **puro y determinista**: mismas `opciones` → `InformeSimulacion` idéntico (FR-022).
- `simular` MUST completar las `n` carreras; un error en una carrera MUST registrar `ErrorAgregable` y
  continuar, marcando `meta.generadoConError = true` (FR-027).
- `simular` MUST NOT modificar `opciones.banco` ni los perfiles.
- `simular` MUST NOT usar `Math.random()` ni `Date.now()`; todo azar viene de `rngPara` del motor.
- `jugarCarrera` MUST usar la secuencia pública `crearPartida → siguientePaso → elegir → continuar` hasta
  `Paso.fin`; MUST registrar el `id` de cada situación servida y de cada opción elegida.
- `auditarCarrera` MUST evaluar, al menos, las 13 reglas de FR-019 y devolver un hallazgo por regla
  incumplida, sin lanzar excepciones.
- `formatearInforme` MUST incluir el 100% de las métricas mínimas exigidas por la spec.
- `informeAJson` MUST ser `JSON.parse`-able y estable (mismas opciones → misma cadena salvo orden de
  claves, que debe ser determinista).
- El informe MUST marcar `meta.usoInterno = true` y no MUST incluir el nombre del personaje ni exponerse
  en el código compartible de la partida (FR-026).

## Invariantes verificables

| Invariante | Verificación |
|---|---|
| Determinismo | `simular(x)` dos veces → informes iguales |
| Cobertura de métricas | `formatearInforme` contiene los 9 bloques mínimos |
| Auditoría por regla | un caso sintético por regla produce su `HallazgoEstadoImposible` |
| Reparto balanceado | con `n = k·P·C`, cada perfil y configuración recibe exactamente `k` carreras |
| Sin azar implícito | test de pureza sobre `src/simulacion/**` (sin `Math.random`/`Date.now`) |
| Solo API pública | `src/simulacion/**` importa únicamente de `src/engine/index` (nunca de submódulos internos) |
| Informe interno | `meta.usoInterno === true` y el informe no contiene el nombre del personaje |
| Agnóstico al banco | `simular` funciona con dos bancos distintos sin cambios de código |
