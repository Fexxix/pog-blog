import { createContext, useContext, useState } from "react"
import { API_URL } from "../config"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"

type User = {
  id: string
  email: string
  profilePicture: string
  username: string
  biography: string
}

type AuthContextType = {
  user: User | null
  login: () => void
  signUp: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext() {
  return useContext(AuthContext)!
}

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

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
  })

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async () => {
      await axios.post(
        `${API_URL}/users/login`,
        {
          email: "foo@bar.com",
          password: "foobar",
        },
        { withCredentials: true }
      )
    },
  })

  function login() {
    loginMutation.mutate()
  }

  function signUp() {}

  if (existingSessionQuery.isLoading) {
    return <div>Loading...</div>
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
    signUp,
    user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
