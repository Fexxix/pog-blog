import { createContext, useContext, useState } from "react"
import { API_URL } from "../config"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { LoadingSpinner } from "@/components/ui/loadingspinner"

type User = {
  id: string
  email: string
  profilePicture: string
  username: string
  biography: string
}

type AuthContextType = {
  user: User | null
  login: (loginFormData: LoginFormData) => void
}

export type LoginFormData = {
  email: string
  password: string
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

  const loginMutation = useLogin()

  function login({ email, password }: LoginFormData) {
    loginMutation.mutate({ email, password })
  }

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
    login,
    user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useLogin() {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ email, password }: LoginFormData) => {
      await axios.post(
        `${API_URL}/users/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      )
    },
  })
}
