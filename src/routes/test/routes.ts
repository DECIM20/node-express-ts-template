import express, { Request, Response } from "express"
import { ExpressError } from "~/middleware/error"
const router = express.Router()

router.get("/", (req: Request, res: Response) =>
  res.status(200).json({ success: true })
)

router.get("/error", (req: Request, res: Response) => {
  throw new ExpressError({
    code: "NOT_FOUND",
    message: "Error route accessed!!",
  })
})

export default router
