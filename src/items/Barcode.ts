import { ScanBarcode as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Barcode",
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
    `**On Skip**: adds a 1% discount to a random item in the Shop. Activates **${item.level * 10}** times. Discounts can stack, but will not go past 100%`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterSkipLecture: (params) =>
  {
    if (params.state.shop.length == 0) return;

    let addedDiscounts = 0;
    for (let i = 0; i < params.item.level * 10; i++)
    {
      const randomIndex = Math.floor(Math.random() * params.state.shop.length);
      if (params.state.shop[randomIndex].discount < 1)
      {
        params.state.shop[randomIndex].discount = Math.min(params.state.shop[randomIndex].discount + 0.01, 1);
        addedDiscounts++;
      }
    }
    params.logEntry.message = `Added ${addedDiscounts} discount${addedDiscounts == 1 ? "" : "s"}`;
  },
};
