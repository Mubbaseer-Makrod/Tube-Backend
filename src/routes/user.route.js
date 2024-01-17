import express from "express"
import { loginUser, logoutUser, registerUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountInfo, updateUserAvatar, updateCoverImage, getUserChannelProfile } from "../controllers/user.controller.js"
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
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-current-password").post(verifyjwt, changeCurrentPassword)
router.route("/get-current-user").post(verifyjwt, getCurrentUser)
router.route("/update-account-info").post(verifyjwt, updateAccountInfo)
router.route("/update-avatar-image").post(verifyjwt, updateUserAvatar)
router.route("/update-user-cover-image").post(verifyjwt, updateCoverImage)
router.route("/get-user-channel").post(verifyjwt, getUserChannelProfile)


export default router