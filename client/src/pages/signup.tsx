import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"
import { useMutation } from "@tanstack/react-query"
import { LoadingSpinner } from "@/components/ui/loadingspinner"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useThemeContext } from "@/contexts/ThemeProvider"
import { disallowedCharactersInURL } from "@/lib/utils"

const disallowedNames = ["blogs", "login", "signup", "otp", "feed"]

export type SignupFormData = {
  username: string
  email: string
  password: string
}

export function Signup() {
  const signupMutation = useSignup()
  const { isDark } = useThemeContext()

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<SignupFormData>({
    mode: "onBlur",
  })

  const onSubmit = async (data: SignupFormData) => {
    await signupMutation.mutateAsync(data)
  }

  return (
    <div className="h-full w-full dark:bg-black bg-white flex items-center justify-center">
      <Card className="mx-auto w-96 max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                {...register("username", {
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters long",
                  },
                  required: "This field is required!",
                  disabled: signupMutation.isPending,
                  validate: (value) => {
                    if (disallowedNames.includes(value)) {
                      return "Username is not allowed"
                    }

                    if (
                      disallowedCharactersInURL.some((char) =>
                        value.includes(char)
                      )
                    ) {
                      return "URL contains disallowed characters"
                    }

                    return true
                  },
                })}
                id="username"
                placeholder="toxel32"
              />
              {touchedFields.username && errors.username && (
                <div className="text-red-600 text-xs select-none">
                  {errors.username?.message}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", {
                  pattern: {
                    value:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                    message: "Please enter a valid email address",
                  },
                  required: "This field is required!",
                  disabled: signupMutation.isPending,
                })}
                id="email"
                type="email"
                placeholder="toxel32@imcool.com"
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
                  disabled: signupMutation.isPending,
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
            <Button
              type="submit"
              disabled={signupMutation.isPending || signupMutation.isSuccess}
              className="w-full"
            >
              {!signupMutation.isPending ? (
                "Create an account"
              ) : (
                <LoadingSpinner
                  className="text-white dark:text-black"
                  isDark={isDark}
                />
              )}
            </Button>
            {(signupMutation.isSuccess || signupMutation.isError) && (
              <div
                className={cn("text-xs select-none", {
                  "text-green-600": signupMutation?.data?.message,
                  "text-red-600": !signupMutation?.data?.message,
                })}
              >
                {signupMutation?.data?.message}
                {(signupMutation?.error?.response?.data as any)?.message}
              </div>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function useSignup() {
  const navigate = useNavigate()

  return useMutation<any, AxiosError, SignupFormData>({
    mutationKey: ["signup"],
    mutationFn: async ({ email, password, username }) => {
      return (
        await axios.post(
          `/api/users/signup`,
          {
            email,
            password,
            username,
          },
          { withCredentials: true }
        )
      ).data
    },
    onSuccess: (_, { email }) => {
      navigate("/otp", {
        replace: true,
        state: {
          email,
        },
      })
      toast.success("Account creation done! Please verify your email.")
    },
  })
}
