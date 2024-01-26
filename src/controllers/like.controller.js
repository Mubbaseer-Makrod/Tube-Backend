import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!(videoId || req?.user?._id)) {
        throw new ApiError(400, "Not All data available or user is not login")
    }

    const videoLike = await Like.findOne({
        video: videoId,
        likedBy: req?.user?._id
    })

    // create a like
    if(!videoLike) { 
        const like = await Like.create({
            video: videoId,
            likedBy: req?.user?._id
        })

        if(!like) {
            throw new ApiError(400, "video Like Failed ")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, like, "Video Like Successfull"))
    }

    // delete a like and send response
    const deleteLike = await Like.deleteOne({
        video: videoId,
        likedBy: req?.user?._id
    })

    if(!deleteLike) {
        throw new ApiError(400, "Failed to delete the Like on video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deleteLike, "Successfully deleted the like"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!(commentId || req?.user?._id)) {
        throw new ApiError(400, "Not All data available or user is not login")
    }

    const commentLike = await Like.findOne({
        comment: commentId,
        likedBy: req?.user?._id
    })

    // create a like
    if(!commentLike) { 
        const like = await Like.create({
            comment: commentId,
            likedBy: req?.user?._id
        })

        if(!like) {
            throw new ApiError(400, "comment Like Failed ")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, like, "Comment Like Successfull"))
    }

    // delete a like and send response
    const deleteLike = await Like.deleteOne({
        comment: commentId,
        likedBy: req?.user?._id
    })

    if(!deleteLike) {
        throw new ApiError(400, "Failed to delete the Like on video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deleteLike, "Successfully deleted the like"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!(tweetId || req?.user?._id)) {
        throw new ApiError(400, "Not All data available or user is not login")
    }

    const tweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req?.user?._id
    })

    // create a like
    if(!tweetLike) { 
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req?.user?._id
        })

        if(!like) {
            throw new ApiError(400, "comment Like Failed ")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, like, "Comment Like Successfull"))
    }

    // delete a like and send response
    const deleteLike = await Like.deleteOne({
        tweet: tweetId,
        likedBy: req?.user?._id
    })

    if(!deleteLike) {
        throw new ApiError(400, "Failed to delete the Like on video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deleteLike, "Successfully deleted the like"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if(!req?.user?._id) {
        throw new ApiError(400, "User is not loggedIn")
    }

    const likedVideos = await Like.find({
        video: { $exists: true },
        likedBy: req?.user?._id
    })

    if(!likedVideos) {
        throw new ApiError(400, "Failed to fetch Liked Videos")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Succesfully fetched all the liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}