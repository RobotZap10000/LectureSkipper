import { CodeXml as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Schedule Editor",
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
    `**On Attend**: Guarantees that the next **${item.level}** lectures will be about this course.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    effectUtils.addEffectStacksToCourse(params.state, params.lecture.courseIndex, "Guaranteed", params.item.level);

    params.logEntry.message = `Guaranteed ${params.state.courses[params.lecture.courseIndex].title} for ${params.item.level} lectures`;
  },
};
