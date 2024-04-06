import { model, Schema } from "mongoose"

export const CommentModel = model(
  "comments",
  new Schema({
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      ref: "users",
      required: true,
    },
    datePosted: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "blogs",
      required: true,
    },
  } as const)
)
