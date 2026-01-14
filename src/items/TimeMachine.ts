import { Rewind as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Time Machine",
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
    `**Before Attend**: Lectures for this course now give half as much understanding, but **${item.level}** lectures are added to the block. Can only be used once per block.`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    itemUtils.setItemUsedThisBlock(params.item, params.state);

    params.state.lecturesLeft += params.item.level;
    
    let currentUnhelpful = effectUtils.getEffectStacks(params.state, params.lecture.courseIndex, "Unhelpful");
    let toAdd = Math.round((100 - currentUnhelpful) / 2);
    effectUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Unhelpful", toAdd);

    params.logEntry.message = `+${params.item.level} lectures`;
  },
};
