import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Category, debounce } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { BlogCard, BlogSkeletonCard } from "@/components/BlogCard"
import { CategoriesSelect } from "@/components/CategoriesSelect"

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
  categories: Category[]
}

type InfiniteBlogList = {
  results: Blog[]
  hasMore: boolean
  nextPage: number
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "")

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
            Array.from({ length: 10 }, (_, i) => (
              <BlogSkeletonCard key={i} fullWitdth />
            ))}
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
