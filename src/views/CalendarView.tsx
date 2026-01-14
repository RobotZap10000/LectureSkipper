import Inventory from "@/components/Inventory";
import type { GameState, Run } from "@/game";
import { startRound, attendExams, startNewBlock, initGame } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { Scroll, BookOpen, RefreshCcw, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import chroma from "chroma-js";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { CustomButton } from "@/components/CustomButton";
import { CoursesCard } from "@/components/CoursesCard";
import { story } from "@/story";
import { renderDescription } from "@/stringUtils";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
  setTopRuns: React.Dispatch<React.SetStateAction<Run[]>>
}

export default function CalendarView({ game, setGame, setTopRuns }: Props)
{
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    if (logContainerRef.current)
    {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [game.log]);

  return (
    <div className="flex flex-wrap justify-center p-4">

      <CoursesCard game={game} />

      {/* Next Event */}
      <CustomInfoCard
        icon={BookOpen}
        title="Next Event"
        className="min-h-[600px]"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Lectures
            </h2>
            <div className="text-sm">
              <ul className="list-disc pl-4 pt-2">
                <li>
                  <span className="font-bold">Attend</span>: Attending a lecture has
                  a chance of giving you Understanding (U) for a course. Attending
                  takes time, which reduces your energy.{" "}
                  <span className="italic text-red-500">
                    You cannot attend if you don't have enough energy.
                  </span>
                </li>
                <li>
                  <span className="font-bold">Skip</span>: Skipping gives you
                  Procrastinations (P) and restores energy. Currently, you gain {game.energyPerSkip} energy per skip. {" "}
                  <span className="italic text-red-500">
                    You restore energy half as fast if you have less than 50% of your
                    maximum.
                  </span>
                </li>
              </ul>
            </div>
          </>
        }
      >
        {/* --- CASE 0: Story must be shown --- */}
        {story[game.story] ? (
          <>
            <div className="flex flex-col items-center justify-center gap-4">
              {story[game.story](game, setGame)}
              <CustomButton
                onClick={() => setGame((g) => ({ ...g, story: -1 }))}
                color="DarkOrchid"
              >
                Continue
              </CustomButton>
            </div>
          </>
        ) : null}

        {/* --- CASE 1: Lectures still remaining --- */}
        {story[game.story] == null && game.nextLecture && !game.examsAttended ? (
          <div className="flex flex-col items-center gap-2">
            {/* Determine course color */}
            {(() =>
            {
              const course = game.courses[game.nextLecture.courseIndex];

              const baseColor = course ? course.color : "#4b5563"; // fallback gray
              const bg = chroma(baseColor).brighten(1.2).hex();
              const border = chroma(baseColor).brighten(2).hex();
              const text = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

              return (
                <Card
                  className="w-80 h-80 p-4 pl-0 pr-0 mt-4 flex flex-col justify-between border-2"
                  style={{
                    backgroundColor: bg,
                    borderColor: border,
                    color: text,
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold" style={{ color: text }}>
                      {course.title} Lecture
                    </CardTitle>
                    <CardDescription
                      className="text-sm"
                      style={{
                        color: text === "white" ? "#e5e5e5" : "#333",
                      }}
                    >
                      Time: {game.nextLecture.startTime} – {game.nextLecture.endTime}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-1">
                    {/* Potential Understandings */}
                    <div style={{ visibility: game.nextLecture.PUVisible ? "visible" : "hidden" }}>
                      <div className="text-sm mb-1 flex justify-between">
                        Potential Understanding (U) <span className="font-bold">{game.nextLecture.potentialUnderstandings} U</span>
                      </div>
                      <Progress
                        value={game.nextLecture.potentialUnderstandings / game.courses[game.nextLecture.courseIndex].maxUnderstandingsPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-purple-300 [&>div]:!transition-none"
                      />
                    </div>

                    {/* Understand Chance */}
                    <div style={{ visibility: game.nextLecture.UCVisible ? "visible" : "hidden" }}>
                      <div className="text-sm mb-1 flex justify-between">
                        Understand Chance <span className="font-bold">{(game.nextLecture.understandChance * 100).toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={game.nextLecture.understandChance * 100}
                        className="h-3 rounded-full [&>div]:bg-green-300 [&>div]:!transition-none"
                      />
                    </div>

                    {/* Energy Cost */}
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Energy Cost: <span className="font-bold">{game.nextLecture.energyCost} E</span>
                      </div>
                      <Progress
                        value={game.nextLecture.energyCost / game.courses[game.nextLecture.courseIndex].maxEnergyCostPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-red-300 [&>div]:!transition-none"
                      />
                    </div>

                    {/* Procrastination Value */}
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Procrastination (P) Value: <span className="font-bold">{game.nextLecture.procrastinationValue} P</span>
                      </div>
                      <Progress
                        value={game.nextLecture.procrastinationValue / game.courses[game.nextLecture.courseIndex].maxProcrastinationsPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-blue-300 [&>div]:!transition-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Buttons */}
            <div className="flex gap-2 m-2">
              <CustomButton
                onClick={() => setGame((g) => startRound(g, "attend"))}
                color={`${game.energy < game.nextLecture.energyCost
                  ? "gray"
                  : "Green"
                  }`}
              >
                Attend
              </CustomButton>
              <CustomButton
                onClick={() => setGame((g) => startRound(g, "skip"))}
                color="FireBrick"
              >
                Skip
              </CustomButton>
            </div>

            <h1 className="font-bold flex items-center p-0 m-0">
              Lectures until Exams: {game.lecturesLeft}
            </h1>

            <div className="flex flex-col gap-1 w-full max-w-sm p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4" /> Energy: {game.energy} E /{" "}
                {game.maxEnergy} E
              </div>
              <Progress
                value={(game.energy / game.maxEnergy) * 100}
                className="h-3 rounded-full"
              />
            </div>
          </div>
        ) : null}

        {/* --- CASE 2: No lectures left & Exams not yet attended --- */}
        {story[game.story] == null && !game.nextLecture && !game.examsAttended ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <h2 className="text-lg font-bold">All lectures completed.</h2>
            <CustomButton
              onClick={() => setGame((g) => attendExams(g, setTopRuns))}
              color="DarkMagenta"
            >
              Start Exams
            </CustomButton>
          </div>
        ) : null}

        {/* --- CASE 3: Exams attended → Show results --- */}
        {story[game.story] == null && game.examsAttended ? (
          <div className="flex flex-col items-center gap-4 mt-2">
            <h2 className="text-lg font-bold">Exam Results</h2>

            <div className="space-y-2 w-full">
              {game.examResults.map((passed, i) =>
              {
                const course = game.courses[i];
                return (
                  <Card
                    key={i}
                    className={`border-2 ${passed
                      ? "border-green-600 bg-green-950"
                      : "border-red-600 bg-red-950"
                      }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-md">{course.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {passed ? "Passed ✔️" : "Failed ❌"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* --- FAILURE CHECK --- */}
            {game.examResults.filter((r) => !r).length >= 2 ? (
              <div>
                <h2 className="font-bold mb-4">Final Score: {game.score}</h2>
                <CustomButton
                  icon={RefreshCcw}
                  color="#ac0000ff"
                  onClick={() => setGame(initGame())}
                >
                  Reset Run
                </CustomButton>

              </div>
            ) : (
              <CustomButton
                onClick={() => setGame((g) => startNewBlock(g))}
                color="RoyalBlue"
              >
                Start Next Block
              </CustomButton>
            )}
          </div>
        ) : null}
      </CustomInfoCard>

      {/* Log */}
      <CustomInfoCard icon={Scroll} title="Log">
        <div
          className="flex flex-col-reverse flex-1"
          ref={logContainerRef}
        >
          {game.log.slice().map((entry, i) =>
          {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                {Icon && <Icon
                  className="w-4 h-4 shrink-0 inline-block"
                  style={{ color: entry.color }}
                  strokeWidth={2}
                />}
                <span>{renderDescription(entry.message)}</span>
              </div>
            );
          })}
        </div>
      </CustomInfoCard>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
      />
    </div >
  );
}
