# Phase 0 · Research — Textos de situación adaptados al género

Decisiones de diseño resueltas antes de modelar datos y contratos. No queda ningún `NEEDS
CLARIFICATION`; las dos dudas de producto (mecanismo y granularidad del no binario) ya se cerraron en
la clarificación del 2026-10-07 (ver `spec.md`).

---

## R1 · Forma y nombres de los campos femeninos

- **Decision**: campos **planos y opcionales** en las entidades existentes:
  - `Situacion.tituloFemenino?: string`, `Situacion.textoFemenino?: string`
  - `Opcion.tituloFemenino?: string`, `Opcion.subtituloFemenino?: string`
- **Rationale**: mínimo cambio en `strictObject` (Zod) y en las interfaces del motor; el formulario
  enlaza cada campo a un input directo; el generador del panel ya omite claves `undefined`; es
  coherente con el estilo plano de `saltaCOAC`, `cambiaModalidad`, `cambiaVariante`. Se conservan los
  nombres actuales (`titulo`, `texto`, `subtitulo`) como **forma por defecto** (no se renombran).
- **Alternatives considered**:
  - Objeto anidado `femenino: { titulo?, texto? }` / `femenino: { titulo?, subtitulo? }`: más
    "limpio" pero más profundo en el serializador y en los formularios, y con más superficie de
    validación. Se descarta por simplicidad (YAGNI).
  - Marcar cada opción con un `genero` fijo: no modela "varía por campo" ni la mezcla del no binario.

## R2 · Semántica de resolución

- **Decision**: función pura `resolverTexto(porDefecto, femenino, genero, campo, azar)`:
  - Si `femenino` es `undefined`, cadena vacía o **solo espacios** → **forma por defecto** (cualquier género).
  - Si hay `femenino` válido:
    - `femenino` → texto femenino.
    - `masculino` → forma por defecto.
    - `no_binario` → `azar(campo) < 0.5 ? femenino : porDefecto`.
- **Rationale**: cubre exactamente FR-003…FR-007. El texto por defecto es el respaldo universal, de
  modo que el contenido sin traducir funciona sin cambios.
- **Alternatives considered**: convertir el texto femenino en obligatorio cuando existe el campo
  (rechazado: rompe el contenido actual y la traducción progresiva).

## R3 · Clave del azar para no binario (determinismo)

- **Decision**: stream derivado **`rngPara(seed, "genero", situacionId, campo)`**, evaluado una vez
  por campo y partida. `campo` toma valores estables:
  `"titulo"`, `"texto"`, `"opcion:<opcionId>:titulo"`, `"opcion:<opcionId>:subtitulo"`.
- **Rationale**:
  - `rngPara` hashea la clave con `cyrb128`; un **token nuevo** (`"genero"`) **no altera** ninguna
    secuencia existente (selección, condicional, COAC), así que el determinismo previo y el snapshot
    se conservan.
  - No incluir `anoActual`/`contador` hace que un mismo campo se resuelva **siempre igual** para una
    semilla: al reanudar una partida o reciclar una situación se ve la misma forma (FR-014, SC-005).
  - Cada campo recibe su propia tirada → independientes entre sí (FR-007).
- **Alternatives considered**:
  - Incluir `ano`/`contador`: daría más variedad por año, pero haría que la misma decisión cambiara de
    forma entre mostrar y reanudar, y complicaba SC-005. Se descarta.
  - Consumir del stream de `seleccionarSituacion`: alteraría las selecciones posteriores. Se descarta.

## R4 · Dónde se resuelve el texto

- **Decision**: en el **motor**, al construir el paso: `toPublica(situacion, contextoGenero?)`. El
  contexto (género + función `azar(campo)`) se construye en `partida.ts` con `rngPara`. La isla Svelte
  no cambia.
- **Rationale**: FR-008/constitución (la UI no contiene lógica de juego). `SituacionPublica` mantiene
  su forma actual, así que `Decision.svelte` y el resto de la UI siguen igual.
- **Compatibilidad de la firma**: `contextoGenero` es **opcional**; sin él `toPublica` devuelve la
  forma por defecto. Así los consumidores actuales (`perfiles.test.ts`, simulador) no cambian.

## R5 · Normalización de vacíos y exportación

- **Decision**: el motor trata **blanco/espacios como ausente** (no se confía en que el contenido esté
  limpio). El panel **omite** los campos femeninos vacíos al guardar (los deja `undefined`), y el
  generador ya no serializa claves `undefined`.
- **Rationale**: garantiza FR-003 y FR-012 sin recurrir a `transform` en Zod (que complicaría los
  tipos `z.ZodType<Situacion>`), manteniendo el esquema simple y estricto.
- **Alternatives considered**: `z.string().transform(...)` para recortar y convertir `""` en
  `undefined`: válido, pero añade complejidad de tipado; se descarta a favor de la normalización en el
  borde (panel) + tolerancia en el motor.

## R6 · Persistencia y versionado

- **Decision**: **sin cambios de versión**. `VERSION_ALMACEN` (3) y `VERSION_PARTIDA` (3) se mantienen.
- **Rationale**: los campos nuevos son opcionales (no rompen JSON antiguo); el texto resuelto **no se
  almacena** en la partida ni en el códec, solo se calcula al vuelo al construir el paso. El historial
  interno (`historial[].descripcion`) sigue con la forma por defecto (fuera de alcance, FR-010).

## R7 · Alcance del contenido

- **Decision**: no se exige traducir el banco ahora. La feature habilita los campos; el contenido se
  irá rellenando con el flujo normal del panel. Se pueden añadir un par de ejemplos para demonstrar.
- **Rationale**: la spec lo declara como traducción progresiva; evita un cambio masivo de contenido.

## R8 · Documentación fuente

- **Decision**: actualizar `docs/01` §1 (nota de variantes de texto por género) y `docs/02` §7
  (interfaces `Opcion`/`Situacion`), además de la regla de contenido en `AGENTS.md` §5/§12.
- **Rationale**: la constitución exige mantener la documentación fuente en sincronía; el esquema es la
  referencia para quien redacta contenido.
