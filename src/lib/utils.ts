import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number): string {
  if (typeof number !== "number") return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number); // 1.1M -> 1.1M
}
