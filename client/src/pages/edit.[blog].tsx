import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { CommentBubble, Heart, OptionsIcon, Tick } from "@/lib/icons"
import { type Category, cn, publishedDateFormatter } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  type Checked,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoriesSelect } from "@/components/CategoriesSelect"
import { useEffect, useState } from "react"
import { Editor, EditorType } from "@/components/Editor"
import { BlogImage } from "@/components/BlogImage"

type Blog = {
  id: string
  title: string
  content: string
  description: string
  datePublished: string
  likes: number
  comments: number
  image: string
  hasLiked: boolean
  categories: Category[]
  isAuthor: boolean
}

function useBlogsMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  return useMutation<
    Blog,
    AxiosError,
    {
      title: string
      content: string
      description: string
      image: string
      categories: Category[]
      id: string
      titleChanged: boolean
    }
  >({
    mutationKey: ["blogs"],
    mutationFn: async ({
      content,
      description,
      image,
      title,
      categories,
      id,
    }) => {
      return (
        await axios.patch(
          `/api/blogs/edit`,
          {
            content,
            description,
            image,
            title,
            categories,
            id,
          },
          { withCredentials: true }
        )
      ).data
    },
    onMutate: () => {
      return toast.loading("Updating blog...")
    },
    onSuccess: (updatedBlog, { title, titleChanged }) => {
      toast.dismiss()
      toast.success("Blog Updated!")

      if (titleChanged) {
        queryClient.invalidateQueries({
          queryKey: ["edit", title],
        })
        queryClient.invalidateQueries({ queryKey: [user?.username, title] })

        navigate(`/edit/${encodeURIComponent(title)}`, {
          replace: true,
          state: { blog: updatedBlog },
        })
      } else {
        queryClient.setQueryData(["edit", title], updatedBlog)
        queryClient.setQueryData([user?.username, title], {
          ...updatedBlog,
          author: {
            username: user?.username,
            profilePicture: user?.profilePicture,
          },
        })
      }
    },
    onError: (err) => {
      const message = (err.response?.data as any)?.message ?? err.message

      toast.error(message)
    },
    onSettled: () => {
      toast.dismiss()
    },
  })
}

function useBlogQuery({
  username,
  title,
  enabled,
  initialData,
}: {
  username: string
  title: string
  enabled: boolean
  initialData: Blog | null
}) {
  return useQuery<Blog>({
    queryKey: ["edit", title],
    queryFn: async () => {
      return (
        await axios.get(
          `/api/blogs/${encodeURIComponent(username)}/${encodeURIComponent(
            title
          )}`,
          {
            withCredentials: true,
          }
        )
      ).data
    },
    refetchOnWindowFocus: false,
    initialData: initialData ?? undefined,
    enabled,
  })
}

export function EditPage() {
  const { user } = useAuthContext()
  const { title: titleParam } = useParams() as any
  const { state } = useLocation()

  const blogQuery = useBlogQuery({
    username: user!.username,
    title: titleParam,
    enabled: !state,
    initialData: state?.blog as Blog | null,
  })

  const [title, setTitle] = useState(blogQuery.data?.title ?? "")

  const [description, setDescription] = useState(
    blogQuery.data?.description ?? ""
  )
  const [blogImage, setBlogImage] = useState<{
    src: string
    title: string
  } | null>(
    blogQuery.data?.image ? { src: blogQuery.data?.image, title: "" } : null
  )
  const [categories, setCategories] = useState<Category[]>(
    blogQuery.data?.categories || []
  )
  const [editor, setEditor] = useState<EditorType | null>(null)

  const [showImage, setShowImage] = useState<Checked>(true)
  const [showToolbar, setShowToolbar] = useState<Checked>(true)

  const publishBtnContainer = document.getElementById("publishBtnContainer")
  const writePageOptions = document.getElementById("writePageOptionsContainer")

  const blogMutation = useBlogsMutation()

  const isSame = () => {
    return (
      title === blogQuery.data?.title &&
      description === blogQuery.data?.description &&
      blogImage?.src === blogQuery.data?.image &&
      JSON.stringify(categories) ===
        JSON.stringify(blogQuery.data?.categories) &&
      editor?.getHTML() === blogQuery.data?.content
    )
  }

  useEffect(() => {
    setTitle(blogQuery.data?.title ?? "")
    setDescription(blogQuery.data?.description ?? "")
    setBlogImage(
      blogQuery.data?.image ? { src: blogQuery.data.image, title: "" } : null
    )
    setCategories(blogQuery.data?.categories || [])
  }, [blogQuery.data])

  if (blogQuery.isLoading || !blogQuery.data) {
    return <PageSkeleton />
  }

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

              if (isSame()) return toast("No changes made!")

              const titleChanged = title !== blogQuery.data.title

              blogMutation.mutate({
                content: content || "",
                description,
                image: blogImage?.src ?? "",
                title,
                categories,
                id: blogQuery.data.id,
                titleChanged,
              })
            }}
            disabled={blogMutation.isPending}
            className="gap-2 items-center"
          >
            <Tick className="size-5" />
            <span className="sr-only md:not-sr-only">Update</span>
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
        ref={(el) => {
          if (el?.innerText === "" && title) el.innerText = title
        }}
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
        ref={(el) => {
          if (el?.innerText === "" && description) el.innerText = description
        }}
      />
      <CategoriesSelect setCategories={setCategories} categories={categories} />
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
      <Editor
        showToolbar={showToolbar}
        setEditor={setEditor}
        initialContent={blogQuery.data.content}
      />
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

function PageSkeleton() {
  return (
    <div className="pt-24 w-11/12 sm:w-3/4 lg:w-1/2 mx-auto">
      <Skeleton className="h-8" />
      <Skeleton className="h-8 w-1/2 mt-2" />
      <Skeleton className="h-6 mt-4" />
      <Skeleton className="h-6 mt-2" />
      <Skeleton className="h-6 w-1/2 mt-2" />
      <div className="flex items-center gap-3 mt-4 py-2">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="size-0.5 rounded-full" />
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="flex items-center gap-3 p-2 mt-2 border-y border-y-zinc-200 dark:border-y-zinc-800">
        <div className="flex items-center gap-2">
          <Heart filled={false} />
          <Skeleton className="w-8 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <CommentBubble />
          <Skeleton className="w-8 h-4" />
        </div>
      </div>
      <Skeleton className="mt-8 h-96" />
      <Skeleton className="h-6 mt-8" />
      <Skeleton className="h-6 mt-2" />
      <Skeleton className="h-6 w-1/2 mt-2" />
      <Skeleton className="h-6 mt-4" />
      <Skeleton className="h-6 mt-2" />
      <Skeleton className="h-6 w-3/4 mt-2" />
    </div>
  )
}
