import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { GameState } from "@/game";
import { type ItemData } from "@/item";
import { itemMetaRegistry } from "@/itemRegistry";

interface ItemSlotProps
{
  game: GameState;
  item: ItemData | null;
  selected: boolean;
  onClick: () => void;
  size: number;
}

export default function ItemSlot({
  game,
  item,
  selected,
  onClick,
  size = 40,
}: ItemSlotProps)
{
  let Icon = null;
  if (item) Icon = itemMetaRegistry[item.name].icon;

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
      {Icon && item && <Icon style={{ width: size * 0.6, height: size * 0.6, color: itemMetaRegistry[item.name].getEnabled(item, game) ? "white" : "crimson" }} />}

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

  function renderDescription(desc: string)
  {
    const parts = desc.split(/\*\*(.+?)\*\*/); // split on **bold**
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  }

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
        <div className="flex gap-3 items-center">
          {Icon && <Icon className={`w-8 h-8 shrink-0 inline-block`} />}
          <div>
            <h4 className="font-bold p-1 text-lg">/ {item.name} - Level {item.level} /</h4>
            <p className="text-sm">
              {renderDescription(itemMetaRegistry[item.name].getDescription(item))}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
