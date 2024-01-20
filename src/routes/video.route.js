import express from "express"
import { fetchSingleVideo, fetchchannelVideos, registerVideo } from "../controllers/video.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = express.Router()

router.route("/c/:videoTitle").post(fetchSingleVideo)
router.route("/:channelName").get(fetchchannelVideos)

// secure route
router.route("/register-video").post(verifyjwt, upload.single("videoFile") ,registerVideo)


export default router