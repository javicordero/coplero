# Contrato · Textos de situación adaptados al género

Interfaces afectadas: **contenido** (quien redacta), **motor** (resolución) y **panel** (edición).
No hay API externa nueva; son contratos internos del proyecto.

---

## 1. Contrato de contenido (`src/content/schema.ts`)

Una situación y una opción aceptan estos campos **opcionales** (todos `string`):

```ts
interface Situacion {
  // ...campos ya existentes...
  tituloFemenino?: string   // variante femenina de `titulo`
  textoFemenino?: string    // variante femenina de `texto`
}

interface Opcion {
  // ...campos ya existentes...
  tituloFemenino?: string      // variante femenina de `titulo`
  subtituloFemenino?: string   // variante femenina de `subtitulo`
}
```

Reglas de aceptación:

- Opcionales: el contenido sin ellos sigue siendo **válido**.
- `strictObject`: cualquier campo no declarado se rechaza (como hoy).
- Cadena vacía o solo espacios: aceptada por el esquema, tratada como **ausente** por el motor.
- Los `id` no cambian ni dependen del género.
- Los condicionales heredan el contrato (son `Situacion`).

### Ejemplo (fichero generado por el panel)

```ts
{
  id: "v_arreglo",
  momento: "verano",
  titulo: "Te ofrecen un arreglo musical de fuera del carnaval",
  texto: "",
  tituloFemenino: "Te ofrecen un arreglo musical… (femenino)",
  opciones: [
    {
      id: "aceptar",
      titulo: "Aceptar el arreglo",
      subtitulo: "Sonar distinto a todos",
      tituloFemenino: "Aceptar el arreglo (femenino)",
      flags: ["musico_externo"],
    },
    // ...
  ],
}
```

---

## 2. Contrato del motor

### `src/engine/genero.ts` (nuevo)

```ts
type FuenteAzar = (campo: string) => number   // [0, 1)

function resolverTexto(
  porDefecto: string,
  femenino: string | undefined,
  genero: Genero,             // "masculino" | "femenino" | "no_binario"
  campo: string,              // identifica el campo para el azar determinista
  azar: FuenteAzar,
): string
```

Semántica: ver `data-model.md` §3. Función **pura**, sin DOM ni azar implícito.

### `src/engine/selector.ts` (modificado, retrocompatible)

```ts
interface ContextoGenero {
  genero: Genero
  azar: (campo: string) => number
}

// contexto opcional: sin él se devuelven las formas por defecto (compatibilidad)
function toPublica(s: Situacion, contexto?: ContextoGenero): SituacionPublica
```

### `src/engine/partida.ts` (modificado)

En `siguientePaso`, al construir el paso `decision`:

```ts
const azar = (campo: string) => rngPara(p.seed, "genero", situacion.id, campo)()
situacion: toPublica(situacion, { genero: p.personaje.genero, azar })
```

Garantías:

- **Determinismo**: misma semilla + decisiones + género → mismos textos (FR-014).
- **Sin efectos sobre el resto**: el token `"genero"` no altera selección, condicionales ni COAC.
- **Salida pública estable**: `SituacionPublica` mantiene su forma; la UI no cambia (FR-008).

### Exportaciones (`src/engine/index.ts`)

- Se añade `resolverTexto` (y el tipo `ContextoGenero`) a la API pública.

---

## 3. Contrato del panel (solo-dev)

- **FormularioSituacion** y **FormularioCondicional**: añaden una sección **"Variante femenina"** con
  inputs para `tituloFemenino` y `textoFemenino`.
- **FormularioOpcion**: añade sección **"Variante femenina"** con inputs para `tituloFemenino` y
  `subtituloFemenino`.
- Al guardar, los campos femeninos vacíos se **omiten** (`undefined`), de modo que el volcado no
  incluye ruido (FR-012).
- **DetalleSituacion**: muestra las variantes femeninas cuando existen (solo lectura).
- La validación, el CRUD y el almacén **reutilizan** `SituacionSchema`/`OpcionSchema`: no requieren
  lógica nueva más allá del esquema.
- El generador (`src/panel/generador.ts`) ya omite claves `undefined`: no cambia.

---

## 4. Criterios de aceptación del contrato

| Criterio | Comprobación |
|---|---|
| Campos opcionales aceptados | Contenido con y sin campos femeninos valida en build. |
| Campo desconocido rechazado | Un campo no declarado sigue fallando (strict). |
| Resolución por género | Tests de `genero.test.ts`: masculino/femenino/no binario y vacíos. |
| Determinismo | Misma seed + decisiones + género → mismo `Paso`. |
| No regresión | Snapshot de partida (masculino) intacto; `npm run check` en verde. |
| Panel | Round-trip: rellenos se exportan, vacíos se omiten. |
