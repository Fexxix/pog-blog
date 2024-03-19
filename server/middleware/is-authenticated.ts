import type { Request, Response, NextFunction } from "express"
import { lucia } from "../lib/auth.js"

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.locals.session) {
    return next()
  }
  return res.status(401).json({ message: "Unauthorized" })
}
