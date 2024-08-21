import express from "express"
const router = express.Router()

import Auth from "./auth"

router.use("/auth", Auth)

export default router
