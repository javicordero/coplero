# Data Model — Decisiones que no afectan al resultado (feature 008)

La feature no crea entidades nuevas de motor: ajusta el **contenido** y sus reglas de validación. Todo lo de abajo vive en `src/content/schema.ts` (datos validados con Zod) y en los tipos del motor donde se comparten.

## `Opcion` (contenido) — cambio

```ts
export interface Opcion {
  id: string
  titulo: string
  subtitulo: string
  efectos?: Partial<Record<Atributo, number>> // solo si excepcion === true
  excepcion?: boolean                          // NUEVO
  flags?: string[]
  consume?: string[]
  peso?: number
  saltaCOAC?: boolean
  cambiaModalidad?: Modalidad
  cambiaVariante?: string
}
```

- **`excepcion`**: marca que la opción puede alterar atributos y, con ello, el desenlace de esa temporada (de forma inmediata y acotada por `[suelo, techo]`).
- El motor **no** consume `excepcion`; solo `efectos`. Por eso `engine/types.ts` no necesita el campo (el motor ya aplica cualquier `efectos` presente).

### Reglas de validación (Zod, `OpcionSchema`)

1. `efectos` presente ⇒ `excepcion === true`.
2. `excepcion === true` ⇒ `efectos` presente y no vacío (no hay excepciones vacías).
3. `efectos` ausente ⇒ `excepcion` ausente o `false`.
4. `efectos` sigue restringido a `ATRIBUTOS` con enteros (regla existente).
5. El intercambio (mejora y empeora) es válido por construcción: `efectos` admite positivos y negativos.

## `Situacion` (contenido) — sin cambios estructurales

Igual que hoy (`id`, `momento`, `tipo`, `categoria`, `titulo`, `texto`, `opciones`, `modalidades?`, `variantes?`, `minAno?`, `unicaVez?`, `peso?`). Lo que cambia es **cuántas** de sus opciones llevan `efectos`: casi ninguna.

## Entidades del dominio (conceptuales)

- **Decisión narrativa**: opción sin `efectos`; da forma a la historia y **no** altera el desenlace.
- **Excepción declarada**: opción con `excepcion: true` y `efectos`; única vía por la que una decisión influye en el resultado (a través de los atributos y, de ahí, de la puntuación acotada por el techo).
- **Atributos**: parten del valor estándar (`atributosIniciales`, 50). Sin excepción, permanecen; con excepción, suben o bajan dentro de `[0, 100]`.
- **Destino (oculto)**: techo, suelo, año pico, volatilidad, carisma, milagro. **No cambia** y no se expone; es el que manda en el resultado.
- **Resultado de temporada**: `nivelPorPuntuacion(puntuación) + ruido + carisma + bonoAñoPico`, acotado por `[suelo, techo]`, con batacazo y milagro. Con atributos estándar, la puntuación base es una constante y el desenlace lo fijan el destino y el azar.

## Invariantes

1. `Opcion.efectos` implica `Opcion.excepcion === true` (0 efectos implícitos).
2. El número de opciones con `excepcion: true` se mantiene **bajo** (umbral vigilado en tests/informe).
3. Una carrera con atributos estándar y sin excepciones alcanzadas produce el mismo reparto que el destino + azar, sin sesgo por decisiones.
4. `VERSION_PARTIDA` = 2 sin cambios; la forma de `Partida` no varía.

## Fuera de alcance (no se modela)

- **Efecto diferido** (impulso con caída posterior): sin campos ni mecánica.
- **Resultado incierto** (60/40): sin campos ni mecánica.
- **Modificadores directos de resultado** (saltarse los atributos): sin campos ni mecánica.
