# 02 · Arquitectura técnica

🏗️ **Veredicto: Astro solo**, con el motor del juego como librería TypeScript pura y la UI del bucle jugable en una única isla ligera (**Svelte**). Angular aquí no aporta nada que el juego necesite y cobra peaje.

---

## 1. La decisión de framework es secundaria

El 85% del valor y del riesgo del juego está en el **motor determinista + el banco de contenido**, no en el framework de UI.

Si el motor es una librería pura, cambiar de UI mañana cuesta un fin de semana. Si la lógica vive dentro de servicios de Angular, el proyecto se casa con Angular para siempre.

---

## 2. Por qué no Astro + Angular Elements

La propuesta previa es *técnicamente correcta y arquitectónicamente cara*. Problemas reales:

| Problema | Detalle |
| --- | --- |
| **Peso** | Angular Elements arrastra el runtime completo (~100-200 kB gzip según versión y zoneless) para renderizar una tarjeta con dos botones. Un juego viral se abre desde WhatsApp en 4G en la calle: cada 100 kB son conversiones perdidas. |
| **Bundle sin hashing** | Copiar el build a la carpeta pública mata el cache-busting. Un `juego-carnaval.js` cacheado significa usuarios jugando una versión vieja tras cada deploy; habría que inventar versionado a mano. |
| **Dos toolchains** | Dos `package.json`, dos configs de TypeScript, dos linters, dos sistemas de estilos, dos formas de testear. Para un proyecto de una persona es un impuesto permanente. |
| **Fricción de Elements** | Los inputs por atributo HTML son strings (nada de objetos), la encapsulación de estilos choca con el CSS global de Astro y depurar el custom element es peor que depurar un componente normal. |
| **Cero SSR en el juego** | La isla Angular no prerenderiza, así que se pierde el beneficio principal de Astro justo en la ruta más importante. |

Angular es excelente para apps de gestión con formularios complejos, DI pesada, RxJS y equipos grandes. Este bucle jugable es: **mostrar una carta → capturar un clic → recalcular estado → mostrar otra carta**. Una máquina de estados con tres pantallas.

## 3. Por qué no Angular solo

Es más coherente que el híbrido — un solo toolchain, y hay experiencia previa — y con Angular 17+ hay SSG real. Pero:

- Mete runtime de Angular en la landing y en las páginas de resultado compartidas, que son HTML puro. Esas páginas son las que deciden si el juego se hace viral.
- El generador de imagen OG acabará en una función edge igualmente.
- Se gana familiaridad y se pierde exactamente donde más duele: el *time to interactive* de un enlace compartido.

## 4. Por qué gana Astro solo

- Landing, "cómo jugar" y la página de resultado salen como **HTML estático puro, 0 kB de JS**.
- El juego es **una sola isla**, el único JavaScript del sitio.
- Un solo build, un solo deploy, endpoints edge nativos para la imagen de la tarjeta.
- La curva de Svelte **para esta UI concreta** es de un par de tardes, porque la UI no tiene lógica: la lógica vive en el motor.

---

## 5. Principio rector

```
┌──────────────────────────────────────────────────────────┐
│  engine   ← TS puro, 0 dependencias de UI,                │
│             determinista, testeable, portable             │
├──────────────────────────────────────────────────────────┤
│  content  ← el banco de decisiones como DATOS             │
│             (no como código), validado con Zod            │
├──────────────────────────────────────────────────────────┤
│  web      ← Astro: cáscara + isla + endpoints             │
└──────────────────────────────────────────────────────────┘
```

Tres reglas que no se rompen nunca:

1. **`engine` no importa nada de UI.** Ni DOM, ni framework, ni `Math.random()`, ni `Date.now()`.
2. **`content` no contiene lógica.** Son objetos. Se pueden añadir 40 situaciones sin abrir un fichero de código.
3. **La partida es reproducible desde una semilla.** Semilla + lista de decisiones → la misma partida siempre. Eso da tests deterministas, replays, tarjetas compartibles sin base de datos y depuración con solo la seed.

---

## 6. Arquitectura del repositorio

**Proyecto único, sin monorepo.** No hay hoy un segundo consumidor de `engine` ni un equipo que necesite fronteras de propiedad entre paquetes: un único proyecto Astro con carpetas disciplinadas da el mismo aislamiento lógico que un monorepo, sin pagar pnpm workspaces, tsconfig compartido, versionado cruzado ni CI multi-paquete. Las mismas tres reglas (engine sin UI, content sin lógica, partida reproducible) se cumplen igual dentro de `src/`. Si el día de mañana aparece un segundo consumidor real —una CLI de simulación standalone, otra app— extraer `engine`/`content` a paquetes es un refactor de una tarde, no una decisión que haya que acertar ahora.

