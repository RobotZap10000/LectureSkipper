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
  return (
    <motion.div
      className={`p-2 rounded flex flex-col max-w-[500px] w-full h-content overflow-hidden ${className}`}

      // Entry/Exit Animations
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}

      // Spring transition for a "snappy" feel
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        layout: { duration: 0.3 }, // Smooths the movement of other cards
        delay: Math.random() * 0.2,
      }}
    >
      <Card className="gap-4 w-full rounded-xl border shadow-sm">
        <CardHeader className="gap-0">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <span className="flex-1">{title}</span>

            {help && (
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircle className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-white transition-colors" />
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