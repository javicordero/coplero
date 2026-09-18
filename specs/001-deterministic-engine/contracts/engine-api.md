# Contract: API pública del motor (ENGINE-001)

Interfaz que el `engine` expone a sus consumidores (tests, simulador y, más adelante, la isla web).
Tipo de proyecto: **librería**. Contrato en TypeScript; el comportamiento es la fuente de verdad.

## Tipos de resultado y error

```ts
export type Resultado<T, E> =
  | { ok: true; valor: T }
  | { ok: false; error: E };

export type ErrorMotor =
  | { codigo: "VERSION_INCOMPATIBLE"; versionRecibida: number; versionEsperada: number }
  | { codigo: "OPCION_INVALIDA"; opcionId: string }
  | { codigo: "CONTENIDO_INSUFICIENTE"; momento: Momento; tipo: TipoDecision };
```

## Constantes

```ts
export const VERSION_PARTIDA = 1;
export const ANO_BASE = 1; // constante fija; nunca derivada del reloj

// Tokens estables de contexto del azar; renombrarlos es un cambio incompatible.
// Las funciones concretas añaden partes (año, momento, contador) según el caso.
export type ContextoAzar =
  | "destino"
  | "tipos"
  | "seleccion"
  | "condicional"
  | "coac"
  | "premios"
  | "jugador";
```

## Entrada de creación

```ts
export interface CrearPartidaInput {
  seed: string;
  personaje: Personaje;
  modalidad: Modalidad;
  variante: VarianteId;
  anoInicio?: number;        // por defecto ANO_BASE (constante fija)
  decisionesPorAno?: number; // por defecto 2
}
```

## Tipos de entrada referenciados

`BancoContenido` y `ParametrosMotor` se definen en [data-model.md](../data-model.md); este contrato
solo fija que el banco y los parámetros se inyectan por parámetro.

## Funciones

```ts
// Crea una partida y genera el destino oculto de forma determinista.
export function crearPartida(
  input: CrearPartidaInput,
  banco: BancoContenido,
  params?: ParametrosMotor,
): Partida;

// Devuelve qué debe mostrar/consumir el llamador en el estado actual.
export function siguientePaso(
  p: Partida,
  banco: BancoContenido,
  params?: ParametrosMotor,
): Paso;

// Aplica una opción y devuelve el nuevo estado (sin mutar `p`).
export function elegir(
  p: Partida,
  opcionId: string,
  banco: BancoContenido,
  params?: ParametrosMotor,
): Resultado<Partida, ErrorMotor>;

// Avanza desde la exposición del resultado de temporada al año siguiente o al fin.
export function continuar(p: Partida): Partida;

// Resumen mínimo de carrera (nunca incluye `destino`).
export function resumen(p: Partida): ResumenCarrera;

// Serialización JSON con versión de esquema.
export function serializar(p: Partida): string;
export function deserializar(json: string): Resultado<Partida, ErrorMotor>;
```

## `Paso` (lo que se muestra)

```ts
export type Paso =
  | { tipo: "decision"; momento: Momento; situacion: SituacionPublica }
  | { tipo: "resultado"; temporada: Temporada }   // se expone DESPUÉS de la decisión de febrero
  | { tipo: "fin"; resumen: ResumenCarrera }
  | { tipo: "error"; error: ErrorMotor };         // p. ej. CONTENIDO_INSUFICIENTE
```

`SituacionPublica` es una vista sin datos internos de selección:

```ts
export interface SituacionPublica {
  id: string;
  momento: Momento;
  tipo: TipoDecision;
  categoria: Categoria;
  titulo: string;
  texto: string;
  opciones: { id: string; titulo: string; subtitulo: string }[];
}
```

## Resumen mínimo

```ts
export interface ResumenCarrera {
  nombre: string;
  modalidad: Modalidad;
  variante: VarianteId;
  anosEnActivos: number;
  mejorFase: FaseCOAC;
  premios: Premio[];
  // Sin `destino`, `techo`, `suelo`, `anoPico`, `volatilidad` ni `carisma`.
}
```

## Contratos de comportamiento

1. **Determinismo**: `crearPartida` y la secuencia `elegir` sobre una misma `seed` y mismas decisiones
   producen estados equivalentes (`FR-004`).
2. **Pureza**: ninguna función muta sus argumentos; el resultado es un objeto nuevo (`FR-015`).
3. **Independencia**: el `engine` no importa de `content`/`web` ni usa DOM, `Math.random` ni
   `Date.now`; el banco llega por parámetro (`FR-014`, `FR-022`).
4. **Serialización**: `serializar` produce **JSON plano** con `version`; `deserializar(serializar(p))`
   es equivalente a `p`; versión distinta devuelve `VERSION_INCOMPATIBLE` (`FR-003`, `FR-027`).
5. **Selección**: `siguientePaso` respeta `momento`, `tipo`, `modalidad`, `variante`, `minAno` y
   `unicaVez`; aplica la degradación B→D antes de fallar (`FR-006`, `FR-018`).
6. **Resultado temporada**: se calcula con el estado previo a la decisión de febrero; esa decisión no
   altera el resultado de la temporada (`FR-024`).
7. **Destino oculto**: nunca aparece en `Paso` ni en `ResumenCarrera` (`FR-002`, US4).
8. **Errores**: `elegir` con `opcionId` ajeno devuelve `OPCION_INVALIDA`; la falta total de contenido
   devuelve `CONTENIDO_INSUFICIENTE` (`FR-015`, `FR-018`).
9. **Azar contextual**: la obtención de azar se deriva del contexto (semilla + año + momento +
   propósito + contador) y no depende del orden de llamadas (`FR-026`).
10. **Sin lógica en la UI**: la interfaz solo invoca esta API; ninguna regla de negocio vive fuera del
    motor (`FR-025`).
11. **Parametrización**: `decisionesPorAno`, años de carrera y constantes numéricas se inyectan vía
    `CrearPartidaInput`/`ParametrosMotor` (`FR-016`, `FR-020`, `FR-021`).
12. **No concurso**: las opciones con `saltaCOAC` marcan la temporada fuera de concurso y saltan su
    resolución; la decisión de su momento se consume sin romper el reparto anual (`FR-017`).
13. **Premios parametrizados**: la afinidad por premio se inyecta (`{ umbralPuesto, pesosAtributos,
    flagsAfinidad }`); el motor no fija vocabulario de contenido y desempata de forma determinista
    (`FR-011`).
14. **Retirada**: la carrera termina al cierre del año (tras la resolución del COAC), nunca a mitad de
    año (`FR-005`, `FR-020`).
15. **Alcance de `serializar`**: serializa el estado completo, **incluido** `destino`; el código
    compartible que excluye el destino queda fuera de esta feature (`FR-003`).

## No incluido en este contrato (fuera de alcance)

- `codec.ts` y la compresión de URL con `fflate` (feature posterior).
- UI, rutas, persistencia en `localStorage` e imagen OG.