```
coplero/
├── package.json
├── tsconfig.json
├── biome.json                      # lint + format (uno solo, no ESLint+Prettier)
├── astro.config.mjs                # output static + adapter edge para /api
├── .github/workflows/ci.yml
│
├── src/
│   ├── engine/                     # ⭐ el juego de verdad — TS puro, sin imports de Astro/Svelte
│   │   ├── index.ts                # API pública: crearPartida, elegir, resumen
│   │   ├── types.ts                # personaje, atributos, decision, partida, coac
│   │   ├── seed.ts                 # PRNG con semilla (mulberry32 / xoshiro)
│   │   ├── partida.ts              # máquina de estados: reducer puro
│   │   ├── destino.ts              # cálculo del techo oculto
│   │   ├── selector.ts             # elección de situación (por momento)
│   │   ├── condicionales.ts        # flags, ventanas, probabilidades
│   │   ├── atributos.ts            # aplicación de efectos, clamps
│   │   ├── coac.ts                 # resolución de fases
│   │   ├── premios.ts              # premios ajenos al COAC
│   │   ├── narrativa.ts            # textos de resultado, titulares
│   │   ├── resumen.ts              # construcción de la tarjeta final
│   │   ├── codec.ts                # serializar partida → string URL-safe
│   │   └── __tests__/
│   │       ├── partida.test.ts
│   │       ├── selector.test.ts
│   │       ├── determinismo.test.ts    # misma seed = misma partida
│   │       └── simulacion.test.ts      # 10.000 partidas: distribuciones
│   │
│   ├── content/                    # ⭐ el banco, como datos
│   │   ├── index.ts                # ensambla + valida (bancoContenido)
│   │   ├── schema.ts               # Zod: valida TODO en build time
│   │   ├── modalidades.ts          # catálogos cerrados (momento, modalidad, variante…)
│   │   ├── informe.ts              # recuentos, flags y alcanzabilidad estática
│   │   ├── decisiones/
│   │   │   ├── verano.ts           # pool de verano (preparación)
│   │   │   └── febrero.ts          # pool de febrero (concurso)
│   │   ├── condicionales/
│   │   │   ├── verano.ts
│   │   │   └── febrero.ts
│   │   ├── textos/                 # (pendiente) textos de fase, premios, epílogos
│   │   ├── nombres.ts              # (pendiente) apodos sugeridos
│   │   └── __tests__/
│   │       ├── integridad.test.ts       # ids únicos, flags referenciadas existen…
│   │       ├── integridad-negativos.test.ts
│   │       ├── alcanzabilidad.test.ts   # ninguna situación inalcanzable
│   │       ├── imports.test.ts          # content no importa de engine/web
│   │       ├── carrera.test.ts          # carrera completa con el banco real
│   │       ├── informe.test.ts
│   │       └── compatibilidad.test.ts   # satisface BancoContenido
│   │
│   ├── simulacion/                 # 🧪 balance (dev): juego masivo + informe
│   │   ├── index.ts                # API pública del módulo
│   │   ├── tipos.ts                # informe, perfiles, configuraciones, hallazgos
│   │   ├── perfiles.ts             # 3 perfiles de decisión (uniforme, codicioso, errático)
│   │   ├── configuraciones.ts      # configuraciones por defecto
│   │   ├── jugar.ts                # juega una carrera completa con un perfil
│   │   ├── estadisticas.ts         # agregación de métricas del informe
│   │   ├── auditoria.ts            # detector de estados imposibles (13 reglas)
│   │   ├── informe.ts              # formato de texto + JSON
│   │   ├── simular.ts              # orquestador: N carreras → informe
│   │   └── __tests__/
│   │
│   ├── juego/                      # 🎮 la isla
│   │   ├── Juego.svelte            # raíz: enruta por fase
│   │   ├── estado.ts               # store: envuelve el engine
│   │   ├── persistencia.ts         # localStorage + versionado
│   │   ├── pantallas/
│   │   │   ├── Intro.svelte
│   │   │   ├── CrearPersonaje.svelte
│   │   │   ├── ElegirModalidad.svelte
│   │   │   ├── Decision.svelte
│   │   │   ├── ResultadoFase.svelte
│   │   │   ├── ResumenAno.svelte
│   │   │   └── FinDeCarrera.svelte
│   │   └── componentes/
│   │       ├── CartaOpcion.svelte
│   │       ├── BarraAtributos.svelte
│   │       ├── Cronologia.svelte
│   │       └── TarjetaFinal.svelte
│   │
│   ├── ui/                         # sistema de diseño (feature 012)
│   │   ├── tokens.css              # colores, tipografía, espaciado, radios, movimiento
│   │   ├── base.css                # reset, @font-face, tipografía base, controles, reduced-motion
│   │   ├── tokens.ts               # espejo TS de la paleta (tests y endpoint OG)
│   │   └── contraste.ts            # luminancia y ratio WCAG (funciones puras)
│   │
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Compartir.astro
│   ├── pages/
│   │   ├── index.astro                 # landing (0 kB JS)
│   │   ├── como-jugar.astro            # reglas + FAQ (0 kB JS)
│   │   ├── politicas/                  # privacidad y cookies (0 kB JS)
│   │   ├── jugar.astro                 # única página con isla
│   │   ├── r/[codigo].astro            # tarjeta compartida (SSR edge)
│   │   └── api/
│   │       └── og/[codigo].png.ts      # imagen OG dinámica
│   ├── sitio/                          # contenido compartido (redes, autor, FAQ, reglas)
│   ├── landing/                        # datos de la landing (0 kB JS)
│   ├── components/                     # Header.astro y Footer.astro (marco del sitio)
│   └── styles/
│
└── public/
    ├── fonts/                       # Anton y Atkinson Hyperlegible (woff2 web + ttf para satori) + licencias OFL
    ├── favicon.svg                  # marca (compás)
    ├── apple-touch-icon.png
    └── og/estatica.png
```

