import { FileText as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Paper",
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
    `**Consumable**: If attending, increases the Understand Chance by **${Math.min(70 + item.level * 5, 100)}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    params.logEntry.message = `Understand Chance ${(params.lecture.understandChance * 100).toFixed(2)}% →`;
    params.lecture.understandChance = Math.min(params.lecture.understandChance + (70 + params.item.level * 5) / 100, 1);
    params.logEntry.message += `${(params.lecture.understandChance * 100).toFixed(2)}%`;

    // Delete self
    params.state.items[itemUtils.itemIDtoSlot(params.item.id, params.state)] = null;
  },
};
