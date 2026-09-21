# Contrato · Componente de pie (`src/components/Footer.astro`)

## Naturaleza

- Componente **Astro estático** (0 kB de JS), **sin props obligatorias**.
- Reutilizable por cualquier página estática del sitio (FR-013).
- Renderiza un `<footer role="contentinfo">`.

## Estructura (siguiendo el pie de acordesgaditanos)

| Bloque | Marcado | Contenido |
|---|---|---|
| 1. Redes sociales | `<nav aria-label="Redes sociales">` + `h3` "Redes sociales" | Iconos a X, YouTube, TikTok e Instagram (SVG en línea, `aria-label`) |
| 2. Autor | `<address>` | "Desarrollado por Javier Cordero Toscano" + iconos LinkedIn y GitHub |
| 3. Referencia | párrafo | Enlace a **acordesgaditanos** ("el mismo creador de…") |
| 4. Legal | `<div>` (futuro) | Enlaces a privacidad/cookies **solo cuando existan** (FR-014) |
| 5. Copyright | `<div>` | `© {año} Coplero`, con el año calculado en build |

## Enlaces

- Todos los enlaces son externos salvo los legales internos.
- Los externos: `target="_blank" rel="noopener noreferrer"` + `aria-label` (FR-011, FR-012).
- Conjunto de redes: las cuentas de acordesgaditanos hasta que Coplero tenga las propias
  (`docs/05` §3).

## Accesibilidad

- Los enlaces que solo muestran icono tienen **nombre accesible** (FR-012).
- Contraste y foco visibles; el pie no depende del color para transmitir información.
- El `<footer>` usa `role="contentinfo"` (o el elemento nativo, equivalente).

## Estilo

- Fondo oscuro coherente con el tema del proyecto; tipografía del sistema.
- Layout mobile-first: en pantallas estrechas los bloques se apilan; en anchas se alinean en fila.
- Sin dependencias: los iconos son SVG en línea (no `astro-icon`).
