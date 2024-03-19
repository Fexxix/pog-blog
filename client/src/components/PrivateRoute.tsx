import { useEffect, type PropsWithChildren } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../contexts/AuthContextProvider"

export function PrivateRoute({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [])

  return children
}
