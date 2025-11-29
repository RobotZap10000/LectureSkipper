import { Box, Check, StepForward, X, type LucideProps } from "lucide-react";
import Mustache from "mustache";
import chroma from "chroma-js";
import { behaviorRegistry, itemMetaRegistry } from "@/itemRegistry";
import type { ItemData } from "./item";

export type Course = {
  title: string;
  color: string;
  understandings: number;
  goal: number;
  effects: { name: string; count: number }[];

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
  | { type: "procrastinations"; amount: number };

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
  // General Game
  block: number;
  lecturesLeft: number;
  courses: Course[];
  nextLecture: Lecture | null;

  // Menus
  examsAttended: boolean;
  examResults: boolean[];
  log: LogEntry[];
  quests: Quest[];
  unboxedItem: ItemData | null;
  forgeItem: ItemData | null;
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
    block: 0,
    lecturesLeft: 0,
    courses: [],
    cash: 1000,
    procrastinations: 35,
    energy: 100,
    maxEnergy: 100,
    energyPerSkip: 5,
    nextLecture: null,
    items: Array(36).fill(null),
    maxActivatedItems: 3,
    unboxedItem: null,
    forgeItem: null,
    selectedItemSlots: [],
    quests: [],
    log: [],
    examsAttended: true,
    examResults: [],
  };

  game = startNewBlock(game);

  return game;
};

export function generateLecture(game: GameState): Lecture
{
  const courseIndex = Math.floor(Math.random() * 3);
  const lecture: Lecture = {
    courseIndex: courseIndex,
    startTime: "09:00",
    endTime: "10:00",
    potentialUnderstandings: Math.ceil(Math.random() * game.courses[courseIndex].maxUnderstandingsPerLecture),
    understandChance: Math.random() * 0.99 + 0.01,
    energyCost: Math.ceil(Math.random() * game.courses[courseIndex].maxEnergyCostPerLecture),
    procrastinationValue: Math.ceil(Math.random() * game.courses[courseIndex].maxProcrastinationsPerLecture),
  };
  return lecture;
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
    if (behaviorRegistry[item.name].beforeSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].beforeSkipLecture!({ state: newState, item, lecture, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (behaviorRegistry[item.name].beforeAttendLecture !== undefined)
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
        ? newState.energyPerSkip
        : Math.round(newState.energyPerSkip / 2);

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

  // Generate next lecture
  newState.nextLecture = newState.lecturesLeft > 0 ? generateLecture(newState) : null;

  // Log
  const courseTitle = newState.courses[lecture.courseIndex].title;
  if (action == "attend")
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: Check, color: "LawnGreen", message: `+${lectureResult.gainedUnderstandings} Understandings in ${courseTitle}.` }
      : { icon: X, color: "red", message: `Could not understand ${courseTitle}.` });
  } else
  {
    newState.log.push(lectureResult.result == "success"
      ? { icon: StepForward, color: "gray", message: `Skipped ${courseTitle}.` }
      : { icon: X, color: "red", message: `Could not skip ${courseTitle}.` });
  }

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
    if (behaviorRegistry[item.name].afterSkipLecture !== undefined)
    {
      let itemLogEntry: LogEntry = {
        icon: itemMetaRegistry[item.name].icon, color: "white", message: ""
      };
      behaviorRegistry[item.name].afterSkipLecture!({ state: newState, item, lecture, nextLecture: newState.nextLecture, result: lectureResult, logEntry: itemLogEntry });
      if (itemLogEntry.message !== "")
        newState.log.push(itemLogEntry);
    }
    if (behaviorRegistry[item.name].afterAttendLecture !== undefined)
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

export function attendExams(state: GameState): GameState
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

  return newState;
}

const courseTemplates = [
  "Introduction to {{topic}}",
  "Advanced {{topic}}",
  "Fundamental {{topic}}",
  "Applied {{topic}}",
  "Principles of {{topic}}",
  "Modern {{topic}}",
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

  return {
    title,
    goal: 10 + state.block * 2,
    understandings: 0,
    color: chroma.hsv(
      hue, // random hue 0–360
      1,                 // saturation (0–1)
      0.25                 // value/brightness (0–1)
    ).hex(),
    effects: [],
    maxUnderstandingsPerLecture: 5,
    maxProcrastinationsPerLecture: 5,
    maxEnergyCostPerLecture: 5
  };
}

function generateQuest(state: GameState): Quest
{
  let requirements: Currency[] = [];
  let rewards: Currency[] = [];
  let colors = [];

  // Generating requirements
  let randomCourseIndex = Math.floor(Math.random() * state.courses.length);
  requirements.push({
    type: "understandings",
    amount: 5 + state.block * 2,
    courseIndex: randomCourseIndex
  });
  colors.push(state.courses[randomCourseIndex].color);

  if (Math.random() < 0.25)
  {
    requirements.push({
      type: "procrastinations",
      amount: 5 + state.block * 2
    });
  }

  // Generating rewards
  rewards.push({
    type: "cash",
    amount: 10 + state.block * 3
  });

  return {
    id: generateUUID(),
    requirements: requirements,
    rewards: rewards,
    color: chroma.average(colors).hex(),
  };
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
  const newQuests: Quest[] = [
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
    generateQuest(newState),
  ];
  newState.quests = newQuests;

  const nextLecture: Lecture = generateLecture(newState);
  newState.nextLecture = nextLecture;

  newState.lecturesLeft = 12;
  newState.examsAttended = false;
  newState.examResults = [];

  newState.log = [{
    icon: Box,
    color: "cyan",
    message: `Welcome to Block ${newState.block}.`,
  }];

  return newState;
}
