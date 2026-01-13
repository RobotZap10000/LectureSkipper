import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { GameState } from "@/game";
import { type ItemData } from "@/item";
import { itemMetaRegistry } from "@/itemRegistry";
import chroma from "chroma-js";
import { renderDescription } from "@/stringUtils";

interface ItemComponentProps
{
  game: GameState;
  item: ItemData;
  size: number;
  threeDHeight?: number;
}

export default function ItemComponent({
  game,
  item,
  size,
  threeDHeight = 3,
}: ItemComponentProps)
{
  const [isTouch, setIsTouch] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() =>
  {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const Icon = itemMetaRegistry[item.name].icon;
  const isEnabled = itemMetaRegistry[item.name].getEnabled(item, game);

  const selected = game && game.selectedItemIDs && game.selectedItemIDs.includes(item.id);
  const finalHeight = selected ? threeDHeight * 2 : threeDHeight;

  let bg = "rgba(40, 93, 40, 1)";
  switch (item.rarity)
  {
    case 1: bg = "rgba(40, 93, 40, 1)"; break;
    case 2: bg = "rgba(40, 77, 132, 1)"; break;
    case 3: bg = "rgba(134, 116, 28, 1)"; break;
  }
  if (selected)
  {
    bg = chroma(bg).brighten(1).hex();
  }

  let outline = chroma(bg).darken(1.5).hex();
  if (selected)
  {
    outline = chroma(outline).brighten(0.25).hex();
  }

  const restingShadow = `0 ${finalHeight}px 0 1px ${outline}`;
  const pressedShadow = `0 0 0 1px ${outline}`;
  const restingTranslate = `${-finalHeight}px`;
  const pressedTranslate = `0px`;

  const itemNode = (
    <div
      className={`inset-0 rounded flex items-center justify-center select-none z-10 cursor-pointer`}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: restingShadow,
        transform: `translateY(${restingTranslate})`,
        transition: "box-shadow 0.15s, transform 0.15s, background 0.25s",
      }}
      onMouseDown={(e) =>
      {
        e.currentTarget.style.boxShadow = pressedShadow;
        e.currentTarget.style.transform = `translateY(${pressedTranslate})`;
      }}
      onMouseUp={(e) =>
      {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.transform = `translateY(${restingTranslate})`;
      }}
      onMouseLeave={(e) =>
      {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.transform = `translateY(${restingTranslate})`;
      }}
      onTouchStart={(e) =>
      {
        e.currentTarget.style.boxShadow = pressedShadow;
        e.currentTarget.style.transform = `translateY(${pressedTranslate})`;
      }}
      onTouchEnd={(e) =>
      {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.transform = `translateY(${restingTranslate})`;
      }}
    >
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => !isTouch && setOpen(true)}
        onMouseLeave={() => !isTouch && setOpen(false)}
      >
        {itemNode}
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
          {Icon && <Icon className="w-8 h-8 shrink-0" />}
          <div>
            <h4 className="font-bold text-lg">
              / {item.name} – Level {item.level} /
            </h4>
            <div className="text-sm">
              {renderDescription(
                itemMetaRegistry[item.name].getDescription(item)
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
