import { importarBancoActual } from "../src/panel/importador"

const { importadas } = importarBancoActual()
console.log(`Importadas ${importadas} situaciones al almacén local.`)
