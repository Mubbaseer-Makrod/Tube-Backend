import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {destroyOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    console.log(req.query);

    const dynamicQuery = {}
    if(query) {
        dynamicQuery.title =  new RegExp(query, 'i');
    }
    if(userId) {
        dynamicQuery._id = userId
    }

    const sort = sortBy && sortType ? { [sortBy]: sortType } : { createdAt: 1 };
    console.log(sort);
    console.log(dynamicQuery);

    const videos = await Video.find(
        dynamicQuery
    )
    .sort(sort)
    .skip(parseInt(skip))
    .limit(parseInt(limit))

    if(!videos) {
        throw new ApiError(404, "No video found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Successfully fetched All the videos"))
    
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
    const video = await Video.findOneAndUpdate({
        _id: videoId
    },
    {
        $inc: { views: 1 }
    }, { new: true })

    if(!video) {
        throw new ApiError(404, "Video is not present in DB")
    }
 
    // Private video: Only publishing to authenticated user
    if(!video.isPublished) {
        if(!video.owner.equals(req?.user?._id)) {
            throw new ApiError(400, "This video is private and you do not have permission to view it.")
        }
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Succesfully fetched data"))

})

/* Problem: Update Video Info (Title, description, thumbnail) (Input)
1. check if user is login 
2. fetch videoId from params and data from body and thumbnail from files
3. create empty objecy toUpdate and add data to be update init.
4. save to toUpdate object to the database.

*/
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    const thumbnailLocalPath = req?.file?.path
    const toUpdate = {}
    let oldThumbnailUrl

    try {
        if(!req?.user?._id) {
            throw new ApiError(400, "User is not logged In")
        }
    
        if(!videoId) {
            throw new ApiError(400, "Video Id is not provided in Url")
        }
    
        // adding info in toUpdate object
        if(title) {
            toUpdate.title = title
        }
        if(description) {
            toUpdate.description = description
        }
        if(thumbnailLocalPath) {
            // fetching old thumbnail
            const video = await Video.findOne({
                _id: videoId,
                owner: req?.user?._id
            })

            if(!video) {
                throw new ApiError(400, "Video not present in DB")
            }
            oldThumbnailUrl = video.thumbnail

            // uploading thumbnail to cloudinary

            const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

            if(!uploadedThumbnail) {
                throw new ApiError(400, "Failed to Upload thumbnail on cloudinary")
            }
            console.log(uploadedThumbnail);
            toUpdate.thumbnail = uploadedThumbnail.url
        }
    
        if(!Object.keys(toUpdate).length) {
            throw new ApiError(400, "No data provided")
        }
        console.log(toUpdate);
        const video = await Video.findOneAndUpdate(
            {
                _id: videoId,
                owner: req?.user?._id
            },
            {
                ...toUpdate,
            }, { new: true }
        )
    
        if(!video) {
            throw new ApiError(400, "No Video Found")
        }
        // console.log(`video data is :${video}` );
        await destroyOnCloudinary(oldThumbnailUrl)
    
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Successfully Updated the data"))
    } catch (error) {
        throw new ApiError(400, `Error occour while updating Video: ${error}`)
    }
})

/*Problem: Delete A single Video */
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!req?.user?._id) {
        throw new ApiError(400, "User is not Logged In")
    }

    if(!videoId) {
        throw new ApiError(400, "Failed to fetch Video from url")
    }

    const deletedVideo = await Video.deleteOne({
        _id: videoId,
        owner: req?.user?._id
    })
    if(deletedVideo.deletedCount === 0) {
        throw new ApiError(400, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Successfully deleted video"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!req?.user?._id) {
        throw new ApiError(400, "User is not logged In")
    }

    if(!videoId) {
        throw new ApiError(400, "Video Id is not given in url")
    }

    const currentPublishStatus = await Video.findOne({
        _id: videoId,
        owner: req?.user?._id
    }).select("isPublished")

    const videotoggleStatus = await Video.findOneAndUpdate({
        _id: videoId,
        owner: req?.user?._id
    }, 
    {
        $set: {
            isPublished: !currentPublishStatus.isPublished
        }
    }, { new: true })

    if(!videotoggleStatus) {
        throw new ApiError(400, "Failed to toggle the status of video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videotoggleStatus, "Toggle publish successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}