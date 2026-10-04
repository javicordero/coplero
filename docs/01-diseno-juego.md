# 01 · Diseño del juego

> 📜 Documento de diseño del juego Coplero.
>
> Personaje, modalidades, estructura del COAC, sistema de decisiones, curva de carrera y reglas de las condicionales. El banco de situaciones vive en dos páginas aparte, una por momento del año.

---

## 1. Creación del personaje

Es el primer paso de la partida. El jugador define:

| Campo | Descripción |
| --- | --- |
| Nombre o apodo | Texto libre. Puede usarse un apodo tipo carnavalero. |
| Edad | Marca el punto de partida de la carrera. |
| Localidad | De dónde es el personaje: Cádiz capital, provincia, fuera… |
| Sexo / género | Cambia el título dinámico del juego. |

### Título dinámico según el género

| Selección | Título del juego |
| --- | --- |
| Masculino | **Coplero** |
| Femenino | **Coplera** |
| No binario | **Coplere** |

---

## 2. Modalidades y variantes

Tras crear el personaje se elige **una de las 2 modalidades** jugables. Cada modalidad tiene **3 variantes**, y cada variante tiene su **título** y **subtítulo**. Los subtítulos que son **citas** se muestran en cursiva y entre comillas “ ”.

### 🎺 Comparsista

| Variante | Subtítulo | ¿Cita? |
| --- | --- | --- |
| **Clásico** | Más clásico que un tenor con bigote. | — |
| **Evolución con raíces** | Amigo veterano, no pienses que mi copla va contra tu legado por nuestro descaro y solo es una moda | Sí |
| **Nueva escuela** | Buscas innovar tanto en la modalidad como en el carnaval, buscando nuevas formas. | — |

### 🤡 Chirigotero

| Variante | Subtítulo | ¿Cita? |
| --- | --- | --- |
| **Clásico** | Vuelve ya el 3x4, el 3x4 bueno | Sí |
| **Interpretar el personaje** | Aquí, de toda la vida, se han cantao pasodobles pa que vibre el coliseo, aquí no deberían permitirse pasodobles de cachondeo | Sí |
| **Lolosedismo** | Te gusta formar el taco tirando de humor visual y haciendo todo tipo de performances sobre las tablas | — |

### Decisiones comunes y decisiones exclusivas

> ✅ Resuelto: el banco **no** es uniforme. Cada situación declara un campo opcional `modalidades` y otro `variantes`:
>
> - Si el campo no existe, la situación es **común** a comparsista y chirigotero. Es el caso de la mayoría (dinero, grupo, jurado, prensa).
> - Si existe, la situación solo entra en la baraja de esa modalidad o variante. Ejemplo: el cierre de popurrí "Vámonos por Cai / Canto a la vida" es exclusivo de chirigotero.
> - La variante elegida no filtra por sí sola el tono del texto: lo hace el propio contenido de la situación.
>
> Esto ya está contemplado en los tipos del motor, así que añadir situaciones exclusivas no obliga a tocar código.

### La variante puede cambiar durante la carrera

La variante inicial **no es fija**. El cambio se produce a través de **situaciones normales**: para el jugador son una decisión más, pero internamente la opción elegida desplaza la variante (un clásico que apuesta año tras año por músicos de fuera y cierres corales acaba siendo de nueva escuela). El motor guarda la variante actual y el historial de cambios, y la tarjeta final lo narra: *"empezaste como clásico y acabaste siendo un renovador"*.

### La modalidad puede cambiarse a mitad de carrera

Existen **2 situaciones de verano** —una para chirigotero → comparsista y otra para comparsista → chirigotero— con **2 opciones** cada una: seguir con la modalidad actual o cambiarla. Si el jugador decide cambiar, a continuación elige una **variante de la nueva modalidad** antes de seguir, y el motor registra el cambio con su año. La tarjeta final muestra la modalidad inicial y el cambio si lo hubo.

En la misma línea, se contempla como ampliación futura añadir **corista** y **cuartetero** como modalidades jugables.

---

## 3. Estructura del COAC

El concurso tiene **4 fases**. Estos números aplican **a cada modalidad por separado**: comparsas y chirigotas compiten en su propio bombo.

| Fase | Agrupaciones |
| --- | --- |
| Preliminares | Entre 30 y 50 |
| Cuartos de final | 16 |
| Semifinales | 10 |
| Final | 4 |

### Premios ajenos al COAC

Se otorga **uno de cada por año**, además de los premios propios del concurso, y son independientes de la clasificación.

