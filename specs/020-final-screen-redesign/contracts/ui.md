# Contract — Palmarés de la pantalla final

Interfaz interna (UI) de la pantalla de fin y de la tarjeta-palmarés. Aplica a las tres superficies que la usan: isla `/jugar` (fin), ejemplo de portada y página de resultado `/r/[codigo]`.

## Estructura DOM esperada — `Tarjeta.svelte`

```html
<section class="tarjeta" data-testid="tarjeta">
  <header class="identidad">
    <span data-testid="tarjeta-modalidad">Comparsista</span>
    <h2 data-testid="tarjeta-nombre">El Bauti</h2>
    <span data-testid="tarjeta-estilo">Evolución con raíces</span>
  </header>

  <div class="mejor" data-testid="tarjeta-mejor-posicion" data-tono="oro">
    <span class="mejor__ornamento" aria-hidden="true">
      <span class="mejor__linea"></span>
      <span class="mejor__rombo"></span>
      <span class="mejor__linea"></span>
    </span>
    <span class="mejor__etiqueta">Mejor posición</span>
    <span class="mejor__puesto">1º</span>
  </div>

  <!-- Trayectoria (premios del COAC + hitos de progresión): solo si hay eventos -->
  <section class="seccion" data-testid="tarjeta-premios">
    <h3 class="seccion__titulo">Trayectoria</h3>
    <div class="linea" style="--columnas:4;--celda:calc(100% / 4)">
      <ol class="fila">
        <li class="hito">
          <span class="hito__hito" data-tono="preliminares">Debut</span>
          <span class="hito__nodo" data-tono="preliminares"></span>
          <span class="hito__anio">2032</span>
        </li>
        <li class="hito" data-puesto="2">
          <span class="hito__puesto" data-tono="plata">2º</span>
          <span class="hito__nodo" data-tono="plata"></span>
          <span class="hito__anio">2033</span>
        </li>
        <li class="hito primero" data-puesto="1">
          <span class="hito__puesto" data-tono="oro">1º</span>
          <span class="hito__nodo" data-tono="oro"></span>
          <span class="hito__anio">2034</span>
        </li>
      </ol>
    </div>
  </section>

  <!-- Distinciones: solo si hay -->
  <section class="seccion" data-testid="tarjeta-distinciones">
    <h3 class="seccion__titulo">Distinciones</h3>
    <ul class="distinciones">
      <li class="distincion" data-tipo="aguja_de_oro" title="Aguja de oro: 1">
        <span class="distincion__rosetas" aria-hidden="true">
          <img class="roseta" src="/rosetas/roseta_aguja_oro.svg" alt="">
        </span>
        <span class="oculto">Aguja de oro: 1</span>
      </li>
      <li class="distincion" data-tipo="copla_para_andalucia" title="Copla para Andalucía: 2">
        <span class="distincion__rosetas" aria-hidden="true">
          <img class="roseta" src="/rosetas/roseta_andalucia.svg" alt="">
          <img class="roseta" src="/rosetas/roseta_andalucia.svg" alt="">
        </span>
        <span class="oculto">Copla para Andalucía: 2</span>
      </li>
      <li class="distincion" data-tipo="candela_y_espino" title="Candela y espino: 1">
        <span class="distincion__rosetas" aria-hidden="true">
          <img class="roseta" src="/rosetas/roseta_candela.svg" alt="">
        </span>
        <span class="oculto">Candela y espino: 1</span>
      </li>
    </ul>
  </section>
</section>
```

Notas de contrato:

