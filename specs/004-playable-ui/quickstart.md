# Quickstart: validar la versión mínima jugable

Guía de validación end-to-end. No contiene implementación.

## Prerequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Feature `004-playable-ui`.

## 1. Tests automáticos

```bash
npm run check
```

Esperado: `astro check` sin errores, Biome sin hallazgos y Vitest en verde, incluidos los tests de `src/juego/__tests__/` (estado, persistencia y presentación).

## 2. Arrancar y jugar

```bash
npm run dev
```

Abrir `http://localhost:4321/jugar` y comprobar el flujo completo:

1. **Intro** → Empezar.
2. **Crear personaje** → el título cambia según el género (Coplero/Coplera/Coplere); no deja continuar con el nombre vacío; recorta y limita a 24 caracteres.
3. **Modalidad** → dos opciones con título y subtítulo.
4. **Variante** → tres opciones de la modalidad, con título y subtítulo.
5. **Decisiones** → cada año muestra el indicador (año, momento) y opciones con título y subtítulo.
6. **Resultado** → tras febrero, fase, puesto y premios del año.
7. Repetir decisiones hasta el **Fin de carrera** → resumen (nombre, modalidad, variante, años, mejor fase, premios).

## 3. Persistencia

- A mitad de carrera, recargar la página: debe retomar el mismo punto.
- Usar "empezar de cero": debe reiniciar y descartar el guardado.
- (Opcional) Editar a mano el guardado en `localStorage` (`coplero:partida`) con una versión distinta: debe descartarse con un aviso y permitir empezar.

## 4. Determinismo

- Anotar la semilla (o el resumen) de una carrera y repetirla con las mismas decisiones: el resumen final debe coincidir.

## 5. Mobile-first y estático

- Redimensionar a ancho de móvil: layout legible, mismo diseño, ancho máximo contenido en escritorio (420-480 px).
- Comprobar que la landing (`/`) se sirve sin isla (sin JS interactivo) y que `/jugar` es la única isla.

## 6. Smoke E2E (si está disponible)

```bash
npm run test:e2e
```

Esperado: `tests/e2e/jugar.spec.ts` completa una carrera entera y llega a la pantalla de fin.

## Criterios de aceptación cubiertos

| Criterio | Comprobación |
|---|---|
| SC-001 | Pasos 2 y 6 |
| SC-002 | Paso 2 (indicador y opciones) |
| SC-003 | Paso 2 (resultado de temporada) |
| SC-004 | Paso 3 |
| SC-005 | Paso 5 |
| SC-006 | Paso 4 |
