# 03 · Banco de decisiones · Verano

> ☀️ Todas las situaciones de esta página llevan `momento: verano`. Ocurren en el verano y otoño previos al carnaval: se escribe, se ensaya, se ficha, se paga. Nada de jurado, grada del Falla ni prensa de concurso: eso vive en Febrero.

Cada año de carrera saca **una decisión de contenido y una de personaje**. Las tablas de abajo son el pool base de verano; las condicionales del final solo entran en la baraja si su flag está activa.

---

## 🎨 Tipo contenido

### 🖊️ Letra

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Toca elegir tema para el repertorio | **A lo social** · Criticar lo que pasa en la calle — Letra +1, Popularidad +1 | **A lo personal** · Hablar de tu barrio, tu gente, tu vida — Letra +1, Cohesión +1 | `tema_social` / `tema_personal` |
| Un pasodoble ha quedado muy duro con un político local | **Suavizarlo** · Menos ruido, menos problemas — Letra -1 | **Mantenerlo tal cual** · Que se note quién lo canta — Letra +2, Popularidad +2 | `pasodoble_suave` / `pasodoble_duro` |
| El popurrí necesita un cierre | **Cierre coral potente** · Buscando la ovación del Falla — Música +2, Puesta en escena +1 | **Cierre íntimo** · Apostando por la emoción — Letra +2, Música +1 | `cierre_coral` / `cierre_intimo` |
| Te separas de tu grupo tras varios años y toca escribir | **Pasodoble emotivo** · Buscando emocionar — Letra +2, Popularidad +1 | **Cuplé con carga de Cádiz** · Llamándoles de todo — Popularidad +2, Cohesión -1 | `ruptura_elegante` / `ruptura_a_saco` |

### 🎵 Música y puesta en escena

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| El tipo no acaba de convencer al grupo a un mes del concurso | **Cambiarlo entero** · Aún hay tiempo — Puesta en escena +2, Cohesión -1, Dinero -2 | **Sacarlo como está** · Ya está pagado — Cohesión +1 | `tipo_cambiado` / `tipo_conservado` |
| Un componente pide bajar el tono del pasodoble para poder cantarlo | **Bajarlo** · Que suene limpio — Música +1, Cohesión +1 | **Dejarlo arriba** · Ahí está el vello de punta — Música +2, Cohesión -1 | `tono_comodo` / `tono_exigente` |
| Te ofrecen un arreglo musical firmado por un músico de fuera del carnaval | **Aceptar el arreglo** · Sonar distinto a todos — Música +2, Cohesión -1 | **Hacerlo en casa** · Aquí sabemos lo que hacemos — Música +1, Cohesión +1 | `musico_externo` / `musica_casera` |

---

## 🧍 Tipo personaje

### 💰 Dinero y recursos

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Hay que decidir el presupuesto de vestuario | **Tirar la casa por la ventana** · El atrezzo también puntúa — Puesta en escena +2, Dinero -3 | **Ahorrar en vestuario** · Que hable la letra, no el disfraz — Puesta en escena -1, Dinero +2 | `vestuario_caro` / `vestuario_humilde` |
| Un patrocinador ofrece dinero a cambio de suavizar la crítica | **Aceptar el dinero** · El carnaval también hay que pagarlo — Dinero +3, Popularidad -1 | **Rechazar la oferta** · Aquí no se vende nadie — Dinero -1, Popularidad +2 | `acepto_patrocinio` / `rechazo_patrocinio` |
| El local de ensayo sube el alquiler | **Buscar otro local** · Donde se pueda pagar — Dinero +1, Cohesión -1 | **Rascarse el bolsillo entre todos** · Aquí nació la agrupación — Dinero -2, Cohesión +2 | `local_nuevo` / `local_de_siempre` |

