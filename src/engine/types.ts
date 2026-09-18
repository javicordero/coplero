export type GameSeed = number

export interface GameState {
  seed: GameSeed
  turn: number
  reputation: number
  finances: number
}

export interface GameEvent {
  id: string
  turn: number
  description: string
}
