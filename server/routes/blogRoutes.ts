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
    const blogs = await BlogModel.find()
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate({ path: "author", select: "username profilePicture" })
      .exec()

    console.log(blogs)

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
          // @ts-ignore
          username: blog.author.username,
          // @ts-ignore
          profilePicture: blog.author.profilePicture,
        },
        image: blog.image,
      })),
      hasMore,
      nextPage: hasMore ? page + 1 : -1,
    })
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

blogsRouter.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const blog = await BlogModel.findOne({
      _id: id,
    })
      .populate({ path: "author", select: "username profilePicture" })
      .exec()

    if (blog) {
      res.json({
        id: blog._id,
        title: blog.title,
        content: blog.content,
        description: blog.description,
        datePublished: blog.datePublished.toISOString(),
        likes: blog.likes?.count ?? 0,
        author: {
          // @ts-ignore
          username: blog.author.username,
          // @ts-ignore
          profilePicture: blog.author.profilePicture,
        },
        image: blog.image,
      })
    }
  } catch {
    res.status(404).json({ message: "Blog not found" })
  }
})