- La **línea temporal** es horizontal y se reparte en **filas** (columnas automáticas según el ancho; la primera fila reparte el ancho completo si está llena y las siguientes cuadran con esas columnas). Cada fila lleva su propio **carril** (SVG `.carril`) de borde a borde, **sin conexión entre filas**. Una `<li class="hito">` por año, con el **premio** del COAC (`data-puesto`, medallas) o el **hito de progresión** (`Debut`/`CF`/`SF`/`F`); el premio prevalece. Sin scroll horizontal.
- Las **distinciones** van en una `<ul class="distinciones">`: por cada tipo, **una roseta por victoria** (`<img class="roseta">` del SVG propio: `roseta_andalucia`, `roseta_aguja_oro`, `roseta_candela`), agrupadas y pegadas dentro del tipo. El nombre real va oculto (solo para lectores de pantalla) y como `title`. Todas al mismo peso.
- La **mejor posición** es una **placa de honor** centrada: ornamento, etiqueta y puesto protagonista. El `data-tono` codifica el color: **oro/plata/bronce** para 1º/2º/3º, y por **fase** para el resto (**verde claro** en el debut, **azul claro** en cuartos, **azul** en semifinales y **morado** en la final). Sin puesto, el protagonista es la fase.
- **No** existen en el DOM: trayectoria en fichas, años en activo, años sin concursar, relato de hitos, compás decorativo de la tarjeta ni marca de agua.

## Estructura DOM esperada — `FinCarrera.svelte`

```html
<section class="fin" data-testid="fin" data-codigo="<codigo>">
  <p class="antetitulo">Carrera finalizada</p>
  <!-- Tarjeta.svelte -->

  <div class="pie">
    <div class="acciones" role="group" aria-label="Compartir la tarjeta">
      <button type="button" data-testid="compartir">Compartir</button>
      <button type="button" data-testid="descargar-9x16">Imagen 9:16</button>
    </div>
    <button type="button" data-testid="reiniciar">Empezar de nuevo</button>
  </div>

  <p class="aviso" aria-live="polite" data-testid="aviso-accion">…</p>
</section>
```

- El **antetítulo** va fuera de la tarjeta; el **nombre** dentro es el título principal.
- La **frase de cierre** (`data-testid="frase-cierre"`) va antes de los botones.
- **No** existen `copiar-texto`, `descargar-1x1` ni `copiar-enlace`.
- `data-codigo` es un gancho no visual para pruebas.

## Contrato de estilos

| Elemento/clase | Propiedad | Contrato |
|---|---|---|
| `.palmares` | contenedor | Tarjeta de cristal; **sin** panel de formulario |
| `.nombre` | tipografía | `--fuente-display`, `--c-texto-fuerte` |
| `[data-testid="tarjeta-modalidad"]` | color/tipografía | Encima del nombre: `--c-acento-fuerte`, `--peso-fuerte`, mayúsculas |
| `[data-testid="tarjeta-estilo"]` | color/tipografía | Debajo del nombre: `--c-acento-fuerte`, peso normal |
| `.mejor` | disposición | Placa centrada: ornamento + etiqueta + puesto |
| `.mejor[data-tono]` | color | `--tono`: `--c-carnaval-oro` (1º), `--c-carnaval-plata` (2º), `--c-carnaval-bronce` (3º); por fase: `--c-carnaval-verde-claro` (Debut), `--c-carnaval-azul-claro` (CF), `--c-carnaval-azul` (SF), `--c-carnaval-violeta` (F) |
| `.mejor__puesto` | tipografía | `--fuente-display`, 40–48 px (`clamp(2.5rem, 12vw, 3rem)`) |
| `.mejor__ornamento` / `.mejor::after` | ornamento | Arriba: línea — rombo — línea; abajo: línea simple. `--c-separador`, 12 rem máx. |
| `.linea` | disposición | Filas (`.fila`) en grid; columnas automáticas; la primera fila llena el ancho si está completa |
| `.carril` | carril | SVG: tramos horizontales por fila, de borde a borde; sin conexión entre filas |
| `.hito` | celda | Etiqueta / nodo / año en columna |
| `.hito__puesto[data-tono]` | color | Medalla: `--c-carnaval-oro` / `--c-carnaval-plata` / `--c-carnaval-bronce` |
| `.hito__hito[data-tono]` | color | Fase: `--c-carnaval-verde-claro` (Debut), `--c-carnaval-azul-claro` (CF), `--c-carnaval-azul` (SF), `--c-carnaval-violeta` (F) |
| `.hito__nodo[data-tono]` | color | El nodo toma el mismo tono que su etiqueta |
| `.seccion__titulo` | tipografía | `font-weight: 500` |
| `.distinciones` | disposición | Grupos en fila (envuelve); mismo peso |
| `.distincion` | grupo | Un grupo por tipo, con sus rosetas pegadas |
| `.roseta` | imagen | SVG propio de cada premio; ~3.2 rem de ancho |
| `.oculto` | a11y | Nombre del premio y recuento, visible solo para lectores |
| `.antetitulo` | tipografía | Fuera de la tarjeta; mayúsculas, `--c-texto-suave` |
| `main[data-pantalla="fin"]` | fondo | Neutro; sin `data-momento` ni fondo estacional |

