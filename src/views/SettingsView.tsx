import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCcw, PenOff, ScrollText, Box, Trophy } from "lucide-react";
import type { GameState, Run } from "@/game";
import { initGame } from "@/game";
import { itemsByRarity } from "@/itemRegistry";
import ItemSlot from "@/components/ItemSlot";
import githubIcon from "@/assets/github-mark-white.svg";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
  topRuns: Run[];
}

export default function SettingsView({ game, setGame, topRuns }: Props)
{
  const gameUpdates = [
    {
      version: "0.1.0a",
      date: "December 1, 2025",
      title: "First Test Version",
      description: "The first public release of Lecture Skipper.",
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
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <PenOff className="w-5 h-5" /> Lecture Skipper
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm">A 75% vibe-coded game made in 4 days while skipping lectures. Made by Kris Puusepp.</p>
              <p className="text-sm">On a real note, unless you have good reasons, don't skip lectures. It doesn't give you bragging rights, you are just refraining from going to lectures which you paid for.</p>
              <Button
                variant="outline"
                className="flex items-center gap-2 w-fit"
                onClick={() => window.open("https://github.com/KrisPuusepp/LectureSkipper", "_blank")}
              >
                <img src={githubIcon} className="w-4 h-4" />
                View Source on GitHub
              </Button>
              <h2 className="font-bold text-lg">Current Game Version: {gameUpdates[0].version}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Game Settings */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
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

        {/* Top Runs */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Top Runs
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {topRuns.length === 0 ? (
                <div className="italic text-muted-foreground p-2">No top runs yet.</div>
              ) : (
                topRuns.map((run, index) => (
                  <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">#{index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(run.date).toLocaleDateString()}{" "}
                        {new Date(run.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="mb-1">
                      <span className="font-semibold">Score:</span> {run.score}
                    </div>

                    <ul className="pl-4 mb-2 text-sm text-muted-foreground gap-2 list-disc">
                      <li>Block: {run.block}</li>
                      <li>Energy: {run.energy}/{run.maxEnergy}</li>
                      <li>Cash: ${run.cash}</li>
                      <li>Procrastinations: {run.procrastinations}</li>
                      <li>Energy gain per Skip: {run.energyPerSkip}</li>
                      <li>Max Active Items: {run.maxActivatedItems}</li>
                      <li>Total Items in Inventory: {run.items.length}</li>
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {run.items.map((item, idx) => (
                        <ItemSlot
                          key={`run-${index}-${idx}`}
                          item={item} // restore icon if needed
                          game={{} as GameState}
                          selected={false}
                          onClick={() => { }}
                          size={32}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>



        {/* All Items (Preview) */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" /> All Items
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].flatMap(rarity =>
                  itemsByRarity[rarity].map(item => (
                    <ItemSlot
                      key={`preview-${item.name}`}
                      item={item}
                      game={{} as GameState} // ; )
                      selected={false}
                      onClick={() => { }}
                      size={40}
                    />
                  ))
                )}
              </div>
            </CardContent>

          </Card>
        </div>

        {/* Game Updates */}
        <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
          <Card className="gap-4">
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="w-5 h-5" /> Game Updates
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {gameUpdates.map((update, i) => (
                <div
                  key={i}
                  className="border-b border-gray-700 pb-2 last:border-b-0"
                >
                  <h4 className="font-bold">
                    {update.title} - v{update.version} ({update.date})
                  </h4>

                  {/* Description */}
                  {update.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {update.description}
                    </p>
                  )}

                  {/* Major Changes */}
                  {update.majorChanges.length > 0 && (
                    <div className="ml-4 mt-2">
                      <span className="font-semibold">Major Changes:</span>
                      <ul className="list-disc list-inside">
                        {update.majorChanges.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Small Changes */}
                  {update.smallChanges.length > 0 && (
                    <div className="ml-4 mt-2">
                      <span className="font-semibold">Small Changes:</span>
                      <ul className="list-disc list-inside">
                        {update.smallChanges.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {update.bugFixes.length > 0 && (
                    <div className="ml-4 mt-2">
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
