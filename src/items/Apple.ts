import { Apple as ItemIcon } from "lucide-react";
import type { ItemData, ItemMeta, ItemBehavior } from "@/item";

export const item: ItemData = {
  name: "Apple",
  rarity: 1,
  dropWeight: 100,
  level: 1,
  startingLevel: 1,
  
  // Don't change
  memory: {},
  id: "",
};

export const meta: ItemMeta = {
  icon: ItemIcon,
  getDescription: (item) =>
    `**On Attend**: increase your max energy by **${item.level} E**`,
};

export const behavior: ItemBehavior = {
  beforeAttendLecture: (params) => {
    params.state.maxEnergy += params.item.level;
    params.logEntry.message = `Increased max energy by ${params.item.level} E`;
  },
};
