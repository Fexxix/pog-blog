import { Link, Outlet, useLocation, useParams } from "react-router-dom"
import { Button } from "../../ui/button"
import { ThemeChanger } from "./ThemeChanger"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { HeaderAvatar } from "./HeaderAvatar"
import { Pencil } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { SearchDialog } from "./SearchDialog"

export function HeaderLayout() {
  const { pathname } = useLocation()
  const { user } = useAuthContext()

  const { username = "", title = "" } = useParams() as any

  const canDisplayEditLinkContainer = !!username && !!title

  const isEditRoute = pathname.startsWith("/edit/")

  const canDisplaySearch = (() => {
    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/choose-categories"
    )
      return false
    if (pathname === "/" && !user) return false
    return true
  })()

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
        <div className="flex items-center gap-5">
          <Link className="contents" to="/">
            <img
              className="size-8 md:size-10 invert dark:invert-0"
              src="/logo.svg"
              alt="logo"
            />
          </Link>
          {canDisplaySearch && <SearchDialog />}
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
          {isEditRoute && (
            <>
              <div id="publishBtnContainer" className="contents" />
              <div id="writePageOptionsContainer" className="contents" />
            </>
          )}
          {user && pathname !== "/write" && !isEditRoute && (
            <Link className="contents" to="/write">
              <Button variant="ghost" className="items-center gap-2 px-2.5">
                <Pencil className="size-5" />
                <span className="sr-only sm:not-sr-only font-semibold">
                  Write
                </span>
              </Button>
            </Link>
          )}
          {canDisplayEditLinkContainer && (
            <div id="editLinkContainer" className="contents" />
          )}
          <ThemeChanger />
          {user && <HeaderAvatar />}
        </div>
      </header>
      <Outlet />
    </>
  )
}
