import { describe, expect, it } from "vitest"
import { createRng } from "../seed"

describe("createRng", () => {
  it("returns a function", () => {
    const rng = createRng(42)
    expect(typeof rng).toBe("function")
  })

  it("produces deterministic sequence from same seed", () => {
    const rng1 = createRng(12345)
    const rng2 = createRng(12345)
    const values1 = Array.from({ length: 10 }, () => rng1())
    const values2 = Array.from({ length: 10 }, () => rng2())
    expect(values1).toEqual(values2)
  })

  it("produces different sequences from different seeds", () => {
    const rng1 = createRng(1)
    const rng2 = createRng(2)
    const v1 = Array.from({ length: 5 }, () => rng1())
    const v2 = Array.from({ length: 5 }, () => rng2())
    expect(v1).not.toEqual(v2)
  })

  it("produces values in [0, 1)", () => {
    const rng = createRng(99)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
