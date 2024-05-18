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

export const CATEGORIES = [
  "Technology",
  "Science",
  "Travel",
  "Food & Cooking",
  "Health & Fitness",
  "Fashion & Style",
  "Anime News",
  "Manga",
  "Anime Reviews",
  "Cosplay",
  "Anime Recommendations",
  "Anime Memes",
  "Fan Art",
  "Anime Music",
  "Anime Conventions",
  "Coding Challenges",
  "Web Development",
  "Mobile App Development",
  "Software Engineering",
  "Programming Languages",
  "Algorithms & Data Structures",
  "Developer Tools & Libraries",
  "Tech News",
  "Arts & Crafts",
  "Business & Finance",
  "Sports",
  "Music",
  "Movies & TV Shows",
  "Books & Literature",
  "Gaming",
  "Home & Garden",
  "Photography",
  "Pets & Animals",
  "DIY & How-To Guides",
  "Education & Learning",
  "Parenting",
  "Environment & Sustainability",
] as const
