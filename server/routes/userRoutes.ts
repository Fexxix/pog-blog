import { Router } from "express"
import { isValidEmail } from "../lib/isValidEmail.js"
import { lucia } from "../lib/auth.js"
import { generateId } from "lucia"
import { Argon2id } from "oslo/password"
import { UserModel } from "../models/UserModel.js"
import { isAuthenticated } from "../middleware/is-authenticated.js"
import { ValidationCodeModel } from "../models/ValidationCodeModel.js"
import { sendVerificationEmail } from "../controllers/sendEmail.js"
import { BlogModel } from "../models/BlogModel.js"

export const userRouter = Router()
const argon2id = new Argon2id()

const MIN_USERNAME_LENGTH = 3
const MIN_PASSWORD_LENGTH = 6
const MIN_CATEGORIES_LENGTH = 3
const disallowedNames = [
  "blogs",
  "login",
  "signup",
  "otp",
  "feed",
  "choose-categories",
]
const disallowedCharactersInURL = [
  " ",
  "<",
  ">",
  "#",
  "%",
  "{",
  "}",
  "|",
  "\\",
  "^",
  "~",
  "[",
  "]",
  "`",
] as const

userRouter.post("/signup", async (req, res) => {
  const { email = "", password = "", username = "" } = req.body

  const exists = await UserModel.findOne({ email })

  if (exists && !exists.verified) {
    await UserModel.deleteOne({ email })
    return res.status(400).json({
      message: "Email already exists and not verified. Register again.",
    })
  }

  if (exists) {
    return res.status(400).json({ message: "Email already exists." })
  }

  if (
    !username ||
    typeof username !== "string" ||
    username.length < MIN_USERNAME_LENGTH ||
    disallowedNames.includes(username.toLowerCase()) ||
    disallowedCharactersInURL.some((char) => username.includes(char))
  ) {
    return res.status(400).json({ message: "Invalid username" })
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" })
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    return res.status(400).json({ message: "Invalid password" })
  }

  const hashedPassword = await argon2id.hash(password)
  const userId = generateId(15)

  const validationCodeDoc = new ValidationCodeModel({
    email,
    code: Math.floor(100000 + Math.random() * 900000),
    expiration: new Date(Date.now() + 3600000),
  })

  try {
    await UserModel.create({
      _id: userId,
      email,
      password: hashedPassword,
      username,
      profilePicture: "https://picsum.photos/200/300",
    })
    await validationCodeDoc.save()
  } catch {
    return res.status(500).json({ message: "Server error" })
  }

  try {
    await sendVerificationEmail({
      email,
      validationCode: validationCodeDoc.code,
    })
    res.status(200).json({ message: "Email sent successfully." })
  } catch (err) {
    console.error("Error while logging in: ", err)
    return res.status(500).json({
      message: "Error while sending email. Make sure it is a valid email.",
    })
  }
})

userRouter.post("/login", async (req, res) => {
  const { email = "", password = "" } = req.body

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" })
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    return res.status(400).json({ message: "Invalid password" })
  }

  try {
    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "User does not exist" })
    }

    const validPassword = await argon2id.verify(user.password, password)

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const session = await lucia.createSession(user._id, {})

    res
      .appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      )
      .status(200)
      .json({
        message: "Login successful!",
        user: {
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          biography: user.biography,
          id: user._id,
          ...(user.categories.length === 0 ? { hasNoCategories: true } : {}),
        },
      })
  } catch (err) {
    console.error("Error while logging in: ", err)
    res.status(500).json({ message: "Internal Server error" })
  }
})

userRouter.post("/logout", isAuthenticated, async (_, res) => {
  try {
    await lucia.invalidateSession(res.locals.session!.id)
    return res
      .setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
      .status(200)
      .json({ message: "Logout successful!" })
  } catch {
    return res.status(500).json({ message: "Something went wrong!" })
  }
})

userRouter.get("/me", isAuthenticated, async (_, res) => {
  if (res.locals.session) {
    try {
      const user = await UserModel.findOne({ _id: res.locals.session.userId })

      res.status(200).json({
        username: user?.username,
        email: user?.email,
        profilePicture: user?.profilePicture,
        biography: user?.biography,
        id: user?._id,
        ...(user?.categories.length === 0 ? { hasNoCategories: true } : {}),
      })
    } catch (err) {
      console.error("Error while logging in: ", err)
      res.status(500).json({ message: "Something went wrong!" })
    }
  }
})

