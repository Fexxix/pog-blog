import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Minus, Plus } from "@/lib/icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  publicDateFormatter,
  cn,
  likesAndCommentsCountFormatter,
} from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { lazy, Suspense, useState } from "react"
import { NotFound } from "@/components/NotFound"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import InfiniteScroll from "react-infinite-scroll-component"

type UserProfile = {
  username: string
  biography: string
  profilePicture: string
  id: string
  followers: number
  following: number
  isProfileOwner: boolean
  isFollowing: boolean
  blogsCount: number
}

type Blog = {
  id: string
  title: string
  description?: string
  image?: string
  likes: number
  datePublished: string
  hasLiked: boolean
}

type InfiniteBlogList = {
  blogs: Blog[]
  hasMore: boolean
  nextPage: number
}

const ChangeProfileInfoForm = lazy(() => import("./ChangeProfileInfoForm"))

function useProfileQuery() {
  const { pathname } = useLocation()

  return useQuery<UserProfile, AxiosError | Error>({
    queryKey: ["profile", pathname],
    queryFn: async () => {
      return (await axios.get(`/api/users/${pathname.slice(1)}`)).data
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function ProfilePage() {
  const profileQuery = useProfileQuery()

  if (
    profileQuery.isError &&
    profileQuery.error instanceof AxiosError &&
    profileQuery.error.response?.status === 404
  )
    return <NotFound />

  return (
    <div className="pt-36 relative h-full">
      <Profile profileQuery={profileQuery} />
      {profileQuery.data && (
        <Blogs
          author={{
            username: profileQuery.data.username,
            profilePicture: profileQuery.data.profilePicture,
            id: profileQuery.data.id,
          }}
        />
      )}
    </div>
  )
}

function Profile({
  profileQuery,
}: {
  profileQuery: ReturnType<typeof useProfileQuery>
}) {
  const [isFollowing, setIsFollowing] = useState(
    profileQuery.data?.isFollowing ?? false
  )
  const followMutation = useFollowMutation(setIsFollowing)
  const unfollowMutation = useUnfollowMutation(setIsFollowing)

  if (!profileQuery.data || profileQuery.isLoading) return <ProfileSkeleton />

  return (
    <div className="flex flex-col items-center justify-center gap-10 absolute w-full sm:w-4/5 left-1/2 -translate-x-1/2 h-96 bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-md shadow-md">
      {!profileQuery.data.isProfileOwner ? (
        <>
          <Avatar className="size-40 absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 border-8 bg-zinc-200 dark:bg-zinc-800 border-white dark:border-black">
            <AvatarImage src={profileQuery.data.profilePicture} />
            <AvatarFallback>{profileQuery.data.username}</AvatarFallback>
          </Avatar>
          {!isFollowing ? (
            <Button
              className="absolute gap-2 top-3 right-3"
              variant="secondary"
              onClick={() =>
                followMutation.mutate({ id: profileQuery.data.id })
              }
              disabled={followMutation.isPending}
            >
              <Plus className="size-5" />
              Follow
            </Button>
          ) : (
            <Button
              className="absolute gap-2 top-3 right-3"
              variant="secondary"
              onClick={() =>
                unfollowMutation.mutate({ id: profileQuery.data.id })
              }
              disabled={unfollowMutation.isPending}
            >
              <Minus className="size-5" />
              Unfollow
            </Button>
          )}
          <div className="flex flex-col items-center">
            <h1 className="pt-8 text-3xl font-bold text-center">
              {profileQuery.data.username}
            </h1>
            <p className="pt-4 px-4 text-center text-sm sm:text-base min-w-fit">
              {profileQuery.data.biography}
            </p>
          </div>
        </>
      ) : (
        <Suspense>
          <ChangeProfileInfoForm
            initialProfilePicture={profileQuery.data.profilePicture}
            initialUsername={profileQuery.data.username}
            initialBiography={profileQuery.data.biography}
            id={profileQuery.data.id}
          />
        </Suspense>
      )}
      <div className="flex justify-center items-center divide-x-2 divide-black dark:divide-zinc-800">
        <div className="px-10 flex flex-col gap-3 items-center justify-center h-full">
          <h3 className="text-5xl font-bold">{profileQuery.data.blogsCount}</h3>
          <span className="text-xl font-semibold">
            Blog{profileQuery.data.blogsCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="px-10 flex flex-col gap-3 items-center justify-center h-full">
          <h3 className="text-5xl font-bold">{profileQuery.data.followers}</h3>
          <span className="text-xl font-semibold">Followers</span>
        </div>
        <div className="px-10 flex flex-col gap-3 items-center justify-center h-full">
          <h3 className="text-5xl font-bold">{profileQuery.data.following}</h3>
          <span className="text-xl font-semibold">Following</span>
        </div>
      </div>
    </div>
  )
}

function Blogs({
  author,
}: {
  author: { username: string; profilePicture: string; id: string }
}) {
  const { data, error, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteQuery<InfiniteBlogList, AxiosError>({
      queryKey: ["blogs", author.id],
      queryFn: async ({ pageParam }) =>
        (
          await axios.get(`/api/users/${author.id}/blogs?page=${pageParam}`, {
            withCredentials: true,
          })
        ).data,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    })

  if (!data || isLoading) {
    return (
      <div className="pt-[400px]">
        <InfiniteBlogsSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center gap-5 pb-10 pt-[400px]">
      <InfiniteScroll
        dataLength={data.pages.length}
        hasMore={hasNextPage}
        next={fetchNextPage}
        loader={!error && <InfiniteBlogsSkeleton />}
        className="flex flex-col items-center"
        children={
          <div className="flex flex-col justify-center gap-5 max-w-full w-4/5 size-full">
            {data.pages.map((page) =>
              page.blogs.map((blog) => (
                <BlogCard blogData={blog} author={author} key={blog.id} />
              ))
            )}
          </div>
        }
      />
    </div>
  )
}

function BlogCard({
  blogData,
  author,
}: {
  blogData: Blog
  author: { username: string; profilePicture: string; id: string }
}) {
  return (
    <Link
      to={`/${author.username}/${blogData.title}`.replace(/ /g, "%20")}
      className="contents"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 pb-2">
            <Avatar className="size-8">
              <AvatarImage
                className="bg-zinc-200 dark:bg-zinc-800 size-full rounded-full"
                src={author.profilePicture}
              />
              <AvatarFallback>{author.username}</AvatarFallback>
            </Avatar>
            <span className="text-sm sm:text-base">{author.username}</span>
            <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
            <span className="text-xs sm:text-sm">
              {publicDateFormatter.format(new Date(blogData.datePublished))}
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
        <CardFooter className="gap-2">
          <Heart
            filled={blogData.hasLiked}
            className={cn({ "text-red-500": blogData.hasLiked })}
          />
          <div className="size-0.5 bg-black dark:bg-white rounded-full mt-0.5" />
          <span className="text-sm sm:text-base">
            {likesAndCommentsCountFormatter.format(blogData.likes)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

function ProfileSkeleton() {
  return (
    <>
      <div className="absolute w-full sm:w-4/5 left-1/2 -translate-x-1/2 h-96 bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-md shadow-md">
        <div className="size-40 rounded-full absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 bg-whoite dark:bg-black">
          <Skeleton className="size-40 rounded-full absolute border-8 border-white dark:border-black" />
        </div>
        <div className="pt-24 flex flex-col gap-4 justify-center items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-2/4" />
        </div>
        <div className="pt-16 flex justify-center items-center gap-4">
          <div className="size-28">
            <Skeleton className="size-full" />
          </div>
          <div className="h-28 w-px bg-dark dark:bg-zinc-800"></div>
          <div className="size-28">
            <Skeleton className="size-full" />
          </div>
          <div className="h-28 w-px bg-dark dark:bg-zinc-800"></div>
          <div className="size-28">
            <Skeleton className="size-full" />
          </div>
        </div>
      </div>
    </>
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

function InfiniteBlogsSkeleton() {
  return (
    <div className="flex flex-col w-full h-fit items-center justify-center gap-5">
      {Array.from({ length: 10 }, (_, i) => (
        <BlogSkeletonCard key={i} />
      ))}
    </div>
  )
}

function useFollowMutation(setIsFollowing: (value: boolean) => void) {
  const { pathname } = useLocation()

  return useMutation<void, AxiosError | Error, { id: string }>({
    mutationKey: ["follow", pathname],
    mutationFn: async ({ id }) => {
      await axios.post(`/api/users/follow/${id}`)
    },
    onMutate: () => {
      toast.loading("Following...")
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success("Followed successfully")
      setIsFollowing(true)
    },
    onError: (error) => {
      const msg =
        error instanceof AxiosError
          ? error.response?.data.message
          : "Failed to follow"

      toast.dismiss()
      toast.error(msg)
    },
  })
}

function useUnfollowMutation(setIsFollowing: (value: boolean) => void) {
  const { pathname } = useLocation()

  return useMutation<void, AxiosError, { id: string }>({
    mutationKey: ["unfollow", pathname],
    mutationFn: async ({ id }) => {
      await axios.delete(`/api/users/unfollow/${id}`)
    },
    onMutate: () => {
      toast.loading("Unfollowing...")
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success("Unfollowed successfully")
      setIsFollowing(false)
    },
    onError: (error) => {
      const msg =
        (error.response?.data && (error.response?.data as any).message) ||
        "Failed to unfollow"

      toast.dismiss()
      toast.error(msg)
    },
  })
}
