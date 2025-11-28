import type { LucideIcon } from "lucide-react";
import { itemBonuses } from "@/items";
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
  courseIndex: number;
  startTime: string;
  endTime: string;
  potentialUnderstandings: number;
  understandChance: number; // 0-1
  timeCost: number;
  procrastinationValue: number;
};

export type Item = {
  // Set randomly when the item is made
  id: string;
  name: string;
  rarity: number;
  level: number;
  startingLevel: number;
  description: string;
  icon: LucideIcon;
  // Used by items to keep track of their functionality throughout the game
  memory: object;
};

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
    potentialUnderstandings: Math.floor(Math.random() * 10) + 5 * game.block,
    understandChance: Math.random() * 0.99 + 0.01,
    timeCost: Math.floor(Math.random() * 10) + 5,
    procrastinationValue: Math.floor(Math.random() * 5) + 1,
  };
  return lecture;
}

export function attendLecture(state: GameState): GameState
{
  if (!state.nextLecture) return state;
  if (state.energy < state.nextLecture.timeCost) return state;

  const newState: GameState = { ...state };
  let lecture = { ...newState.nextLecture! };

  // Apply item bonuses
  newState.selectedItemSlots.forEach((itemSlotID) =>
  {
    const item = newState.items[itemSlotID];
    if (!item) return;

    const bonusFn = itemBonuses[item.name];
    if (bonusFn)
    {
      lecture = bonusFn(lecture, item);
    }
  });

  const gainedUnderstandings = Math.random() < lecture.understandChance ? lecture.potentialUnderstandings : 0;

  // Update course
  if (lecture.courseIndex >= 0)
  {
    newState.courses = [...newState.courses];
    const oldCourse = newState.courses[lecture.courseIndex];

    newState.courses[lecture.courseIndex] = {
      ...oldCourse,
      understandings: oldCourse.understandings + gainedUnderstandings,
    };
  }

  // Build log
  const courseTitle = newState.courses[lecture.courseIndex].title;

  const logMessage =
    gainedUnderstandings > 0
      ? `+${gainedUnderstandings} Understandings in ${courseTitle}.`
      : `Could not understand ${courseTitle}.`;

  newState.log = [logMessage, ...newState.log];

  // Update basic stats
  newState.energy -= lecture.timeCost;
  newState.lecturesLeft -= 1;

  // Generate next lecture
  newState.nextLecture = newState.lecturesLeft > 0 ? generateLecture(newState) : null;

  return newState;
}


export function skipLecture(state: GameState): GameState
{
  if (!state.nextLecture) return state;

  const newState: GameState = { ...state };
  let lecture = { ...newState.nextLecture! };

  let newEnergy = newState.energy;
  if ((newState.energy / newState.maxEnergy) < 0.5)
  {
    newEnergy = Math.min(newState.energy + newState.energyPerSkip, newState.maxEnergy)
  } else
  {
    newEnergy = Math.min(newState.energy + Math.round(newState.energyPerSkip / 2), newState.maxEnergy)
  }

  newState.energy = newEnergy;
  newState.procrastinations += lecture.procrastinationValue;
  newState.lecturesLeft--;
  newState.log = [`Skipped ${newState.courses[lecture.courseIndex].title}.`, ...newState.log];

  // Generate next lecture
  newState.nextLecture = newState.lecturesLeft > 0 ? generateLecture(newState) : null;

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

  // Calculate results
  const results = newState.courses.map(c =>
  {
    const passChance = Math.min(c.understandings / c.goal, 1);
    return Math.random() <= passChance;
  });

  const logMessage = `You passed ${results.filter(r => r).length} exams.`;

  newState.examsAttended = true;
  newState.examResults = results;
  newState.log = [logMessage, ...newState.log];

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

  if(Math.random() < 0.25) {
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

  // Create 3 new courses
  const newCourses: Course[] = [
    generateCourse(newState),
    generateCourse(newState),
    generateCourse(newState),
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

  const nextLecture: Lecture = generateLecture(state);
  newState.nextLecture = nextLecture;

  newState.lecturesLeft = 12;
  newState.examsAttended = false;
  newState.examResults = [];

  newState.log = [`Welcome to Block ${newState.block}.`, ...newState.log,];

  return newState;
}
