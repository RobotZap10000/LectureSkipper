import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { GameState } from "@/game";
import { type ItemData } from "@/item";
import { itemMetaRegistry } from "@/itemRegistry";
import chroma from "chroma-js";

interface ItemSlotProps
{
  game: GameState;
  item: ItemData | null;
  selected: boolean;
  onClick: () => void;
  size: number;
  threeDHeight?: number;
}

export default function ItemSlot({
  game,
  item,
  selected,
  onClick,
  size = 40,
  threeDHeight = 3,
}: ItemSlotProps)
{
  const [isTouch, setIsTouch] = useState(false);
  const [open, setOpen] = useState(false);

  // Detect touch devices
  useEffect(() =>
  {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!item)
  {
    return (
      <div
        className={`relative flex items-center justify-center rounded bg-accent cursor-pointer
        ${selected ? "ring-2 ring-green-500" : ""}`}
        onClick={onClick}
        style={{ width: size, height: size }}
      />
    );
  }

  const Icon = itemMetaRegistry[item.name].icon;

  const isEnabled = itemMetaRegistry[item.name].getEnabled(item, game);

  const bg =
    item.rarity === 1
      ? "rgba(40, 93, 40, 1)"
      : item.rarity === 2
        ? "rgba(40, 77, 132, 1)"
        : "rgba(134, 116, 28, 1)";

  const outline = chroma(bg).darken(1.5).hex();

  // Precomputed dynamic values
  const restingShadow = `0 ${threeDHeight}px 0 1px ${outline}`;
  const pressedShadow = `0 0 0 1px ${outline}`;
  const translateResting = `${-threeDHeight}px`;
  const translatePressed = `0px`;

  const slot = (
    <div
      className="relative rounded cursor-pointer flex items-center justify-center select-none"
      onClick={onClick}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: restingShadow,
        transform: `translateY(${translateResting})`,
        position: "relative",
        transition: "box-shadow 0.05s, transform 0.05s",
      }}
      onMouseDown={(e) =>
      {
        e.currentTarget.style.boxShadow = pressedShadow;
        e.currentTarget.style.transform = `translateY(${translatePressed})`;
      }}
      onMouseUp={(e) =>
      {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.transform = `translateY(${translateResting})`;
      }}
      onMouseLeave={(e) =>
      {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.transform = `translateY(${translateResting})`;
      }}
    >
      {/* Selected outline */}
      {selected && (
        <div
          className="absolute inset-0 rounded pointer-events-none"
          style={{
            border: "2px solid rgba(0,255,0,0.8)",
            boxSizing: "border-box",
          }}
        />
      )}

      {Icon && (
        <Icon
          style={{
            width: size * 0.6,
            height: size * 0.6,
            color: isEnabled ? "white" : "crimson",
          }}
        />
      )}

      <div
        className="absolute top-0 right-0 bg-black text-white text-xs font-bold rounded-bl px-1"
        style={{ lineHeight: "1rem" }}
      >
        {item.level}
      </div>
    </div>
  );


  function renderDescription(desc: string)
  {
    const parts = desc.split(/\*\*(.+?)\*\*/);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => !isTouch && setOpen(true)}
        onMouseLeave={() => !isTouch && setOpen(false)}
      >
        {slot}
      </PopoverTrigger>

      <PopoverContent
        className={`w-96 p-4 rounded-md bg-popover shadow-lg z-10 ring-2 ${item.rarity === 1
          ? "ring-green-600"
          : item.rarity === 2
            ? "ring-blue-600"
            : "ring-yellow-600"
          }`}
        side="bottom"
        sideOffset={75}
      >
        <div className="flex gap-3 items-center">
          {Icon && <Icon className="w-8 h-8 shrink-0 inline-block" />}
          <div>
            <h4 className="font-bold p-1 text-lg">
              / {item.name} - Level {item.level} /
            </h4>
            <div className="text-sm">
              {renderDescription(itemMetaRegistry[item.name].getDescription(item))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
