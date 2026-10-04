# Research: Banco de contenido real

Fase 0. Resuelve las incógnitas de diseño antes de modelar los datos. Todas las decisiones respetan `docs/` y la constitución; ninguna introduce reglas de juego nuevas.

## D1 · Independencia `content` ↔ `engine` con compatibilidad verificada

- **Decision**: `src/content` define sus propios esquemas Zod y tipos derivados (`z.infer`) y **no importa** del motor. La compatibilidad con `BancoContenido` se verifica en un test (`src/content/__tests__/compatibilidad.test.ts`) que asigna el banco validado a una variable tipada como `BancoContenido` importado del motor. `web` y `scripts/` importan ambos y hacen de puente.
- **Rationale**: `AGENTS.md` §3 y la constitución prohíben que `content` importe de `engine`; el test de tipos conserva la garantía de que el motor puede consumirlo tal cual.
- **Alternatives considered**: (a) que `content` importe los tipos del motor — rompe la regla de dependencias; (b) extraer un paquete `shared`/`types` — contraviene el principio V (proyecto único, YAGNI).

## D2 · Mapeo de requisitos documentales al tipo `Requisito`

- **Decision**: traducir las fórmulas de `docs/03`/`docs/04` así:

  | Documento | `Requisito` |
  |---|---|
  | `autor_grupo_consagrado` | `{ tipo: "flag", flag: "autor_grupo_consagrado" }` |
  | `pasodoble_duro`, `deje_correr_polemica`, `musico_externo`, `local_de_siempre`, `rechazo_patrocinio` | `{ tipo: "flag", flag }` |
  | `ano_callejero` **o** `ano_de_gira` | `{ tipo: "alguna", de: [flag ano_callejero, flag ano_de_gira] }` |
  | `year_sabatico` **o** `ano_callejero` **o** `ano_de_gira` | `{ tipo: "alguna", de: [3 flags] }` |
  | `historico_se_fue` **o** `fiche_fuera` | `{ tipo: "alguna", de: [2 flags] }` |
  | `tema_social` **visto una vez** | `{ tipo: "flag", flag: "tema_social" }` (revisado 2026-10-04; antes `flagRepetida veces:2`) |
  | "Haber llegado a la final alguna vez" | `{ tipo: "faseAlcanzada", fase: "final" }` |

- **Rationale**: el motor ya implementa exactamente estas variantes (`condicionales.ts`); ninguna exige cambios.
- **Alternatives considered**: modelar "dos años seguidos" como dos flags distintas — innecesario y rompería la semántica de racha.

## D3 · Flags, consumo y `saltaCOAC`

- **Decision**: cada opción declara en `flags` las marcas que deja (tal cual la columna "Flags" de la doc). Ninguna opción usa `consume` en el banco documentado. Las opciones que implican no concursar se marcan `saltaCOAC: true`: las dos de verano ("Pa la calle", "Gira por España") y la de febrero "No ir al COAC el año que viene" (`year_sabatico`), que `docs/03` equipara explícitamente a un año sabático.
- **Rationale**: la regla de auditoría `saltaCOACIncoherente` exige que toda temporada fuera de concurso tenga una decisión con `saltaCOAC` ese año; sin la marca, la simulación reportaría estado imposible.
- **Alternatives considered**: dejar `year_sabatico` sin `saltaCOAC` e interpretarlo como "el año siguiente" — no hay mecanismo en el motor y contradice la nota de `docs/03`.

## D4 · Título, texto y opciones

- **Decision**: `titulo` = nombre de la situación en la doc; `texto` = `""` (vacío, no se inventa prosa, ver clarificación Q1); cada opción lleva `titulo` y `subtitulo` partiendo la celda "**Título** · subtítulo" de la doc por el separador `·`.
- **Rationale**: respeta "no inventar" y el modelo `titulo`/`texto` de la UI.
- **Alternatives considered**: redactar `texto` — descartado por el usuario (feature de redacción posterior).

## D5 · Unicidad y filtros

