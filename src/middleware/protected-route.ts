import { NextFunction, Request, Response } from "express"
import { ExpressError } from "./error"

const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.uid) {
    throw new ExpressError({
      code: "UNAUTHORIZED",
      message: "Unauthorized access - Log in to access the resource!!",
    })
  }
  next()
}

export default protectedRoute
