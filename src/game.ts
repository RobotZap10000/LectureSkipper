import { Box, Check, DollarSign, StepForward, X, type LucideProps } from "lucide-react";
import Mustache from "mustache";
import chroma from "chroma-js";
import { behaviorRegistry, itemMetaRegistry } from "@/itemRegistry";
import { itemUtils, type ItemData } from "./item";

export type Course = {
  title: string;
  color: string;
  understandings: number;
  goal: number;
  effects: Record<string, number>;

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
  requirements: Currency[];
  rewards: Currency[];
  color: string;
};

export interface LogEntry
{
  icon: React.ComponentType<LucideProps>;
  color: string;
  message: string;
}

export type GameState = {
  saveVersion: number;

  // General Game
  block: number;
  lecturesLeft: number;
  courses: Course[];
  nextLecture: Lecture | null;
  score: number;

  // Menus
  examsAttended: boolean;
  examResults: boolean[];
  log: LogEntry[];
  quests: Quest[];
  unboxedItem: ItemData | null;
  selectedItemSlots: number[];

  // Player Stats
  energy: number;
  maxEnergy: number;
  energyPerSkip: number;
  cash: number;
  procrastinations: number;
  items: (ItemData | null)[]; // 36 slots
  maxActivatedItems: number;
};

// Initial state generator
export function initGame(): GameState
{
  let game: GameState = {
    saveVersion: CURRENT_SAVE_VERSION,

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
    selectedItemSlots: [],
    quests: [],
    log: [],
    examsAttended: true,
    examResults: [],
    score: 0,
  };

  game = startNewBlock(game);

  return game;
};

const LOCAL_STORAGE_KEY = "myGameState";
const CURRENT_SAVE_VERSION = 1;

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
 * If nothing exists or parsing fails, return a fresh game state.
 */
export function loadGame(): GameState
{
  try
  {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return initGame();

    const parsed: GameState = JSON.parse(data);

    parsed.log = [];

    return parsed;
  } catch (err)
  {
    console.error("Failed to load game from localStorage:", err);
    return initGame();
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

  newState.log = [];

  // BEFORE ROUND HOOKS
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

    if (newState.selectedItemSlots.includes(i) == false) continue;

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

  // AFTER ROUND HOOKS
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

    if (newState.selectedItemSlots.includes(i) == false) continue;

    if (behaviorRegistry[item.name].afterUse !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterUse!({ state: newState, item, lecture, nextLecture: newState.nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "skip" && behaviorRegistry[item.name].afterSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterSkipLecture!({ state: newState, item, lecture, nextLecture: newState.nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (action == "attend" && behaviorRegistry[item.name].afterAttendLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterAttendLecture!({ state: newState, item, lecture, nextLecture: newState.nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
  }

  newState.log.reverse();

  // Deselect items that were disabled during the round
  newState.selectedItemSlots = newState.selectedItemSlots.filter(slotID => newState.items[slotID] !== null && itemMetaRegistry[newState.items[slotID].name].getEnabled(newState.items[slotID], newState));

  saveGame(newState);

  return newState;
}

export function generateUUID(): string
{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) =>
  {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

  saveGame(newState);

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
];

const courseTopics = [
  "Introductions",
  "Fundamentals",
  "Applications",
  "Principles",
  "Modernity",

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

  return {
    title,
    goal: 10 * state.block + Math.round(courseDifficulty * (3 ** state.block)),
    understandings: 0,
    color: chroma.hsv(hue, 1, 0.25).hex(),
    effects: {},
    maxUnderstandingsPerLecture: 10 * state.block + Math.round(courseDifficulty * (2 ** state.block)),
    maxProcrastinationsPerLecture: 10 * state.block + Math.round(courseDifficulty * state.block * 20),
    maxEnergyCostPerLecture: 10 * state.block
  };
}

function generateQuest(state: GameState): Quest
{
  let requirements: Currency[] = [];
  let rewards: Currency[] = [];
  let colors = [];

  // U requirement comes from questDifficulty * targetCourse.goal
  // effectively "how many courses worth of U is required to complete this quest?"
  let x = Math.random();
  let questDifficulty = 4 ** x - 0.9;
  // min - 0.30679
  // max - 4

  // Generating requirements
  let randomCourseIndex = Math.floor(Math.random() * state.courses.length);
  let targetCourse = state.courses[randomCourseIndex];

  requirements.push({
    type: "understandings",
    amount: Math.round(questDifficulty * targetCourse.goal),
    courseIndex: randomCourseIndex
  });
  colors.push(targetCourse.color);

  if (Math.random() < 0.25)
  {
    requirements.push({
      type: "procrastinations",
      amount: Math.round(targetCourse.maxProcrastinationsPerLecture * questDifficulty)
    });
  }

  // Generating rewards
  rewards.push({
    type: "cash",
    amount: Math.round(50 + 20 * state.block + (10 * state.block) ** questDifficulty)
  });

  if (questDifficulty > 1 && Math.random() < 0.25)
  {
    rewards.push({
      type: "maxActivatedItems",
      amount: 1,
    });
  }

  return {
    id: generateUUID(),
    requirements: requirements,
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

  let startHour = Math.floor(9 + Math.random() * 12 + state.block);
  let endHour = startHour + Math.min(2 ** state.block, 1000);

  const lecture: Lecture = {
    courseIndex: courseIndex,
    startTime: `${startHour}:00`,
    endTime: `${endHour}:00`,
    potentialUnderstandings: Math.ceil(Math.random() * state.courses[courseIndex].maxUnderstandingsPerLecture),
    understandChance: Math.random(),
    energyCost: Math.ceil(Math.random() * state.courses[courseIndex].maxEnergyCostPerLecture),
    procrastinationValue: Math.ceil(Math.random() * state.courses[courseIndex].maxProcrastinationsPerLecture),
  };

  if (itemUtils.getEffectStacks(state, lecture.courseIndex, "Cash") > 0)
  {
    state.cash += itemUtils.getEffectStacks(state, lecture.courseIndex, "Cash");
    state.log.push({ icon: DollarSign, color: "white", message: `+${itemUtils.getEffectStacks(state, lecture.courseIndex, "Cash")}$` });
  }

  return lecture;
}

export function startNewBlock(state: GameState): GameState
{
  if (!state.examsAttended) return state;

  const newState: GameState = { ...state };

  newState.block += 1;

  const hues: number[] = [];
  const minDistance = 25;
  while (hues.length < 3)
  {
    const h = Math.floor(Math.random() * 360);
    if (hues.every(existing => Math.abs(existing - h) >= minDistance &&
      Math.abs(existing - h) <= 360 - minDistance))
    {
      hues.push(h);
    }
  }

  // Create 3 new courses
  const newCourses: Course[] = [
    generateCourse(newState, hues[0]),
    generateCourse(newState, hues[1]),
    generateCourse(newState, hues[2]),
  ];
  newState.courses = newCourses;

  // Create new quests (example)
  const newQuests: Quest[] = [];
  const questCount = Math.min(4 + newState.block * 2 + Math.floor(Math.random() * 4), 40);
  for (let i = 0; i < questCount; i++)
  {
    newQuests.push(generateQuest(newState));
  }
  newState.quests = newQuests;

  const nextLecture: Lecture = generateLecture(newState);
  newState.nextLecture = nextLecture;

  newState.lecturesLeft = 28 + state.block * 2;
  newState.examsAttended = false;
  newState.examResults = [];

  newState.log = [{
    icon: Box,
    color: "cyan",
    message: `Welcome to Block ${newState.block}.`,
  }];

  saveGame(newState);

  return newState;
}
