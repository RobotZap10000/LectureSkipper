import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCcw, PenOff, ScrollText } from "lucide-react";
import type { GameState } from "@/game";
import { initGame } from "@/game";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function SettingsView({ setGame }: Props)
{
  const gameUpdates = [
    {
      version: "1.0.0",
      date: "...",
      title: "Initial Release",
      majorChanges: [

      ],
      smallChanges: [

      ],
      bugFixes: [

      ],
    },
  ];


  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      <div className="flex flex-wrap justify-center p-4">

        {/* Game Info */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content max-h-[500px]">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <PenOff className="w-5 h-5" /> Lecture Skipper
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm">A 90% vibe-coded game made while skipping lectures. Made by Kris Puusepp.</p>
              <p className="text-sm">On a real note, unless you have good reasons, don't skip lectures. It doesn't give you bragging rights, you are just refraining from going to lectures which you paid for.</p>
              <h2 className="font-bold text-lg">Current Game Version: {gameUpdates[0].version}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Game Settings */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content max-h-[500px]">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button variant="destructive" className="flex items-center gap-2" onClick={() => setGame(initGame())}>
                <RefreshCcw className="w-4 h-4" /> Reset Run
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Updates */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content max-h-[500px]">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="w-5 h-5" /> Game Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {gameUpdates.map((update, i) => (
                <div key={i} className="border-b border-gray-700 pb-2 last:border-b-0">
                  <h4 className="font-bold">
                    {update.title} - v{update.version} ({update.date})
                  </h4>

                  {update.majorChanges.length > 0 && (
                    <div className="ml-4 mt-1">
                      <span className="font-semibold">Major Changes:</span>
                      <ul className="list-disc list-inside">
                        {update.majorChanges.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {update.smallChanges.length > 0 && (
                    <div className="ml-4 mt-1">
                      <span className="font-semibold">Small Changes:</span>
                      <ul className="list-disc list-inside">
                        {update.smallChanges.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {update.bugFixes.length > 0 && (
                    <div className="ml-4 mt-1">
                      <span className="font-semibold">Bug Fixes:</span>
                      <ul className="list-disc list-inside">
                        {update.bugFixes.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>

          </Card>
        </div>
      </div>
    </div>
  );
}
