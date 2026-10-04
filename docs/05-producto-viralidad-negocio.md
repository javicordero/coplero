# 05 · Producto, viralidad y negocio

> 🚀 Todo lo que no es motor ni banco de decisiones: interfaz, compartir, comunidad, difusión, dinero, legal y rendimiento. Aquí están integradas y clasificadas las ideas sueltas, con respuesta a las preguntas que quedaban abiertas.

---

## 1. Interfaz y experiencia de juego

- **Mobile-first real:** la UI se diseña para móvil y en escritorio se mantiene el mismo layout con un ancho máximo contenido (tipo 420-480 px centrados). No hay versión de escritorio distinta.
- **Indicador de contexto permanente:** en cada decisión se ve el año y el momento (verano / febrero). Así el jugador entiende el sistema sin leer nada.
- **"Continuar donde lo dejaste"** como acción principal de la home cuando hay partida guardada, y "Empezar de cero" como secundaria.
- **Transiciones entre años** cortas (200-300 ms) que sugieran paso del tiempo sin alargar la partida. Nunca bloqueantes: se pueden saltar tocando.
- **Modo oscuro / claro** con detección de preferencia del sistema y conmutador manual.
- **Resúmenes de temporada breves** y micro-eventos sin decisión, para que 40 clics no parezcan un formulario.

> 🎨 **Cómo diferenciar verano de febrero en la interfaz (opciones valoradas)**
>
> 1. **Color de acento por momento** (recomendada): una variable CSS cambia la paleta — verano en tonos cálidos de calle y playa, febrero en azul noche de teatro. Coste casi cero, se nota al instante y no afecta al rendimiento.
> 2. **Cabecera contextual** (recomendada, combinable con la 1): etiqueta con icono ☀️ / 🎭 y texto "Verano 2029 · preparando" o "Febrero 2030 · cuartos de final".
> 3. **Textura o ilustración de fondo** (opcional, fase 2): fondo sutil de calle en verano y de telón del Falla en febrero. Bonito, pero suma peso de imagen: dejarlo para después del lanzamiento y siempre con lazy loading.
>
> Descartado: cambiar tipografía entre momentos. Rompe la consistencia y obliga a cargar dos familias.

---

## 2. Viralidad y compartir

Es la mitad del producto: la tarjeta final es el anuncio del juego.

- **Imagen de resultado como PNG descargable** en dos formatos nativos: 9:16 para stories y 1:1 para post. No una captura genérica.
- **Botón de compartir nativo (Web Share API)** con mensaje adaptado al destino: texto corto para WhatsApp/X, imagen para Instagram y stories.
- **Meta tags Open Graph dinámicos por resultado**, para que el enlace pegado en redes muestre una preview personalizada.
- **Watermark discreto** con la URL del juego en la propia imagen, para que la viralidad devuelva tráfico.
- **Copia automática al portapapeles** de un texto sugerido al pulsar compartir, para que nadie tenga que redactar nada.
- **Código de partida corto y memorable** (estilo Wordle) compartible como texto plano, sin imagen.
- **Formatos de compartir por momento**: uno al quedar eliminado, otro al ganar, otro para hitos intermedios (pasar de fase), cada uno con su diseño.
- **"Camino de decisiones" completo** exportable como hilo, para quien quiera contar la historia entera y no solo el resultado.
- **Cronología exportable** tipo libro de la carrera (PDF o imagen larga) como formato premium de compartir. Fase 2.
- **Enlace a Buy Me a Coffee** en la tarjeta final, discreto.

---

## 3. Comunidad y contenido

- **Buzón de sugerencias de situaciones** dentro del juego: la comunidad propone eventos reales o inventados. Es la vía más barata de llegar a las 60-80 situaciones.
- **Favoritos:** que el jugador marque las situaciones que más le han gustado, como señal indirecta de calidad.
- **Beta cerrada con carnavaleros reales** antes del lanzamiento público, para validar tono y equilibrio.
- **Créditos y agradecimientos** a quien aporte ideas o revise el tono carnavalesco.
- **Redes propias del juego**: Instagram (prioritaria: la gente etiqueta al compartir la tarjeta y se pueden republicar sus stories), X y TikTok. Se apoyan en las de **acordesgaditanos** el primer mes en lugar de partir de cero.
- **Reto diario con semilla fija** para todos los jugadores y racha visible. *Más adelante.*
- **Cuenta opcional** para guardar histórico entre dispositivos, sin obligar a registrarse para jugar. *Más adelante.*

