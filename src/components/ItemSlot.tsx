import type { GameState } from "@/game";
import React from "react";

interface ItemSlotProps
{
  size: number;
  game: GameState;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function ItemSlot({
  size,
  game,
  onClick,
  children,
}: ItemSlotProps)
{
  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center justify-center rounded bg-accent
        ${game && ((game.selectedItemIDs && game.selectedItemIDs.length > 0) || game.unboxedItem) ? "cursor-pointer" : "cursor-default" /* If we can move an item to a different slot or we have an unboxed item that we can place into an empty slot, show pointer */}
      `}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
