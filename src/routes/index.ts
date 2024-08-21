import express from "express"
const router = express.Router()

import Test from "./test"
import Sockets from "./sockets"

router.use("/test", Test)
router.use("/sockets", Sockets)

export default router
