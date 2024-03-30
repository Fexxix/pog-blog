import { Button } from "@/components/ui/button"
import { useThemeContext } from "@/contexts/ThemeProvider"
import { cn } from "@/lib/utils"
import { BsSun } from "react-icons/bs"
import { TbMoonStars } from "react-icons/tb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeChanger() {
  const { isDark, toggleTheme } = useThemeContext()

  const ThemeIcon = isDark ? TbMoonStars : BsSun
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="icon">
          <ThemeIcon className="size-5 text-black dark:text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(["system", "dark", "light"] as const).map((value) => (
          <DropdownMenuItem key={value} onClick={() => toggleTheme(value)}>
            {value[0].toUpperCase() + value.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
