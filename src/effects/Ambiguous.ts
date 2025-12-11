import { LineSquiggle as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Ambiguous",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#02768bff",
  getBadgeText: (effect, state) => `Ambiguous: ${effect.value}%`,
  getDescription: (effect, state) => `Lectures have a **${effect.value}%** chance of not showing their potential understandings.`,
};
