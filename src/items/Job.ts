import { BriefcaseBusiness as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Job",
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
    `**On Skip**: Gain $1 for every Potential Understanding of the lecture that you skipped, multiplied by **${(1 + item.level / 3).toFixed(2)}**.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeSkipLecture: (params) =>
  {
    let cashToAdd = Math.round(params.lecture.potentialUnderstandings * (1 + params.item.level / 3));
    params.state.cash += cashToAdd;
    params.logEntry.message = `+$${cashToAdd}`;
  },
};
