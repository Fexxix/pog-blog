import { useState, useEffect, useCallback } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  CATEGORIES,
  cn,
  debounce,
  likesAndCommentsCountFormatter,
  publishedDateFormatter,
} from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multiple-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { Heart } from "@/lib/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type Category = (typeof CATEGORIES)[number]

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
  results: Blog[]
  hasMore: boolean
  nextPage: number
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState("")

  const [isTyping, setIsTyping] = useState(false)

  const [q, setQ] = useState(searchParams.get("q") || "")
  const [categories, setCategories] = useState<Category[]>(
    (searchParams.get("categories")
      ? searchParams.get("categories")!.split(",")
      : []) as Category[]
  )
  const [type, setType] = useState<"most_relevant" | "newest" | "oldest">(
    (searchParams.get("type") as any) || "most_relevant"
  )

  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setQ(value)
      setIsTyping(false)
    }, 500),
    []
  )

  const handleInputChange = (value: string) => {
    setIsTyping(true)
    setInputValue(value)
    debouncedSetSearchQuery(value)
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
  } = useInfiniteQuery<InfiniteBlogList, AxiosError>({
    queryKey: ["search", q, categories, type],
    queryFn: async ({ pageParam }) => {
      return (
        await axios.get(
          `/api/blogs/search?q=${q}&type=${type}&categories=${categories.join(
            ","
          )}&page=${pageParam}`
        )
      ).data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: !!q || categories.length > 0,
  })

  useEffect(() => {
    const params: Record<string, any> = {}
    if (q) params.q = q
    if (categories.length > 0) params.categories = categories.join(",")
    if (type) params.type = type

    setSearchParams(params)

    if (!q && categories.length) {
      setType("newest")
    }
  }, [q, categories, type, setSearchParams])

  return (
    <div className="pt-20 w-3/4 mx-auto">
      <Input
        placeholder="Search a title"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <CategoriesSelect categories={categories} setCategories={setCategories} />
      <Tabs defaultValue={type} className="flex flex-col items-center gap-3">
        <TabsList className="w-full">
          <TabsTrigger
            disabled={!q && categories.length > 1}
            value="most_relevant"
            className="w-1/2"
            onClick={() => setType("most_relevant")}
          >
            Most Relevant
          </TabsTrigger>
          <TabsTrigger
            value="newest"
            className="w-1/2"
            onClick={() => setType("newest")}
          >
            Newest
          </TabsTrigger>
          <TabsTrigger
            value="oldest"
            className="w-1/2"
            onClick={() => setType("oldest")}
          >
            Oldest
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value={type}
          className="w-full flex flex-col justify-center gap-5"
        >
          {data?.pages
            .flatMap((page) => page.results)
            .map((blog) => (
              <BlogCard blogData={blog} key={blog.id} />
            ))}
          {(isLoading || isFetching) &&
            Array.from({ length: 10 }, (_, i) => <BlogSkeletonCard key={i} />)}
          {isError && (
            <div className="w-full flex flex-col items-center justify-center">
              <p className="text-red-500">Something went wrong</p>
              <p>{(error.response?.data as any)?.message || error.message}</p>
            </div>
          )}
          {!isLoading &&
            (!data ||
              data?.pages.length === 0 ||
              data.pages[0].results.length === 0) &&
            !!inputValue &&
            !isTyping &&
            !isError && <p className="w-full text-center">No results found</p>}
          {hasNextPage && (
            <Button onClick={() => fetchNextPage()} disabled={isFetching}>
              Show more results
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
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
    <Card>
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
