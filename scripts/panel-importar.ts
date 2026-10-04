import { importarBancoActual } from "../src/panel/importador"

const { importadas } = importarBancoActual()
console.log(
  `Importadas ${importadas} entidades (situaciones + condicionales) al almacén local.`,
)
