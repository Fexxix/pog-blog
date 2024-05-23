import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import {
  Bold,
  BulletedList,
  CommentBubble,
  Heart,
  ImageAdd,
  ImageIcon,
  Italic,
  LinkIcon,
  LinkOff,
  OrderedList,
  Redo,
  UnderlineIcon,
  Undo,
  Strikethrough,
  OptionsIcon,
} from "@/lib/icons"
import { CATEGORIES, cn, publishedDateFormatter } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  useEditor,
  EditorContent,
  type Editor as EditorType,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { useCallback, useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createPortal } from "react-dom"
import { BookOpenCheck } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multiple-selector"

const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Write something...",
  }),
  Underline,
  Link,
  Image,
]

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

type Category = (typeof CATEGORIES)[number]

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
                image: blogImage?.src ?? "",
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

function Editor({
  setEditor,
  showToolbar,
}: {
  setEditor: (e: EditorType) => void
  showToolbar: Checked
}) {
  const editor = useEditor({
    extensions,
  })

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
  }, [editor])

  return (
    editor && (
      <>
        {showToolbar && <Toolbar editor={editor} />}
        <EditorContent
          className="min-h-screen pt-12 prose prose-neutral dark:prose-invert prose-h1:text-3xl sm:prose-sm md:prose-base lg:prose-lg prose-pre:bg-zinc-100 prose-pre:text-black dark:prose-pre:text-current dark:prose-pre:bg-zinc-800 [&>.tiptap:focus]:outline-none"
          editor={editor}
        />
      </>
    )
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

function Toolbar({ editor }: { editor: EditorType }) {
  return (
    <div className="sticky top-0 z-10 flex items-center divide-x-2 divide-zinc-400 dark:bg-zinc-900 mt-4 py-2 rounded overflow-auto">
      <div className="flex items-center gap-2 px-2">
        <Button
          onClick={() => editor.commands.undo()}
          disabled={!editor.can().undo()}
          className="p-0 h-0"
          variant="icon"
          aria-label="undo"
        >
          <Undo className="size-6" />
        </Button>
        <Button
          onClick={() => editor.commands.redo()}
          disabled={!editor.can().redo()}
          className="p-0 h-0"
          variant="icon"
          aria-label="redo"
        >
          <Redo className="size-6" />
        </Button>
      </div>
      <div className="flex items-center gap-2 px-2 h-8">
        <Button
          disabled={!editor.can().chain().focus().toggleBold().run()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("bold"),
          })}
          variant="icon"
          value="bold"
          aria-label="Toggle bold"
        >
          <Bold />
        </Button>
        <Button
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("italic"),
          })}
          variant="icon"
          value="italic"
          aria-label="Toggle italic"
        >
          <Italic />
        </Button>
        <Button
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("underline"),
          })}
          variant="icon"
          value="underline"
          aria-label="Toggle underline"
        >
          <UnderlineIcon />
        </Button>
        <Button
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("strike"),
          })}
          variant="icon"
          value="strikethrough"
          aria-label="Toggle strikethrough"
        >
          <Strikethrough />
        </Button>
      </div>
      <div className="flex items-center gap-2 px-2 h-8">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("bulletList"),
          })}
          variant="icon"
          value="bulleted-list"
          aria-label="Toggle bulleted list"
        >
          <BulletedList />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("orderedList"),
          })}
          variant="icon"
          value="ordered-list"
          aria-label="Toggle ordered list"
        >
          <OrderedList />
        </Button>
      </div>
      <div className="flex items-center gap-2 px-2 h-8">
        <BlockTypeSelect editor={editor} />
      </div>
      <div className="flex items-center gap-2 px-2 h-8">
        <AddLinkButton editor={editor} />
        <AddImageButton editor={editor} />
        {editor.isActive("link") && (
          <Button
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2"
            variant="icon"
            aria-label="unset link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <LinkOff className="size-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

function BlockTypeSelect({ editor }: { editor: EditorType }) {
  return (
    <Select
      value={getCurrentBlockTypeDisplayValue(editor)}
      onValueChange={(value) => handleBlockTypeChange(value, editor)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Block type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paragraph">Paragraph</SelectItem>
        <SelectItem value="blockquote">Quote</SelectItem>
        <SelectItem value="code">Code</SelectItem>
        <SelectItem value="heading-1">Heading 1</SelectItem>
        <SelectItem value="heading-2">Heading 2</SelectItem>
        <SelectItem value="heading-3">Heading 3</SelectItem>
        <SelectItem value="heading-4">Heading 4</SelectItem>
        <SelectItem value="heading-5">Heading 5</SelectItem>
        <SelectItem value="heading-6">Heading 6</SelectItem>
      </SelectContent>
    </Select>
  )
}

function CategoriesSelect({
  categories,
  setCategories,
}: {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}) {
  return (
    <div className="pt-4">
      <MultiSelector
        values={categories}
        onValuesChange={setCategories as any}
        loop
      >
        <MultiSelectorTrigger>
          <MultiSelectorInput placeholder="Select categories..." />
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList>
            {CATEGORIES.map((category) => (
              <MultiSelectorItem value={category} key={category}>
                {category}
              </MultiSelectorItem>
            ))}
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelector>
    </div>
  )
}

function handleBlockTypeChange(value: string, editor: EditorType) {
  switch (value) {
    case "paragraph":
      editor.commands.setParagraph()
      break
    case "heading-1":
      editor.commands.toggleHeading({ level: 1 })
      break
    case "heading-2":
      editor.commands.toggleHeading({ level: 2 })
      break
    case "heading-3":
      editor.commands.toggleHeading({ level: 3 })
      break
    case "heading-4":
      editor.commands.toggleHeading({ level: 4 })
      break
    case "heading-5":
      editor.commands.toggleHeading({ level: 5 })
      break
    case "heading-6":
      editor.commands.toggleHeading({ level: 6 })
      break
    case "blockquote":
      editor.commands.toggleBlockquote()
      break
    case "code":
      editor.commands.toggleCodeBlock()
      break
    default:
      break
  }
}

function getCurrentBlockTypeDisplayValue(editor: EditorType) {
  switch (true) {
    case editor.isActive("paragraph"):
      return "paragraph"
    case editor.isActive("heading", { level: 1 }):
      return "heading-1"
    case editor.isActive("heading", { level: 2 }):
      return "heading-2"
    case editor.isActive("heading", { level: 3 }):
      return "heading-3"
    case editor.isActive("heading", { level: 4 }):
      return "heading-4"
    case editor.isActive("heading", { level: 5 }):
      return "heading-5"
    case editor.isActive("heading", { level: 6 }):
      return "heading-6"
    case editor.isActive("blockquote"):
      return "blockquote"
    case editor.isActive("code"):
      return "code"
    default:
      return ""
  }
}

function AddLinkButton({ editor }: { editor: EditorType }) {
  const [open, setOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const setLink = useCallback(() => {
    // cancelled
    if (linkUrl === null) {
      return
    }

    // empty
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()

      return
    }

    // update link
    editor.commands.setLink({ href: linkUrl, target: "_blank" })
  }, [editor])

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("link"),
          })}
          variant="icon"
          aria-label="insert link"
        >
          <LinkIcon className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogDescription>
            Add a link to the current selection
          </DialogDescription>
        </DialogHeader>
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setLink()
              setOpen(false)
            }
          }}
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Paste or type a link"
        />
        <DialogFooter>
          <Button
            onClick={() => {
              setLink()
              setOpen(false)
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddImageButton({ editor }: { editor: EditorType }) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, title }).run()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2", {
            "bg-zinc-100 dark:bg-zinc-800": editor.isActive("image"),
          })}
          variant="icon"
          aria-label="insert image"
        >
          <ImageAdd className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an Image</DialogTitle>
          <DialogDescription>
            Add an image to the current selection
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
          to host your images.
        </span>
        <DialogFooter>
          <Button onClick={addImage}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BlogImage({
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
