import { Schema, model } from "mongoose"

export const CATEGORIES = [
  "Technology",
  "Science",
  "Travel",
  "Food & Cooking",
  "Health & Fitness",
  "Fashion & Style",
  "Anime News",
  "Manga",
  "Anime Reviews",
  "Cosplay",
  "Anime Recommendations",
  "Anime Memes",
  "Fan Art",
  "Anime Music",
  "Anime Conventions",
  "Coding Challenges",
  "Web Development",
  "Mobile App Development",
  "Software Engineering",
  "Programming Languages",
  "Algorithms & Data Structures",
  "Developer Tools & Libraries",
  "Tech News",
  "Arts & Crafts",
  "Business & Finance",
  "Sports",
  "Music",
  "Movies & TV Shows",
  "Books & Literature",
  "Gaming",
  "Home & Garden",
  "Photography",
  "Pets & Animals",
  "DIY & How-To Guides",
  "Education & Learning",
  "Parenting",
  "Environment & Sustainability",
]

const blogSchema = new Schema({
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
  categories: {
    type: [String],
    enum: CATEGORIES,
    required: true,
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

// Compound unique index to ensure each user cannot have two articles with the same title
blogSchema.index({ title: 1, author: 1 }, { unique: true })
// Text index for full-text search on the title field
blogSchema.index({ title: "text" })

export const BlogModel = model("blogs", blogSchema)
