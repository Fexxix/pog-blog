import { Router } from "express"
import { BlogModel } from "../models/BlogModel.js"

export const blogsRouter = Router()

const PAGE_SIZE = 20

blogsRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string)

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page number" })
  }

  const skip = (page - 1) * PAGE_SIZE

  try {
    const blogs = await BlogModel.find().skip(skip).limit(PAGE_SIZE).exec()

    const totalDocuments = await BlogModel.countDocuments()
    const hasMore = page * PAGE_SIZE < totalDocuments

    res.json({
      blogs: blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        content: blog.content,
        datePublished: blog.datePublished.toISOString(),
        likes: blog.likes?.count ?? 0,
        author: {
          username: blog.author.username,
          profilePicture: blog.author.profilePicture,
        },
      })),
      hasMore,
      nextPage: hasMore ? page + 1 : -1,
    })
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

// useInfiniteQuery
// .prettierrc
// login, signup
// private route handling
