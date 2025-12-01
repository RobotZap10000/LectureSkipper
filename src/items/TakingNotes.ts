import { NotebookPen as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";

export const itemData: ItemData = {
  name: "Taking Notes",
  rarity: 2,
  dropWeight: 50,

  // Don't change
  level: 1,
  startingLevel: 1,
  memory: {},
  id: "",
};

export const itemMeta: ItemMeta = {
  icon: ItemIcon,
  getDescription: (item) =>
    `**On Attend**: Makes the lecture give **${item.level*10}%** more understanding, but the energy cost will increase by **${(item.level+1)*10}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    
    let lastEnergy = params.lecture.energyCost;
    params.lecture.energyCost += Math.floor(params.lecture.energyCost * (params.item.level+1)/10);
    let lastUnderstandings = params.lecture.potentialUnderstandings;
    params.lecture.potentialUnderstandings += Math.floor(params.lecture.potentialUnderstandings * params.item.level/10);
    params.logEntry.message = `Lecture ${lastUnderstandings} U → ${params.lecture.potentialUnderstandings} U and ${lastEnergy} E → ${params.lecture.energyCost} E`;
  },
};