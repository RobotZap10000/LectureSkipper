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
  title: "Cash",
  backgroundColor: "#ffff00ff",
  getDescription: (effect, state) => `When this lecture appears, gain **$${effect.value}**.`,
};
