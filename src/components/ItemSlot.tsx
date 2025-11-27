// components/ItemSlot.tsx
import
{
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import type { Item } from "@/game";

interface ItemSlotProps
{
  item: Item | null;
  selected: boolean;
  onClick: () => void;
  size: number;
}

export default function ItemSlot({
  item,
  selected,
  onClick,
  size = 40,
}: ItemSlotProps)
{
  const Icon = item?.icon;

  const slot = (
    <div
      className={`
      relative
      flex items-center justify-center rounded bg-accent cursor-pointer
      ${selected ? "ring-2 ring-green-500" : ""}
    `}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {Icon && <Icon style={{ width: size * 0.6, height: size * 0.6 }} />}

      {item && (
        <div
          className="absolute top-0 right-0 bg-black text-white text-xs font-bold rounded-bl px-1"
          style={{ lineHeight: "1rem" }}
        >
          {item.level}
        </div>
      )}
    </div>
  );


  if (!item) return slot;

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{slot}</HoverCardTrigger>
      <HoverCardContent className="w-64" side="bottom" sideOffset={50}>
        <div className="flex gap-3 items-start">
          {Icon && <Icon className="w-8 h-8" />}
          <div>
            <h4 className="font-bold">{item.name} - Level {item.level}</h4>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
