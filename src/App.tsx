import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import type { GameState } from "@/game";
import { initGame } from "@/game";

import CalendarView from "@/views/CalendarView";
import MarketView from "@/views/MarketView";
import ChatView from "@/views/ChatView";
import ForgeView from "@/views/ForgeView";
import SettingsView from "@/views/SettingsView";
import { CircleDollarSign, Sparkles, Zap } from "lucide-react";

type View = "Calendar" | "Market" | "Chat" | "Forge" | "Settings";

export default function App()
{
  const [game, setGame] = useState<GameState>(initGame());
  const [view, setView] = useState<View>("Calendar");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar setGame={setGame} currentView={view} setView={setView} />

        <main className="flex-1 flex flex-col min-h-0">
          <SidebarTrigger />

          {/* scrollable content area */}
          <div className="flex-1 overflow-auto min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 p-4">
              {view === "Calendar" && <CalendarView game={game} setGame={setGame} />}
              {view === "Market" && <MarketView game={game} setGame={setGame} />}
              {view === "Chat" && <ChatView game={game} setGame={setGame} />}
              {view === "Forge" && <ForgeView game={game} setGame={setGame} />}
              {view === "Settings" && <SettingsView game={game} setGame={setGame} />}
            </div>
          </div>

          {/* Footer — no fixed positioning, sits to the right of the sidebar automatically */}
          <div className="bg-sidebar p-2 flex justify-around items-center z-50 flex-shrink-0">
            <div className="flex items-center gap-2"><CircleDollarSign /> Cash: {game.cash}$</div>
            <div className="flex items-center gap-2"><Sparkles /> Procrastinations: {game.procrastinations} P</div>
            <div className="flex items-center gap-2"><Zap /> Energy: {game.energy} E / {game.maxEnergy} E</div>
          </div>
        </main>

      </div>
    </SidebarProvider>
  );

}
