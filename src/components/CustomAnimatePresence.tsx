import { SettingsContext } from "@/App";
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
  let { settings, setSettings } = useContext(SettingsContext)!;

  return (
    <>
      {settings.animations !== "minimal" ? (
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