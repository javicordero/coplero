// Acciones de compartir. Sin lógica de juego: solo envuelven APIs del navegador.

import type { TarjetaFinal } from "../engine/index"

export function urlResultado(codigo: string, origen: string): string {
  return new URL(`/r/${codigo}`, origen).href
}

export function textoCompartir(tarjeta: TarjetaFinal, url: string): string {
  const gancho = tarjeta.hitos[0]?.texto ?? tarjeta.fraseCierre
  return `${tarjeta.nombre} · ${gancho} ${url}`
}

export async function compartirNativo(datos: {
  title: string
  text: string
  url: string
}): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false
  try {
    await navigator.share(datos)
    return true
  } catch {
    return false
  }
}

export async function copiarTexto(texto: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

export async function descargarImagen(
  imagenUrl: string,
  nombreArchivo: string,
): Promise<boolean> {
  if (typeof document === "undefined") return false
  try {
    const respuesta = await fetch(imagenUrl)
    if (!respuesta.ok) return false
    const blob = await respuesta.blob()
    const enlace = document.createElement("a")
    enlace.href = URL.createObjectURL(blob)
    enlace.download = nombreArchivo
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(enlace.href)
    return true
  } catch {
    return false
  }
}
