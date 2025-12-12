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
  backgroundColor: "#c1b400ff",
  getBadgeText: (effect, state) => `Shocked: ${effect.value}%`,
  getDescription: (effect, state) => `This lecture takes **${effect.value}%** more energy. One time only.`,
};
