# Contrato — Pantalla de cambio de variante (feature 006)

Contrato entre el motor y la isla Svelte para el paso `{ tipo: "variante" }`. La UI no calcula reglas: solo presenta y delega.

## Estado de la isla (`src/juego/estado.svelte.ts`)

- Nuevo valor de `Pantalla`: `"cambio-variante"`.
- `refrescarPaso()` añade:
  - Si `paso.tipo === "variante"` → `pantalla = "cambio-variante"`.
- Nueva acción pública:

```ts
elegirVarianteCambio(varianteId: VarianteId): void
```

  - Llama al motor `elegirVarianteDeCambio(partida, varianteId, bancoContenido)`.
  - Si `ok` → `partida = valor`, `refrescarPaso()`, `persistir()`.
  - Si no → `error` + `pantalla = "error"` (igual que `elegirOpcion`).

## Componente (`src/juego/Juego.svelte`)

- Nueva rama:

```svelte
{:else if juego.pantalla === "cambio-variante" && juego.paso?.tipo === "variante"}
  <ElegirVariante
    variantes={variantesDe(juego.paso.modalidad)}
    onElegir={juego.elegirVarianteCambio}
  />
```

- Reutiliza el componente `ElegirVariante.svelte` existente (botones ≥ 44 px, foco visible).
- El indicador de contexto no cambia.

## Textos (`src/juego/presentacion.ts`)

- Constante con el enunciado del paso (p. ej. `TITULO_CAMBIO_VARIANTE`), sin lógica.
- El componente `ElegirVariante` puede recibir un `titulo` opcional para distinguir "Elige variante" (inicio) de "Tu nueva forma de trabajar" (cambio). Si no se pasa, mantiene el título actual.

## Simulación (`src/simulacion/jugar.ts`)

- En el bucle, nuevo caso: `if (paso.tipo === "variante")`:
  - Elegir una variante del catálogo (`banco.variantes`) cuya `modalidad === paso.modalidad`, de forma determinista:

```ts
const rng = rngPara(p.seed, "variante-cambio", p.contador)
const opciones = (banco.variantes ?? []).filter((v) => v.modalidad === paso.modalidad)
const elegida = opciones[Math.floor(rng() * opciones.length)]
```

  - Llamar a `elegirVarianteDeCambio(p, elegida.id, banco, parametros)` y, si falla, anotar `VARIANTE_INVALIDA`.
  - Continuar el bucle (no cuenta como decisión registrada).

## Auditoría (`src/simulacion/auditoria.ts`)

- Nueva comprobación: si `cambios` no está vacío, la última entrada coincide con `partida.modalidad`/`partida.variante`.
- Nueva comprobación: `partida.variante` pertenece al catálogo de `partida.modalidad`.
- Códigos de hallazgo nuevos: `trayectoriaIncoherente`, `varianteInvalida`.

## Persistencia

- Si el jugador cierra en medio del paso de variante, la `Partida` guardada tiene `fase = "variante"`; al restaurar, `refrescarPaso()` vuelve a mostrar la pantalla de cambio de variante con la modalidad correcta. No se pierde el cambio ya aplicado a la modalidad.
