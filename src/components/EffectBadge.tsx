import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import type { EffectData } from "@/effect";
import { effectMetaRegistry } from "@/effectRegistry";
import type { GameState } from "@/game";
import { renderDescription } from "@/stringUtils";

import chroma from "chroma-js";

interface EffectBadgeProps
{
  effect: EffectData;
  game: GameState; // for dynamic descriptions
}

export function EffectBadge({ effect, game }: EffectBadgeProps)
{
  const meta = effectMetaRegistry[effect.name];

  if (!meta)
  {
    return (
      <Badge variant="destructive">
        Unknown Effect: {effect.name}
      </Badge>
    );
  }

  const Icon = meta.icon;

  const textColor =
    chroma.contrast(meta.backgroundColor, "white") > 4.5 ? "white" : "black";

  return (
    <Popover>
      <PopoverTrigger>
        <Badge
          className="cursor-pointer flex items-center gap-1"
          style={{
            backgroundColor: meta.backgroundColor,
            color: textColor,
          }}
        >
          {Icon && (
            <Icon
              className="w-3 h-3"
              style={{ transform: "scale(1.25)", transformOrigin: "center" }}
            />
          )}
          {meta.title}: {effect.value}
        </Badge>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={8}
        className="max-w-xs text-sm ring-2"
        style={{
          // Use a slightly darker shade of the effect's color for the border
          borderColor: chroma(meta.backgroundColor).darken(0.5).hex(),
          boxShadow: `0 0 0 2px ${chroma(meta.backgroundColor).darken(0.5).hex()}`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span className="font-semibold">{meta.title}</span>
        </div>

        <p>{renderDescription(meta.getDescription(effect, game))}</p>
      </PopoverContent>
    </Popover>
  );
}
