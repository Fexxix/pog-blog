import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_URL } from "@/config"
import {
  likesAndCommentsCountFormatter,
  publicDateFormatter,
} from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "react-router-dom"
import { CiHeart } from "react-icons/ci"
import Markdown from "react-markdown"

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
          <CiHeart className="size-6" />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(blogQuery.data.likes)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            data-slot="icon"
            aria-hidden="true"
            fill="none"
            strokeWidth="1.1"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 -scale-x-[1]"
          >
            <path
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
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
