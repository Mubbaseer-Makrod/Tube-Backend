import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Text field are required")
    }

    const existedUser = await User.findOne(
        { 
            $or: [{username}, {email}]
        }
    )
    if(existedUser) {
        throw new ApiError(500, "username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.filepath
    const coverImageLocalPath = req.files?.coverImage[0]?.filepath

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar is not saved in cloud")
    }

    const user = await User.create(
        {
            username: username.toLowecase(), 
            email, 
            fullName, 
            password, 
            avatar: avatar.url,
            coverImage: coverImage.url || ""
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

export {registerUser}