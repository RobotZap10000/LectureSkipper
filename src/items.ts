import { Brain } from "lucide-react";
import type { Item } from "@/game";
import type { Lecture } from "@/game";

// ----------
// PURE DATA (serializable)
// ----------
export const items: Record<string, Item> = {
  AI: {
    id: "AI",
    name: "AI Assistant",
    level: 1,
    startingLevel: 1,
    description: "Doubles understand chance but halves understandings gained.",
    icon: Brain,
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
