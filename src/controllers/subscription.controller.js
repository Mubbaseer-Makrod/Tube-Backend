import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

/* Problem: Toggle the subscription
1. fetch channel Id and userId
2. search subscription table for channelId and userId
3. if not found create a new subscription, send res 
4. if not then delete the old subscription, send res 
*/
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId) {
        throw new ApiError(400, "ChannelId is not provided")
    }

    if(!req?.user?._id) {
        throw new ApiError(400, "User is not logged In")
    }

    const oldSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req?.user?._id
    })

    // create a new Subscription and send res
    if(!oldSubscription) {
        // create a new Subscription and send res
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req?.user?._id
        })

        if (!newSubscription) {
            throw new ApiError(400, "Failed to create  a New Subscription")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed Succesfully"))
    }

    // delete the old subscriptin and send res
    const deleteSubscription = await Subscription.deleteOne({
        channel: channelId,
        subscriber: req?.user?._id
    })

    if(deleteSubscription.deletedCount === 0) {
        throw new ApiError(404, "Failed to delete the subscription")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deleteSubscription, "UnSubscribed Succesfully"))
})

// controller to return subscriber list of a channel
/*
1. get channelId from params
2. search Subscription table with channel Id and select "-channel"
3. return the response
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if(!subscriberId) {
        throw new ApiError(400, "No channel Id present in params")
    }

    const subscriberList = await Subscription.find({
        channel: subscriberId
    }).select("-channel")

    console.log(subscriberList);

    return res
    .status(200)
    .json(new ApiResponse(200, subscriberList, "Succesfully fetched the subscriber"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log(req.params);

    if(!channelId) {
        throw new ApiError(400, "No subscriber Id present in params")
    }

    const channelList = await Subscription.find({
        subscriber: channelId
    }).select("-subscriber")

    console.log(channelList);
    return res
    .status(200)
    .json(new ApiResponse(200, channelList, "Succesfully fetched the subscriber"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}