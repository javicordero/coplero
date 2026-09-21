# Registro · Decisiones cerradas

Decisiones ya resueltas y documentadas en `docs/01`–`docs/06`. Este registro es **derivado**: la fuente de verdad es el documento correspondiente. No incluye lo que sigue abierto (ver `decisiones-pendientes.md`).

## Arquitectura

| Decisión | Detalle | Fuente |
|---|---|---|
| Framework Web | Astro solo. Descartados Angular y Astro + Angular Elements | 02 §1–4 |
| Framework de la isla | **Svelte** (no Preact) | 02 §4 |
| Modelo de proyecto | Proyecto único, **sin monorepo** | 02 §6 |
| Carpeta raíz | `coplero/` | 02 §6 |
| Nombres engine/content | `seed.ts`, `types.ts`, `schema.ts` (nomenclatura actual del scaffold) | 02 §6 |
| Capas | `engine` (TS puro) → `content` (datos) → `web` (Astro + isla) | 02 §5 |
| Regla engine | No importa nada de UI, ni DOM, ni framework, ni `Math.random()`, ni `Date.now()` | 02 §5 |
| Regla content | No contiene lógica; son objetos; validados con Zod | 02 §5 |
| Determinismo | Semilla + decisiones → misma partida siempre | 02 §5 |
| Modelo de engine | Reducer puro: `crearPartida`, `siguientePaso`, `elegir`, `resumen` | 02 §7 |
| Estado | Serializable, sin clases; `Partida` con `version: 1` | 02 §7 |
| Árbol de requisitos | `flag`, `flagRepetida`, **`faseAlcanzada`**, `todas`, `alguna`, `ninguna`, `atributo` | 02 §7 |
| Requisitos de hito | `faseAlcanzada` se evalúa **dentro de la misma partida**; cada partida es independiente | 02 §7 |
| `flagRepetida` | Modificador `consecutivos?: boolean` para exigir "años seguidos" | 02 §7 |
| Consumo de flags | Consumir **no borra** del historial: la marca como consumida y desactiva su disparo | 01 §6, 02 §7 |
| Opciones que saltan el COAC | Campo `saltaCOAC` en `Opcion` | 02 §7 |
| Temporada | Guarda `fase`, **`puesto`**, `premios` y `fueraDeConcurso` | 02 §7 |
| Categorías | `letra`, `musica`, **`puestaEnEscena`**, `jurado`, `dinero`, `grupo`, `prensa`, **`carrera`**, **`concurso`** | 01 §5, 02 §7 |
| Duración | Número **fijo** de años, todavía por determinar (referencia: 20/40) | 01 §7 |
| Decisiones por año | **Parametrizable** (v1: 2; modos rápido/lento más adelante) | 01 §4, 02 §8 |
| Batacazo | Puede **atravesar el `suelo`**; el `clamp` solo aplica a la resolución normal | 02 §8 |
| Reciclaje de pool | Si el pool se agota, recicla las menos recientes **ignorando `unicaVez`** como último recurso | 02 §9 |
| Techo oculto | Predeterminado por RNG al crear la partida; nunca se muestra; no se serializa; **6 niveles** | 01 §4, 02 §8 |
| Válvulas narrativas | Batacazo **3% anual** y Milagro **2% por carrera** (se sortea una sola vez al crear) | 02 §8 |
| Niveles del techo | `preliminares`, `cuartos`, `semifinales`, `final`, `podio`, `primer_premio`; `podio` puede ganar (1-3) y `primer_premio` gana con más facilidad (C12) | 02 §8 |
| Calibración del techo (2026-09-19) | Pesos `7/3/47/6/28/9`; umbrales de nivel `42/54/60/62/68`; `multiplicadorRuido` 6. Medido con 10.000 carreras: final 43,5%, no cuartos 10,4%, no preliminares 7,1%, ≥1 primer premio 27,2%, ≥3 11,5%, ≥5 5,8%, ≥10 0,4%, ≥15 0,1% | 01 §7, 02 §8 |
| Factor "crack" | ~1% de las carreras nacen con carisma extra oculto (`probabilidadCrack` 0,01; `bonusCrack` 10), que genera la cola legendaria (carreras que ganan 10-15 primeros premios). Se sortea al crear la partida y no se muestra | 01 §7, 02 §8 |
| Código de partida | Base64url comprimido en la URL; sin base de datos en v1 | 02 §10 |
| Compresión del codec | **`fflate`** (`deflate` → bytes → base64url) | 02 §10 |
| Imagen OG | `satori` + `resvg-js` en endpoint edge; fuentes en `public/fonts`; requiere `prerender = false` | 02 §10 |
| Adapter de deploy | `@astrojs/netlify` configurado (estático + función SSR on-demand); `netlify.toml` sin catch-all | 02 §11 |
| Seguridad de dependencias | `overrides` para `sharp@^0.35.4`, `fflate@^0.8.3` y `@netlify/functions-dev@^2.0.7`; `npm audit` = 0 vulnerabilidades | 02 §11 |
| Persistencia | `localStorage` con **doble versión de esquema** (sobre en `web` + `Partida` en `engine`); guardar en cada elección y al crear la partida | 02 §10 |
| Guardado no restaurable (2026-09-20) | Versión distinta, JSON inválido, tipos inesperados o deserialización fallida ⇒ se **elimina** y se muestra un **aviso puntual** (una sola vez) ofreciendo empezar de cero; **sin migración** en v1 | 02 §10 |
| Almacenamiento no disponible (2026-09-20) | Almacén **no-op** si no hay `localStorage` o falla (cuota/permiso): se juega igual, **sin aviso**, y no aparece "Continuar" después | 02 §10 |
| Partida terminada (2026-09-20) | La pantalla inicial distingue **en curso** ("Continuar") de **terminada** ("Ver resultado" + "Empezar de cero"); el guardado se conserva al acabar | 02 §10 |
| Varias pestañas (2026-09-20) | Sin sincronización: gana la última pestaña que guarde; no se detecta conflicto | 02 §10 |
| Saneamiento y moderación | Definidos: normalización + límites, escape `< > & " '`, lista de bloqueo, validación cliente + servidor/OG | 05 §7 |
| Simulación | `scripts/simular.ts`, 10.000 partidas; `tsx` **instalado** | 02 §11 |
| Deploy | **Netlify** | 02 §11, 06 |
| Tests clave | Determinismo, integridad de contenido, snapshot | 02 §11 |
| Orden de trabajo | engine+content → isla → ampliar banco → tarjeta/OG → presentación → métricas | 02 §12 |

## Juego

| Decisión | Detalle | Fuente |
|---|---|---|
| Creación de personaje | Nombre/apodo, edad, localidad, sexo/género | 01 §1 |
| Título dinámico | Coplero / Coplera / Coplere | 01 §1 |
| Modalidades v1 | 2 jugables: Comparsista y Chirigotero | 01 §2 |
| Variantes | 3 por modalidad, con título y subtítulo | 01 §2 |
| Variante mutable | Puede cambiar durante la carrera; guarda variante actual e historial | 01 §2 |
| Cambio de variante (2026-09-20) | Se produce por **situaciones normales**: la opción elegida desplaza la variante internamente, sin presentarse como mecánica al jugador; el motor registra el historial (T18; se implementa en la feature 006) | 01 §2 |
| Cambio de modalidad (2026-09-20) | **2 situaciones de verano** (chirigotero → comparsista y comparsista → chirigotero) con 2 opciones (seguir / cambiar); al cambiar, el jugador elige una **variante de la nueva modalidad** y el motor registra el año (T19; se implementa en la feature 006) | 01 §2 |
| Trayectoria en `Partida` (2026-09-20) | `modalidadInicial`, `varianteInicial` y `cambios[]` (año, modalidad, variante); los cambios se disparan con `Opcion.cambiaModalidad`/`Opcion.cambiaVariante`; el catálogo de variantes viaja en el banco; `VERSION_PARTIDA` sube a **2** (006) | 01 §2, 02 §7 |
| Cambios repetibles y de baja frecuencia (2026-09-20) | Modalidad y variante pueden cambiar y **volver**; se modelan como **condicionales de baja probabilidad** (5% variante, 4% modalidad desde el año 4) para no bloquear el reciclado del pool; la selección posterior usa la modalidad/variante vigentes; el cambio de variante no se anuncia como mecánica (006) | 01 §2, 02 §7 |
| Filtrado del banco | Campos opcionales `modalidades` y `variantes`; ausencia = común | 01 §2 |
| Fases COAC | 4: Preliminares (30-50), Cuartos (16), Semifinales (10), Final (4), por modalidad | 01 §3 |
| Premios ajenos | 3: Copla para Andalucía, Aguja de oro, Candela y espino; se resuelven **de forma independiente** cada año (puede caer más de uno) | 01 §3 |
| Puesto | Se almacena el puesto además de la fase; umbrales por premio (Aguja: final; Copla/Candela: semifinales) | 01 §3, 02 §7 |
| Calibración de premios (2026-09-19) | **Azar puro** (sin afinidad por atributos/flags). Aguja de oro: final ≈21% y tramo excepcional desde semis ≈0,5% (`umbralPuestoExcepcional`/`probabilidadExcepcional`); Copla y Candela: ≈15% por aparición desde semis. Medido con 8.000 carreras: aguja 0,74/carrera, copla 1,98, candela 1,99 | 01 §3 |
| Decisiones por año | 2: una en verano (año anterior) y una en febrero | 01 §4 |
| Opciones por decisión | 2 normalmente, 3 en algunos casos; siempre título + subtítulo | 01 §4 |
| Momento | Campo obligatorio `verano \| febrero`; el motor filtra por él | 01 §4 |
| Set de categorías | Contenido (Letra, Música, Puesta en escena) y Personaje (Jurado, Dinero, Grupo, Prensa, Carrera, Concurso) | 01 §5 |
| Reparto por año | Una decisión de contenido + una de personaje, nunca dos del mismo tipo | 01 §5 |
| Flags | No se borran nunca; caduca su ventana de disparo | 01 §6 |
| Condicionales | No obligatorias; requisito + ventana + probabilidad; pueden consumir flag; pueden encadenarse | 01 §6 |
| Distribución objetivo | Tabla de resultados objetivo a lo largo de la carrera | 01 §7 |
| Inspiración en hechos reales | Situaciones genéricas, **sin nombres reales** de personas o agrupaciones | 01 §8 |

