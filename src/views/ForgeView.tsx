import Inventory from "@/components/Inventory";
import { Box, CirclePlus, MoveDown } from "lucide-react";
import { type GameState } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { itemUtils, type ItemData } from "@/item";
import { itemMetaRegistry } from "@/itemRegistry";
import { renderDescription } from "@/stringUtils";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { CustomButton } from "@/components/CustomButton";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ForgeView({ game, setGame }: Props)
{
  const calculateUpgradeCost = (item: ItemData) =>
  {
    let n = item.level - item.startingLevel + 1;
    return (n / 2) * (50 + 50 * n);
  };

  const item: ItemData | null = game.selectedItemIDs.length > 0 ? itemUtils.itemIDtoItem(game.selectedItemIDs[0], game) : null;
  const upgradedItemData: ItemData | null = item ? { ...item, level: item.level + 1 } : null;
  let Icon = null;
  if (item) Icon = itemMetaRegistry[item.name].icon;

  const handleUpgrade = () =>
  {
    setGame((state) =>
    {
      if (!item) return state;

      const cost = calculateUpgradeCost(item);
      if (state.cash < cost) return state;

      const upgradedItem = { ...item, level: item.level + 1 };

      const newItems = [...state.items];
      newItems[itemUtils.itemIDtoSlot(item.id, state)] = upgradedItem;

      const newState = {
        ...state,
        items: newItems,
        cash: state.cash - cost,
      };

      return newState;
    });
  };

  return (
    <div className="flex flex-wrap justify-center p-4">

      {/* Forge Section */}
      <CustomInfoCard
        icon={CirclePlus}
        title="Upgrade Items"
        help={
          <>
            <p>
              Spend cash to upgrade your items. Each level costs more than the last.
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-3 min-h-[400px]">
          {item && upgradedItemData ? (
            <div className="flex flex-col items-center justify-center mb-4 gap-3">
              <div
                className={`
                  w-96 p-4 rounded-md 
                  bg-popover shadow-lg z-10 ring-2
                  ${item.rarity === 1
                    ? "ring-green-600"
                    : item.rarity === 2
                      ? "ring-blue-600"
                      : "ring-yellow-600"
                  }
                `}
              >
                <div className="flex gap-3 items-center">
                  {Icon && <Icon className="w-8 h-8 shrink-0 inline-block" />}

                  <div>
                    <h4 className="font-bold p-1 text-lg">
                      / {item.name} - Level {item.level} /
                    </h4>

                    <p className="text-sm">
                      {renderDescription(itemMetaRegistry[item.name].getDescription(item))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MoveDown
                  className={`w-10 h-10 ${game.cash < (item ? calculateUpgradeCost(item) : 0)
                    ? "text-neutral-500"
                    : "text-green-500"
                    }`}
                />

                <CustomButton
                  color={`${game.cash < (item ? calculateUpgradeCost(item) : 0)
                    ? "gray"
                    : "MediumSeaGreen"
                    }`}
                  onClick={handleUpgrade}
                  className="w-64"
                >
                  Upgrade for ${item ? calculateUpgradeCost(item) : "..."}
                </CustomButton>

                <MoveDown
                  className={`w-10 h-10 ${game.cash < (item ? calculateUpgradeCost(item) : 0)
                    ? "text-neutral-500"
                    : "text-green-500"
                    }`}
                />

              </div>

              <div
                className={`
                  w-96 p-4 rounded-md 
                  bg-popover shadow-lg z-10 ring-2
                  ${upgradedItemData.rarity === 1
                    ? "ring-green-600"
                    : upgradedItemData.rarity === 2
                      ? "ring-blue-600"
                      : "ring-yellow-600"
                  }
                `}
              >
                <div className="flex gap-3 items-center">
                  {Icon && <Icon className="w-8 h-8 shrink-0 inline-block" />}

                  <div>
                    <h4 className="font-bold p-1 text-lg">
                      / {upgradedItemData.name} - Level {upgradedItemData.level} /
                    </h4>

                    <p className="text-sm">
                      {renderDescription(itemMetaRegistry[upgradedItemData.name].getDescription(upgradedItemData))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mb-4 gap-3">
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

                    <p className="text-sm">
                      ...
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MoveDown
                  className={`w-10 h-10 text-neutral-500`}
                />

                <span className="text-muted-foreground italic w-64 text-center">
                  Select an item to upgrade
                </span>

                <MoveDown
                  className={`w-10 h-10 text-neutral-500`}
                />

              </div>

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

                    <p className="text-sm">
                      ...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
