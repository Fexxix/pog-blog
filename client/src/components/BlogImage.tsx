import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ImageIcon } from "@/lib/icons"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function BlogImage({
  blogImage,
  setBlogImage,
}: {
  blogImage: { src: string; title: string } | null
  setBlogImage: ({ src, title }: { src: string; title: string }) => void
}) {
  return (
    <div
      className={cn(
        "w-[640px] h-[480px] relative flex justify-center items-center mt-8",
        {
          "w-auto h-auto": !!blogImage,
        }
      )}
    >
      {blogImage && (
        <img
          src={blogImage.src}
          alt={`thumbnail for ${blogImage.title}`}
          className="object-cover"
        />
      )}
      <AddBlogImageButton
        setBlogImage={setBlogImage}
        className={cn("absolute w-full h-full inset-0", {
          "opacity-0 hover:opacity-50": !!blogImage,
        })}
      />
    </div>
  )
}

function AddBlogImageButton({
  setBlogImage,
  className,
}: {
  setBlogImage: ({ src, title }: { src: string; title: string }) => void
  className: string
}) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")

  const addImage = () => {
    if (!imageUrl) {
      return toast.error("Please enter an image URL", {
        duration: 3000,
        closeButton: true,
      })
    }

    setBlogImage({ src: imageUrl, title })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button
          variant="icon"
          className={cn(
            "rounded bg-[#2f2f2f] dark:bg-zinc-800 flex justify-center items-center",
            className
          )}
        >
          <ImageIcon className="size-40 fill-zinc-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>
            Add a thumbnail image for the blog
          </DialogDescription>
        </DialogHeader>
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addImage()
            }
          }}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Paste or type an image URL"
        />
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addImage()
            }
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Image title (optional)"
          className="mt-2"
        />
        <span className="text-sm">
          You can use{" "}
          <a className="underline" href="https://imgbb.com/" target="_blank">
            ImgBB
          </a>{" "}
          to host your image.
        </span>
        <DialogFooter>
          <Button onClick={addImage}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
