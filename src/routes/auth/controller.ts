import { Request, Response } from "express"
import { z } from "zod"
import { zBodyParse } from "~/utils/z-parse"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { ExpressError } from "~/middleware/error"
import redisClient from "~/middleware/redis"

const saltRounds = 10

const Users: { id: string; email: string; password: string }[] = []

export const signUp = async (req: Request, res: Response) => {
  const {
    success,
    error,
    data: input,
  } = zBodyParse(
    z.object({
      email: z.string().email(),
      password: z.string().max(30),
    }),
    req.body
  )

  if (!success || error) {
    throw new ExpressError({
      code: "BAD_REQUEST",
      message: "Invalid Inputs!!!",
      error: error,
    })
  }

  if (Users.find(u => u.email === input.email)) {
    throw new ExpressError({
      code: "CONFLICT",
      message: "User already exists!!",
    })
  }

  const hashedPassword = await bcrypt.hash(input.password, saltRounds)

  Users.push({ id: uuidv4(), email: input.email, password: hashedPassword })

  return res.status(200).json({
    message: "User created successfully!!!",
  })
}

export const signIn = async (req: Request, res: Response) => {
  const {
    success,
    error,
    data: input,
  } = zBodyParse(
    z.object({
      email: z.string().email(),
      password: z.string().max(30),
    }),
    req.body
  )

  if (!success || error) {
    throw new ExpressError({
      code: "BAD_REQUEST",
      message: "Invalid Inputs!!!",
      error: error,
    })
  }

  const user = Users.find(u => u.email === input.email)

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new ExpressError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials!!",
    })
  }

  const prevSessionId = await redisClient.get(`user:${user.id}:session`)

  if (prevSessionId) {
    await redisClient.del(`sess:${prevSessionId}`)
  }

  req.session.regenerate(async err => {
    if (err) {
      throw new ExpressError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to regenerate session!!",
      })
    }

    req.session.uid = user.id

    await redisClient.set(`user:${user.id}:session`, req.sessionID)

    return res.status(200).json({
      message: "Login Successful!!",
    })
  })
}

export const signOut = async (req: Request, res: Response) => {
  const uid = req.session.uid

  req.session.destroy(err => {
    if (err) console.log("Error destroying session!!", err)
    else console.log("Session destroyed successfully")
  })

  if (uid) {
    await redisClient.del(`user:${uid}:session`)
  }

  return res.status(200).json({
    message: "Logged out successfully!!",
  })
}

export const profile = async (req: Request, res: Response) => {
  const uid = req.session.uid

  const user = Users.find(u => u.id === uid)

  if (!user) {
    req.session.destroy(err => {
      if (err) console.log("Error destroying session!!", err)
      else console.log("Session destroyed successfully")
    })

    if (uid) {
      await redisClient.del(`user:${uid}:session`)
    }

    throw new ExpressError({
      code: "BAD_REQUEST",
      message: "User not found!!",
    })
  }

  return res.status(200).json(user)
}
