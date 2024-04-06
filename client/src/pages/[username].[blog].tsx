import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_URL } from "@/config"
import {
  likesAndCommentsCountFormatter,
  publicDateFormatter,
} from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "react-router-dom"
import Markdown from "react-markdown"
import { CommentBubble, Heart } from "@/lib/icons"

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
      return (await axios.get(`${API_URL}/blogs/${username}/${title}`)).data
    },
  })
}

export function BlogPage() {
  const { username, title } = useParams() as any

  const blogQuery = useBlogQuery({ username, title })

  if (blogQuery.isLoading || !blogQuery.data) {
    return <div className="pt-20">Loading</div>
  }

  return (
    <div className="pt-24 w-11/12 sm:w-3/4 lg:w-1/2 mx-auto">
      <h1 className="text-5xl font-bold">{blogQuery.data.title}</h1>
      <h2 className="text-zinc-400 text-xl pt-2">
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
      <div className="flex items-center gap-3 p-2 mt-2 border-y border-y-zinc-200 dark:border-y-zinc-800">
        <div className="flex items-center gap-2">
          <Heart className="size-6" />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(blogQuery.data.likes)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CommentBubble />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(blogQuery.data.comments)}
          </span>
        </div>
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
