# Feature Specification: Banco de contenido real (importación del banco documentado)

**Feature Branch**: `003-content-bank`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "Implementa CONTENT-001. Importa las situaciones que existen actualmente en la documentación proporcionada. Las situaciones deben ser DATA. No introducir lógica de negocio dentro de ellas. Todas deben tener momento, tipo y categoría. Validar con Zod. IDs únicos. Flags consistentes. Requisitos referenciados deben existir. Modalidades y variantes deben respetar la documentación. No inventar situaciones nuevas para completar huecos. Crear tests de integridad del contenido."

## Clarifications

### Session 2026-09-19

- Q: ¿Qué se usa como cuerpo narrativo (`texto`) de cada situación, si la documentación solo da el nombre? → A: El nombre documentado se usa como `titulo` y `texto` queda vacío; no se inventa prosa y el hueco de redacción se registra como pendiente.
- Q: ¿Deben repetirse las situaciones base a lo largo de la carrera? → A: No; todas se marcan `unicaVez: true` y solo se reciclan cuando el pool del momento se agota.

### Revisión 2026-10-04

- Se **retiran** `tipo` (`contenido`/`personaje`) y `categoria` de las situaciones. Cada momento (`verano`/`febrero`) es un único pool y el motor elige una situación por momento; desaparece el reparto "una de contenido + una de personaje". Motivo: no aportaban mecánica, solo complejidad. Ver `docs/01` §4–5 y `docs/02` §9.
- Consecuencia: el condicional `cv_registro_social` pasa a dispararse con `tema_social` visto una vez (ver C13 en el registro).
- Q: ¿Se conecta el simulador al banco real en este feature (deuda T17)? → A: Sí; la CLI pasa a resolver el banco de `src/content` y se retira el banco de pruebas, sin recalibrar valores (T13 queda aparte).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Una carrera completa se puede jugar con el contenido real (Priority: P1)

El contenido documentado en `docs/03` (verano) y `docs/04` (febrero) pasa a ser el banco de situaciones que consume el motor. Al iniciar una partida, cada año recibe una decisión de verano y una de febrero con opciones narrativas reales, sin recurrir a datos de prueba.

**Why this priority**: sin contenido real el juego no existe; es la razón de ser del feature y desbloquea el uso del motor tal cual está.

**Independent Test**: ejecutar una partida completa contra el banco importado (los cuatro pares modalidad/variante) y comprobar que todos los años reciben situaciones válidas y que la partida termina con un resumen.

**Acceptance Scenarios**:

1. **Given** el banco de contenido importado, **When** se crea una partida de cualquier modalidad, **Then** cada paso de decisión ofrece una situación de verano o de febrero con al menos dos opciones con título y subtítulo.
2. **Given** el banco importado, **When** se juega una carrera entera sin errores de contenido insuficiente, **Then** ambos momentos tienen al menos una situación disponible.
3. **Given** una situación de tres opciones con opciones que implican no concursar, **When** el jugador la elige, **Then** esa temporada no se resuelve el COAC.

---

### User Story 2 - El contenido incorrecto se detecta antes de publicar (Priority: P2)

Quien mantiene el contenido añade o edita situaciones sin tocar el motor, pero cualquier inconsistencia (id duplicado, falta de `momento`, flag referenciada que no existe, modalidad o variante no prevista) hace fallar la validación con un mensaje claro.

**Why this priority**: el banco crecerá a 60-80 situaciones; sin una red de seguridad, un error de datos llega al jugador.

**Independent Test**: introducir a propósito un contenido inválido en un conjunto de prueba y comprobar que la validación falla señalando el id y el motivo.

**Acceptance Scenarios**:

1. **Given** un banco con dos situaciones del mismo `id`, **When** se valida, **Then** falla indicando el id duplicado.
2. **Given** una situación sin `momento`, **When** se valida, **Then** falla indicando el campo que falta.
3. **Given** un condicional cuyo requisito referencia una flag que ninguna opción declara, **When** se valida, **Then** falla indicando la flag huérfana.
4. **Given** una situación con `modalidades` o `variantes` que no existen en la documentación, **When** se valida, **Then** falla indicando el valor no permitido.

---

