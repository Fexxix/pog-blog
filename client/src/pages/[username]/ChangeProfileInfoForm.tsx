import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EditIcon, ImageIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"

type ProfileMutationArgs = {
  username: string
  profilePicture: string
  biography: string
  id: string
}

function useProfileMutation() {
  const queryClient = useQueryClient()
  const { pathname } = useLocation()

  return useMutation<any, AxiosError | Error, ProfileMutationArgs>({
    mutationKey: ["profile", pathname],
    mutationFn: async (profileInfo) => {
      return (
        await axios.patch(`/api/users/edit/${profileInfo.id}`, profileInfo)
      ).data
    },
    onMutate: () => {
      toast.loading("Updating profile...")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", pathname] })
      toast.dismiss()
      toast.success("Profile updated!")
    },
    onError: (err) => {
      const msg =
        err instanceof AxiosError ? err.response?.data?.message : err.message
      toast.dismiss()
      toast.error(msg)
    },
  })
}

export default function ChangeProfileInfoForm({
  initialUsername,
  initialProfilePicture,
  initialBiography,
  id,
}: {
  initialUsername: string
  initialProfilePicture: string
  initialBiography: string
  id: string
}) {
  const [profilePicture, setProfilePicture] = useState(initialProfilePicture)
  const [username, setUsername] = useState(initialUsername)
  const [biography, setBiography] = useState(initialBiography)
  const [edit, setEdit] = useState(false)

  const profileMutation = useProfileMutation()

  const hasChanged =
    initialBiography !== biography ||
    initialUsername !== username ||
    initialProfilePicture !== profilePicture

  const noEmpty =
    biography.length > 0 && username.length > 0 && profilePicture.length > 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!noEmpty || !hasChanged) return

    profileMutation.mutate({ username, profilePicture, biography, id })
  }

  return (
    <form onSubmit={handleSubmit} className="contents">
      <Button
        variant="ghost"
        type="button"
        className={cn("absolute top-2 right-2", {
          "after:absolute after:top-1/2 after:left-1/2 after:-translate-y-1/2 after:-translate-x-1/2 after:w-0.5 after:h-8 after:bg-black dark:after:bg-white after:-rotate-45":
            edit,
        })}
        onClick={() => setEdit(!edit)}
      >
        <EditIcon className="size-6" />
      </Button>
      {hasChanged && noEmpty && (
        <Button
          type="submit"
          disabled={profileMutation.isPending}
          className="absolute top-2 right-16"
        >
          Save
        </Button>
      )}
      {edit && (
        <ChangeAvatarButton
          initialProfilePicture={initialProfilePicture}
          profilePicture={profilePicture}
          setProfilePicture={setProfilePicture}
        />
      )}
      <Avatar className="size-40 absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 border-8 border-white dark:border-black">
        <AvatarImage
          src={
            initialProfilePicture === profilePicture || profilePicture === ""
              ? initialProfilePicture
              : profilePicture
          }
        />
        <AvatarFallback>{initialUsername}</AvatarFallback>
      </Avatar>
      <div className="pt-20">
        <h1
          contentEditable={edit}
          suppressContentEditableWarning
          className="pt-8 text-3xl font-bold text-center outline-none"
          spellCheck={false}
          onInput={(event) =>
            setUsername(event.currentTarget.textContent ?? initialUsername)
          }
        >
          {initialUsername}
        </h1>
        <p
          contentEditable={edit}
          suppressContentEditableWarning
          className="pt-4 text-center text-sm sm:text-base outline-none"
          onInput={(event) =>
            setBiography(event.currentTarget.textContent ?? initialBiography)
          }
        >
          {initialBiography}
        </p>
      </div>
    </form>
  )
}

function ChangeAvatarButton({
  initialProfilePicture,
  profilePicture,
  setProfilePicture,
}: {
  initialProfilePicture: string
  profilePicture: string
  setProfilePicture: (profilePicture: string) => void
}) {
  const [open, setOpen] = useState(false)

  const setProfilePictureAndClose = () => {
    if (profilePicture !== initialProfilePicture && profilePicture !== "") {
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (profilePicture === "") {
          setProfilePicture(initialProfilePicture)
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="icon"
          type="button"
          className="opacity-0 hover:opacity-100 transition-opacity bg-zinc-200/50 dark:bg-zinc-800/50 size-40 rounded-full z-10 absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 border-8 border-white dark:border-black"
        >
          <ImageIcon className="size-16" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            You can change your profile picture here.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={profilePicture}
          onChange={(e) => {
            setProfilePicture(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setProfilePictureAndClose()
            }
          }}
          placeholder="Paste or type an image URL"
        />
        <span className="text-sm">
          You can use{" "}
          <a className="underline" href="https://imgbb.com/" target="_blank">
            ImgBB
          </a>{" "}
          to host your image.
        </span>
        <DialogFooter>
          <Button onClick={setProfilePictureAndClose}>Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
