import express, { Express, NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import corsOptions from "./cors"
import { ERROR_CODES, ExpressError } from "./middleware/error"
import router from "./routes"
import logger from "./error-logger"

const app: Express = express()

dotenv.config()

app.options("*", corsOptions)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = process.env.PORT || 3000

app.use("/api", router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ExpressError) {
    const statusCode = ERROR_CODES[err.code] || 500

    return res
      .status(statusCode)
      .json({ status: statusCode, message: err.message })
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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
