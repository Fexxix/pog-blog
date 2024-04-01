import { cn } from "@/lib/utils"
import { SiSpinrilla } from "react-icons/si"

export function LoadingSpinner({
  fullPage,
  className,
  isDark,
}: {
  fullPage?: boolean
  className?: string
  isDark: boolean
}) {
  const spinner = (
    <SiSpinrilla
      className={cn(
        {
          "text-black": !isDark,
          "text-white": isDark,
          "h-10 w-10": fullPage,
        },
        "animate-spin",
        className
      )}
    />
  )

  return fullPage ? (
    <div
      className={cn(
        {
          "bg-black": isDark,
          "bg-white": !isDark,
        },
        "flex items-center justify-center h-screen w-full"
      )}
    >
      {spinner}
    </div>
  ) : (
    spinner
  )
}
