import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[])
{
  return twMerge(clsx(inputs))
}

// Fisher–Yates (aka Knuth) Shuffle.
// Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array: any[])
{
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0)
  {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
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

export function stringifyWithInfinity(value: unknown)
{
  return JSON.stringify(value, (_, v) =>
  {
    if (v === Infinity) return "__INF__";
    if (v === -Infinity) return "__-INF__";
    if (Number.isNaN(v)) return "__NaN__";
    return v;
  });
}

export function parseWithInfinity<T>(json: string): T
{
  return JSON.parse(json, (_, v) =>
  {
    if (v === "__INF__") return Infinity;
    if (v === "__-INF__") return -Infinity;
    if (v === "__NaN__") return NaN;
    return v;
  });
}