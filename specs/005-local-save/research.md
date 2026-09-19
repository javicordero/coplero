# Phase 0 — Research: Persistencia local de la partida

Todas las incógnitas del Technical Context quedan resueltas aquí. No se introduce backend.

## R1. Dónde vive la lógica de persistencia

- **Decisión**: `src/juego/persistencia.ts`, con un `Almacen` inyectable (`getItem`/`setItem`/`removeItem`). El `engine` no se toca.
- **Rationale**: la Constitución (Principio I) prohíbe DOM en el `engine`; separar la capa permite tests puros con un almacén en memoria y mantiene el motor reproducible.
- **Alternativas consideradas**: (a) guardar dentro del `engine` — rechazado por violar el Principio I; (b) un servicio aparte fuera de `src/juego` — rechazado por YAGNI (Principio V).

## R2. Formato del guardado

- **Decisión**: un único sobre JSON `{ version: number, partida: string }`, donde `partida` es el resultado de `serializar(Partida)` (JSON plano). Sin compresión.
- **Rationale**: el payload real de una carrera completa ronda los **14 KB** (medido en test), muy por debajo del **1% del límite típico de `localStorage` (5 MB → 51 KB)** que exige SC-006. La compresión (`fflate`) está reservada al código compartible en URL, que es otra feature. Legible y depurable.
- **Alternativas consideradas**: (a) guardar `Partida` directa — rechazado: sin sitio para la versión del sobre; (b) comprimir con `fflate` — innecesario y dificulta depurar.

## R3. Versionado de esquema (dos capas)

- **Decisión**: `VERSION_GUARDADO` es la **versión del sobre** y se valida primero; después `deserializar` valida `VERSION_PARTIDA` del `engine`. Ambas deben coincidir para restaurar.
- **Rationale**: separa "cambió el formato de mi guardado" de "cambió el formato de la partida que produce el motor". Detecta ambos casos (FR-005/FR-006) sin acoplar la UI al motor.
- **Alternativas consideradas**: (a) reutilizar `VERSION_PARTIDA` como versión de guardado (estado actual) — funciona hoy pero impide evolucionar el sobre sin mover el motor; (b) hash del contenido — sobra para v1.

## R4. Cómo se detecta una partida terminada

- **Decisión**: `partida.fase === "fin"` (tipo `FasePartida` del `engine`). En la carga, una partida terminada produce `estadoGuardado = "terminada"`; al continuarla se muestra el resumen final (`FinCarrera`).
- **Rationale**: el motor ya modela la fase `fin`; no hace falta campo nuevo ni recomputar la carrera.
- **Alternativas consideradas**: (a) recomputar `siguientePaso` y mirar si es `"fin"` — válido pero redundante; (b) añadir un booleano `completada` al estado — duplica información.

## R5. Estado del guardado para la UI

- **Decisión**: sustituir el booleano `hayGuardado` por `estadoGuardado: "ninguno" | "en-curso" | "terminada"`, derivado de la carga inicial (una sola lectura al arrancar).
- **Rationale**: la home necesita distinguir tres situaciones (FR-004, FR-016): nada, continuar la carrera, o ver el resultado final. Una única lectura evita recargar el almacén en cada render.
- **Alternativas consideradas**: mantener `hayGuardado` + un booleano extra — dos fuentes que pueden desincronizarse.

## R6. Aviso puntual y borrado del guardado inservible

- **Decisión**: `cargar()` elimina del almacén cualquier sobre con versión distinta, JSON inválido, tipos inesperados o `partida` que no deserializa, y devuelve `descartado: true`. El estado de la isla guarda ese flag para mostrar **un** aviso en la intro; como el sobre ya se borró, no vuelve a aparecer.
- **Rationale**: cumple FR-006/FR-007/FR-008 y la clarificación Q3-A ("borrar tras aviso puntual"), evitando avisos repetidos en cada apertura.
- **Alternativas consideradas**: conservarlo e ignorarlo (Q3-B/C) — rechazado por el usuario.

## R7. Almacenamiento no disponible (degradación sin aviso)

- **Decisión**: `almacenNavegador()` sondea la disponibilidad (escribir y borrar una clave de prueba dentro de `try/catch`) y, si falla o no existe `localStorage`, devuelve un almacén **no-op** (ignora escrituras y siempre devuelve `null`). `guardar`/`cargar`/`borrar` envuelven toda operación en `try/catch` y jamás lanzan.
- **Rationale**: FR-012 y SC-005 exigen jugar igual; Q2 pide **no avisar**. Un almacén no-op evita mostrar un "Continuar" falso (a diferencia de un fallback en memoria) y mantiene el flujo honesto.
- **Alternativas consideradas**: (a) fallback en memoria (código actual en `Juego.svelte`) — rechazado: simula un guardado que no sobrevive a la recarga; (b) avisar y/o bloquear (Q2-A/C) — rechazado por el usuario.

## R8. Varias pestañas

- **Decisión**: sin detección de conflicto; gana la última pestaña que guarde. No se usan eventos `storage`.
- **Rationale**: clarificación Q4-A y Principio V; una sola ranura y un caso poco probable no justifican sincronización.
- **Alternativas consideradas**: sincronizar vía `storage` events o bloquear la segunda pestaña — rechazado por complejidad.

## R9. Momento exacto del guardado

- **Decisión**: se persiste (1) al crear la partida (tras elegir variante) y (2) tras cada elección confirmada (`elegirOpcion`); también tras `continuar` (avance entre resultado y siguiente decisión) para no depender de la última decisión. Nunca se guarda un estado intermedio.
- **Rationale**: FR-001/FR-002; "guardar en cada elección" (`docs/02` §10) y a prueba de cierre de pestaña (SC-002).
- **Alternativas consideradas**: guardar solo al terminar la carrera — rechazado: perdería toda la carrera ante un cierre.

## R10. Datos ocultos y payload

- **Decisión**: se guarda la `Partida` completa (incluye `destino`, necesario para reproducir el futuro). El guardado **nunca se renderiza**; FR-014 se cumple no mostrando el techo en ninguna pantalla ni aviso. El código compartible en URL (feature futura) es quien debe excluir el `destino`.
- **Rationale**: sin `destino` la carrera guardada no sería reproducible (Principio I). No se añade coste ni superficie de fuga visible.
- **Alternativas consideradas**: serializar una `Partida` "pública" sin `destino` — rechazado: rompe el determinismo al restaurar.

## R11. Accesibilidad del aviso

- **Decisión**: el aviso de la intro se anuncia con `role="status"` y `aria-live="polite"`, texto llano y no técnico.
- **Rationale**: el aviso aparece tras una detección en la carga; los lectores de pantalla deben anunciarlo sin robar el foco (hallazgo diferido desde `/speckit.clarify`).
- **Alternativas consideradas**: `role="alert"` — demasiado agresivo para un aviso informativo.

## R12. Verificación

- **Decisión**: tests unitarios con almacén en memoria (ida/vuelta, versión distinta, corrupción, vacío, almacén que lanza, partida terminada) y ampliación del smoke E2E a "crear → decidir → recargar → continuar".
- **Rationale**: Principio III (tests deterministas) y SC-001/SC-002/SC-004.
- **Alternativas consideradas**: solo E2E — rechazado por lentitud y peor diagnóstico.
