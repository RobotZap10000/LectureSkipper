import Inventory from "@/components/Inventory";
import { saveGame, type GameState, type Quest } from "../game";
import type { Dispatch, SetStateAction } from "react";
import { MessageCircle, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import chroma from "chroma-js";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { CustomButton } from "@/components/CustomButton";
import { CoursesCard } from "@/components/CoursesCard";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ChatView({ game, setGame }: Props)
{
  const haveCosts = (quest: Quest): boolean =>
  {
    return quest.costs.every((req) =>
    {
      if (req.type === "understandings" && req.courseIndex !== undefined)
        return game.courses[req.courseIndex].understandings >= req.amount;
      if (req.type === "procrastinations")
        return game.procrastinations >= req.amount;
      if (req.type === "cash")
        return game.cash >= req.amount;
      if (req.type === "maxActivatedItems")
        return game.maxActivatedItems >= req.amount;
      return false;
    });
  };

  const handleProvideNotes = (quest: Quest) =>
  {
    const hasRequirements = haveCosts(quest);

    if (!hasRequirements) return;

    // Deduct requirements
    setGame((state) =>
    {
      const newCourses = state.courses.map((c) => ({ ...c }));
      let newProcrastinations = state.procrastinations;
      let newCash = state.cash;
      let newMaxActivatedItems = state.maxActivatedItems;
      quest.costs.forEach((req) =>
      {
        if (req.type === "understandings" && req.courseIndex !== undefined)
        {
          newCourses[req.courseIndex].understandings -= req.amount;
        }
        else if (req.type === "procrastinations")
        {
          newProcrastinations -= req.amount;
        }
        else if (req.type === "cash")
        {
          newCash -= req.amount;
        }
        else if (req.type === "maxActivatedItems")
        {
          newMaxActivatedItems -= req.amount;
        }
      });

      // Give rewards
      quest.rewards.forEach((rew) =>
      {
        if (rew.type === "understandings") newCourses[rew.courseIndex].understandings += rew.amount;
        else if (rew.type === "procrastinations") newProcrastinations += rew.amount;
        else if (rew.type === "cash") newCash += rew.amount;
        else if (rew.type === "maxActivatedItems") newMaxActivatedItems += rew.amount;
      });

      // Remove quest
      const newQuests = state.quests.map((q) => ({ ...q }));
      newQuests.splice(state.quests.indexOf(quest), 1);

      const newState = { ...state, courses: newCourses, cash: newCash, procrastinations: newProcrastinations, maxActivatedItems: newMaxActivatedItems, quests: newQuests };

      saveGame(newState);

      return newState;
    });
  };



  return (
    <div className="flex flex-wrap justify-center p-4">

      <CoursesCard game={game} />

      {/* Quests */}
      <CustomInfoCard
        icon={MessagesSquare}
        title="Course Group Chat"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> The GC
            </h2>

            <p className="text-sm">
              Every block, there will be a certain number of trade offers available. Spend Understandings
              to write notes for your fellow students in exchange for cash and other currencies.
              <br />
              <br />
              Trade offers appear at the start of a block and remain until exams have been attended.
            </p>
          </>
        }
        className="max-w-[1000px]"
      >
        {game.quests.length === 0 ? (
          <div className="p-3 italic text-gray-400">No offers available.</div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[675px] overflow-auto">
            {game.quests.map((quest) =>
            {
              const baseColor = quest.color || "#4b5563"; // fallback
              const bg = chroma(baseColor).brighten(1.2).hex();
              const border = chroma(baseColor).brighten(2).hex();
              const text = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

              return (
                <Card
                  key={quest.id}
                  className="flex flex-col border-2 gap-1 p-3 basis-[24%] min-w-[215px] h-[215px]"
                  style={{
                    backgroundColor: bg,
                    borderColor: border,
                    color: text,
                  }}
                >
                  <CardTitle className="text-sm font-semibold" style={{ color: text }}>
                    You give
                  </CardTitle>

                  <CardContent className="text-sm">
                    <ul className="list-disc">
                      {quest.costs.map((cost, i) => (
                        <li key={i}>
                          {cost.type === "understandings" && `${cost.amount} U in ${game.courses[cost.courseIndex].title}`}
                          {cost.type === "procrastinations" && `${cost.amount} P`}
                          {cost.type === "cash" && `$${cost.amount}`}
                          {cost.type === "maxActivatedItems" && `${cost.amount} Max Active Items`}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardTitle className="text-sm font-semibold" style={{ color: text }}>
                    You get
                  </CardTitle>

                  <CardContent className="text-sm flex-1">
                    <ul className="list-disc">
                      {quest.rewards.map((rew, i) => (
                        <li key={i}>
                          {rew.type === "understandings" && `${rew.amount} U in ${game.courses[rew.courseIndex].title}`}
                          {rew.type === "procrastinations" && `${rew.amount} P`}
                          {rew.type === "cash" && `$${rew.amount}`}
                          {rew.type === "maxActivatedItems" && `${rew.amount} Max Active Items`}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="flex m-0 p-0 justify-center">
                    <CustomButton
                      color={`${haveCosts(quest)
                        ? "Green"
                        : "Gray"
                        }`}
                      onClick={() => handleProvideNotes(quest)}
                      className="p-0 m-0 w-full"
                    >
                      Provide Notes
                    </CustomButton>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CustomInfoCard>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        mode="normal"
      />
    </div >
  );
}
