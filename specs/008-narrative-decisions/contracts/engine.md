# Contrato — Motor (feature 008)

## Sin cambios de API

Esta feature **no** modifica la API pública del motor (`crearPartida`, `siguientePaso`, `elegir`, `resumen`), ni sus tipos, ni `VERSION_PARTIDA` (sigue en **2**).

- `resolverCoac` (`src/engine/coac.ts`) **se conserva**: `puntuación = w·atributos + ruido + carisma (+ bonoAñoPico)`, y `nivel = clamp(nivelPorPuntuacion(puntuación), suelo, techo)`.
- `aplicarEfectos` (`src/engine/atributos.ts`) **se conserva**: aplica los `efectos` presentes y acota a `[0, 100]`.

## Invariantes garantizados

1. **Determinismo**: misma `seed` + mismas decisiones + mismo `banco` ⇒ misma partida (Principio I).
2. **Sin azar implícito**: no se introduce `Math.random()` ni `Date.now()`.
3. **Atributos estándar**: sin excepciones, los atributos permanecen en `atributosIniciales` y no varían por decidir; la puntuación base es constante y el desenlace lo fijan `destino` + azar.
4. **Techo respetado**: ninguna decisión lleva el resultado por encima de `destino.techo` (salvo el milagro ya existente).
5. **Independencia**: el motor no conoce `excepcion` (es una marca de contenido); solo consume `efectos`.

## Qué NO cambia

- Tipos de `Partida`, `Paso`, `TarjetaFinal`, `Destino`.
- Fórmula de premios, batacazo, milagro, trayectoria y tarjeta final.
- Rendimiento del reducer (no se añade trabajo por paso).
