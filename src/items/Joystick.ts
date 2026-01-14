import { Joystick as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Joystick",
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
    `**On Skip**: increases its own level by 1, then has a **${Math.min(item.level, 100)}%** chance of giving you double the Procrastinations from this lecture.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeSkipLecture: (params) =>
  {
    params.item.level += 1;
    params.logEntry.message = `Level ${params.item.level - 1} → ${params.item.level}`;

    if (Math.random() < params.item.level * 0.01)
    {
      params.lecture.procrastinationValue *= 2;
      params.logEntry.message += `, doubled Procrastinations! +${params.lecture.procrastinationValue} P`;
    }
  },
};
