import React from "react";
import chroma from "chroma-js";
import { type LucideIcon } from "lucide-react";

interface CustomButtonProps
{
  icon?: LucideIcon;
  children?: React.ReactNode;
  color?: string;
  outlineColor?: string;
  hoverColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function CustomButton({
  icon: Icon,
  children,
  color = "#444444",
  outlineColor,
  hoverColor,
  className = "",
  style = {},
  onClick,
}: CustomButtonProps)
{
  const computedHoverColor = hoverColor || chroma(color).darken(0.5).hex();
  const text = chroma.contrast(color, "white") > 4.5 ? "white" : "black";
  const computedOutlineColor = outlineColor || chroma(color).darken(1.5).hex();

  const isIconOnly = Icon && !children;

  return (
    <button
      onClick={onClick}
      className={`
        ${isIconOnly ? "" : "px-4 py-2"}
        rounded flex items-center justify-center
        ${isIconOnly ? "" : "gap-2"}
        transition-colors ${className}
      `}
      style={{
        backgroundColor: color,
        color: text,
        boxShadow: `0 2px 0 1px ${computedOutlineColor}`,
        ...style, // user overrides applied last
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = computedHoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color)}
      onMouseDown={(e) =>
      {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${computedOutlineColor}`;
        e.currentTarget.style.translate = "0 2px";
      }}
      onMouseUp={(e) =>
      {
        e.currentTarget.style.boxShadow = `0 2px 0 1px ${computedOutlineColor}`;
        e.currentTarget.style.translate = "0 0";
      }}
    >
      {Icon && <Icon className={isIconOnly ? "w-5 h-5" : "w-4 h-4"} />}
      {children}
    </button>
  );
}
