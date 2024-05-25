import {
  BulletedList,
  OrderedList,
  LinkOff,
  ImageAdd,
  Redo,
  Undo,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  LinkIcon,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select"
import { useEditor, EditorContent, Editor as EditorType } from "@tiptap/react"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checked } from "@/components/ui/dropdown-menu"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

export type { EditorType }

const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Write something...",
  }),
  Underline,
  Link,
  Image,
]

export function Editor({
  setEditor,
  showToolbar,
  initialContent,
}: {
  setEditor: (e: EditorType) => void
  showToolbar: Checked
  initialContent?: string
}) {
  const editor = useEditor({
    extensions,
    content: initialContent ?? "",
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
