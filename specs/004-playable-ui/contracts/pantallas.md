# Contrato: pantallas y transiciones

## Componente raíz

`src/juego/Juego.svelte` es la única isla. Monta `crearJuego()` y renderiza la pantalla según `estado.pantalla`. No contiene reglas de juego.

```svelte
<script lang="ts">
  import { crearJuego } from "./estado.svelte"
  const juego = crearJuego()
</script>
```

En el shell (`src/pages/jugar.astro`): `<Juego client:load />`.

## Contrato por pantalla

Cada pantalla es un componente presentacional: recibe props y emite acciones por **callback props** (Svelte 5, sin `createEventDispatcher`).

| Pantalla | Props | Acciones |
|---|---|---|
| `Intro.svelte` | `hayGuardado: boolean`, `aviso?: string` | `onEmpezar()`, `onContinuar()` |
| `CrearPersonaje.svelte` | `tituloJuego: string` | `onCrear(datos: DatosCreacion)` |
| `ElegirModalidad.svelte` | `modalidades: ModalidadInfo[]` | `onElegir(modalidad)` |
| `ElegirVariante.svelte` | `variantes: Variante[]`, `modalidad` | `onElegir(variante)` |
| `Decision.svelte` | `indicador: Indicador`, `situacion: SituacionPublica` | `onElegir(opcionId)` |
| `Resultado.svelte` | `indicador: Indicador`, `temporada: Temporada` | `onContinuar()` |
| `FinCarrera.svelte` | `resumen: ResumenCarrera` | `onReiniciar()` |
| `Error.svelte` | `mensaje: string` | `onReiniciar()` |

`Indicador` = `{ ano: number; momento: Momento | "resultado" }`.

## Reglas de presentación

1. Toda pantalla de decisión y de resultado muestra el **indicador de contexto** (año, momento).
2. Las opciones se muestran con **título y subtítulo**; el enunciado de la situación puede tener `texto` vacío (banco actual) y la pantalla no debe romperse.
3. El texto del jugador (nombre) se muestra como texto plano; nunca `{@html}`.
4. No hay carga entre pantallas: el banco viene en el bundle.
5. Botones siempre accionables en móvil; sin animaciones complejas.

## Transiciones

| Desde | Acción | Hacia |
|---|---|---|
| intro | onEmpezar | crear-personaje |
| intro | onContinuar (si hay guardado) | ciclo de carrera |
| crear-personaje | onCrear | modalidad |
| modalidad | onElegir | variante |
| variante | onElegir | decision (primer paso) |
| decision | onElegir | resultado |
| resultado | onContinuar | decision (siguiente año) o fin |
| fin | onReiniciar | intro |
| error | onReiniciar | intro |

## Accesibilidad mínima

- Controles nativos (`<button>`, `<input>`, `<select>`) con `label` asociado.
- Foco y navegación por teclado funcionales (sin gestión avanzada en esta fase).
