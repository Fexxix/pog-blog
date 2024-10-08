import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loadingspinner"
import { useAuthContext, User } from "@/contexts/AuthContextProvider"
import { useThemeContext } from "@/contexts/ThemeProvider"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import axios, { type AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

type LoginFormData = {
  email: string
  password: string
}

type LoginMutationResponse = {
  user: User
  message: string
}

export function Login() {
  const { state } = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    mode: "onBlur",
  })
  const loginMutation = useLogin()
  const { isDark } = useThemeContext()

  const onSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data)
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                defaultValue={(state && state?.email) ?? ""}
                {...register("email", {
                  pattern: {
                    value:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                    message: "Invalid Email address!",
                  },
                  required: "This field is required!",
                  disabled: loginMutation.isPending,
                })}
                id="email"
                type="email"
                placeholder="m@example.com"
              />
              {touchedFields.email && errors.email && (
                <div className="text-red-600 text-xs select-none">
                  {errors.email?.message}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password", {
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                  required: "This field is required!",
                  disabled: loginMutation.isPending,
                })}
                id="password"
                type="password"
                placeholder="*******"
              />
              {touchedFields.password && errors.password && (
                <div className="text-red-600 text-xs select-none">
                  {errors.password?.message}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col justify-center items-center gap-3 w-full">
              <div className="flex items-center justify-center text-sm">
                Don't have an account?
                <Link className="underline ml-1" to="/signup">
                  Sign Up
                </Link>
              </div>
              <Button
                className="w-full"
                disabled={loginMutation.isPending || loginMutation.isSuccess}
              >
                {!loginMutation.isPending ? (
                  "Sign in"
                ) : (
                  <LoadingSpinner
                    className="text-white dark:text-black"
                    isDark={isDark}
                  />
                )}
              </Button>
              {(loginMutation.isSuccess || loginMutation.isError) && (
                <div
                  className={cn("text-xs select-none", {
                    "text-green-600": loginMutation?.data?.message,
                    "text-red-600": !loginMutation?.data?.message,
                  })}
                >
                  {loginMutation?.data?.message}
                  {(loginMutation?.error?.response?.data as any)?.message}
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function useLogin() {
  const { setUser, setHasSession } = useAuthContext()
  const navigate = useNavigate()

  return useMutation<LoginMutationResponse, AxiosError, LoginFormData>({
    mutationKey: ["login"],
    mutationFn: async ({ email, password }) => {
      return (
        await axios.post(
          `/api/users/login`,
          {
            email,
            password,
          },
          { withCredentials: true }
        )
      ).data
    },
    onSuccess: ({ user }) => {
      setUser(user)

      if (user.hasNoCategories) {
        navigate("/choose-categories", { replace: true })
      } else {
        navigate("/", { replace: true })
        toast.success("Logged in!")
      }

      setHasSession(true)
    },
  })
}
