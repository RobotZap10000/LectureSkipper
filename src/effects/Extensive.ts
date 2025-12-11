import { LibraryBig as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Extensive",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#000000ff",
  getBadgeText: (effect, state) => `Extensive: ${effect.value}%`,
  getDescription: (effect, state) => `This course has a goal that is **${effect.value}%** higher than normal.`,
};
