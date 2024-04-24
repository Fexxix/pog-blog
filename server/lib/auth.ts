import { MongodbAdapter } from "@lucia-auth/adapter-mongodb"
import { Lucia, TimeSpan } from "lucia"
import mongoose from "mongoose"

const adapter = new MongodbAdapter(
  // @ts-ignore
  mongoose.connection.collection("sessions"),
  mongoose.connection.collection("users")
)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      // @ts-ignore
      sameSite: "none",
    },
  },
  sessionExpiresIn: new TimeSpan(2, "w"),
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
  }
}
