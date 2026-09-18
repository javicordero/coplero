// PRNG determinista con semilla y derivación por contexto.
// Sin Math.random ni Date.now: todo el azar del motor sale de aquí.

export type GameSeed = number

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cyrb128(str: string): number {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0
}

/** Compatibilidad con el scaffold inicial. */
export function createRng(seed: GameSeed): () => number {
  return mulberry32(seed)
}

/**
 * Flujo de azar derivado del contexto (semilla + partes estables).
 * Las claves de contexto son tokens estables: renombrarlos es un cambio incompatible.
 */
export function rngPara(
  seed: string | number,
  ...partes: (string | number)[]
): () => number {
  return mulberry32(cyrb128(`${seed}|${partes.join("|")}`))
}

export function elegirIndice(rng: () => number, n: number): number {
  if (n <= 0) return 0
  return Math.min(n - 1, Math.floor(rng() * n))
}

export function elegirPonderado<T>(
  rng: () => number,
  items: readonly { valor: T; peso: number }[],
): T {
  if (items.length === 0) {
    throw new Error("elegirPonderado: lista vacía")
  }
  const total = items.reduce((s, it) => s + Math.max(0, it.peso), 0)
  if (total <= 0) return items[0].valor
  let r = rng() * total
  for (const it of items) {
    r -= Math.max(0, it.peso)
    if (r < 0) return it.valor
  }
  return items[items.length - 1].valor
}
