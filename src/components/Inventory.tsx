import { Box, Boxes, Check, LayoutGrid, ListOrdered, Package } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { saveGame, type GameState } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { CustomInfoCard } from "./CustomInfoCard";
import { itemUtils } from "@/item";
import { CustomButton } from "./CustomButton";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function Inventory({
  game,
  setGame,
}: Props)
{

  const handleItemClick = (itemID: string) =>
  {
    setGame(prev =>
    {
      let selected = [...prev.selectedItemIDs];
      if (selected.includes(itemID))
      {
        // Remove item selection
        selected.splice(selected.indexOf(itemID), 1);
      } else
      {
        if (game.view === "Calendar")
        {
          if (selected.length < prev.maxActivatedItems)
            selected.push(itemID);
        } else
        {
          selected = [itemID];
        }
      }

      const newState = { ...prev, selectedItemIDs: selected };

      saveGame(newState);

      return newState;
    });
  };

  const handleEmptySlotClick = (itemSlotID: number) =>
  {
    setGame(prev =>
    {
      const items = [...prev.items];
      let selected = [...prev.selectedItemIDs];

      let unboxedItem = prev.unboxedItem;

      if (selected.length === 1)
      {
        const item = items[itemUtils.itemIDtoSlot(selected[0], prev)];
        if (item)
        {
          const sourceIndex = itemUtils.itemToSlot(item, prev);
          items[itemSlotID] = item;
          items[sourceIndex] = null;
          selected = [];
        }
      } else if (unboxedItem)
      {
        items[itemSlotID] = unboxedItem;
        unboxedItem = null;
      }

      const newState = {
        ...prev,
        items,
        selectedItemIDs: selected,
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
      const selected = [...prev.selectedItemIDs];

      selected.forEach(slotID =>
      {
        items[itemUtils.itemIDtoSlot(slotID, prev)] = null;
      });

      const newState = { ...prev, items, selectedItemIDs: [] };

      saveGame(newState);

      return newState;
    });
  };

  return (
    <CustomInfoCard
      icon={Package}
      title="Inventory"
      help={
        <>
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
            Click on an item to select/activate it. Click on an empty slot to move an item there. Outside of the Calendar view, click on the Trash button to remove items. Trashing an item does not give you anything.
          </p>

          <br></br>

          <h2 className="font-bold m-1 flex items-center gap-2">
            <ListOrdered className="w-5 h-5" /> Item Activation Order
          </h2>

          <p className="text-sm">
            Items activate from left to right, top to bottom in the Inventory.
          </p>
        </>
      }
    >
      <div className="flex-1 flex items-center justify-center overflow-auto p-5">
        <div className="flex flex-col items-center">

          {game.view === "Calendar" && (
            <h2 className="font-bold flex items-center gap-2 pb-2">
              <Check className={`w-5 h-5 ${game.selectedItemIDs.length === game.maxActivatedItems ? "text-green-500" : ""}`} /> Activated {game.selectedItemIDs.length} / {game.maxActivatedItems}
            </h2>
          )}

          <div className="grid grid-cols-6 grid-rows-6 gap-1">
            {game.items.map((item, i) => (
              <ItemSlot
                key={i}
                game={game}
                item={item ?? null} // explicitly null if empty
                selected={item !== null && game.selectedItemIDs.includes(item.id)}
                onClick={() =>
                {
                  if (item)
                  {
                    handleItemClick(item.id); // item exists
                  } else
                  {
                    handleEmptySlotClick(i); // empty slot
                  }
                }}
                size={40}
              />
            ))}
          </div>

          <br></br>

          {game.view !== "Calendar" && (
            <CustomButton
              onClick={handleTrash}
              color="FireBrick"
              className={`${game.selectedItemIDs.length === 0 ? "opacity-50" : ""}`}
            >
              Trash
            </CustomButton>
          )}
        </div>
      </div>
    </CustomInfoCard>
  );
}
