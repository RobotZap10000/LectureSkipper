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
    `**Before Attend**: Lectures for all courses now give 75% less understanding, but the current amount of lectures left until exams is increased by **${(itemUtils.geometricSeries(item.level - 1, 0.95, 0.1, 1) * 100).toFixed(2)}%**. Can only be used once per block.`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    itemUtils.setItemUsedThisBlock(params.item, params.state);

    for (let i = 0; i < params.state.courses.length; i++)
    {
      let currentUnhelpful = effectUtils.getEffectStacks(params.state, i, "Unhelpful");
      let toAdd = Math.round((100 - currentUnhelpful) * 0.75);
      effectUtils.addEffectStacksToCourse(params.state, i, "Unhelpful", toAdd);
    }

    let lecturesToAdd = Math.ceil(itemUtils.geometricSeries(params.item.level - 1, 0.95, 0.1, 1) * params.state.lecturesLeft);
    params.state.lecturesLeft += lecturesToAdd;
    params.logEntry.message = `+${lecturesToAdd} lectures`;
  },
};
