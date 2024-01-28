import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // const { channelId } = req.params
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channel = await Video.aggregate([
        {
            $group: {
                _id: null,
                owner: { $addToSet: new mongoose.Types.ObjectId(req?.user?._id) } ,
                totalViews: { $sum: "$views"},
                totalVideos: { $sum: 1 }
            }
        }
    ])
    console.log(channel);
    res.status(200).json(new ApiResponse(200, channel, "Succesfully fethed channel stats"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    if(!req?.user?._id) {
        throw new ApiError(400, "User is not logged In")
    }

    const videos = await Video.find({
        owner: req?.user?._id
    })

    if(!videos) {
        throw new ApiError(404, "Failed to video data from DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched succesfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }