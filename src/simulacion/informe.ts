import { ATRIBUTOS } from "../engine/index"
import type { InformeSimulacion } from "./tipos"

function pct(valor: number): string {
  return `${valor.toFixed(1)}%`
}

function bloqueDistribucion(
  dist: Record<string, { n: number; pct: number }>,
): string[] {
  return Object.entries(dist).map(
    ([clave, bucket]) =>
      `  ${clave.padEnd(16)} ${String(bucket.n).padStart(2)} (${pct(bucket.pct)})`,
  )
}

export function formatearInforme(informe: InformeSimulacion): string {
  const lineas: string[] = []

  lineas.push("=== Simulacion masiva del motor ===")
  lineas.push(
    `Carreras: ${informe.meta.n} | seed base: ${informe.meta.seedBase} | perfiles: ${informe.meta.perfiles.join(", ")}`,
  )
  lineas.push(`Configuraciones: ${informe.meta.configuraciones.join(", ")}`)

  lineas.push("", "-- Fases --")
  lineas.push(`  % pisa final:              ${pct(informe.fases.pisanFinal)}`)
  lineas.push(
    `  % no supera cuartos:       ${pct(informe.fases.noSuperanCuartos)}`,
  )
  lineas.push(
    `  % no supera preliminares:  ${pct(informe.fases.noSuperanPreliminares)}`,
  )
  lineas.push(`  % no concursa nunca:       ${pct(informe.fases.noConcurso)}`)
  lineas.push("  Distribucion de mejor fase:")
  lineas.push(...bloqueDistribucion(informe.fases.distribucion))

  lineas.push("", "-- Premios --")
  lineas.push(
    `  Media primeros premios:    ${informe.premios.mediaPrimerosPremios.toFixed(3)} (total ${informe.premios.totalPrimerosPremios})`,
  )
  lineas.push(
    `  Carreras con premio:       ${pct(informe.premios.carrerasConPremio)}`,
  )
  lineas.push(
    `  Gana >=1 primer premio:    ${pct(informe.premios.acumuladoPrimeros.alMenos1)}`,
  )
  lineas.push(
    `  Gana >=3:                  ${pct(informe.premios.acumuladoPrimeros.alMenos3)}`,
  )
  lineas.push(
    `  Gana >=5:                  ${pct(informe.premios.acumuladoPrimeros.alMenos5)}`,
  )
  lineas.push(
    `  Gana >=10:                 ${pct(informe.premios.acumuladoPrimeros.alMenos10)}`,
  )
  lineas.push(
    `  Gana >=15:                 ${pct(informe.premios.acumuladoPrimeros.alMenos15)}`,
  )
  for (const [tipo, n] of Object.entries(informe.premios.porTipo)) {
    lineas.push(`  ${tipo.padEnd(24)} ${n}`)
  }

  lineas.push("", "-- Duracion y pico --")
  lineas.push(
    `  Duracion media:            ${informe.duracionMedia.toFixed(2)} anos`,
  )
  lineas.push("  Distribucion de ano pico:")
  lineas.push(...bloqueDistribucion(informe.anosPico))

  lineas.push("", "-- Situaciones --")
  lineas.push(
    `  Decisiones totales:        ${informe.situaciones.totalDecisiones}`,
  )
  lineas.push("  Mas frecuentes:")
  for (const s of informe.situaciones.masFrecuentes) {
    lineas.push(
      `  ${s.id.padEnd(28)} ${String(s.n).padStart(4)} (${pct(s.pct)})`,
    )
  }
  lineas.push("  Menos frecuentes:")
  for (const s of informe.situaciones.menosFrecuentes) {
    lineas.push(
      `  ${s.id.padEnd(28)} ${String(s.n).padStart(4)} (${pct(s.pct)})`,
    )
  }
  lineas.push(
    `  Nunca vistas (${informe.situaciones.nuncaVistas.length}): ${informe.situaciones.nuncaVistas.join(", ") || "ninguna"}`,
  )

  lineas.push("", "-- Condicionales --")
  lineas.push(
    `  Disparados: ${informe.condicionales.disparados.join(", ") || "ninguno"}`,
  )
  lineas.push(
    `  Nunca disparados: ${informe.condicionales.nuncaDisparados.join(", ") || "ninguno"}`,
  )

  lineas.push("", "-- Atributos (finales) --")
  for (const atributo of ATRIBUTOS) {
    const r = informe.atributos[atributo]
    lineas.push(
      `  ${atributo.padEnd(16)} min ${String(r.min).padStart(3)} | max ${String(r.max).padStart(3)} | media ${r.media.toFixed(2)}`,
    )
  }

  lineas.push("", "-- Estados imposibles --")
  if (informe.estadosImposibles.length === 0) {
    lineas.push("  ninguno detectado")
  } else {
    for (const h of informe.estadosImposibles) {
      lineas.push(`  [${h.regla}] ${h.seed} (${h.perfilId}): ${h.detalle}`)
    }
  }

  lineas.push("", "-- Errores --")
  if (informe.errores.length === 0) {
    lineas.push("  ninguno")
  } else {
    for (const e of informe.errores) lineas.push(`  ${e.codigo}: ${e.n}`)
  }

  lineas.push("", "-- Desglose por perfil --")
  for (const [id, m] of Object.entries(informe.porPerfil)) {
    lineas.push(
      `  ${id} (n=${m.n}): pisa final ${pct(m.pisanFinal)} | no cuartos ${pct(m.noSuperanCuartos)} | no preliminares ${pct(m.noSuperanPreliminares)} | premios ${m.mediaPrimerosPremios.toFixed(3)} | duracion ${m.duracionMedia.toFixed(2)}`,
    )
  }

  lineas.push("", "-- Desglose por configuracion --")
  for (const [id, m] of Object.entries(informe.porConfiguracion)) {
    lineas.push(
      `  ${id} (n=${m.n}): pisa final ${pct(m.pisanFinal)} | premios ${m.mediaPrimerosPremios.toFixed(3)} | duracion ${m.duracionMedia.toFixed(2)}`,
    )
  }

  return lineas.join("\n")
}

export function informeAJson(informe: InformeSimulacion): string {
  return JSON.stringify(informe, null, 2)
}
