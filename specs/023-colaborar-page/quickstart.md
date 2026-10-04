# Quickstart — Validación de la página de colaboración

Guía para validar la feature de punta a punta. No incluye implementación; los detalles están en
[contracts/ui.md](./contracts/ui.md) y [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Navegador para la validación manual (DevTools en vista móvil).

## 1. Validación manual de `/colaborar`

```bash
npm run dev
```

Abrir `http://localhost:4321/colaborar` en vista móvil (320 px y 390 px) y comprobar:

1. **Estructura**: se ve el `h1` "Colaborar", el bloque de apoyo, el bloque de sugerencias y un CTA
   "Empezar a jugar" que lleva a `/jugar`.
2. **Donación**: el botón "Invítame a un café" abre `buymeacoffee.com/AcordesGaditanos` en una
   pestaña nueva; la URL incluye `?utm_source=coplero`.
3. **Formulario sin JavaScript**: con JavaScript desactivado, rellenar el mensaje, elegir tipo y
   enviar; debe llegar a la página de confirmación del servicio externo.
4. **Descubrimiento**: la portada muestra el **botón de donación** dentro del bloque del ejemplo
   (bajo su CTA final); el enlace "Colaborar" aparece en el pie de todas las páginas; y la pantalla
   final del juego ofrece donación y `/colaborar`.
5. Sin scroll horizontal a 320 px ni con zoom al 200 %.

## 2. Tests automáticos

```bash
# Unit: invariantes de 0 kB de JS en las páginas estáticas (incluye /colaborar)
npm run test -- estatico

# E2E: contrato de la página y envío del formulario sin JS (interceptando Formspree)
npm run test:e2e -- colaborar

# E2E: accesibilidad, responsive, zoom, foco y reduced-motion (incluye /colaborar)
npm run test:e2e -- visual

# E2E: marco (cabecera y pie) en todas las rutas (incluye /colaborar)
npm run test:e2e -- chrome

# E2E: portada, enlaces internos (incluye /colaborar) y pie
npm run test:e2e -- landing

# Puerta completa
npm run check
```

**Resultado esperado**:
- `estatico.test.ts` verde: `colaborar.astro` sin `client:` ni `<script>`.
- `colaborar.spec.ts` verde: `h1` "Colaborar", enlace de donación con URL/`target`/`rel`, contrato
  del formulario y `POST` interceptado con `mensaje`, `tipo`, `origen` y `_subject`.
- `visual.spec.ts` verde en `/colaborar`: axe sin violaciones, sin scroll a 320 px ni al 200 %,
  controles ≥44 px, foco visible y sin movimiento con reduced-motion.
- `chrome.spec.ts` y `landing.spec.ts` verdes: cabecera, pie y enlace "Colaborar" presentes, y
  `/colaborar` reconocido como ruta interna válida de la portada.
- `npm run check` pasa.

## 3. Registro y legal

- Confirmar que `politica-de-privacidad.astro` menciona el formulario y el proveedor externo.
- (Documentación) Anotar en `docs/registro/` el avance de v1.1 de `docs/05` §9 al cerrar la feature.

## 4. Producción

```bash
npm run build
```

- `dist/colaborar/index.html` no incluye `<script>`.
- El pie de todas las páginas incluye el enlace "Colaborar".
- `/`, `/como-jugar`, las páginas legales, `/jugar` y `/r/[codigo]` no cambian salvo el enlace del
  pie, los dos enlaces de la pantalla final y el botón de donación del bloque del ejemplo de la
  portada.
