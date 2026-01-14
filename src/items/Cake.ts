import { CakeSlice as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Cake",
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
    `**On Use**: Increase your current energy by **${item.level} E**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeUse: (params) => {
    params.state.energy += params.item.level;
    params.logEntry.message = `Energy +${params.item.level} E`;
  },
};
