import { ShoppingCart as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

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
    `**After Attend**: Until the end of the block, whenever a lecture about this course appears, gain **+$${item.level * 30}**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterAttendLecture: (params) =>
  {
    effectUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Cash", params.item.level * 10);

    params.logEntry.message = `+${params.item.level * 30}$ whenever ${params.state.courses[params.lecture.courseIndex].title} appears`;
  },
};