> 🔁 Respecto a la propuesta anterior: desaparece el monorepo (pnpm workspaces, packages/, tsconfig.base cruzado) y el paso frágil de copiar bundles, y se mantiene la separación que de verdad importa: **motor / contenido / presentación**, ahora dentro de un único proyecto.

---

## 7. Modelo de datos

```tsx
// src/engine/types.ts
export type Atributo =
  | 'letra' | 'musica' | 'puestaEnEscena'   // artísticos → puntúan en el COAC
  | 'popularidad' | 'cohesion' | 'dinero';  // de personaje → modulan

export type Atributos = Record<Atributo, number>; // 0..100, con clamp

// src/engine/types.ts
export type Momento = 'verano' | 'febrero';

export interface Opcion {
  id: string;
  titulo: string;
  subtitulo: string;
  efectos: Partial<Atributos>;
  flags?: string[];          // flags que deja (nunca se borran)
  peso?: number;             // para autoplay y balance
  saltaCOAC?: boolean;       // la temporada no se resuelve en el COAC (año callejero, gira…)
}

export interface Situacion {
  id: string;
  momento: Momento;          // ← el campo que faltaba en el diseño
  titulo: string;
  texto: string;
  opciones: [Opcion, Opcion] | [Opcion, Opcion, Opcion];

  // filtros opcionales de aparición
  modalidades?: Modalidad[];       // undefined = ambas
  variantes?: VarianteId[];
  minAno?: number;                 // no salir en el año 1
  requiereFase?: FaseCOAC[];       // "pasas con lo justo" → solo si aplica
  unicaVez?: boolean;              // por defecto true
}

export interface Condicional extends Situacion {
  requiere: Requisito;             // árbol lógico, no un string suelto
  ventanaAnos: number;
  probabilidad: number;            // 0..1
  prioridad?: number;              // si dos compiten el mismo año
}

export type Requisito =
  | { tipo: 'flag'; flag: string }
  | { tipo: 'flagRepetida'; flag: string; veces: number; consecutivos?: boolean }  // tema_social x2; consecutivos = años seguidos
  | { tipo: 'faseAlcanzada'; fase: FaseCOAC }  // "llegar a la final alguna vez" (dentro de la misma partida)
  | { tipo: 'todas'; de: Requisito[] }
  | { tipo: 'alguna'; de: Requisito[] }
  | { tipo: 'ninguna'; de: Requisito[] }
  | { tipo: 'atributo'; atributo: Atributo; min?: number; max?: number };
```

El tipo `Requisito` importa: el diseño ya pide *"historico_se_fue o fiche_fuera"* y *"tema_social dos años seguidos"*. Con un string plano eso no se expresa; con este árbol sí, y sin volver a tocar el motor.

