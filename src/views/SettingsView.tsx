import type { Dispatch, SetStateAction } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Settings, RefreshCcw, PenOff, ScrollText, Box, Trophy, AlertCircle } from "lucide-react";
import type { GameState, Run } from "@/game";
import { initGame } from "@/game";
import { itemRegistry, itemsByRarity } from "@/itemRegistry";
import ItemSlot from "@/components/ItemSlot";
import githubIcon from "@/assets/github-mark-white.svg";
import { CustomButton } from "@/components/CustomButton";
import ItemComponent from "@/components/ItemComponent";
import { CustomInfoCard } from "@/components/CustomInfoCard";

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
      version: "0.4.0",
      date: "???, 2025",
      title: "Another Rebalance",
      description: "More content has been added as well.",
      majorChanges: [
        "You can now only get a maximum of 200 P from a  skipped lecture, with an average of 100 P per skip. This amount no longer scales with time.",
        "Reworked Market: now sells items, not just boxes.",
        "Anvil Nerf: now only works on items of equal type.",
        "Added lots of animations to the UI.",
      ],
      smallChanges: [
        "Minor UI changes.",
      ],
      bugFixes: [
        "Time Machine now works when used on the last lecture.",
        "Fixed a problem in the description of the Cookie.",
        "Clarified the description of the Snail.",
        "Fixed error in the story.",
      ],
    },
    {
      version: "0.3.1",
      date: "December 13, 2025",
      title: "Lecture and Market Rebalance",
      description: "Early game was completely impossible.",
      majorChanges: [
        "Lectures in the earlier blocks now have a lower bound for the understand chance.",
        "Rebalanced Market box values.",
      ],
      smallChanges: [],
      bugFixes: [],
    },
    {
      version: "0.3.2",
      date: "December 13, 2025",
      title: "GC Rebalance",
      description: "The GC was useless.",
      majorChanges: [
        "Offers in the GC now require less U and provide more $.",
      ],
      smallChanges: [],
      bugFixes: [
        "Fixed Aftershock crashing the game when you only had 1 lecture left."
      ],
    },
    {
      version: "0.3.1",
      date: "December 13, 2025",
      title: "Lecture and Market Rebalance",
      description: "Early game was completely impossible.",
      majorChanges: [
        "Lectures in the earlier blocks now have a lower bound for the understand chance.",
        "Rebalanced Market box values.",
      ],
      smallChanges: [],
      bugFixes: [],
    },
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
      majorChanges: [],
      smallChanges: [],
      bugFixes: [],
    },
  ];


  return (
    <div className="flex flex-wrap justify-center p-4">

      {/* Game Info */}
      <CustomInfoCard
        icon={PenOff}
        title="Next Event"
      >
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
      </CustomInfoCard>

      {/* Game Settings */}
      <CustomInfoCard
        icon={Settings}
        title="Game Settings"
      >
        <CustomButton
          icon={RefreshCcw}
          color="FireBrick"
          onClick={() => setGame(initGame())}
        >
          Reset Run
        </CustomButton>
        <div className="italic text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Warning: Does not record the run.
        </div>
      </CustomInfoCard>

      {/* My Top Runs */}
      <CustomInfoCard
        icon={Trophy}
        title="My Top Runs"
      >
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
                    game={game}
                    onClick={() => { }}
                    size={32}
                  >
                    {item && <ItemComponent item={item} game={{} as GameState} size={32} />}
                  </ItemSlot>
                ))}
              </div>
            </div>
          ))
        )}
      </CustomInfoCard>



      {/* All Items (Preview) */}
      <CustomInfoCard
        icon={Box}
        title={`All Items (${Object.keys(itemRegistry).length})`}
      >
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].flatMap(rarity =>
            itemsByRarity[rarity].map(item => (
              <ItemSlot
                key={`preview-${item.name}`}
                game={game}
                onClick={() => { }}
                size={40}
              >
                {item && <ItemComponent item={item} game={{} as GameState} size={40} />}
              </ItemSlot>
            ))
          )}
        </div>
      </CustomInfoCard>



      {/* Game Updates */}
      <CustomInfoCard
        icon={ScrollText}
        title="Game Updates"
      >
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
      </CustomInfoCard>

    </div>
  );
}
