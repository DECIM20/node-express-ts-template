import { ZodError, ZodSchema } from "zod"
import { ExpressError } from "../middleware/error"

export const zBodyParse = <T>(schema: ZodSchema<T>, body: any) => {
  try {
    return { success: true, data: schema.parse(body), error: null }
  } catch (error) {
    const err = error as ZodError
    return { success: false, data: null, error: err }
  }
}
