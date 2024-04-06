import { Schema, model } from "mongoose"

const LikesSchema = new Schema({
  count: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [{ type: String, ref: "users" }],
    default: [],
  },
})

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
    likes: LikesSchema,
  } as const)
)