| Premio | A qué se da | Condición de acceso |
| --- | --- | --- |
| **Coplas por Andalucía** | A la mejor letra dedicada a Andalucía del año | Llegar a **semifinales** o más; ~15% por aparición |
| **Aguja de oro** | Al mejor disfraz o tipo del concurso | Llegar a la **final**; ~20-21% por final (rarísima desde semis) |
| **Candela y espino** | A la agrupación con más carga de crítica social y compromiso político | Llegar a **semifinales** o más; ~15% por aparición |

**Cómo los resuelve el motor.** Cada año, tras resolver la fase alcanzada, y de forma **independiente por premio** (**azar puro**, sin afinidad por atributos ni flags):

1. **Aguja de oro:** hay que **llegar a la final**; cada final da ~20-21% de opciones. Excepcionalmente (≈0,5%) se puede ganar llegando **solo a semifinales**.
2. **Coplas por Andalucía** y **Candela y espino:** se opta desde **semifinales**; ~15% por aparición (semifinal o final). La media ronda **2 por carrera**, pero depende de la asiduidad: quien no llega casi nunca a semis se queda a 0, y hay carreras que la ganan 5 veces.
3. Un mismo año puede caer más de uno (son independientes).

> 📌 Valores calibrados con el simulador (`src/engine/parametros.ts` → `premios`): aguja ≈0,74 por carrera; Coplas ≈2,0 y Candela ≈2,0. El tramo excepcional de la aguja se define con `umbralPuestoExcepcional`/`probabilidadExcepcional`.

Son uno de los mejores generadores de relato: dan algo que contar incluso en carreras que nunca ganan el concurso.

> 📌 El motor deberá **almacenar el puesto** de cada temporada, no solo la fase, para poder aplicar los umbrales top 6-7 / top 10. Las flags temáticas propias de Coplas por Andalucía (temática andaluza o de tierra) se añadirán al banco en el futuro.

---

## 4. Sistema de decisiones

Cada año de carnaval plantea **2 decisiones**:

1. Una en **verano** del año anterior: preparación, letra, ensayos, presupuesto…
2. Otra en **febrero** del año del carnaval: concurso, jurado, público, prensa…

Es decir, si el carnaval es el de 2027, la primera decisión ocurre en verano de 2026 y la segunda en febrero de 2027.

**La carrera empieza siempre en el carnaval de 2027** (año natural, no un contador). Por eso el indicador de contexto muestra el año natural de cada momento: **verano de 2026 · febrero de 2027** para la primera temporada, escrito sin la palabra «Año» (**«2026 · Verano»**, **«2027 · Febrero»**, **«2027 · Resultado»**). El resto de la carrera avanza año a año (2027, 2028, …).

### Reglas del sistema

- Cada decisión ofrece **2 opciones**, y en algunos casos **3**.
- Toda opción tiene **título** y **subtítulo o descripción**.
- No hay decisiones buenas ni malas: **las decisiones no cambian el resultado**; sirven para contar la historia. El desenlace de cada temporada lo fijan el techo oculto y el azar.
- **Los atributos parten de un valor estándar** y, por defecto, las decisiones no los mueven. Solo unas **pocas excepciones declaradas** (marcadas con `excepcion: true` en el contenido) mejoran o empeoran atributos, con una **contrapartida visible** en el texto y siempre acotadas por el techo.
- **El techo de la carrera está predeterminado de forma aleatoria** desde el inicio de la partida y permanece oculto al jugador durante toda la partida y también al final.
- La misma decisión puede hacerte no pasar de cuartos… o, con otro destino, ganar el primer premio.
- El objetivo real no es ganar: es que el jugador construya su propia historia y se forje sus películas.

> ⚠️ **Separación por momento del año.** Las decisiones de verano y las de febrero son conjuntos distintos. Una situación de verano (elección del tema del repertorio, presupuesto de vestuario, un componente que deja el grupo) no puede salir en febrero, y viceversa: una situación sobre el jurado, la reacción del público en el Falla o la prensa durante el concurso no tiene sentido en julio.
>
> El campo `momento: verano | febrero` es obligatorio en toda situación y condicional, y el motor filtra por él. Dentro de cada momento se mantiene la separación por tipo (contenido / personaje).

---

## 5. Banco de decisiones

El banco está dividido en **dos bloques grandes por momento**, y dentro de cada uno por categorías. Cada año sale **una de contenido + una de personaje** (nunca dos del mismo tipo).

