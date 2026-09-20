# Contrato — Contenido (feature 008)

Reglas que el banco de contenido (`src/content/`) debe cumplir. Validación con Zod en build time; el `engine` no importa `content`.

## Marca de excepción

```ts
Opcion.excepcion?: boolean
```

- `efectos` **solo** se permite si `excepcion === true`.
- `excepcion === true` **exige** `efectos` no vacío.
- `excepcion` sin `efectos` ⇒ error de esquema.
- El motor ignora `excepcion`; aplica `efectos` cuando existen.

## Reglas de esquema (nuevas en `OpcionSchema` / `BancoContenidoSchema`)

1. `efectos` ⇔ `excepcion === true` (bicondicional).
2. `efectos` restringido a `ATRIBUTOS` con enteros (se mantiene).
3. Las excepciones son **datos**, no lógica; describirlas no requiere tocar el motor.

## Auditoría de recuento (contenido)

- El informe de contenido (`src/content/informe.ts` y/o `scripts/informe-contenido.ts`) reporta:
  - número total de opciones,
  - número de opciones con `excepcion: true`,
  - su porcentaje y su reparto por categoría/momento.
- Umbral de vigilancia: el número de excepciones se mantiene bajo (orden de 3–6 en todo el banco). Superar el umbral hace fallar el test de integridad.

## Contrato de redacción del intercambio

- La opción de una excepción debe explicar el intercambio en su `titulo`/`subtitulo` (p. ej., "guardar lo mejor para la final").
- Una excepción cuyo intercambio no sea comprensible en el texto se considera mal redactada (revisión manual + ejemplo en los tests de integridad si aplica).
