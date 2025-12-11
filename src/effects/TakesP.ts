import { Gamepad as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "TakesP",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#a8ac66ff",
  getBadgeText: (effect, state) => `Takes P: ${effect.value} P`,
  getDescription: (effect, state) => `Attending this lecture costs **${effect.value} P**`,
};
