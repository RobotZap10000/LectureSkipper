import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Settings, RefreshCcw, PenOff, ScrollText, Box, Trophy } from "lucide-react";
import type { GameState, Run } from "@/game";
import { initGame } from "@/game";
import { itemRegistry, itemsByRarity } from "@/itemRegistry";
import ItemSlot from "@/components/ItemSlot";
import githubIcon from "@/assets/github-mark-white.svg";
import { CustomButton } from "@/components/CustomButton";

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
      version: "0.3.0",
      date: "December 12, 2025",
      title: "Third Test Version",
      description: "Difficulty overhaul, story, new items, UI rewrite, lots of tweaks...",
      majorChanges: [
        "Rebalanced half of the existing items.",
        "Changed almost all difficulty scaling formulas.",
        "Added 17 items. Now there are a total of 25.",
        "Added a story and an ending (you can still continue the run after the ending).",
        "Dozens of UI changes, polish, rewrites and QoL.",
        "Each course will now have a minimum amount of lectures that are guaranteed to appear during the course.",
        "Each course may now be generated with innate negative effects.",
        "Effects are now clickable and have dynamic descriptions.",
        "You can no longer increase your max active items via quests. Instead, they increase over time automatically.",
      ],
      smallChanges: [
        "You can now select a row of items with just one button in the Calendar view.",
      ],
      bugFixes: [
        "Rewrote the item selection system. It should work reliably now.",
      ],
    },
    {
      version: "0.2.0",
      date: "December 2, 2025",
      title: "Second Test Version",
      description: "Small improvements, bug fixes, new items.",
      majorChanges: [
        "Reduced P gain in the later blocks.",
        "Quests now may increase your max activated items.",
        "New Item: Notes.",
      ],
      smallChanges: [
        "Improved UI on mobile",
        "Renamed Top Runs to My Top Runs for clarity.",
        "On desktop: press 1, 2, 3, 4 and 5 to switch tabs.",
        "Calendar View selected items are now tracked separately from the rest of the views.",
      ],
      bugFixes: [
        "Energy bar now correctly shows the percentage of energy remaining.",
        "Items now get deselected when they are no longer enable.",
        "Video item now works.",
      ],
    },
    {
      version: "0.1.0",
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
            <div className="text-sm">A 75% vibe-coded game made in 4 days while skipping lectures. Made by Kris Puusepp.</div>
            <div className="text-sm">On a real note, unless you have good reasons, don't skip lectures. It doesn't give you bragging rights, you are just refraining from going to lectures which you paid for.</div>
            <div className="text-sm">AI was not used in the writing of the story.</div>
            <CustomButton
              color="rgba(30, 30, 30, 1)"
              onClick={() => window.open("https://github.com/KrisPuusepp/LectureSkipper", "_blank")}
            >
              <img src={githubIcon} className="w-4 h-4" />
              View Source on GitHub
            </CustomButton>
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
          <CardContent className="flex flex-row flex-wrap gap-4">
            <CustomButton
              icon={RefreshCcw}
              color="FireBrick"
              onClick={() => setGame(initGame())}
            >
              Reset Run
            </CustomButton>
          </CardContent>
        </Card>
      </div>

      {/* My Top Runs */}
      <div className="p-2 rounded flex flex-col max-w-[500px] w-full h-content">
        <Card className="gap-4">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" /> My Top Runs
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
              <Box className="w-5 h-5" /> All Items ({Object.keys(itemRegistry).length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].flatMap(rarity =>
                itemsByRarity[rarity].map(item => (
                  <ItemSlot
                    key={`preview-${item.name}`}
                    item={item}
                    game={{} as GameState}
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
            <Accordion type="single" collapsible className="w-full">
              {gameUpdates.map((update, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    <h4 className="font-bold">
                      {update.title} — v{update.version} ({update.date})
                    </h4>
                  </AccordionTrigger>

                  <AccordionContent>
                    {/* Description */}
                    {update.description && (
                      <div className="text-sm mt-1">
                        {update.description}
                      </div>
                    )}

                    {/* Major Changes */}
                    {update.majorChanges?.length > 0 && (
                      <div className="ml-4 mt-3">
                        <span className="font-semibold">Major Changes:</span>
                        <ul className="list-disc list-inside text-sm">
                          {update.majorChanges.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Small Changes */}
                    {update.smallChanges?.length > 0 && (
                      <div className="ml-4 mt-3">
                        <span className="font-semibold">Small Changes:</span>
                        <ul className="list-disc list-inside text-sm">
                          {update.smallChanges.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug Fixes */}
                    {update.bugFixes?.length > 0 && (
                      <div className="ml-4 mt-3">
                        <span className="font-semibold">Bug Fixes:</span>
                        <ul className="list-disc list-inside text-sm">
                          {update.bugFixes.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
