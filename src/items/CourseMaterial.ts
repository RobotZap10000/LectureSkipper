import { BookCheck as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Course Material",
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
    `**After Attend**: Permanently increases the amount of understandings that lectures of this course give by **+${20 * item.level}%**, but now its lectures are half as likely to appear. Can be used once per block.`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  afterAttendLecture: (params) =>
  {
    itemUtils.setItemUsedThisBlock(params.item, params.state);

    effectUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Prepared", params.item.level * 20);

    params.state.courses[params.lecture.courseIndex].lectureAppearWeight = Math.ceil(params.state.courses[params.lecture.courseIndex].lectureAppearWeight / 2);

    params.logEntry.message = `Permanent +${params.item.level * 20}% U, but lectures are half as frequent`;
  },
};