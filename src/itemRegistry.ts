import type { ItemData, ItemBehavior, ItemMeta } from "@/item";

const modules = import.meta.glob("@/items/*.ts", { eager: true });

export const itemRegistry: Record<string, ItemData> = {};
export const itemMetaRegistry: Record<string, ItemMeta> = {};
export const behaviorRegistry: Record<string, ItemBehavior> = {};
export const itemsByRarity: Record<number, ItemData[]> = { 1: [], 2: [], 3: [] };

for (const path in modules) {
  const mod = modules[path] as any;

  const data: ItemData = mod.item;
  const meta: ItemMeta = mod.meta; // must export meta for icon/getDescription
  const behavior: ItemBehavior = mod.behavior || {};

  // Save to registries
  itemRegistry[data.name] = data;
  itemMetaRegistry[data.name] = meta;
  behaviorRegistry[data.name] = behavior;

  // Categorize by rarity
  if (data.rarity >= 1 && data.rarity <= 3) {
    itemsByRarity[data.rarity].push(data);
  }
}