```tsx
// src/engine/types.ts — todo serializable, sin clases
export interface Partida {
  version: 1;
  seed: string;
  personaje: Personaje;              // nombre, edad, localidad, genero
  modalidad: Modalidad;
  variante: VarianteId;

  anoActual: number;                 // año natural del carnaval en curso (p. ej. 2027)
  anoInicio: number;                 // primer carnaval de la carrera (año natural)
  momento: Momento;
  fase: FasePartida;                 // 'creacion' | 'decision' | 'coac' | 'fin'

  atributos: Atributos;
  flags: Record<string, { ano: number; veces: number }>;
  vistas: string[];                  // situaciones ya mostradas
  historial: EventoHistorial[];      // para la cronología y la tarjeta
  temporadas: Temporada[];           // resultado COAC de cada año
  premios: Premio[];

  destino: Destino;                  // ⚠️ oculto en UI, presente en estado
}

export interface Destino {
  techo: FaseCOAC;          // hasta dónde puede llegar como máximo
  suelo: FaseCOAC;          // por debajo no baja en la resolución normal (el batacazo sí puede atravesarlo)
  anoPico: number;          // año natural de su mejor carnaval (anclado a `anoInicio`)
  anosCarrera: number;      // duración total antes del retiro
  volatilidad: number;      // 0..1, cuánto ruido hay en sus resultados
  carisma: number;          // modificador oculto de popularidad
}

export interface Temporada {
  ano: number;
  fase: FaseCOAC;
  puesto?: number;           // posición si se conoce; necesario para los umbrales top 6-7 / top 10
  premios: Premio[];         // premios ajenos logrados esa temporada
  fueraDeConcurso?: boolean; // temporada sin COAC (año callejero, gira, sabático)
}

// Resto de tipos referenciados (definición provisional)
export type Modalidad = 'comparsista' | 'chirigotero';
export type VarianteId = string;   // acotado por modalidad en content/modalidades.ts
export type FaseCOAC = 'preliminares' | 'cuartos' | 'semifinales' | 'final';
export type FasePartida = 'creacion' | 'decision' | 'coac' | 'fin';

export interface Personaje {
  nombre: string;
  edad: number;
  localidad: string;
  genero: 'masculino' | 'femenino' | 'no_binario';
}

export interface Premio {
  tipo: 'copla_para_andalucia' | 'aguja_de_oro' | 'candela_y_espino';
  ano: number;
}

export interface EventoHistorial {
  ano: number;
  tipo: string;
  descripcion: string;
}

export interface Paso { /* lo que la UI debe mostrar según el estado actual */ }
export interface TarjetaFinal { /* resumen narrativo público; ver docs/05 §2 */ }
export interface CrearPartidaInput {
  seed: string;
  personaje: Personaje;
  modalidad: Modalidad;
  variante: VarianteId;
}
```

El motor es un **reducer puro**:

```tsx
export function crearPartida(input: CrearPartidaInput): Partida;
export function siguientePaso(p: Partida): Paso;               // qué mostrar
export function elegir(p: Partida, opcionId: string): Partida;  // nuevo estado
export function resumen(p: Partida): TarjetaFinal;
```

Sin mutación, sin efectos secundarios, sin `Date`, sin `Math.random`. Todo el azar sale del RNG sembrado con un hash de seed + año + momento + contador.

**Nota de implementación (ENGINE-001):** el bucle anual se ordena como **decisión de verano → decisión de febrero → resolución del COAC**, con un paso adicional `continuar` para pasar del resultado de temporada al año siguiente o al fin. El resultado de la temporada se calcula con el estado previo a la decisión de febrero. El `engine` recibe el banco de contenido y los parámetros numéricos por inyección (nunca importa de `content`).

**Nota de implementación (TRAYECTORIA-001 / feature 006):** la trayectoria vive en `Partida.trayectoria` (`modalidadInicial`, `varianteInicial` y `cambios[]` con año, modalidad y variante). Los cambios se disparan por campos de datos de las opciones: `Opcion.cambiaModalidad` (actualiza la modalidad y abre un paso `variante` para elegir una variante válida de la nueva modalidad) y `Opcion.cambiaVariante` (desplaza la variante vigente sin anunciarlo como mecánica). Tras un cambio, la selección de decisiones usa la modalidad y la variante vigentes. El catálogo de variantes viaja en el banco (`BancoContenido.variantes`) para que el motor valide la elección sin importar de `content`. `VERSION_PARTIDA` sube a **2** (sin migración, coherente con el guardado de 005).

---

## 8. El techo oculto

Es el corazón del "copero-ismo". Propuesta concreta.

**Al crear la partida**, desde la seed:

