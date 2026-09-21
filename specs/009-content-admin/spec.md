# Feature Specification: Panel local de situaciones y volcado al juego

**Feature Branch**: `009-content-admin`

**Created**: 2026-09-20

**Status**: Draft — reanudada el 2026-09-20, con la feature 008 ya cerrada (modelo de decisiones sin efecto)

**Input**: User description: "Necesito crear un panel administrativo para crear, editar o eliminar situaciones. Una manera que se me ha ocurrido sin tener que crear base de datos es crear una base de datos local en formato json o algo y que el panel administrativo apunte a eso. Con json-server o algo así. Para después pasar esas situaciones a nuestro juego deberíamos crear un script que lea ese json y sea capaz de traspasarlo al juego. El objetivo de esta especificación es crear esas 2 cosas. Solo debe funcionar en local, lo podemos añadir al gitignore si quieres o lo que sea, es para mí. O si podemos hacerlo de otra manera sin meterlo en el gitignore coméntame. A la hora de crear una situación se debe abrir un formulario en el que podamos meter todos los campos. Como la modalidad (si corresponde, hay situaciones para ambas modalidades), el título, subtítulo, opciones, si mejora algún atributo o lo que sea (Esto hay que darle una vuelta ya que está relacionado directamente con la SPEC Decisiones que no afectan al resultado). También en el panel debo tener como una tabla de las situaciones separadas por categorías, es decir diferentes tablas, con un encabezado que diga cuántas hay de cada categoría también. Y poder abrir una situación para verla o si somos capaces en la tabla de poner la situación y opción 1 y 2, mejor. Mejor esto último, sí."

> **Nota de reordenación (2026-09-20)**: esta feature era la 008 y se movió a 009. Va **después** de la **008 · Decisiones que no afectan al resultado**, porque el formulario de "efectos" de una opción depende del modelo que define la 008. Decisiones ya tomadas para cuando se retome: **(1)** el JSON es la fuente de verdad y un script genera los `.ts` (el proyecto sigue viendo TS); **(2)** el "efecto" por defecto de una opción es ninguno (ver 008). Resuelto (2026-09-20): se versionan panel y almacén JSON; el acceso en producción se bloquea por un guard de desarrollo.

## Clarifications

### Session 2026-09-20

- Q: ¿Cómo se modela una "decisión que no afecta al resultado"? (FR-015) → A: es el caso **por defecto** (sin `efectos`); una opción que sí mueve atributos es una **excepción declarada** (`excepcion: true`, con efectos y contrapartida visible en el subtítulo), según el modelo de la 008.
- Q: ¿El almacén local es la única fuente de verdad o convive con los ficheros actuales? (FR-020) → A: es la **única fuente de verdad**; el volcado **regenera** `src/content/decisiones/**` y esos ficheros no se editan a mano. Condicionales y textos quedan fuera de la v1.
- Q: ¿Qué se versiona en git? (FR-021) → A: el **panel y el almacén JSON**, ambos en el mismo repositorio. El acceso en producción se bloquea por un guard de desarrollo (404 fuera de desarrollo), con independencia de que el código esté versionado.
- Q: ¿Cómo se llena el almacén la primera vez? (FR-022) → A: con un comando explícito de **importación** del banco actual (`src/content` → JSON); sin almacén, el panel arranca vacío y ofrece importar. Se guarda copia de seguridad antes de importar.

### Session 2026-09-21

- Q: ¿Dónde se crean las categorías de las situaciones? (FR-014, FR-023) → A: opción **B2**: el panel las gestiona en una pantalla «Categorías» escribiendo `src/content/categorias.ts` (fuente única del catálogo). No se pueden borrar categorías **en uso**; el renombrado queda fuera de alcance. El tipo `Categoria` del motor se relaja a `string` porque el motor no puede importar de `content`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el banco de situaciones por categorías (Priority: P1)

El diseñador abre el panel en su máquina y ve todas las situaciones del juego organizadas en tablas separadas por categoría, cada tabla con un encabezado que indica cuántas situaciones contiene, y cada fila mostrando la situación junto con sus opciones. Puede abrir cualquiera para verla entera. Sirve para hacerse una idea del banco de un vistazo y detectar huecos.

**Why this priority**: sin una vista fiable del banco no se puede crear ni editar con criterio. Es la base del panel y lo primero que aporta valor.

**Independent Test**: abrir el panel con el banco actual cargado y comprobar que aparecen todas las situaciones, agrupadas por categoría, con recuentos correctos y con la situación y sus opciones visibles en cada fila.

**Acceptance Scenarios**:

1. **Given** el banco actual, **When** se abre el panel, **Then** se muestran tablas separadas por categoría.
2. **Given** una categoría con N situaciones, **When** se muestra su tabla, **Then** el encabezado indica N y la tabla contiene exactamente N filas.
3. **Given** una situación con al menos dos opciones, **When** se muestra su fila, **Then** se ven la situación y las opciones (al menos la 1 y la 2).
4. **Given** una situación, **When** se abre, **Then** se ven todos sus campos.
5. **Given** dos categorías, **When** se comparan sus recuentos, **Then** la suma de recuentos coincide con el total de situaciones del banco.

---

### User Story 2 - Crear, editar y eliminar situaciones (Priority: P1)

El diseñador crea una situación nueva rellenando un formulario con todos los campos del modelo (momento, tipo, categoría, título, texto, modalidades, variantes, año mínimo, si es única, peso y opciones con sus flags y, solo si son excepciones declaradas, sus efectos), o edita una existente, o la elimina. Al guardar, si algo no cumple las reglas del juego, se lo dice de forma legible y no lo guarda a medias.

**Why this priority**: es el núcleo de la herramienta: sin alta/edición/borrado no hay panel. Va a la par de la vista (P1).

**Independent Test**: crear una situación válida desde el formulario, verla aparecer en su tabla, editarla, comprobar el cambio, y eliminarla; e intentar guardar una situación inválida y comprobar que se rechaza con un mensaje comprensible.

**Acceptance Scenarios**:

1. **Given** el formulario en blanco, **When** se rellenan todos los campos obligatorios y se guarda, **Then** la situación aparece en su tabla y queda persistida en local.
2. **Given** una situación existente, **When** se edita un campo y se guarda, **Then** el cambio se refleja en la tabla y persiste.
3. **Given** una situación existente, **When** se elimina y se confirma, **Then** desaparece de la tabla y del almacén local, y el recuento de su categoría baja en uno.
4. **Given** un formulario con datos inválidos (campos vacíos, menos de dos opciones, ids de opción duplicados), **When** se intenta guardar, **Then** se rechaza con un mensaje legible y no se corrompe el almacén.
5. **Given** una situación con filtro de modalidad (o sin él, aplicable a ambas), **When** se guarda, **Then** el filtro queda reflejado tal cual.
6. **Given** una situación con varias opciones, **When** se guarda, **Then** se conservan todas las opciones con sus campos.

---

### User Story 3 - Volcar las situaciones al juego (Priority: P2)

Cuando el diseñador da el banco por bueno en el panel, ejecuta un proceso que lee el almacén local y lo convierte en el contenido real del juego, con las mismas reglas de validación del juego. Si algo no cuadra, se lo dice con un mensaje claro y no genera contenido roto.

**Why this priority**: cierra el bucle (panel → juego). Es imprescindible para que el trabajo del panel sirva, pero depende de que existan datos y puede hacerse tras la vista y CRUD.

**Independent Test**: con un almacén local válido, ejecutar el proceso y comprobar que el juego usa esas situaciones; con un almacén inválido, comprobar que falla con un mensaje legible y no deja el juego en un estado roto.

**Acceptance Scenarios**:

1. **Given** un almacén local válido, **When** se ejecuta el volcado, **Then** el juego incorpora las situaciones con todos sus campos intactos.
2. **Given** un almacén con un error, **When** se ejecuta el volcado, **Then** se muestran los problemas de forma legible y no se genera contenido roto.
3. **Given** un almacén con situaciones nuevas y editadas, **When** se ejecuta el volcado, **Then** el juego refleja exactamente el estado del almacén.
4. **Given** una situación creada solo en el panel, **When** se ejecuta el volcado, **Then** aparece en el juego sin tocar código a mano.

---

### Edge Cases

- **Almacén local inexistente**: el panel arranca sin error y ofrece **importar** el banco actual desde `src/content` (ver FR-022).
- **Almacén con JSON corrupto**: se avisa de forma legible y no se pierde el contenido bueno.
- **Id de situación duplicado**: se rechaza al guardar.
- **Id de opción duplicado dentro de una situación**: se rechaza.
- **Menos de dos opciones**: se rechaza (el modelo exige opciones mínimas).
- **Opción que cambia modalidad y variante a la vez**: se rechaza (regla del juego).
- **Cambio de variante que no existe o no pertenece a las modalidades de la situación**: se rechaza.
- **Cambio de modalidad fuera de verano**: se rechaza.
- **Condicional que referencia una flag que no declara ninguna opción**: se detecta en el volcado.
- **Eliminar una situación cuya flag usa un condicional**: el volcado debe avisar de la flag huérfana.
- **Caracteres especiales en textos** (tildes, comillas, `{}`): se guardan y se vuelcan sin romper nada.
- **Situación común (sin filtros) para cada momento/tipo**: al volcar hay que preservar la regla de que exista al menos una por momento/tipo.
- **Panel en producción**: no debe ser accesible fuera de local.
- **Eliminar una categoría en uso**: se rechaza con un mensaje legible (por una situación o un condicional), igual que la flag huérfana.