## Producto

| Decisión | Detalle | Fuente |
|---|---|---|
| Mobile-first real | Móvil primero; escritorio mismo layout, 420-480 px centrados | 05 §1 |
| Indicador de contexto | Año, momento y tipo siempre visibles en la decisión | 05 §1 |
| Continuar partida | Acción principal de la home si hay partida guardada | 05 §1 |
| Transiciones | 200-300 ms, no bloqueantes, saltables | 05 §1 |
| Modo oscuro/claro | Detección de sistema + conmutador manual. **Aclarado (2026-09-21): v1 es solo tema oscuro**; el conmutador sigue en v1.1 (ver «Presentación») | 05 §1 |
| Compartir v1 | PNG 9:16 y 1:1, Web Share API, OG dinámico, watermark, copia al portapapeles, código corto | 05 §2 |
| Tarjeta final (2026-09-20) | Contrato `TarjetaFinal` generado por el motor + presentación: nombre/apodo, modalidad y variante iniciales, evolución de modalidad y variante, años en activo y sin concursar, mejor fase, primeros premios y otros, tres hitos (derivados de datos existentes) y frase de cierre. Nunca muestra datos ocultos. Alcance completo: código en URL + PNG 9:16/1:1 + OG + compartir nativo (T20; se implementa en la feature 007, que depende de la 006) | 01 §2, 02 §8 |
| Tarjeta final · composición y código (2026-09-20) | Adaptación de la referencia externa (copero.com) como tarjeta-póster **sin número héroe**; fila de trayectoria (chips inicio → cambios → final) y datos destacados separados y nunca sumados (COAC · mejor posición cuando no hay premio · otros premios por tipo con recuento, omitiendo tipos no ganados). Código **autocontenido y sin `seed`** (`VERSION_CODIGO`), con `TarjetaFinal` ya derivada; rutas `/r/:codigo` y `/api/og/:codigo.png?t=og\|9x16\|1x1` on-demand; privacidad del nombre (`sinNombre`) y acciones de compartir. WCAG 2.2 AA | 01 §2, 02 §8/§10 |
| Decisiones sin efecto (2026-09-20) | Las decisiones **no cambian el resultado**: lo fijan el `destino` oculto y el azar. Los atributos parten de un valor estándar y solo los mueven unas pocas **excepciones declaradas** (`Opcion.excepcion`, con intercambio visible). Retirados los 80 `efectos` del banco; recalibrado **solo por parámetros** (pesos `7/3/47/16/18/9`, umbrales `42/45/48/54/57`, volatilidad 0,4–1,3, `bonoAnoPico` 14, crack 0,003/12) manteniendo el objetivo de `01` §7. Fuera de alcance: efecto diferido y resultado incierto 60/40. Feature 008; cierra C15 | 01 §2, 02 §8 |
| Panel de contenido (2026-09-21) | Panel **local solo-dev** (`/panel`, 404 en producción por guard `import.meta.env.DEV`) para ver/crear/editar/eliminar situaciones; su almacén JSON `content-admin/data/situaciones.json` es la **fuente de verdad** versionada (backups ignorados) y `npm run panel:volcar` regenera `src/content/decisiones/**` de forma determinista y sin pérdida. Se descarta `json-server`; sin BD, sin dependencias nuevas y reutilizando los esquemas Zod del juego. Feature 009 | 02 §11 |
| Categorías gestionables (2026-09-21) | **B2**: las categorías de situación se pueden **añadir/eliminar desde el panel** («Categorías»). Fuente única: `src/content/categorias.ts` (generado y gestionado por el panel); `modalidades.ts` lo reexporta. No se puede borrar una categoría **en uso** (situación o condicional) ni dejar el catálogo vacío; el renombrado queda fuera de alcance. El tipo `Categoria` del motor pasa a `string` porque el motor no puede importar de `content` (la validación fuerte la hace Zod). FR-023 | 01 §2, 02 §11 |
| Buy Me a Coffee | Reutilizar la cuenta de acordesgaditanos con `?utm_source=coplero` | 05 §5 |
| Analítica | Recomendada sin cookies (Plausible/Umami/Cloudflare); sin banner | 05 §7 |
| AdSense | Exige dominio propio y CMP con Consent Mode | 05 §7, 06 |
| `.netlify.app` | Válido para lanzar y compartir sin monetización; no válido para AdSense | 06 |
| Dominio | Necesario para AdSense; `.com` o `.es` | 06 |
| Migración de dominio | Netlify añade dominio y SSL gratis; redirección desde `.netlify.app` | 06 |
| Simulación masiva | Confirmada como herramienta imprescindible de balance | 05 §8 |
| Preload | No aplica precargar decisiones (ya en memoria); sí fuentes/imágenes y reservar hueco de tarjeta | 05 §8 |