```tsx
const techo = elegirPonderado(rng, [
  ['nunca_pasa_preliminares',  7],
  ['cuartos',                  3],
  ['semifinales',             47],
  ['final',                    6],
  ['podio',                   28],
  ['primer_premio',            9],
]);
```

Estos pesos están calibrados contra la distribución objetivo del diseño (~45% de carreras pisan la final alguna vez, ~10% no pasan nunca de cuartos, ~7% no pasan de preliminares, ~27% ganan al menos un primer premio, ~11% ganan 3 o más). El techo es el *máximo* de la carrera, no el resultado de cada año: con `anoPico` y el ruido anual, un techo de "final" produce una carrera que sube, toca la final y decae. `anoPico` es un **año natural anclado a `anoInicio`** (el primer carnaval, 2027), de modo que la curva y el `bonoAnoPico` lo alcanzan siempre dentro de la carrera. Los **umbrales de nivel** (`umbralesNivel`, `42/45/48/54/57`) traducen puntuación a nivel, y un pequeño porcentaje de carreras nace como **crack** (`probabilidadCrack`/`bonusCrack`: carisma extra oculto que genera carreras legendarias). Todo se calibra con el simulador; si no reproduce la distribución, se ajustan pesos, umbrales y ruido, nunca las situaciones.

Modificadores leves y legibles según la creación de personaje, para que esas primeras elecciones importen sin romper la sorpresa: edad joven suma un año de carrera, ser de Cádiz capital suma carisma base, etc. Nunca deterministas.

**Cada año**, la resolución del COAC:

```
puntuacion = aptitud(ano)          // curva de carrera, máximo en `anoPico` (013)
           + aporteAtributos       // Σ(0.40·letra + 0.30·musica + 0.20·puestaEnEscena
           //                        + 0.06·cohesion + 0.04·popularidad) − atributosIniciales,
           //                        acotado a ±aporteAtributosMax
           + carisma
           + forma(ano)            // AR(1) derivado de la semilla: rachas con memoria (013)
           + ruido(rng, ±volatilidad·multiplicadorRuido)
           + bonoAnoPico           // solo en el año pico

nivel = clamp(nivelSegunPuntuacion(puntuacion), suelo, techo)
puesto = bandaDelNivel acotada por el mérito relativo a la propia carrera (013)
```

> 🌱 **La forma del arco (feature 013).** La puntuación ya no es una base constante: `aptitud` es una curva que arranca por debajo del potencial, toca su cima en `anoPico` y declina. La **amplitud del arco** (`curvaSubida`/`curvaDeclive`, 30) es la que decide si la carrera se queda pegada a su techo: con bandas de nivel de 3 puntos, un arco pequeño mantiene la puntuación dentro de la banda del techo durante años. La `forma` sustituye al ruido blanco como fuente principal de variación: es un AR(1) **derivado de la semilla**, así que no añade estado a `Partida` ni obliga a versionar el guardado. El **puesto** se calcula por mérito relativo (no contra umbrales fijos), que es lo que evita el extremo constante de la banda.

> 🔓 **Las decisiones no mueven atributos por defecto (feature 008).** Los atributos parten de un valor estándar (`atributosIniciales`) y permanecen ahí salvo que una **excepción declarada** del contenido (`excepcion: true`, unas pocas) los mejore o empeore, siempre con una contrapartida visible. Con los atributos en su valor estándar, el aporte es 0 y mandan la curva, la forma y el `destino`. Los efectos se retiraron el 2026-09-20 (C15 cerrada) y los valores por defecto se recalibraron con el simulador (013).

> ⚠️ **Las excepciones se acumulan.** Un intercambio de ±1 aplicado decenas de veces a lo largo de 20 años desplaza la puntuación de forma permanente; sin tope, ese desplazamiento anula el arco y la carrera vuelve a ser plana. Por eso el aporte de atributos está acotado (`aporteAtributosMax`, 6 puntos). Los atributos en sí siguen moviéndose libres: el tope es solo sobre cuánto pueden empujar el resultado.

El `clamp(..., suelo, techo)` aplica a la **resolución normal**. El **batacazo** puede atravesar el `suelo`: esa es su gracia narrativa. El número de decisiones por año es **parametrizable** (v1: 2; los modos rápido/lento llegarán más adelante).

Con dos válvulas de escape para que haya películas:

