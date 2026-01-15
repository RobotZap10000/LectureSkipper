import { GamepadDirectional as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Video Game",
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
    `**On Skip**: Gain **${Math.min(item.level * 5)}%** extra Procrastination.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeSkipLecture: (params) =>
  {
    params.logEntry.message = `Procrastinations ${params.lecture.procrastinationValue} P →`;
    params.lecture.procrastinationValue += Math.round(params.lecture.procrastinationValue * ((params.item.level * 5) / 100));
    params.logEntry.message += ` ${params.lecture.procrastinationValue} P`;
  },
};
