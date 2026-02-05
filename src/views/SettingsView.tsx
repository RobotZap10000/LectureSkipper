import { useContext, useState, type Dispatch, type SetStateAction } from "react";
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
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import
{
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsContext, type AnimationMode, type SkipStoryMode as StoryMode, type TimerMode } from "@/App";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
  topRuns: Run[];
}

export default function SettingsView({ game, setGame, topRuns }: Props)
{
  let { settings, setSettings } = useContext(SettingsContext)!;

  const gameUpdates = [
    {
      version: "1.1.0",
      date: "February 5, 2026",
      title: "Speedrun and RNG Reduction Update",
      description: "A speedrun timer has been added and a lot of rebalancing has been done. There should be less reliance on RNG now.",
      majorChanges: [
        "Improved Market: you can now buy items more easily and more items at the same time.",
        "Added more boxes to the Market.",
        "The items at the Shop are now sold at higher starting levels as the game progresses.",
        "Some previously very unimpactful innate course effects now appear with more detrimental values, while some others have been capped to prevent blocks that are impossible to pass.",
        "Course Understanding goals now vary more and scale faster",
        "The Block 11 difficulty spike is now more severe.",
        "Consumables are now half as likely to appear.",
        "Lectures are now guaranteed to generate with at least 20% of the max Potential U that a lecture of that course can give.",
        "It now takes even longer for lectures with very low Understand Chances to appear.",
        "Chats now give more rewards overall.",
        "Lectures for a course now become less likely to appear once the goal has been completed.",
        "The minimum Procrastination Value of each lecture is now 50 P.",
      ],
      smallChanges: [
        "Various UI improvements.",
        "Game saves are now compressed to save space.",
        "Added a toggle for skipping story.",
        "Added a toggle for a speedrun timer.",
        "Added a Skip All button that shows up after the first block.",
        "Desk Lamp Nerf: now sets the new item's level to the same as its own level. Furthermore, the description has been clarified: it only turns items into green consumables.",
        "Barcode Buff has been reverted.",
        "Clover Buff: now starts at 50% and works After Use.",
        "Epic Beer Buff: now scales 3x faster.",
        "Job Buff: now scales 3x faster.",
        "Pizza Nerf: now scales slower.",
        "Printer Nerf: now can only give a maximum $ amount equal to its own level per item per round.",
        "Stock Market Nerf: now scales more slowly and starts at $50.",
        "Time Machine Nerf: can now add the Unhelpful effect up to 100%.",
        "Toolbox Nerf: now activates 5 times per level.",
        "Origami Nerf: now increases your P by 4% per level.",
        "Sun Nerf: now increases by 1 every level instead of 2.",
        "Video Game Nerf: now increases by 15% every level instead of 25%.",
        "Wifi Buff: now increases quest rewards 3x more per level.",
        "Video Buff: now scales faster.",
        "GPS Buff: now scales faster.",
        "Headphones Buff: now scales faster.",
        "Friend Buff: now 1.5x better and works On Use.",
        "Low Battery Buff: now scales faster, partially reverting the nerf.",
        "Clarified Snail description.",
        "Chats no longer ask for Procrastinations.",
      ],
      bugFixes: [
        "Improved wording in a few paragraphs of the story.",
        "The game should now handle infinities better.",
        "You can no longer reduce your score when losing U from a course.",
      ],
    },
    {
      version: "1.0.0",
      date: "January 30, 2026",
      title: "Final Release",
      description: "The game is now considered finished. Currently, there are no more planned updates.",
      majorChanges: [
        "The game should now handle infinities and NaNs better, allowing runs with such numbers to be saved and shown properly.",
      ],
      smallChanges: [
        "Added a flashing animation to the help buttons to make them more visible for new players.",
        "Improved some help screens.",
        "Snail Buff: items that activate after this one can still use gained procrastinations.",
      ],
      bugFixes: [
        "Fixed popovers not working on mobile.",
      ],
    },
    {
      version: "0.6.0",
      date: "January 29, 2026",
      title: "Second to Last Update",
      description: "More improvements before the 1.0.0 release.",
      majorChanges: [
        "Reworked Time Machine. Before Attend: Lectures for all courses now give 75% less understanding, but the current amount of lectures left until exams is increased by x%. Can only be used once per block.",
        "More items in the Shop now start preleveled.",
      ],
      smallChanges: [
        "Improved animation settings.",
        "Added more course names.",
        "Added an explanation for the Scoring mechanism to the Courses card.",
        "Barcode Buff: Now activates 10 times per level instead of 5.",
        "Cart Buff: Now adds $30 per level.",
        "Headphones Buff: Now starts at 50% and scales faster.",
        "Job Buff: Now starts at 1.33 and scales +0.33 per level.",
        "Low Battery Nerf: Now starts at 2.5% and scales even slower.",
        "Soda Buff: Now adds 3 stacks per level.",
        "Sticky Note Buff: Now no longer has a maximum %.",
        "Super Soup Nerf: Threshold is now 500%.",
        "Toolbox Buff: Now activates 10 times per level.",
        "Video Buff: Now can scale to 0%.",
        "Video Game Buff: Now gives 25% extra per level.",
        "Wallet Buff: Now gives $20 + $15 per level.",
        "Stock Market Buff: Now starts at $1 per $30.",
      ],
      bugFixes: [
        "Video description has been fixed.",
        "Firefox should now properly render the game.",
      ],
    },
    {
      version: "0.5.1",
      date: "January 25, 2026",
      title: "Difficulty Hotfix",
      description: "Due to a typo, the game was 10x harder than it was supposed to be.",
      majorChanges: [],
      smallChanges: [],
      bugFixes: [
        "Understandings per Lecture are now calculated correctly.",
        "Course progress bars now update correctly.",
      ],
    },
    {
      version: "0.5.0",
      date: "January 25, 2026",
      title: "3x Speed Update",
      description: "The game was too slow, so it has been sped up. Faster difficulty scaling, less time between story segments, earlier ending.",
      majorChanges: [
        "Ending is now at Block 11 instead of Block 30.",
        "Difficulty scales much, much faster. This includes everything, from the Understanding Goals to the innate course effects.",
        "Lectures now take at most 10 E and this amount no longer scales over time. However, items and effects can still affect this amount.",
        "Innate course effects now scale with time. (later blocks have courses with effects that have more detrimental numbers)",
        "Added 8 new items.",
      ],
      smallChanges: [
        "Removed the mechanic where you would gain half as much Energy per skip if you had less than 50% of your max Energy.",
        "The Shop now no longer sells a legendary item at the start of the block, but sells more items by default.",
        "Added the option to change the amount of animations.",
        "You can now select a row of items in the inventory with the keys 1 to 6.",
        "Small UI tweaks for both desktop and mobile browsers.",
        "The log now separates the lecture result from the rest of the entries.",
        "Brain Nerf: when you fail to understand the lecture, it now removes the amount of Understanding that you would have otherwise gained.",
        "DNA Buff: now inherits the levels from the item that it copies.",
        "Grass Buff: now gives 3x more Procrastinations per touch.",
        "Low Battery Nerf: now reduces the requirements less.",
        "Mythical Croissant Buff: now increases the energy gained per skip by 3x per level.",
        "Printer Buff: now always active.",
        "Clarified the Bug's description.",
        "Bug Buff: items that activate after this one can still use gained procrastinations.",
        "Cat Nerf: now gives less rewards.",
      ],
      bugFixes: [
        "Sticky Note now properly works.",
        "Sun now shows the correct description.",
      ],
    },
    {
      version: "0.4.0",
      date: "January 16, 2026",
      title: "Rebalance, Reworks and Animations",
      description: "More content has been added as well.",
      majorChanges: [
        "You can now only get a maximum of 200 P from a skipped lecture, with an average of 100 P per skip. This amount no longer scales with time.",
        "Reworked Market: now sells items, not just boxes.",
        "Improved Forge: you can now upgrade items multiple levels at a time.",
        "Added lots of animations to the UI.",
        "Added 17 new items.",
      ],
      smallChanges: [
        "Minor UI changes.",
        "Anvil Nerf: now only works on items of equal type.",
        "Clover Buff: now adds (level)% Understand Chance to the lecture.",
        "GPS Change: can now go to a maximum of +100% Understand Chance, but the percentage scales more slowly.",
        "Paper Buff: now starts at +75% Understand Chance and gains +5% per level.",
        "Pizza Buff: now can go up to 100% and scales faster. Clarified description.",
        "Sticky Note Buff: now starts at 50% and gains 10% per level.",
        "Time Machine Nerf: now reduces the understandings that the lectures of the course give by 90%.",
        "Video Game Buff: now increases +10% per level.",
        "Wallet Buff: now starts at $25, increases $5 per level and activates on use, rather than on attend.",
        "Cart Buff: now no longer gets disabled after use.",
        "Printer Change: now activates on skip, instead of on attend.",
      ],
      bugFixes: [
        "Time Machine now works when used on the last lecture.",
        "Fixed a problem in the description of the Cookie.",
        "Clarified the description of the Snail.",
        "Fixed an error in the story.",
      ],
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

  const formatDuration = (
    start: Date | string | number | undefined | null,
    end: Date | string | number | undefined | null
  ): string =>
  {
    // 1. Guard against missing values
    if (!start || !end) return "0s";

    // 2. Convert to Date objects and then to numbers (ms)
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    // 3. Calculate difference
    const diff = endTime - startTime;

    // Handle invalid dates or negative duration
    if (isNaN(diff) || diff <= 0) return "0s";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  return (
    <div className="flex flex-wrap justify-center p-4">

      {/* Game Info */}
      <CustomInfoCard
        icon={PenOff}
        title="Lecture Skipper"
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
        {/* Settings - Animations */}
        <div className="flex items-center justify-end w-full gap-4">
          <Label htmlFor="animations-select" className="whitespace-nowrap">
            Animations
          </Label>
          <div className="w-full max-w-[50%]">
            <Select
              value={settings.animations}
              onValueChange={(val) => { setSettings({ ...settings, animations: val as AnimationMode }); }}
            >
              <SelectTrigger id="animations-select" className="w-full">
                <SelectValue placeholder="Full" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="reduced">Reduced</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Settings - Skip Story */}
        <div className="flex items-center justify-end w-full gap-4">
          <Label htmlFor="story-select" className="whitespace-nowrap">
            Story
          </Label>
          <div className="w-full max-w-[50%]">
            <Select
              value={settings.story}
              onValueChange={(val) => { setSettings({ ...settings, story: val as StoryMode }); }}
            >
              <SelectTrigger id="story-select" className="w-full">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Settings - Speedrun Timer */}
        <div className="flex items-center justify-end w-full gap-4">
          <Label htmlFor="timer-select" className="whitespace-nowrap">
            Speedrun Timer
          </Label>
          <div className="w-full max-w-[50%]">
            <Select
              value={settings.timer}
              onValueChange={(val) => { setSettings({ ...settings, timer: val as TimerMode }); }}
            >
              <SelectTrigger id="timer-select" className="w-full">
                <SelectValue placeholder="Hide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show</SelectItem>
                <SelectItem value="hide">Hide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        {/* Settings - Reset Run */}
        <CustomButton
          icon={RefreshCcw}
          color="FireBrick"
          onClick={() => setGame(initGame(settings))}
          style={{ maxWidth: "30%" }}
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
          <div className="italic text-muted-foreground p-2">
            No top runs yet.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {topRuns.map((run, index) => (
              <AccordionItem
                key={index}
                value={`run-${index}`}
                className="border-b border-gray-700 last:border-b-0"
              >
                {/* --- Header --- */}
                <AccordionTrigger className="flex items-center gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-950 w-8 h-8 flex items-center justify-center rounded-full">
                      <span className="font-bold">#{index + 1}</span>
                    </div>

                    <span className="font-semibold">
                      Score:{" "}
                      {run.score === Infinity ? (
                        <span className="infinity-gradient-text">INFINITY</span>
                      ) : (
                        run.score
                      )}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDuration(run.dateCreated, run.dateEnded)}
                    </span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(run.dateEnded).toLocaleDateString()}{" "}
                      {new Date(run.dateEnded).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </AccordionTrigger>

                {/* --- Content --- */}
                <AccordionContent>
                  <p>Date created: {new Date(run.dateCreated).toLocaleDateString()} {new Date(run.dateCreated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p>Date finished: {new Date(run.dateEnded).toLocaleDateString()} {new Date(run.dateEnded).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p>Duration: {formatDuration(run.dateCreated, run.dateEnded)}</p>
                  {run.dateEndingReached && <p>Ending reached in: {formatDuration(run.dateCreated, run.dateEndingReached)}</p>}
                  {run.dateInfinityReached && <p>Infinity Score reached in: {formatDuration(run.dateCreated, run.dateInfinityReached)}</p>}
                  <ul className="pl-4 my-3 text-sm text-muted-foreground list-disc space-y-1">
                    <li>Block: {run.block}</li>
                    <li>Energy: {run.energy}/{run.maxEnergy}</li>
                    <li>Cash: ${run.cash}</li>
                    <li>Procrastinations: {run.procrastinations}</li>
                    <li>Energy gain per Skip: {run.energyPerSkip}</li>
                    <li>Max Active Items: {run.maxActivatedItems}</li>
                    <li>Total Items in Inventory: {run.items.length}</li>
                  </ul>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {run.items.map((item, idx) => (
                      <ItemSlot
                        key={`run-${index}-${idx}`}
                        game={game}
                        onClick={() => { }}
                        size={32}
                      >
                        {item && (
                          <ItemComponent
                            item={item}
                            game={{} as GameState}
                            size={32}
                          />
                        )}
                      </ItemSlot>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
                size={50}
              >
                {item && <ItemComponent item={item} game={{} as GameState} size={50} />}
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