- **Batacazo** (3%): baja una fase por debajo de lo que le tocaba, pudiendo atravesar el `suelo`. Genera relato.
- **Milagro** (2% de las carreras; se sortea una sola vez al crear la partida): rompe el techo **una sola vez** en toda la carrera. El jugador nunca sabrá si ese resultado era su techo o su milagro, y eso es exactamente lo que hace rejugar.

> 🔒 **El techo nunca se le muestra al jugador.** Ni durante la partida ni en la tarjeta final: si se enseña, se pierde la gracia y desaparece la duda de "¿hasta dónde podía haber llegado?", que es justo lo que hace rejugar.
>
> Lo que sí se muestra al terminar es una **tarjeta final** con el resumen narrativo de la carrera: nombre/apodo, modalidad y variante iniciales, evolución de modalidad y variante, años en activo y años sin concursar, mejor fase alcanzada, primeros premios y otros premios (estos últimos agrupados por tipo con su recuento, omitiendo los tipos no ganados), tres hitos narrativos (derivados de datos ya presentes en la partida) y una frase de cierre. La tarjeta se presenta como un póster, **sin valoración global ni número héroe**, con las acciones de compartir (nativo, copiar, descargar imagen y enlace). El campo `destino` existe en el estado del juego, pero es interno y no se serializa en el código de partida compartible.

---

## 9. Selección de la decisión del año

```
Para (año, momento):
  1. Candidatas condicionales:
       - requisito cumplido sobre flags/atributos
       - dentro de ventana (anoActual - anoFlag <= ventanaAnos)
       - momento == momento actual
       - no vista antes (si unicaVez)
     → tirar dado por probabilidad, ordenar por prioridad. Si alguna pasa → esa.
  2. Si no: pool base filtrado por momento + modalidad/variante
     + minAno + no vista
  3. Ponderar: peso base
  4. Elegir con rng. Si el pool se vacía → reciclar las menos recientes, ignorando `unicaVez` como último recurso.
```

Detalles que evitan bugs feos más tarde:

- **Sin tipos ni categorías (2026-10-04):** cada momento es un único pool; se retiró el reparto por tipo (contenido / personaje) y el catálogo de categorías. Ver `docs/01` §5.
- **Fallback de pool vacío:** con carreras de muchos años a 2 decisiones por año hacen falta **60-80 situaciones mínimo** (30-40 por momento).

> 🚨 El banco crece cada temporada; el volumen de contenido es **el verdadero cuello de botella del proyecto, no el framework**.

---

## 10. Rutas y renderizado

| Ruta | Render | JS | Función |
| --- | --- | --- | --- |
| `/` | Estático | 0 kB | Landing, título dinámico, CTA |
| `/como-jugar` | Estático | 0 kB | Reglas, modalidades y FAQ |
| `/politicas/politica-de-privacidad` | Estático | 0 kB | Privacidad |
| `/politicas/politica-de-cookies` | Estático | 0 kB | Cookies |
| `/jugar` | Estático + isla | ~25 kB | Todo el bucle jugable |
| `/r/:codigo` | SSR edge (cacheado) | 0 kB | Tarjeta compartida |
| `/api/og/:codigo.png` | Edge | — | Imagen Open Graph generada |

**Marco del sitio.** Todas las páginas salvo el panel interno comparten `Header.astro` y `Footer.astro` (montados desde `Layout.astro`) y un **mismo ancho máximo de 680 px** en escritorio (100 % en móvil): el bucle jugable coincide siempre con el marco, porque `--ancho-bucle` es un alias de `--ancho-marco`. La cabecera es estática con la marca —que en `/jugar` pasa a «Coplero»/«Coplera»/«Coplere» según el sexo del personaje— y el pie mantiene la estructura de acordesgaditanos (redes, autor, legal, copyright), con el bloque del autor cerrado por un **chip-enlace a Acordes Gaditanos** que deja constancia del mismo creador. En `/jugar` el juego ocupa el alto del viewport menos la cabecera (`min-height: calc(100dvh - var(--alto-cabecera))`), de modo que el pie queda por debajo del pliegue hasta hacer scroll.

**El código de partida.** No hace falta base de datos en la v1: se codifica la **tarjeta final ya derivada** (`TarjetaFinal`: identidad, trayectoria, resultado, premios, tres hitos y frase de cierre) en base64url comprimido dentro de la propia URL, y la página de resultado lo decodifica. **No incluye el `seed`** ni la `Partida`, para que no pueda deducirse el `destino`, y lleva su propia versión de esquema (`VERSION_CODIGO`), independiente de `VERSION_PARTIDA`. Cero backend, cero coste, cero GDPR. La compresión se hace con **`fflate`** (`deflate` → bytes → base64url puro). Si más adelante se quieren estadísticas globales ("solo el 3% ha ganado el COAC"), se añade un KV y se guarda el código con un contador, sin cambiar nada más.

