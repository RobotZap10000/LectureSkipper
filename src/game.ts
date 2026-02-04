import { Box, Check, PenOff, StepForward, X, type LucideProps } from "lucide-react";
import Mustache from "mustache";
import chroma from "chroma-js";
import { behaviorRegistry, itemMetaRegistry, itemRegistry, itemsByRarity } from "@/itemRegistry";
import { itemUtils, type ItemData } from "@/item";
import { effectUtils, type EffectData } from "@/effect";
import { story } from "@/story";
import { effectMetaRegistry } from "./effectRegistry";
import { parseWithInfinity, stringifyWithInfinity, weightedRandom } from "./lib/utils";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import type { UserSettings } from "./App";


export function generateUUID(): string
{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) =>
  {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const DEFAULT_MINIMUM_LECTURES_LEFT = 3;

export type Course = {
  title: string;
  color: string;
  understandings: number;
  /**
   * Original goal of the course, without any modifications.
   */
  originalGoal: number;
  goal: number;
  effects: EffectData[];
  /**
   * The minimum amount of lectures that must be generated for this course during the block.  
   * Decremented each time the lecture appears.
   */
  minimumLecturesLeft: number;
  /**
   * The amount of times a lecture has been generated for this course.
   */
  lecturesAppeared: number;
  lectureAppearWeight: number;

  maxUnderstandingsPerLecture: number;
  maxProcrastinationsPerLecture: number;
  maxEnergyCostPerLecture: number;
};

export type Lecture = {
  courseIndex: number;
  startTime: string;
  endTime: string;
  potentialUnderstandings: number;
  understandChance: number; // 0-1
  energyCost: number;
  procrastinationValue: number;

  // Effects
  PUVisible: boolean;
  UCVisible: boolean;
};

export type LectureResult = {
  action: "attend" | "skip";
  result: "success" | "failure";
  courseIndex: number;
  gainedUnderstandings: number;
  gainedProcrastinations: number;
  energyChange: number;
}

export type Currency =
  { type: "cash"; amount: number }
  | { type: "understandings"; courseIndex: number; amount: number }
  | { type: "procrastinations"; amount: number }
  | { type: "maxActivatedItems"; amount: number };

export type Quest = {
  // Set randomly when the quest is made
  id: string;
  costs: Currency[];
  rewards: Currency[];
  color: string;
};

export interface ShopEntry
{
  item: ItemData;
  price: number;
  discount: number;
}

export interface LogEntry
{
  icon?: React.ComponentType<LucideProps>;
  color: string;
  message: string;
  type: "normal" | "result";
}

export type View = "Calendar" | "Market" | "Chat" | "Forge" | "Settings";

export function changeView(game: GameState, view: View): GameState
{
  const newState: GameState = { ...game };

  newState.courseTexts = [];

  if (view === "Calendar")
  {
    if (newState.view !== "Calendar")
    {
      // Going to Calendar from some other view
      newState.selectedItemIDs = [...newState.calendarActivatedItemIDs];
    }
  } else
  {
    if (newState.view === "Calendar")
    {
      // Leaving calendar
      newState.calendarActivatedItemIDs = [...newState.selectedItemIDs];
    }
    // Going to other view
    newState.selectedItemIDs = [];
  }

  // Check for selected items that don't exist
  for (let i = newState.selectedItemIDs.length - 1; i >= 0; i--)
  {
    const itemID = newState.selectedItemIDs[i];
    if (itemUtils.itemIDtoItem(itemID, newState) == null)
    {
      newState.selectedItemIDs.splice(i, 1);
    }
  }

  newState.view = view;

  return newState;
}

export type GameState = {
  saveVersion: number;
  dateCreated: number;
  dateEnded?: number;
  dateEndingReached?: number;
  dateInfinityReached?: number;

  // Settings
  view: View;
  showOnlyCompletableQuests: boolean;
  autoTrashMarket: boolean;

  // General Game
  block: number;
  lecturesLeft: number;
  courses: Course[];
  lastLecture: Lecture | null;
  lastLectureResult: LectureResult | null;
  nextLecture: Lecture | null;
  score: number;

  // Menus
  examsAttended: boolean;
  examResults: boolean[];
  story: number;
  courseTexts: string[];
  log: LogEntry[];
  quests: Quest[];
  unboxedItems: ItemData[];
  selectedItemIDs: string[];
  calendarActivatedItemIDs: string[];
  shop: ShopEntry[];

  // Player Stats
  energy: number;
  maxEnergy: number;
  energyPerSkip: number;
  cash: number;
  procrastinations: number;
  items: (ItemData | null)[];
  maxActivatedItems: number;
};

// Initial state generator
export function initGame(settings: UserSettings): GameState
{
  let game: GameState = {
    saveVersion: CURRENT_SAVE_VERSION,
    dateCreated: Date.now(),

    view: "Calendar",
    showOnlyCompletableQuests: false,
    autoTrashMarket: false,
    block: 0,
    lecturesLeft: 0,
    courses: [],
    cash: 0,
    procrastinations: 0,
    energy: 100,
    maxEnergy: 100,
    energyPerSkip: 5,
    lastLecture: null,
    lastLectureResult: null,
    nextLecture: null,
    items: Array(36).fill(null),
    maxActivatedItems: 3,
    unboxedItems: [],
    selectedItemIDs: [],
    calendarActivatedItemIDs: [],
    shop: [],
    quests: [],
    log: [],
    examsAttended: true,
    examResults: [],
    story: -1,
    courseTexts: [],
    score: 0,
  };

  // Debug code for testing
  //let debugItem = itemUtils.createItemInstanceAndAddToInventory(itemRegistry["Course Material"], game);
  //if (debugItem)
  //{
  //  debugItem.level = Infinity;
  //}

  game = startNewBlock(game, settings);

  return game;
};

const LOCAL_STORAGE_KEY = "myGameState";
const CURRENT_SAVE_VERSION = 5;

export function saveGame(game: GameState)
{
  try
  {
    // Create a copy of game with an empty log and no texts
    const toSave: GameState = { ...game, log: [], courseTexts: [] };
    localStorage.setItem(LOCAL_STORAGE_KEY, compressToUTF16(stringifyWithInfinity(toSave)));
  } catch (err)
  {
    console.error("Failed to save game:", err);
  }
}

/**
 * Load the GameState from localStorage.
 * If nothing exists, returns "GameDoesNotExist",
 * If parsing fails, returns "ParsingFailed",
 */
export function loadGame(): GameState | "GameDoesNotExist" | "ParsingFailed"
{
  try
  {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return "GameDoesNotExist";

    const decompressed =
      data.startsWith("{")
        ? data
        : decompressFromUTF16(data);

    if (!decompressed) throw new Error("Decompression failed");

    const parsed: GameState = parseWithInfinity<GameState>(decompressed);

    // Save version migration here

    if (parsed.saveVersion < 3)
    {
      throw new Error("Unsupported save version.");
    }

    if (parsed.saveVersion == 3)
    {
      parsed.saveVersion = 4;
      parsed.lastLecture = null;
      parsed.lastLectureResult = null;
      parsed.courseTexts = [];
      parsed.autoTrashMarket = false;
      generateShop(parsed);
      for (let i = 0; i < parsed.courses.length; i++)
      {
        parsed.courses[i].originalGoal = parsed.courses[i].goal;
      }
    }

    if (parsed.saveVersion == 4)
    {
      parsed.saveVersion = 5;
      parsed.dateCreated = Date.now();
      parsed.unboxedItems = [];
      // @ts-ignore
      if (parsed.unboxedItem != null)
      {
        // @ts-ignore 
        parsed.unboxedItems.push(parsed.unboxedItem);
      }
      // @ts-ignore
      delete parsed.unboxedItem;
      // @ts-ignore
      parsed.autoTrashMarket = parsed.autoTrashForge;
      // @ts-ignore
      delete parsed.autoTrashForge;
    }

    parsed.log = [{
      icon: Check,
      color: "LawnGreen",
      message: "Save game loaded.",
      type: "normal",
    }];

    return parsed;
  } catch (err)
  {
    console.error("Failed to load game from localStorage:", err);
    return "ParsingFailed";
  }
}

export type Run = {
  dateCreated: number;
  dateEnded: number;
  dateEndingReached?: number;
  dateInfinityReached?: number;
  score: number;
  block: number;

  energy: number;
  maxEnergy: number;
  energyPerSkip: number;
  cash: number;
  procrastinations: number;
  items: ItemData[];
  maxActivatedItems: number;
};

/**
 * Load the GameState from localStorage.
 * If nothing exists, returns "GameDoesNotExist",
 * If parsing fails, returns "ParsingFailed",
 */
export function loadRuns(): Run[] | "RunsDoNotExist" | "ParsingFailed"
{
  try
  {
    const data = localStorage.getItem("topRuns");
    if (!data) return "RunsDoNotExist";

    const decompressed =
      data.startsWith("[")
        ? data
        : decompressFromUTF16(data);

    if (!decompressed) throw new Error("Decompression failed");

    const parsed: Run[] = parseWithInfinity<Run[]>(decompressed);

    // dateEnded used to be date, so we migrate here
    for (let i = 0; i < parsed.length; i++)
    {
      if (!parsed[i].dateEnded)
      {
        // date -> dateEnded

        // @ts-ignore
        parsed[i].dateEnded = parsed[i].date;
        // @ts-ignore
        delete parsed[i].date;

        // new dateCreated. 0s because we do not know the run time
        parsed[i].dateCreated = parsed[i].dateEnded;
      }
    }

    return parsed;
  } catch (err)
  {
    console.error("Failed to load runs from localStorage:", err);
    return "ParsingFailed";
  }
}

function recordRun(game: GameState, setTopRuns: React.Dispatch<React.SetStateAction<Run[]>>)
{
  // Create a snapshot of items (omit nulls) and sort by rarity descending
  const snapshotItems = game.items
    .filter((item): item is NonNullable<typeof item> => !!item)
    .sort((a, b) => b.rarity - a.rarity);

  const newRun: Run = {
    dateCreated: game.dateCreated,
    dateEnded: game.dateEnded ?? Date.now(),
    dateEndingReached: game.dateEndingReached,
    dateInfinityReached: game.dateInfinityReached,
    score: game.score,
    block: game.block,
    items: snapshotItems,
    energy: game.energy,
    maxEnergy: game.maxEnergy,
    energyPerSkip: game.energyPerSkip,
    cash: game.cash,
    procrastinations: game.procrastinations,
    maxActivatedItems: game.maxActivatedItems,
  };

  setTopRuns(prev =>
  {
    const updated = [...prev, newRun].sort((a, b) =>
    {
      // Primary: score (descending)
      if (a.score !== b.score)
      {
        return b.score - a.score;
      }

      // Secondary: if both scores are Infinity, shorter durations win
      if (a.score === Infinity && b.score === Infinity)
      {
        let durationA = 0;
        let durationB = 0;
        if (a.dateInfinityReached && b.dateInfinityReached)
        {
          // Sort by time to reach infinity
          durationA = a.dateInfinityReached - a.dateCreated;
          durationB = b.dateInfinityReached - b.dateCreated;
        } else if (a.dateEndingReached && b.dateEndingReached)
        {
          // Sort by time to reach ending
          durationA = a.dateEndingReached - a.dateCreated;
          durationB = b.dateEndingReached - b.dateCreated;
        } else
        {
          // Sort by time to end run
          durationA = a.dateEnded - a.dateCreated;
          durationB = b.dateEnded - b.dateCreated;
        }
        return durationA - durationB; // ascending (shorter first)
      }

      return 0;
    });

    // Keep only top runs
    const topX = updated.slice(0, 10);

    // Save to localStorage
    try
    {
      localStorage.setItem("topRuns", compressToUTF16(stringifyWithInfinity(topX)));
    } catch (err)
    {
      console.error("Failed to save top runs:", err);
    }

    return topX;
  });
}

export function startRound(state: GameState, action: "attend" | "skip"): GameState
{
  if (!state.nextLecture) return state;
  if (action === "attend" && state.energy < state.nextLecture.energyCost) return state;

  const newState: GameState = { ...state };
  let lecture = { ...newState.nextLecture! };
  let course = { ...newState.courses[lecture.courseIndex] };
  let lastRoundUnderstandings = [];
  for (let i = 0; i < newState.courses.length; i++)
  {
    lastRoundUnderstandings.push(newState.courses[i].understandings);
  }

  newState.log = [];

  // BEFORE ROUND ITEM HOOKS
  let itemIDsToActivate: string[] = [];
  for (let i = 0; i < newState.items.length; i++)
  {
    let item = newState.items[i];
    if (item === null) continue;
    itemIDsToActivate.push(item.id);
  }
  for (let i = 0; i < itemIDsToActivate.length; i++)
  {
    let item = itemUtils.itemIDtoItem(itemIDsToActivate[i], newState);
    if (item === null) continue;
    if (behaviorRegistry[item.name].beforeRound !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].beforeRound!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (newState.selectedItemIDs.includes(item.id) == false) continue;

    if (behaviorRegistry[item.name].beforeUse !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].beforeUse!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (action == "skip" && behaviorRegistry[item.name].beforeSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].beforeSkipLecture!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (action == "attend" && behaviorRegistry[item.name].beforeAttendLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].beforeAttendLecture!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
  }

  // BEFORE ROUND EFFECTS
  let listOfAppliedEffects: string[] = course.effects.map(e => e.name);
  if (listOfAppliedEffects.includes("Shocked"))
  {
    let oldEnergyCost = lecture.energyCost;
    lecture.energyCost = Math.round(lecture.energyCost * (1 + effectUtils.getEffectStacks(newState, lecture.courseIndex, "Shocked") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Shocked"].icon, color: "crimson", message: `${oldEnergyCost} E → ${lecture.energyCost} E`, type: "normal", });
    effectUtils.setEffectStacksForCourse(newState, lecture.courseIndex, "Shocked", 0)
  }
  if (listOfAppliedEffects.includes("BadPacing") && lecture.understandChance < effectUtils.getEffectStacks(newState, lecture.courseIndex, "BadPacing") * 0.01)
  {
    lecture.understandChance = 0;
    newState.log.push({ icon: effectMetaRegistry["BadPacing"].icon, color: "crimson", message: `Understand chance set to 0%`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("Collateral") && action == "attend")
  {
    for (let i = 0; i < newState.courses.length; i++)
    {
      if (i == lecture.courseIndex) continue;
      newState.courses[i].understandings -= Math.round(newState.courses[i].understandings * effectUtils.getEffectStacks(newState, lecture.courseIndex, "Collateral") * 0.01);
      if (newState.courses[i].understandings < 0) newState.courses[i].understandings = 0;
    }
    newState.log.push({ icon: effectMetaRegistry["Collateral"].icon, color: "crimson", message: `Removed ${effectUtils.getEffectStacks(newState, lecture.courseIndex, "Collateral")}% U from other courses`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("Exhausting"))
  {
    let oldEnergyCost = lecture.energyCost;
    lecture.energyCost = Math.round(lecture.energyCost * (1 + effectUtils.getEffectStacks(newState, lecture.courseIndex, "Exhausting") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Exhausting"].icon, color: "crimson", message: `${oldEnergyCost} E → ${lecture.energyCost} E`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("TakesP") && action == "attend")
  {
    let loseP = effectUtils.getEffectStacks(newState, lecture.courseIndex, "TakesP");
    loseP = Math.min(loseP, newState.procrastinations);
    newState.procrastinations -= loseP;
    newState.log.push({ icon: effectMetaRegistry["TakesP"].icon, color: "crimson", message: `-${loseP} P`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("TravelCost") && action == "attend")
  {
    let loseCash = effectUtils.getEffectStacks(newState, lecture.courseIndex, "TravelCost");
    loseCash = Math.min(loseCash, newState.cash);
    newState.cash -= loseCash;
    newState.log.push({ icon: effectMetaRegistry["TravelCost"].icon, color: "crimson", message: `-$${loseCash} `, type: "normal", });
  }
  if (listOfAppliedEffects.includes("Unhelpful") && action == "attend")
  {
    let oldUnderstanding = lecture.potentialUnderstandings;
    lecture.potentialUnderstandings = Math.round(lecture.potentialUnderstandings * (1 - effectUtils.getEffectStacks(newState, lecture.courseIndex, "Unhelpful") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Unhelpful"].icon, color: "crimson", message: `${oldUnderstanding} U → ${lecture.potentialUnderstandings} U`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("Prepared") && action == "attend")
  {
    let oldUnderstanding = lecture.potentialUnderstandings;
    lecture.potentialUnderstandings = Math.round(lecture.potentialUnderstandings * (1 + effectUtils.getEffectStacks(newState, lecture.courseIndex, "Prepared") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Prepared"].icon, color: effectMetaRegistry["Prepared"].backgroundColor, message: `${oldUnderstanding} U → ${lecture.potentialUnderstandings} U`, type: "normal", });
  }
  if (listOfAppliedEffects.includes("Soda") && action == "skip")
  {
    newState.energy += effectUtils.getEffectStacks(newState, lecture.courseIndex, "Soda");
    newState.log.push({ icon: effectMetaRegistry["Soda"].icon, color: effectMetaRegistry["Soda"].backgroundColor, message: `+${effectUtils.getEffectStacks(newState, lecture.courseIndex, "Soda")} E`, type: "normal", });
  }

  // Calculate round
  let lectureResult: LectureResult;
  if (action == "attend")
  {
    const understood = Math.random() < lecture.understandChance ? "success" : "failure";
    const gainedUnderstandings = understood == "success" ? lecture.potentialUnderstandings : 0;
    const energyChange = -lecture.energyCost;

    lectureResult = {
      action: action,
      result: understood,
      courseIndex: lecture.courseIndex,
      gainedUnderstandings: gainedUnderstandings,
      gainedProcrastinations: 0,
      energyChange: energyChange,
    };
  } else // Skip
  {
    const gainedProcrastinations = lecture.procrastinationValue;
    const energyChange = newState.energyPerSkip;

    lectureResult = {
      action: action,
      result: "success",
      courseIndex: lecture.courseIndex,
      gainedUnderstandings: 0,
      gainedProcrastinations: gainedProcrastinations,
      energyChange: energyChange,
    };
  }

  // Update GameState based on LectureResult
  if (lectureResult.courseIndex >= 0)
  {
    newState.courses = [...newState.courses];
    const oldCourse = newState.courses[lectureResult.courseIndex];
    newState.courses[lectureResult.courseIndex] = {
      ...oldCourse,
      understandings: oldCourse.understandings + lectureResult.gainedUnderstandings,
    };
  }
  newState.energy = Math.min(Math.max(newState.energy + lectureResult.energyChange, 0), newState.maxEnergy);
  newState.procrastinations += lectureResult.gainedProcrastinations;
  newState.lecturesLeft -= 1;
  newState.score += lectureResult.gainedUnderstandings;
  newState.lastLecture = lecture;
  newState.lastLectureResult = lectureResult;

  // Log
  const courseTitle = newState.courses[lecture.courseIndex].title;
  if (action == "attend")
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: Check, color: "LawnGreen", message: `+${lectureResult.gainedUnderstandings} Understanding (U) in ${courseTitle}.`, type: "result", }
      : { icon: X, color: "red", message: `Could not understand ${courseTitle}.`, type: "result", });
  } else
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: StepForward, color: "gray", message: `Skipped ${courseTitle}.`, type: "result", }
      : { icon: X, color: "red", message: `Could not skip ${courseTitle}.`, type: "result", });
  }

  // Generate next lecture
  newState.nextLecture = newState.lecturesLeft > 0 ? generateLecture(newState) : null;
  let nextLecture = newState.nextLecture;

  // AFTER ROUND ITEM HOOKS
  itemIDsToActivate = [];
  for (let i = 0; i < newState.items.length; i++)
  {
    let item = newState.items[i];
    if (item === null) continue;
    itemIDsToActivate.push(item.id);
  }
  for (let i = 0; i < itemIDsToActivate.length; i++)
  {
    let item = itemUtils.itemIDtoItem(itemIDsToActivate[i], newState);
    if (item === null) continue;
    if (behaviorRegistry[item.name].afterRound !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].afterRound!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (newState.selectedItemIDs.includes(item.id) == false) continue;

    if (behaviorRegistry[item.name].afterUse !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].afterUse!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (action == "skip" && behaviorRegistry[item.name].afterSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].afterSkipLecture!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    // Item may have been deleted
    if (item === null) continue;

    if (action == "attend" && behaviorRegistry[item.name].afterAttendLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: "", type: "normal",
      };
      behaviorRegistry[item.name].afterAttendLecture!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
  }

  // AFTER ROUND EFFECTS
  // update effects list in case it has changed
  listOfAppliedEffects = course.effects.map(e => e.name);
  if (listOfAppliedEffects.includes("Aftershock") && action == "attend" && nextLecture)
  {
    effectUtils.setEffectStacksForCourse(newState, nextLecture.courseIndex, "Shocked", effectUtils.getEffectStacks(newState, lecture.courseIndex, "Aftershock"))
  }
  if (listOfAppliedEffects.includes("Frying") && action == "attend" && nextLecture)
  {
    newState.log.push({ icon: effectMetaRegistry["Frying"].icon, color: "crimson", message: `${(nextLecture.understandChance * 100).toFixed(1)}% → ${effectUtils.getEffectStacks(newState, lecture.courseIndex, "Frying")}%`, type: "normal", });
    nextLecture.understandChance = effectUtils.getEffectStacks(newState, lecture.courseIndex, "Frying") / 100;
  }

  // NEW LECTURE APPEAR EFFECTS
  if (nextLecture)
  {
    listOfAppliedEffects = newState.courses[nextLecture.courseIndex].effects.map(e => e.name);
    if (listOfAppliedEffects.includes("Cash"))
    {
      newState.cash += effectUtils.getEffectStacks(newState, nextLecture.courseIndex, "Cash");
      newState.log.push({ icon: effectMetaRegistry["Cash"].icon, color: "yellow", message: `+${effectUtils.getEffectStacks(newState, nextLecture.courseIndex, "Cash")}$`, type: "normal", });
    }
    if (listOfAppliedEffects.includes("Mutating"))
    {
      newState.courses[nextLecture.courseIndex].understandings = Math.round(newState.courses[nextLecture.courseIndex].understandings * (1 - effectUtils.getEffectStacks(newState, nextLecture.courseIndex, "Mutating") / 100));
      newState.log.push({ icon: effectMetaRegistry["Mutating"].icon, color: "crimson", message: `Lost ${effectUtils.getEffectStacks(newState, nextLecture.courseIndex, "Mutating")}% U in ${newState.courses[nextLecture.courseIndex].title}`, type: "normal", });
    }
  }

  newState.log.reverse();

  // Deselect items that were disabled or removed during the round
  newState.selectedItemIDs = newState.selectedItemIDs.filter(itemID =>
  {
    const item = itemUtils.itemIDtoItem(itemID, newState);
    return item && itemMetaRegistry[item.name].getEnabled(item, newState);
  });

  // Check for Infinity score
  if (newState.score === Infinity && !newState.dateInfinityReached)
  {
    newState.dateInfinityReached = Date.now();
  }

  // Fix any potential NaNs in the courses
  for (let i = 0; i < newState.courses.length; i++)
  {
    if (isNaN(newState.courses[i].understandings))
    {
      newState.courses[i].understandings = 0;
    }
  }

  // Fix any potential NaNs in the items
  for (let i = 0; i < newState.items.length; i++)
  {
    let item = newState.items[i];
    if (item === null) continue;
    if (isNaN(item.level))
    {
      item.level = 1;
    }
  }

  // Show U differences for this round
  newState.courseTexts = [];
  for (let i = 0; i < newState.courses.length; i++)
  {
    let Udiff = (newState.courses[i].understandings - lastRoundUnderstandings[i]);

    // Skip NaN
    if (isNaN(Udiff)) continue;

    if (Udiff != 0)
    {
      if (Udiff > 0)
      {
        newState.courseTexts.push("+" + Udiff.toString());
      } else
      {
        newState.courseTexts.push(Udiff.toString());
      }
    } else
    {
      newState.courseTexts.push("");
    }
  }

  return newState;
}

export function skipAll(state: GameState): GameState
{
  let newState = { ...state };
  while (newState.lecturesLeft > 0)
  {
    newState = startRound(newState, "skip");
  }
  return newState;
}

const courseTemplates = [
  "Introduction to {{{topic}}}",
  "Advanced {{{topic}}}",
  "Fundamental {{{topic}}}",
  "Applied {{{topic}}}",
  "Principles of {{{topic}}}",
  "Modern {{{topic}}}",
  "{{{topic}}}, but 2 times harder",
  "Destroying {{{topic}}}",
  "Daily {{{topic}}}",
  "Forgetting {{{topic}}}",
  "Paying for {{{topic}}} lectures",
  "Blowing up {{{topic}}}",
  "{{{topic}}} Speedrunning",
  "Counting in {{{topic}}}",
  "Experimenting with {{{topic}}}",
  "History of {{{topic}}}",
  "96.4% of {{{topic}}}",
  "Philosophy of {{{topic}}}",
  "Politics of {{{topic}}}",
  "Western {{{topic}}}",
  "Eastern {{{topic}}}",
  "Estonian {{{topic}}}",
  "Chinese {{{topic}}}",
  "American {{{topic}}}",
  "Japanese {{{topic}}}",
  "Luxembourgian {{{topic}}}",
];

const courseTopics = [
  "Introductions",
  "Fundamentals",
  "Applications",
  "Principles",
  "Modernity",
  "Philosophy",

  "Doomscrolling",
  "Skipping Lectures",
  "Procrastination",
  "Time Management",
  "Lecture Skipper",
  "Vibecoding",
  "Skipmaxxing",
  ":3",
  "Memes",
  "idk",
  "[object Object]",
  "NaN",
  "Segmentation fault (core dumped)",
  "Market Pliers",
  "Deleting System32",
  "Uncaught Error at course:67",
  "Bugs",
  "Programming",
  "Noodles",
  "The Universe",
  "Sunlight",
  "Grass",
  "Phones",
  "Eating",
  "TypeScript",
  "Planet Earth",
  "Installing Virus",
  "Calculators",
  "Magic",
  "Dark Magic",
  "Breakdowns",
  "Ragebaiting",

  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Economics",
  "Psychology",
  "Sociology",
  "Politics",
  "Philosophy",
  "Religion",
  "Arts",

  "Cheese",
  "Christmas",
  "Halloween",
  "Easter",
  "Valentine's Day",
  "Thanksgiving",
  "New Year's Eve",
  "New Year's Day",
  "Gummy Bears :D",
  ";)",
  "Don't look up \"Unicode for g\"",
  "birds",
  "Knee Surgeries",
];

export function generateCourse(state: GameState, hue: number): Course
{
  // Pick a random template
  const template =
    courseTemplates[Math.floor(Math.random() * courseTemplates.length)];

  // Pick a random topic
  const topic =
    courseTopics[Math.floor(Math.random() * courseTopics.length)];

  // Render with Mustache
  const title = Mustache.render(template, { topic });

  let courseDifficulty = Math.random();

  // For online graphing calculators:
  // Max: y\ =\ 100\left(2x+-1.5\right)\ +\ 4.5^{\frac{x}{1}}
  // Min: y\ =\ 100\left(1x+-0.5\right)\ +\ 4^{\frac{x}{2}}
  let goal =
    Math.round(
      (100 * ((1 + 1 * courseDifficulty) * state.block + (-0.5 + -1 * courseDifficulty))
        + (4 + 0.5 * courseDifficulty) ** (state.block / (2 - courseDifficulty))
        + Math.random() * 10)
    )
  // For online graphing calculators:
  // Max: y\ =\ \frac{\left(100\left(0.30x+1\right)\ +\ 3.5^{\frac{x}{3}}\right)}{3}
  // Min: y\ =\ \frac{\left(100\left(0.125x+1\right)\ +\ 3^{\frac{x}{3}}\right)}{3}
  let maxUnderstandingsPerLecture =
    Math.round(
      (100 * ((0.125 + 0.175 * courseDifficulty) * state.block + 1)
        + (3 + 0.5 * courseDifficulty) ** (state.block / 3)
        + Math.random() * 10)
      / 3
    )

  return {
    title,
    originalGoal: goal,
    goal: goal,
    understandings: 0,
    color: chroma.hsv(hue, 1, 0.25).hex(),
    effects: [],
    minimumLecturesLeft: DEFAULT_MINIMUM_LECTURES_LEFT,
    lecturesAppeared: 0,
    lectureAppearWeight: 100,
    maxUnderstandingsPerLecture: maxUnderstandingsPerLecture,
    maxProcrastinationsPerLecture: 200,
    maxEnergyCostPerLecture: 10
  };
}

export function generateQuest(state: GameState): Quest
{
  let requirements: Currency[] = [];
  let rewards: Currency[] = [];
  let colors = [];

  // U requirement comes from questDifficulty * targetCourse.goal
  // effectively "how many courses worth of U is required to complete this quest?"
  let questDifficulty = Math.random() * 2 + 0.05;

  // Generating requirements
  let randomCourseIndex = Math.floor(Math.random() * state.courses.length);
  let targetCourse = state.courses[randomCourseIndex];

  requirements.push({
    type: "understandings",
    amount: Math.round(questDifficulty * targetCourse.goal),
    courseIndex: randomCourseIndex
  });
  colors.push(targetCourse.color);

  if (questDifficulty > 2)
  {
    requirements.push({
      type: "procrastinations",
      amount: Math.round(targetCourse.maxProcrastinationsPerLecture * questDifficulty / 2),
    });
  }

  // Generating rewards
  rewards.push({
    type: "cash",
    amount: Math.round(50 + 40 * state.block * ((1 + questDifficulty) ** 3) + Math.random() * 25 * (1 + questDifficulty)),
  });

  return {
    id: generateUUID(),
    costs: requirements,
    rewards: rewards,
    color: chroma.average(colors).hex(),
  };
}

/**
 * Mutates the GameState that you give it.
 */
export function generateLecture(state: GameState): Lecture
{
  let courseIndex = Math.floor(Math.random() * 3);

  // --- Step 1: Default random weighted pick ---

  // Collect weights
  const weights = state.courses.map(c => c.lectureAppearWeight);

  // Weighted random selection
  let total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < weights.length; i++)
  {
    if (r < weights[i])
    {
      courseIndex = i;
      break;
    }
    r -= weights[i];
  }

  // --- Step 2: Minimum-lecture guarantee ---
  let totalMinLecturesLeft = 0;
  for (let i = 0; i < state.courses.length; i++)
  {
    totalMinLecturesLeft += state.courses[i].minimumLecturesLeft;
  }
  if (totalMinLecturesLeft >= state.lecturesLeft)
  {
    // Choose the course that has the least amount of lecturesAppeared
    let minLecturesAppeared = state.courses[0].lecturesAppeared;
    courseIndex = 0;
    for (let i = 1; i < state.courses.length; i++)
    {
      if (state.courses[i].lecturesAppeared < minLecturesAppeared)
      {
        minLecturesAppeared = state.courses[i].lecturesAppeared;
        courseIndex = i;
      }
    }
  }

  // --- Step 3: "Guaranteed" effect ---

  // If any course has the effect "Guaranteed", set courseIndex to that course
  for (let i = 0; i < state.courses.length; i++)
  {
    if (effectUtils.getEffectStacks(state, i, "Guaranteed") > 0)
    {
      courseIndex = i;
      effectUtils.addEffectStacksToCourse(state, i, "Guaranteed", -1);
      break;
    }
  }

  state.courses[courseIndex].lecturesAppeared++;
  if (state.courses[courseIndex].minimumLecturesLeft > 0)
    state.courses[courseIndex].minimumLecturesLeft--;

  let startHour = Math.floor(9 + Math.random() * 12 + state.block);
  let endHour = startHour + Math.min(2 ** state.block, 1000);

  let chanceLowerBound = Math.max(0.7 - state.block * 0.1, 0);
  let chanceUpperBound = 1.0;
  if (effectUtils.getEffectStacks(state, courseIndex, "Difficult") > 0)
  {
    chanceUpperBound = effectUtils.getEffectStacks(state, courseIndex, "Difficult") / 100;
  }
  if (chanceLowerBound > chanceUpperBound)
    chanceLowerBound = chanceUpperBound;
  let understandChance = Math.random() * (chanceUpperBound - chanceLowerBound) + chanceLowerBound;

  const lecture: Lecture = {
    courseIndex: courseIndex,
    startTime: `${startHour}:00`,
    endTime: `${endHour}:00`,
    potentialUnderstandings: Math.ceil(Math.random() * state.courses[courseIndex].maxUnderstandingsPerLecture),
    understandChance: understandChance,
    energyCost: Math.ceil(Math.random() * state.courses[courseIndex].maxEnergyCostPerLecture),
    procrastinationValue: Math.ceil(Math.random() * state.courses[courseIndex].maxProcrastinationsPerLecture),

    // Effects
    PUVisible: Math.random() > effectUtils.getEffectStacks(state, courseIndex, "Ambiguous") / 100,
    UCVisible: Math.random() > effectUtils.getEffectStacks(state, courseIndex, "Unclear") / 100,
  };

  return lecture;
}

/**
 * Mutates the GameState that you give it.
 */
export function generateShop(state: GameState)
{
  state.shop = [];

  let commonCount = 4;

  for (var i = 0; i < 6; i++)
  {
    // Pick item using item dropWeight
    const itemWeights = itemsByRarity[1].map((i) => i.dropWeight);
    const chosenItem = weightedRandom(itemsByRarity[1], itemWeights);

    state.shop.push({
      item: itemUtils.createItemInstance(chosenItem),
      price: 200,
      discount: 0,
    });
  }

  for (var i = 0; i < 6; i++)
  {
    // Pick item using item dropWeight
    const itemWeights = itemsByRarity[2].map((i) => i.dropWeight);
    const chosenItem = weightedRandom(itemsByRarity[2], itemWeights);

    state.shop.push({
      item: itemUtils.createItemInstance(chosenItem),
      price: 1000,
      discount: 0,
    });
  }

  // Add discounts
  for (var i = 0; i < 4; i++)
  {
    let randomItemIdx = Math.floor(Math.random() * state.shop.length);
    if (state.shop[randomItemIdx].discount > 0)
    {
      i--;
      continue;
    }
    state.shop[randomItemIdx].discount += Math.round(Math.random() * 20 + 20) / 100;
  }

  // Add levels
  for (var i = 0; i < 7; i++)
  {
    let randomItemIdx = Math.floor(Math.random() * state.shop.length);
    if (state.shop[randomItemIdx].item.level > 1)
    {
      i--;
      continue;
    }
    state.shop[randomItemIdx].item.level += Math.floor(Math.random() * 3 + 2);
    state.shop[randomItemIdx].item.startingLevel = state.shop[randomItemIdx].item.level;
  }
}

export function attendExams(state: GameState, setTopRuns: React.Dispatch<React.SetStateAction<Run[]>>): GameState
{
  // Exams may only be attended once
  if (state.examsAttended)
    return state;

  const newState: GameState = { ...state };

  newState.courseTexts = [];

  // Remove Quests
  newState.quests = [];

  // Calculate results
  const results = newState.courses.map(c =>
  {
    const passChance = Math.min(c.understandings / c.goal, 1);
    return Math.random() <= passChance;
  });

  const logMessage = `You passed ${results.filter(r => r).length} exams.`;

  newState.examsAttended = true;
  newState.examResults = results;
  newState.log = [{
    icon: Check,
    color: "LawnGreen",
    message: logMessage,
    type: "normal",
  }];

  if (results.filter(r => r).length < 2)
  {
    // Game failed, record run
    newState.dateEnded = Date.now();
    recordRun(newState, setTopRuns);
  }

  return newState;
}

let level1Effects: string[] = [
  "Ambiguous",
  "Unclear",
  "Aftershock",
  "TravelCost",
  "TakesP",
];

let level2Effects: string[] = [
  "Difficult",
  "Unhelpful",
  "Exhausting",
  "Collateral",
  "Frying",
];

let level3Effects: string[] = [
  "BadPacing",
  "Extensive",
  "Mutating",
];

export const MAX_QUESTS_PER_BLOCK = 40;

export function startNewBlock(state: GameState, settings: UserSettings): GameState
{
  if (!state.examsAttended) return state;

  const newState: GameState = { ...state };

  newState.block += 1;

  let courseCount = 3;
  if (newState.block >= 3) courseCount++;
  if (newState.block >= 6) courseCount++;
  if (newState.block >= 9) courseCount++;
  newState.maxActivatedItems = courseCount;

  const hues: number[] = [];
  const minDistance = 25;
  while (hues.length < courseCount)
  {
    const h = Math.floor(Math.random() * 360);
    if (hues.every(existing => Math.abs(existing - h) >= minDistance &&
      Math.abs(existing - h) <= 360 - minDistance))
    {
      hues.push(h);
    }
  }

  // Create new courses
  const newCourses: Course[] = [];
  for (let i = 0; i < courseCount; i++)
  {
    newCourses.push(generateCourse(newState, hues[i]));
  }
  newState.courses = newCourses;

  let level1EffectCount = Math.floor((newState.block) * 2 - 2);
  let level2EffectCount = Math.floor((newState.block) - 1);
  let level3EffectCount = Math.floor((newState.block - 1) / 3);

  level1EffectCount = Math.max(level1EffectCount, 0);
  level2EffectCount = Math.max(level2EffectCount, 0);
  level3EffectCount = Math.max(level3EffectCount, 0);

  // Add effects to courses

  for (let i = 0; i < level1EffectCount; i++)
  {
    let randomEffect: string = level1Effects[Math.floor(Math.random() * level1Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (effectUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "Ambiguous":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.min(newState.block * 3 + Math.round(Math.random() * 100), 100));
          break;
        case "Unclear":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.min(newState.block * 3 + Math.round(Math.random() * 100), 100));
          break;
        case "Aftershock":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(25 + newState.block * 5 + Math.random() * 50));
          break;
        case "TravelCost":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(10 + newState.block * 25 + Math.random() * 25) * newState.block);
          break;
        case "TakesP":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(100 + newState.block * 10 + Math.random() * 100) * newState.block);
          break;
      }
    }
  }

  for (let i = 0; i < level2EffectCount; i++)
  {
    let randomEffect: string = level2Effects[Math.floor(Math.random() * level2Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (effectUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "Difficult":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.max(Math.random() * 100 - newState.block * 5, 0)));
          break;
        case "Unhelpful":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.min(Math.random() * 100 + newState.block * 5, 100)));
          break;
        case "Exhausting":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(20 + Math.random() * 60 + newState.block * 5));
          break;
        case "Collateral":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.min(newState.block * 10 + Math.random() * 10 * newState.block, 100)));
          break;
        case "Frying":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, 1);
          break;
      }
    }
  }

  for (let i = 0; i < level3EffectCount; i++)
  {
    let randomEffect: string = level3Effects[Math.floor(Math.random() * level3Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (effectUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "BadPacing":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.min(newState.block * 10 + Math.random() * 40, 99)));
          break;
        case "Extensive":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(200 * newState.block + Math.random() * 300 * newState.block));
          break;
        case "Mutating":
          effectUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(10 + Math.random() * Math.min(10 * newState.block, 80)));
          break;
      }
    }
  }

  // Block 11 difficulty spike
  if (newState.block >= 11)
  {
    for (let i = 0; i < newState.courses.length; i++)
    {
      effectUtils.addEffectStacksToCourse(newState, i, "Extensive", Math.round(200 + Math.random() * 300));
    }
  }

  // Block 11 completed date
  if (newState.block == 12)
  {
    newState.dateEndingReached = Date.now();
  }

  // Create new quests
  const newQuests: Quest[] = [];
  const questCount = Math.min(4 + newState.block * 2 + Math.floor(Math.random() * 4), MAX_QUESTS_PER_BLOCK);
  for (let i = 0; i < questCount; i++)
  {
    newQuests.push(generateQuest(newState));
  }
  newState.quests = newQuests;

  // Create shop entries
  generateShop(newState);

  newState.lastLecture = null;
  newState.lastLectureResult = null;

  const nextLecture: Lecture = generateLecture(newState);
  newState.nextLecture = nextLecture;

  newState.lecturesLeft = 30;
  newState.examsAttended = false;
  newState.examResults = [];

  newState.log = [{
    icon: Box,
    color: "cyan",
    message: `Welcome to Block ${newState.block}.`,
    type: "normal",
  }];

  if (newState.block == 1)
  {
    newState.log.push({
      icon: PenOff,
      color: "white",
      message: "First time playing? Click the ?s to read about the game mechanics.",
      type: "normal",
    })
  }

  if (Object.keys(story).includes(newState.block.toString()) && settings.story == "show")
  {
    // Activate story
    newState.story = newState.block;
  }

  return newState;
}
