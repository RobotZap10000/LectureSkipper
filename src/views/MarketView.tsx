import Inventory from "@/components/Inventory";
import type { GameState, ShopEntry } from "@/game";
import { useContext, type Dispatch, type SetStateAction } from "react";
import { PackageOpen, Store, Gift, Box, Trash2, Check } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";
import { itemsByRarity } from "@/itemRegistry";
import { itemUtils } from "@/item";
import { CustomButton } from "@/components/CustomButton";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import ItemComponent from "@/components/ItemComponent";
import { motion } from "framer-motion";
import { weightedRandom } from "@/lib/utils";
import { CustomAnimatePresence } from "@/components/CustomAnimatePresence";
import { SettingsContext } from "@/App";
import { Badge } from "@/components/ui/badge"

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>; // Add this
}

export default function MarketView({ game, setGame }: Props)
{
  let { settings, setSettings } = useContext(SettingsContext)!;

  type Box = {
    name: string;
    cost: number;
    border: string;
    bg: string;
    rarityWeights: [number, number, number]; // [common, rare, legendary]
  };

  const shopListings: Box[] = [
    { name: "Stress Box", cost: 600, border: "border-teal-700", bg: "bg-teal-950", rarityWeights: [100, 40, 10] },
    { name: "Anxiety Box", cost: 2500, border: "border-sky-700", bg: "bg-sky-950", rarityWeights: [0, 90, 10] },
    { name: "Legendary Box", cost: 1000000000, border: "border-violet-700", bg: "bg-violet-950", rarityWeights: [0, 0, 100] },
  ];

  const handleBuyBoxes = (box: Box, count: number) =>
  {
    if (game.procrastinations < box.cost * count) return;

    setGame((prev) =>
    {
      const newState = {
        ...prev,
        procrastinations: prev.procrastinations - box.cost * count,
      };

      if (newState.autoTrashMarket == true)
      {
        newState.unboxedItems = [];
      }

      for (let i = 0; i < count; i++)
      {
        // Pick rarity based on box weights
        const chosenRarity = weightedRandom([1, 2, 3], box.rarityWeights);

        // Pick item from chosen rarity using item dropWeight
        const itemWeights = itemsByRarity[chosenRarity].map((i) => i.dropWeight);
        const chosenItem = weightedRandom(itemsByRarity[chosenRarity], itemWeights);

        // Create unique instance
        const newItem = itemUtils.createItemInstance(chosenItem);

        newState.unboxedItems.push(newItem);
      }

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

      if (newState.autoTrashMarket == true)
      {
        newState.unboxedItems = [];
      }

      newState.unboxedItems.push(newItem);
      return newState;
    });
  };

  // Place item into first empty slot in inventory
  function handlePlaceItem(i: number)
  {
    if (game.unboxedItems.length <= i) return;

    setGame((prev) =>
    {
      const newItems = [...prev.items];
      const newUnboxedItems = [...prev.unboxedItems];
      const emptyIndex = newItems.findIndex((slot) => !slot);

      if (emptyIndex >= 0 && emptyIndex < newItems.length)
      {
        newItems[emptyIndex] = newUnboxedItems[0];
        newUnboxedItems.splice(0, 1);
      }

      const newState = {
        ...prev,
        items: newItems,
        unboxedItems: newUnboxedItems,
      };

      return newState;
    });
  };

  // Trash the unboxed item
  function handleTrash(i: number)
  {
    setGame((prev) =>
    {
      const newState = {
        ...prev,
      };
      newState.unboxedItems.splice(i, 1);
      return newState;
    });
  };

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
          <div className="grid grid-cols-3 gap-4 max-h-[700px] overflow-y-auto">
            <CustomAnimatePresence>
              {game.shop.map((entry, i) =>
              {
                const finalPrice = Math.floor(entry.price * (1 - entry.discount));
                const canAfford = game.procrastinations >= finalPrice;

                return (
                  <motion.div
                    key={"entry-" + entry.item.id}
                    layout={settings.animations === "full"}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800 border-1 border-neutral-700 relative"
                    initial={settings.animations !== "minimal" ? { opacity: 0, scale: 0.9, y: -50 } : undefined}
                    animate={settings.animations !== "minimal" ? { opacity: 1, scale: 1, y: 0 } : undefined}
                    exit={settings.animations !== "minimal" ? {
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
                  <h4 className="font-bold">{box.name} ({box.cost} P)</h4>
                  {(() =>
                  {
                    const total =
                      box.rarityWeights[0] +
                      box.rarityWeights[1] +
                      box.rarityWeights[2];

                    const pct = (w: number) => ((w / total) * 100).toFixed(0);

                    return (
                      <div className="flex flex-wrap gap-1 my-1 p-0">
                        <Badge
                          className="rounded-sm"
                          style={{
                            backgroundColor: "rgba(40, 93, 40, 1)",
                            color: "rgb(255, 255, 255)",
                          }}
                        >
                          {pct(box.rarityWeights[0])}%
                        </Badge>
                        <Badge
                          className="rounded-sm"
                          style={{
                            backgroundColor: "rgba(40, 77, 132, 1)",
                            color: "rgb(255, 255, 255)",
                          }}
                        >
                          {pct(box.rarityWeights[1])}%
                        </Badge>
                        <Badge
                          className="rounded-sm"
                          style={{
                            backgroundColor: "rgba(134, 116, 28, 1)",
                            color: "rgb(255, 255, 255)",
                          }}
                        >
                          {pct(box.rarityWeights[2])}%
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <CustomButton
                color={game.procrastinations < box.cost ? "gray" : "MediumSeaGreen"}
                onClick={() => handleBuyBoxes(box, 1)}
                className="h-full"
              >
                1x
              </CustomButton>
              <CustomButton
                color={game.procrastinations < box.cost * 10 ? "gray" : "MediumSeaGreen"}
                onClick={() => handleBuyBoxes(box, 10)}
                className="h-full"
              >
                10x
              </CustomButton>
            </ShadItem>
          ))}
        </ItemGroup>
      </CustomInfoCard>


      {/* Unboxed Items */}
      <CustomInfoCard
        icon={PackageOpen}
        title="Unboxed Items"
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
                Check the "Auto Trash" checkbox to automatically trash any items left in this window when you buy another one.
              </p>
            </div>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-3 gap-4 overflow-y-auto">

          {game.unboxedItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 max-h-[700px] overflow-y-auto">
              <CustomAnimatePresence>
                {game.unboxedItems.map((item, i) => (
                  <motion.div
                    key={`unboxed-${item.id}`}
                    layout={settings.animations === "full"}
                    className="
                      flex items-center gap-2
                      p-2 rounded-lg
                      bg-neutral-800 border border-neutral-700
                    "
                    initial={
                      settings.animations !== "minimal"
                        ? { opacity: 0, scale: 0.9, y: -40 }
                        : undefined
                    }
                    animate={
                      settings.animations !== "minimal"
                        ? { opacity: 1, scale: 1, y: 0 }
                        : undefined
                    }
                    exit={
                      settings.animations !== "minimal"
                        ? {
                          opacity: 0,
                          scale: 0.85,
                          y: 20,
                          transition: { duration: 0.12, ease: "easeOut" },
                        }
                        : undefined
                    }
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 280,
                      delay: i * 0.02,
                    }}
                  >
                    {/* Take */}
                    <CustomButton
                      color="MediumSeaGreen"
                      className="rounded-full aspect-square shrink-0 h-[75%]"
                      onClick={() => handlePlaceItem(i)}
                      icon={Check}
                    />

                    {/* Item */}
                    <ItemSlot size={56} game={game}>
                      <ItemComponent
                        game={game}
                        item={item}
                        size={56}
                        threeDHeight={2}
                      />
                    </ItemSlot>

                    {/* Trash */}
                    <CustomButton
                      color="FireBrick"
                      className="rounded-full aspect-square shrink-0 h-[75%]"
                      onClick={() => handleTrash(i)}
                      icon={Trash2}
                    />
                  </motion.div>

                ))}
              </CustomAnimatePresence>
            </div>
          ) : (
            <div className="text-muted-foreground text-center p-4">
              No unboxed items.
            </div>
          )}


          {/* --- Show auto trash checkbox --- */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="AutoTrash"
              checked={game.autoTrashMarket} // save in gameState
              onChange={(e) =>
                setGame((g) => ({ ...g, autoTrashMarket: e.target.checked }))
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
