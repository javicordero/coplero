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
│   │   ├── selector.ts             # elección de situación (momento × tipo)
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
│   │   ├── index.ts
│   │   ├── schema.ts               # Zod: valida TODO en build time
│   │   ├── modalidades.ts
│   │   ├── decisiones/
│   │   │   ├── verano/
│   │   │   │   ├── contenido.ts    # letra, música, puesta en escena
│   │   │   │   └── personaje.ts    # dinero, grupo
│   │   │   └── febrero/
│   │   │       ├── contenido.ts
│   │   │       └── personaje.ts    # jurado, prensa, público
│   │   ├── condicionales/
│   │   │   ├── verano.ts
│   │   │   └── febrero.ts
│   │   ├── textos/
│   │   │   ├── fases.ts            # "pasas / te quedas fuera"
│   │   │   ├── premios.ts
│   │   │   └── epilogos.ts         # cierre de carrera
│   │   ├── nombres.ts              # apodos sugeridos, tipos de agrupación
│   │   └── __tests__/
│   │       └── integridad.test.ts  # ids únicos, flags referenciadas existen…
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
│   ├── ui/                         # (opcional, fase 2) tokens + componentes compartidos
│   │   └── tokens.css              # colores, tipografías, espaciado
│   │
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Compartir.astro
│   ├── pages/
│   │   ├── index.astro                 # landing (0 kB JS)
│   │   ├── como-jugar.astro            # 0 kB JS
│   │   ├── jugar.astro                 # única página con isla
│   │   ├── r/[codigo].astro            # tarjeta compartida (SSR edge)
│   │   └── api/
│   │       └── og/[codigo].png.ts      # imagen OG dinámica
│   ├── componentes/                    # componentes .astro estáticos
│   └── styles/
│
└── public/
    ├── fonts/                       # fuentes para la imagen OG
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
export type TipoDecision = 'contenido' | 'personaje';
export type Categoria =
  | 'letra' | 'musica' | 'puestaEnEscena'
  | 'jurado' | 'dinero' | 'grupo' | 'prensa'
  | 'carrera' | 'concurso';

export interface Opcion {
  id: string;
  titulo: string;
  subtitulo: string;
  efectos: Partial<Atributos>;
  flags?: string[];          // flags que deja
  consume?: string[];        // flags que quedan consumidas: NO se borran del historial
  peso?: number;             // para autoplay y balance
  saltaCOAC?: boolean;       // la temporada no se resuelve en el COAC (año callejero, gira…)
}

export interface Situacion {
  id: string;
  momento: Momento;          // ← el campo que faltaba en el diseño
  tipo: TipoDecision;
  categoria: Categoria;
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
  consumeFlag: boolean;
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

