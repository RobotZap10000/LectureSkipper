import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCcw, PenOff } from "lucide-react";
import type { GameState } from "@/game";
import { initGame } from "@/game";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function SettingsView({ setGame }: Props)
{
  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      <div className="flex flex-wrap justify-center gap-4 p-4">

        {/* Game Info */}
        <div className="bg-card p-2 rounded flex flex-col max-w-[500px] w-full h-content max-h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenOff className="w-5 h-5" /> Lecture Skipper
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm">A 90% vibe-coded game made while skipping lectures. Made by Kris Puusepp.</p>
              </div>

              <div>
                <p className="text-sm">On a real note, unless you have good reasons, don't skip lectures. It doesn't give you bragging rights, you are just refraining from going to lectures which you paid for.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Settings */}
        <div className="bg-card p-2 rounded flex flex-col max-w-[500px] w-full h-content max-h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button variant="destructive" className="flex items-center gap-2 mt-4" onClick={() => setGame(initGame())}>
                <RefreshCcw className="w-4 h-4" /> Reset Run
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