Tokens nuevos: `--c-carnaval-plata`, `--c-carnaval-bronce`, `--c-carnaval-azul-claro` y `--c-carnaval-verde-claro` (espejo en `src/ui/tokens.ts`). Sin dependencias nuevas. Fuentes actuales.

## Contrato de accesibilidad

| Regla | Contrato |
|---|---|
| Línea temporal | `<ol>`/`<li>` semánticos; el puesto o el hito se lee en texto |
| Hitos de progresión | Texto real (`Debut`, `CF`, `SF`, `F`); el nodo y el carril son decorativos |
| Frase de cierre | Texto real, legible por lector de pantalla |
| Acciones | Nombre accesible; área táctil ≥ 44 px; foco visible |
| Contraste | AA con los tokens existentes sobre el fondo neutro |
| 320 px | Sin desborde horizontal (`scrollWidth == clientWidth`) |

## Ganchos de observabilidad (no romper)

- `main[data-pantalla]`, `data-momento` (vacío en `fin`), `data-ano`.
- `[data-testid="fin"]`, `[data-testid="tarjeta"]`, `[data-testid="tarjeta-nombre"]`.
- `[data-testid="tarjeta-modalidad"]`, `[data-testid="tarjeta-estilo"]`, `[data-testid="tarjeta-mejor-posicion"]`.
- `[data-testid="tarjeta-premios"]` con `.linea__hito` (y `--primero` / `data-puesto="1"`).
- `[data-testid="tarjeta-distinciones"]` con `.distincion` (grupo) y `.roseta` (una por victoria).
- `[data-testid="frase-cierre"]`.
- Botones `compartir`, `descargar-9x16`, `reiniciar`; `[data-codigo]` en `fin`.

## Invariantes verificables

| Invariante | Tolerancia | Cómo se comprueba |
|---|---|---|
| Zonas del palmarés presentes | exacto | E2E por `data-testid` |
| Mejor posición: `data-tono` según puesto/fase; puesto protagonista | exacto | E2E (`data-tono`, texto) |
| Línea temporal: una fila por año con premio, cronológica, sin años sin premio | exacto | E2E (texto y orden) |
| 1º premio en dorado; 2º/3º atenuados; 0 dorados fuera del 1º | exacto | E2E `getComputedStyle` |
| Distinciones como rosetas (una por victoria), agrupadas por tipo; mismo peso | exacto | E2E |
| Frase de cierre antes de los botones; sin «has ganado» | exacto | E2E (texto) |
| Bloques retirados ausentes | 0 nodos | E2E |
| Sin scroll a 320 px | 0 px | E2E `scrollWidth - clientWidth` |
| Accesibilidad en fin y `/r` | 0 violaciones graves | axe WCAG 2.2 AA |
| Sin fondo estacional en `fin` | exacto | E2E |

## Reglas de dependencia

- El cambio vive en `web` (`src/juego`); del `engine` solo consume `TarjetaFinal.hitosProgreso` (derivado, puro); no afecta a `content`.
- La imagen OG (`api/og/[codigo].png.ts`) queda fuera de este contrato (pieza hermana).