### User Story 3 - Informe de integridad del banco (Priority: P3)

Al terminar, se genera un informe con el recuento de situaciones por momento, el número de condicionales, las flags declaradas, las flags referenciadas y las situaciones potencialmente inalcanzables.

**Why this priority**: da visibilidad del estado del banco y detecta huecos de cobertura sin inventar contenido.

**Independent Test**: ejecutar el informe sobre el banco importado y comprobar que los totales cuadran con lo documentado.

**Acceptance Scenarios**:

1. **Given** el banco importado, **When** se ejecuta el informe, **Then** muestra el número de situaciones de verano, de febrero y de condicionales.
2. **Given** el banco importado, **When** se ejecuta el informe, **Then** lista las flags definidas, las referenciadas y las situaciones sospechosas de ser inalcanzables.

---

### Edge Cases

- **Un momento sin candidatos**: el motor degrada y recicla situaciones ya vistas; el contenido debe garantizar al menos una situación por momento.
- **Flag definida pero nunca referenciada**: es válida (para uso futuro o de premios) y solo aparece como observación en el informe, no como error.
- **Flag referenciada por un requisito y nunca declarada en ninguna opción**: es un error de integridad.
- **Situación exclusiva de una modalidad/variante**: se importa tal cual la documentación la describe; si solo existe para `chirigotero`, no se crea una equivalente de comparsa.
- **Condicional con ventana y probabilidad**: su requisito puede ser una combinación (p. ej. "A o B") o un atributo; la ventana y la probabilidad se toman de la documentación.
- **Situación que implica no concursar**: queda marcada para que el motor sepa que esa temporada no hay COAC, igual que un año sabático.
- **Año con `saltaCOAC` seguido de otro igual**: las flags se acumulan; no se borra ninguna.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El banco MUST ser datos: objetos declarativos en ficheros de contenido, sin lógica de juego (ni condicionales de flujo, ni cálculos, ni acceso al motor).
- **FR-002**: Toda situación MUST declarar `momento` (`verano`/`febrero`). No hay `tipo` ni `categoria` (retirados el 2026-10-04).
- **FR-003**: Todo el contenido MUST validarse con Zod antes de considerarse usable; un contenido inválido MUST hacer fallar la comprobación de calidad del proyecto.
- **FR-004**: Los identificadores de situación y de condicional MUST ser únicos en todo el banco.
- **FR-005**: Toda flag referenciada por un requisito MUST existir como flag declarada por alguna opción.
- **FR-006**: Las flags MUST NOT borrarse; las opciones declaran las flags que dejan, y el motor consume automáticamente (y **por condicional**) las flags de un requisito al dispararse. *(Revisado 2026-10-05, feature 025: se retira el consumo manual.)*
- **FR-007**: Cada opción MUST tener título y subtítulo, y declarar sus efectos sobre atributos y las flags que deja.
- **FR-008**: Las opciones que implican no concursar MUST quedar marcadas con `saltaCOAC: true`.
- **FR-009**: Los filtros opcionales `modalidades` y `variantes` MUST usarse solo donde la documentación los describa; su ausencia significa que la situación es común.
- **FR-010**: MUST NOT inventarse situaciones nuevas para completar huecos: solo se importa lo que existe en `docs/03` y `docs/04`.
- **FR-011**: MUST existir tests de integridad del contenido que cubran: ids únicos, presencia de `momento`, flags referenciadas existentes, opciones con título y subtítulo, y coherencia de modalidades/variantes.
- **FR-012**: MUST existir un informe de integridad que cuente situaciones por momento, condicionales, flags declaradas, flags referenciadas y situaciones potencialmente inalcanzables.
- **FR-013**: El contenido MUST NOT importar del motor ni de la web; el contenido es autocontenido y su forma MUST ser compatible con la que el motor espera, de modo que se pueda jugar una carrera completa con él.
- **FR-014**: Los condicionales MUST declarar su requisito, su ventana de disparo, su probabilidad y si consumen la flag.
- **FR-015**: Las situaciones y condiciones MUST usar atributos existentes, sin introducir nombres nuevos de efecto.
- **FR-016**: MUST NOT usarse nombres reales de personas ni de agrupaciones.
- **FR-017**: El banco MUST cubrir todos los momentos, de forma que una carrera completa nunca se quede sin decisión por falta de contenido.
- **FR-018**: El banco MUST incluir todas las situaciones documentadas (a día de hoy, las de `docs/03` y `docs/04`), sin descartar las de varias opciones ni las exclusivas de una modalidad.
- **FR-019**: Cada situación importada MUST tomar su `titulo` del nombre documentado y MUST dejar `texto` vacío; MUST NOT inventarse prosa narrativa. La ausencia de texto de cuerpo queda registrada como pendiente para una feature de redacción posterior.
- **FR-020**: Toda situación del banco importado MUST declarar `unicaVez: true`, de modo que no se repita hasta agotar el pool de su momento; el motor solo la recicla cuando no quedan candidatas.
- **FR-021**: La simulación masiva MUST usar el banco de contenido real de `src/content` y MUST retirar el banco de pruebas como fuente (deuda T17). La recalibración de valores numéricos queda fuera de este feature.

