import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { CommentBubble, Heart, OptionsIcon } from "@/lib/icons"
import { type Category, cn, publishedDateFormatter } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  Checked,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createPortal } from "react-dom"
import { BookOpenCheck } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { CategoriesSelect } from "@/components/CategoriesSelect"
import { Editor, EditorType } from "@/components/Editor"
import { useState } from "react"
import { BlogImage } from "@/components/BlogImage"

function useBlogsMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthContext()

  return useMutation<
    any,
    Error | AxiosError,
    {
      title: string
      content: string
      description: string
      image: string
      categories: Category[]
    }
  >({
    mutationKey: ["blogs"],
    mutationFn: async ({ content, description, image, title, categories }) => {
      return await axios.post(
        `/api/blogs/add`,
        {
          content,
          description,
          image,
          title,
          categories,
        },
        { withCredentials: true }
      )
    },
    onMutate: () => {
      return toast.loading("Posting blog...")
    },
    onSuccess: (_, { title }) => {
      toast.dismiss()
      toast.success("Blog posted!")

      queryClient.invalidateQueries({ queryKey: ["blogs"] })
      navigate(
        `/${encodeURIComponent(user!.username)}/${encodeURIComponent(title)}`,
        { replace: true }
      )
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError ? err.response?.data.message : err.message

      toast.error(message)
    },
    onSettled: () => {
      toast.dismiss()
    },
  })
}

export function WritePage() {
  const { user } = useAuthContext()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [blogImage, setBlogImage] = useState<{
    src: string
    title: string
  } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [editor, setEditor] = useState<EditorType | null>(null)

  const [showImage, setShowImage] = useState<Checked>(true)
  const [showToolbar, setShowToolbar] = useState<Checked>(true)

  const publishBtnContainer = document.getElementById("publishBtnContainer")
  const writePageOptions = document.getElementById("writePageOptionsContainer")

  const blogMutation = useBlogsMutation()

  return (
    <div className="pt-24 w-11/12 sm:w-3/4 lg:w-1/2 mx-auto">
      {publishBtnContainer &&
        createPortal(
          <Button
            onClick={() => {
              const content = editor!.isEmpty ? undefined : editor?.getHTML()
              if (!title) toast.error("Title is required!")
              if (!description) toast.error("Description is required!")
              if (!content) toast.error("Content is required!")
              if (categories.length === 0)
                toast.error("Categories are required!")
              if (!title || !description || !content || !categories.length)
                return

              blogMutation.mutate({
                content: content || "",
                description,
                image: (showImage ? blogImage?.src : null) ?? "",
                title,
                categories,
              })
            }}
            disabled={blogMutation.isPending || blogMutation.isSuccess}
            className="gap-2 items-center"
          >
            <BookOpenCheck />
            <span className="sr-only md:not-sr-only">Publish</span>
          </Button>,
          publishBtnContainer
        )}
      {writePageOptions &&
        createPortal(
          <WritePageOptionsDropdown
            showImage={showImage}
            setShowImage={setShowImage}
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />,
          writePageOptions
        )}
      <h1
        className={cn(
          "text-5xl font-bold bg-transparent outline-none relative after:absolute after:top-0 after:left-[5px] after:text-[#9fa7ae] after:pointer-events-none after:content-[attr(data-placeholder)]",
          {
            "after:hidden": !!title,
          }
        )}
        contentEditable
        data-placeholder="Title"
        onInput={(e) => setTitle(e.currentTarget.textContent ?? "")}
      />
      <h2
        className={cn(
          "w-full pt-4 bg-transparent text-zinc-400 text-lg md:text-xl outline-none relative after:absolute after:top-4 after:left-[5px] after:text-[#9fa7ae] after:pointer-events-none after:content-[attr(data-placeholder)]",
          {
            "after:hidden": !!description,
          }
        )}
        contentEditable
        data-placeholder="Write a short description..."
        onInput={(e) => setDescription(e.currentTarget.textContent ?? "")}
      />
      <CategoriesSelect categories={categories} setCategories={setCategories} />
      <div className="flex items-center gap-3 mt-4 py-2">
        <Avatar>
          <AvatarImage
            className="bg-zinc-200 dark:bg-zinc-800 size-10 rounded-full"
            src={user?.profilePicture}
          />
          <AvatarFallback>{user?.username}</AvatarFallback>
        </Avatar>
        <span>{user?.username}</span>
        <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
        <span className="text-xs sm:text-sm">
          {publishedDateFormatter.format(new Date())}
        </span>
      </div>
      <div className="flex items-center gap-3 px-2 mt-2 border-y border-y-zinc-200 dark:border-y-zinc-800">
        <div className="flex items-center gap-2">
          <Button variant="icon" className="p-0">
            <Heart className="size-6 flex-shrink-0" filled={false} />
          </Button>
          <Button
            variant="icon"
            className="text-zinc-400 hover:text-current disabled:text-zinc-600 transition-colors text-sm sm:text-base p-0"
          >
            69K
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="icon" className="p-0">
            <CommentBubble />
          </Button>
          <Button
            variant="icon"
            className="text-zinc-400 hover:text-current disabled:text-zinc-600 transition-colors text-sm sm:text-base p-0"
          >
            69K
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
        {showImage && (
          <BlogImage blogImage={blogImage} setBlogImage={setBlogImage} />
        )}
      </div>
      <Editor showToolbar={showToolbar} setEditor={setEditor} />
    </div>
  )
}

function WritePageOptionsDropdown({
  showImage,
  setShowImage,
  showToolbar,
  setShowToolbar,
}: {
  showImage: Checked
  setShowImage: (showImage: boolean) => void
  showToolbar: Checked
  setShowToolbar: (showToolbar: boolean) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <OptionsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showImage}
          onCheckedChange={setShowImage}
        >
          Image
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showToolbar}
          onCheckedChange={setShowToolbar}
        >
          Toolbar
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