| Tipo | Categorías | Ámbito |
| --- | --- | --- |
| 🎨 Contenido | Letra · Música · Puesta en escena | Letra, Música, Puesta en escena |
| 🧍 Personaje | Jurado · Dinero · Grupo · Prensa · Carrera · Concurso | Popularidad, Cohesión, Dinero |

> ✅ **Categorías ampliadas.** Además de las anteriores, el banco usa dos categorías de personaje: **Carrera** ("Carrera y grupo consagrado") y **Concurso** ("Enfado con el concurso"). Son categorías y situaciones a la vez, y pueden ser momentáneas (con sus condiciones de aparición).

Las categorías son un **catálogo del juego** que vive en `src/content/categorias.ts` y se puede **añadir o eliminar desde el panel local** (`/panel` → «Categorías»); no se puede borrar una categoría en uso por alguna situación o condicional. Añadir una categoría **no** cambia reglas del motor.

Cada opción lleva **título + subtítulo** y la **flag** que deja en el historial del personaje. Por defecto **no mueve atributos**; solo las **excepciones declaradas** (unas pocas en todo el banco) llevan efectos, y su intercambio se explica en el subtítulo.

> 📚 Las situaciones están en dos páginas hermanas, una por momento:
>
> - 3. Banco de decisiones · Verano — preparación: letra, música, dinero, grupo, decisiones de carrera.
> - 4. Banco de decisiones · Febrero — concurso: repertorio en escena, jurado, prensa, público y eventos especiales.

---

## 6. Situaciones condicionales

Cada opción deja una **flag** en el historial del personaje. Una situación condicional **no se dispara obligatoriamente**: la flag solo **abre la posibilidad** de que esa situación entre en la baraja del año. Que salga o no lo decide el azar.

### Reglas

- **Requisito:** una o varias flags activas en el historial. No tiene que ser la decisión inmediatamente anterior.
- **Ventana:** número de años durante los que la situación puede aparecer desde que se activó la flag. Si pasa la ventana, se cierra.
- **Probabilidad:** si la flag está activa y estamos dentro de la ventana, se tira dado cada año. Si no sale, puede volver a tirarse el año siguiente mientras dure la ventana.
- Una condicional **ocupa una de las 2 decisiones del año**, la de su tipo y su momento.
- Una condicional puede **consumir** la flag (aparece una sola vez) o dejarla activa si es de rasgo permanente. **Consumir no borra la flag del historial**: la marca como consumida y desactiva su capacidad de disparar; sigue disponible para la tarjeta final y los logros.
- Las condicionales también dejan flags: se pueden encadenar cadenas de 2-3 situaciones.

> ✅ **¿Caducan las flags?** Resuelto: las flags **no se borran nunca** del historial, porque la tarjeta final y los logros necesitan la carrera completa. Lo que caduca es su **capacidad de disparar condicionales**, mediante la ventana de años. Una flag fuera de ventana sigue en el historial pero ya no abre nada.

Las condicionales están listadas en la página de su momento correspondiente.

---

## 7. Duración, curva de carrera y equilibrio

Es la parte más importante del diseño: que la dificultad no frustre pero tampoco regale nada.

### Duración

**La carrera dura un número fijo de años, todavía por determinar.** Referencia provisional: 20 años · 2 decisiones por año · 40 decisiones. El personaje se retira al agotar esos años y la partida termina con el epílogo y la tarjeta. El número de decisiones por año será **parametrizable** (los modos rápido/lento se añadirán más adelante).

### Forma del arco

La mayoría de partidas deben seguir el arco **empezar humilde → ascender → declive en los últimos años**, con variaciones:

- Ascensos rápidos (pico en el año 5-6) y ascensos lentos (pico en el 14-15).
- Carreras de "reconocimiento tardío": muchos años en zona media-baja y punto álgido justo al final.
- Casos raros de éxito inmediato: llegar a la final el primer año, o incluso ganarlo, en un porcentaje muy pequeño de partidas.

### Distribución objetivo

| Resultado a lo largo de la carrera | Objetivo aproximado |
| --- | --- |
| Pisa la final alguna vez | ~45% de las partidas |
| No pasa nunca de cuartos | ~10% |
| No pasa nunca de preliminares | ~7% |
| Gana al menos un primer premio | ~27% |
| Gana 3 o más primeros premios | ~11% |
| Gana 5 o más primeros premios | ~6% |
| Gana 10 o más | ~0,4% |
| Gana 15 o más (carrera legendaria) | ~0,1% |
| Racha de 5 primeros premios seguidos | muy raro, pero posible |

