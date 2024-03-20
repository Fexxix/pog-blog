import { Schema, model } from "mongoose"

const LikesSchema = new Schema({
  count: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [{ type: String, ref: "User" }],
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
    author: {
      type: {
        _id: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        profilePicture: {
          type: String,
          required: true,
        },
      },
      ref: "User",
      required: true,
    },
    datePublished: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    likes: LikesSchema,
  } as const)
)
