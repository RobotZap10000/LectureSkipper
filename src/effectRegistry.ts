import type { EffectData, EffectMeta } from "@/effect";

const modules = import.meta.glob("@/effects/*.ts", { eager: true });

export const effectRegistry: Record<string, EffectData> = {};
export const effectMetaRegistry: Record<string, EffectMeta> = {};

for (const path in modules)
{
  const mod = modules[path] as any;

  const data: EffectData = mod.effectData;
  const meta: EffectMeta = mod.effectMeta;

  // Save to registries
  effectRegistry[data.name] = data;
  effectMetaRegistry[data.name] = meta;
}
