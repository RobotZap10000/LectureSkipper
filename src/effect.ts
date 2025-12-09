import type { LucideIcon } from "lucide-react";
import type { GameState } from "@/game";

export type EffectData = {
  // Set randomly when the Effect is added
  id: string;
  name: string;
  value: number;
};

export type EffectMeta = {
  title: string;
  icon?: LucideIcon;
  backgroundColor: string;
  getDescription: (effect: EffectData, state: GameState) => string;
};