import Inventory from "@/components/Inventory";
import type { GameState } from "@/game";
import { saveGame } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { HelpCircle, PackageOpen, Store, Gift, Box } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";
import { itemMetaRegistry, itemsByRarity } from "@/itemRegistry";
import { itemUtils } from "@/item";
import { CustomButton } from "@/components/CustomButton";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { renderDescription } from "@/stringUtils";

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

  // Example shop listing
  const shopListings: Box[] = [
    { name: "Mild Box", cost: 5, border: "border-green-700", bg: "bg-green-950", rarityWeights: [100, 0, 0] },
    { name: "Anxiety Box", cost: 30, border: "border-yellow-700", bg: "bg-yellow-950", rarityWeights: [50, 49, 1] },
    { name: "Stress Box", cost: 150, border: "border-red-700", bg: "bg-red-950", rarityWeights: [0, 80, 20] },
    { name: "Breakdown Box", cost: 1000, border: "border-purple-700", bg: "bg-purple-950", rarityWeights: [0, 0, 100] },
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
              Spend units of Procrastination to buy items. The more expensive a box is,
              the higher the chance of getting rare and high-level items.
            </div>
          </>
        }
      >
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
                    Common: {box.rarityWeights[0]}%, Rare: {box.rarityWeights[1]}%, Legendary: {box.rarityWeights[2]}%
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
              After buying an item, click on an empty inventory slot to place the item there, or buy another item (automatically trash the previous one).
            </div>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-3 gap-4">
          <ItemSlot
            game={game}
            item={game.unboxedItem}
            selected={false}
            onClick={() => { }}
            size={120}
            threeDHeight={9}
          />

          <div className="flex gap-4">
            <CustomButton
              color="FireBrick"
              className={`${game.unboxedItem ? "" : "invisible"}`}
              onClick={handleTrash}
            >
              Trash
            </CustomButton>

            <CustomButton
              color="Green"
              className={`${game.unboxedItem ? "" : "invisible"}`}
              onClick={handlePlaceItem}
            >
              Take
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
