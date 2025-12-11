import React from "react";
import chroma from "chroma-js";
import { type LucideIcon } from "lucide-react";

interface CustomButtonProps {
  icon?: LucideIcon;
  children?: React.ReactNode;
  color?: string;
  outlineColor?: string;
  hoverColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  threeDHeight?: number;
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
  threeDHeight = 3,
}: CustomButtonProps) {
  const computedHoverColor = hoverColor || chroma(color).darken(0.5).hex();
  const text = chroma.contrast(color, "white") > 4.5 ? "white" : "black";
  const computedOutlineColor = outlineColor || chroma(color).darken(1.5).hex();

  const isIconOnly = Icon && !children;

  // Shadow values based on 3D height
  const restingShadow = `0 ${threeDHeight}px 0 1px ${computedOutlineColor}`;
  const pressedShadow = `0 0 0 1px ${computedOutlineColor}`;
  const restingTranslate = `${-threeDHeight}px`;
  const pressedTranslate = `0px`;

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
        boxShadow: restingShadow,
        translate: `0 ${restingTranslate}`,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = computedHoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = color;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = pressedShadow;
        e.currentTarget.style.translate = `0 ${pressedTranslate}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = restingShadow;
        e.currentTarget.style.translate = `0 ${restingTranslate}`;
      }}
    >
      {Icon && <Icon className={isIconOnly ? "w-5 h-5" : "w-4 h-4"} />}
      {children}
    </button>
  );
}
