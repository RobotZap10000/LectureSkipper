import { CirclePlay as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Video",
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
    `**On Attend**: If the Understand Chance is above **${(itemUtils.exponentialPercentage(item.level, 0.03, 0.9, 0.25) * 100).toFixed(2)}%**, it becomes 100%.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    if (params.lecture.understandChance > itemUtils.exponentialPercentage(params.item.level, 0.03, 0.9, 0))
    {
      params.lecture.understandChance = 1;
      params.logEntry.message = `Understand Chance Maximized`;
    }
  },
};
