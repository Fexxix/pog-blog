import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Pencil } from "@/lib/icons"
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

type UserProfile = {
  username: string
  biography: string
  profilePicture: string
  id: string
  blogs: {
    id: string
    title: string
    description: string
    datePublished: string
    image: string
    likes: number
    hasLiked: boolean
  }[]
  isProfileOwner: boolean
}

function useProfileQuery() {
  const { pathname } = useLocation()

  return useQuery<UserProfile, AxiosError | Error>({
    queryKey: ["profile", pathname],
    queryFn: async () => {
      return (await axios.get(`/api/users/${pathname.slice(1)}`)).data
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}

export function ProfilePage() {
  const profileQuery = useProfileQuery()

  if (!profileQuery.data || profileQuery.isLoading)
    return <ProfilePageSkeleton />

  return (
    <>
      <div className="pt-36 relative h-full">
        <ProfileCard
          profilePicture={profileQuery.data.profilePicture}
          username={profileQuery.data.username}
          biography={profileQuery.data.biography}
          blogsCount={profileQuery.data.blogs.length}
        />
        <div className="flex flex-col justify-center items-center gap-5 pt-[calc(144px+384px-6rem)] pb-10">
          {profileQuery.data.blogs.map((blog) => (
            <BlogCard
              blogData={{
                author: {
                  username: profileQuery.data.username,
                  profilePicture: profileQuery.data.profilePicture,
                },
                ...blog,
              }}
              key={blog.id}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function ProfileCard({
  profilePicture,
  username,
  biography,
  blogsCount,
}: {
  profilePicture: string
  username: string
  biography: string
  blogsCount: number
}) {
  return (
    <div className="absolute w-full sm:w-4/5 left-1/2 -translate-x-1/2 h-96 bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-md shadow-md">
      <Avatar className="size-40 absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 border-8 border-white dark:border-black">
        <AvatarImage src={profilePicture} />
        <AvatarFallback>{username}</AvatarFallback>
      </Avatar>
      <div className="h-full pt-20">
        <h1 className="pt-8 text-3xl font-bold text-center">{username}</h1>
        <p className="pt-4 text-center text-sm sm:text-base">{biography}</p>
        <div className="pt-4 flex flex-col gap-3 items-center justify-center">
          <Pencil className="size-16 sm:size-16" />
          <span className="text-xl font-semibold">
            {blogsCount} Blog{blogsCount === 1 ? "" : "s"} authored
          </span>
        </div>
      </div>
    </div>
  )
}

function BlogCard({
  blogData,
}: {
  blogData: {
    author: {
      username: string
      profilePicture: string
    }
  } & UserProfile["blogs"][0]
}) {
  return (
    <Link
      to={`/${blogData.author.username}/${blogData.title}`.replace(/ /g, "%20")}
      className="contents"
    >
      <Card className="w-4/5">
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

function ProfilePageSkeleton() {
  return (
    <>
      <div className="pt-36 relative h-full">
        <div className="absolute w-full sm:w-4/5 left-1/2 -translate-x-1/2 h-96 bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-md shadow-md">
          <div className="size-40 rounded-full absolute -top-40 left-1/2 translate-y-1/2 -translate-x-1/2 bg-whoite dark:bg-black">
            <Skeleton className="size-40 rounded-full absolute border-8 border-white dark:border-black" />
          </div>
        </div>
        <div className="h-full pt-24 flex flex-col gap-4 items-center">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="pt-4 w-[400px] h-5" />
          <Pencil className="size-16 sm:size-16 z-10 animate-pulse" />
          <Skeleton className="pt-4 w-[145px] h-5" />
        </div>
        <div className="flex flex-col justify-center items-center gap-5 -mt-10 pb-10">
          {Array.from({ length: 10 }, (_, i) => (
            <BlogSkeletonCard key={i} />
          ))}
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
