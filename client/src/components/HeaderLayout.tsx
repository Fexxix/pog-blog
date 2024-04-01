import { Link, Outlet, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { ThemeChanger } from "./ThemeChanger"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { HeaderAvatar } from "./HeaderAvatar"

export function HeaderLayout() {
  const { pathname } = useLocation()
  const { user } = useAuthContext()

  return (
    <>
      <header className="fixed flex items-center justify-between top-0 w-full px-4 md:px-10 py-2 border-b border-b-neutral-500 z-10">
        <div className="flex items-center gap-3">
          <img
            className="size-8 md:size-10 invert dark:invert-0"
            src="/logo.svg"
            alt="logo"
          />
          <span className="text-3xl text-black dark:text-white font-semibold select-none">
            Pog Blog
          </span>
        </div>
        <div className="flex items-center gap-3">
          {pathname !== "/login" && !user && (
            <Link to="/login">
              <Button>Login</Button>
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
