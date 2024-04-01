import { createContext, useContext, useState } from "react"
import { API_URL } from "../config"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { LoadingSpinner } from "@/components/ui/loadingspinner"

export type User = {
  id: string
  email: string
  profilePicture: string
  username: string
  biography: string
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext() {
  return useContext(AuthContext)!
}

const privateRoutes = ["/profile", "/blogs"]

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const currentRoute = window.location.pathname

  const existingSessionQuery = useQuery<User, AxiosError>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users/me`, {
        withCredentials: true,
      })

      if (res.status === 200) {
        return res.data
      }
    },
    refetchOnWindowFocus: false,
    enabled: privateRoutes.includes(currentRoute),
  })

  if (existingSessionQuery.isLoading) {
    return <LoadingSpinner fullPage />
  }

  // if (userQuery.isError) {
  //   if (
  //     userQuery.error.response &&
  //     userQuery.error.response.data &&
  //     typeof userQuery.error.response.data === "object" &&
  //     "message" in userQuery.error.response.data &&
  //     typeof userQuery.error.response.data.message === "string"
  //   ) {
  //     return <div>{userQuery.error.response.data.message}</div>
  //   } else {
  //     return <div>{userQuery.error.cause?.message}</div>
  //   }
  // }

  if (existingSessionQuery.data && !user) {
    setUser(existingSessionQuery.data)
  }

  const value: AuthContextType = {
    user,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
