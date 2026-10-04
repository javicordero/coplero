# Research: Mejoras de usabilidad del formulario de situaciones

**Feature**: `024-form-ux-improvements` · **Date**: 2026-10-05

Resuelve las incógnitas del Technical Context y fija las decisiones de diseño. No quedan
`NEEDS CLARIFICATION` (la spec se cerró en `/speckit.clarify`).

---

## R1 · Algoritmo de derivación de identificadores (slug)

**Decision**: función pura `derivarId(texto): string` que:
1. Pasa a minúsculas y descompone en NFD para separar diacríticos.
2. Elimina los diacríticos (`.replace(/[\u0300-\u036f]/g, "")`).
3. Sustituye cualquier carácter que no sea `[a-z0-9]` por `_`.
4. Colapsa `_+` en uno y recorta `_` al inicio y al final.
5. Resultado: `te_dejan_fuera_por_un_punto`, `vas_a_ir_al_falla`.

Se implementa en `src/panel/identificadores.ts` (módulo **puro**, sin `node:fs` y sin Zod en runtime).

**Rationale**: `String.prototype.normalize("NFD")` existe en Node 22 y en todos los navegadores
objetivo; evita cualquier dependencia de slug. El formato con guion bajo coincide con los ids reales
del banco (`v_ruptura_grupo`, `tema_social`).

**Alternatives considered**:
- Mantener mayúsculas o acentos → choca con los ids existentes y con la expectativa del spec (FR-001).
- Usar un paquete de slug (`slugify`) → dependencia nueva innecesaria (constitución, stack cerrado).
- Separar palabras con guion `-` en vez de `_` → rompe la convención del banco.

---

## R2 · Desambiguación ante colisión de identificador

**Decision**: `derivarIdUnico(base, usados: Set<string>): string`. Si `base` no está en `usados`,
devuelve `base`. Si está, prueba `base_2`, `base_3`, … hasta encontrar uno libre. La UI muestra el id
resultante y, si difiere del slug "natural", un aviso de que se ha ajustado automáticamente.

**Rationale**: FR-021 pide resolver la colisión sin bloquear. Empezar en `_2` (no `_1`) deja claro que
es la segunda. El conjunto `usados` se calcula client-side a partir del banco ya cargado (ids de
situaciones + condicionales) y, para opciones, de los ids de las demás opciones de la misma situación.

**Alternatives considered**:
- Bloquear con error (comportamiento actual) → lo que el spec quiere evitar (FR-021).
- Añadir un hash/sello temporal → ids ilegibles; rompe la convención.

---

## R3 · Catálogo de flags para el multiselect

**Decision**: exponer las **flags declaradas** del banco (las que aparecen en `opcion.flags` de
cualquier situación o condicional) como una lista ordenada y sin duplicados. El catálogo se calcula
con `flagsDeclaradas` (ya existente en `src/content/informe.ts`, puro) y se sirve al panel mediante el
payload del `GET` del banco (campo `flags`), evitando una petición adicional. Además, el selector de
**`flags`** (lo que la opción deja) permite **crear una flag nueva** y la incorpora al catálogo en
memoria; el selector de **`consume`** solo ofrece flags ya existentes.

**Rationale**:
- FR-011 exige elegir de "las flags existentes en el banco". `flagsDeclaradas` ya define esa fuente de
  verdad y se reutiliza (nada de listas paralelas).
- El selector de `flags` debe poder crear flags nuevas porque dejar una huella es el **origen** de
  toda flag: sin esa vía, el panel no podría dar de alta contenido que introduce una flag que un
  condicional nuevo necesite. `consume`, en cambio, solo tiene sentido para flags que ya existen.
- Servirlo en el mismo payload evita un endpoint extra y un round-trip (simplicidad, YAGNI).

**Alternatives considered**:
- Endpoint aparte `GET /api/panel/flags` → un viaje más y más superficie para el mismo dato. Se
  descarta salvo que el payload crezca demasiado (no es el caso).
- Catálogo escrito a mano → se desincronizaría; prohibido por el principio II (contenido como datos).
- Cerrar también `flags` a valores existentes → impediría introducir contenido nuevo con flags nuevas
  desde el panel (contradicción detectada en el análisis); descartado.

---

## R4 · Edición de condicionales: dónde viven y cómo se vuelcan

**Decision**: el almacén del panel pasa a representar el **banco completo**:
`{ version: 2, situaciones: Situacion[], condicionales: Condicional[] }`.

- `VERSION_ALMACEN` sube de `1` a `2`. La lectura de un almacén v1 (sin `condicionales`) se
  **migra** sembrando `condicionales: []` (el importador los trae del contenido actual); no se
  inventan condicionales.