## Presentación

| Decisión | Detalle | Fuente |
|---|---|---|
| Sistema de diseño (2026-09-21) | Fuente única de tokens en `src/ui/` (`tokens.css` + `base.css` + espejo `tokens.ts`), importados una sola vez desde `Layout.astro`: heredan a Astro y a la isla **sin añadir JS**. Cero dependencias nuevas. Feature 012 | 02 §6 |
| Tipografía de marca (2026-09-21) | **Anton** (display) + **Atkinson Hyperlegible** (texto), libres (OFL), autoalojadas y subseateadas (woff2 `latin`/`latin-ext`; TTF completas solo para `satori`), con `font-display: swap` y pila de reserva del sistema. Licencias en `public/fonts/`. Sustituyen a `system-ui`, que era todo lo que había | 02 §6 |
| Paleta con rol único (2026-09-21) | **12 tokens** de color, cada uno con un único significado: marca/verano (`--c-acento`), febrero/selección (`--c-acento-2`), error, y neutros. Se colapsan 22 valores hex sueltos y se corrigen dos errores semánticos (el error se pintaba con el ámbar de marca; un mismo verde servía de indicador y de hover). El color **nunca** es el único canal: el momento y los avisos llevan texto | 012 `contracts/ui.md` |
| Decorativo vs. componente de UI (2026-09-21) | `--c-separador` (`#262b33`) para filetes decorativos, **exento** del 3:1 de WCAG 1.4.11, y `--c-borde-control` (`#6b6b6b`, ≥3:1 en las tres superficies) para contornos de controles. Corrige el contrato inicial (daba 3:1 a un único borde) **sin bajar ningún umbral** | 012 `contracts/ui.md` |
| Elemento firma · regla de compás (2026-09-21) | Un compás de 3/4 en SVG inline, decorativo (`aria-hidden`), presente en la cabecera, como separador de secciones en la portada y en el pie de la tarjeta. Sin fichero de imagen ni JS (`ReglaCompas.svelte`, que Astro sirve como HTML estático) | 012 `contracts/ui.md` §6 |
| Estados y movimiento (2026-09-21) | Matriz de estados en `base.css` (reposo, hover, active, focus-visible, disabled, seleccionado) con objetivos táctiles ≥44 px; duraciones **120/200/280 ms**, dentro de los 200-300 ms de `05` §1, y `prefers-reduced-motion` que las neutraliza por completo | 05 §1, 012 |
| Identidad en la imagen OG (2026-09-21) | El endpoint OG comparte paleta y tipografía con el sitio vía `src/ui/tokens.ts`, y escala los tres formatos para que ninguno recorte contenido. Se **retira** `public/fonts/Coplero.ttf`: era **DejaVu Sans** (la parencia que `satori` exige), no una tipografía de marca | 02 §10, 012 |
| Modo oscuro único (2026-09-21) | **Aclaración**: v1 se sirve **solo en tema oscuro**. `docs/05` §1 describía "detección de sistema + conmutador" y §9 lo situaba en v1.1; se mantiene la misma hoja de ruta, pero v1 no implementa conmutador ni tema claro | 05 §1, §9 |