  anoActual: number;                 // año del carnaval en curso
  anoInicio: number;
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
  anoPico: number;          // año de su mejor carnaval
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

---

## 8. El techo oculto

Es el corazón del "copero-ismo". Propuesta concreta.

**Al crear la partida**, desde la seed:

```tsx
const techo = elegirPonderado(rng, [
  ['nunca_pasa_preliminares',  5],
  ['cuartos',                 12],
  ['semifinales',             20],
  ['final',                   33],
  ['podio',                   22],
  ['primer_premio',            8],
]);
```

Estos pesos están calibrados contra la distribución objetivo del diseño (60-70% de carreras pisan la final alguna vez, ~10% no pasan nunca de cuartos, ~5% no pasan de preliminares). El techo es el *máximo* de la carrera, no el resultado de cada año: con `anoPico` y el ruido anual, un techo de "final" produce una carrera que sube, toca la final una o dos veces y decae. Si el simulador masivo no reproduce esa distribución, se ajustan estos pesos y la volatilidad, nunca las situaciones.

Modificadores leves y legibles según la creación de personaje, para que esas primeras elecciones importen sin romper la sorpresa: edad joven suma un año de carrera, ser de Cádiz capital suma carisma base, etc. Nunca deterministas.

**Cada año**, la resolución del COAC:

```
puntuacion = 0.40·letra + 0.30·musica + 0.20·puestaEnEscena
           + 0.10·(cohesion·0.6 + popularidad·0.4)
           + ruido(rng, ±volatilidad·15)
           + bonoAnoPico

faseAlcanzada = clamp(faseSegunPuntuacion(puntuacion), suelo, techo)
```

El `clamp(..., suelo, techo)` aplica a la **resolución normal**. El **batacazo** puede atravesar el `suelo`: esa es su gracia narrativa. El número de decisiones por año es **parametrizable** (v1: 2; los modos rápido/lento llegarán más adelante).

Con dos válvulas de escape para que haya películas:

- **Batacazo** (3%): baja una fase por debajo de lo que le tocaba, pudiendo atravesar el `suelo`. Genera relato.
- **Milagro** (2%): rompe el techo **una sola vez** en toda la carrera. El jugador nunca sabrá si ese resultado era su techo o su milagro, y eso es exactamente lo que hace rejugar.

> 🔒 **El techo nunca se le muestra al jugador.** Ni durante la partida ni en la tarjeta final: si se enseña, se pierde la gracia y desaparece la duda de "¿hasta dónde podía haber llegado?", que es justo lo que hace rejugar.
>
> Lo que sí se muestra al terminar es un **resumen narrativo de la carrera**: años en activo, mejor fase alcanzada, premios, tres hitos de la trayectoria, evolución de variante y una frase de cierre. El campo `destino` existe en el estado del juego, pero es interno y no se serializa en el código de partida compartible.

---

## 9. Selección de la decisión del año

```
Para (año, momento):
  1. tipoRequerido = contenido si aún no salió contenido este año, si no personaje
  2. Candidatas condicionales:
       - requisito cumplido sobre flags/atributos
       - dentro de ventana (anoActual - anoFlag <= ventanaAnos)
       - momento == momento actual, tipo == tipoRequerido
       - no vista antes (si unicaVez)
     → tirar dado por probabilidad, ordenar por prioridad. Si alguna pasa → esa.
  3. Si no: pool base filtrado por momento + tipo + modalidad/variante
     + minAno + requiereFase + no vista
  4. Ponderar: peso base × penalización por categoría repetida el año anterior
  5. Elegir con rng. Si el pool se vacía → reciclar las menos recientes, ignorando `unicaVez` como último recurso.
```

Dos detalles que evitan bugs feos más tarde:

- **Penalización por categoría repetida:** sin esto el jugador se come tres años seguidos de "dinero" y el juego parece roto.
- **Fallback de pool vacío:** con carreras de muchos años a 2 decisiones por año hacen falta **60-80 situaciones mínimo** (30-40 por momento).

> 🚨 El banco crece cada temporada; el volumen de contenido es **el verdadero cuello de botella del proyecto, no el framework**.

---

## 10. Rutas y renderizado

| Ruta | Render | JS | Función |
| --- | --- | --- | --- |
| `/` | Estático | 0 kB | Landing, título dinámico, CTA |
| `/como-jugar` | Estático | 0 kB | Reglas |
| `/jugar` | Estático + isla | ~25 kB | Todo el bucle jugable |
| `/r/:codigo` | SSR edge (cacheado) | 0 kB | Tarjeta compartida |
| `/api/og/:codigo.png` | Edge | — | Imagen Open Graph generada |

**El código de partida.** No hace falta base de datos en la v1: se codifica el resumen de la partida (nombre, modalidad, mejor fase, premios, tres hitos, seed) en base64url comprimido dentro de la propia URL, y la página de resultado lo decodifica. Cero backend, cero coste, cero GDPR. La compresión se hace con **`fflate`** (`deflate` → bytes → base64url). Si más adelante se quieren estadísticas globales ("solo el 3% ha ganado el COAC"), se añade un KV y se guarda el código con un contador, sin cambiar nada más.

**Imagen OG.** `satori` + `resvg-js` en el endpoint edge, con la tipografía cargada desde `public/fonts`. Es lo que hace que el enlace de WhatsApp muestre la tarjeta y no un rectángulo gris: para un juego viral no es un extra, es la mitad del producto.

**Persistencia local.** `localStorage` con versión de esquema. Si la versión no coincide tras un deploy que cambia el formato, se migra o se descarta con un aviso amable. Guardar en cada elección, no al final.

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
    "simular": "tsx scripts/simular.ts 10000"   // balance del juego
  }
}
```

Un solo comando, sin copiar bundles a mano, con hashing y cache-busting automáticos de Astro. **Deploy en Netlify**. El adapter `@astrojs/netlify` ya está configurado en `astro.config.mjs` (salida estática + función SSR on-demand para las rutas con `prerender = false`), y las dependencias `satori` y `@resvg/resvg-js` están instaladas. El catch-all de redirección se ha retirado de `netlify.toml` para no sombrear las rutas on-demand. Se mantienen `overrides` en `package.json` para forzar versiones seguras de dependencias transitivas (`sharp@^0.35.4`, `fflate@^0.8.3`) y eliminar `extract-zip` (subiendo `@netlify/functions-dev@^2.0.7`); `npm audit` queda en **0 vulnerabilidades**. La CI se integrará en Netlify o mediante GitHub Actions más adelante (ver hueco T12).

`scripts/simular.ts` es la herramienta más infravalorada del proyecto: lanza 10.000 partidas con jugadores aleatorios e imprime la distribución de fases alcanzadas, cuántas veces sale cada situación, qué condicionales nunca se disparan y qué atributos se desbocan. Sin eso, el balance es a ciegas.

**Tests que sí importan:**

- **Determinismo:** misma seed y mismas elecciones producen la misma partida.
- **Integridad de contenido:** ids únicos, toda flag referenciada en un requisito existe en alguna opción, toda situación tiene `momento`, ninguna situación es inalcanzable.
- **Snapshot** de una partida completa de referencia.

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
