import type { LucideIcon } from "lucide-react";
import { itemBonuses, items } from "@/items";
import Mustache from "mustache";
import chroma from "chroma-js";

export type Course = {
  title: string;
  color: string;
  understandings: number;
  goal: number;
  effects: { name: string; count: number }[];
};

export type Lecture = {
  title: string;
  startTime: string;
  endTime: string;
  potentialUnderstandings: number;
  understandChance: number; // 0-1
  timeCost: number;
  procrastinationValue: number;
};

export type Item = {
  id: string;
  name: string;
  level: number;
  startingLevel: number;
  description: string;
  icon: LucideIcon;
  // Used by items to keep track of their functionality throughout the game
  memory: string[];
};

export type Currency =
  { type: "cash"; amount: number }
  | { type: "understandings"; courseIndex: number; amount: number }
  | { type: "procrastinations"; amount: number };

export type Quest = {
  id: string;
  requirements: Currency[];
  rewards: Currency[];
};

export type GameState = {
  // General Game
  block: number;
  lecturesLeft: number;
  courses: Course[];
  nextLecture: Lecture | null;

  // Menus
  examsAttended: boolean;
  examResults: boolean[];
  log: string[];
  quests: Quest[];
  unboxedItem: Item | null;
  forgeItem: Item | null;
  selectedItemSlots: number[];

  // Player Stats
  energy: number;
  maxEnergy: number;
  energyPerSkip: number;
  cash: number;
  procrastinations: number;
  items: (Item | null)[]; // 36 slots
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
    unboxedItem: null,
    forgeItem: null,
    selectedItemSlots: [],
    quests: [],
    log: ["Welcome to Lecture Skipper!"],
    examsAttended: true,
    examResults: [],
  };

  game = startNewBlock(game);

  return game;
};

// Generate a random lecture
export function generateLecture(game: GameState): Lecture
{
  const courseNames = game.courses.map((c) => c.title);
  const course = courseNames[Math.floor(Math.random() * 3)];
  const lecture = {
    title: `${course} Lecture`,
    startTime: "09:00",
    endTime: "10:00",
    potentialUnderstandings: Math.floor(Math.random() * 10) + 5,
    understandChance: Math.random() * 0.5 + 0.25, // 25%-75%
    timeCost: Math.floor(Math.random() * 10) + 5,
    procrastinationValue: Math.floor(Math.random() * 5) + 1,
  };
  game.nextLecture = lecture;
  return lecture;
}

// Apply lecture result
export function attendLecture(state: GameState): GameState
{
  if (!state.nextLecture) return state;
  if (state.energy < state.nextLecture.timeCost) return state;

  let lecture = state.nextLecture;

  // Apply item bonuses
  state.selectedItemSlots.forEach((itemSlotID) =>
  {
    const bonusFn = itemBonuses[items[itemSlotID].name];
    if (bonusFn)
    {
      lecture = bonusFn(lecture, items[itemSlotID]);
    }
  });

  const gainedUnderstandings =
    Math.random() < lecture.understandChance
      ? Math.floor(lecture.potentialUnderstandings)
      : 0;

  const courseIndex = state.courses.findIndex((c) =>
    lecture.title.includes(c.title)
  );

  const newCourses = [...state.courses];
  if (courseIndex >= 0)
  {
    newCourses[courseIndex] = {
      ...newCourses[courseIndex],
      understandings: newCourses[courseIndex].understandings + gainedUnderstandings,
    };
  }

  const logMessage =
    gainedUnderstandings > 0
      ? `Attended ${lecture.title}, gained ${gainedUnderstandings} Understandings.`
      : `Attended ${lecture.title}, but gained no Understandings.`;

  return {
    ...state,
    courses: newCourses,
    energy: state.energy - lecture.timeCost,
    lecturesLeft: state.lecturesLeft - 1,
    log: [logMessage, ...state.log],
    nextLecture: state.lecturesLeft - 1 > 0 ? generateLecture(state) : null,
    selectedItemSlots: [],
  };
}

export function skipLecture(state: GameState): GameState
{
  if (!state.nextLecture) return state;

  const lecture = state.nextLecture;

  let newEnergy = state.energy;

  if ((state.energy / state.maxEnergy) < 0.5)
  {
    newEnergy = Math.min(state.energy + state.energyPerSkip, state.maxEnergy)
  } else
  {
    newEnergy = Math.max(state.energy + Math.round(state.energyPerSkip / 2), state.maxEnergy)
  }

  return {
    ...state,
    energy: newEnergy,
    procrastinations: state.procrastinations + lecture.procrastinationValue,
    lecturesLeft: state.lecturesLeft - 1,
    log: [`Skipped ${lecture.title}, gained ${lecture.procrastinationValue} Procrastination.`, ...state.log],
    nextLecture: state.lecturesLeft - 1 > 0 ? generateLecture(state) : null,
  };
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

  // Calculate results
  const results = state.courses.map(c =>
  {
    const passChance = Math.min(c.understandings / c.goal, 1);
    return Math.random() < passChance;
  });

  const fails = results.filter(r => !r).length;

  const logMessage =
    fails >= 2
      ? `You failed ${fails} exams.`
      : `You passed ${results.filter(r => r).length} exams.`;

  return {
    ...state,
    examsAttended: true,
    examResults: results,
    log: [logMessage, ...state.log],
  };
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

export function generateCourse(state: GameState): Course
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
      Math.random() * 360, // random hue 0–360
      1,                 // saturation (0–1)
      0.25                 // value/brightness (0–1)
    ).hex(),
    effects: [],
  };
}


function generateQuest(state: GameState): Quest
{
  return {
    id: generateUUID(),
    requirements: [
      { type: "procrastinations", amount: 5 + state.block * 2 }
    ],
    rewards: [
      { type: "cash", amount: 10 + state.block * 3 }
    ],
  };
}

export function startNewBlock(state: GameState): GameState
{
  if (!state.examsAttended) return state;

  state.block += 1;

  // Create 3 new courses
  const newCourses: Course[] = [
    generateCourse(state),
    generateCourse(state),
    generateCourse(state),
  ];

  // Create new quests (example)
  const newQuests: Quest[] = [
    generateQuest(state),
    generateQuest(state),
  ];

  state.courses = newCourses;
  state.quests = newQuests;

  const nextLecture: Lecture = generateLecture(state);

  return {
    ...state,
    block: state.block,
    courses: newCourses,
    quests: newQuests,

    // Reset lectures for the new block
    lecturesLeft: 12, // or whatever your block size should be
    nextLecture: nextLecture,

    // Reset exam state
    examsAttended: false,
    examResults: [],

    log: [
      `Welcome to Block ${state.block + 1}.`,
      ...state.log,
    ],
  };
}
