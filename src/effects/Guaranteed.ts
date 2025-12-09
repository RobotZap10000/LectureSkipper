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
  title: "Guaranteed",
  backgroundColor: "#e6a939ff",
  getDescription: (effect, state) => `The next **${effect.value}** lectures will be about this course.`,
};