**Imagen OG.** `satori` + `resvg-js` en el endpoint on-demand (`/api/og/:codigo.png`), con la tipografía cargada desde `public/fonts`. El parámetro `?t=` elige el formato: `og` (1200×630, apaisado), `9x16` (1080×1920) y `1x1` (1080×1080). Desde el rediseño de la pantalla final (feature 020) la imagen **calca el palmarés de `Tarjeta.svelte`** —identidad, mejor posición, trayectoria y distinciones— reutilizando los mismos `rem`, fuentes y pesos (los títulos de sección en **Anton**), definidos una vez y multiplicados por la escala del formato; el **pie de marca** va dentro de la tarjeta. La URL se **versiona** con `?v=` (`VERSION_OG` + `urlImagenOg()`), de modo que subir esa constante invalida la caché `immutable` cuando cambia el diseño. Es lo que hace que el enlace de WhatsApp muestre la tarjeta y no un rectángulo gris: para un juego viral no es un extra, es la mitad del producto.

**Persistencia local.** `localStorage` (sin backend) con **doble versión de esquema**: la del sobre de guardado (`VERSION_GUARDADO`, en `web`) y la de `Partida` (`VERSION_PARTIDA`, en el `engine`). Se guarda **en cada elección** y al crear la partida, nunca al final. Si una versión no coincide, o el guardado está dañado, se **elimina** y se muestra un **aviso puntual** (una sola vez) ofreciendo empezar de cero; en v1 **no hay migración**. Si el almacenamiento no está disponible (modo privado, permisos, cuota), se usa un almacén **no-op**: la carrera se juega igual, **sin aviso**, y simplemente no hay "Continuar" después. La pantalla inicial distingue **en curso** ("Continuar") de **terminada** ("Ver resultado" + "Empezar de cero"). Gana la última pestaña que guarde (sin sincronización entre pestañas).

---

## 11. Build, CI y balance

```json
// package.json
{
  "scripts": {
    "dev":     "astro dev",
    "build":   "astro build",
    "test":    "vitest run",
    "check":   "tsc -b && biome check .",
    "simular": "tsx scripts/simular.ts",   // balance del juego (n y opciones por argumento)
    "contenido:informe": "tsx scripts/informe-contenido.ts",   // recuentos, flags y alcanzabilidad
    "panel:importar": "tsx scripts/panel-importar.ts",   // banco actual → almacén JSON
    "panel:volcar": "tsx scripts/panel-volcar.ts"   // almacén JSON → src/content/{decisiones,condicionales}/**
  }
}
```

Un solo comando, sin copiar bundles a mano, con hashing y cache-busting automáticos de Astro. **Deploy en Netlify**. El adapter `@astrojs/netlify` ya está configurado en `astro.config.mjs` (salida estática + función SSR on-demand para las rutas con `prerender = false`), y las dependencias `satori` y `@resvg/resvg-js` están instaladas. El catch-all de redirección se ha retirado de `netlify.toml` para no sombrear las rutas on-demand. Se mantienen `overrides` en `package.json` para forzar versiones seguras de dependencias transitivas (`sharp@^0.35.4`, `fflate@^0.8.3`) y eliminar `extract-zip` (subiendo `@netlify/functions-dev@^2.0.7`); `npm audit` queda en **0 vulnerabilidades**. La CI se integrará en Netlify o mediante GitHub Actions más adelante (ver hueco T12).

El balance se apoya en dos piezas: `src/simulacion/` (módulo puro y testeable que juega carreras, agrega métricas y audita estados imposibles) y `scripts/simular.ts` (CLI delgada). Lanza N carreras automáticas con perfiles y configuraciones variados e imprime la distribución de fases, premios, duración, años de pico, el ranking de situaciones, los condicionales que nunca se disparan, los atributos mínimos/máximos/medios y cualquier estado imposible detectado; puede volcar el mismo informe a JSON. Desde CONTENT-001 la CLI consume el **banco real** de `src/content` (deuda T17 cerrada). El banco se inyecta en el módulo de simulación, que no conoce de dónde procede. Además, `scripts/informe-contenido.ts` (`npm run contenido:informe`) resume recuentos, flags declaradas/referenciadas y situaciones inalcanzables, combinando análisis estático y 10.000 carreras. Sin esto, el balance es a ciegas.

