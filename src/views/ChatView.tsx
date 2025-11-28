import Inventory from "@/components/Inventory";
import type { GameState, Quest } from "../game";
import type { Dispatch, SetStateAction } from "react";
import { HelpCircle, MessageCircle, MessagesSquare } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import chroma from "chroma-js";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ChatView({ game, setGame }: Props)
{
  const haveRequirements = (quest: Quest): boolean =>
  {
    return quest.requirements.every((req) =>
    {
      if (req.type === "understandings" && req.courseIndex !== undefined)
        return game.courses[req.courseIndex].understandings >= req.amount;
      if (req.type === "procrastinations")
        return game.procrastinations >= req.amount;
      if (req.type === "cash")
        return game.cash >= req.amount;
      return false;
    });
  };

  const handleProvideNotes = (quest: Quest) =>
  {
    const hasRequirements = haveRequirements(quest);

    if (!hasRequirements) return;

    // Deduct requirements
    setGame((state) =>
    {
      const newCourses = state.courses.map((c) => ({ ...c }));
      let newProcrastinations = state.procrastinations;
      let newCash = state.cash;
      quest.requirements.forEach((req) =>
      {
        if (req.type === "understandings" && req.courseIndex !== undefined)
        {
          newCourses[req.courseIndex].understandings -= req.amount;
        }
        if (req.type === "procrastinations")
        {
          newProcrastinations -= req.amount;
        }
        if (req.type === "cash")
        {
          newCash -= req.amount;
        }
      });

      // Give rewards
      quest.rewards.forEach((rew) =>
      {
        if (rew.type === "understandings") newCourses[rew.courseIndex].understandings += rew.amount;
        if (rew.type === "procrastinations") newProcrastinations += rew.amount;
        if (rew.type === "cash") newCash += rew.amount;
      });

      // Remove quest
      const newQuests = state.quests.map((q) => ({ ...q }));
      newQuests.splice(state.quests.indexOf(quest), 1);

      return { ...state, courses: newCourses, cash: newCash, procrastinations: newProcrastinations, quests: newQuests };
    });
  };



  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">

      {/* Quests */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[1000px] w-full h-content max-h-[650px] overflow-auto">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <MessagesSquare className="w-5 h-5" /> Course Group Chat

          <Popover>
            <PopoverTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> The GC
              </h2>

              <p className="text-sm">
                Every block, there will be a certain number of trade offers available. Spend Understandings to write notes for your fellow students in exchange for cash and other currencies.
                <br></br><br></br>
                Trade offers appear at the start of a block and don't change until next block, unless you have some special items.
              </p>
            </PopoverContent>
          </Popover>
        </h2>

        {game.quests.length === 0 ? (
          <div className="p-3 italic text-gray-400">No offers available.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {game.quests.map((quest) =>
            {
              const baseColor = quest.color || "#4b5563"; // fallback
              const bg = chroma(baseColor).brighten(1.2).hex();
              const border = chroma(baseColor).brighten(2).hex();
              const text = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

              return (
                <Card
                  key={quest.id}
                  className="flex flex-col border-2 gap-1 p-3 basis-[32%] min-w-[150px] h-content"
                  style={{
                    backgroundColor: bg,
                    borderColor: border,
                    color: text,
                  }}
                >

                  <CardTitle className="text-sm font-semibold" style={{ color: text }}>
                    Requirements
                  </CardTitle>

                  <CardContent className="text-sm">
                    <ul className="list-disc">
                      {quest.requirements.map((req, i) => (
                        <li key={i}>
                          {req.type === "understandings" && `${req.amount} U in ${game.courses[req.courseIndex].title}`}
                          {req.type === "procrastinations" && `${req.amount} P`}
                          {req.type === "cash" && `${req.amount}$`}
                        </li>

                      ))}
                    </ul>
                  </CardContent>

                  <CardTitle className="text-sm font-semibold" style={{ color: text }}>
                    Rewards
                  </CardTitle>

                  <CardContent className="text-sm flex-1">
                    <ul className="list-disc">
                      {quest.rewards.map((rew, i) => (
                        <li key={i}>
                          {rew.type === "cash"
                            ? `$${rew.amount}`
                            : `${rew.amount} Procrastinations`}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="">
                    <button
                      className="w-full px-2 py-1 rounded text-sm"
                      style={{
                        backgroundColor: haveRequirements(quest) ? "rgba(0, 197, 10, 1)" : "rgba(0, 0, 0, 0.25)",
                        color: text,
                      }}
                      onClick={() => handleProvideNotes(quest)}
                    >
                      Provide Notes
                    </button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

        )}

      </div>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        mode="normal"
      />
    </div >
  );
}
