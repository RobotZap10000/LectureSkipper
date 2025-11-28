import type { Item } from "@/game";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
      onClick={onClick}
      style={{
        width: size,
        height: size,
        background: item
          ? item.rarity === 1
            ? "rgba(40, 93, 40, 1)"
            : item.rarity === 2
              ? "rgba(40, 77, 132, 1)"
              : "rgba(134, 116, 28, 1)"
          : undefined, // keeps bg-accent gray
      }}
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
    <Popover>
      <PopoverTrigger asChild>{slot}</PopoverTrigger>
      <PopoverContent
        className={`w-96 p-4 rounded-md bg-popover shadow-lg z-10 ring-2 ${item
            ? item.rarity === 1
              ? "ring-green-600"
              : item.rarity === 2
                ? "ring-blue-600"
                : "ring-yellow-600"
            : "ring-gray-400"
          }`}
        side="bottom"
        sideOffset={75}
      >
        <div className="flex gap-3 items-start">
          {Icon && <Icon className="w-16" />}
          <div>
            <h4 className="font-bold">{item.name} - Level {item.level}</h4>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
