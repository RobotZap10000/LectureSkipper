import { CodeXml as EffectIcon } from "lucide-react";
import type { EffectData, EffectMeta } from "@/effect";

export const effectData: EffectData = {
  name: "Guaranteed",

  // Dont change
  value: 1,
  id: "",
};

export const effectMeta: EffectMeta = {
  icon: EffectIcon,
  backgroundColor: "#e6a939ff",
  getBadgeText: (effect, state) => `Guaranteed: ${effect.value}`,
  getDescription: (effect, state) => `The next **${effect.value}** lectures will be about this course.`,
};
