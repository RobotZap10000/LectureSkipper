import { Brain as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Brain",
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
    `**After Attend**: If you understood this lecture, gain **${item.level}** times the amount of Understanding you need for this course. Otherwise, lose all U for this course. Can only be used once per block.`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  afterAttendLecture: (params) =>
  {
    itemUtils.setItemUsedThisBlock(params.item, params.state);

    if(params.result.result == "success") {
      let addU = params.state.courses[params.lecture.courseIndex].goal * params.item.level;
      params.state.courses[params.lecture.courseIndex].understandings += addU;
      params.logEntry.message = `+${addU} U`;
    } else {
      params.state.courses[params.lecture.courseIndex].understandings = 0;
      params.logEntry.message = `Failed`;
    }
  },
};
