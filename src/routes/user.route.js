import express from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
// const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])

const router = express.Router()

router.route("/register").post(
    upload.fields(
        [
            {
            name: "avatar", 
            maxCount: 1
            }, {
            name: "coverImage", 
            maxCount: 1
            }
        ]
    ),
    registerUser
)

export default router