### 👥 Grupo y vida personal

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Un componente histórico quiere dejar el grupo | **Dejarlo marchar** · Cada uno tiene su momento — Cohesión -1 | **Convencerlo de quedarse** · La agrupación es él también — Cohesión +2 | `historico_se_fue` / `historico_se_queda` |
| Te ofrecen fichar por otra agrupación más grande | **Cambiar de aires** · Buscar otro nivel — Popularidad +2, Cohesión -2 | **Ser fiel a los tuyos** · De aquí no me muevo — Cohesión +2 | `fiche_fuera` / `me_quede` |
| El carnaval te está comiendo la vida de casa | **Apretar hasta febrero** · Ya descansaré en marzo — Letra +1, Música +1, Cohesión -1 | **Bajar el ritmo de ensayos** · Hay vida fuera del Falla — Cohesión +1, Música -1 | `todo_al_carnaval` / `pie_en_casa` |
| Hay que cerrar la plantilla del año | **Apostar por la cantera** · Gente joven con hambre — Cohesión +2, Música -1, Dinero +1 | **Fichar veteranos de garantía** · Lo seguro se paga — Música +2, Dinero -2 | `plantilla_joven` / `plantilla_veterana` |
| Un componente se ha hecho más conocido que tú dentro del grupo | **Darle galones** · Si tira, que tire de todos — Popularidad +2, Cohesión +1, Letra -1 | **Marcar quién firma aquí** · El grupo tiene un autor — Letra +1, Cohesión -2 | `reparto_protagonismo` / `autoridad_marcada` |
| Alguien graba un ensayo y lo sube a redes antes de tiempo | **Aprovechar el ruido** · Publicidad gratis — Popularidad +2, Cohesión -1 | **Cerrar el ensayo a cal y canto** · Aquí no entra nadie — Cohesión +1, Popularidad -1 | `filtracion_aprovechada` / `ensayo_cerrado` |

### 🎖️ Carrera y grupo consagrado *(categoría: `carrera`)*

| Situación | Opción 1 | Opción 2 | Flags |
| --- | --- | --- | --- |
| Llevas muchos años con tu grupo de amigos y un grupo consagrado y puntero te ofrece ser su autor | **Fiel a la peña** · Con estos empecé y con estos sigo — Cohesión +2, Popularidad -1 | **Firmar por el grupo consagrado** · Jugar en la élite — Popularidad +2, Letra +1, Cohesión -2 | `rechace_grupo_consagrado` / `autor_grupo_consagrado` |

### ⚖️ Enfado con el concurso *(categoría: `concurso`)*

**Situación (3 opciones):** te enfadas con el COAC por unos resultados que consideras injustos y hay que decidir el año que viene.

| Opción | Efectos | Flag |
| --- | --- | --- |
| **Pa la calle** · No concursas: sacas una agrupación callejera para tomar aire | Popularidad +1, Cohesión +2, Dinero -1 | `ano_callejero` |
| **Gira por España** · No concursas, pero recorréis teatros de todo el país | Dinero +3, Popularidad +1, Cohesión -1 | `ano_de_gira` |
| **Me gusta concursar** · Vas al COAC con un pasodoble al trato del jurado | Letra +2, Popularidad +2, Cohesión -1 | `pasodoble_al_jurado` |

> ⚙️ Las dos primeras opciones implican **no participar ese año**: se modelan con `saltaCOAC: true`. El motor salta la resolución del COAC de esa temporada y la marca en la cronología como año fuera del concurso (igual que `year_sabatico`).

---

## 🔁 Condicionales de verano

