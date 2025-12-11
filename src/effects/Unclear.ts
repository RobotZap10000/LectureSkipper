import { Percent as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Unclear",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#5e5e5eff",
  getBadgeText: (effect, state) => `Unclear: ${effect.value}%`,
  getDescription: (effect, state) => `Lectures have a **${effect.value}%** chance of not showing their understand chance.`,
};
