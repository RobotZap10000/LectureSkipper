import Inventory from "@/components/Inventory";
import type { GameState, Quest } from "../game";
import type { Dispatch, SetStateAction } from "react";
import { HelpCircle, MessageCircle, MessagesSquare } from "lucide-react";
import
{
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ChatView({ game, setGame }: Props)
{
  const handleProvideNotes = (quest: Quest) =>
  {
    const hasRequirements = quest.requirements.every((req) =>
    {
      if (req.type === "understandings" && req.courseIndex !== undefined)
        return game.courses[req.courseIndex].understandings >= req.amount;
      if (req.type === "procrastinations")
        return game.procrastinations >= req.amount;
      return false;
    });

    if (!hasRequirements) return alert("Requirements not met!");

    // Deduct requirements
    setGame((g) =>
    {
      const newCourses = g.courses.map((c) => ({ ...c }));
      let newProcrastinations = g.procrastinations;
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
      });

      // Give rewards
      let newCash = g.cash;
      let newProcrast = newProcrastinations;
      quest.rewards.forEach((rew) =>
      {
        if (rew.type === "cash") newCash += rew.amount;
        if (rew.type === "procrastinations") newProcrast += rew.amount;
      });

      return { ...g, courses: newCourses, cash: newCash, procrastinations: newProcrast };
    });
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">

      {/* Quests */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content max-h-[500px]">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <MessagesSquare className="w-5 h-5" /> Course Group Chat

          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> The GC
              </h2>

              <p className="text-sm">
                Every block, there will be a certain number of trade offers available. Spend Understandings to write notes for your fellow students in exchange for cash and other currencies.
                <br></br><br></br>
                Trade offers appear at the start of a block and don't change until next block, unless you have some special items.
              </p>
            </HoverCardContent>
          </HoverCard>
        </h2>

        {game.quests.length === 0 ? (
          <div className="p-3 italic text-gray-400">No offers available.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {game.quests.map((quest) => (
              <div key={quest.id} className="bg-accent p-2 rounded">
                <div className="mb-1 font-semibold">Requirements:</div>
                {quest.requirements.map((req, i) => (
                  <div key={i}>
                    {req.type === "understandings"
                      ? `Course ${req.courseIndex! + 1}: ${req.amount} Understandings`
                      : `${req.amount} Procrastinations`}
                  </div>
                ))}
                <div className="mb-1 mt-2 font-semibold">Rewards:</div>
                {quest.rewards.map((rew, i) => (
                  <div key={i}>
                    {rew.type === "cash" ? `$${rew.amount}` : `${rew.amount} Procrastinations`}
                  </div>
                ))}
                <button
                  className="mt-2 bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleProvideNotes(quest)}
                >
                  Provide Notes
                </button>
              </div>
            ))}
          </div>)}
      </div>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        disableTrash={false}
      />
    </div >
  );
}