userRouter.post("/verify-email", async (req, res) => {
  try {
    const { email = "", otp: validationCode = "" } = req.body

    const validationData = await ValidationCodeModel.findOne({
      email,
      code: validationCode,
      expiration: { $gt: new Date() },
    })

    if (!validationData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired validation code." })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "User does not exist." })
    }

    user.verified = true
    await user.save()

    await ValidationCodeModel.deleteOne({ email, code: validationCode })

    res.status(200).json({ message: "Email verified successfully." })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error." })
  }
})

userRouter.patch("/categories", isAuthenticated, async (req, res) => {
  const { categories, email } = req.body

  if (!categories || !email) {
    return res.status(400).json({ message: "Invalid request body!" })
  }

  try {
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email!" })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User does not exist!" })
    }

    if (res.locals.session!.userId !== user._id) {
      return res
        .status(400)
        .json({ message: "Email does not belong to the current user!" })
    }

    if (categories.length < MIN_CATEGORIES_LENGTH) {
      return res.status(400).json({ message: "Invalid number of categories!" })
    }

    if (user.categories.length !== 0) {
      return res.status(400).json({ message: "User already has categories!" })
    }

    user.categories = categories
    await user.save()

    res.status(200).end()
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

userRouter.get("/:user_id/blogs", async (req, res) => {
  const { user_id } = req.params
  const pageSize = 20

  const page = parseInt(req.query.page as string)

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page number" })
  }

  const skip = (page - 1) * pageSize

  try {
    const userBlogs = await BlogModel.find({ author: user_id })
      .sort({ datePublished: -1 })
      .skip(skip)
      .limit(pageSize)

    if (!userBlogs) {
      return res.status(404).json({ message: "User does not exist!" })
    }

    const count = await BlogModel.countDocuments({ author: user_id })
    const hasMore = page * pageSize < count

    res.status(200).json({
      blogs: userBlogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        description: blog.description,
        datePublished: blog.datePublished.toISOString(),
        likes: blog.likes.length,
        image: blog.image,
        hasLiked:
          blog.likes.includes(res.locals.session?.userId ?? "") ?? false,
        categories: blog.categories,
      })),
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal Server Error!" })
  }
})

userRouter.patch("/edit/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params
  const { username, profilePicture, biography } = req.body

  if (!username || !profilePicture || !biography) {
    return res.status(400).json({ message: "All fields are required!" })
  }

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        username,
        profilePicture,
        biography,
      },
      {
        new: true,
      }
    )

    if (!updatedUser) {
      return res.status(400).json({ message: "User does not exist!" })
    }

    res.status(200).end()
  } catch (err) {
    console.error("Error while updating user: ", err)
    res.status(500).json({ message: "Internal Server Error!" })
  }
})

userRouter.post("/follow/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params

  try {
    const userToFollow = await UserModel.findById(id)
    const currentUser = await UserModel.findById(res.locals.session?.userId)

    if (!currentUser) {
      return res.status(400).json({ message: "User does not exist" })
    }

    if (!userToFollow) {
      return res.status(400).json({ message: "User does not exist" })
    }

    if (userToFollow.followers.includes(res.locals.session?.userId as string)) {
      res.status(400).json({ message: "Already following" })
    }

    userToFollow.followers.push(res.locals.session?.userId ?? "")
    currentUser.following.push(id)

    await Promise.all([userToFollow.save(), currentUser.save()])

    res.status(200).end()
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

userRouter.delete("/unfollow/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params

  try {
    const userToUnfollow = await UserModel.findById(id)
    const currentUser = await UserModel.findById(res.locals.session?.userId)

    if (!currentUser) {
      return res.status(400).json({ message: "User does not exist" })
    }

    if (!userToUnfollow) {
      return res.status(400).json({ message: "User does not exist" })
    }

    if (
      !userToUnfollow.followers.includes(res.locals.session?.userId as string)
    ) {
      res.status(400).json({ message: "Not following" })
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower !== res.locals.session?.userId
    )
    currentUser.following = currentUser.following.filter(
      (following) => following !== id
    )

    await Promise.all([userToUnfollow.save(), currentUser.save()])

    res.status(200).end()
  } catch {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

userRouter.get("/:username", async (req, res) => {
  const { username } = req.params

  try {
    const user = await UserModel.findOne({ username })

    if (!user) {
      return res.status(404).json({ message: "User does not exist!" })
    }

    const isProfileOwner = res.locals.session?.userId === user._id

    const blogsCount = await BlogModel.countDocuments({ author: user._id })

    res.status(200).json({
      username: user.username,
      profilePicture: user.profilePicture,
      biography: user.biography,
      id: user._id,
      followers: user.followers.length,
      following: user.following.length,
      isFollowing: user.followers.includes(res.locals.session?.userId ?? ""),
      isProfileOwner,
      blogsCount,
      categories: user.categories,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal Server Error!" })
  }
})
