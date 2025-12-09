import Inventory from "@/components/Inventory";
import type { GameState } from "@/game";
import { saveGame } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { HelpCircle, PackageOpen, Store, Gift } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";
import { itemsByRarity } from "@/itemRegistry";
import { itemUtils } from "@/item";
import { CustomButton } from "@/components/CustomButton";
import { CustomInfoCard } from "@/components/CustomInfoCard";

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

      saveGame(newState);

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
      saveGame(newState);
      return newState;
    });
  };

  return (
    <div className="flex flex-wrap justify-center p-4">

      {/* Shop */}
      <CustomInfoCard
        icon={Store}
        title="Store"
        className="max-w-[400px] w-full h-content max-h-[500px]"
        help={
          <>
            <h2 className="font-bold m-1 flex items-center gap-2">
              <Store className="w-5 h-5" /> Store
            </h2>
            <p className="text-sm">
              Spend units of Procrastination to buy items. The more expensive a box is,
              the higher the chance of getting rare and high-level items.
            </p>
          </>
        }
      >
        <ItemGroup className="space-y-2">
          {shopListings.map((box, i) => (
            <ShadItem
              key={i}
              className={`flex justify-between items-center rounded p-2 border ${box.border} ${box.bg}`}
            >
              <div className="flex gap-3 items-center">
                <Gift className="w-8 h-8 shrink-0 inline-block text-yellow-400" />
                <div className="flex flex-col">
                  <h4 className="font-bold">{box.name} (Cost: {box.cost} P)</h4>
                  <p className="text-sm text-muted-foreground">
                    Common: {box.rarityWeights[0]}%, Rare: {box.rarityWeights[1]}%, Legendary: {box.rarityWeights[2]}%
                  </p>
                </div>
              </div>

              <CustomButton
                color={game.procrastinations < box.cost ? "gray" : "Green"}
                onClick={() => handleBuy(box)}
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

            <p className="text-sm">
              After buying an item, click on an empty inventory slot to place the item there, or buy another item (automatically trash the previous one).
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-3">
          <h2 className={`font-bold m-1 flex items-center gap-2 ${game.unboxedItem ? "" : "invisible"}`}>
            {game.unboxedItem?.name || "..."}
          </h2>

          <ItemSlot
            game={game}
            item={game.unboxedItem}
            selected={false}
            onClick={() => { }}
            size={120}
          />

          <div className="flex gap-2 mt-2">
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
        </div>
      </CustomInfoCard>



      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        mode="normal"
      />
    </div>
  );
}
