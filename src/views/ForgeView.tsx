import Inventory from "@/components/Inventory";
import { Anvil, CirclePlus, HelpCircle } from "lucide-react";
import type { GameState, Item } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import ItemSlot from "@/components/ItemSlot";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ForgeView({ game, setGame }: Props)
{
  const calculateUpgradeCost = (item: Item) =>
  {
    return Math.floor(Math.pow(20, 1 + (item.level - item.startingLevel) / 3.14159));
  };

  const putItemIntoForge = () =>
  {
    setGame(state =>
    {
      const newState = { ...state };

      if (newState.selectedItemSlots.length > 0 && !newState.forgeItem)
      {
        const sourceIndex = newState.selectedItemSlots[newState.selectedItemSlots.length - 1];
        const item = newState.items[sourceIndex];
        if (item)
        {
          newState.forgeItem = item;
          newState.items = [...newState.items];
          newState.items[sourceIndex] = null;
        }
      }

      newState.selectedItemSlots = [];

      return newState;
    });
  };

  const handleUpgrade = () =>
  {
    setGame((state) =>
    {
      if (!state.forgeItem) return state;

      const cost = calculateUpgradeCost(state.forgeItem!);
      if (state.cash < cost) return state;

      const upgradedItem = { ...state.forgeItem, level: state.forgeItem.level + 1 };

      return {
        ...state,
        forgeItem: upgradedItem,
        cash: state.cash - cost,
      };
    });

  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">

      {/* Forge Section */}
      <div className="bg-card p-2 rounded flex flex-col max-w-[400px] w-full h-content max-h-[500px]">
        <h2 className="font-bold m-1 flex items-center gap-2">
          <CirclePlus className="w-5 h-5" /> Upgrade Items

          <Popover>
            <PopoverTrigger asChild>
              <HelpCircle className="w-4 h-4 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <h2 className="font-bold m-1 flex items-center gap-2">
                <Anvil className="w-5 h-5" /> The Forge
              </h2>

              <p className="text-sm">
                Dump money into your items to upgrade them and make them more potent. There is no level cap, but each upgrade is more expensive than the last.
              </p>
            </PopoverContent>
          </Popover></h2>
        <div className="flex flex-col items-center justify-center p-3">
          <div className="w-32 h-32 flex items-center justify-center mb-2">
            <ItemSlot
              item={game.forgeItem}
              selected={false}
              onClick={() => putItemIntoForge()}
              size={120}
            />
          </div>
          <button
            className={`${game.forgeItem ? "" : "opacity-50"} ${game.cash < (game.forgeItem ? calculateUpgradeCost(game.forgeItem) : (game.selectedItemSlots.length > 0 ? (game.items[game.selectedItemSlots[game.selectedItemSlots.length - 1]] ? calculateUpgradeCost(game.items[game.selectedItemSlots[game.selectedItemSlots.length - 1]]!) : 0) : 0)) ? "bg-red-500" : "bg-green-500"} text-white px-2 py-1 rounded`}
            onClick={handleUpgrade}
            disabled={!game.forgeItem}
          >
            Upgrade for {(game.forgeItem ? calculateUpgradeCost(game.forgeItem) : (game.selectedItemSlots.length > 0 ? (game.items[game.selectedItemSlots[game.selectedItemSlots.length - 1]] ? calculateUpgradeCost(game.items[game.selectedItemSlots[game.selectedItemSlots.length - 1]]!) : 0) : 0))} Cash
          </button>
        </div>
      </div>

      {/* Inventory */}
      <Inventory
        game={game}
        setGame={setGame}
        mode="normal"
      />
    </div>
  );
}
