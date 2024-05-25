import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useNavigate } from "react-router-dom"
import { SignOutIcon, UserProfileCircle } from "@/lib/icons"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"

function useLogoutMutation() {
  const navigate = useNavigate()
  const { setHasSession, setUser } = useAuthContext()

  return useMutation<any, AxiosError | Error>({
    mutationKey: ["logout"],
    mutationFn: async () => {
      return await axios.post(`/api/users/logout`)
    },
    onMutate: () => {
      toast.loading("Logging out...")
    },
    onSuccess: () => {
      setHasSession(false)
      setUser(null)

      toast.dismiss()
      toast.success("Logged out!")
      navigate("/login")
    },
    onError: (error) => {
      const msg =
        error instanceof AxiosError
          ? error.response?.data.message
          : error.message

      toast.dismiss()
      toast.error(msg)
    },
  })
}

export function HeaderAvatar() {
  const { user } = useAuthContext()
  const logoutMutation = useLogoutMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>{user?.username}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link className="contents" to={`/${user?.username}`}>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <UserProfileCircle />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() => {
            logoutMutation.mutate()
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <SignOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
