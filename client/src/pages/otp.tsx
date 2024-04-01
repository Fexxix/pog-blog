import { useLocation, useNavigate } from "react-router-dom"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { API_URL } from "@/config"
import { LoadingSpinner } from "@/components/ui/loadingspinner"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { toast } from "sonner"
import { useThemeContext } from "@/contexts/ThemeProvider"

type OTPFormData = {
  email: string
  otp: string
}

export function OTP() {
  const OTPVerifyMutation = useOTPVerifyMutation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { isDark } = useThemeContext()

  const verifyEmailAndOTP = async (data: OTPFormData) => {
    await OTPVerifyMutation.mutateAsync(data)
  }

  useEffect(() => {
    if (!state || state?.email === undefined) {
      navigate("/", { replace: true })
    }
  }, [])

  if (!state || state?.email === undefined) return null

  return (
    <div className="flex h-full w-full flex-col gap-5 items-center justify-center">
      <h1 className="text-2xl w-1/2 text-center">
        We've sent you a 6 digit verification code at {state?.email}. Check it
        and put it here to verify your email.
      </h1>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        onComplete={(otp) =>
          verifyEmailAndOTP({
            email: state.email,
            otp,
          })
        }
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {!OTPVerifyMutation.isPending && (
        <p>It'll be submitted automatically when you fill up the input.</p>
      )}
      {OTPVerifyMutation.isPending && (
        <div className="flex flex-col gap-2 items-center justify-center">
          <LoadingSpinner isDark={isDark} />
          <span>Verifying...</span>
        </div>
      )}
      {(OTPVerifyMutation.isError || OTPVerifyMutation.isSuccess) && (
        <div
          className={cn(
            {
              "text-red-600": OTPVerifyMutation.isError,
              "text-green-600": OTPVerifyMutation.isSuccess,
            },
            "text-sm select-none"
          )}
        >
          {OTPVerifyMutation?.data?.message}
          {(OTPVerifyMutation.error?.response?.data as any)?.message}
        </div>
      )}
    </div>
  )
}

function useOTPVerifyMutation() {
  const navigate = useNavigate()

  return useMutation<any, AxiosError, OTPFormData>({
    mutationKey: ["otp"],
    mutationFn: async (data) => {
      return (await axios.post(`${API_URL}/users/verify-email`, data)).data
    },
    onSuccess: (_, { email }) => {
      navigate("/login", {
        replace: true,
        state: {
          email,
        },
      })
      toast.success("Email verification done! Please login.")
    },
  })
}
