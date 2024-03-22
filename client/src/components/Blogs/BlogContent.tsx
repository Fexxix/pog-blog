import Markdown from "react-markdown";

type BlogCard = {
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  datePublished: string;
  likes: {
    count: number;
    likedBy: string[];
  };
};

export default function BlogContent(props: {
  blogs: { pages: { blogs: BlogCard[] }[] };
}) {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-center text-6xl  font-bold py-4 mt-6 text-gray-700">
        {" "}
        Pog Blogs
      </h1>
      {props.blogs.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.blogs.map((blog, blogIndex) => (
            <div
              key={blogIndex}
              className="flex flex-col w-[90%] md:w-[80%] lg:w-[70%] p-6 my-6 m-auto rounded-3xl shadow shadow-slate-600 overflow-x-auto"
            >
              <div className="flex justify-start items-center my-2">
                <div className="w-16 h-16 rounded-full overflow-hidden m-1 md:m-2">
                  <img
                    src={blog.author.profilePicture}
                    alt={blog.author.username}
                  />
                </div>
                <div className="w-fit h-fit mx-2 text-xl font-bold">
                  {blog.author.username}
                </div>
                <div className="w-fit h-fit text-lg text-gray">
                  {blog.datePublished}
                </div>
              </div>

              <div className="flex flex-col ">
                <div className="text-3xl font-semibold my-2">{blog.title}</div>
                <div className="prose ">
                  <Markdown>
                    {blog.content.split("\n").slice(0, 5).join("\n")}
                  </Markdown>{" "}
                  <span className="text-gray-500 font-bold">Read More</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
