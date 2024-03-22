import Navbar from "./Navbar";
import BlogContent from "./BlogContent";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import Skelton from "./Skelton";

async function getBlogs({ pageParam }: { pageParam: number }) {
  return (await axios.get(`${API_URL}/blogs?page=${pageParam}`)).data;
}

export default function Blogs() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["blogs"],
      queryFn: getBlogs,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  if (!data) {
    return (
      <div>
        <Navbar />
        <h1 className="text-center text-6xl  font-bold py-4 mt-6 text-gray-700">
          {" "}
          Pog Blogs
        </h1>
        {Array.from({ length: 6 }, (_, index) => (
          <Skelton key={index} />
        ))}
      </div>
    );
  }
  return (
    <>
      {data && (
        <div>
          <Navbar />
          <BlogContent blogs={data} />
          <div className="h-fit my-6">
            <div className=" flex justify-center items-center my-3 ">
              {hasNextPage && (
                <button
                  className="w-fit h-fit border-2 border-black rounded-xl px-6 py-3 text-lg"
                  onClick={() => {
                    fetchNextPage();
                  }}
                >
                  LoadMore
                </button>
              )}
            </div>

            <div className="my-3 text-3xl ">
              {isFetching && !isFetchingNextPage ? "Fetching..." : undefined}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
