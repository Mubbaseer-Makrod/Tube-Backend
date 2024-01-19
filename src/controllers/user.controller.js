import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponce.js"
import Jwt from "jsonwebtoken";

/* problem: Generate Access Token and Refresh Token
solve:
1. search database with id and fetch user
2. call accesstoken and refresh token methode and save in variable
3. save both in database
4. return both
*/

const generateAccessTokenAndRefreshToken = async function(userId) {
    try {

        const user = await User.findById(userId)
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating Refresh and Access Token error: ${error}`)
    }
}

/* problem: register user 

steps:
1. Take input from user(front-end) (2 data - json and image)
2. Validate data (check if it non empty)
3. fetch username (check if username already exist) 
4. check if avatar is present
5. Upload it to cloudinary 
6. create object -- save it to db 
7. remove password and refreshtoken from response
8. check if user is created 
9. return response
*/


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body 
    if ([username, email, fullName, password].some((field) => !field ? true : false)) {
        throw new ApiError(400, "All Text field are required")
    }

    // if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    //     throw new ApiError(400, "All Text field are required")
    // } This if was only handling empty but not undefined value (undefined === "") => false

    const existedUser = await User.findOne(
        { 
            $or: [{username}, {email}]
        }
    )
    if(existedUser) {
        throw new ApiError(500, "username or email already exists")
    }
    // console.log(req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path  //req.files['avatar'][0]
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    // let coverImageLocalPath
    // if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // } 

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar is not saved in cloud")
    }

    const user = await User.create(
        {
            username: username.toLowerCase(), 
            email, 
            fullName, 
            password, 
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the userS")
    }

    res.status(201).json(
        new ApiResponse(200, createdUser , "User creation successfull")
    )
})

/* problem: User Login

1. Fetch data email or username from frontend
2. validate the data(not empty correct format)

3. search database with (username or email)
4. check password

5. If user not found (give error)
6. generate access token and refreshtoken
7. send cookie to user web browser(using cookie) and save it to database

*/

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if(!email && !username ) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    // console.log(user);
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    
    res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json( new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken,
            refreshToken
        },
        "user logged in Succesfully"
    ))

})

/* logout user 
steps: 
1. fetch user id from req.user (given by middleware)
2. call dbquery find user 
3. delete accesstoken from user and save in db
*/

const logoutUser = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new ApiError(401, "user not available in request")
    }

    // const user = User.findByIdAndUpdate(req.user._id, update, options)

    const user = await User.findByIdAndUpdate(req.user?._id, 
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true
        }
    )

    if(!user) {
        throw new ApiError(401, "User not available")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User succesfully loggedout"
    ))

})

/* problem: After AcessToken expire give new one to use
steps:
1. fetch access and refresh cookie from user
2. verify access token 
3. decode the refresh token and fetch _id
4. generate access and refreshtoken 
5. save refresh token to database
6. give both to user
*/
const refreshAcessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Acess")
    }

    try {
        const decodedRefreshToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        if(!decodedRefreshToken) {
            throw new ApiError(401, "Access is Expired or Invalid")
        }
    
        const user = await User.findById(decodedRefreshToken._id)
        if(!user) {
            throw new ApiError(401, "Can't Find user ")
        }
    
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
        // console.log(`Access T: ${accessToken} , Ref T: ${refreshToken}`);
        const options = {
            httpOnly: true,
            secure: true
        }
    
        res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                "accessToken": accessToken,
                "refreshToken": refreshToken
            },
            "Refresh Token Successfully updated"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

/* problem: Change User Password
steps: (req has user, oldPassword and newPassword)
1. fetch user from req (user included in req from auth middleware)
2. get user id and call database to find user
3. call isPasswordverified methode to verify current password is correct.
4. update the password
5. return success to user 
*/

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req?.user?._id)
    if(!user) {
        throw new ApiError(404, "User not Found")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password Change Successfully"
    ))

})

/* Problem: Get Current User
steps:
1. fetch user from res (from auth middleware) and send it to response
*/

const getCurrentUser = asyncHandler(async(req, res) => {

    if(!req?.user) {
        throw new ApiError(400, "Failed to fetch user from the request")
    }
    res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "Current user fetched Successfully"
    ))
})

/* problem: Update account details
1: fetch email and full name from req
2: fetch _id from req.user (user is added by auth middleware)
3: call data and update username and email (remove password field)
4: send respond
*/

const updateAccountInfo = asyncHandler(async (req, res) => {
    const {username, email} = req.body
    if(!username || !email) {
        throw new ApiError(404, "All Field require")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                username,
                email
            }
        },
        { new: true }
    ).select("-password")

    if(!user) {
        throw new ApiError(404, "Account not available in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account detail updated successfully"))
})

/* Problem: Update user Avatar
step 1: fetch local file path from req
2: fetch user from database
3: update the database
*/ 

const updateUserAvatar = asyncHandler(async (req, res) => {
    const oldAvatarUrl = req?.user?.avatar
    const avatarLocalPath = req?.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url) {
        throw new ApiError(400, "Failed to upload avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                "avatar": avatar.url
            }
        },
        {new: true}
    ).select("-password")

    if(!user) {
        throw new ApiError(400, "Avatar cloudinary Url not saved in database")
    }

    // deleting the old avatar
    await destroyOnCloudinary(oldAvatarUrl)
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfull updated Avatar"))
})

/* (update coverimage)Same as Update avatar */

const updateCoverImage = asyncHandler(async (req, res) => {
    const oldCoverImageUrl = req?.user?.coverImage
    const coverImageLocalPath = req?.file?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage?.url) {
        throw new ApiError(400, "Failed to upload cover image on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "coverImage" : coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    if (!user) {
        throw new ApiError(400, "coverimage cloudinary Url not saved in database")
    }

    // deleting the old cover image
    await destroyOnCloudinary(oldCoverImageUrl)

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"))
})

/* Get User Channel Profile
1: 
 */

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req?.params

    if(!username?.trim()) {
        throw new ApiError(404, "Failed to give user name")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscriptionCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscriptionCount: 1,
                isSubscribed: 1,
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(400, "Failed to fetch channel from database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Successfully fetched channel data"))
})

/* problem: get watch History
1. fetch user from req
2. use aggregate pipeline (becouse in user watch history is array with video_id)
3. in aggregate pipeline
  1. match the user from req
  2. lookup from user watchistory to video by _id
  3. create nested lookup (becouse owner need to replaced with user details)
  4. send owner[0] element
*/

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectID(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                      }  
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            },
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched Succesfully"))
})

export {registerUser, loginUser, logoutUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountInfo, updateUserAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory}