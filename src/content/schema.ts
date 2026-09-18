import { z } from "zod"

export const DecisionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  consequences: z.object({
    reputation: z.number().int(),
    finances: z.number().int(),
  }),
})

export type Decision = z.infer<typeof DecisionSchema>

export const ScenarioSchema = z.object({
  id: z.string(),
  turn: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  decisions: z.array(DecisionSchema).min(1),
})

export type Scenario = z.infer<typeof ScenarioSchema>

export const GameContentSchema = z.object({
  version: z.string(),
  scenarios: z.array(ScenarioSchema),
})

export type GameContent = z.infer<typeof GameContentSchema>
