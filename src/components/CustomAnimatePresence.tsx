import { AnimationContext } from "@/App";
import { useContext } from "react";
import { AnimatePresence } from "framer-motion";

interface CustomAnimatePresenceProps
{
  children: React.ReactNode;
  mode?: "popLayout" | "sync" | "wait" | undefined;
}

export function CustomAnimatePresence({
  children,
  mode = "popLayout",
}: CustomAnimatePresenceProps)
{
  let { animations, setAnimations } = useContext(AnimationContext)!;

  return (
    <>
      {animations !== "minimal" ? (
        <AnimatePresence mode={mode}>
          {children}
        </AnimatePresence>
      ) : (
        <>
          {children}
        </>
      )}
    </>

  );
}