| Situación condicional | Se abre si | Ventana / prob. | Opción 1 | Opción 2 |
| --- | --- | --- | --- | --- |
| Has ganado premios con el grupo consagrado; tus amigos te llaman para volver | `autor_grupo_consagrado` | 4 años · 50% | **Volver con los tuyos** · El cariño no se puntúa — Cohesión +3, Popularidad -1 · flag `regreso_a_la_pena` | **Seguir donde se gana** · Quiero ganar lo máximo posible — Popularidad +1, Letra +1, Cohesión -1 · flag `carrera_de_elite` |
| Se acerca el plazo de inscripción tras tu año fuera del concurso | `ano_callejero` o `ano_de_gira` | 2 años · 80% | **Volver al COAC** · Lo echaba de menos — Cohesión +1, Popularidad +1 · flag `regreso_al_coac` | **Seguir fuera** · Calle o teatro, pero sin jurado — Dinero +2, Popularidad -1 · flag `sigo_fuera` |
| El patrocinador que rechazaste aparece con tu rival | `rechazo_patrocinio` | 2 años · 50% | **Cuplé al asunto** · Que se ría Cádiz — Popularidad +2 | **No entrar al trapo** · Cada uno con lo suyo — Cohesión +1 |
| El público espera otra vez tu registro social | `tema_social` dos años seguidos | 1 año · 70% | **Repetir registro** · Es lo que soy — Letra +1, Popularidad +1 | **Romper con lo esperado** · Que no me encasillen — Letra +2, Popularidad -2 |
| Vuelves al concurso tras el año que no fuiste | `year_sabatico` o `ano_callejero` o `ano_de_gira` | Año siguiente · 100% | **Entrar con humildad** · Un año fuera enseña — Cohesión +2 | **Entrar a saco** · Vengo a cobrarme lo mío — Popularidad +2, Cohesión -1 |
| El músico de fuera quiere firmar la música | `musico_externo` | 2 años · 50% | **Compartir la firma** · Lo justo es lo justo — Cohesión +1, Popularidad +1 | **Negarte** · La música es de la agrupación — Cohesión -1, Música +1 |
| El local de siempre se pone en venta | `local_de_siempre` | 3 años · 40% | **Comprarlo entre todos** · Casa propia — Dinero -4, Cohesión +3 | **Mudarse por fin** · Toca soltar — Dinero +1, Cohesión -1 |
| El grupo debate cómo enfocar el repertorio (comparsista) | Siempre | — · 5% | **Mantener lo que funciona** · Fiel a la tradición → variante clásica | **Darle una vuelta / Cambiar sin perder la esencia** → nueva escuela / evolución con raíces |
| El grupo quiere reírse de otra manera (chirigotero) | Siempre | — · 5% | **Seguir con el humor de siempre** → variante clásica | **Apoyarse en el gesto / No salirse del personaje** → lolosedismo / interpretar el personaje |
| La modalidad se te queda pequeña (chirigotero → comparsista) | Siempre (desde el año 4) | — · 4% | **Seguir con la chirigota** · Cohesión +1 | **Dar el salto a la comparsa** · Popularidad +1, Cohesión -1 → cambio de modalidad y elección de variante |
| La modalidad se te queda pequeña (comparsista → chirigotero) | Siempre (desde el año 4) | — · 4% | **Seguir con la comparsa** · Cohesión +1 | **Dar el salto a la chirigota** · Popularidad +1, Cohesión -1 → cambio de modalidad y elección de variante |

---

## Pendiente de este bloque

> ✅ Importado en CONTENT-001 a `src/content/decisiones/verano/` y `src/content/condicionales/verano.ts` (18 situaciones + 7 condicionales), con `unicaVez: true` y `texto` vacío.
>
> ✅ TRAYECTORIA-001 (006) añade 4 condicionales de trayectoria (`cv_enfoque_*` y `cv_salto_*`): repetibles, de baja frecuencia y sin bloqueo del reciclado del pool. Los `cv_enfoque_*` cambian la variante por dentro; los `cv_salto_*` cambian de modalidad y abren la elección de la nueva variante. Ver `docs/01` §2 y `docs/02` §7.

- [ ] Ampliar el pool base de verano a 30-40 situaciones (mitad del objetivo total de 60-80).
- [ ] Marcar qué situaciones son exclusivas de comparsista o de chirigotero con el campo `modalidades`.
- [ ] Afinar los valores numéricos con el simulador masivo, no a mano.
