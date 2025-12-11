import { Flame as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Frying",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#ffbf00ff",
  getBadgeText: (effect, state) => `Frying: ${effect.value}%`,
  getDescription: (effect, state) => `After attending a lecture about this course, the next lecture (from any course) will have an understand chance of **${effect.value}%**.`,
};
