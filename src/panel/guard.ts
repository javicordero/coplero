// Guard del panel local. Ver specs/009-content-admin/contracts/panel.md.
// Este módulo es SOLO de servidor: nunca se importa desde la isla (src/panel-ui).

/** ¿Estamos en desarrollo? En el build de producción `import.meta.env.DEV` es false. */
export function esDesarrollo(): boolean {
  return import.meta.env.DEV
}

/** Respuesta 404 uniforme para el panel fuera de desarrollo. */
export function respuesta404(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}

/**
 * Devuelve una respuesta 404 si no estamos en desarrollo; `null` si se puede continuar.
 * El parámetro `dev` permite testear de forma determinista.
 */
export function bloqueoFueraDeDesarrollo(
  dev: boolean = esDesarrollo(),
): Response | null {
  return dev ? null : respuesta404()
}
