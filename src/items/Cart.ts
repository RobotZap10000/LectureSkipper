import { ShoppingCart as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";

export const itemData: ItemData = {
  name: "Cart",
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
    `**After Attend**: Whenever this lecture appears, gain **+${item.level * 30}$**. Can only be used once per block`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  afterAttendLecture: (params) =>
  {
    if (itemUtils.getItemUsedThisBlock(params.item, params.state)) return;
    itemUtils.setItemUsedThisBlock(params.item, params.state)

    itemUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Cash", params.item.level * 30);

    params.logEntry.message = `+${params.item.level * 30}$ whenever ${params.state.courses[params.lecture.courseIndex].title} appears`;
  },
};
