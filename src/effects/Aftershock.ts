import { ZapOff as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Aftershock",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#585c00ff",
  getBadgeText: (effect, state) => `Aftershock: ${effect.value}%`,
  getDescription: (effect, state) => `After attending a lecture about this course, the next lecture (from any course) will take **${effect.value}%** more energy.`,
};