- **Decision**: todas las situaciones base llevan `unicaVez: true` (Q2). No se usan `variantes` (la doc no distingue variantes). `modalidades` solo en el cierre de popurrí de febrero (`["chirigotero"]`), tal como indica `docs/04`. No se define `minAno` (la doc no lo pide).
- **Rationale**: evita repetición hasta agotar el pool y no inventa restricciones.
- **Alternatives considered**: `unicaVez` omitido (equivale a true, pero menos explícito).

## D6 · Retirada de tipos y categorías (2026-10-04)

- **Decision**: eliminar `tipo` (`contenido`/`personaje`) y `categoria` del modelo de situación. El análisis de categorías (D6 original) queda **obsoleto**: ya no se asigna ninguna.
- **Rationale**: no aportaban mecánica (la categoría solo documentaba/agrupaba y el reparto por tipo era una regla artificial); cada momento es un único pool. Ver `docs/01` §5.
- **Consequence**: `cv_registro_social` pasa a dispararse con `tema_social` visto una vez (antes `veces: 2`).

## D6 (histórico) · Categoría de cada situación

- **Decision**: asignar la categoría según el encabezado de la doc y el efecto dominante:
  - Verano · "Letra" → `letra`; "Música y puesta en escena" → `puestaEnEscena` si el eje es el tipo/vestuario (p. ej. "El tipo no convence") y `musica` si es el sonido o el arreglo.
  - Verano · "Dinero y recursos" → `dinero`; "Grupo y vida personal" → `grupo`; "Carrera y grupo consagrado" → `carrera`; "Enfado con el concurso" → `concurso`.
  - Febrero · "Repertorio sobre el escenario" → `musica` para el cierre de popurrí y `letra` para cuplé / primera sesión; "Jurado y concurso" → `jurado`; "Prensa y público" → `prensa`.
- **Rationale**: la categoría solo describe y agrupa; se resuelve por encabezado sin ambigüedad funcional.
- **Alternatives considered**: nuevas categorías — prohibido (deben existir en el motor).

## D7 · Informe y alcanzabilidad

- **Decision**: un script `scripts/informe-contenido.ts` calcula: situaciones por momento, condicionales, flags **declaradas**, flags **referenciadas** y situaciones **potencialmente inalcanzables**. La alcanzabilidad combina (a) análisis estático de filtros `modalidades`/`variantes` que excluyan todas las configuraciones y (b) las "nunca vistas" de una simulación de 10.000 carreras con el banco real.
- **Rationale**: da el recuento que pidió el usuario y reutiliza el módulo de simulación existente sin duplicar lógica.
- **Alternatives considered**: solo análisis estático (no detecta cuellos de botella reales); solo simulación (no explica por qué).

## D8 · Integración con la simulación (T17)

- **Decision**: `scripts/simular.ts` importa `bancoContenido` de `src/content` en lugar de `bancoPrueba`. El banco de pruebas de `src/engine/__tests__/fixtures.ts` **se conserva** para los tests del motor y de `simulacion` (que lo inyectan), y deja de ser fuente de la CLI. No se recalibran parámetros.
- **Rationale**: cierra la deuda T17 y mantiene los tests aislados y rápidos.
- **Alternatives considered**: mover el banco de pruebas a `src/content/…/testing` — innecesario; el fixture sigue siendo válido para tests.

## D9 · Convención de identificadores

- **Decision**: ids estables y legibles: situaciones de verano `v_<tema>` y de febrero `f_<tema>`; condicionales `cv_<tema>` / `cf_<tema>`; opciones `<verbo>` o `<sustantivo>` corto y único dentro de la situación.
- **Rationale**: facilita lecturas, informes y depuración con la seed; evita ids numéricos opacos.
- **Alternatives considered**: UUIDs — imposibles de leer y no aportan con datos versionados.

## Incógnitas resueltas

No quedan `NEEDS CLARIFICATION` en el Technical Context. Las decisiones D1–D9 cubren tipos, requisitos, flags, datos, categorías, informe, integración y naming.
