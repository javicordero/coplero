# Phase 0 — Research: Rediseño de la pantalla final como palmarés

## R1. Línea temporal de premios: vertical y solo años con premio

**Decision**: representar los premios del COAC como una **línea temporal vertical** con una fila por año con premio (`año · nodo · puesto`), en orden cronológico, sin interacción. No se muestran los años sin premio.

**Rationale**: en móvil (320 px) una línea horizontal con 5+ nodos desborda o comprime las etiquetas; la vertical da una fila por año y escala hacia abajo. Mostrar los 20 años de carrera (la mayoría sin premio) convertiría el palmarés en una lista larga y vacía; solo los años con premio son hitos reales. Sin interacción porque no hay información adicional que mostrar y la pantalla también se exporta a imagen.

**Alternatives considered**:
- *Horizontal*: descartado por desbordamiento en móvil y por obligar a dos layouts.
- *Todos los años (20)*: descartado por longitud y huecos vacíos.
- *Tocar un año para ver detalle*: descartado (sin datos extra; complica la exportación).

## R2. Destacar el primer premio sin parecer «el resultado actual»

**Decision**: el año con primer premio usa **nodo y texto en dorado**; 2º y 3º quedan atenuados. El dorado se reserva a ese caso (no a las distinciones).

**Rationale**: el contexto «lista de años» ya deja claro que es histórico; un único acento dorado da jerarquía de palmarés sin etiquetas tipo «campeón» ni lenguaje de resultado. Refuerza la identidad (dorado puntual) y evita parecer una infografía.

**Alternatives considered**:
- *Medallas emoji por puesto*: se sustituyen por nodos + texto para no parecer un logro de videojuego.
- *Rótulo «ganador»*: descartado (la carrera no es solo ganar).

## R3. Distinciones como colección de rosetas

**Decision**: **una roseta por victoria**, agrupadas por tipo y pegadas dentro del grupo, con el icono del premio en el centro. Cada premio tiene su SVG propio (Andalucía verde/blanco, Aguja dorada, Candela roja). Todas al **mismo peso** (sin jerarquía).

**Rationale**: lee como una colección (estilo Copero) sin el aspecto de pantalla genérica de logros; el recuento se ve por repetición, no por un número. Los grupos escalan a más tipos sin romperse. Se prefieren iconos SVG propios (aguja, bandera, candela) a emojis.

**Alternatives considered**:
- *Tarjetas grandes*: descartado por peso visual y aspecto de dashboard.
- *Insignia con `×N`*: descartada; se prefiere la repetición de rosetas.
- *Jerarquía (Aguja destacada)*: descartada por decisión del usuario (todas al mismo peso).

## R4. Frase de cierre

**Decision**: una línea corta en cursiva antes de los botones, con separadores ornamentales. Por defecto **«La copla termina. La historia queda.»** (tono elegante). Alternativas por tono:

| Tono | Opciones |
|---|---|
| Carnavalesco | «La copla se apaga; el tipo se queda.» · «Se acabó el concurso, no la fiesta.» |
| Elegante | «La copla termina. La historia queda.» · «Un nombre, una carrera, una copla.» |
| Emotivo | «Lo que cantaste ya es de todos.» · «La carrera acaba; la memoria no.» |
| Gaditano | «Lo que se canta en Cái no se olvida.» · «De Cái pal mundo, y de vuelta.» |
| Épico | «Veinte febreros. Una sola historia.» · «Aquí queda tu carrera, entera.» |
| Minimalista | «La historia queda.» · «Fin de la carrera.» |

**Rationale**: cierra narrativamente sin prometer victoria; funciona con cualquier posición. La frase es texto de presentación (fácil de cambiar).

**Alternatives considered**:
- *Frase derivada del resultado*: descartado (volvería a centrar la pantalla en la posición).

## R5. Estética: se retira el panel de formulario

**Decision**: abandonar el lenguaje de panel de formulario (superficie + borde + sombra) y pasar a una composición **vertical y aireada** sobre negro, con separadores ornamentales sutiles. Se conservan fuentes y tokens.

**Rationale**: la dirección pedida es elegante/palmarés, no formulario ni dashboard. El panel de formulario fue una decisión anterior que este rediseño deroga.

**Alternatives considered**:
- *Mantener el panel*: descartado por contradecir la nueva dirección.

## R6. Imagen OG como pieza hermana

**Decision**: la imagen 9:16 la sigue generando el endpoint OG (satori); la pantalla no se captura. Se alinean el lenguaje visual.

**Rationale**: evita capturar el DOM, respeta el stack y mantiene `/r` y el PNG sin dependencias nuevas.

**Alternatives considered**:
- *Capturar el DOM*: descartado por complejidad (fuentes, alturas, scroll).

## R7. Escalado con muchos años y muchas distinciones

**Decision**: la línea temporal crece hacia abajo con una fila compacta por año (sin tope ni agrupación en esta iteración); la retícula de distinciones envuelve. Ambas escalan sin cambiar de patrón.

**Rationale**: las carreras rara vez pisan la final muchas veces, y las distinciones hoy son 3 tipos. Un tope/agrupación añadiría complejidad sin necesidad real (YAGNI).

**Alternatives considered**:
- *Tope con «+N»*: pospuesto hasta que los datos lo pidan.

## R8. Estrategia de verificación

**Decision**:
- **E2E** (`pantalla-final.spec.ts`): zonas del palmarés; línea temporal (un año por premio, cronológico, 1º dorado, sin años sin premio); rosetas de distinción (una por victoria); ausencia de bloques retirados; 320 px; axe.
- **E2E** (`pantalla-final-fondo.spec.ts`): `fin` con `data-momento=""`, sin fondos estacionales, antetítulo fuera de la tarjeta.
- **E2E** (`compartir.spec.ts`): acciones, enlace por `data-codigo`, axe en fin y `/r`.
- **Unit**: formatos de presentación (puesto/medalla, agrupaciones) y frase.
- `npm run check` como puerta.

**Rationale**: cubre contenido, estética observable (dorado del 1º), accesibilidad y no regresión, con la infraestructura existente. El dev `/jugar?dev=fin` permite iterar sin jugar la carrera.

**Alternatives considered**:
- *Solo snapshot visual*: frágil; descartado.
