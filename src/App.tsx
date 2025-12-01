import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { GameState, Run } from "@/game";
import { loadGame } from "@/game";
import CalendarView from "@/views/CalendarView";
import MarketView from "@/views/MarketView";
import ChatView from "@/views/ChatView";
import ForgeView from "@/views/ForgeView";
import SettingsView from "@/views/SettingsView";
import { CircleDollarSign, Sparkles, Zap } from "lucide-react";

type View = "Calendar" | "Market" | "Chat" | "Forge" | "Settings";

export default function App()
{
  const [game, setGame] = useState<GameState>(loadGame());
  const [view, setView] = useState<View>("Calendar");
  useEffect(() =>
  {
    // Setting Calendar View selected items
    if (view === "Calendar")
    {
      setGame((prev) =>
      {
        const newState: GameState = {
          ...prev,
          selectedItemSlots: [],
        };

        // Filter out deleted items
        newState.calendarViewSelectedItemIDs = newState.calendarViewSelectedItemIDs.filter(id => {
          for(let i = 0; i < prev.items.length; i++) {
            let item = prev.items[i];
            if (item && item.id === id) return true;
          }
          return false;
        });

        // Limit selection
        if (newState.calendarViewSelectedItemIDs.length > newState.maxActivatedItems)
        {
          newState.calendarViewSelectedItemIDs = newState.calendarViewSelectedItemIDs.slice(0, newState.maxActivatedItems);
        }

        // Set selection to calendarViewSelectedItemIDs
        for (let i = 0; i < prev.items.length; i++)
        {
          const item = prev.items[i];
          if (item && prev.calendarViewSelectedItemIDs.includes(item.id))
          {
            newState.selectedItemSlots.push(i);

            if (newState.selectedItemSlots.length > prev.maxActivatedItems)
            {
              break;
            }
          }
        }

        return newState;
      });
    } else
    {
      setGame((prev) =>
      {
        // Clear selection
        const newState: GameState = {
          ...prev,
          selectedItemSlots: [],
        };
        return newState;
      });
    }



    // Keyboard buttons to switch between tabs

    const handleKeyDown = (e: KeyboardEvent) =>
    {
      // Map number keys to views
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
        setView(view);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on unmount
    return () =>
    {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [view]);

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
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar currentView={view} setView={setView} />

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
              {view === "Calendar" && <CalendarView game={game} setGame={setGame} setTopRuns={setTopRuns} />}
              {view === "Market" && <MarketView game={game} setGame={setGame} />}
              {view === "Chat" && <ChatView game={game} setGame={setGame} />}
              {view === "Forge" && <ForgeView game={game} setGame={setGame} />}
              {view === "Settings" && <SettingsView game={game} setGame={setGame} topRuns={topRuns} />}
            </div>
          </div>
        </main>

      </div>
    </SidebarProvider>
  );

}
