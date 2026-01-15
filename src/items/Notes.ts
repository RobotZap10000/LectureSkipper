import { NotebookPen as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Notes",
  rarity: 2,
  dropWeight: 100,

  // Don't change
  level: 1,
  startingLevel: 1,
  memory: {},
  id: "",
};

export const itemMeta: ItemMeta = {
  icon: ItemIcon,
  getDescription: (item) =>
    `**On Attend**: Increases the Potential Understanding by **${item.level * 10}%**, but increases Energy Cost by **${item.level * 20}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let lastEnergy = params.lecture.energyCost;
    params.lecture.energyCost += Math.round(params.lecture.energyCost * params.item.level * 20 / 100);
    let lastUnderstandings = params.lecture.potentialUnderstandings;
    params.lecture.potentialUnderstandings += Math.round(params.lecture.potentialUnderstandings * params.item.level * 10 / 100);
    params.logEntry.message = `Potential ${lastUnderstandings} U → ${params.lecture.potentialUnderstandings} U and ${lastEnergy} E → ${params.lecture.energyCost} E`;
  },
};