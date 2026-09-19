export { auditarCarrera, REGLAS_ESTADO_IMPOSIBLE } from "./auditoria"
export { CONFIGURACIONES_POR_DEFECTO } from "./configuraciones"
export { construirInforme } from "./estadisticas"
export { formatearInforme, informeAJson } from "./informe"
export { jugarCarrera } from "./jugar"
export {
  PERFIL_ALEATORIO,
  PERFIL_CODICIOSO,
  PERFIL_ERRATICO,
  PERFILES_POR_DEFECTO,
} from "./perfiles"
export { simular } from "./simular"
export type {
  AtributoResumen,
  Bucket,
  ConfiguracionPartida,
  ContextoDecision,
  DecisionRegistrada,
  Distribucion,
  ErrorAgregable,
  HallazgoEstadoImposible,
  InformeSimulacion,
  MetricasAgregadas,
  MetricasPrincipales,
  OpcionesSimulacion,
  PerfilJugador,
  RegistroCarrera,
  ReglaEstadoImposible,
  SituacionFrecuencia,
} from "./tipos"