### Key Entities *(include if feature involves data)*

- **Situación**: una decisión narrativa con `id`, `momento`, título, texto y opciones; opcionalmente restringida por modalidad/variante y con reglas de unicidad (`unicaVez`, `minAno`).
- **Opción**: una alternativa con título, subtítulo, efectos sobre atributos, flags que deja y, si procede, la marca de no concursar.
- **Condicional**: una situación que solo entra en la baraja si se cumple un requisito, dentro de una ventana de años y con una probabilidad.
- **Requisito**: condición de disparo de un condicional: una flag, una flag repetida, una fase alcanzada, una combinación (todas/alguna/ninguna) o un umbral de atributo.
- **Flag**: marca persistente que deja una opción durante toda la carrera; se acumula y puede consumirse sin borrarse.
- **Banco de contenido**: el conjunto de situaciones y condicionales que consume el motor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Se puede jugar una carrera completa con el banco importado en las cuatro configuraciones de modalidad/variante sin que falte contenido en ningún momento.
- **SC-002**: El 100% de las situaciones documentadas en `docs/03` y `docs/04` está importado, con cero situaciones inventadas.
- **SC-003**: La comprobación de calidad del proyecto pasa con el banco importado (contenido válido y tests en verde).
- **SC-004**: Ante cada regla de integridad, existe una prueba que demuestra que su violación hace fallar la validación indicando el elemento culpable.
- **SC-005**: El informe de integridad reporta el número de situaciones de verano, de febrero, de condicionales, las flags declaradas, las flags referenciadas y las situaciones potencialmente inalcanzables.
- **SC-006**: Ningún fichero de contenido importa del motor ni de la web.
- **SC-007**: La simulación masiva puede ejecutar su lote de partidas usando únicamente el banco real de `src/content`, sin depender del banco de pruebas.

## Assumptions

- La fuente de verdad del banco es `docs/03-banco-verano.md` y `docs/04-banco-febrero.md`; no se importan situaciones de otros documentos.
- Los **eventos especiales de febrero** (`docs/04`) son alteraciones del concurso, no decisiones; quedan fuera de alcance (hueco T5 diferido) y no se modelan ahora.
- El equivalente de comparsa del cierre de popurrí y otras ampliaciones del banco están pendientes en la documentación: **no se inventan**; se importa solo lo existente y el hueco se refleja en el informe.
- Los **textos de cuerpo** de las situaciones no existen en la documentación: se dejan vacíos (no se redactan). Escribirlos es una tarea de contenido posterior, ajena a este feature.
- Los valores numéricos de los efectos se copian literalmente de la documentación; su calibración fina es responsabilidad del simulador (T13), no de este feature. Conectar el simulador al banco real (T17) puede alterar las cifras de balance; **recalibrar no entra** en el alcance.
- La pantalla administrativa para crear/editar/eliminar situaciones queda **fuera de alcance** por decisión del usuario; se abordará como feature aparte por su impacto en persistencia y arquitectura.
- El contenido se consume en build time; no hay base de datos ni edición en tiempo de ejecución en v1.
- Se reutiliza la semántica de modelo ya cerrada en `docs/01`/`docs/02` y en la constitución (momentos, flags que no se borran, `saltaCOAC`).