---

## 4. Difusión y posicionamiento

- **acordesgaditanos como puente de visitas:** sí, es el activo más valioso del lanzamiento. Es la web de referencia de acordes del Carnaval de Cádiz y el público coincide al 100% con el del juego. Plan: banner o bloque destacado en portada y en las páginas de agrupaciones, más un enlace fijo en el menú. En sentido contrario, el juego enlaza a acordesgaditanos para que se vea que son del mismo autor.
- **SEO:** búsquedas tipo "juego carnaval Cádiz", "wordle carnaval", "simulador COAC". Astro lo facilita al servir HTML puro. Reforzar con páginas estáticas de contexto (cómo jugar, historia del COAC, FAQ), que además ayudan con AdSense.
- **Footer del sitio** con mención al autor, LinkedIn y GitHub, siguiendo el patrón de acordesgaditanos.
- **Página de contacto** con formulario gestionado por un servicio sin backend (Formspree o similar), igual que en acordesgaditanos.
- **Anuncio en LinkedIn** del lanzamiento, reutilizando el enfoque del post de acordesgaditanos.
- **Borrador de post para LinkedIn**

  > Acabo de lanzar **Coplero**, un juego narrativo sobre el Carnaval de Cádiz: creas un personaje, eliges modalidad y construyes tu carrera en el COAC a base de decisiones. Cada partida cuenta una historia distinta y acaba en una tarjeta para compartir.
  >
  > Por debajo es un proyecto que me apetecía hacer bien: motor de juego en TypeScript puro y determinista (misma semilla, misma partida), el contenido separado como datos validados, y una web en Astro donde la landing y las páginas de resultado se sirven como HTML estático para que abrir el enlace desde WhatsApp sea instantáneo. Toda la lógica es testeable sin tocar la interfaz, y hay un simulador que lanza miles de partidas para equilibrar el juego con datos y no a ojo.
  >
  > Es el hermano pequeño de acordesgaditanos.com, la web de acordes del carnaval que mantengo desde hace tiempo.
  >
  > ¿Hasta dónde llega tu carrera? 👉 [enlace]

---

## 5. Monetización

- **AdSense:** requiere dominio propio y contenido suficiente. Ver Dominio, hosting en Netlify y AdSense.
- **Donaciones voluntarias** tipo "invítame a un tigre", implementadas igual que el Buy Me a Coffee de acordesgaditanos, con un pequeño gesto de agradecimiento dentro del juego.
- **Espacio para marcas:** bloque discreto tipo "¿Te interesa anunciarte aquí? Escríbenos", enlazando a la página de contacto. Tiene sentido solo cuando haya tráfico que enseñar.

> ☕ **¿Crear un Buy Me a Coffee nuevo para Coplero?**
>
> No hace falta y sale peor: la cuenta actual ya está verificada y con método de cobro configurado, y una segunda cuenta obliga a otro email, otra verificación y fragmenta ingresos y gestión. Mejor **reutilizar la de acordesgaditanos** y distinguir el origen con un parámetro en el enlace (por ejemplo `?utm_source=coplero`), que además refuerza que los dos proyectos son de la misma persona. Solo merecería la pena separarlas si en el futuro Coplero tuviera marca e identidad propias del todo.

---

## 6. Analítica y balance

- **Qué decisiones se toman más:** la métrica clave de equilibrio. Una opción elegida el 95% de las veces está mal calibrada.
- **Panel interno simple** para ver qué situaciones y condicionales se disparan más o menos de lo esperado, y qué flags nunca se activan.
- **Distribución de resultados reales** frente a la distribución objetivo de techos, para validar que la curva de dificultad se cumple en jugadores de verdad.
- **A/B testing de textos** de decisiones para ver cuáles retienen mejor. *Más adelante.*

---

## 7. Legal y seguridad

- **Política de privacidad simple**, obligatoria desde el momento en que haya analítica, formulario de contacto o cuentas.
- **Moderación básica automática** de cualquier texto libre (nombre de personaje, agrupación, sugerencias) para evitar insultos y contenido ofensivo.
- **Sanitización de todo input** antes de mostrarlo o meterlo en la imagen OG, para evitar inyecciones.

