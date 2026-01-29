import { Headphones as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Headphones",
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
    `**On Attend**: Still gain **${(itemUtils.geometricSeries(item.level - 1, 0.8, 0.5, 1) * 100).toFixed(2)}%** of the Procrastination Value, despite not skipping.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let gainedP = Math.round(params.lecture.procrastinationValue * itemUtils.geometricSeries(params.item.level - 1, 0.8, 0.5, 1));
    params.state.procrastinations += gainedP;
    params.logEntry.message = `+${gainedP} P`;
  },
};
