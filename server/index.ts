import express from "express"
import { config } from "dotenv"
import mongoose from "mongoose"
import { userRouter } from "./routes/userRoutes.js"
import { lucia } from "./lib/auth.js"
import { Session } from "lucia"
import { blogsRouter } from "./routes/blogRoutes.js"
import { webcrypto } from "node:crypto"

globalThis.crypto = webcrypto as Crypto

config()

const app = express()

app.use(async (req, res, next) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "")

  if (!sessionId) {
    res.locals.user = null
    res.locals.session = null
    return next()
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    )
  }
  if (!session) {
    res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
  }
  res.locals.session = session
  res.locals.user = user
  return next()
})
app.use(express.json())
app.use("/users", userRouter)
app.use("/blogs", blogsRouter)

try {
  await mongoose.connect(process.env.MONGO_URI!)
} catch (err) {
  console.log("Connection to DB failed", err)
  process.exit(1)
}

app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} & connection to DB established`
  )
})

declare global {
  namespace Express {
    interface Locals {
      session: Session | null
    }
  }
}
