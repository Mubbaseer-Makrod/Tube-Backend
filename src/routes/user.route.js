import express from "express"
import { loginUser, logoutUser, registerUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountInfo, updateUserAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
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
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-current-password").post(verifyJWT, changeCurrentPassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account-info").patch(verifyJWT, updateAccountInfo)
router.route("/update-avatar-image").patch(verifyJWT, upload.single("avatar") ,updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"),updateCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router