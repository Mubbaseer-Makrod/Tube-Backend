import express from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"
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

router.route("/login").post(loginUser)

// secure-route
router.route("/logout").post(verifyjwt, logoutUser)

export default router