## Motor · forma de la carrera

| Decisión | Detalle | Fuente |
|---|---|---|
| Curva de carrera (2026-09-21) | La puntuación de cada año deja de ser una base constante: `aptitud(ano)` es un arco que arranca por debajo del potencial, toca su cima en `anoPico` y declina, con exponente para afilarla. El techo pasa a ser *aspiracional* (se toca en el mejor momento) en vez de ser el sitio donde la carrera descansa desde el primer año. Feature 013 | 01 §7, 02 §8 |
| Amplitud del arco (2026-09-21) | `curvaSubida`/`curvaDeclive` = **30** puntos. Es el parámetro que decide si la carrera se queda pegada a su techo: con bandas de nivel de 3 puntos, un arco pequeño mantiene la puntuación dentro de la banda del techo durante años. Medido: con 16 puntos el 31 % de las carreras repetía posición más de 4 años seguidos; con 30, el 5 % | 013 |
| Forma con memoria (2026-09-21) | La variación anual ya no es ruido blanco: es un **AR(1) derivado de la semilla** (`forma.ts`, `memoriaForma` 0,3; `amplitudForma` 4). Produce rachas creíbles que se rompen en pocos años y **no añade estado a `Partida`** (se calcula), así que no hay migración ni subida de `VERSION_PARTIDA` | 013 |
| Puesto por mérito (2026-09-21) | El puesto dentro del nivel se calcula por **mérito relativo a la propia carrera**, no con `entre(puntuacion, umbralBase, umbralTope)`. Ese cálculo se saturaba en el extremo de la banda en cuanto el nivel quedaba recortado contra el techo: de ahí los veinte años en el puesto 17, 11 o 5 | 013 |
| Tope al aporte de atributos (2026-09-21) | El aporte de los atributos a la puntuación está acotado (`aporteAtributosMax` = **6**). Las 6 excepciones declaradas son intercambios de ±1, pero se aplican decenas de veces y **se acumulan**: una carrera medida acumulaba **+11,6** (letra 50→75), un desplazamiento permanente que anulaba el arco. Los atributos siguen moviéndose libres; el tope es solo sobre cuánto empujan el resultado | 013, 02 §8 |
| Recalibración de premios ajenos (2026-09-21) | Probabilidad **por aparición**: aguja `0,21 → 0,39`; copla y candela `0,15 → 0,63`. El arco reduce los años en la parte alta (de ~13 a ~3-6), así que con las probabilidades antiguas la frecuencia por carrera se desplomaba (copla 1,98 → 0,26). El objetivo de `01` §3 es el resultado medido y su regla es "azar puro por aparición" | 01 §3, 013 |
| Objetivos de forma (2026-09-21) | Racha máxima de posiciones idénticas **≤ 4 años en el 90 %** de las carreras (nunca más de 8), **≥ 6 posiciones distintas** de media y arco visible en el **60 %** (no en el 100 %: `01` §7 quiere también ascensos rápidos y éxitos tempranos). Medido: racha media 2,5; peor 8; 11,6 posiciones distintas; arco 65,6 % | 013 |
| Los cracks quedan fuera de la métrica de forma (2026-09-21) | Una carrera **crack** (`carisma ≥ bonusCrack`) está diseñada para dominar: repetir el primer puesto muchos años es su relato. Se excluye de la auditoría de planicie y de las métricas de forma, y el informe lo declara (`cracksExcluidos`). Las bandas de `final` `[4,4]` y `primer_premio` `[1,1]` son de un solo valor por definición del COAC | 013 |
| El simulador mide la forma (2026-09-21) | `RegistroCarrera` guarda la **secuencia por año** y el informe añade racha máxima, posiciones distintas, arco, diversidad de secuencias y diversidad por techo, más un hallazgo de auditoría **«carrera plana»**. Los agregados no detectaban el fallo: era invisible sin mirar el orden | 013, 02 §11 |

## Ver también

- `decisiones-pendientes.md` — backlog abierto, explicaciones y huecos diferidos.
- `docs/README.md` — mapa de documentos.
