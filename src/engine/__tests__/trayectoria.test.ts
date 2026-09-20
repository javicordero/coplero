import { describe, expect, it } from "vitest"
import {
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  siguientePaso,
} from "../index"
import type {
  BancoContenido,
  CrearPartidaInput,
  Opcion,
  Situacion,
} from "../types"

function opcionesCambioModalidad(): Opcion[] {
  return [
    { id: "seguir", titulo: "Seguir", subtitulo: "Como siempre" },
    {
      id: "cambiar",
      titulo: "Cambiar",
      subtitulo: "Dar el salto",
      cambiaModalidad: "chirigotero",
    },
  ]
}

function situacionCambio(
  id: string,
  tipo: "contenido" | "personaje",
): Situacion {
  return {
    id,
    momento: "verano",
    tipo,
    categoria: "carrera",
    titulo: "Salto de modalidad",
    texto: "",
    modalidades: ["comparsista"],
    opciones: opcionesCambioModalidad(),
  }
}

const bancoCambio: BancoContenido = {
  situaciones: [
    situacionCambio("cambio_contenido", "contenido"),
    situacionCambio("cambio_personaje", "personaje"),
  ],
  variantes: [
    { id: "comparsa_a", modalidad: "comparsista" },
    { id: "chiri_a", modalidad: "chirigotero" },
    { id: "chiri_b", modalidad: "chirigotero" },
  ],
}

const input: CrearPartidaInput = {
  seed: "trayectoria",
  personaje: {
    nombre: "El Chato",
    edad: 30,
    localidad: "Cádiz",
    genero: "masculino",
  },
  modalidad: "comparsista",
  variante: "comparsa_a",
}

describe("cambio de modalidad", () => {
  it("cambia la modalidad y abre el paso de variante", () => {
    const p = crearPartida(input, bancoCambio)
    const res = elegir(p, "cambiar", bancoCambio)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.modalidad).toBe("chirigotero")
    expect(res.valor.fase).toBe("variante")
    expect(res.valor.momento).toBe("febrero")
    expect(res.valor.trayectoria.cambios).toEqual([])
    expect(siguientePaso(res.valor, bancoCambio)).toEqual({
      tipo: "variante",
      modalidad: "chirigotero",
    })
  })

  it("seguir no cambia la modalidad ni la trayectoria", () => {
    const p = crearPartida(input, bancoCambio)
    const res = elegir(p, "seguir", bancoCambio)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.modalidad).toBe("comparsista")
    expect(res.valor.fase).toBe("decision")
    expect(res.valor.trayectoria.cambios).toEqual([])
  })

  it("elegirVarianteDeCambio valida la pertenencia y registra el cambio", () => {
    const p = crearPartida(input, bancoCambio)
    const r1 = elegir(p, "cambiar", bancoCambio)
    if (!r1.ok) throw new Error("no cambió de modalidad")

    const invalida = elegirVarianteDeCambio(r1.valor, "comparsa_a", bancoCambio)
    expect(invalida.ok).toBe(false)
    if (!invalida.ok) expect(invalida.error.codigo).toBe("VARIANTE_INVALIDA")

    const ok = elegirVarianteDeCambio(r1.valor, "chiri_a", bancoCambio)
    expect(ok.ok).toBe(true)
    if (!ok.ok) return
    expect(ok.valor.modalidad).toBe("chirigotero")
    expect(ok.valor.variante).toBe("chiri_a")
    expect(ok.valor.fase).toBe("decision")
    expect(ok.valor.trayectoria.modalidadInicial).toBe("comparsista")
    expect(ok.valor.trayectoria.varianteInicial).toBe("comparsa_a")
    expect(ok.valor.trayectoria.cambios).toEqual([
      {
        ano: ok.valor.anoActual,
        modalidad: "chirigotero",
        variante: "chiri_a",
      },
    ])
  })

  it("elegirVarianteDeCambio fuera del paso devuelve OPCION_INVALIDA", () => {
    const p = crearPartida(input, bancoCambio)
    const res = elegirVarianteDeCambio(p, "chiri_a", bancoCambio)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.codigo).toBe("OPCION_INVALIDA")
  })
})

function situacionVariante(
  id: string,
  tipo: "contenido" | "personaje",
  opciones: Opcion[],
): Situacion {
  return {
    id,
    momento: "verano",
    tipo,
    categoria: "musica",
    titulo: "Enfoque del repertorio",
    texto: "",
    modalidades: ["comparsista"],
    opciones,
  }
}

const bancoVariante: BancoContenido = {
  situaciones: [
    situacionVariante("var_contenido", "contenido", [
      { id: "a", titulo: "A", subtitulo: "a" },
      { id: "b", titulo: "B", subtitulo: "b", cambiaVariante: "comparsa_b" },
    ]),
    situacionVariante("var_personaje", "personaje", [
      { id: "a", titulo: "A", subtitulo: "a" },
      { id: "b", titulo: "B", subtitulo: "b", cambiaVariante: "comparsa_b" },
    ]),
  ],
  variantes: [
    { id: "comparsa_a", modalidad: "comparsista" },
    { id: "comparsa_b", modalidad: "comparsista" },
  ],
}

describe("cambio de variante", () => {
  it("actualiza la variante y registra el cambio sin abrir paso", () => {
    const p = crearPartida(input, bancoVariante)
    const res = elegir(p, "b", bancoVariante)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.variante).toBe("comparsa_b")
    expect(res.valor.fase).toBe("decision")
    expect(res.valor.modalidad).toBe("comparsista")
    expect(res.valor.trayectoria.cambios).toEqual([
      {
        ano: res.valor.anoActual,
        modalidad: "comparsista",
        variante: "comparsa_b",
      },
    ])
  })

  it("elegir la variante vigente no registra cambio", () => {
    const banco: BancoContenido = {
      situaciones: [
        situacionVariante("var_contenido", "contenido", [
          { id: "a", titulo: "A", subtitulo: "a" },
          {
            id: "mismo",
            titulo: "Mismo",
            subtitulo: "mismo",
            cambiaVariante: "comparsa_a",
          },
        ]),
        situacionVariante("var_personaje", "personaje", [
          { id: "b", titulo: "B", subtitulo: "b" },
          {
            id: "mismo",
            titulo: "Mismo",
            subtitulo: "mismo",
            cambiaVariante: "comparsa_a",
          },
        ]),
      ],
      variantes: [{ id: "comparsa_a", modalidad: "comparsista" }],
    }
    const p = crearPartida(input, banco)
    const res = elegir(p, "mismo", banco)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.variante).toBe("comparsa_a")
    expect(res.valor.trayectoria.cambios).toEqual([])
  })
})
