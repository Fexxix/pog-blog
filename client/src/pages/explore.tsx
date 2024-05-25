import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import InfiniteScroll from "react-infinite-scroll-component"
import { cn } from "@/lib/utils"
import { Blog, BlogSkeletonCard } from "@/components/BlogCard"
import { BlogCard } from "@/components/BlogCard"

type InfiniteBlogList = {
  blogs: Blog[]
  hasMore: boolean
  nextPage: number
}

export function ExplorePage() {
  const { data, error, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery<InfiniteBlogList, AxiosError>({
      queryKey: ["blogs"],
      queryFn: async ({ pageParam }) =>
        (
          await axios.get(`/api/blogs?page=${pageParam}`, {
            withCredentials: true,
          })
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
      <InfiniteScroll
        dataLength={(data && data.pages.length) ?? 0}
        hasMore={hasNextPage}
        next={fetchNextPage}
        loader={!error && <InfiniteBlogsSkeleton />}
        className="flex flex-col items-center"
        children={
          <div className="flex flex-col justify-center gap-5 max-w-full w-4/5 pt-20 size-full">
            {data &&
              data.pages.map((page) =>
                page.blogs.map((blog) => (
                  <BlogCard blogData={blog} key={blog.id} />
                ))
              )}
          </div>
        }
      />
      {error && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="text-2xl font-bold">An Error occured</div>
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
      {Array.from({ length: 10 }, (_, i) => (
        <BlogSkeletonCard key={i} />
      ))}
    </div>
  )
}
