import { Pizza as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Pizza",
  rarity: 1,
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
    `**On Attend**: reduces the energy cost by **${(itemUtils.geometricSeries(item.level - 1, 0.9, 0.1, 1.0) * 100).toFixed(2)}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let lastEnergy = params.lecture.energyCost;
    params.lecture.energyCost = Math.round((1 - itemUtils.geometricSeries(params.item.level - 1, 0.9, 0.1, 1.0)) * params.lecture.energyCost);
    params.logEntry.message = `Energy Cost ${lastEnergy} E → ${params.lecture.energyCost} E`;
  },
};

