import { ArrowBigRight, Box, Boxes, Check, LayoutGrid, ListOrdered, Package } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { saveGame, type GameState } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { CustomInfoCard } from "./CustomInfoCard";
import { itemUtils } from "@/item";
import { CustomButton } from "./CustomButton";
import { itemMetaRegistry } from "@/itemRegistry";

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
        let item = itemUtils.itemIDtoItem(itemID, prev);

        if (game.view === "Calendar")
        {
          if (item && itemMetaRegistry[item.name].getEnabled(item, prev) && selected.length < prev.maxActivatedItems)
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
      } else
      {
        selected = [];
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

  const handleSelectRow = (row: number) =>
  {
    setGame(prev =>
    {
      const items = [...prev.items];
      let selected: string[] = [];

      for (let i = 0; i < numCols; i++)
      {
        const item = items[row * numCols + i];
        if (item && itemMetaRegistry[item.name].getEnabled(item, prev))
        {
          selected.push(item.id);

          if (selected.length >= game.maxActivatedItems)
            break;
        }
      }

      // If the selected row is already selected, deselect it
      if (prev.selectedItemIDs.length == selected.length)
      {
        let same = true;
        for (let i = 0; i < prev.selectedItemIDs.length; i++)
        {
          if (prev.selectedItemIDs[i] != selected[i])
          {
            same = false;
            break;
          }
        }
        if (same)
        {
          selected = [];
        }
      }

      const newState = { ...prev, selectedItemIDs: selected };

      return newState;
    });
  };

  const numRows = 6;
  const numCols = 6;

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

          <div className="flex flex-col gap-1">
            {Array.from({ length: numRows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-1">

                {/* Row select button */}
                {game.view === "Calendar" &&
                  <CustomButton
                    color="#494949ff"
                    className="w-9 h-9 mr-1"
                    onClick={() => handleSelectRow(rowIndex)}
                    icon={ArrowBigRight}
                  ></CustomButton>
                }

                {/* Items in this row */}
                {game.items
                  .slice(rowIndex * numCols, (rowIndex + 1) * numCols)
                  .map((item, colIndex) => (
                    <ItemSlot
                      key={colIndex}
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
                          handleEmptySlotClick(rowIndex * numCols + colIndex); // empty slot
                        }
                      }}
                      size={40}
                    />
                  ))}
              </div>
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
