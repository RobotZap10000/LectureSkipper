import { PersonStanding as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Friend",
  rarity: 2,
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
    `**On Attend**: Eats the item in the slot directly to the right of it in the Inventory, if that item is not selected. If it gets to eat an item, gives you **${item.level * 10} P and $${item.level * 10}**, multiplied by the eaten item's level.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let mySlot = itemUtils.itemIDtoSlot(params.item.id, params.state);
    if (mySlot % 6 != 5)
    {
      // Not at the end of the row, so we can continue
      let targetSlot = mySlot + 1;
      let targetItem = params.state.items[targetSlot];
      if (targetItem != null && params.state.selectedItemIDs.indexOf(targetItem.id) == -1)
      {
        // There is an item in the next slot, so we can eat it

        let increaseP = params.item.level * 10 * targetItem.level;
        let increaseCash = params.item.level * 10 * targetItem.level;

        params.logEntry.message = `Ate ${targetItem.name}, +${increaseP} P and $${increaseCash}`;

        params.state.procrastinations += increaseP;
        params.state.cash += increaseCash;

        params.state.items[targetSlot] = null;
      }
    }
  },
};
