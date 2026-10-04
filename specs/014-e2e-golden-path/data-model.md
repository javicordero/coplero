# Fase 1 — Modelo de datos de la prueba

**Feature**: 014-e2e-golden-path | **Fecha**: 2026-09-21

Esta feature no añade datos de juego: modela **lo que la prueba observa y verifica**. No hay
persistencia nueva ni cambios de esquema.

## Entidades del recorrido

### Hito (checkpoint)

Un paso de E2E-001 que la prueba recorre y evidencia. Son diez, en orden.

| # | Hito | Acción observable | Evidencia / anclaje |
|---|---|---|---|
| 1 | Entrar en `/jugar` | `page.goto("/jugar")` + `empezar` | `[data-testid="intro"]` → `[data-testid="empezar"]` |
| 2 | Crear personaje | rellenar `Nombre o apodo` + `crear` | `[data-testid="crear-personaje"]`, `[data-testid="crear"]` |
| 3 | Elegir modalidad | primer botón de modalidad | `[data-testid="modalidad"] button` |
| 4 | Elegir variante | primer botón de variante | `[data-testid="variante"] button` |
| 5 | Completar varias decisiones | resolver `decision` durante varios años | `[data-testid="decision"]` + `data-pantalla` |
| 6 | Completar la carrera | resolver `decision`/`resultado`/`cambio-variante` hasta `fin` | `[data-pantalla]` y `[data-testid="resultado"]/["continuar-ano"]` |
| 7 | Tarjeta final | comprobar `fin` + `tarjeta` + nombre | `[data-testid="fin"]`, `[data-testid="tarjeta-nombre"]` |
| 8 | Recargar y recuperar | `reload` → `continuar` → misma clave | `[data-testid="continuar"]` |
| 9 | Código compartible | `copiar-enlace` + leer portapapeles | `[data-testid="copiar-enlace"]` |
| 10 | Abrir `/r/[codigo]` | navegar al enlace y ver la tarjeta | `[data-testid="tarjeta"]`, `[data-testid="tarjeta-nombre"]` |

**Regla de validación**: los diez hitos MUST quedar cubiertos en una sola ejecución; cada uno es un
`test.step()` con nombre legible, de modo que el informe enumere 10/10 (FR-016, SC-001, SC-006).

### ClavePantalla

Identifica de forma única el punto observable del bucle jugable.

- **Forma**: `"<pantalla>|<momento>|<ano>"`, leída de `<main data-pantalla data-momento data-ano>`.
- **Valores de `pantalla`**: `intro | crear-personaje | modalidad | variante | cambio-variante |
  decision | resultado | fin | error`.
- **Uso**:
  - `avanzar` comprueba que la clave **cambia** tras cada interacción (progreso real, sin atascos).
  - El hito 8 compara la clave **antes y después** de recargar + continuar: MUST coincidir.
- **Regla**: la prueba MUST NOT interpretar el contenido de `momento`/`ano` para decidir; solo los usa
  como identidad de la pantalla.

### DecisionObservada

Subconjunto derivado de la pantalla de decisión, para FR-005.

- **`momento`**: `verano | febrero`, leído de `[data-testid="indicador"]`.
- **Regla**: a lo largo del hito 5–6 la prueba MUST haber observado decisiones de ambos momentos. El motor garantiza una de cada por año; la prueba lo evidencia. *(El antiguo `[data-tipo]` se retiró el 2026-10-04.)*

### PartidaGuardada

Representación observable de la partida en `localStorage` (clave `coplero:partida`, feature 005). La
prueba **no** la parsea ni la modifica, salvo para comprobar su efecto:

- `en-curso`: tras recargar, la intro ofrece `[data-testid="continuar"]` (hito 8).
- `terminada`: tras recargar en el fin, la intro ofrecería `[data-testid="ver-resultado"]` (fuera de
  alcance; E2E-001 termina con la tarjeta, no recarga tras ella).
- **Regla**: para el hito 10 se limpia `localStorage` antes de abrir el enlace, simulando un contexto
  limpio.

### TarjetaFinal

Resumen compartible de la carrera.

- **Campos observados**: `nombre` (`tarjeta-nombre`), `hitos` (`tarjeta-hitos`).
- **Regla**: el `nombre` mostrado tras abrir el enlace MUST coincidir con el del personaje creado en
  el hito 2 (FR-007, FR-010).

### EnlaceCompartible

- **Origen**: botón `copiar-enlace` en el fin (genera con `codificar(tarjeta)`).
- **Forma**: URL absoluta que contiene `/r/<codigo>`.
- **Regla**: MUST contener `/r/` (FR-009); al abrirla, la tarjeta se reproduce (FR-010).

## Invariantes verificables

1. **Progreso**: en cada interacción la `ClavePantalla` cambia; nunca hay dos iteraciones con la misma
   clave dentro del bucle (evita bucles infinitos y atascos).
2. **Cobertura**: los 10 hitos se ejecutan y se reportan; si uno falla, el informe lo nombra.
3. **Continuidad**: `ClavePantalla` antes de recargar == después de `continuar`.
4. **Identidad**: nombre del hito 2 == nombre en `tarjeta-nombre` del hito 7 y del hito 10.
5. **Alcance**: la prueba no depende de posiciones, fases, premios ni número de años concretos.

## Transiciones (bucle jugable)

```text
intro --empezar--> crear-personaje --crear--> modalidad --elegir--> variante --elegir--> [bucle]
[bucle]: decision --elegir--> (decision | resultado | cambio-variante | fin)
         resultado --continuar-ano--> (decision | cambio-variante | fin)
         cambio-variante --elegir--> (decision | resultado | fin)
[fin] --> tarjeta final --> compartir --> /r/<codigo>
```

La prueba trata `[bucle]` como una máquina de estados: en cada iteración lee la `pantalla` y ejecuta
la acción que corresponda, sin asumir el orden.
