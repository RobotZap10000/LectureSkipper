import { Box, Boxes, Check, HelpCircle, LayoutGrid, Package } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { saveGame, type GameState } from "@/game";
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
      const item = prev.items[itemSlotID];
      if (selected.includes(itemSlotID))
      {
        // Remove item selection
        selected.splice(selected.indexOf(itemSlotID), 1);

        // Calendar View selected items
        if (mode === "calendar" && item && prev.calendarViewSelectedItemIDs.includes(item.id))
        {
          prev.calendarViewSelectedItemIDs.splice(prev.calendarViewSelectedItemIDs.indexOf(item.id), 1);
        }
      } else
      {
        if(mode !== "calendar" || selected.length < prev.maxActivatedItems)
          selected.push(itemSlotID);

        // Calendar View selected items
        if (mode === "calendar")
        {
          if (item && !prev.calendarViewSelectedItemIDs.includes(item.id))
          {
            prev.calendarViewSelectedItemIDs.push(item.id);
          }
        }
      }

      const newState = { ...prev, selectedItemSlots: selected };

      saveGame(newState);

      return newState;
    });
  };

  const handleEmptySlotClick = (itemSlotID: number) =>
  {
    setGame(prev =>
    {
      const items = [...prev.items];
      const selected = [...prev.selectedItemSlots];

      let unboxedItem = prev.unboxedItem;

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
      }

      const newState = {
        ...prev,
        items,
        selectedItemSlots: [],
        unboxedItem,
      };

      saveGame(newState);

      return newState;
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

      const newState = { ...prev, items, selectedItemSlots: [] };

      saveGame(newState);

      return newState;
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
          <PopoverContent className="w-96" side="top">
            <h2 className="font-bold m-1 flex items-center gap-2">
              <Box className="w-5 h-5" /> Items
            </h2>

            <p className="text-sm">
              Before you attend/skip a lecture, you can activate items to apply bonuses and special effects.
              <br></br>
              Unless stated otherwise, <strong>items have no usage limits</strong>.
            </p>

            <br></br>

            <h2 className="font-bold m-1 flex items-center gap-2">
              <Boxes className="w-5 h-5" /> Types
            </h2>

            <p className="text-sm">
              <ul className="list-disc pl-4 pt-2">
                <li>On <strong>Attend</strong>: activates when attending a lecture </li>
                <li>On <strong>Skip</strong>: activates when skipping a lecture </li>
                <li>On <strong>Use</strong>: activates when attending or skipping a lecture </li>
                <li>On <strong>Round</strong>: always activates, even if the item is not selected </li>
                <li><strong>Consumable</strong>: used up after attending or skipping a lecture </li>
              </ul>
            </p>

            <br></br>

            <h2 className="font-bold m-1 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" /> Management
            </h2>

            <p className="text-sm">
              Click on an item to select/activate it. Click on an empty slot to move items there. Outside of the Calendar view, click on the Trash button to remove items.
            </p>
          </PopoverContent>
        </Popover>
      </h2>

      <div className="flex-1 flex items-center justify-center overflow-auto p-5">
        <div className="flex flex-col items-center">

          {mode === "calendar" && (
            <h2 className="font-bold m-1 flex items-center gap-2 p-2">
              <Check className={`w-5 h-5 ${game.selectedItemSlots.length === game.maxActivatedItems ? "text-green-500" : ""}`} /> Activated {game.selectedItemSlots.length} / {game.maxActivatedItems}
            </h2>
          )}

          <div className="grid grid-cols-6 grid-rows-6 gap-1">
            {game.items.map((item, i) => (
              <ItemSlot
                key={i}
                game={game}
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
