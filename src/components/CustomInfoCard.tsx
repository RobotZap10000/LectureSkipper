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
    <div
      className={
        "p-2 rounded flex flex-col max-w-[500px] w-full h-content " +
        className
      }
    >
      <Card className="gap-4 w-full rounded-xl">
        <CardHeader className="gap-0">
          <CardTitle className="flex items-center gap-2">
            {/* Main Icon */}
            {Icon && <Icon className="w-5 h-5" />}

            {/* Title */}
            {title}

            {/* Optional Help Popover */}
            {help && (
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircle className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-white" />
                </PopoverTrigger>

                <PopoverContent className="w-96" side="top">
                  <div className="text-sm">
                    {typeof help === "string" ? <p>{help}</p> : help}
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
    </div>
  );
}
