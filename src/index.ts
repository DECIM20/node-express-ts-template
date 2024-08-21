import "express-async-errors"
import express, { Express, NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import session from "express-session"
import RedisStore from "connect-redis"
const app: Express = express()
dotenv.config()

import corsOptions from "./cors"
import { ERROR_CODES, ExpressError } from "./middleware/error"
import logger from "./error-logger"
import redisClient from "./middleware/redis"

app.options("*", corsOptions)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 3000

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    }, // Set to true if using HTTPS (Production)
  })
)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

import router from "./routes"

app.use("/api", router)

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new ExpressError({
    code: "NOT_FOUND",
    message: `Route ${req.originalUrl} not found.`,
  })
  next(error)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ExpressError) {
    const statusCode = ERROR_CODES[err.code] || 500

    return res
      .status(statusCode)
      .json({ status: statusCode, message: err.message, error: err.error })
  } else {
    logger.error("Internal Server Error", {
      message: err.message,
      stack: err.stack,
    })

    res.status(500).json({
      status: 500,
      message: "Internal Server Error !!!",
    })
  }
})
