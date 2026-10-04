# Research: Consumo de flags por condicional

**Feature**: `025-conditional-consumption` · **Date**: 2026-10-05

Resuelve las incógnitas del Technical Context y fija las decisiones de diseño. No quedan
`NEEDS CLARIFICATION` (la spec se cerró con decisiones explícitas del usuario).

---

## R1 · Forma de `Flag`: consumo por condicional

**Decision**: `Flag` pasa de `{ ano, veces, consumida: boolean, anosConsecutivos }` a
`{ ano, veces, consumidaPor: string[], anosConsecutivos }`, donde `consumidaPor` es la lista de ids de
los condicionales que han consumido esa flag.

**Rationale**: la spec exige que el consumo sea **por condicional** (FR-002): un condicional agotado no
debe bloquear a otros que compartan la flag. Un booleano global no puede expresarlo; una lista sí.

**Alternatives considered**:
- Mantener `consumida: boolean` y bloquear globalmente → rechazado (gastaría las flags compartidas).
- Guardar el consumo fuera de la flag (p. ej. en la partida, `condicionalesAgotados: string[]`) →
  factible, pero el estado "qué condicionales se han consumido" encaja mejor junto a la flag que lo
  originó y no obliga a rastrear la relación flag↔condicional por separado. Se elige la lista en la
  flag por simplicidad de consulta.

---

## R2 · Evaluar un requisito teniendo en cuenta al consumidor

**Decision**: `requisitoCumplido(req, estado, consumidor?: string)`. Al evaluar `flag` y
`flagRepetida`, si `consumidor` está presente y `flag.consumidaPor` lo contiene, el requisito **no** se
cumple. En los requisitos compuestos (`todas`/`alguna`/`ninguna`) el `consumidor` se propaga a los
hijos. En el selector se llama con el id del condicional que se está evaluando.

**Rationale**: es exactamente "este condicional ya gastó esta flag, no vuelve a dispararse por ella",
sin afectar a los demás. Mantener el parámetro opcional conserva compatibilidad con los usos actuales
(otros tests) y no rompe la pureza.

**Alternatives considered**:
- Consultar `consumidaPor` sin saber quién pregunta → no se puede distinguir "consumida por este
  condicional" de "consumida por otro"; rechazado.

---

## R3 · Consumo automático al dispararse: solo flags activas

**Decision**: `consumirFlagsDeRequisito(flags, req, condicionalId)` recorre las flags referenciadas por
`req` y añade `condicionalId` a `consumidaPor` **solo de las que existen** en el historial. Para
`ninguna`, las flags referenciadas están ausentes (por eso se cumple), así que no se consume ninguna.
En `partida.ts`, al resolver un condicional se llama siempre (ya no hay `consumeFlag`).

**Rationale**: FR-003 (solo las activas) y FR-004 (ninguna no consume). Para `alguna`, solo se consume
la que estaba activa y cumplió.

**Alternatives considered**:
- Consumir todas las referenciadas → gastaría flags que no hicieron falta; rechazado.
- Consumir en el momento de evaluar (antes de disparar) → consumiría aunque el dado no salga; debe
  ocurrir **al dispararse** (al elegir la opción), no al evaluar.

---

## R4 · `actualizarFlags` sin consumo manual

**Decision**: `actualizarFlags` deja de procesar `opcion.consume` (el campo desaparece). Al registrar
una flag nueva, `consumidaPor: []`; al re-ganar una existente, **se conserva** su `consumidaPor`.

**Rationale**: FR-006 (fuera el consumo manual) y el matiz acordado en la spec (re-ganar no limpia el
consumo previo).

**Alternatives considered**:
- Resetear `consumidaPor` al re-ganar → permitiría que el condicional volviera a salir; contradice la
  decisión acordada.

---

## R5 · Retirada de los campos de consumo del modelo y del panel

**Decision**:
- `src/content/schema.ts`: fuera `Opcion.consume` y `Condicional.consumeFlag`.
- `src/panel-ui/FormularioOpcion.svelte`: fuera el `SelectorFlags` de `consume`.
- `src/panel-ui/FormularioCondicional.svelte`: fuera la casilla `consumeFlag`.
- `src/panel-ui/DetalleCondicional.svelte`: fuera la fila `consumeFlag`.

