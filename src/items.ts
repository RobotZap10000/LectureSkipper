import { Apple, BookCheck, Bot, Brain, CodeXml, Gamepad2, MapPinned, Pizza, ShoppingCart, Terminal, TimerReset } from "lucide-react";
import type { Item, Lecture } from "@/game";

// ----------
// PURE DATA (serializable)
// ----------
export const items: Record<string, Item> = {

  // COMMON

  AI: {
    id: "",
    name: "AI Assistant",
    rarity: 1,
    level: 1,
    startingLevel: 1,
    description: "On attendance: Doubles understand chance but halves understandings gained.",
    icon: Bot,
    memory: {},
  },
  Apple: {
    id: "",
    name: "Apple",
    rarity: 1,
    level: 1,
    startingLevel: 1,
    description: "On attendance: increase your max energy by 1%.",
    icon: Apple,
    memory: [],
  },
  Pizza: {
    id: "",
    name: "Pizza",
    rarity: 1,
    level: 1,
    startingLevel: 1,
    description: "On attendance: lose 25% less energy from that lecture.",
    icon: Pizza,
    memory: [],
  },
  VideoGame: {
    id: "",
    name: "Video Game",
    rarity: 1,
    level: 1,
    startingLevel: 1,
    description: "On skip: gain +5% extra energy",
    icon: Gamepad2,
    memory: [],
  },

  // RARE

  GPS: {
    id: "",
    name: "GPS",
    rarity: 2,
    level: 1,
    startingLevel: 1,
    description: "On attendance: You have a +10% chance of understanding this lecture.",
    icon: MapPinned,
    memory: [],
  },
  Hacking: {
    id: "",
    name: "Hacking",
    rarity: 2,
    level: 1,
    startingLevel: 1,
    description: "On attendance: this lecture cannot appear the next 5 times. Can only be used once per block.",
    icon: Terminal,
    memory: [],
  },
  CourseMaterial: {
    id: "",
    name: "Course Material",
    rarity: 2,
    level: 1,
    startingLevel: 1,
    description: "After attending: permanently 4x the amount of understandings that this lecture gives, but now it's 4x less likely to appear. Can be used once per block.",
    icon: BookCheck,
    memory: [],
  },
  Brain: {
    id: "",
    name: "Brain",
    rarity: 2,
    level: 1,
    startingLevel: 1,
    description: "On attendance: if you understand this lecture, gain all the required Understandings. Otherwise, lose all Understandings. Cannot go past the goal understandings of the course. Can only be used once block.",
    icon: Brain,
    memory: [],
  },
  Cart: {
    id: "",
    name: "Cart",
    rarity: 2,
    level: 1,
    startingLevel: 1,
    description: "After attending: whenever this lecture appears, gain +40$. Can only be used once per block.",
    icon: ShoppingCart,
    memory: [],
  },

  // LEGENDARY

  ScheduleEditor: {
    id: "",
    name: "Schedule Editor",
    rarity: 3,
    level: 1,
    startingLevel: 1,
    description: "On attend: this lecture is now guaranteed to appear the next 5 times. Can only be used once per block.",
    icon: CodeXml,
    memory: [],
  },
  TimeMachine: {
    id: "",
    name: "TimeMachine",
    rarity: 3,
    level: 1,
    startingLevel: 1,
    description: "On attendance: Resets your understandings for this course, but adds +10 lectures.",
    icon: TimerReset,
    memory: [],
  },
};

// ----------
// BONUS FUNCTIONS (not serializable)
// ----------
export const itemBonuses: Record<string, (lecture: Lecture, item: Item) => Lecture> = {
  AI: (lecture) => ({
    ...lecture,
    understandChance: Math.min(lecture.understandChance * 2, 1),
    potentialUnderstandings: Math.floor(lecture.potentialUnderstandings / 2),
  }),
};
