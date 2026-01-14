import { Snail as ItemIcon } from "lucide-react";
import { type ItemData, type ItemMeta, type ItemBehavior, itemUtils } from "@/item";
import { effectUtils } from "@/effect";

export const itemData: ItemData = {
  name: "Snail",
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
  {
    const list =
      item.memory.courses && item.memory.courses.length > 0
        ? item.memory.courses
          .map((c: any) =>
            ` - ${c.title}: ${c.gainedUnderstandings} U over ${c.roundCount + 1} rounds`
          )
          .join("\n")
        : "- None";

    return `**On Attend**: Increases the Potential Understanding by **${item.level * 10}%**, but it is instead given to you over the course of the next 5 rounds, as long as this item is in your Inventory. Failing to understand any attended lecture from any course within this period will interrupt the process.\n\nCurrently giving U for the following courses:\n${list}`;
  },
  getEnabled: (item, state) => true,
};

export const itemBehavior: ItemBehavior = {
  beforeAttendLecture: (params) =>
  {
    let lastUnderstandings = params.lecture.potentialUnderstandings;
    params.lecture.potentialUnderstandings += Math.round(params.lecture.potentialUnderstandings * params.item.level * 10 / 100);
    params.logEntry.message = `Potential ${lastUnderstandings} U → ${params.lecture.potentialUnderstandings} U`;
  },
  afterAttendLecture: (params) =>
  {
    if (params.result.result == "success")
    {
      if (params.item.memory.courses == null)
        params.item.memory.courses = [];

      params.item.memory.courses.push({ courseIndex: params.lecture.courseIndex, title: params.state.courses[params.lecture.courseIndex].title, gainedUnderstandings: params.result.gainedUnderstandings, roundCount: 4 });

      // Remove the understandings that were gained so that they can be given over time
      params.state.courses[params.lecture.courseIndex].understandings -= params.result.gainedUnderstandings;

      params.logEntry.message = `Now giving ${params.result.gainedUnderstandings} U over 5 rounds`;
    }
  },
  beforeRound: (params) =>
  {
    if (params.item.memory.courses == null)
      return;

    for (let i = params.item.memory.courses.length - 1; i >= 0; i--)
    {
      const course = params.item.memory.courses[i];

      // Check if it is still the same course
      if (params.state.courses[course.courseIndex].title !== course.title)
      {
        params.item.memory.courses.splice(i, 1);
        continue;
      }

      if (course.roundCount === 0)
      {
        // Give all remaining
        params.state.courses[course.courseIndex].understandings += course.gainedUnderstandings;
        params.logEntry.message += `+${course.gainedUnderstandings} U in ${params.state.courses[course.courseIndex].title}, ${5 - course.roundCount}/5\n`;
        params.item.memory.courses.splice(i, 1);
      } else
      {
        // Give some
        const giveUnderstandings = Math.round(course.gainedUnderstandings / 3);
        course.gainedUnderstandings -= giveUnderstandings;
        params.state.courses[course.courseIndex].understandings += giveUnderstandings;
        params.logEntry.message += `+${giveUnderstandings} U in ${params.state.courses[course.courseIndex].title}, ${5 - course.roundCount}/5\n`;
        course.roundCount--;
      }
    }
  },
  afterRound: (params) => {
    if(params.result.action == "attend" && params.result.result == "failure" && params.item.memory.courses != null && params.item.memory.courses.length > 0) {
      params.item.memory.courses = [];
      params.logEntry.message += "Lost all progress";
    }
  },
};