**Panel local de contenido (features 009 y 024).** El banco de contenido (situaciones **y** condicionales) se edita con un panel **solo de desarrollo** en `/panel` (ruta on-demand con guard `import.meta.env.DEV`: fuera de desarrollo responde **404**, aunque el build la compile). El almacén `content-admin/data/situaciones.json` (**v2**) es la **fuente de verdad** y está versionado; las copias van a `content-admin/data/backups/` (ignoradas en git). `npm run panel:importar` vuelca el contenido actual (`src/content/decisiones/**` y `src/content/condicionales/**`) al JSON y `npm run panel:volcar` lo regenera de forma **determinista y sin pérdida**; desde entonces los `.ts` de `decisiones/` y `condicionales/` son **generados** y no se editan a mano. Tanto el panel como los scripts **reutilizan los esquemas Zod** de `src/content/schema.ts` (nada de reglas duplicadas) y el volcado valida el **banco completo** antes de escribir. La isla deriva los identificadores del título (`src/panel/identificadores.ts`), ofrece selectores de flags alimentados por el catálogo de flags declaradas (`src/panel/flags.ts`) y presenta la repetición como una casilla "repetible" (invertida respecto a `unicaVez`, sin migración de datos). La lógica de servidor vive en `src/panel/` (usa `node:fs`, nunca se importa desde el cliente) y la isla Svelte en `src/panel-ui/`. Ver `specs/009-content-admin/` y `specs/024-form-ux-improvements/`.

**Tests que sí importan:**

- **Determinismo:** misma seed y mismas elecciones producen la misma partida.
- **Integridad de contenido:** ids únicos, toda flag referenciada en un requisito existe en alguna opción, toda situación tiene `momento`, ninguna situación es inalcanzable.
- **Snapshot** de una partida completa de referencia.
- **E2E-001 (camino feliz integrado):** `tests/e2e/carrera-completa.spec.ts` recorre en una sola ejecución los diez hitos jugables —entrar, crear personaje, modalidad, variante, decisiones, completar la carrera, tarjeta final, recargar y recuperar, enlace compartible y `/r/[codigo]`— y falla señalando el hito roto. Los helpers compartidos viven en `tests/e2e/apoyo/juego.ts`.

---

## 12. Orden de trabajo recomendado

| Fase | Qué | Por qué en ese orden |
| --- | --- | --- |
| 1 | `engine` • `content` con el banco actual, sin UI, probado con vitest y el simulador | Valida el diseño de juego antes de escribir una línea de CSS |
| 2 | Isla `/jugar` fea pero completa: crear personaje → N años → fin | Jugabilidad de principio a fin |
| 3 | Ampliar el banco a 60-80 situaciones y etiquetar `momento` | Es el trabajo de verdad |
| 4 | Tarjeta final + página de resultado + imagen OG | Motor de viralidad |
| 5 | Landing, "cómo jugar", pulido visual, sonido | Presentación |
| 6 | Métricas anónimas, estadísticas globales, logros | Retención |

---

## 13. Plan B: si aun así se quiere Angular

- **Versión aceptable: Angular solo, nunca el híbrido**
  - Angular 18+ **zoneless** con `provideClientHydration()`.
  - SSG con `@angular/ssr` y `getPrerenderParams` para landing y "cómo jugar".
  - La página de resultado como ruta con SSR en edge.
  - **Y aun así: `engine` y `content` siguen siendo TypeScript puro fuera de Angular.** Los servicios de Angular solo envuelven el motor, nunca lo contienen.

  Así, si dentro de tres meses el juego pega y hay que bajar de 200 kB a 30, se migra solo la cáscara y el motor ni se entera.

  Lo que no haría en ningún escenario es Astro + Angular Elements con copia de bundle a la carpeta pública: da lo malo de los dos mundos y una bomba de caché.

---

## 14. Los tres huecos de diseño que van a doler

Y que ningún framework arregla:

1. **Volumen de contenido.** El banco actual da para pocos años antes de repetir. Hace falta multiplicarlo por cuatro. Prioridad sobre todo lo demás.
2. **Ritmo de la partida.** 20 años × 2 decisiones = 40 clics. Copero funciona porque son unos 3 minutos. Meter resúmenes de temporada cortos y micro-eventos sin decisión para que no parezca un formulario de 30 pasos.
3. **La tarjeta final.** Es el producto de marketing. Diseñarla **antes** que la UI del juego: dirá exactamente qué datos tiene que trackear el motor — mejor fase, años en activo, premios, tres hitos narrativos, apodo generado, la carrera en una frase.