> 📌 Objetivos actualizados (2026-09-19): la final se fija en ~45% y los premios suben ligeramente para resultar más agradables al jugador (~27% gana al menos un primer premio). Esa distribución es la que valida el simulador masivo; si los números reales no cuadran, se ajustan los pesos del techo, los umbrales y el ruido, no las situaciones.

### La forma del arco se construye, no se espera (2026-09-21)

El arco **no salía solo**: con los atributos quietos y la puntuación recortada contra el techo, la carrera vivía entera en su techo (veinte años en el puesto 17 o en el 5). Desde la feature 013 la puntuación de cada año es una **curva de carrera** —empieza por debajo de su potencial, toca su cima en el año pico y declina—, más una **forma con memoria** que produce rachas cortas, y el puesto dentro del nivel se calcula por **mérito relativo** a la propia carrera (ya no se satura en el extremo de la banda). El año pico pasa a ser el mejor momento real de la carrera.

Consecuencias que conviene recordar al calibrar:

- La **amplitud del arco** importa más que el ruido. Con un arco pequeño (16 puntos) y bandas de 3, la puntuación se queda dentro de la banda del techo muchos años y la carrera vuelve a ser plana; con 30 el techo se toca pocos años.
- Los **premios ajenos** se miden por aparición desde semifinales. Como el arco reduce los años en la parte alta, sus probabilidades se recalibraron para mantener las frecuencias de §3 (aguja 0,74; coplas 1,98; candela 1,99 por carrera).
- Las **excepciones de atributos** se acumulan al repetirse la misma situación. Su aporte a la puntuación está acotado, porque un desplazamiento permanente sin límite anula el arco.
- El simulador informa de la **forma** (racha máxima, posiciones distintas, arco, diversidad de secuencias) además de los agregados. Un fallo como el descrito era invisible en los agregados y evidente en la secuencia.
- Objetivos de forma: racha máxima ≤ 4 años en el 90 % de las carreras (nunca más de 8), ≥ 6 posiciones distintas de media y arco visible en el 60 % (no en el 100 %: los ascensos rápidos y los éxitos tempranos son parte del diseño).

---

## 8. Ampliación con situaciones reales del Carnaval de Cádiz

Se quiere ampliar el banco inspirándose en episodios reales de la historia del Carnaval de Cádiz y del COAC — polémicas de letras, decisiones del jurado, sponsors, cambios de modalidad, rupturas de grupos históricos — convertidos en situaciones genéricas, **sin usar nombres reales de personas o agrupaciones**, para no atribuir hechos concretos a alguien identificable.

Cada situación nueva se archiva directamente en la página de su momento y con su tipo y categoría, de modo que el motor pueda filtrar sin trabajo extra.

---

## 9. Pendiente de definir

- [ ] Cerrar los valores numéricos de atributos de cada opción con el simulador masivo.
- [ ] Ampliar el banco a 60-80 situaciones (30-40 por momento).
- [ ] Añadir más cadenas condicionales de 3 eslabones.
- [ ] Ampliar el banco con más decisiones de 3 opciones.
- [ ] Textos de resultado de cada fase del COAC (pasas / te quedas fuera) y epílogos de retirada.
- [ ] Diseño de la tarjeta final compartible: qué datos incluye y formato de imagen.
- [ ] Definir los logros e insignias por hitos raros, no solo por ganar (ejemplo: *"nunca cambiaste de variante en toda tu carrera"*), y los finales alternativos según el conjunto de flags acumuladas y no solo según el resultado del COAC.
- [x] Etiquetar el campo `momento: verano | febrero` en cada situación → banco ya dividido en dos páginas.
- [x] Decidir si el banco se filtra por modalidad/variante → sí, con los campos `modalidades` y `variantes` opcionales.
- [x] Decidir si las flags caducan → no caducan; caduca su ventana de disparo.
- [x] Decidir si la duración es fija → sí, un número fijo de años, **todavía por determinar** (referencia provisional: 20 años / 40 decisiones).
- [x] Categorías del banco → contenido (Letra, Música, Puesta en escena) y personaje (Jurado, Dinero, Grupo, Prensa, Carrera, Concurso).
- [x] Condiciones para optar a los premios ajenos al COAC → definidas en la sección 3.
- [x] Definir cómo se calcula el techo de carrera → ver 2. Arquitectura técnica, sección 8.
