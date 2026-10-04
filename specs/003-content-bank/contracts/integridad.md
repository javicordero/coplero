# Contrato: integridad e informe de contenido

## Reglas de integridad (tests)

`src/content/__tests__/integridad.test.ts` verifica sobre el banco real:

| Regla | Comprobación |
|---|---|
| Ids únicos | `Set(ids).size === ids.length` |
| Campos obligatorios | Toda situación tiene `momento` válido |
| Opciones | `>= 2`, con `titulo` y `subtitulo` no vacíos |
| Flags consistentes | Toda flag referenciada existe en `opciones[].flags` |
| Modalidades/variantes | Valores permitidos |
| Cobertura | `> 0` situaciones comunes por momento |
| `saltaCOAC` | Toda opción que no concursa lo declara |
| Sin inventar | Recuento esperado de `docs/03`+`docs/04` |

`src/content/__tests__/compatibilidad.test.ts` verifica que `bancoContenido` es asignable a `BancoContenido`.

## Informe de integridad (CLI)

`scripts/informe-contenido.ts`, ejecutable con `npm run contenido:informe`.

**Salida (texto)** — al menos:

```text
Situaciones de verano: 18
Situaciones de febrero: 9
Condicionales: 11
Flags declaradas: <n>  -> <lista>
Flags referenciadas: <n> -> <lista>
  referenciadas sin declarar: <lista o "ninguna">
Situaciones potencialmente inalcanzables: <lista o "ninguna">
  (estático: filtros imposibles | simulación: nunca vistas en N carreras)
```

**Opciones**:

| Flag | Efecto |
|---|---|
| `--json <ruta>` | Vuelca el informe a JSON. |
| `--n <carreras>` | Carreras para la detección por simulación (por defecto 10000). |
| `--help` | Ayuda. |

**Códigos de salida**: `0` ok · `1` integridad rota (flag huérfana, id duplicado, etc.) · `2` argumentos inválidos.

**Fuente**: el análisis estático y los recuentos se calculan sobre `bancoContenido`; la detección por simulación reutiliza `simular` del módulo `src/simulacion` con el mismo banco.
