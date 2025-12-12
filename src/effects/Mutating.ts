import { RefreshCcwDot as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Mutating",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#000000ff",
  getBadgeText: (effect, state) => `Mutating: ${effect.value}%`,
  getDescription: (effect, state) => `Whenever a lecture about this course appears, lose **${effect.value}%** of your current U for this course.`,
};
