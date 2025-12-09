import chroma from "chroma-js";

import { CustomInfoCard } from "./CustomInfoCard";
import { GraduationCap, BookAlert } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GameState } from "@/game";
import { EffectBadge } from "./EffectBadge";

interface CoursesCardProps
{
  game: GameState;
}

export function CoursesCard({ game }: CoursesCardProps)
{
  return (
    <CustomInfoCard
      icon={GraduationCap}
      title={`Courses - Block ${game.block}`
      }
      help={
        <>
          <h2 className="font-bold m-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Courses
          </h2>

          <p className="text-sm">
            Every block, you have 3 courses and a set amount of lectures before exams. Attend lectures
            to acquire Understanding (U).
          </p>

          <br />

          <h2 className="font-bold m-1 flex items-center gap-2">
            <BookAlert className="w-5 h-5" /> Exams
          </h2>

          <p className="text-sm">
            Your chance of passing a course depends on the amount of Understanding (U) acquired during
            the block.{" "}
            <span className="italic text-red-500">
              Failing 2 or more exams in a block results in a game over.
            </span>
            <br />
            <br />
            You can gain more Understanding (U) than the course requires. The chance to pass will be
            capped at 100%.
          </p>
        </>
      }
    >
      <div className="col-span-1 flex flex-col h-full">
        <div className="flex-1 space-y-2">
          {game.courses.map((c, i) =>
          {
            const progress = Math.min((c.understandings / c.goal) * 100, 100);

            const bg = chroma(c.color).brighten(1.2).hex();
            const border = chroma(c.color).brighten(2).hex();
            const textColor = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

            return (
              <Card
                key={c.title}
                className={`w-full gap-2 border-2 ${game.nextLecture?.courseIndex === i ? "outline-2 outline-neutral-100" : ""}`}
                style={{
                  backgroundColor: bg,
                  borderColor: border,
                  color: textColor,
                }}
              >
                <CardHeader>
                  <CardTitle>{c.title}</CardTitle>

                  <CardDescription
                    style={{
                      color: textColor === "white" ? "#e5e5e5" : "#333",
                    }}
                  >
                    {c.understandings} U / {c.goal} U • Chance to pass: {progress.toFixed(0)}%
                  </CardDescription>

                  {/* --- Effects Section (Badges) --- */}
                  {c.effects.length > 0 && (
                    <div className="flex flex-wrap gap-2 m-0 p-0">
                      {c.effects.map((effect, index) => (
                        <EffectBadge key={effect.id ?? index} effect={effect} game={game} />
                      ))}
                    </div>
                  )}

                </CardHeader>

                <CardContent>
                  <Progress value={progress} className="h-4 rounded" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="font-bold m-1 flex flex-col gap-2">
          <p>Score: {game.score}</p>
        </div>
      </div>
    </CustomInfoCard >
  );
}