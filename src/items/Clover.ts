import { Clover as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Clover",
  rarity: 3,
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
    `**After Skip**: If the Understand Chance of the next lecture is less than the Understand Chance of this one, carry it over and add **${Math.min(item.level, 100).toFixed(2)}%**`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterSkipLecture: (params) =>
  {
    if (params.state.nextLecture == null) return;

    if (params.state.nextLecture.understandChance < params.lecture.understandChance)
    {
      params.logEntry.message = `Understand Chance ${(params.state.nextLecture.understandChance * 100).toFixed(2)}% →`;
      params.state.nextLecture.understandChance = params.lecture.understandChance + Math.min(params.item.level / 100, 1);
      params.logEntry.message += ` ${(params.state.nextLecture.understandChance * 100).toFixed(2)}%`;
    }
  },
};
