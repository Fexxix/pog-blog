import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_URL } from "@/config"
import {
  cn,
  likesAndCommentsCountFormatter,
  publicDateFormatter,
} from "@/lib/utils"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useParams } from "react-router-dom"
import Markdown from "react-markdown"
import { CommentBubble, Heart } from "@/lib/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useAuthContext } from "@/contexts/AuthContextProvider"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"

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

type LikedByUsers = {
  username: string
  profilePicture: string
}

type LikedByUsersInfiniteList = {
  users: LikedByUsers[]
  hasMore: boolean
  nextPage: number | null
}

type Comment = {
  id: string
  content: string
  author: {
    username: string
    profilePicture: string
  }
  datePosted: string
}

type InfiniteCommentsList = {
  comments: Comment[]
  hasMore: boolean
  nextPage: number | null
}

const MAX_COMMENT_CHARACTERS = 1000

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
        <CommentsButton
          numberOfComments={blogQuery.data.comments}
          blogId={blogQuery.data.id}
        />
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
      <LikedByButton
        likeMutationIsPending={likeMutation.isPending}
        likesToShow={likesToShow}
        blogId={blogId}
      />
    </>
  )
}

function LikedByButton({
  likesToShow,
  likeMutationIsPending,
  blogId,
}: {
  likesToShow: number
  likeMutationIsPending: boolean
  blogId: string
}) {
  const [open, setOpen] = useState(false)
  const { title } = useParams()

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery<LikedByUsersInfiniteList>({
      queryKey: ["likedBy", blogId],
      queryFn: async ({ pageParam }) => {
        console.log(pageParam)
        return (
          await axios.get(
            `${API_URL}/blogs/likedBy/${blogId}?page=${pageParam}`
          )
        ).data
      },
      initialPageParam: 1,
      enabled: open,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      refetchOnWindowFocus: false,
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="icon"
          disabled={likeMutationIsPending}
          className="text-zinc-400 hover:text-current disabled:text-zinc-600 transition-colors text-sm sm:text-base p-0"
        >
          {likesAndCommentsCountFormatter.format(likesToShow)}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-scroll h-96">
        <DialogHeader className="py-2 border-b border-b-zinc-200 dark:border-b-zinc-800">
          <DialogTitle>
            {likesToShow} people liked{" "}
            <span className="font-extrabold">&apos;{title}&apos;</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {data?.pages.map((page) =>
            page.users.map((user) => (
              <div key={user.username} className="flex gap-3 items-center">
                <Avatar className="size-8">
                  <AvatarImage
                    className="bg-zinc-200 dark:bg-zinc-800 rounded-full"
                    src={user.profilePicture}
                  />
                  <AvatarFallback>{user.username}</AvatarFallback>
                </Avatar>
                <div>{user.username}</div>
              </div>
            ))
          )}
        </div>
        {(isFetching || isLoading) && <LikedByUsersSkeleton />}
        {hasNextPage && (
          <Button
            disabled={isLoading || isFetching}
            onClick={() => fetchNextPage()}
          >
            Load More
          </Button>
        )}{" "}
      </DialogContent>
    </Dialog>
  )
}

function LikedByUsersSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-3">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-2 w-20" />
        </div>
      ))}
    </div>
  )
}

function CommentsButton({
  numberOfComments,
  blogId,
}: {
  numberOfComments: number
  blogId: string
}) {
  const { user } = useAuthContext()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ content: string }>({})
  const queryClient = useQueryClient()

  const commentsQuery = useInfiniteQuery<InfiniteCommentsList>({
    queryKey: ["comments", blogId],
    queryFn: async ({ pageParam }) => {
      return (
        await axios.get(`${API_URL}/blogs/comments/${blogId}?page=${pageParam}`)
      ).data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    enabled: open,
  })

  const commentsMutation = useMutation<
    any,
    AxiosError | Error,
    { content: string }
  >({
    mutationKey: ["comments", blogId],
    mutationFn: async ({ content }) => {
      return (
        await axios.post(
          `${API_URL}/blogs/comment/${blogId}`,
          { content },
          { withCredentials: true }
        )
      ).data
    },
    onMutate: () => {
      return toast.loading("Posting comment...")
    },
    onSuccess: (_, __, loadingToastId) => {
      queryClient.invalidateQueries({ queryKey: ["comments", blogId] })
      commentsQuery.refetch()

      toast.dismiss(loadingToastId as number)
      reset()
    },
  })

  const onSubmit = async ({ content }: { content: string }) => {
    if (!content) {
      return toast.error("Comment cannot be empty!")
    }

    if (content.length > MAX_COMMENT_CHARACTERS) {
      return toast.error("Comment too long. Max 1000 characters.")
    }

    await commentsMutation.mutateAsync({ content })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="icon"
          className="flex items-center gap-2 text-zinc-400 hover:text-current transition-colors p-0"
        >
          <CommentBubble />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(numberOfComments)}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-scroll w-full sm:w-[540px">
        <SheetHeader>
          <SheetTitle>Comments ({numberOfComments})</SheetTitle>
          {user && (
            <>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage
                      className="bg-zinc-200 dark:bg-zinc-800"
                      src={user.profilePicture}
                    />
                    <AvatarFallback>{user.username}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </div>
                <Input
                  {...register("content", {
                    disabled: commentsMutation.isPending,
                  })}
                  placeholder="What are your thoughts?"
                />
                <div className="flex justify-end items-center pt-2">
                  <Button
                    disabled={!commentsMutation.isPending}
                    type="button"
                    variant="secondary"
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button disabled={commentsMutation.isPending} type="submit">
                    Comment
                  </Button>
                </div>
              </form>
              <Separator />
            </>
          )}
          <div className="flex flex-col gap-3 pt-4">
            {commentsQuery.data?.pages.map((page, pageIndex) => (
              <>
                {page.comments.map((comment, pageCommentIndex) => (
                  <>
                    <div key={comment.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            className="bg-zinc-200 dark:bg-zinc-800"
                            src={comment.author.profilePicture}
                          />
                          <AvatarFallback>
                            {comment.author.username}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {comment.author.username}
                          </span>
                          <span className="text-xs">
                            {publicDateFormatter.format(
                              new Date(comment.datePosted)
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-left text-truncate">
                        {comment.content}
                      </p>
                    </div>
                    {pageCommentIndex !== page.comments.length - 1 && (
                      <Separator />
                    )}
                  </>
                ))}
                {pageIndex !== commentsQuery.data.pages.length - 1 && (
                  <Separator />
                )}
              </>
            ))}

            {(commentsQuery.isFetching || commentsQuery.isLoading) && (
              <>
                {commentsQuery.data && <Separator />}
                <CommentsSkeleton />
              </>
            )}
            {commentsQuery.hasNextPage && (
              <Button
                disabled={commentsQuery.isLoading || commentsQuery.isFetching}
                onClick={() => commentsQuery.fetchNextPage()}
              >
                Load More
              </Button>
            )}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

function CommentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 10 }, (_, i) => (
        <>
          <div key={i} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-2 w-20" />
            </div>
            <Skeleton className="h-5 w-full" />
          </div>
          {i !== 9 && <Separator />}
        </>
      ))}
    </div>
  )
}
