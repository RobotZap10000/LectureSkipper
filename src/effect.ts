import type { LucideIcon } from "lucide-react";
import { generateUUID, type GameState } from "@/game";

export type EffectData = {
  // Set randomly when the Effect is added
  id: string;
  name: string;
  value: number;
};

export type EffectMeta = {
  icon?: LucideIcon;
  backgroundColor: string;
  getBadgeText: (effect: EffectData, state: GameState) => string;
  getDescription: (effect: EffectData, state: GameState) => string;
};

export const effectUtils = {
  /**
   * Finds the first effect in the course's effects that matches the given name, and adds the given amount to it.  
   * If no effect is found, it is added.  
   * Deletes the effect if the amount is 0 or less.  
   * Mutates the gameState. May also mutate other data if some effects (that act immediately) are applied.
   * @returns Returns the new EffectData, or null if the stacks were set to 0 (effect gets deleted).
   */
  addEffectStacksToCourse: (state: GameState, courseIndex: number, effectName: string, amount: number): EffectData | null =>
  {
    // Create an effect if there is none
    if (state.courses[courseIndex].effects.find((e) => e.name === effectName) == null)
      state.courses[courseIndex].effects.push({ id: generateUUID(), name: effectName, value: 0 });
    // Get the effect
    let effectIndex = state.courses[courseIndex].effects.findIndex((e) => e.name === effectName);
    let effect = state.courses[courseIndex].effects[effectIndex];
    // Add the amount
    effect.value += amount;

    // Special statements for effects
    if (effect.name === "Extensive")
    {
      state.courses[courseIndex].goal = Math.round(state.courses[courseIndex].originalGoal * (1 + amount / 100));
    }

    // Delete the effect if the amount is 0 or less
    if (effect.value <= 0)
    {
      delete state.courses[courseIndex].effects[effectIndex];
      state.courses[courseIndex].effects.splice(effectIndex, 1);
      return null;
    }
    return effect;
  },
  /**
   * Finds the first effect in the course's effects that matches the given name, and sets the stacks to the given amount.
   * If no effect is found, it is added.  
   * Deletes the effect if the amount is 0 or less.
   * @returns Returns the new EffectData, or null if the stacks were set to 0 (effect gets deleted).
   */
  setEffectStacksForCourse: (state: GameState, courseIndex: number, effectName: string, amount: number): EffectData | null =>
  {
    // Create an effect if there is none
    if (state.courses[courseIndex].effects.find((e) => e.name === effectName) == null)
      state.courses[courseIndex].effects.push({ id: generateUUID(), name: effectName, value: 0 });
    // Get the effect
    let effectIndex = state.courses[courseIndex].effects.findIndex((e) => e.name === effectName);
    let effect = state.courses[courseIndex].effects[effectIndex];
    // Set the amount
    effect.value = amount;
    // Delete the effect if the amount is 0 or less
    if (effect.value <= 0)
    {
      delete state.courses[courseIndex].effects[effectIndex];
      state.courses[courseIndex].effects.splice(effectIndex, 1);
      return null;
    }
    return effect;
  },
  /**
   * Finds the first effect in the course's effects that matches the given name, and returns its amount.
   */
  getEffectStacks: (state: GameState, courseIndex: number, effectName: string): number =>
  {
    if (state.courses[courseIndex].effects.find((e) => e.name === effectName) == null)
      return 0;
    return state.courses[courseIndex].effects.find((e) => e.name === effectName)!.value;
  },
}