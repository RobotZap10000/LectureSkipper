import { Bomb as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Collateral",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#a77200ff",
  getBadgeText: (effect, state) => `Collateral: ${effect.value}%`,
  getDescription: (effect, state) => `Attending lectures removes **${effect.value}%** of the understanding that you have on every other course.`,
};
