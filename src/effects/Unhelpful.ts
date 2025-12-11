import { MoveDown as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Unhelpful",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#4f0000ff",
  getBadgeText: (effect, state) => `Unhelpful: ${effect.value}%`,
  getDescription: (effect, state) => `Lectures give **${effect.value}%** less understanding.`,
};