> 🧼 **Saneamiento y moderación (definido)**
>
> 1. **Normalización y límites:** recortar espacios, colapsar whitespace y limitar longitud (nombre/apodo: 24 caracteres; sugerencias: 500).
> 2. **Saneamiento (nunca HTML):** escapar `& < > " '` antes de renderizar o incrustar en la imagen OG. En la OG, además, escapar el marcado XML y usar solo texto plano sin saltos. Nunca usar interpolación de HTML crudo (`{@html}` o equivalente) con datos del usuario.
> 3. **Moderación automática:** lista de bloqueo de insultos y contenido ofensivo en español (con variantes sin vocales y leetspeak). Si el texto la supera, se rechaza con un mensaje neutro. El texto libre nunca se usa como identificador.
> 4. **Momento de validación:** en cliente para feedback inmediato y en servidor / endpoint OG como fuente de verdad antes de generar cualquier imagen.

> 🍪 **¿Hace falta banner de cookies en España si meto analítica?**
>
> Depende de la herramienta:
>
> - **Analítica sin cookies** (Plausible, Umami, Cloudflare Web Analytics): no usa cookies ni identificadores en el dispositivo, así que **no hace falta banner de consentimiento**. Basta mencionarla en la política de privacidad. Es la opción recomendada para el lanzamiento.
> - **Google Analytics 4**: sí exige banner con consentimiento previo y bloqueo del script hasta que se acepte.
> - **AdSense**: en cuanto se activen anuncios, **el banner es obligatorio** y además tiene que ser un CMP certificado por Google con Consent Mode. Esto no es opcional ni negociable.
> - `localStorage` para guardar la partida del propio usuario es funcionalidad esencial del servicio: no requiere consentimiento, solo aparecer en la política de privacidad.

---

## 8. Rendimiento y calidad

> ✅ **Revisión de las ideas de rendimiento**
>
> - **Precargar la siguiente decisión:** la intención es buena, pero tal como está planteada no aplica. El banco de decisiones viaja como datos dentro del bundle de la isla: cuando el jugador está leyendo una decisión, la siguiente **ya está en memoria** y no hay ninguna carga entre pantallas. Lo que sí conviene precargar son las fuentes y cualquier imagen del año siguiente, y reservar el hueco de la tarjeta para que no haya salto de layout (CLS).
> - **Compresión y lazy loading de imágenes:** correcto y necesario. Formato AVIF/WebP, tamaños responsive y `loading="lazy"` en todo lo que no sea visible al abrir. Astro ya trae herramientas para esto.
> - **Core Web Vitals desde el primer despliegue:** correcto. El matiz importante es medir **datos de campo** (usuarios reales en 4G), no solo Lighthouse en local, porque el caso de uso es un enlace abierto desde WhatsApp en la calle.

> ✅ **Revisión de la idea de simulación masiva**
>
> Tiene todo el sentido y ya está contemplado en la arquitectura como `scripts/simular.ts`. Es la única forma de equilibrar el juego con datos: correr miles de partidas automáticas detecta combinaciones rotas, flags que nunca se disparan, rutas imposibles y atributos desbocados. Es posible precisamente porque el motor es determinista y no depende de la interfaz. Sin esto, el ajuste de dificultad sería a ciegas.

---

## 9. Orden sugerido

| Fase | Qué entra |
| --- | --- |
| v1 (lanzamiento) | Mobile-first, indicador de momento, continuar partida, tarjeta final con PNG 9:16 y 1:1, Web Share API, OG dinámico, watermark, código de partida, footer con enlaces, página de contacto, analítica sin cookies, política de privacidad, enlace desde acordesgaditanos |
| v1.1 | Modo oscuro, buzón de sugerencias, favoritos, Buy Me a Coffee en la tarjeta, formatos de compartir por momento, páginas de contexto y FAQ para AdSense |
| Más adelante | Reto diario con racha, cuentas opcionales, modo rápido (1 decisión/año) y modo lento (4 por año), tercera y cuarta modalidad (corista y cuartetero), año de debut elegible con situaciones de época, cronología exportable tipo libro, A/B testing, panel interno |
