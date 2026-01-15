import Inventory from "@/components/Inventory";
import type { GameState, ShopEntry } from "@/game";
import { saveGame } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { PackageOpen, Store, Gift, Box } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";
import { itemMetaRegistry, itemsByRarity } from "@/itemRegistry";
import { itemUtils } from "@/item";
import { CustomButton } from "@/components/CustomButton";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { renderDescription } from "@/stringUtils";
import ItemComponent from "@/components/ItemComponent";
import { motion, AnimatePresence } from "framer-motion";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>; // Add this
}

export default function MarketView({ game, setGame }: Props)
{
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

  // Weighted random helper
  function weightedRandom<T>(items: T[], weights: number[]): T
  {
    let sum = 0;
    weights.forEach(w => sum += w);
    let rnd = Math.random() * sum;
    for (let i = 0; i < items.length; i++)
    {
      if (rnd < weights[i]) return items[i];
      rnd -= weights[i];
    }
    return items[items.length - 1];
  }

  // Buy a box
  const handleBuy = (box: Box) =>
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
        unboxedItem: newItem,
        procrastinations: prev.procrastinations - box.cost,
      };

      return newState;
    });
  };

  const handleBuyItem = (entry: ShopEntry) =>
  {
    const finalPrice = Math.floor(entry.price * (1 - entry.discount));

    if (game.procrastinations < finalPrice) return;

    setGame(prev =>
    {
      const newState = {
        ...prev,
        procrastinations: prev.procrastinations - finalPrice,
        unboxedItem: itemUtils.createItemInstance(entry.item),
        shop: prev.shop.filter(e => e !== entry), // remove after purchase
      };

      saveGame(newState);
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
        title="Store"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <Store className="w-5 h-5" /> Store
            </h2>
            <div className="text-sm">
              Spend Procrastinations to buy items. The shop refreshes once a new block starts.
            </div>
          </>
        }
      >
        {game.shop.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {game.shop.map((entry, i) =>
            {
              const finalPrice = Math.floor(entry.price * (1 - entry.discount));
              const canAfford = game.procrastinations >= finalPrice;

              return (
                <motion.div
                  key={"entry-" + entry.item.id}
                  layout
                  layoutId={"entry-" + entry.item.id}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800 border-1 border-neutral-700 relative"
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
                onClick={() => handleBuy(box)}
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
              After buying an item, click on an empty inventory slot to place the item there. Buying another item will automatically trash the previous one, if left in this slot.
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
            <AnimatePresence>
              {game.unboxedItem && (
                <motion.div
                  key={`item-${game.unboxedItem.id}-view-${game.view}`}
                  layoutId={`item-${game.unboxedItem.id}-view-${game.view}`}
                  initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 90 }}
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
            </AnimatePresence>
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
