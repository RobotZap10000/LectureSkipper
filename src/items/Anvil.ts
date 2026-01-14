import { Anvil as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Anvil",
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
    `**On Attend**: If there are two unselected items of equal type directly to the left and right of this item in the Inventory, destroys the item on the right and transfers all the levels to the item on the left. Has a **${Math.max(101 - item.level, 0)}%** chance of breaking on use, disabling it until next block.`,
  getEnabled: (item, state) => !itemUtils.getItemUsedThisBlock(item, state),
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let mySlot = itemUtils.itemIDtoSlot(params.item.id, params.state);
    if (mySlot % 6 != 5)
    {
      // Not at the end of the row, so we can continue
      let targetSlot = mySlot - 1;
      let sourceSlot = mySlot + 1;
      let targetItem = params.state.items[targetSlot];
      let sourceItem = params.state.items[sourceSlot];
      if (targetItem != null && params.state.selectedItemIDs.indexOf(targetItem.id) == -1 && sourceItem != null && params.state.selectedItemIDs.indexOf(sourceItem.id) == -1)
      {
        // There are items on both sides
        
        // Are they of equal type?
        if (targetItem.name != sourceItem.name) return;

        // We can upgrade the left one
        params.logEntry.message = `Upgraded ${targetItem.name}, Level ${targetItem.level} →`;

        targetItem.level += sourceItem.level;
        params.state.items[sourceSlot] = null;

        params.logEntry.message += ` ${targetItem.level}`;

        if(Math.random() < (101 - params.item.level) / 100) {
          itemUtils.setItemUsedThisBlock(params.item, params.state);
          params.logEntry.message += " (Broke)";
        }
      }
    }
  },
};
