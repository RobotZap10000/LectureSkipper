import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[])
{
  return twMerge(clsx(inputs))
}

// Weighted random helper
export function weightedRandom<T>(items: T[], weights: number[]): T
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