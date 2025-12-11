import { ZapOff as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "TravelCost",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#2d790aff",
  getBadgeText: (effect, state) => `Travel Cost: $${effect.value}`,
  getDescription: (effect, state) => `Attending this lecture costs **$${effect.value}**.`,
};
