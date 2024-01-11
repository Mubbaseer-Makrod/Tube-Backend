import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponce.js"

/*
problem: Generate Access Token and Refresh Token
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

/* 
problem: register user

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

/* 

problem: User Login
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

/*
logout user 
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

export {registerUser, loginUser, logoutUser}