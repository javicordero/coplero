# Contrato · Importación del banco actual (`npm run panel:importar`)

Vuelca el contenido actual del juego (`src/content/decisiones/**`) al almacén JSON. Sirve para la
**primera carga** y para **re-sincronizar** (FR-022).

## Comando

```bash
npm run panel:importar
```

## Módulo `src/panel/importador.ts`

| Función | Firma | Comportamiento |
|---|---|---|
| `leerBancoActual()` | `Situacion[]` | Importa los 4 módulos de `src/content/decisiones/**` y concatena sus situaciones. Valida con `SituacionSchema` (si el contenido actual no valida, lanza error legible). |
| `importarBancoActual()` | `{ importadas: number }` | `copiaDeSeguridad()` → `leerBancoActual()` → `escribirAlmacen({ version: 1, situaciones })`. |

## Garantías

- El contenido importado es **exactamente** el actual (FR-017): sin transformaciones.
- **Copia de seguridad** del almacén previo antes de sobrescribir.
- Si la lectura o la validación fallan, el almacén **no** se modifica.
- Determinista: ordena las situaciones por `id` antes de escribir para que dos importaciones del
  mismo banco den el mismo JSON.

## Cuándo se usa

- **Primera vez**: el panel arranca vacío y ofrece importar (`POST /api/panel/importar`).
- **Re-sincronizar**: tras tocar a mano (excepcionalmente) los `.ts` o al migrar.

> Flujo normal: **panel (editar) → volcar (`panel:volcar`)**. La importación es la vía inversa y no
> forma parte del ciclo diario.
