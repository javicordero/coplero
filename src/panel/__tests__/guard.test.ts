import { describe, expect, it } from "vitest"
import { bloqueoFueraDeDesarrollo, respuesta404 } from "../guard"

describe("guard del panel", () => {
  it("bloquea con 404 fuera de desarrollo", async () => {
    const respuesta = bloqueoFueraDeDesarrollo(false)
    expect(respuesta).toBeInstanceOf(Response)
    expect(respuesta?.status).toBe(404)
    expect(await respuesta?.text()).toBe("Not found")
  })

  it("no bloquea en desarrollo", () => {
    expect(bloqueoFueraDeDesarrollo(true)).toBeNull()
  })

  it("la respuesta 404 es texto plano", () => {
    expect(respuesta404().headers.get("content-type")).toContain("text/plain")
  })
})
