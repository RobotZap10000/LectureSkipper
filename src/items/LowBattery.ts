import { BatteryWarning as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Low Battery",
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
    `**On Skip**: Reduce the Understanding requirements of all chats in the Group Chat by **${(itemUtils.geometricSeries(item.level - 1, 0.999, 0.025, 1) * 100).toFixed(2)}%**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeSkipLecture: (params) =>
  {
    let reducedCount = 0;
    let reduceMultiplier = 1 - itemUtils.geometricSeries(params.item.level - 1, 0.999, 0.025, 1);
    for (let i = 0; i < params.state.quests.length; i++)
    {
      let quest = params.state.quests[i];
      let countedThisQuest = false;
      for (let j = 0; j < quest.costs.length; j++)
      {
        if (quest.costs[j].type == "understandings")
        {
          quest.costs[j].amount = Math.floor(quest.costs[j].amount * reduceMultiplier);
          if (countedThisQuest == false)
          {
            reducedCount++;
            countedThisQuest = true;
          }
        }
      }
    }

    params.logEntry.message = `Reduced the U costs of ${reducedCount} chat${reducedCount == 1 ? "" : "s"}.`;
  },
};
