import { ToolCase as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Toolbox",
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
    `**Consumable**: Increases the starting level of a random item in the shop by 1. Activates **${item.level * 10}** times.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterUse: (params) =>
  {
    if (params.state.shop.length == 0) return;

    let uniqueItemIDs: string[] = [];
    for (let i = 0; i < params.item.level * 10; i++)
    {
      const randomIndex = Math.floor(Math.random() * params.state.shop.length);
      params.state.shop[randomIndex].item.level++;
      params.state.shop[randomIndex].item.startingLevel++;
      if (!uniqueItemIDs.includes(params.state.shop[randomIndex].item.id))
      {
        uniqueItemIDs.push(params.state.shop[randomIndex].item.id);
      }
    }

    params.logEntry.message = `${uniqueItemIDs.length} Shop item${uniqueItemIDs.length == 1 ? "" : "s"} gained levels`;

    // Delete self
    itemUtils.destroyItemWithID(params.item.id, params.state);
  },
};
