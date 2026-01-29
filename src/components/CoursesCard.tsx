import chroma from "chroma-js";

import { CustomInfoCard } from "./CustomInfoCard";
import { GraduationCap, BookAlert, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_MINIMUM_LECTURES_LEFT, type GameState } from "@/game";
import { EffectBadge } from "./EffectBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CustomAnimatePresence } from "@/components/CustomAnimatePresence";
import { useContext } from "react";
import { AnimationContext } from "@/App";

interface CoursesCardProps
{
  game: GameState;
}

export function CoursesCard({ game }: CoursesCardProps)
{
  let { animations, setAnimations } = useContext(AnimationContext)!;

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
            Every block, you have 3 (or more) courses and a set amount of lectures before exams. Attend lectures to acquire Understanding (U). Every course is guaranteed to have at least {DEFAULT_MINIMUM_LECTURES_LEFT} lectures.
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
            You can gain more Understanding (U) than the course requires. Going above 100% with the chance to pass does nothing.
          </p>

          <br />

          <h2 className="font-bold m-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Score
          </h2>

          <p className="text-sm">
            You get 1 Score for each Understanding received <span className="font-bold">from a lecture</span>. Items that directly give Understandings do not give Score, but items that increase the Understanding given by a lecture do indirectly contribute to your Score.
          </p>
        </>
      }
    >
      <div className="col-span-1 flex flex-col h-full">
        <CustomAnimatePresence>
          <div className="flex-1 space-y-2">
            {game.courses.map((c, i) =>
            {
              const progress = (c.understandings / c.goal) * 100;
              const progressCapped = Math.min(progress, 100);

              const bg = chroma(c.color).brighten(1.2).hex();
              const border = chroma(c.color).brighten(2).hex();
              const textColor = chroma.contrast(bg, "white") > 4.5 ? "white" : "black";

              return (
                <motion.div
                  layout={animations === "full"}
                  layoutId={animations === "full" ? "course-" + c.title + "-color-" + c.color + "-view-" + game.view : undefined}
                  key={"course-" + c.title + "-color-" + c.color + "-view-" + game.view}
                  initial={animations === "full" ? { opacity: 0, x: -100, scale: 0.5 } : undefined}
                  animate={animations === "full" ? { opacity: 1, x: 0, scale: 1 } : undefined}
                  exit={animations === "full" ? { opacity: 0, x: 100, scale: 0.5 } : undefined}
                  transition={{
                    type: "spring",
                    damping: 35,
                    stiffness: 300,
                    delay: i * 0.15
                  }}
                >
                  <Card
                    className={`w-full gap-2 border-2 relative ${game.nextLecture?.courseIndex === i ? "outline-2 outline-neutral-100" : ""}`}
                    style={{
                      backgroundColor: bg,
                      borderColor: border,
                      color: textColor,
                    }}
                  >
                    <CustomAnimatePresence>
                      {/* --- Gained Understandings Text Effect --- */}
                      {game.courseTexts.length > i && game.courseTexts[i].length > 0 && (
                        <motion.div
                          className="absolute right-10 top-5"
                          layout={animations !== "minimal"}
                          key={"course-" + i + c.title + "-color-" + c.color + "-view-" + game.view + "-textEffect-" + game.courseTexts[i] + "-lecturesLeft-" + game.lecturesLeft}
                          layoutId={animations !== "minimal" ? "course-" + i + c.title + "-color-" + c.color + "-view-" + game.view + "-textEffect-" + game.courseTexts[i] + "-lecturesLeft-" + game.lecturesLeft : undefined}
                          initial={animations !== "minimal" ? { opacity: 0, x: -100, scale: 0.5 } : undefined}
                          animate={animations !== "minimal" ? { opacity: 1, x: 0, scale: 1 } : undefined}
                          exit={animations !== "minimal" ? { opacity: 0, x: 0, scale: 0.5 } : undefined}
                          transition={{
                            type: "spring",
                            damping: 35,
                            stiffness: 300,
                          }}
                        >
                          <span className={`text-4xl font-bold text-shadow-lg ${game.courseTexts[i][0] == "-" ? "text-red-500" : game.courseTexts[i][0] == "+" ? "text-green-500" : "text-white"}`}>{game.courseTexts[i]}</span>
                        </motion.div>
                      )}
                    </CustomAnimatePresence>

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
                      <Progress value={progressCapped} className="h-4 rounded" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CustomAnimatePresence>

        <div className="font-bold m-1 flex flex-col gap-2">
          <p>Score: {game.score}</p>
        </div>
      </div>
    </CustomInfoCard >
  );
}