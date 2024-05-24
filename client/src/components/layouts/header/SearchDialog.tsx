import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { CommandLoading } from "cmdk"
import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { debounce, publishedDateFormatter } from "@/lib/utils"
import { Link, useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

type Result = {
  id: string
  title: string
  description: string
  datePublished: string
  image: string
  author: {
    username: string
    profilePicture: string
  }
}

type InfiniteResultsList = {
  results: Result[]
  hasMore: boolean
  nextPage: number
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()

  const {
    data,
    isError,
    isLoading,
    hasNextPage,
    isFetching,
    fetchNextPage,
    error,
  } = useInfiniteQuery<InfiniteResultsList, AxiosError>({
    queryKey: ["search", searchQuery],
    queryFn: async ({ pageParam }) => {
      return (
        await axios.get(
          `/api/blogs/search?q=${searchQuery}&type=most_relevant&page=${pageParam}`
        )
      ).data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: !!searchQuery,
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && open) {
        e.preventDefault()
        navigate(`/search?q=${inputValue}`)
        setOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value)
      setIsTyping(false)
    }, 500),
    []
  )

  const handleInputChange = (value: string) => {
    setIsTyping(true)
    setInputValue(value)
    debouncedSetSearchQuery(value)
  }

  if (error) {
    const msg = (error.response?.data as any)?.message ?? error.message

    toast.error(msg, {
      duration: undefined,
      closeButton: true,
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-0 py-4 px-2 w-40 justify-between"
        variant="outline"
      >
        <div className="flex gap-2 items-center">
          <Search className="size-4" />
          <span className="sr-only sm:not-sr-only text-zinc-500 dark:text-zinc-400">
            Search...
          </span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-input-wrapper]]:border-b-0"
        >
          <CommandInput
            value={inputValue}
            onValueChange={handleInputChange}
            placeholder="Type a title to search..."
          />
          <CommandList>
            {data?.pages
              .flatMap((page) => page.results)
              .map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  className="cursor-pointer"
                  onSelect={() => {
                    setOpen(false)
                    navigate(
                      `/${encodeURIComponent(
                        result.author.username
                      )}/${encodeURIComponent(result.title)}`
                    )
                  }}
                >
                  <Link
                    to={`/${encodeURIComponent(
                      result.author.username
                    )}/${encodeURIComponent(result.title)}`}
                    className="contents"
                  >
                    <div className="flex gap-3 items-center">
                      <img className="size-8 object-cover" src={result.image} />
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          @{result.author.username}
                        </span>
                        <div>{result.title}</div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {publishedDateFormatter.format(
                            new Date(result.datePublished)
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                </CommandItem>
              ))}
            {(isLoading || isFetching) && !isError && (
              <CommandLoading className="px-4 py-2 flex flex-col">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="py-2">
                    <ResultSkeleton />
                  </div>
                ))}
              </CommandLoading>
            )}
            {!isLoading &&
              (!data ||
                data?.pages.length === 0 ||
                data.pages[0].results.length === 0) &&
              !!inputValue &&
              !isTyping &&
              !isError && <CommandEmpty>No results found.</CommandEmpty>}
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <Button
                  disabled={isFetching || isLoading}
                  className="h-8"
                  onClick={() => fetchNextPage()}
                >
                  {isFetching ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </CommandList>
          <CommandSeparator />
          <div className="flex justify-center items-center gap-2 py-2 border-t">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-lg">⌘</span>
              <span className="text-xs"> + Enter</span>
            </kbd>
            <span className="text-sm flex gap-1">
              for
              <Link
                to={`/search?q=${inputValue}`}
                onClick={() => setOpen(false)}
                className="underline"
              >
                advanced search page
              </Link>
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  )
}

function ResultSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-8" />
      <div className="flex flex-col w-full gap-1.5">
        <Skeleton className="h-2 w-10" />
        <Skeleton className="h-3 max-w-96" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  )
}
