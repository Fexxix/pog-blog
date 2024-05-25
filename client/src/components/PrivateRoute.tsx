import { useEffect, type PropsWithChildren } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { toast } from "sonner"

export function PrivateRoute({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!user) {
      toast("Please login first")
      navigate("/login", { state: { redirectTo: pathname } })
    }
  }, [])

  return children
}
