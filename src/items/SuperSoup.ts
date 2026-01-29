import { Soup as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Super Soup",
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
    `**Always Active**: If a course reaches 500% completion, all other items in your inventory gain **+${item.level}** levels.`,
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeRound: (params) =>
  {
    // Save pre-round Understandings for each course
    params.item.memory.courseUnderstandings = params.state.courses.map((course) => course.understandings);
  },
  afterRound: (params) =>
  {
    // Check if any course went over 500%
    for (let i = 0; i < params.state.courses.length; i++)
    {
      const course = params.state.courses[i];
      const preRoundUnderstandings = params.item.memory.courseUnderstandings[i];
      const postRoundUnderstandings = course.understandings;
      const threshold = course.goal * 5;

      if (postRoundUnderstandings >= threshold && preRoundUnderstandings < threshold)
      {
        // Give all other items levels
        for (let j = 0; j < params.state.items.length; j++)
        {
          const otherItem = params.state.items[j];
          if (otherItem !== null && otherItem !== params.item)
          {
            otherItem.level += params.item.level;
          }
        }
        params.logEntry.message = `All items +${params.item.level} level${params.item.level == 1 ? "" : "s"}`;
        params.logEntry.color = "yellow";
      }
    }
    delete params.item.memory.courseUnderstandings;
  },
};
