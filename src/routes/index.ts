import express from "express"
const router = express.Router()

import Test from "./test/routes"

router.use("/test", Test)

export default router
