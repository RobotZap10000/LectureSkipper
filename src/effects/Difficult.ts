import { X as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Difficult",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#35004fff",
  getBadgeText: (effect, state) => `Difficult: ${effect.value}%`,
  getDescription: (effect, state) => `Lectures appear with an understand chance of no more than **${effect.value}%**.`,
};
