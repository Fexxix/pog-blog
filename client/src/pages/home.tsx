import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import InfiniteScroll from "react-infinite-scroll-component"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Blog, BlogCard, BlogSkeletonCard } from "@/components/BlogCard"
import { cn } from "@/lib/utils"

type InfiniteBlogList = {
  blogs: Blog[]
  hasMore: boolean
  nextPage: number
}

export function Home() {
  const { user } = useAuthContext()

  return !user ? (
    <div className="h-full w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="flex flex-col gap-3 justify-center items-center">
        <h1 className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
          Read Nigga, Read!
        </h1>
        <p className="text-lg p-2 sm:text-2xl font-medium text-center text-neutral-500 z-20">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/explore">
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
