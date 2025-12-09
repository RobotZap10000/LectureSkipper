import type { GameState, Lecture, LectureResult, LogEntry } from "@/game";
import type { LucideIcon } from "lucide-react";
import { generateUUID } from "@/game";
import type { EffectData } from "./effect";

export type ItemData = {
  // Set randomly when the item is made
  id: string;
  name: string;
  rarity: number;
  dropWeight: number;
  level: number;
  startingLevel: number;
  // Used by items to keep track of their functionality throughout the game
  memory: any;
};

// Non-serializable item metadata (icon, dynamic description, etc.)
export type ItemMeta = {
  icon: LucideIcon;
  getDescription: (item: ItemData) => string;
  getEnabled: (item: ItemData, state: GameState) => boolean;
};

export type BeforeHookParams = {
  state: GameState;
  item: ItemData;
  lecture: Lecture;
  logEntry: LogEntry;
};

export type AfterHookParams = {
  state: GameState;
  item: ItemData;
  lecture: Lecture;
  logEntry: LogEntry;

  result: LectureResult;
  nextLecture: Lecture | null;
};

export type ItemBehavior = Partial<{
  beforeAttendLecture: (params: BeforeHookParams) => void;
  afterAttendLecture: (params: AfterHookParams) => void;
  beforeSkipLecture: (params: BeforeHookParams) => void;
  afterSkipLecture: (params: AfterHookParams) => void;
  beforeUse: (params: BeforeHookParams) => void;
  afterUse: (params: AfterHookParams) => void;
  beforeRound: (params: BeforeHookParams) => void;
  afterRound: (params: AfterHookParams) => void;
}>;

export const itemUtils = {
  itemIDtoSlot: (id: string, state: GameState): number => state.items.findIndex((item) => item && item.id === id),
  itemIDtoItem: (id: string, state: GameState): ItemData | null => state.items[itemUtils.itemIDtoSlot(id, state)],
  itemToSlot: (item: ItemData, state: GameState): number => itemUtils.itemIDtoSlot(item.id, state),

  setItemUsedThisBlock: (item: ItemData, state: GameState) =>
  {
    item.memory["lastUsed"] = state.block;
  },
  getItemUsedThisBlock: (item: ItemData, state: GameState): boolean =>
  {
    return item.memory.hasOwnProperty("lastUsed") && item.memory.lastUsed === state.block;
  },

  createItemInstance: (data: ItemData): ItemData =>
  {
    const newItem: ItemData = {
      ...data,
      id: generateUUID(),
      memory: {},
    };
    return newItem;
  },

  /**
   * Fails if there are no free slots in the inventory.
   * @returns Whether or not the item was successfully added.
   */
  createItemInstanceAndAddToInventory: (data: ItemData, state: GameState): boolean =>
  {
    let freeSlot = -1;
    for (let i = 0; i < state.items.length; i++)
    {
      if (state.items[i] === null)
      {
        freeSlot = i;
        break;
      }
    }

    if (freeSlot === -1)
      return false;

    const newItem = itemUtils.createItemInstance(data);

    state.items[freeSlot] = newItem;

    return true;
  },
  /**
   * Finds the first effect in the course's effects that matches the given name, and adds the given amount to it.  
   * If no effect is found, it is added.  
   * Deletes the effect if the amount is 0 or less.
   * @returns Returns the new EffectData.
   */
  addEffectStacksToCourse: (state: GameState, courseIndex: number, effectName: string, amount: number): EffectData =>
  {
    // Create an effect if there is none
    if (state.courses[courseIndex].effects.find((e) => e.name === effectName) == null)
      state.courses[courseIndex].effects.push({ id: generateUUID(), name: effectName, value: 0 });
    // Get the effect
    let effectIndex = state.courses[courseIndex].effects.findIndex((e) => e.name === effectName);
    let effect = state.courses[courseIndex].effects[effectIndex];
    // Add the amount
    effect.value += amount;
    // Delete the effect if the amount is 0 or less
    if (effect.value <= 0)
      delete state.courses[courseIndex].effects[effectIndex];
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

  /**
   * Exponential decay function.
   *
   * @param x Input number, preferrably from 1 → infinity (e.g., item.level).
   * @param k Slope of decay. `0.1` = slow decay, `1.0` = fast decay.
   * @param startValue Value when x = 1.
   * @param endValue Asymptotic minimum value as x → infinity.
   * @returns A value between startValue and endValue.
   */
  exponentialPercentage(x: number, k: number, startValue: number, endValue: number): number
  {
    // f(x) = end + (start - end) * e^(-k*(x-1))
    return endValue + (startValue - endValue) * Math.exp(-k * (x - 1));
  },

  /**
   * A generalized geometric-series easing function.
   *
   * The classic form:
   *   f(step) = max * (1 - ratio^step)
   *
   * Behavior:
   *   - step = 0 → startValue
   *   - step increases → value approaches endValue
   *   - Smaller ratio → faster convergence
   *
   * @param step A non-negative number representing iterative steps.
   * @param ratio The geometric decay ratio. Example: `0.5` = halves each step, `0.9` = slow decay.
   * @param startValue The value at step = 0.
   * @param endValue The asymptotic value as step → ∞.
   * @returns A value between startValue and endValue.
   */
  geometricSeries(step: number, ratio: number, startValue: number, endValue: number): number
  {
    // f(step) = endValue + (startValue - endValue) * (ratio^step)
    return endValue + (startValue - endValue) * Math.pow(ratio, step);
  },

};