import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
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
          <Link to="/blogs">
            <Button className="text-md" size="lg">
              Explore
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="text-md" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
