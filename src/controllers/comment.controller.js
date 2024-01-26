import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const skip = (parseInt(page) - 1 ) * parseInt(limit)

    if(!videoId) {
        throw new ApiError(400, "videoId not available")
    }

    const videoComments = await Comment.find({
        video: videoId
    })
    .sort({createdAt: 1})
    .skip(skip)
    .limit(parseInt(limit))

    if(!videoComments) {
        throw new ApiError(400, "VideoId is not valid")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videoComments, "Successfully fetched the data"))

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params
    // TODO: add a comment to a video

    if(!(content || videoId || req?.user?._id)){
        throw new ApiError(400, "Not enough data provided or user is not logged In")
    }

    const videoComment = await Comment.create({
        video: videoId,
        content,
        owner: req?.user?._id
    })

    if(!videoComment) {
        throw new ApiError(404, "Failed to saved video comment in db")
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, videoComment, "Successfully commented on video"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params
    // TODO: update a comment

    if(!(content || videoId || req?.user?._id)) {
        throw new ApiError(400, "Content, videoId or req.user is not available")
    }

    const updatedVideoComment = await Comment.findOneAndUpdate({
        video: videoId,
        owner: req?.user?._id
    },
    {
        content
    }, { new: true })

    if(!updatedVideoComment) {
        throw new ApiError(400, "videoId or owner is not valid")
    }

    return res
    .status
    .json(new ApiResponse(200, updatedVideoComment, "Video comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: delete a comment

    if(!( videoId || req?.user?._id )) {
        throw new ApiError(400, "VideoId or req.user not available")
    } 

    const deletedComment = await Comment.deleteOne({
        video: videoId,
        owner: req?.user?._id
    })

    if(!deleteComment) {
        throw new ApiError(400, "Failed to delete the video comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Successfully deleted the comments"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }