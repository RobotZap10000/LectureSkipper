import type { GameState, Lecture, LectureResult, LogEntry } from "@/game";
import type { LucideIcon } from "lucide-react";

export type ItemData = {
  // Set randomly when the item is made
  id: string;
  name: string;
  rarity: number;
  dropWeight: number;
  level: number;
  startingLevel: number;
  // Used by items to keep track of their functionality throughout the game
  memory: {}
};

// Non-serializable item metadata (icon, dynamic description, etc.)
export type ItemMeta = {
  icon: LucideIcon;
  getDescription: (item: ItemData) => string;
};

export type BeforeHookParams = {
  state: GameState;
  item: ItemData;
  lecture: Lecture | null;
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

