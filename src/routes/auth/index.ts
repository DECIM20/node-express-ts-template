import express from "express"
import { signIn, signUp, signOut, profile } from "./controller"
import protectedRoute from "~/middleware/protected-route"
const router = express.Router()

router.post("/sign-up", signUp)

router.post("/sign-in", signIn)

router.post("/sign-out", protectedRoute, signOut)

router.get("/profile", protectedRoute, profile)

export default router
