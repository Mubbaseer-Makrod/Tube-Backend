import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


/* Problem: What type of controllers should be in video
1. save video in controller.
2. update info in video.
3. isPublished info update.
*/

/* Problem: Save video
1. fetch all json data from req
2. fetch localpath of video from multer
3. upload the video to cloudinary
4. save the video to the database
*/
const registerVideo = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new ApiError(400, "User is not logIn")
    }

    const { title, description, thumbnail, isPublished } = req.body
    const owner = req.user._id

    if([title, description, thumbnail].some((field) => !field ? true: false)) {
        throw new ApiError(400, "All fields are required")
    }

    const videoLocalPath = req?.file?.path
    if(!videoLocalPath) {
        throw new ApiError(400, "No Local Path available for video")
    }

    const cloudinaryVideo = await uploadOnCloudinary(videoLocalPath)

    if(!cloudinaryVideo) {
        throw new ApiError(400,"Failed to upload video on CLoudinary")
    }

    console.log(`cloudinaryVideo details :${JSON.stringify(cloudinaryVideo.duration)}`);

    const video = await Video.create({
        videoFile: cloudinaryVideo.url,
        title,
        description,
        thumbnail,
        owner,
        isPublished,
        duration: cloudinaryVideo.duration
    })

    if(!video) {
        throw new ApiError(400, "Failed to save video in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video saved succesfully"))
})

const fetchSingleVideo = asyncHandler(async (req, res) => {
    const { videoTitle } = req?.params

    // if(!req?.user) {
    //     throw new ApiError(400, "User is not logged In")
    // }

    if(!videoTitle) {
        throw new ApiError(400, "Video Title is not provided in Url")
    }

    const video = await Video.findOne({
        title: videoTitle
    })

    if(!video) {
        throw new ApiError(400, "No Video present with given title")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Has been succesfully fetched"))
})

/* Problem: Fetch the videos that belong to same channels
1. fetch user._id from request
2. make db query where match userId with owner id 
3. send whole response
*/

const fetchchannelVideos = asyncHandler(async (req, res) => {
    const { channelName } = req?.params
    if(!channelName) {
        throw new ApiError(400, "ChannelName is not available in url")
    }

    const channel = await User.findOne({
        username: channelName
    })

    const videos = await Video.find({
        owner: channel._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos has been succesfully fetched"))
})

export {registerVideo, fetchSingleVideo, fetchchannelVideos}