- `importarBancoActual` importa situaciones **y** condicionales del `bancoContenido` actual.
- El generador vuelca, además de `decisiones/{verano,febrero}.ts`, los ficheros
  `condicionales/{verano,febrero}.ts` (hoy escritos a mano; pasan a ser **generados**), con las
  mismas garantías de determinismo y cabecera "GENERADO".
- La validación cruzada (`BancoContenidoSchema`) pasa a validar el banco **completo desde el almacén**
  (ya no mezcla las situaciones del almacén con los condicionales "vivos" de `content`).

**Rationale**: FR-017/FR-018 (Q4) piden editar condicionales. Mantener un único almacén con el banco
completo conserva una sola tubería de validación/backup/volcado y evita que condicionales y
situaciones se desincronicen (p. ej. al borrar una situación que declara una flag que un condicional
requiere). El volcado determinista de condicionales es un efecto colateral bienvenido: hoy son la
única parte del banco editada a mano.

**Alternatives considered**:
- Segundo almacén `condicionales.json` → duplica CRUD, backup, migración y validación. Descartado.
- No volcar condicionales y dejar que se editen solo en el almacén → el almacén dejaría de ser la
  fuente de verdad única; el juego no vería los cambios. Descartado.
- Mantener v1 del almacén y añadir `condicionales` como campo opcional sin subir versión → rompe la
  garantía de "objeto estricto versionado" y dificulta detectar almacenes antiguos. Descartado.

---

## R5 · Casilla "repetible" sin tocar el dato

**Decision**: el formulario muestra una casilla **"repetible" desmarcada por defecto** cuya lógica es
`repetible = !unicaVez`. Al guardar, `unicaVez = !repetible` (o se omite cuando `unicaVez` es `true`
por defecto). El esquema Zod y el motor **no cambian**.

**Rationale**: Q2. Evita migrar las 27 situaciones y el re-volcado de datos. Es un cambio puramente de
presentación.

**Alternatives considered**:
- Renombrar el campo a `repetible` en `content/schema.ts` y el motor → migración masiva, fuera del
  alcance "solo panel" y con riesgo de tocar el balance. Descartado por Q2.

---

## R6 · Identificador inmutable al editar

**Decision**: la derivación automática rellena el id **solo al crear**. Una vez creada la entidad, el
campo id del formulario se muestra deshabilitado (como hoy). El botón "Nueva situación/condicional"
parte de un borrador con id vacío que se rellena al teclear el título. La derivación no sobrescribe un
id que el diseñador haya editado a mano.

**Rationale**: es la regla actual del panel (`FormularioSituacion.svelte` deshabilita el id al editar;
`crud.ts` rechaza cambiar el id). Mantenerla evita romper referencias (flags de requisito, menciones en
el resumen, etc.).

**Alternatives considered**:
- Permitir cambiar el id al editar y reescribir referencias → complejo y arriesgado; no pedido.

---

## R7 · Estructura de UI para dos tipos de entidad

**Decision**: `Panel.svelte` añade un **conmutador de vista** (Situaciones | Condicionales) y carga el
banco completo una sola vez. `TablasMomentos.svelte` se generaliza para listar el tipo activo,
mostrando una columna/etiqueta que distingue situación de condicional; en la vista de condicionales
muestra además sus campos propios (ventana, probabilidad, requisito).

**Rationale**: mantiene una sola isla (principio IV), evita duplicar la tabla y reutiliza el agrupado
por momento. El listado conjunto con etiqueta hace evidente la relación entre ambos.

**Alternatives considered**:
- Dos páginas de panel separadas → duplica la isla y la carga. Descartado.

---

## R8 · Alcance de tests

**Decision**: tests unitarios de Vitest sobre la lógica nueva (pura): `identificadores` (slug +
desambiguación), `flags` (catálogo), `esquema` (migración v1→v2), y se **amplían** `crud`, `generador`,
`importador`, `almacen` para cubrir condicionales. No se añaden tests e2e (el panel es solo-dev y no
tiene suite Playwright propia).

**Rationale**: principio III (verificación determinista) aplicado a la lógica disponible; los tests de
UI de una herramienta local no aportan valor proporcional. La regresión de contenido real queda cubierta
por los tests de integridad existentes, que siguen pasando porque el esquema de `content` no cambia.

**Alternatives considered**:
- Tests de componente Svelte → fuera del toolchain actual (no hay setup de testing de componentes);
  YAGNI para una herramienta mono-usuario.
