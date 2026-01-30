import { AnimationContext } from "@/App";
import
{
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import
{
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { motion } from "framer-motion";

import { HelpCircle, type LucideIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";

interface CustomInfoCardProps
{
  icon: LucideIcon;
  title: string;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CustomInfoCard({
  icon: Icon,
  title,
  help,
  children,
  className = "",
}: CustomInfoCardProps)
{
  let { animations, setAnimations } = useContext(AnimationContext)!;

  const storageKey = `${title}-help`;
  const [helpSeen, setHelpSeen] = useState<boolean>(true);

  useEffect(() =>
  {
    setHelpSeen(localStorage.getItem(storageKey) === "seen");
  }, [storageKey]);

  const handleHelpOpen = () =>
  {
    if (!helpSeen)
    {
      localStorage.setItem(storageKey, "seen");
      setHelpSeen(true);
    }
  };

  return (
    <motion.div
      className={`p-2 rounded flex flex-col max-w-[500px] w-full h-content overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}

      // Spring transition for a "snappy" feel
      transition={animations === "full" ? {
        type: "spring",
        damping: 25,
        stiffness: 300,
        layout: { duration: 0.3 }, // Smooths the movement of other cards
        delay: Math.random() * 0.2,
      } : { duration: 0 }}
    >
      <Card className="gap-4 w-full rounded-xl border shadow-sm">
        <CardHeader className="gap-0">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <span className="flex-1">{title}</span>

            {help && (
              <Popover onOpenChange={(open) => open && handleHelpOpen()}>
                <PopoverTrigger asChild>
                  <motion.div
                    animate={
                      !helpSeen
                        ? { opacity: [0.2, 1, 0.2] }
                        : { opacity: 1 }
                    }
                    transition={
                      !helpSeen
                        ? {
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                        : undefined
                    }
                  >
                    <HelpCircle className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-white transition-colors" />
                  </motion.div>
                </PopoverTrigger>

                <PopoverContent className="w-96" side="top">
                  <div className="text-sm">
                    {typeof help === "string" ? <div>{help}</div> : help}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}