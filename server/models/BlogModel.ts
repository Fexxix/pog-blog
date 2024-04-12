import { Schema, model } from "mongoose"

export const BlogModel = model(
  "blogs",
  new Schema({
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    author: {
      type: String,
      ref: "users",
      required: true,
    },
    datePublished: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    likes: {
      type: [{ type: String, ref: "users" }],
      default: [],
    },
  } as const)
)
