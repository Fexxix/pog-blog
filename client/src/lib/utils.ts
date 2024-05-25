import { AxiosError } from "axios"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export type Category = (typeof CATEGORIES)[number]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
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

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout>

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  } as T
}

export function getAxiosErrorMessage(error: AxiosError): string {
  return (error.response?.data as any)?.message ?? error.message
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function formatRelativeDate(date: Date) {
  const now = new Date()
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.round(diffInSeconds), "second")
  }

  const diffInMinutes = diffInSeconds / 60
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(Math.round(diffInMinutes), "minute")
  }

  const diffInHours = diffInMinutes / 60
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(Math.round(diffInHours), "hour")
  }

  const diffInDays = diffInHours / 24
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(Math.round(diffInDays), "day")
  }

  const diffInWeeks = diffInDays / 7
  if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(Math.round(diffInWeeks), "week")
  }

  const diffInMonths = diffInDays / 30
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(Math.round(diffInMonths), "month")
  }

  const diffInYears = diffInDays / 365
  return rtf.format(Math.round(diffInYears), "year")
}
