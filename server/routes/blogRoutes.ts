import { Router } from "express"
import { BlogModel } from "../models/BlogModel.js"
import { isAuthenticated } from "../middleware/is-authenticated.js"
import { CommentModel } from "../models/CommentsModel.js"
import { UserModel } from "../models/UserModel.js"

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
      .select("title description datePublished likes _id author image")
      .populate({ path: "author", select: "username profilePicture" })
      .exec()

    const totalDocuments = await BlogModel.countDocuments()
    const hasMore = page * PAGE_SIZE < totalDocuments

    res.json({
      blogs: blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
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
      })),
      hasMore,
      nextPage: hasMore ? page + 1 : -1,
    })
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

blogsRouter.get("/:username/:title", async (req, res) => {
  const { username, title } = req.params

  console.log(title)

  try {
    const author = await UserModel.findOne({ username })

    if (!author) {
      return res.status(400).json({ message: "User does not exist!" })
    }

    const blog = await BlogModel.findOne({
      title,
      author: author._id,
    })
      .populate({ path: "author", select: "username profilePicture" })
      .exec()

    if (blog) {
      return res.json({
        id: blog._id,
        title: blog.title,
        content: blog.content,
        description: blog.description,
        datePublished: blog.datePublished.toISOString(),
        likes: blog.likes?.count ?? 0,
        comments: blog.comments.length,
        author: {
          // @ts-ignore
          username: blog.author.username,
          // @ts-ignore
          profilePicture: blog.author.profilePicture,
        },
        image: blog.image,
      })
    }

    return res.status(404).json({ message: "Blog not found" })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: "Internal Server Error!" })
  }
})

// blogsRouter.get("/like/:id", isAuthenticated, async (req, res) => {
//   const { id } = req.params

//   try {
//     const blog = await BlogModel.updateOne({ _id: id}, {
//       $inc: {
//         likes: ""
//       }
//     })
//   } catch {
//     res.status(500).json({ message: "Internal Server Error!" })
//   }
// })

blogsRouter.get("/comments/:id", async (req, res) => {
  const { id } = req.params
  const page = parseInt(req.query.page as string)

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page number" })
  }

  const skip = (page - 1) * PAGE_SIZE

  try {
    const comments = await CommentModel.find({ blog: id })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate({ path: "author", select: "username profilePicture" })
      .exec()

    const totalDocuments = await CommentModel.find({
      blog: id,
    }).countDocuments()
    const hasMore = page * PAGE_SIZE < totalDocuments

    res.json({
      comments: comments.map((c) => ({
        content: c.content,
        author: {
          // @ts-ignore
          username: c.author.username,
          // @ts-ignore
          profilePicture: c.author.profilePicture,
        },
        datePosted: c.datePosted,
      })),
      hasMore,
      nextPage: hasMore ? page + 1 : -1,
    })
  } catch {
    return res.status(500).json({ message: "Internal Server Error!" })
  }
})
