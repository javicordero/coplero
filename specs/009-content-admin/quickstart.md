# Quickstart — Panel local de situaciones y volcado al juego

Guía para validar de punta a punta el ciclo **panel → volcar → juego**. Detalles en
[contracts/](./contracts/) y [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Trabajar en local. El panel es **solo de desarrollo**: en producción responde 404.

## 1 · Cargar el banco actual en el almacén

```bash
npm run panel:importar
```

**Esperado**: aparece `content-admin/data/situaciones.json` con las **27** situaciones actuales
(`git status` lo muestra como nuevo) y una copia en `content-admin/data/backups/`.

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('content-admin/data/situaciones.json')).situaciones.length)"
# → 27
```

## 2 · Abrir el panel

```bash
npm run dev
```

Abre `http://localhost:4321/panel`.

**Esperado** (SC-001):
- Tablas **separadas por momento**, cada una con su **recuento** en el encabezado.
- Cada fila muestra la **situación + opción 1 y 2**; al abrirla, **todos** los campos.
- La suma de recuentos es igual al total de situaciones.

## 3 · Crear, editar y eliminar (SC-002, SC-003)

1. **Crear** una situación rellenando todos los campos y guardar → aparece en su tabla y persiste
   (refresca la página).
2. **Editar** un campo y guardar → el cambio persiste.
3. **Eliminar** con confirmación → desaparece y el recuento baja en uno.
4. **Guardar inválido** (deja un campo vacío, pon una sola opción o un `id` de opción repetido) →
   se rechaza con un mensaje legible y el almacén **no** cambia.

Reinicia `npm run dev` tras editar y comprueba que los datos siguen: la verdad está en disco.

## 4 · Volcar al juego (SC-004, SC-005, SC-006)

```bash
npm run panel:volcar
```

**Esperado**: reescribe `src/content/decisiones/{verano,febrero}/{contenido,personaje}.ts` con
cabecera `// GENERADO … no editar a mano.` y muestra cuántas situaciones hay por fichero.

- `git diff` refleja **solo** tus cambios reales del panel.
- Ejecutarlo dos veces seguidas **no** cambia nada (idempotencia):

```bash
npm run panel:volcar; git diff --stat
npm run panel:volcar; git diff --stat   # mismo resultado
```

- Solo validación, sin escribir:

```bash
npm run panel:volcar -- --check
```

## 5 · Comprobar que el juego lo incorpora

```bash
npm run check          # astro check + biome + vitest (Zod valida el banco en build)
npm run contenido:informe
```

**Esperado**: 0 errores; el informe cuadra con lo que ves en el panel. Si el paso 4 detectara un
banco inválido, el volcado habría fallado **sin** dejar contenido roto (SC-004).

## 6 · Verificar que el panel no se expone (SC-007)

```bash
npm run build
```

**Esperado**: el build termina, pero `/panel` y `/api/panel/*` no están enlazados desde ninguna
página pública y **fuera de desarrollo devuelven 404** (lo cubre `src/panel/__tests__/guard.test.ts`).
Tras el deploy, `https://<sitio>/panel` → 404.

## 7 · Volver a importar (opcional)

Tras una edición manual excepcional de los `.ts`, o para re-sincronizar:

```bash
npm run panel:importar   # hace copia de seguridad y sobrescribe el almacén
```

## Criterios cubiertos

| Paso | Criterios |
|---|---|
| 1 | SC-001, SC-009 |
| 2 | SC-001 |
| 3 | SC-002, SC-003 |
| 4 | SC-004, SC-005, SC-006 |
| 5 | SC-005, SC-008 |
| 6 | SC-007 |

## Resultados de la validación (2026-09-21)

Validado en local con el banco real de **27 situaciones**:

| Paso | Resultado |
|---|---|
| 1 · Importar | `Importadas 27 situaciones`; `content-admin/data/situaciones.json` creado (`version: 1`, 27) |
| 2 · Panel | 2 tablas por momento (verano/febrero) con recuentos que **suman 27** y situación + opción 1 y 2 en cada fila |
| 3 · CRUD | Alta válida → 28 y la fila aparece; formulario vacío → **8 errores legibles** y 422 **sin escribir**; borrado con confirmación → 27 |
| 4 · Volcar | genera `7/11/3/6` por fichero; **dos ejecuciones seguidas → mismo `git diff`** (idempotente) |
| 5 · Juego | `npm run check` verde (**46 ficheros, 232 tests**); `contenido:informe` → **27 situaciones, 87 opciones, 6 excepciones, 0 flags sin declarar, 0 inalcanzables** |
| 6 · Producción | `npm run build` **no** genera `dist/panel/index.html`; fuera de desarrollo las rutas del panel responden **404** (guard) |

Notas: el único error de consola en local es el `favicon.ico` ausente (ajeno al panel).
