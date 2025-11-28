import { Box, Check, HelpCircle, LayoutGrid, Package } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import type { GameState } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
  mode: "calendar" | "normal";
}

export default function Inventory({
  game,
  setGame,
  mode,
}: Props)
{

  const handleItemClick = (itemSlotID: number) =>
  {
    setGame(prev =>
    {
      const selected = [...prev.selectedItemSlots];
      if (selected.includes(itemSlotID))
      {
        selected.splice(selected.indexOf(itemSlotID), 1);
      } else
      {
        if (mode === "calendar" && prev.selectedItemSlots.length >= prev.maxActivatedItems) return prev;
        selected.push(itemSlotID);
      }
      return { ...prev, selectedItemSlots: selected };
    });
  };

  const handleEmptySlotClick = (itemSlotID: number) =>
  {
    setGame(prev =>
    {
      const items = [...prev.items];
      const selected = [...prev.selectedItemSlots];

      let unboxedItem = prev.unboxedItem;
      let forgeItem = prev.forgeItem;

      if (selected.length === 1)
      {
        const sourceIndex = selected[0];
        const item = items[sourceIndex];
        if (item)
        {
          items[itemSlotID] = item;
          items[sourceIndex] = null;
        }
      } else if (unboxedItem)
      {
        items[itemSlotID] = unboxedItem;
        unboxedItem = null;
      } else if (forgeItem)
      {
        items[itemSlotID] = forgeItem;
        forgeItem = null;
      }

      return {
        ...prev,
        items,
        selectedItemSlots: [],
        unboxedItem,
        forgeItem,
      };
    });
  };

  const handleTrash = () =>
  {
    setGame(prev =>
    {
      const items = [...prev.items];
      const selected = [...prev.selectedItemSlots];

      selected.forEach(slotID =>
      {
        items[slotID] = null;
      });

      return { ...prev, items, selectedItemSlots: [] };
    });
  };

  return (
    <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full">
      <h2 className="font-bold m-1 flex items-center gap-2">
        <Package className="w-5 h-5" /> Inventory

        <Popover>
          <PopoverTrigger asChild>
            <HelpCircle className="w-4 h-4 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-64" side="top">
            <h2 className="font-bold m-1 flex items-center gap-2">
              <Box className="w-5 h-5" /> Items
            </h2>

            <p className="text-sm">
              Before you attend/skip a lecture or start your exams, you can activate items to apply bonuses and special effects.
              <br></br>
              Unless otherwise stated, items have no usage limits.
            </p>

            <br></br>

            <h2 className="font-bold m-1 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" /> Management
            </h2>

            <p className="text-sm">
              Click on an item to select/activate it. Click on an empty slot to move items there. While in the Forge or Market, click on the Trash button to remove them.
            </p>
          </PopoverContent>
        </Popover>
      </h2>

      <div className="flex-1 flex items-center justify-center overflow-auto p-5">
        <div className="flex flex-col items-center">

          {mode === "calendar" && (
            <h2 className="font-bold m-1 flex items-center gap-2 p-2">
              <Check className="w-5 h-5" /> Activated {game.selectedItemSlots.length} / {game.maxActivatedItems}
            </h2>
          )}

          <div className="grid grid-cols-6 grid-rows-6 gap-1">
            {game.items.map((item, i) => (
              <ItemSlot
                key={i}
                item={item ?? null} // explicitly null if empty
                selected={game.selectedItemSlots.includes(i)}
                onClick={() =>
                {
                  if (item)
                  {
                    handleItemClick(i); // item exists
                  } else
                  {
                    handleEmptySlotClick(i); // empty slot
                  }
                }}
                size={40}
              />
            ))}
          </div>


          {mode === "normal" && (
            <button
              onClick={handleTrash}
              disabled={game.selectedItemSlots.length === 0}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
            >
              Trash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
