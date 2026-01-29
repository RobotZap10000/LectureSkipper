import { StickyNote as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Sticky Note",
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
    `**Consumable**: If skipping, still gain **${40 + item.level * 10}%** of the Potential Understanding.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  afterSkipLecture: (params) =>
  {
    let gainU = Math.round((40 + params.item.level * 10) * params.lecture.potentialUnderstandings / 100);

    params.state.courses[params.lecture.courseIndex].understandings += gainU;

    params.logEntry.message = `+${gainU} U`;

    // Delete self
    itemUtils.destroyItemWithID(params.item.id, params.state);
  },
};
