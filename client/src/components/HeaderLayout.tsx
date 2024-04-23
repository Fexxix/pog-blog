import { Link, Outlet, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { ThemeChanger } from "./ThemeChanger"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { HeaderAvatar } from "./HeaderAvatar"
import { Pencil } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function HeaderLayout() {
  const { pathname } = useLocation()
  const { user } = useAuthContext()

  return (
    <>
      <header
        className={cn(
          "fixed flex items-center bg-white dark:bg-zinc-950 justify-between top-0 w-full px-4 md:px-10 py-2 border-b border-b-zinc-200 dark:border-b-zinc-800 z-10",
          {
            absolute: pathname === "/write",
          }
        )}
      >
        <div className="flex items-center gap-3">
          <img
            className="size-8 md:size-10 invert dark:invert-0"
            src="/logo.svg"
            alt="logo"
          />
          <span className="text-3xl hidden sm:block text-black dark:text-white font-semibold select-none">
            Pog Blog
          </span>
        </div>
        <div className="flex items-center gap-3">
          {pathname !== "/login" && !user && (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
          {pathname === "/write" && (
            <>
              <div id="publishBtnContainer" className="contents" />
              <div id="writePageOptionsContainer" className="contents" />
            </>
          )}
          {user && pathname !== "/write" && (
            <Link className="contents" to="/write">
              <Button variant="ghost" className="items-center gap-2 px-2.5">
                <Pencil className="size-5" />
                <span className="sr-only sm:not-sr-only font-semibold">
                  Write
                </span>
              </Button>
            </Link>
          )}
          <ThemeChanger />
          {user && <HeaderAvatar />}
        </div>
      </header>
      <Outlet />
    </>
  )
}
