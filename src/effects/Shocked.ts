import { ZapOff as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Shocked",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#585c00ff",
  getBadgeText: (effect, state) => `Shocked: ${effect.value}%`,
  getDescription: (effect, state) => `Attending this lecture takes **${effect.value}%** more energy. One time only.`,
};