## Requirements *(mandatory)*

### Functional Requirements

**Alcance y localidad**

- **FR-001**: El panel MUST funcionar únicamente en local (máquina del diseñador) y MUST NOT exponerse en producción. La inaccesibilidad se garantiza sirviendo el panel **solo en desarrollo** (cualquier ruta del panel responde 404 fuera de desarrollo), con independencia de que su código esté versionado.
- **FR-002**: El panel MUST persistir los cambios en un almacén local en disco, sin base de datos ni servicio externo.
- **FR-003**: El panel MUST ser de un solo usuario (el diseñador) y no requiere autenticación.

**Consulta**

- **FR-004**: El panel MUST mostrar las situaciones en tablas separadas por categoría.
- **FR-005**: Cada tabla MUST indicar en su encabezado cuántas situaciones contiene.
- **FR-006**: Cada fila MUST mostrar la situación y sus opciones (al menos la opción 1 y la 2).
- **FR-007**: El panel MUST permitir abrir una situación para ver todos sus campos.

**Edición**

- **FR-008**: El panel MUST permitir crear una situación con todos los campos del modelo: `momento`, `tipo`, `categoria`, `titulo`, `texto`, `modalidades` (opcional), `variantes` (opcional), `minAno` (opcional), `unicaVez` (opcional), `peso` (opcional) y una lista de opciones.
- **FR-009**: Cada opción MUST permitir `titulo`, `subtitulo`, `flags`, `consume`, `peso`, `saltaCOAC`, `cambiaModalidad` y `cambiaVariante` y, **solo** para las excepciones declaradas, `excepcion: true` con sus `efectos` por atributo.
- **FR-010**: El panel MUST permitir editar cualquier situación existente conservando todos sus campos.
- **FR-011**: El panel MUST permitir eliminar una situación, con confirmación previa.
- **FR-012**: El panel MUST validar con las **mismas reglas del juego** antes de guardar y MUST mostrar los errores de forma legible, sin escribir datos inválidos.
- **FR-013**: Cuando una situación no aplica a una sola modalidad, el formulario MUST permitir dejarla sin filtro (común a ambas) o marcarla para una o varias modalidades.
- **FR-014**: El panel MUST trabajar con los catálogos cerrados del juego (momentos, tipos, atributos, modalidades, fases) sin inventar valores nuevos. Las **categorías** se gestionan como describe FR-023.
- **FR-015**: Al representar una decisión, el panel MUST distinguir las opciones que **no afectan al resultado** (caso por defecto, sin campos de efecto) de las **excepciones declaradas** que sí mueven atributos (`excepcion: true`, con sus efectos y una contrapartida visible en el subtítulo). El modelo es el de la feature 008; el panel MUST NOT inventar otro.
- **FR-023**: El panel MUST permitir **añadir y eliminar categorías** de situación desde una pantalla propia. El catálogo vive en `src/content/categorias.ts` (generado, fuente única) y el formulario MUST ofrecer esos mismos valores. MUST rechazar eliminar una categoría **en uso** por alguna situación o condicional, y MUST NOT dejar el catálogo vacío. El **renombrado** de categorías queda fuera de alcance.

**Volcado al juego**

- **FR-016**: MUST existir un proceso que lea el almacén local y lo convierta en el contenido real del juego, sin editar a mano.
- **FR-017**: El volcado MUST preservar todos los campos de cada situación y de cada opción, sin pérdidas ni transformaciones silenciosas.
- **FR-018**: El volcado MUST validar con las mismas reglas del juego y, si algo falla, MUST detenerse con un mensaje legible y MUST NOT dejar el contenido del juego roto.
- **FR-019**: El volcado MUST ser reproducible: el mismo almacén local produce el mismo contenido del juego.
- **FR-020**: El panel y el volcado MUST reutilizar la validación existente del juego; MUST NOT duplicar sus reglas. El **almacén local es la única fuente de verdad**: el volcado **regenera** los ficheros de situaciones del juego (`src/content/decisiones/**`) a partir del almacén, que MUST NOT editarse a mano. En esta v1 los condicionales y los textos siguen escribiéndose a mano y el volcado MUST NOT tocarlos.
- **FR-022**: MUST existir un proceso de **importación** (`npm run panel:importar`) que vuelque el banco de situaciones actual (`src/content/decisiones/**`) al almacén local JSON, para la primera carga y para re-sincronizar. El panel, cuando no encuentra almacén, MUST arrancar sin error y MUST ofrecer ejecutar esa importación. Antes de importar MUST crearse una copia de seguridad del almacén previo.

