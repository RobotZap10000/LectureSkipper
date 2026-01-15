import { Wallet as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Wallet",
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
    `**On Attend**: Gain **$${item.level * 5 + 20}**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) => {
    params.state.cash += params.item.level * 5 + 20;
    params.logEntry.message = `+$${params.item.level * 5 + 20}`;
  },
};
