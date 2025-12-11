

// This file has the story for the game.

// If you want to avoid spoilers, then don't read this file.





























































import { PenOff } from "lucide-react";
import React from "react";
import { CustomButton } from "./components/CustomButton";
import type { GameState } from "./game";

// The key represents the block number that the story popup appears at
export const story: Record<string, (game: GameState, setGame: React.Dispatch<React.SetStateAction<GameState>>) => React.ReactNode> = {

  "4": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      The first 5 blocks have passed.
      <br /> <br />
      It was already clear from day one that this place is not what it seems like. On the surface, a professional academic environment, but deep down, it's a trap — a prison that locks you up for eternity with no hope of escape. I haven't found a way out yet, but I know that there must be one, as hopeless as my search may be.
      <br /> <br />
      Whispers spread of a legendary student who allegedly understood chapter four of our last math course. How they did it is beyond me, but I am glad they are still here. The same can't be said for most of the other students.
      <br /> <br />
      More than half of us have already failed. The number of people who show up is going down by the day.
      <br /> <br />
      I need to find a way out.
    </div>
  ),

  "7": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      10 blocks have passed.
      <br /> <br />
      Come to think of it, I can't even remember why I first enrolled here. Or, for that matter, <span className="italic">how</span> I got here in the first place. My memory is blank and I can barely remember my past. All that's been on my mind lately are the courses.
      <br /> <br />
      These trinkets, they are useful. They seem to materialize in my room whenever I get too stressed out. I don't know how they appear, but regardless of that, I am thankful. With them, I can manage my studies better.
      <br /> <br />
      Many cannot seem to figure it out though, and it shows in the numbers. More than 95% of the students are now gone.
      <br /> <br />
      My search continues. Yet, as time goes on, it gets harder and harder to keep up with the courses.
    </div>
  ),

  "10": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      It's rare for me to see a student in the corridors. Or outside. Or anywhere.
      <br /> <br />
      I saw a dream the other day. It was the first one in a long while. I remember seeing a grocery store in there. Food. When was the last time I ate anything? What started as a casual thought eventually spiralled out of control.
      <br /> <br />
      This place is a trap. Hunger is absent so that more time can be spent studying. Memories of your past slowly fade away so that you cannot think of them. Whenever I go outside, I suddenly appear wherever I needed to go, meaning that I can't even take a breath of fresh air. I haven't listened to music in ages, and everything feels so still and lifeless. All you can do is study. It is without a doubt that this place is some alternate dimension.
      <br /> <br />
      Despite all of that, I still believe that there is a way out. There must be.
      <br /> <br />
      There has to be.
    </div>
  ),

  "13": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      I'm still kicking.
      <br /> <br />
      My performance on the exams has been good, but I am always stressed out. I suppose this leads to more trinkets to use during my time here, but I wonder, where do they come from? Perhaps this place feeds off of the anxiety of its students, and the items are just a byproduct of that.
      <br /> <br />
      Most windows cannot be opened here. Whenever I try, I instead find myself walking on ahead to wherever I was going. It's like this place knows and is preventing me from getting out. However, I found a window on the top-most floor that has a hole in it. It is partially shattered, but the shards that still hold on to the frame are unusually strong. If I can break it down, I can probably go outside. Every evening, I go and chip away at it with whatever I can find in the building.
      <br /> <br />
      Whether that will lead anywhere is another question, but right now it's the closest thing to an exit that I've found.
    </div>
  ),

  "16": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      Update: I got outside onto the roof.
      <br /> <br />
      When I went outside, I immediately noticed how quiet it was. No wind, no birds or animals, no cars driving by. When I stepped on the roof, I saw dust fly up from where I landed my feet. There were no bright colors in sight — everything was as uninteresting and gray as possible.
      <br /> <br />
      It doesn't seem like there is a way to get down from the roof, so I've started looking into ways to get past this obstacle. I don't have much to work with, though, especially considering the fact that most doors are locked here.
      <br /> <br />
      Maybe I can find something at the library.
    </div>
  ),

  "19": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      People really do write books about anything, huh? "10 Illegal Life Skills", the book that teaches you how to pick locks, among other things. I won't complain.
      <br /> <br />
      It was disappointing to find that most of the locked doors don't lead anywhere. Every room that seemed important was devoid of anything. The desks were empty, drawers and cabinets too. The chairs were in perfect condition, as if not even a single soul had ever touched them.
      <br /> <br />
      That was, until I went to the lower floors. It was extremely quiet, just like everything else, but at this point I had gotten used to it. What's important, though, is that I found some rope in what looked like to be a small gym. I don't know who in their right mind would set up a gym here, where there is no sunlight or ventilation, but nevertheless, I found what I was looking for.
      <br /> <br />
      Tomorrow I'm gonna go to the rooftop again. I should be able to attach the rope to something and climb down. To be completely honest, I don't know what I'm looking for, but I also can't just stay here forever and do nothing.
    </div>
  ),

  "22": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      Do not go outside. Do not leave the building. Do not attempt to escape. Do not quit your studies. Do not get sidetracked. Do not go onto the rooftop. Do not climb down. Do not go into the main building. Do not go into the main building. Do not go into the main building.
      <br /> <br />
      Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave. Do not leave.
      <br /> <br />
      There is no way out. Even if there was, it would be in the main building, and because of that, it is not worth considering under any circumstances.
      <br /> <br />
      Do not leave the building.
    </div>
  ),

  "25": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      The broken window has been sealed off now.
      <br /> <br />
      After the last exam period, I found something in my mailbox. I haven't been checking it, because it's always empty, but something compelled me to look into it that day, and it had a letter in it.
      <br /> <br />
      The contents were short: "Final Exams. Block 30. Prepare."
      <br /> <br />
      I am skeptic, because it's not unusual for this place to give you false hope, but at the same time, it's the first message of any kind that I have received here. It must mean something.
    </div>
  ),

  "28": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      Block 30 is getting closer by the day. At the same time, the building seems to be "deteriorating".
      <br /> <br />
      I've noticed that some rooms have just disappeared. Some no longer have doors or windows. Some do still have them, but opening them leads to a dark void. Furthermore, the lighting is getting dimmer. I can barely make out details anymore.
      <br /> <br />
      The exam room is massive, but there is only one seat there in the very center. Whenever I walk in, there are no people. Instructions are given through speakers via pre-recorded messages that I've heard hundreds of times. The room has always looked the same, but now the dark void is swallowing it, only leaving me a thin pathway from the entrance to the seat. While filling in the answers, I can't hear or see anything around me.
      <br /> <br />
      It's been years since I last saw anyone. I really am the last person here.
    </div>
  ),

  "30": (game, setGame) => (
    <div className="p-3 rounded bg-neutral-900/80 border border-neutral-700 text-sm text-neutral-200">
      This is it. Block 30.
      <br /> <br />
      I think I get this place now. It lures in those who intend on cheating or otherwise trying to take advantage of the academic system. Victims are trapped here as punishment. Failing too many exams sends them back to block 1. The only way to get out is to pass the final exams, which I am going to attempt now.
      <br /> <br />
      I think the system can only restart once everyone has dropped out. This is why I haven't seen anyone else in a long time. This also explains why the place has been falling apart. There is almost nothing left anymore; only my room, the lecture room and the exam room remain. Everything else is pitch black, and walking from one place to another is either instantaneous or a solitary experience where all I can hear is the echo of my footsteps. This place is getting ready to reset the cycle.
      <br /> <br />
      I don't know what will happen after I complete the exams, assuming I even pass.
      <br /> <br />
      All I can do now is give it my best shot.
    </div>
  ),

  "31": (game, setGame) => (
    <div
      className="absolute left-0 top-0 z-500 w-screen h-screen bg-black flex flex-col items-center justify-center gap-4 text-xl"
      style={{
        animation: "flashSequence 8s forwards",
      }}
    >
      <style>{`
        @keyframes lineFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes flashSequence {
          0% { opacity: 0; background-color: white; }
          50% { opacity: 1; background-color: white; }
          100% { opacity: 1; background-color: black; }
        }
  `}</style>

      <div className="max-w-[500px] flex flex-col items-center justify-center gap-4 text-lg text-white p-3">
        <div style={{ animation: "lineFade 1s forwards", animationDelay: "8s", opacity: 0 }}>
          I did it.
        </div>

        <div style={{ animation: "lineFade 1s forwards", animationDelay: "9s", opacity: 0 }}>
          It's finally over.
        </div>

        <div style={{ animation: "lineFade 1s forwards", animationDelay: "12s", opacity: 0 }}>
          I'm going to go back into the real world soon.
        </div>

        <div style={{ animation: "lineFade 1s forwards", animationDelay: "16s", opacity: 0 }}>
          It's weird to think that next to no time has passed at all in the real world, while we have spent god knows how long in here.
        </div>

        <div style={{ animation: "lineFade 1s forwards", animationDelay: "25s", opacity: 0 }}>
          I will never cheat again.
        </div>

        <br />

        <div className="flex items-center gap-2 text-5xl" style={{ animation: "lineFade 1s forwards", animationDelay: "28s", opacity: 0 }}>
          <PenOff className="w-10 h-10" /> Lecture Skipper
        </div>

        <div style={{ animation: "lineFade 1s forwards", animationDelay: "29s", opacity: 0 }}>
          Thanks for playing!
        </div>

        <br />

        <CustomButton
          style={{ animation: "lineFade 1s forwards", animationDelay: "30s", opacity: 0 }}
          onClick={() => setGame((game) => ({ ...game, story: -1 }))}
          color="DarkOrchid"
        >
          Continue in Endless Mode
        </CustomButton>

      </div>

    </div>

  ),

};