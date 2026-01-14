import Inventory from "@/components/Inventory";
import { Box, CirclePlus, MoveDown } from "lucide-react";
import { type GameState } from "@/game";
import { useState, type Dispatch, type SetStateAction } from "react";
import { itemUtils, type ItemData } from "@/item";
import { itemMetaRegistry } from "@/itemRegistry";
import { renderDescription } from "@/stringUtils";
import { CustomInfoCard } from "@/components/CustomInfoCard";
import { CustomButton } from "@/components/CustomButton";
import { Input } from "@/components/ui/input";

interface Props
{
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>;
}

export default function ForgeView({ game, setGame }: Props)
{
  const [upgradeAmount, setUpgradeAmount] = useState(1);

  const calculateUpgradeCost = (item: ItemData, upgradeBy: number) =>
  {
    const n0 = item.level - item.startingLevel;
    const n1 = n0 + upgradeBy;

    // sum of arithmetic series from n0+1 → n1
    return (n1 * (n1 + 1) - n0 * (n0 + 1)) * 25;
  };

  const calculateMaxUpgradeBy = (item: ItemData, amount: number) =>
  {
    const n0 = item.level - item.startingLevel;

    // Solve quadratic for n1
    const A = n0 * (n0 + 1) + amount / 25;

    const n1 = Math.floor((Math.sqrt(1 + 4 * A) - 1) / 2);

    return Math.max(0, n1 - n0);
  };



  const item: ItemData | null = game.selectedItemIDs.length > 0 ? itemUtils.itemIDtoItem(game.selectedItemIDs[0], game) : null;
  const upgradedItemData: ItemData | null = item ? { ...item, level: item.level + upgradeAmount } : null;
  let Icon = null;
  if (item) Icon = itemMetaRegistry[item.name].icon;

  const handleUpgrade = () =>
  {
    setGame((state) =>
    {
      if (!item) return state;

      const cost = calculateUpgradeCost(item, upgradeAmount);
      if (state.cash < cost) return state;

      const upgradedItem = { ...item, level: item.level + upgradeAmount };

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
            <div>
              Spend cash to upgrade your items. Each level costs more than the last.
            </div>
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

                    <div className="text-sm">
                      {renderDescription(itemMetaRegistry[item.name].getDescription(item))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MoveDown
                  className={`w-10 h-10 scale-[1.5] ${game.cash < (item ? calculateUpgradeCost(item, upgradeAmount) : 0)
                    ? "text-neutral-500"
                    : "text-green-500"
                    }`}
                />

                <div>
                  <Input
                    type="number"
                    className="w-32"
                    min={1}
                    value={upgradeAmount}
                    onChange={(e) => setUpgradeAmount(Math.max(1, Number(e.target.value)))}
                  />
                  <div className="flex gap-3 items-center pt-2">
                    <CustomButton
                      color="DarkSlateBlue"
                      onClick={() => setUpgradeAmount(Math.max(1, calculateMaxUpgradeBy(item, game.cash)))}
                      className="w-32 h-full"
                    >
                      Set MAX
                    </CustomButton>
                  </div>
                </div>

                <CustomButton
                  color={`${game.cash < (item ? calculateUpgradeCost(item, upgradeAmount) : 0)
                    ? "gray"
                    : "MediumSeaGreen"
                    }`}
                  onClick={handleUpgrade}
                  className="w-24 h-full break-all"
                >
                  ${item ? calculateUpgradeCost(item, upgradeAmount) : "..."}
                </CustomButton>

                <MoveDown
                  className={`w-10 h-10 scale-[1.5] ${game.cash < (item ? calculateUpgradeCost(item, upgradeAmount) : 0)
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

                    <div className="text-sm">
                      {renderDescription(itemMetaRegistry[upgradedItemData.name].getDescription(upgradedItemData))}
                    </div>
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

                    <div className="text-sm">
                      ...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 h-21">
                <MoveDown
                  className={`w-10 h-10 scale-[1.5] text-neutral-500`}
                />

                <span className="text-muted-foreground italic w-59 align-middle text-center">
                  Select an item to upgrade
                </span>

                <MoveDown
                  className={`w-10 h-10 scale-[1.5] text-neutral-500`}
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

                    <div className="text-sm">
                      ...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </CustomInfoCard >

      {/* Inventory */}
      < Inventory
        game={game}
        setGame={setGame}
      />
    </div >
  );
}
