import { Router } from "express"
import { BlogModel } from "../models/BlogModel.js"

export const blogsRouter = Router()

blogsRouter.get("/", async (req, res) => {
  try {
    const blogs = await BlogModel.find()

    res.json(
      blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        content: blog.content,
        datePublished: blog.datePublished.toISOString(),
        likes: blog.likes?.count ?? 0,
      }))
    )
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})
