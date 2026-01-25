import { ArrowBigRight, Box, Boxes, Check, LayoutGrid, ListOrdered, Package } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { type GameState } from "@/game";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { CustomInfoCard } from "./CustomInfoCard";
import { itemUtils } from "@/item";
import { CustomButton } from "./CustomButton";
import { itemMetaRegistry } from "@/itemRegistry";
import ItemComponent from "./ItemComponent";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Kbd } from "./ui/kbd";

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
        const item = items[itemUtils.itemIDtoSlot(selected[0], prev)!];
        if (item)
        {
          const sourceIndex = itemUtils.itemToSlot(item, prev);
          items[itemSlotID] = item;
          items[sourceIndex!] = null;
          selected = [];
        }
      } else if (unboxedItem && prev.view == "Market")
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
        items[itemUtils.itemIDtoSlot(slotID, prev)!] = null;
      });

      const newState = { ...prev, items, selectedItemIDs: [] };

      return newState;
    });
  };

  // Keyboard buttons to quickly select rows
  useEffect(() =>
  {
    const handleKeyDown = (e: KeyboardEvent) =>
    {
      const keyToFunction: Record<string, () => void> = {
        "1": () => handleSelectRow(0),
        "2": () => handleSelectRow(1),
        "3": () => handleSelectRow(2),
        "4": () => handleSelectRow(3),
        "5": () => handleSelectRow(4),
        "6": () => handleSelectRow(5),
      };

      const func = keyToFunction[e.key];
      if (func)
      {
        func();
      }
    };

    // Attach listener once
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () =>
    {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // empty dependency array ensures this runs only once

  const handleSelectRow = (row: number) =>
  {
    if (game.view != "Calendar")
      return;

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

          <div className="text-sm">
            Before you attend/skip a lecture, you can activate items to apply bonuses and special effects.
            <br></br>
            Unless stated otherwise, <strong>items have no usage limits</strong>.
          </div>

          <br></br>

          <h2 className="font-bold m-1 flex items-center gap-2">
            <Boxes className="w-5 h-5" /> Types
          </h2>

          <div className="text-sm">
            <ul className="list-disc pl-4 pt-2">
              <li>On <strong>Attend</strong>: activates when attending a lecture </li>
              <li>On <strong>Skip</strong>: activates when skipping a lecture </li>
              <li>On <strong>Use</strong>: activates when attending or skipping a lecture </li>
              <li><strong>Always Active</strong>: always activates, even if the item is not selected </li>
              <li><strong>Consumable</strong>: used up after attending or skipping a lecture </li>
            </ul>
          </div>

          <br></br>

          <h2 className="font-bold m-1 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" /> Management
          </h2>

          <div className="text-sm">
            Click on an item to select/activate it. Click on an empty slot to move an item there. Outside of the Calendar view, click on the Trash button to remove items. Trashing an item does not give you anything.
            <br />
            <br />
            While in the Calendar, click the buttons on the left to select an entire row, or press the corresponding key on the keyboard.
          </div>

          <br></br>

          <h2 className="font-bold m-1 flex items-center gap-2">
            <ListOrdered className="w-5 h-5" /> Item Activation Order
          </h2>

          <div className="text-sm">
            Items activate from left to right, top to bottom in the Inventory.
          </div>
        </>
      }
    >
      <div className="flex-1 flex items-center justify-center overflow-hidden p-5">
        <div className="flex flex-col items-center scale-90 md:scale-100">

          {game.view === "Calendar" && (
            <h2 className="font-bold flex items-center gap-2 pb-2">
              {game.selectedItemIDs.length === game.maxActivatedItems ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="lawnGreen"
                  strokeWidth="2" // Slightly thicker looks better for animations
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <motion.path
                    // Path data for the Lucide Check icon
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      opacity: { duration: 0.25 }
                    }}
                  />
                </svg>
              ) : (
                <div className="w-5 h-5" />
              )}

              Activated {game.selectedItemIDs.length} / {game.maxActivatedItems}
            </h2>
          )}

          <LayoutGroup>
            <div className="flex gap-2">
              {/* Left column: 1x6 row select buttons */}
              {game.view === "Calendar" && (
                <div className={`grid grid-rows-${numRows} gap-0`}>
                  {Array.from({ length: numRows }).map((i, rowIndex) => (
                    <CustomButton
                      key={`row-btn-${rowIndex}`}
                      color="#494949ff"
                      outlineColor="rgb(41, 41, 41)"
                      className="w-10 h-10 mt-2 rounded-2xl"
                      onClick={() => handleSelectRow(rowIndex)}
                    >
                      <p className="text-xl font-bold">
                        {rowIndex + 1}
                      </p>
                    </CustomButton>
                  ))}
                </div>
              )}

              {/* Right side: 6x6 item grid */}
              {/* Container to establish the coordinate space */}
              <div className="relative" style={{ width: numCols * 50 + (numCols - 1) * 4, height: numRows * 50 + (numRows - 1) * 4 }}>

                {/* Layer 1: Background Slots */}
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${numCols}, 50px)`,
                    gridTemplateRows: `repeat(${numRows}, 50px)`,
                  }}
                >
                  {Array.from({ length: numCols * numRows }).map((_, index) => (
                    <ItemSlot
                      key={`slot-${index}`}
                      game={game}
                      size={50}
                      onClick={() => handleEmptySlotClick(index)}
                    />
                  ))}
                </div>

                {/* Layer 2: Foreground Items */}
                <div
                  className="absolute inset-0 grid gap-1 pointer-events-none" // pointer-events-none lets clicks pass to slots
                  style={{
                    gridTemplateColumns: `repeat(${numCols}, 50px)`,
                    gridTemplateRows: `repeat(${numRows}, 50px)`,
                  }}
                >
                  <AnimatePresence>
                    {game.items.map((item, index) =>
                    {
                      if (!item) return null;

                      // Calculate grid position (CSS grid is 1-indexed)
                      const col = (index % numCols) + 1;
                      const row = Math.floor(index / numCols) + 1;

                      return (
                        <motion.div
                          key={`item-${item.id}-view-${game.view}`}
                          layoutId={`item-${item.id}-view-${game.view}`}
                          className="pointer-events-auto" // Re-enable clicks for the item itself
                          style={{
                            gridColumnStart: col,
                            gridRowStart: row,
                          }}
                          initial={{ opacity: 0, scale: 0.5, x: -20 + Math.random() * 40, y: -50 + Math.random() * 10, rotate: 0 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 90 }}
                          transition={{
                            // 1. General settings for the initial "pop-in"
                            duration: 0.5,
                            ease: "easeInOut",
                            delay: index * 0.0075,

                            // 2. Specific override for layout movements
                            layout: {
                              delay: 0,          // No delay when moving between slots
                              duration: 0.3,
                              ease: "circOut"
                            }
                          }}
                          onClick={(e) =>
                          {
                            e.stopPropagation(); // Prevent triggering the slot click underneath
                            handleItemClick(item.id);
                          }}
                        >
                          <ItemComponent item={item} game={game} size={50} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </LayoutGroup>

          {game.view !== "Calendar" && (
            <CustomButton
              onClick={handleTrash}
              color="FireBrick"
              className={`${game.selectedItemIDs.length === 0 ? "opacity-50" : ""} py-2 mt-4`}
            >
              Trash
            </CustomButton>
          )}
        </div>
      </div>
    </CustomInfoCard>
  );
}
