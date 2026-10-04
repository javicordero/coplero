# Phase 1 — Data Model: Rediseño de la pantalla final como palmarés

No hay entidades persistidas. La feature es de presentación, con un único añadido **derivado** en el motor: `TarjetaFinal.hitosProgreso`. Este documento describe el **modelo de presentación** del palmarés.

## Entrada: `TarjetaFinal` (con `hitosProgreso` derivado)

| Campo | Tipo | Uso en el palmarés |
|---|---|---|
| `nombre` | `string` | Título principal |
| `modalidadFinal` | `Modalidad` | Etiqueta de modalidad |
| `varianteFinal` | `VarianteId` | Estilo (título desde `VARIANTES`) |
| `mejorFase` | `FaseCOAC` | Parte de «Mejor posición» |
| `mejorPuesto` | `number \| null` | Puesto de «Mejor posición» (si existe) |
| `primerosPremios` | `LogroCOAC[]` (`{ano, puesto}`) | Premios de la línea temporal |
| `hitosProgreso` | `HitoProgreso[]` (`{ano, fase, debut}`) | Hitos de progresión (debut y primeras veces) |
| `otrosPremios` | `PremioResumen[]` (`{tipo, veces, anos}`) | Colección de distinciones |

## Zonas del palmarés (presentación)

| # | Zona | Origen | Regla |
|---|---|---|---|
| 1 | Antetítulo | texto fijo | Fuera de la tarjeta, atenuado («Carrera finalizada») |
| 2 | Nombre | `nombre` | Título principal |
| 3 | Modalidad / Estilo | `modalidadFinal`, `varianteFinal` | Dos elementos con tratamientos distintos |
| 4 | Mejor posición | `mejorFase`, `mejorPuesto` | Placa: puesto protagonista; sin puesto, la fase |
| 5 | Línea temporal | `primerosPremios`, `hitosProgreso` | Premios (medallas) + hitos de progresión; cronológico |
| 6 | Distinciones | `otrosPremios` | Rosetas: una por victoria, agrupadas por tipo; mismo peso |
| 7 | Frase de cierre | texto por defecto | Cursiva antes de los botones |
| 8 | Acciones | — | Compartir, Imagen 9:16, Empezar de nuevo |

La zona 6 se omite si no hay datos; la 5, si no hay eventos.

## Línea temporal (modelo)

| Aspecto | Regla |
|---|---|
| Selección | `primerosPremios` (premios) + `hitosProgreso` (debut y primera vez en cada fase) |
| Orden | Cronológico ascendente por `ano` |
| Disposición | Horizontal en grid; columnas automáticas; la primera fila llena el ancho si está completa |
| Hito | Etiqueta (`1º/2º/3º` o `Debut/CF/SF/F`) + nodo + `año` |
| Medallas | `puesto` 1/2/3 → oro/plata/bronce (`--c-carnaval-oro` / `-plata` / `-bronce`) |
| Fases | `Debut`/`CF`/`SF`/`F` → verde claro (Debut), azul claro (CF), azul (SF), morado (F) |
| Prevalencia | Un año con premio no lleva hito |
| Interacción | Ninguna |

## Distinciones (modelo)

| Aspecto | Regla |
|---|---|
| Fuente | `otrosPremios` (tipo + veces) |
| Formato | Una roseta por victoria (`veces`), agrupadas por tipo; sin texto |
| Roseta | SVG propio: `roseta_andalucia` (verde/blanco), `roseta_aguja_oro` (dorado), `roseta_candela` (rojo) |
| Icono | En el centro de cada roseta (aguja / bandera / candela) |
| Peso | Todas iguales (sin jerarquía) |
| Retícula | Grupos en fila que envuelve; rosetas pegadas dentro del grupo |
| Omisión | Si `otrosPremios` está vacío, no se muestra la sección |

## Frase de cierre (modelo)

| Aspecto | Regla |
|---|---|
| Texto | Por defecto «La copla termina. La historia queda.» (tono elegante) |
| Posición | Antes de los botones |
| Estilo | Cursiva, con separadores ornamentales |
| Regla | No afirma victoria; válida para cualquier posición |

## Estética y tokens

| Aspecto | Regla |
|---|---|
| Base | Negro (`--c-fondo`) |
| Información | Blanco (`--c-texto-fuerte`, `--c-texto`) |
| Destacados | Naranja Coplero (`--c-acento`) |
| Dorado | Solo el 1º premio (`--c-carnaval-oro`) |
| Separadores | Ornamentales sutiles (compás) |
| Fuentes | Anton (display) + Atkinson (texto); sin cambios |
| Formulario/dashboard | Prohibido |

## Invariantes verificables

- La pantalla muestra las zonas 2-4 y, si hay datos, 5-6, más 1, 7 y 8; **0** bloques retirados (trayectoria, años, relato, compás decorativo de la tarjeta, marca de agua).
- La línea temporal se reparte en **filas de 5 hitos** con carril continuo, en orden cronológico, sin años sin premio y sin scroll horizontal.
- El año con `puesto === 1` usa dorado; 2º/3º, tonos atenuados; **0** dorados fuera del 1º premio.
- Las distinciones se muestran como rosetas (una por victoria), agrupadas por tipo; **0** distinciones destacadas por encima del resto.
- Existe una frase de cierre antes de los botones; **0** menciones a haber ganado.
- Sin scroll horizontal a 320 px; axe sin violaciones graves en `fin` y `/r`.
- La imagen OG no cambia. El motor solo añade el campo derivado `hitosProgreso`.

## Estados

- Sin estado de selección ni interacción; solo el aviso transitorio de la última acción de compartir/descarga.
- «Empezar de nuevo» vuelve a la creación de personaje.