**Rationale**: FR-006/FR-007 y SC-004. El esquema es `strictObject`, así que quitar el campo obliga a
migrar los datos (R7).

**Alternatives considered**:
- Dejar el campo en el esquema pero ignorarlo → deriva silenciosa; rechazado.

---

## R6 · Versión del estado (partida)

**Decision**: `VERSION_PARTIDA` sube de **2 a 3**. No se implementa migración: una partida guardada con
versión ≠ 3 se rechaza con `VERSION_INCOMPATIBLE` (comportamiento ya existente en `serializar.ts`).

**Rationale**: cambia la forma de `Flag` (FR-010). El motor ya rechaza versiones distintas; solo hay que
subir la constante. Se actualiza el test de serialización y se regenera el **snapshot**.

**Alternatives considered**:
- Migrar partidas v2→v3 (rellenar `consumidaPor` a partir de `consumida`) → trabajo extra sin valor: es
  un juego en desarrollo y la spec asume el descarte.

---

## R7 · Migración del almacén del panel (v2 → v3)

**Decision**: `VERSION_ALMACEN` sube a **3**. `migrarAlmacen` normaliza cualquier almacén al formato
actual:
- v1 → `{ version: 3, situaciones, condicionales: [] }`.
- v2 → `{ version: 3, situaciones, condicionales }` quitando `consume` de cada opción y `consumeFlag`
  de cada condicional.
- v3 → tal cual.

Además, los ficheros `.ts` de `content` (que hoy contienen `consumeFlag`) se normalizan (se les quita
el campo) para que `content/index.ts` vuelva a validar; después, `npm run panel:volcar` regenera los
ficheros desde el almacén.

**Rationale**: el esquema del juego es estricto; sin quitar los campos, ni el almacén ni el banco
validan. Mantener una única tubería (almacén → volcado) evita editar a mano los `.ts` generados.

**Alternatives considered**:
- Dejar `VERSION_ALMACEN` en 2 y tolerar los campos al leer → contradice el objeto estricto y oculta la
  incompatibilidad. Se prefiere subir versión y normalizar.

---

## R8 · Auditoría de simulación

**Decision**: la regla `flagConsumidaSinRegistro` pasa a comprobar
`flag.consumidaPor.length > 0 && !introducidas.has(id)`: una flag consumida por algún condicional pero
que nunca se introdujo en el historial es un estado imposible. Se mantiene el nombre de la regla.

**Rationale**: adapta la comprobación existente a la nueva forma sin cambiar el catálogo de reglas
(FR de la 002). No se añaden reglas nuevas.

**Alternatives considered**:
- Eliminar la regla → perdería una comprobación válida; rechazado.

---

## R9 · Registro de decisiones en la simulación

**Decision**: `DecisionRegistrada` pierde el campo `consume`; `jugar.ts` deja de registrarlo. Se
actualizan los helpers/fixtures de tests de simulación.

**Rationale**: `Opcion.consume` ya no existe; mantenerlo en el registro de simulación sería un campo
muerto.

**Alternatives considered**:
- Mantener `consume: []` en el registro → ruido sin uso; rechazado.

---

## R10 · Enmienda de la constitución y actualización de docs

**Decision**: se enmienda el **Principio II** de la constitución (línea de "consumir una flag") para
reflejar el consumo **por condicional** y la retirada del consumo manual (MINOR). Se actualizan
`docs/01` §6, `docs/02` §7, `AGENTS.md` §5.7 y `docs/registro/decisiones-cerradas.md`.

**Rationale**: gobernanza — la constitución y los documentos fuente no pueden quedar contradiciendo el
comportamiento real.

**Alternatives considered**:
- Dejar la constitución como está → contradice la realidad y la propia gobernanza; rechazado.

---

## R11 · Alcance de tests

**Decision**: tests unitarios deterministas en `engine` (consumo por condicional, flags compartidas,
requisito compuesto, re-ganar flag, versiones) y `simulacion` (auditoría). Se regenera el **snapshot**
de la partida de referencia. `npm run check` como puerta.

**Rationale**: principio III. El snapshot cambia porque el estado incluye las flags (su forma cambió).

**Alternatives considered**:
- Tests e2e del juego → no aplican a un cambio de reglas internas; el comportamiento visible no cambia
  salvo que un condicional deje de repetirse (cubierto por tests de motor).
