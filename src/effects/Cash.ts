import { DollarSign as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Cash",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#ffff00ff",
  getBadgeText: (effect, state) => `Cash: $${effect.value}`,
  getDescription: (effect, state) => `When this lecture appears, gain **$${effect.value}**.`,
};
