import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const publicDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export const likesAndCommentsCountFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
})

export const disallowedCharactersInURL = [
  " ",
  "<",
  ">",
  "#",
  "%",
  "{",
  "}",
  "|",
  "\\",
  "^",
  "~",
  "[",
  "]",
  "`",
] as const
