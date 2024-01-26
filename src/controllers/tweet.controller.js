import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if(!content) {
        throw new ApiError(400, "Please Provide content")
    }

    if(!req?.user?._d) {
        throw new ApiError(400, "User Must be Login")
    }

    const tweet = await Tweet.create({
        content,
        owner: req?.user?._id
    })

    if (!tweet) {
        throw new ApiError(404, "Failed to save tweet in DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweeted Successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    
    if(!userId) {
        throw new ApiError(400, "Please provide user Id in params")
    }

    const userTweets = await Tweet.find({
        owner: userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Succesfully fetched all the tweets"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    const { tweetId } = req.params

    if(!(tweetId || content)) {
        throw new ApiError(400, "Please provide both tweet and content")
    }

    if(!req?.user?._id) {
        throw new ApiError(400, "User Must be login")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate({
        _id: tweetId,
        owner: req?.user?._id
    },
    {
        $set: {
            content
        }
    }, { new: true })

    if(!updatedTweet) {
        throw new ApiError("404", "Unauthorized access either tweetId or owner is invalid")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet Updated Succesfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!(req?.user?._id  || tweetId)) {
        throw new ApiError(400, "Either user is not login or tweetid is not provided")
    }

    const deletedTweet = await Tweet.deleteOne({
        _id: tweetId,
        owner: req?.user?._id
    })

    if(!deletedTweet) {
        throw new ApiError(404, "Unauthorized acess either videid or owner is wrong")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Successfully deleted the tweet"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}