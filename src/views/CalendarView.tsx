import Inventory from "@/components/Inventory";
import type { GameState } from "@/game";
import { startRound, attendExams, startNewBlock, initGame } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { Scroll, GraduationCap, BookOpen, HelpCircle, BookAlert, RefreshCcw, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import chroma from "chroma-js";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function CalendarView({ game, setGame }: Props)
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
    <div className="flex flex-wrap justify-center gap-4 p-4">

      {/* Courses */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content">
        <div className="col-span-1 flex flex-col h-full">
          <h2 className="font-bold m-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Courses

            <Popover>
              <PopoverTrigger asChild>
                <HelpCircle className="w-4 h-4 cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-64" side="top">
                <h2 className="font-bold m-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Courses
                </h2>

                <p className="text-sm">
                  Every block, you have 3 courses and a set amount of lectures before exams. Attend lectures to acquire Understanding (U).
                </p>

                <br></br>

                <h2 className="font-bold m-1 flex items-center gap-2">
                  <BookAlert className="w-5 h-5" /> Exams
                </h2>

                <p className="text-sm">
                  Your chance of passing a course depends on the amount of Understanding (U) acquired during the block. <span className="italic text-red-500">Failing 2 or more exams in a block results in a game over.</span>
                  <br></br><br></br>
                  You can gain Understanding (U) past the goal of the course: the chance to pass will be capped at 100%.
                </p>
              </PopoverContent>
            </Popover>
          </h2>

          <div className="flex-1 overflow-auto space-y-1">
            {game.courses.map((c) =>
            {
              const progress = Math.min((c.understandings / c.goal) * 100, 100);

              // Derive light/dark variants from base color
              const bg = chroma(c.color).brighten(1.2).hex();     // lighter background
              const border = chroma(c.color).brighten(2).hex();      // lighter outline
              const textColor = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

              return (
                <Card
                  key={c.title}
                  className="w-full border-2"
                  style={{
                    backgroundColor: bg,
                    borderColor: border,
                    color: textColor,
                  }}
                >
                  <CardHeader>
                    <CardTitle>{c.title}</CardTitle>
                    <CardDescription
                      style={{ color: textColor === "white" ? "#e5e5e5" : "#333" }}
                    >
                      {c.understandings} U / {c.goal} U • Chance to pass: {progress.toFixed(0)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-4 rounded" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <h1 className="font-bold m-1 flex items-center gap-2">
            Block {game.block}
          </h1>
        </div>
      </div>

      {/* Next Event */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] h-[540px] w-full">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Next Event
          <Popover>
            <PopoverTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Lectures
              </h2>

              <p className="text-sm">
                <ul className="list-disc pl-4 pt-2">
                  <li><span className="font-bold">Attend</span>: Attending a lecture has a chance of giving you Understanding (U) for a course. Attending takes time, which reduces your energy. <span className="italic text-red-500">You cannot attend if you don't have enough energy. You restore energy half as fast if you have less than 50% of your maximum.</span></li>
                  <li><span className="font-bold">Skip</span>: Skipping gives you Procrastinations (P) and restores energy.</li>
                </ul>
              </p>
            </PopoverContent>
          </Popover>
        </h2>

        {/* --- CASE 1: Lectures still remaining --- */}
        {game.nextLecture && !game.examsAttended ? (
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
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Potential Understanding (U) <span className="font-bold">{game.nextLecture.potentialUnderstandings} U</span>
                      </div>
                      <Progress
                        value={game.nextLecture.potentialUnderstandings / game.courses[game.nextLecture.courseIndex].maxUnderstandingsPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-purple-300"
                      />
                    </div>

                    {/* Understand Chance */}
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Understand Chance <span className="font-bold">{(game.nextLecture.understandChance * 100).toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={game.nextLecture.understandChance * 100}
                        className="h-3 rounded-full [&>div]:bg-green-300"
                      />
                    </div>

                    {/* Energy Cost */}
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Energy Cost: <span className="font-bold">{game.nextLecture.energyCost} E</span>
                      </div>
                      <Progress
                        value={game.nextLecture.energyCost / game.courses[game.nextLecture.courseIndex].maxEnergyCostPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-red-300"
                      />
                    </div>

                    {/* Procrastination Value */}
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        Procrastination (P) Value: <span className="font-bold">{game.nextLecture.procrastinationValue} P</span>
                      </div>
                      <Progress
                        value={game.nextLecture.procrastinationValue / game.courses[game.nextLecture.courseIndex].maxProcrastinationsPerLecture * 100}
                        className="h-3 rounded-full [&>div]:bg-blue-300"
                      />
                    </div>
                  </CardContent>

                </Card>
              );
            })()}


            {/* Buttons */}
            <div className="flex gap-2 m-2">
              <Button
                onClick={() => setGame(g => startRound(g, "attend"))}
                className={`${game.energy < game.nextLecture.energyCost ? "bg-neutral-500 hover:bg-neutral-500" : "bg-green-500 hover:bg-green-600"} text-white px-4 py-2 rounded`}
              >
                Attend
              </Button>
              <Button
                onClick={() => setGame(g => startRound(g, "skip"))}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Skip
              </Button>
            </div>

            <h1 className="font-bold flex items-center p-0 m-0">
              Lectures until Exams: {game.lecturesLeft}
            </h1>

            <div className="flex flex-col gap-1 w-full max-w-sm p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4" /> Energy: {game.energy} E / {game.maxEnergy} E
              </div>
              <Progress
                value={game.energy}
                max={game.maxEnergy}
                className="h-3 rounded-full"
              />
            </div>
          </div>
        ) : null}

        {/* --- CASE 2: No lectures left & Exams not yet attended --- */}
        {!game.nextLecture && !game.examsAttended ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <h2 className="text-lg font-bold">All lectures completed.</h2>
            <Button
              onClick={() => setGame(g => attendExams(g))}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Start Exams
            </Button>
          </div>
        ) : null}

        {/* --- CASE 3: Exams attended → Show results --- */}
        {game.examsAttended ? (
          <div className="flex flex-col items-center gap-4 mt-2 overflow-auto">
            <h2 className="text-lg font-bold">Exam Results</h2>

            <div className="space-y-2 w-full">
              {game.examResults.map((passed, i) =>
              {
                const course = game.courses[i];
                return (
                  <Card
                    key={i}
                    className={`border-2 ${passed ? "border-green-600 bg-green-950" : "border-red-600 bg-red-950"
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
            {game.examResults.filter(r => !r).length >= 2 ? (
              // Game Over → Reset Run only
              <Button
                variant="destructive"
                className="flex items-center gap-2 mt-4"
                onClick={() => setGame(initGame())}
              >
                <RefreshCcw className="w-4 h-4" /> Reset Run
              </Button>
            ) : (
              // Otherwise → Start Next Block
              <Button
                onClick={() => setGame(g => startNewBlock(g))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
              >
                Start Next Block
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Log */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content">
        <h2 className="font-bold m-1 flex items-center gap-2"> <Scroll className="w-5 h-5" /> Log</h2>
        <div
          className="flex flex-col-reverse overflow-y-auto flex-1"
          ref={logContainerRef}
        >
          {game.log.slice().map((entry, i) =>
          {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <Icon
                  className="w-4 h-4 shrink-0 inline-block"
                  style={{ color: entry.color }}
                  strokeWidth={2}
                />
                <span>{entry.message}</span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        mode="calendar"
      />
    </div>
  );
}
