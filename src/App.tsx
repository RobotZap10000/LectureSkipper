import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { GameState, Lecture, Quest, Run, View } from "@/game";
import { changeView, generateLecture, generateQuest, initGame, loadGame, saveGame } from "@/game";
import CalendarView from "@/views/CalendarView";
import MarketView from "@/views/MarketView";
import ChatView from "@/views/ChatView";
import ForgeView from "@/views/ForgeView";
import SettingsView from "@/views/SettingsView";
import { CircleDollarSign, Sparkles, TriangleAlert, Zap } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

export function validateGameState(game: any)
{
  const missing: string[] = [];

  // Build templates from fresh game
  const gameTemplate: GameState = initGame();
  const lectureTemplate: Lecture = generateLecture(initGame());
  const questTemplate: Quest = generateQuest(initGame());

  // Extract flat keys
  const GAME_KEYS = Object.keys(gameTemplate);
  const LECTURE_KEYS = Object.keys(lectureTemplate);
  const QUEST_KEYS = Object.keys(questTemplate);
  const COURSE_KEYS = Object.keys(gameTemplate.courses[0]);

  // --- Validate GameState root keys ---
  for (const key of GAME_KEYS)
  {
    if (!(key in game))
    {
      missing.push(key);
    }
  }

  // --- Validate nextLecture (if exists) ---
  if (game.nextLecture)
  {
    for (const key of LECTURE_KEYS)
    {
      if (!(key in game.nextLecture))
      {
        missing.push(`nextLecture.${key}`);
      }
    }
  }

  // --- Validate quests array ---
  if (Array.isArray(game.quests))
  {
    game.quests.forEach((q: any, i: number) =>
    {
      for (const key of QUEST_KEYS)
      {
        if (!(key in q))
        {
          missing.push(`quests[${i}].${key}`);
        }
      }
    });
  } else
  {
    missing.push("quests (not an array)");
  }

  // --- Validate courses array ---
  if (Array.isArray(game.courses))
  {
    game.courses.forEach((c: any, i: number) =>
    {
      for (const key of COURSE_KEYS)
      {
        if (!(key in c))
        {
          missing.push(`courses[${i}].${key}`);
        }
      }
    });
  } else
  {
    missing.push("courses (not an array)");
  }

  return {
    valid: missing.length === 0,
    missing
  };
}



export default function App()
{
  const [saveCorrupted, setSaveCorrupted] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [game, setGame] = useState<GameState>(() =>
  {
    const loaded = loadGame();
    if (loaded === "ParsingFailed")
    {
      setSaveCorrupted(true);
      setMissingFields(validateGameState(loaded).missing);
      return initGame();
    } else if (loaded === "GameDoesNotExist")
    {
      return initGame();
    } else
    {
      let valid = validateGameState(loaded).valid;
      if (!valid)
      {
        setSaveCorrupted(true);
        setMissingFields(validateGameState(loaded).missing);
        return initGame();
      }
      return loaded;
    }
  });

  // Validate save on mount
  useEffect(() =>
  {
    let validation = validateGameState(game);
    if (validation.valid == false)
    {
      console.error("Invalid save file detected.");
      setSaveCorrupted(true);
      setMissingFields(validation.missing);
    }
  }, []);

  // Keyboard buttons to switch between tabs
  useEffect(() =>
  {
    const handleKeyDown = (e: KeyboardEvent) =>
    {
      const keyToView: Record<string, View> = {
        "1": "Calendar",
        "2": "Market",
        "3": "Forge",
        "4": "Chat",
        "5": "Settings",
      };

      const view = keyToView[e.key];
      if (view)
      {
        setGame(prev => changeView(prev, view));
      }
    };

    // Attach listener once
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () =>
    {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // empty dependency array ensures this runs only once

  // Save game whenever setGame is called
  useEffect(() =>
  {
    if (saveCorrupted) return;
    saveGame(game);
  }, [game]);

  const [topRuns, setTopRuns] = useState<Run[]>(() =>
  {
    try
    {
      const saved = localStorage.getItem("topRuns");
      return saved ? JSON.parse(saved) as Run[] : [];
    } catch
    {
      return [];
    }
  });

  return (
    <>
      {/* Save Corrupted Popup */}
      <AlertDialog open={saveCorrupted}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-bold"> <TriangleAlert className="w-5 h-5" /> Save File Corrupted</AlertDialogTitle>
            <AlertDialogDescription>
              Your save data is missing required fields. <span className="font-bold">The save data must be fixed manually or the game must be reset to continue.</span>
              <br />
              <br />
              This can happen when loading a save file from an unsupported version of the game.
              <br />
              <br />
              Missing fields: <code>{missingFields.join(", ")}</code>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
              {
                setSaveCorrupted(false);
                setGame(initGame());
              }}
              className="bg-red-500 hover:bg-red-600 font-bold py-2 px-4 rounded"
            >
              Reset Save File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-screen">
          <AppSidebar game={game} setGame={setGame} />

          <main className="flex-1 flex flex-col min-h-0">
            <SidebarTrigger className="w-10 h-10 sm:fixed z-20" />

            {/* Footer  */}
            <div className="bg-background p-2 flex justify-around items-center z-10 flex-shrink-0">
              <div className="flex items-center gap-2"><CircleDollarSign /> Cash: ${game.cash}</div>
              <div className="flex items-center gap-2"><Sparkles /> Procrastinations: {game.procrastinations} P</div>
              <div className="flex items-center gap-2"><Zap /> Energy: {game.energy} E / {game.maxEnergy} E</div>
            </div>

            {/* scrollable content area */}
            <div className="flex-1 overflow-auto min-h-0 pb-50">
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 p-0">
                {game.view === "Calendar" && <CalendarView game={game} setGame={setGame} setTopRuns={setTopRuns} />}
                {game.view === "Market" && <MarketView game={game} setGame={setGame} />}
                {game.view === "Chat" && <ChatView game={game} setGame={setGame} />}
                {game.view === "Forge" && <ForgeView game={game} setGame={setGame} />}
                {game.view === "Settings" && <SettingsView game={game} setGame={setGame} topRuns={topRuns} />}
              </div>
            </div>
          </main>

        </div>
      </SidebarProvider>
    </>
  );

}
