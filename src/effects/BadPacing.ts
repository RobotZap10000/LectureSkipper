import { Waves as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "BadPacing",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#000000ff",
  getBadgeText: (effect, state) => `Bad Pacing: ${effect.value}%`,
  getDescription: (effect, state) => `If a lecture has an understand chance below **${effect.value}%**, it becomes 0% on attendance`,
};
