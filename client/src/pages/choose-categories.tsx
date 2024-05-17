import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { Tick } from "@/lib/icons"
import { CATEGORIES } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function ChooseCategories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<string[]>([])
  const categoriesMutation = useCategoriesMutation()
  const { user } = useAuthContext()

  if (!user) {
    toast("Please login first!")
    navigate("/login", { replace: true })
    return <></>
  }

  if (!user.hasNoCategories) {
    toast("You already have categories!")
    navigate("/", { replace: true })
    return <></>
  }

  return (
    <div className="flex flex-col min-h-full pt-24 justify-center items-center gap-16 overflow-y-scroll">
      <Button
        onClick={() => {
          if (categories.length < 3) {
            toast.error("Choose at least 3 categories!")
          }
          categoriesMutation.mutate({ categories })
        }}
        disabled={categories.length < 3 || categoriesMutation.isPending}
        className="absolute top-16 sm:top-20 right-4 gap-2"
      >
        <Tick className="size-5" />
        Submit
      </Button>
      <div className="flex flex-col justify-center items-center gap-3">
        <div className="text-xl">This is the final step.</div>
        <h1 className="text-5xl text-center font-bold">Choose categories</h1>
        <p>Choose at least 3 categories that interest you</p>
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        {CATEGORIES.map((category) => (
          <Button
            disabled={categories.includes(category)}
            onClick={() => setCategories([...categories, category])}
            key={category}
            variant="outline"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}

function useCategoriesMutation() {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  return useMutation<void, AxiosError, { categories: string[] }>({
    mutationKey: ["categories"],
    mutationFn: async ({ categories }) => {
      await axios.patch(
        "/api/users/categories",
        { categories, email: user?.email as string },
        {
          withCredentials: true,
        }
      )
    },
    onMutate: () => {
      toast.loading("Updating categories...")
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success("Categories added!")

      navigate("/", { replace: true })
    },
    onError: (error) => {
      const msg = (error.response?.data as any)?.message ?? error.message

      toast.dismiss()
      toast.error(msg)
    },
  })
}
