import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import {
  publishedDateFormatter,
  cn,
  likesAndCommentsCountFormatter,
  CATEGORIES,
} from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Heart } from "@/lib/icons"
import InfiniteScroll from "react-infinite-scroll-component"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Blog = {
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
  categories: (typeof CATEGORIES)[number][]
}

type InfiniteBlogList = {
  blogs: Blog[]
  hasMore: boolean
  nextPage: number
}

export default function Home() {
  const { user } = useAuthContext()

  return !user ? (
    <div className="h-full w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="flex flex-col gap-3 justify-center items-center">
        <h1 className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
          Pog Blog
        </h1>
        <p className="text-lg p-2 sm:text-2xl font-medium text-center text-neutral-500 z-20">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/blogs">
            <Button className="text-md" size="lg">
              Explore
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="text-md" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <Feed />
  )
}

function Feed() {
  const [feedType, setFeedType] = useState<"for_you" | "following">("for_you")

  const { data, error, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery<InfiniteBlogList, AxiosError>({
      queryKey: ["feed", feedType],
      queryFn: async ({ pageParam }) =>
        (
          await axios.get(
            `/api/blogs/feed?feedType=${feedType}&page=${pageParam}`,
            {
              withCredentials: true,
            }
          )
        ).data,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    })

  if (isLoading && !isError) {
    return <InfiniteBlogsSkeleton isInitialLoad />
  }

  return (
    <>
      <Tabs
        defaultValue={feedType}
        className="flex flex-col items-center gap-3 pt-20"
      >
        <TabsList className="w-4/5">
          <TabsTrigger
            value="for_you"
            className="w-1/2"
            onClick={() => setFeedType("for_you")}
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="w-1/2"
            onClick={() => setFeedType("following")}
          >
            Following
          </TabsTrigger>
        </TabsList>
        <TabsContent value={feedType} className="w-full">
          <InfiniteScroll
            dataLength={(data && data.pages.length) ?? 0}
            hasMore={hasNextPage}
            next={fetchNextPage}
            loader={!error && <InfiniteBlogsSkeleton />}
            className="flex flex-col items-center"
            children={
              <div className="flex flex-col justify-center gap-5 max-w-full w-4/5 size-full">
                {data &&
                  data.pages.map((page) =>
                    page.blogs.map((blog) => (
                      <BlogCard blogData={blog} key={blog.id} />
                    ))
                  )}
              </div>
            }
          />
        </TabsContent>
      </Tabs>
      {error && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="text-2xl font-bold">An Error occurred</div>
          <div>
            {(() => {
              if (
                error.response?.data &&
                typeof error.response.data === "object" &&
                "message" in error.response.data
              ) {
                return error.response?.data.message as string
              } else {
                return error.message
              }
            })()}
          </div>
        </div>
      )}
    </>
  )
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

function BlogSkeletonCard() {
  return (
    <Card className="w-4/5">
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

function InfiniteBlogsSkeleton({ isInitialLoad }: { isInitialLoad?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col w-full h-fit items-center justify-center gap-5 pt-20",
        {
          "pt-5": !isInitialLoad,
        }
      )}
    >
      {isInitialLoad && (
        <Skeleton className="h-10 w-4/5 bg-zinc-200 dark:bg-zinc-800" />
      )}
      {Array.from({ length: 10 }, (_, i) => (
        <BlogSkeletonCard key={i} />
      ))}
    </div>
  )
}
