import express from "express"
import { channelSubscription } from "../controllers/subscription.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"


const router = express.Router()

// secure route
router.route("/c/:channelName").post(verifyjwt ,channelSubscription)

export default router