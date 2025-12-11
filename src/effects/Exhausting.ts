import { BrainCircuit as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Exhausting",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#663062ff",
  getBadgeText: (effect, state) => `Exhausting: ${effect.value}%`,
  getDescription: (effect, state) => `Attending lectures takes **${effect.value}%** more energy.`,
};
