import { CupSoda as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Soda",
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
    `**After Skip**: For the rest of the block, skipping this lecture now gives you **+${item.level * 3} E**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterSkipLecture: (params) =>
  {
    effectUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Soda", params.item.level * 3);
  },
};
