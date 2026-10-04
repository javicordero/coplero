import { execSync } from "node:child_process"
import { leerAlmacen } from "../src/panel/almacen"
import { ErrorVolcado, escribirVolcado, volcar } from "../src/panel/generador"

const soloCheck = process.argv.includes("--check")

function formatearConBiome(rutas: string[]): void {
  if (rutas.length === 0) return
  const lista = rutas.map((ruta) => `"${ruta}"`).join(" ")
  execSync(`npx biome format --write ${lista}`, { stdio: "inherit" })
}

try {
  const resultado = volcar(leerAlmacen())

  if (soloCheck) {
    console.log("Almacén y banco válidos. --check: no se escribe nada.")
  } else {
    const rutas = escribirVolcado(resultado)
    formatearConBiome(rutas)
    for (const { fichero, entidades } of resultado.ficheros) {
      console.log(
        `${fichero.tipoImportado} ${fichero.momento}: ${entidades.length}`,
      )
    }
    console.log(
      `Escritos ${rutas.length} ficheros en src/content/{decisiones,condicionales}/.`,
    )
  }
} catch (error) {
  if (error instanceof ErrorVolcado) {
    console.error(error.message)
    process.exit(1)
  }
  throw error
}
