import { MapPinned as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "GPS",
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
    `**On Attend**: The chance of understanding this lecture is increased by **+${(itemUtils.geometricSeries(item.level - 1, 0.975, 0.05, 1) * 100).toFixed(2)}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    params.logEntry.message = `Understand Chance ${(params.lecture.understandChance * 100).toFixed(2)}% →`;
    params.lecture.understandChance = Math.min(params.lecture.understandChance + itemUtils.geometricSeries(params.item.level - 1, 0.95, 0.05, 0.5), 1);
    params.logEntry.message += ` ${(params.lecture.understandChance * 100).toFixed(2)}%`;
  },
};