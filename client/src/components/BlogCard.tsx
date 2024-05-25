import { Heart } from "@/lib/icons"
import {
  publishedDateFormatter,
  cn,
  likesAndCommentsCountFormatter,
  type Category,
} from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export type Blog = {
  id: string
  title: string
  description?: string
  image?: string
  likes: number
  author: {
    username: string
    profilePicture: string
  }
  datePublished: string
  hasLiked: boolean
  categories: Category[]
}

export function BlogCard({ blogData }: { blogData: Blog }) {
  return (
    <Link
      to={`/${encodeURIComponent(
        blogData.author.username
      )}/${encodeURIComponent(blogData.title)}`}
      className="contents"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 pb-2">
            <Avatar className="size-8">
              <AvatarImage
                className="bg-zinc-200 dark:bg-zinc-800 size-full rounded-full"
                src={blogData.author.profilePicture}
              />
              <AvatarFallback>{blogData.author.username}</AvatarFallback>
            </Avatar>
            <span className="text-sm sm:text-base">
              {blogData.author.username}
            </span>
            <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
            <span className="text-xs sm:text-sm">
              {publishedDateFormatter.format(new Date(blogData.datePublished))}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex justify-between gap-2">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-xl tracking-normal md:text-2xl md:tracking-tight">
              {blogData.title}
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {blogData.description}
            </CardDescription>
          </div>
          <img
            src={blogData.image}
            className="size-full sm:size-40 object-cover"
            alt={`thumbnail for ${blogData.title}`}
          />
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 overflow-y-auto">
          <div className="flex items-center gap-2 w-full overflow-y-auto">
            {blogData.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-1 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 rounded"
              >
                {category}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Heart
              filled={blogData.hasLiked}
              className={cn({ "text-red-500": blogData.hasLiked })}
            />
            <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
            <span className="text-sm sm:text-base">
              {likesAndCommentsCountFormatter.format(blogData.likes)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function BlogSkeletonCard({
  fullWitdth = false,
}: {
  fullWitdth?: boolean
}) {
  return (
    <Card className={cn({ "w-full": fullWitdth, "w-4/5": !fullWitdth })}>
      <CardHeader>
        <div className="flex items-center gap-2 pb-2">
          <Skeleton className="size-8 rounded-full aspect-square" />
          <Skeleton className="size-0.5 rounded-full mt-0.5" />
          <Skeleton className="h-2 w-52" />
        </div>
      </CardHeader>
      <CardContent className="flex justify-between gap-2">
        <div className="flex flex-col gap-3 w-4/5">
          <CardTitle>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2 md:h-5 md:w-[26rem]" />
              <Skeleton className="h-2 w-1/2 md:hidden" />
            </div>
          </CardTitle>
          <Skeleton className="hidden sm:block h-4 w-full" />
          <Skeleton className="hidden sm:block h-4 w-full" />
          <Skeleton className="hidden sm:block h-4 w-1/2" />
        </div>
        <Skeleton className="size-20 md:size-40 aspect-square" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-0.5 rounded-full mt-0.5" />
        <Skeleton className="h-2 w-10" />
      </CardFooter>
    </Card>
  )
}
