import { model, Schema } from "mongoose"

export const ValidationCodeModel = model(
  "ValidationCode",
  new Schema({
    email: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    expiration: { type: Date, required: true, default: () => new Date() },
  })
)
