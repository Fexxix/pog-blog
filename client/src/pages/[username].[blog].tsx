import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_URL } from "@/config"
import {
  cn,
  likesAndCommentsCountFormatter,
  publicDateFormatter,
} from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useParams } from "react-router-dom"
import Markdown from "react-markdown"
import { CommentBubble, Heart } from "@/lib/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

type Blog = {
  id: string
  title: string
  content: string
  description: string
  datePublished: string
  likes: number
  comments: number
  author: {
    username: string
    profilePicture: string
  }
  image: string
  hasLiked: boolean
}

function useBlogQuery({
  username,
  title,
}: {
  username: string
  title: string
}) {
  return useQuery<Blog>({
    queryKey: [username, title],
    queryFn: async () => {
      return (
        await axios.get(`${API_URL}/blogs/${username}/${title}`, {
          withCredentials: true,
        })
      ).data
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

export function BlogPage() {
  const { username, title } = useParams() as any

  const blogQuery = useBlogQuery({ username, title })

  if (blogQuery.isLoading || !blogQuery.data) {
    return <PageSkeleton />
  }

  return (
    <div className="pt-24 w-11/12 sm:w-3/4 lg:w-1/2 mx-auto">
      <h1 className="text-5xl font-bold">{blogQuery.data.title}</h1>
      <h2 className="text-zinc-400 text-lg md:text-xl pt-4">
        {blogQuery.data.description}
      </h2>
      <div className="flex items-center gap-3 mt-4 py-2">
        <Avatar>
          <AvatarImage
            className="bg-zinc-200 dark:bg-zinc-800"
            src={blogQuery.data.author.profilePicture}
          />
          <AvatarFallback>{blogQuery.data.author.username}</AvatarFallback>
        </Avatar>
        <span>{blogQuery.data.author.username}</span>
        <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
        <span className="text-xs sm:text-sm">
          {publicDateFormatter.format(new Date(blogQuery.data.datePublished))}
        </span>
      </div>
      <div className="flex items-center gap-3 px-2 mt-2 border-y border-y-zinc-200 dark:border-y-zinc-800">
        <div className="flex items-center gap-2">
          <Likes
            likes={blogQuery.data.likes}
            blogId={blogQuery.data.id}
            alreadyLiked={blogQuery.data.hasLiked}
          />
        </div>
        <Button
          variant="icon"
          className="flex items-center gap-2 text-zinc-400 hover:text-current transition-colors p-0"
        >
          <CommentBubble />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(blogQuery.data.comments)}
          </span>
        </Button>
      </div>
      <div className="flex justify-center items-center mt-8">
        <img
          src={blogQuery.data.image}
          alt={`thumbnail for ${blogQuery.data.title}`}
          className="object-cover"
        />
      </div>
      <Markdown className="prose prose-neutral prose-pre:bg-zinc-100 prose-pre:text-black dark:prose-pre:text-current dark:prose-pre:bg-zinc-800 dark:prose-invert mt-8">
        {blogQuery.data.content}
      </Markdown>
    </div>
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

function Likes({
  likes,
  blogId,
  alreadyLiked,
}: {
  likes: number
  blogId: string
  alreadyLiked: boolean
}) {
  const [hasLiked, setHasLiked] = useState(alreadyLiked)

  const likeMutation = useMutation<{ likes: number }, AxiosError | Error>({
    mutationKey: ["like", blogId],
    mutationFn: async () => {
      return (
        await axios.post(
          `${API_URL}/blogs/like/${blogId}`,
          {},
          { withCredentials: true }
        )
      ).data
    },
    onSuccess: () => {
      setHasLiked(true)
    },
    onError: (e) => {
      const errorMsg =
        e instanceof AxiosError ? (e.response?.data as any).message : e.message

      toast.error(errorMsg)
      setHasLiked(false)
    },
  })

  const likesToShow = (() => {
    if (likeMutation.isPending) return likes + 1
    if (likeMutation.isSuccess) return likeMutation.data.likes
    if (likeMutation.isError) return likes
    return likes
  })()

  return (
    <>
      <Button
        variant="icon"
        onClick={() => {
          if (hasLiked) {
            return toast.error("You already liked this blog!")
          }
          likeMutation.mutate()
        }}
        disabled={likeMutation.isPending}
        className={cn(
          "text-zinc-400 disabled:text-zinc-600 transition-colors p-0",
          {
            "text-red-500": hasLiked,
            "hover:text-current": !hasLiked,
          }
        )}
      >
        <Heart filled={hasLiked} />
      </Button>
      <Button
        variant="icon"
        disabled={likeMutation.isPending}
        className="text-zinc-400 hover:text-current disabled:text-zinc-600 transition-colors text-sm sm:text-base p-0"
      >
        {likesAndCommentsCountFormatter.format(likesToShow)}
      </Button>
    </>
  )
}