**Gestión de la herramienta**

- **FR-021**: MUST versionarse en el repositorio del juego el código del panel y el almacén local (fuente de verdad). El panel MUST NOT exponer datos personales, y el almacén MUST contener únicamente el banco de situaciones.

### Key Entities *(include if data involved)*

- **Situación**: decisión del banco (momento, tipo, categoría, título, texto, filtros opcionales y una o más opciones).
- **Opción**: rama de una situación (título, subtítulo, flags, consumos, peso y efectos internos de trayectoria). Por defecto **no mueve atributos**; solo las **excepciones declaradas** llevan efectos sobre atributos.
- **Almacén local**: fichero de datos en disco, editable desde el panel, que actúa como base de datos local.
- **Volcado**: proceso que convierte el almacén local en el contenido que consume el juego, validado con las reglas del juego.
- **Decisión que no afecta al resultado**: opción cuyo valor es narrativo y no cambia los atributos; es el comportamiento **por defecto**. Su opuesta es la **excepción declarada** (`excepcion: true`).
- **Catálogos cerrados**: momentos, tipos, categorías, atributos, modalidades y fases; no se inventan valores fuera de ellos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las situaciones del banco actual aparecen en el panel, agrupadas por categoría y con recuentos que coinciden con la realidad.
- **SC-002**: Se puede crear una situación desde cero en el panel y verla en el juego ejecutando el volcado, sin editar ningún fichero a mano.
- **SC-003**: El 100% de los intentos de guardar contenido inválido se rechazan con un mensaje legible y no corrompen el almacén.
- **SC-004**: Un almacén con errores nunca produce contenido del juego roto: el volcado falla de forma legible en el 100% de los casos.
- **SC-005**: El volcado preserva el 100% de los campos de situación y opción (sin pérdidas).
- **SC-006**: Un mismo almacén local produce siempre el mismo contenido (100% reproducible).
- **SC-007**: El panel no es accesible en producción en el 100% de los casos.
- **SC-008**: El ciclo completo (crear → volcar → ver en el juego) se realiza en menos de 2 minutos.
- **SC-009**: El banco actual se importa al almacén con **un solo comando** y el 100% de las situaciones existentes queda disponible en el panel.
- **SC-010**: Se puede añadir una categoría desde el panel y aparece en el formulario de situación **sin tocar código**; intentar eliminar una categoría en uso se rechaza en el 100% de los casos.

## Assumptions

- **Herramienta de un solo usuario**: el diseñador del juego; sin login ni permisos.
- **Reutiliza el modelo y el esquema existentes**: los campos y las reglas son los de `src/content/schema.ts`; el panel no introduce un modelo paralelo.
- **Sin base de datos**: el almacén es un fichero de datos local, coherente con la v1 sin persistencia en servidor.
- **Recomendación sobre la infraestructura local**: se evaluó `json-server` y se descarta como opción principal por añadir un segundo proceso y una dependencia genérica. **Decidido (2026-09-20)**: una ruta local dentro del propio proyecto que lee/escribe el fichero de datos, reutilizando el esquema del juego, servida **solo en desarrollo** (404 en producción) y con el almacén JSON versionado. El detalle se cerrará en el plan.
- **Solo en desarrollo**: el panel se sirve únicamente en el entorno local y no se construye en el despliegue.
- **Alcance de esta primera versión: situaciones**. Los condicionales comparten forma con las situaciones y quedan como extensión posterior (registrar si se posponen).
- **El panel no inventa catálogos**: momentos, tipos, categorías, atributos, modalidades y fases son cerrados.
- **Coherencia con el motor**: el volcado no cambia reglas del motor; solo produce datos conformes al esquema vigente.
- **Los ficheros del juego se siguen validando en build** con Zod, como hoy.
- **Categorías**: siguen siendo el catálogo del juego, pero gestionable desde el panel; `src/content/categorias.ts` es su fuente única y el tipo `Categoria` del motor es `string` (el motor no puede importar de `content`; la validación fuerte la hace el Zod del contenido).
