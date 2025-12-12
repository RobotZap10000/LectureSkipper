import { Box, Check, PenOff, StepForward, X, type LucideProps } from "lucide-react";
import Mustache from "mustache";
import chroma from "chroma-js";
import { behaviorRegistry, itemMetaRegistry } from "@/itemRegistry";
import { itemUtils, type ItemData } from "@/item";
import type { EffectData } from "@/effect";
import { story } from "@/story";
import { effectMetaRegistry } from "./effectRegistry";

export function generateUUID(): string
{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) =>
  {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type Course = {
  title: string;
  color: string;
  understandings: number;
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

export interface LogEntry
{
  icon?: React.ComponentType<LucideProps>;
  color: string;
  message: string;
}

export type View = "Calendar" | "Market" | "Chat" | "Forge" | "Settings";

export function changeView(game: GameState, view: View): GameState
{
  const newState: GameState = { ...game };

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

  // Settings
  view: View;
  showOnlyCompletableQuests: boolean;

  // General Game
  block: number;
  lecturesLeft: number;
  courses: Course[];
  nextLecture: Lecture | null;
  score: number;

  // Menus
  examsAttended: boolean;
  examResults: boolean[];
  story: number;
  log: LogEntry[];
  quests: Quest[];
  unboxedItem: ItemData | null;
  selectedItemIDs: string[];
  calendarActivatedItemIDs: string[];

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
export function initGame(): GameState
{
  let game: GameState = {
    saveVersion: CURRENT_SAVE_VERSION,

    view: "Calendar",
    showOnlyCompletableQuests: false,
    block: 0,
    lecturesLeft: 0,
    courses: [],
    cash: 0,
    procrastinations: 0,
    energy: 100,
    maxEnergy: 100,
    energyPerSkip: 5,
    nextLecture: null,
    items: Array(36).fill(null),
    maxActivatedItems: 3,
    unboxedItem: null,
    selectedItemIDs: [],
    calendarActivatedItemIDs: [],
    quests: [],
    log: [],
    examsAttended: true,
    examResults: [],
    story: -1,
    score: 0,
  };

  // Debug code for testing

  //game.items[0] = {
  //  name: "Snail",
  //  rarity: 2,
  //  dropWeight: 100,
  //
  //  // Don't change
  //  level: 50,
  //  startingLevel: 1,
  //  memory: {},
  //  id: "Testing",
  //}

  game = startNewBlock(game);

  return game;
};

const LOCAL_STORAGE_KEY = "myGameState";
const CURRENT_SAVE_VERSION = 3;

export function saveGame(game: GameState)
{
  try
  {
    // Create a copy of game with an empty log
    const toSave = { ...game, log: [] };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
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

    const parsed: GameState = JSON.parse(data);

    // Save version migration here

    if (parsed.saveVersion < 3)
    {
      throw new Error("Unsupported save version.");
    }

    parsed.log = [{
      icon: Check,
      color: "LawnGreen",
      message: "Save game loaded.",
    }];

    return parsed;
  } catch (err)
  {
    console.error("Failed to load game from localStorage:", err);
    return "ParsingFailed";
  }
}

export type Run = {
  date: string;
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

function recordRun(game: GameState, setTopRuns: React.Dispatch<React.SetStateAction<Run[]>>)
{
  // Create a snapshot of items (omit nulls) and sort by rarity descending
  const snapshotItems = game.items
    .filter((item): item is NonNullable<typeof item> => !!item)
    .sort((a, b) => b.rarity - a.rarity);

  const newRun: Run = {
    date: new Date().toISOString(),
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
    // Insert and sort descending by score
    const updated = [...prev, newRun].sort((a, b) => b.score - a.score);

    // Keep only top 5
    const top5 = updated.slice(0, 5);

    // Save to localStorage
    try
    {
      localStorage.setItem("topRuns", JSON.stringify(top5));
    } catch (err)
    {
      console.error("Failed to save top runs:", err);
    }

    return top5;
  });
}

export function startRound(state: GameState, action: "attend" | "skip"): GameState
{
  if (!state.nextLecture) return state;
  if (action === "attend" && state.energy < state.nextLecture.energyCost) return state;

  const newState: GameState = { ...state };
  let lecture = { ...newState.nextLecture! };
  let course = { ...newState.courses[lecture.courseIndex] };

  newState.log = [];

  // BEFORE ROUND ITEM HOOKS
  for (let i = 0; i < newState.items.length; i++)
  {
    let item = newState.items[i];
    if (item === null) continue;
    if (behaviorRegistry[item.name].beforeRound !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].beforeRound!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    if (newState.selectedItemIDs.includes(item.id) == false) continue;

    if (behaviorRegistry[item.name].beforeUse !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].beforeUse!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "skip" && behaviorRegistry[item.name].beforeSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].beforeSkipLecture!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "attend" && behaviorRegistry[item.name].beforeAttendLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
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
    lecture.energyCost = Math.round(lecture.energyCost * (1 + itemUtils.getEffectStacks(newState, lecture.courseIndex, "Shocked") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Shocked"].icon, color: "crimson", message: `${oldEnergyCost} E → ${lecture.energyCost} E` });
    itemUtils.setEffectStacksForCourse(newState, lecture.courseIndex, "Shocked", 0)
  }
  if (listOfAppliedEffects.includes("BadPacing") && lecture.understandChance < itemUtils.getEffectStacks(newState, lecture.courseIndex, "BadPacing") * 0.01)
  {
    lecture.understandChance = 0;
    newState.log.push({ icon: effectMetaRegistry["BadPacing"].icon, color: "crimson", message: `Understand chance set to 0%` });
  }
  if (listOfAppliedEffects.includes("Collateral") && action == "attend")
  {
    for (let i = 0; i < newState.courses.length; i++)
    {
      if (i == lecture.courseIndex) continue;
      newState.courses[i].understandings -= Math.round(newState.courses[i].understandings * itemUtils.getEffectStacks(newState, lecture.courseIndex, "Collateral") * 0.01);
      if (newState.courses[i].understandings < 0) newState.courses[i].understandings = 0;
    }
    newState.log.push({ icon: effectMetaRegistry["Collateral"].icon, color: "crimson", message: `Removed ${itemUtils.getEffectStacks(newState, lecture.courseIndex, "Collateral")}% U from other courses` });
  }
  if (listOfAppliedEffects.includes("Exhausting"))
  {
    let oldEnergyCost = lecture.energyCost;
    lecture.energyCost = Math.round(lecture.energyCost * (1 + itemUtils.getEffectStacks(newState, lecture.courseIndex, "Exhausting") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Exhausting"].icon, color: "crimson", message: `${oldEnergyCost} E → ${lecture.energyCost} E` });
  }
  if (listOfAppliedEffects.includes("TakesP") && action == "attend")
  {
    let loseP = itemUtils.getEffectStacks(newState, lecture.courseIndex, "TakesP");
    loseP = Math.min(loseP, newState.procrastinations);
    newState.procrastinations -= loseP;
    newState.log.push({ icon: effectMetaRegistry["TakesP"].icon, color: "crimson", message: `-${loseP} P` });
  }
  if (listOfAppliedEffects.includes("TravelCost") && action == "attend")
  {
    let loseCash = itemUtils.getEffectStacks(newState, lecture.courseIndex, "TravelCost");
    loseCash = Math.min(loseCash, newState.cash);
    newState.cash -= loseCash;
    newState.log.push({ icon: effectMetaRegistry["TravelCost"].icon, color: "crimson", message: `-$${loseCash} ` });
  }
  if (listOfAppliedEffects.includes("Unhelpful") && action == "attend")
  {
    let oldUnderstanding = lecture.potentialUnderstandings;
    lecture.potentialUnderstandings = Math.round(lecture.potentialUnderstandings * (1 - itemUtils.getEffectStacks(newState, lecture.courseIndex, "Unhelpful") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Unhelpful"].icon, color: "crimson", message: `${oldUnderstanding} U → ${lecture.potentialUnderstandings} U` });
  }
  if (listOfAppliedEffects.includes("Prepared") && action == "attend")
  {
    let oldUnderstanding = lecture.potentialUnderstandings;
    lecture.potentialUnderstandings = Math.round(lecture.potentialUnderstandings * (1 + itemUtils.getEffectStacks(newState, lecture.courseIndex, "Prepared") * 0.01));
    newState.log.push({ icon: effectMetaRegistry["Prepared"].icon, color: effectMetaRegistry["Prepared"].backgroundColor, message: `${oldUnderstanding} U → ${lecture.potentialUnderstandings} U` });
  }
  if (listOfAppliedEffects.includes("Soda") && action == "skip")
  {
    newState.energy += itemUtils.getEffectStacks(newState, lecture.courseIndex, "Soda");
    newState.log.push({ icon: effectMetaRegistry["Soda"].icon, color: effectMetaRegistry["Soda"].backgroundColor, message: `+${itemUtils.getEffectStacks(newState, lecture.courseIndex, "Soda")} E` });
  }

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
    const energyChange =
      newState.energy / newState.maxEnergy < 0.5
        ? Math.round(newState.energyPerSkip / 2)
        : newState.energyPerSkip;

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

  // Log
  const courseTitle = newState.courses[lecture.courseIndex].title;
  if (action == "attend")
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: Check, color: "LawnGreen", message: `+${lectureResult.gainedUnderstandings} Understanding (U) in ${courseTitle}.` }
      : { icon: X, color: "red", message: `Could not understand ${courseTitle}.` });
  } else
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: StepForward, color: "gray", message: `Skipped ${courseTitle}.` }
      : { icon: X, color: "red", message: `Could not skip ${courseTitle}.` });
  }

  // Generate next lecture
  newState.nextLecture = newState.lecturesLeft > 0 ? generateLecture(newState) : null;
  let nextLecture = { ...newState.nextLecture! };

  // AFTER ROUND ITEM HOOKS
  for (let i = 0; i < newState.items.length; i++)
  {
    let item = newState.items[i];
    if (item === null) continue;
    if (behaviorRegistry[item.name].afterRound !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterRound!({ state: newState, item, lecture, nextLecture: newState.nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }

    if (newState.selectedItemIDs.includes(item.id) == false) continue;

    if (behaviorRegistry[item.name].afterUse !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterUse!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "skip" && behaviorRegistry[item.name].afterSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterSkipLecture!({ state: newState, item, lecture, nextLecture: nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "attend" && behaviorRegistry[item.name].afterAttendLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
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
    itemUtils.setEffectStacksForCourse(newState, nextLecture.courseIndex, "Shocked", itemUtils.getEffectStacks(newState, lecture.courseIndex, "Aftershock"))
  }
  if (listOfAppliedEffects.includes("Frying") && action == "attend" && nextLecture)
  {
    newState.log.push({ icon: effectMetaRegistry["Frying"].icon, color: "crimson", message: `${(nextLecture.understandChance * 100).toFixed(1)}% → ${itemUtils.getEffectStacks(newState, lecture.courseIndex, "Frying")}%` });
    nextLecture.understandChance = itemUtils.getEffectStacks(newState, lecture.courseIndex, "Frying") / 100;
  }

  // NEW LECTURE APPEAR EFFECTS
  if (newState.nextLecture)
  {
    listOfAppliedEffects = newState.courses[nextLecture.courseIndex].effects.map(e => e.name);
    if (listOfAppliedEffects.includes("Cash"))
    {
      newState.cash += itemUtils.getEffectStacks(newState, nextLecture.courseIndex, "Cash");
      newState.log.push({ icon: effectMetaRegistry["Cash"].icon, color: "yellow", message: `+${itemUtils.getEffectStacks(newState, nextLecture.courseIndex, "Cash")}$` });
    }
    if (listOfAppliedEffects.includes("Mutating"))
    {
      newState.courses[nextLecture.courseIndex].understandings = Math.round(newState.courses[nextLecture.courseIndex].understandings * (1 - itemUtils.getEffectStacks(newState, nextLecture.courseIndex, "Mutating") / 100));
      newState.log.push({ icon: effectMetaRegistry["Mutating"].icon, color: "crimson", message: `Lost ${itemUtils.getEffectStacks(newState, nextLecture.courseIndex, "Mutating")}% U in ${newState.courses[nextLecture.courseIndex].title}` });
    }
  }

  newState.log.reverse();

  // Deselect items that were disabled or removed during the round
  newState.selectedItemIDs = newState.selectedItemIDs.filter(itemID =>
  {
    const item = itemUtils.itemIDtoItem(itemID, newState);
    return item && itemMetaRegistry[item.name].getEnabled(item, newState);
  });


  return newState;
}

const courseTemplates = [
  "Introduction to {{topic}}",
  "Advanced {{topic}}",
  "Fundamental {{topic}}",
  "Applied {{topic}}",
  "Principles of {{topic}}",
  "Modern {{topic}}",
  "{{topic}}, but 2 times harder",
  "Destroying {{topic}}",
  "Daily {{topic}}",
  "Forgetting {{topic}}",
  "Paying for {{topic}} lectures",
  "Blowing up {{topic}}",
  "{{topic}} Speedrunning",
  "Counting in {{topic}}",
  "Experimenting with {{topic}}",
  "History of {{topic}}",
  "96.4% of {{topic}}",
  "Philosophy of {{topic}}",
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
  // Max: y\ =\ 100\left(0.35x+1\right)\ +\ 3.5^{\frac{x}{5}}
  // Min: y\ =\ 100\left(0.15x+1\right)\ +3^{\frac{x}{5}}
  let goal =
    Math.round(
      (100 * ((0.15 + 0.2 * courseDifficulty) * state.block + 1)
        + (3 + 0.5 * courseDifficulty) ** (state.block / 5)
        + Math.random() * 5)
    )
  // For online graphing calculators:
  // Max: y\ =\ \frac{\left(100\left(0.30x+1\right)\ +\ 1.5^{\frac{x}{5}}\right)}{3}
  // Min: y\ =\ \frac{\left(100\left(0.125x+1\right)\ +1^{\frac{x}{5}}\right)}{3}
  let maxUnderstandingsPerLecture =
    Math.round(
      (100 * ((0.125 + 0.175 * courseDifficulty) * state.block + 1)
        + (1 + 0.5 * courseDifficulty) ** (state.block / 5)
        + Math.random() * 5)
    ) / 3

  // Block 30 difficulty spike
  if (state.block >= 30)
  {
    goal *= 5;
  }

  return {
    title,
    goal: goal,
    understandings: 0,
    color: chroma.hsv(hue, 1, 0.25).hex(),
    effects: [],
    minimumLecturesLeft: 3,
    lecturesAppeared: 0,
    lectureAppearWeight: 100,
    maxUnderstandingsPerLecture: maxUnderstandingsPerLecture,
    maxProcrastinationsPerLecture: 20 + Math.round((courseDifficulty + 1) * state.block * 10),
    maxEnergyCostPerLecture: 5 + 10 * (state.block - 1)
  };
}

export function generateQuest(state: GameState): Quest
{
  let requirements: Currency[] = [];
  let rewards: Currency[] = [];
  let colors = [];

  // U requirement comes from questDifficulty * targetCourse.goal
  // effectively "how many courses worth of U is required to complete this quest?"
  let questDifficulty = Math.random() * 2 + 0.5;

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
    amount: Math.round(50 + 40 * state.block * questDifficulty + Math.random() * 25),
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
    if (itemUtils.getEffectStacks(state, i, "Guaranteed") > 0)
    {
      courseIndex = i;
      itemUtils.addEffectStacksToCourse(state, i, "Guaranteed", -1);
      break;
    }
  }

  state.courses[courseIndex].lecturesAppeared++;
  if (state.courses[courseIndex].minimumLecturesLeft > 0)
    state.courses[courseIndex].minimumLecturesLeft--;

  let startHour = Math.floor(9 + Math.random() * 12 + state.block);
  let endHour = startHour + Math.min(2 ** state.block, 1000);

  let understandChance = Math.random();
  if (itemUtils.getEffectStacks(state, courseIndex, "Difficult") > 0)
  {
    understandChance = Math.min(understandChance, itemUtils.getEffectStacks(state, courseIndex, "Difficult") / 100);
  }

  const lecture: Lecture = {
    courseIndex: courseIndex,
    startTime: `${startHour}:00`,
    endTime: `${endHour}:00`,
    potentialUnderstandings: Math.ceil(Math.random() * state.courses[courseIndex].maxUnderstandingsPerLecture),
    understandChance: understandChance,
    energyCost: Math.ceil(Math.random() * state.courses[courseIndex].maxEnergyCostPerLecture),
    procrastinationValue: Math.ceil(Math.random() * state.courses[courseIndex].maxProcrastinationsPerLecture),

    // Effects
    PUVisible: Math.random() > itemUtils.getEffectStacks(state, courseIndex, "Ambiguous") / 100,
    UCVisible: Math.random() > itemUtils.getEffectStacks(state, courseIndex, "Unclear") / 100,
  };

  return lecture;
}

export function attendExams(state: GameState, setTopRuns: React.Dispatch<React.SetStateAction<Run[]>>): GameState
{
  // Exams may only be attended once
  if (state.examsAttended)
    return state;

  const newState: GameState = { ...state };

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
  }];

  if (results.filter(r => r).length < 2)
  {
    // Game failed, record run
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

export function startNewBlock(state: GameState): GameState
{
  if (!state.examsAttended) return state;

  const newState: GameState = { ...state };

  newState.block += 1;

  let courseCount = 3;
  if (newState.block > 6) courseCount++;
  if (newState.block > 12) courseCount++;
  if (newState.block > 24) courseCount++;
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

  // Create 3 new courses
  const newCourses: Course[] = [];
  for (let i = 0; i < courseCount; i++)
  {
    newCourses.push(generateCourse(newState, hues[i]));
  }
  newState.courses = newCourses;

  let level1EffectCount = Math.floor((newState.block) / 2);
  let level2EffectCount = Math.floor((newState.block) / 5);
  let level3EffectCount = Math.floor((newState.block) / 20);

  // Add effects to courses

  for (let i = 0; i < level1EffectCount; i++)
  {
    let randomEffect: string = level1Effects[Math.floor(Math.random() * level1Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (itemUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "Ambiguous":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.random() * 100));
          break;
        case "Unclear":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.random() * 100));
          break;
        case "Aftershock":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(25 + Math.random() * 50));
          break;
        case "TravelCost":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(50 + Math.random() * 50) * newState.block);
          break;
        case "TakesP":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(10 + Math.random() * 10) * newState.block);
          break;
      }
    }
  }

  for (let i = 0; i < level2EffectCount; i++)
  {
    let randomEffect: string = level2Effects[Math.floor(Math.random() * level2Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (itemUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "Difficult":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.random() * 100));
          break;
        case "Unhelpful":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(Math.random() * 100));
          break;
        case "Exhausting":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(20 + Math.random() * 60));
          break;
        case "Collateral":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(3 + Math.random() * 6));
          break;
        case "Frying":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(5 + Math.random() * 10));
          break;
      }
    }
  }

  for (let i = 0; i < level3EffectCount; i++)
  {
    let randomEffect: string = level3Effects[Math.floor(Math.random() * level3Effects.length)];
    let randomCourseIndex = Math.floor(Math.random() * newState.courses.length);
    if (itemUtils.getEffectStacks(newState, randomCourseIndex, randomEffect) == 0)
    {
      switch (randomEffect)
      {
        case "BadPacing":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(10 + Math.random() * 40));
          break;
        case "Extensive":
          let stackCount = Math.round(Math.random() * 100)
          newState.courses[randomCourseIndex].goal = Math.round(newState.courses[randomCourseIndex].goal * (1 + stackCount / 100));
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, stackCount);
          break;
        case "Mutating":
          itemUtils.addEffectStacksToCourse(newState, randomCourseIndex, randomEffect, Math.round(10 + Math.random() * 10));
          break;
      }
    }
  }

  // Create new quests
  const newQuests: Quest[] = [];
  const questCount = Math.min(4 + newState.block * 2 + Math.floor(Math.random() * 4), 40);
  for (let i = 0; i < questCount; i++)
  {
    newQuests.push(generateQuest(newState));
  }
  newState.quests = newQuests;

  const nextLecture: Lecture = generateLecture(newState);
  newState.nextLecture = nextLecture;

  newState.lecturesLeft = 30;
  newState.examsAttended = false;
  newState.examResults = [];

  newState.log = [{
    icon: Box,
    color: "cyan",
    message: `Welcome to Block ${newState.block}.`,
  }];

  if (newState.block == 1)
  {
    newState.log.push({
      icon: PenOff,
      color: "white",
      message: "First time playing? Click the ?s to read about the game mechanics.",
    })
  }

  if (Object.keys(story).includes(newState.block.toString()))
  {
    // Activate story
    newState.story = newState.block;
  }

  return newState;
}
