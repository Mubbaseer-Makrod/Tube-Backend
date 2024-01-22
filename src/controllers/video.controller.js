import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        let { isPublished } = req.body
    
        if(!req?.user) {
            throw new ApiError(400, "User is not LoggedIN")
        }
        // TODO: get video, upload to cloudinary, create video
        if(!(title && description)) {
            throw new ApiError(400, "All Fields are required")
        }
    
        // if published is not given putting default true init
        if(!isPublished) {
            isPublished = true
        }
    
        const videoLocalPath = req?.files?.videoFile?.[0]?.path
        const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path

        if(!(videoLocalPath && thumbnailLocalPath)) {
            throw new ApiError(400, "Video or Thumbnail is not Locally stored")
        }
    
        const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
        if(!(uploadedVideo && uploadedThumbnail)) {
            throw new ApiError(400, "Failed to upload on Cloudinary")
        }

        const video = await Video.create({
            videoFile: uploadedVideo.url,
            title,
            description,
            thumbnail: uploadedThumbnail.url,
            owner: req?.user?._id,
            duration: uploadedVideo.duration,
            isPublished
        })
    
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Successfully uploaded video"))
    } catch (error) {
        throw new ApiError(400, `Error occour: ${error}`)
    }
})

/* Problem: Get one video by Id in params
steps 1: fetch videoId from params
2: use aggregated pipeline (Becaouse we need owner data)
3: return the video 
*/
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "Video Id is not Provided in Url")
    }
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            },
        },
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
                            avatar: 1,
                            coverImage: 1,
                        }
                    }
                ]
            }
        }
    ])

    if(!video.length) {
        throw new ApiError(404, "Video is not present in DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Succesfully fetched data"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}