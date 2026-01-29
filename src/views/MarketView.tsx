import Inventory from "@/components/Inventory";
import type { GameState, ShopEntry } from "@/game";
import { useContext, type Dispatch, type SetStateAction } from "react";
import { PackageOpen, Store, Gift, Box } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";
import { itemMetaRegistry, itemsByRarity } from "@/itemRegistry";
import { itemUtils } from "@/item";
import { CustomButton } from "@/components/CustomButton";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { renderDescription } from "@/stringUtils";
import ItemComponent from "@/components/ItemComponent";
import { motion } from "framer-motion";
import { weightedRandom } from "@/lib/utils";
import { CustomAnimatePresence } from "@/components/CustomAnimatePresence";
import { AnimationContext } from "@/App";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>; // Add this
}

export default function MarketView({ game, setGame }: Props)
{
  let { animations, setAnimations } = useContext(AnimationContext)!;

  type Box = {
    name: string;
    cost: number;
    border: string;
    bg: string;
    rarityWeights: [number, number, number]; // [common, rare, legendary]
  };

  const shopListings: Box[] = [
    { name: "Stress Box", cost: 600, border: "border-red-700", bg: "bg-red-950", rarityWeights: [100, 40, 10] },
  ];

  const handleBuyBox = (box: Box) =>
  {
    if (game.procrastinations < box.cost) return;

    // Pick rarity based on box weights
    const chosenRarity = weightedRandom([1, 2, 3], box.rarityWeights);

    // Pick item from chosen rarity using item dropWeight
    const itemWeights = itemsByRarity[chosenRarity].map((i) => i.dropWeight);
    const chosenItem = weightedRandom(itemsByRarity[chosenRarity], itemWeights);

    // Create unique instance
    const newItem = itemUtils.createItemInstance(chosenItem);

    setGame((prev) =>
    {
      const newState = {
        ...prev,
        procrastinations: prev.procrastinations - box.cost,
      };

      if (newState.unboxedItem != null && prev.autoTrashForge == false)
      {
        // Find free slot and place the item there if possible
        for (let i = 0; i < newState.items.length; i++)
        {
          if (newState.items[i] == null)
          {
            newState.items[i] = newState.unboxedItem;
            break;
          }
        }
      }

      newState.unboxedItem = newItem;
      return newState;
    });
  };

  const handleBuyItem = (entry: ShopEntry) =>
  {
    const finalPrice = Math.floor(entry.price * (1 - entry.discount));

    if (game.procrastinations < finalPrice) return;

    // Create unique instance
    const newItem = itemUtils.createItemInstance(entry.item);

    setGame(prev =>
    {
      const newState = {
        ...prev,
        procrastinations: prev.procrastinations - finalPrice,
        shop: prev.shop.filter(e => e !== entry), // remove after purchase
      };

      if (newState.unboxedItem != null && prev.autoTrashForge == false)
      {
        // Find free slot and place the item there if possible
        for (let i = 0; i < newState.items.length; i++)
        {
          if (newState.items[i] == null)
          {
            newState.items[i] = newState.unboxedItem;
            break;
          }
        }
      }

      newState.unboxedItem = newItem;
      return newState;
    });
  };

  // Place item into inventory
  const handlePlaceItem = () =>
  {
    if (!game.unboxedItem) return;

    setGame((prev) =>
    {
      const newItems = [...prev.items];
      const emptyIndex = newItems.findIndex((slot) => !slot);

      if (emptyIndex >= 0 && emptyIndex < newItems.length)
      {
        newItems[emptyIndex] = prev.unboxedItem;
      }

      const newState = {
        ...prev,
        items: newItems,
        unboxedItem: null,
      };

      return newState;
    });
  };

  // Trash the unboxed item
  const handleTrash = () =>
  {
    setGame((prev) =>
    {
      const newState = {
        ...prev,
        unboxedItem: null,
      };
      return newState;
    });
  };

  let Icon = null;
  if (game.unboxedItem)
  {
    Icon = itemMetaRegistry[game.unboxedItem.name].icon;
  }

  return (
    <div className="flex flex-wrap justify-center p-4">

      {/* Shop */}
      <CustomInfoCard
        icon={Store}
        title="Shop"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <Store className="w-5 h-5" /> Shop
            </h2>
            <div className="text-sm">
              Spend Procrastinations to buy items. The shop refreshes once a new block starts.
            </div>
          </>
        }
      >
        {game.shop.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            <CustomAnimatePresence>
              {game.shop.map((entry, i) =>
              {
                const finalPrice = Math.floor(entry.price * (1 - entry.discount));
                const canAfford = game.procrastinations >= finalPrice;

                return (
                  <motion.div
                    key={"entry-" + entry.item.id}
                    layout={animations === "full"}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800 border-1 border-neutral-700 relative"
                    initial={animations !== "minimal" ? { opacity: 0, scale: 0.9, y: -50 } : undefined}
                    animate={animations !== "minimal" ? { opacity: 1, scale: 1, y: 0 } : undefined}
                    exit={animations !== "minimal" ? {
                      opacity: 0, scale: 0.9, y: 0, transition: {
                        duration: 0.1,
                        ease: "easeOut"
                      }
                    } : undefined}
                    transition={{
                      type: "spring",
                      damping: 35,
                      stiffness: 300,
                      delay: i * 0.015
                    }}
                  >
                    {/* Item visual */}
                    <ItemSlot size={56} game={game}>
                      <ItemComponent
                        game={game}
                        item={entry.item}
                        size={56}
                      />
                      {/* Discount badge */}
                      {entry.discount > 0 && (
                        <div className="absolute -top-3 -left-4 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md z-10 rotate-[-15deg]">
                          -{Math.round(entry.discount * 100)}%
                        </div>
                      )}
                    </ItemSlot>

                    {/* Price */}
                    <div className="text-sm flex items-center gap-1">
                      {entry.discount > 0 && (
                        <span className="line-through text-muted-foreground">
                          {entry.price}
                        </span>
                      )}
                      <span className={entry.discount > 0 ? "text-green-500 font-bold" : ""}>
                        {finalPrice} P
                      </span>
                    </div>

                    {/* Buy */}
                    <CustomButton
                      color={canAfford ? "MediumSeaGreen" : "gray"}
                      onClick={() => handleBuyItem(entry)}
                      className="w-full"
                    >
                      Buy
                    </CustomButton>
                  </motion.div>
                );
              })}
            </CustomAnimatePresence>
          </div>
        ) : (
          <div className="text-muted-foreground p-0">No items available.</div>
        )}

        <hr className="my-0 border-muted" />

        <ItemGroup className="space-y-2">
          {shopListings.map((box, i) => (
            <ShadItem
              key={i}
              className={`flex justify-between items-center rounded p-2 border ${box.border} ${box.bg}`}
            >
              <div className="flex gap-3 items-center flex-1 min-w-0">
                <Gift className="w-8 h-8 shrink-0 inline-block text-yellow-400" />
                <div className="flex flex-col">
                  <h4 className="font-bold">{box.name} (Cost: {box.cost} P)</h4>
                  <div className="text-sm text-muted-foreground">
                    {(() =>
                    {
                      const total =
                        box.rarityWeights[0] +
                        box.rarityWeights[1] +
                        box.rarityWeights[2];

                      const pct = (w: number) => ((w / total) * 100).toFixed(1);

                      return (
                        <>
                          Common: {pct(box.rarityWeights[0])}%,
                          Rare: {pct(box.rarityWeights[1])}%,
                          Legendary: {pct(box.rarityWeights[2])}%
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <CustomButton
                color={game.procrastinations < box.cost ? "gray" : "MediumSeaGreen"}
                onClick={() => handleBuyBox(box)}
                className="h-full"
              >
                Buy
              </CustomButton>
            </ShadItem>
          ))}
        </ItemGroup>
      </CustomInfoCard>


      {/* Unboxed Item */}
      <CustomInfoCard
        icon={PackageOpen}
        title="Unboxed Item"
        className="h-500px"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <PackageOpen className="w-5 h-5" /> Unboxing
            </h2>

            <div className="text-sm">
              <p>
                After buying an item, click on an empty inventory slot to place the item there.
              </p>
              <br />
              <p>
                Check the "Auto Trash" checkbox to automatically trash any item left in this slot when you buy another one.
              </p>
            </div>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-3 gap-4">

          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>

            {/* The background slot */}
            <ItemSlot
              onClick={() => { }}
              game={game}
              size={120}
            />

            {/* The item layer */}
            <CustomAnimatePresence>
              {game.unboxedItem && (
                <motion.div
                  key={`item-${game.unboxedItem.id}-view-${game.view}`}
                  layoutId={animations !== "minimal" ? `item-${game.unboxedItem.id}-view-${game.view}` : undefined}
                  initial={animations === "full" ? { opacity: 0, scale: 0.5, rotate: 0 } : undefined}
                  animate={animations === "full" ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
                  exit={animations === "full" ? { opacity: 0, scale: 0, rotate: 90 } : undefined}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ItemComponent
                    game={game}
                    item={game.unboxedItem}
                    size={120}
                    threeDHeight={9}
                  />
                </motion.div>
              )}
            </CustomAnimatePresence>
          </div>


          <div className="flex gap-4">
            <CustomButton
              color="FireBrick"
              className={`${game.unboxedItem ? "" : "invisible"}`}
              onClick={handleTrash}
            >
              Trash
            </CustomButton>
          </div>

          {game.unboxedItem &&
            <div
              className={`
                w-96 p-4 rounded-md 
                bg-popover shadow-lg z-10 ring-2
                ${game.unboxedItem.rarity === 1
                  ? "ring-green-600"
                  : game.unboxedItem.rarity === 2
                    ? "ring-blue-600"
                    : "ring-yellow-600"
                }
                          `}
            >
              <div className="flex gap-3 items-center">
                {Icon && <Icon className="w-8 h-8 shrink-0 inline-block" />}

                <div>
                  <h4 className="font-bold p-1 text-lg">
                    / {game.unboxedItem.name} - Level {game.unboxedItem.level} /
                  </h4>

                  <div className="text-sm">
                    {renderDescription(itemMetaRegistry[game.unboxedItem.name].getDescription(game.unboxedItem))}
                  </div>
                </div>
              </div>
            </div>
          }
          {!game.unboxedItem &&
            <div
              className={`
                  w-96 p-4 rounded-md 
                  bg-popover shadow-lg z-10 ring-2
                  ring-neutral-600
                `}
            >
              <div className="flex gap-3 items-center">
                <Box className="w-8 h-8 shrink-0 inline-block" />

                <div>
                  <h4 className="font-bold p-1 text-lg">
                    / ... - Level ... /
                  </h4>

                  <div className="text-sm">
                    ...
                  </div>
                </div>
              </div>
            </div>
          }

          {/* --- Show auto trash checkbox --- */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="AutoTrash"
              checked={game.autoTrashForge} // save in gameState
              onChange={(e) =>
                setGame((g) => ({ ...g, autoTrashForge: e.target.checked }))
              }
              className="w-5 h-5
                       rounded-full appearance-none
                       border-2 border-white-400
                       checked:bg-green-600 checked:border-green-700
                       transition-colors"
            />
            <label htmlFor="AutoTrash" className="text-sm font-medium">
              Auto Trash
            </label>
          </div>
        </div>
      </CustomInfoCard>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
      />
    </div>
  );
}
