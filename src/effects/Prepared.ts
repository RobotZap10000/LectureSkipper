import { BookCheck as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Prepared",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#aaf2ffff",
  getBadgeText: (effect, state) => `Prepared: ${effect.value}%`,
  getDescription: (effect, state) => `Lectures give **${effect.value}%** more understanding.`,
};
