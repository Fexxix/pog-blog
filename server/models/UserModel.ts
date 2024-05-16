import { Schema, model } from "mongoose"
import { CATEGORIES } from "./BlogModel.js"

export const UserModel = model(
  "users",
  new Schema(
    {
      _id: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      profilePicture: {
        type: String,
        required: true,
      },
      biography: {
        required: false,
        type: String,
        default: "This user has no biography",
      },
      categories: {
        type: [String],
        enums: CATEGORIES,
        required: true,
      },
      verified: {
        type: Boolean,
        required: true,
        default: false,
      },
      followers: [
        {
          type: String,
          ref: "users",
          default: [],
        },
      ],
      following: [
        {
          type: String,
          ref: "users",
          default: [],
        },
      ],
    } as const,
    { _id: false }
  )
)
