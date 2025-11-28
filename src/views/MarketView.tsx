import Inventory from "@/components/Inventory";
import type { GameState } from "@/game";
import { generateUUID } from "@/game";
import { items } from "@/items";
import type { Dispatch, SetStateAction } from "react";
import { HelpCircle, PackageOpen, Store, Gift } from "lucide-react";
import ItemSlot from "@/components/ItemSlot";
import
{
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Item as ShadItem, ItemGroup } from "@/components/ui/item";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>; // Add this
}

export default function MarketView({ game, setGame }: Props)
{
  const shopListings = [
    { name: "Mild Box", cost: 5, border: "border-green-700", bg: "bg-green-950" },
    { name: "Anxiety Box", cost: 30, border: "border-yellow-700", bg: "bg-yellow-950" },
    { name: "Stress Box", cost: 150, border: "border-red-700", bg: "bg-red-950" },
    { name: "Breakdown Box", cost: 1000, border: "border-purple-700", bg: "bg-purple-950" },
  ];

  // Buy a box: consumes procrastinations and generates an item
  const handleBuy = (cost: number) =>
  {
    if (game.procrastinations < cost) return;

    const keys = Object.keys(items);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomItem = items[randomKey];

    const newItem = {
      ...randomItem,
      id: generateUUID(),
      memory: {},
    };

    setGame((prev) => ({
      ...prev,
      unboxedItem: newItem,
      procrastinations: prev.procrastinations - cost,
    }));
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

      return {
        ...prev,
        items: newItems,
        unboxedItem: null,
      };
    });
  };


  // Trash the unboxed item
  const handleTrash = () =>
  {
    setGame((prev) => ({
      ...prev,
      unboxedItem: null,
    }));
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {/* Shop */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content max-h-[500px]">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <Store className="w-5 h-5" /> Store

          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <Store className="w-5 h-5" /> Store
              </h2>
              <p className="text-sm">
                Spend units of Procrastination to buy items. The more expensive a box is, the higher the chance of getting rare and high-level items.
              </p>
            </HoverCardContent>
          </HoverCard>
        </h2>

        <ItemGroup className="space-y-2">
          {shopListings.map((item, i) => (
            <ShadItem
              key={i}
              className={`flex justify-between items-center rounded p-2 border ${item.border} ${item.bg}`}
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                <span>{item.name} (Cost: {item.cost})</span>
              </div>
              <button
                className={`px-2 py-1 rounded text-white ${game.procrastinations < item.cost ? "bg-red-500" : "bg-green-500"}`}
                onClick={() => handleBuy(item.cost)}
              >
                Buy
              </button>
            </ShadItem>
          ))}
        </ItemGroup>

      </div>

      {/* Unboxed Item */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content max-h-[500px]">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <PackageOpen className="w-5 h-5" /> Unboxed Item

          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <PackageOpen className="w-5 h-5" /> Unboxing
              </h2>

              <p className="text-sm">
                After buying an item, click on an empty inventory slot to place the item there, or buy another item (automatically trash the previous one).
              </p>
            </HoverCardContent>
          </HoverCard>
        </h2>
        <div className="flex flex-col items-center justify-center p-3">
          <h2 className={`font-bold m-1 flex items-center gap-2 ${game.unboxedItem ? '' : 'invisible'}`}>
            {game.unboxedItem?.name || "..."}
          </h2>
          <ItemSlot
            item={game.unboxedItem}
            selected={false}
            onClick={() => { }}
            size={120}
          />

          <div className="flex gap-2 mt-2">
            <button
              className={`bg-red-500 text-white px-4 py-2 rounded ${game.unboxedItem ? '' : 'invisible'}`}
              onClick={handleTrash}
            >
              Trash
            </button>

            <button
              className={`bg-green-500 text-white px-4 py-2 rounded ${game.unboxedItem ? '' : 'invisible'}`}
              onClick={handlePlaceItem}
            >
              Take
            </button>
          </div>

        </div>
      </div>


      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        disableTrash={false}
      />
    </div>
  );
}
