import { Router } from "express"
import { isValidEmail } from "../lib/isValidEmail.js"
import { lucia } from "../lib/auth.js"
import { generateId } from "lucia"
import { Argon2id } from "oslo/password"
import { UserModel } from "../models/UserModel.js"
import { isAuthenticated } from "../middleware/is-authenticated.js"

export const userRouter = Router()
const MIN_PASSWORD_LENGTH = 6
const argon2id = new Argon2id()

userRouter.post("/signup", async (req, res) => {
  const { email, password, username } = req.body ?? {
    email: "",
    password: "",
    username: "",
  }

  const exists = await UserModel.exists({ email })

  if (exists) {
    return res.status(400).send("Email already exists")
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).send("Invalid email")
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    return res.status(400).send("Invalid password")
  }

  const hashedPassword = await argon2id.hash(password)
  const userId = generateId(15)

  try {
    await UserModel.create({
      _id: userId,
      email,
      password: hashedPassword,
      username,
      profilePicture: "https://picsum.photos/200/300",
    })

    res.status(200).json({ message: "User created!" })
  } catch {
    res.status(500).send("Server error")
  }
})

userRouter.post("/login", async (req, res) => {
  if (res.locals.session) {
    return res.status(400).json({ message: "Already Logged in!" })
  }

  const { email, password } = req.body ?? { email: "", password: "" }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).send("Invalid email")
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    return res.status(400).send("Invalid password")
  }

  try {
    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).send("User does not exist")
    }

    const validPassword = await argon2id.verify(user.password, password)

    if (!validPassword) {
      return res.status(400).send("Invalid email or password")
    }

    const session = await lucia.createSession(user._id, {})
    res
      .appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      )
      .status(200)
      .json({ message: "Login successful!" })
  } catch {
    res.status(500).send("Internal Server error")
  }
})

userRouter.get("/me", isAuthenticated, async (req, res) => {
  if (res.locals.session) {
    try {
      const user = await UserModel.findOne({ _id: res.locals.session.userId })

      res.status(200).json({
        name: user?.username,
        email: user?.email,
        profilePicture: user?.profilePicture,
        biography: user?.biography,
        id: user?._id,
      })
    } catch {
      res.status(500).json({ message: "Something went wrong!" })
    }
  }
})
