// import { Subscription } from "../models/subscription.model.js";
// import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponce.js";
// import { asyncHandler } from "../utils/asyncHandler.js";


// /* problem: subscribe user to channel (if already subscribe make it unsubscribe)
// 1. fetch channelname from params and userId from req
// 2. Find channelId from db through channelname
// 3. use user aggregated pipeline to find subscribe is already suscribed or not
// 4. if present make to user unsubscribed (return Unsubscribed)
// 5. if Not make the user subscribed
// 6. return the sunscription.
// */
// const channelSubscription = asyncHandler(async(req, res) => {
//     try {
//         const { channelName } = req?.params
//         console.log(channelName)
//         console.log(req?.user._id)
    
//         const channel = await User.findOne({
//             username: channelName
//         })
//         console.log(channel._id)
    
//         if(!channelName?.trim()) {
//             throw new ApiError(400, "Channel is not given in url")
//         }
    
//         if(!channel) {
//             throw new ApiError(400, "Channel is not present, wrong channel name in Url")
//         }
    
//         const subscription = await Subscription.findOne({
//             channel: channel._id,
//             subscriber: req?.user?._id 
//         })
    
//         if (!subscription) {
//             console.log("!subscription");
//             const  newSubscription = await Subscription.create({
//                 channel: channel._id,
//                 subscriber: req?.user?._id
//             })
    
//             if(!newSubscription) {
//                 throw new ApiError(400, "Failed to save new Subscription to database")
//             }
    
//             return res.status(200).json(new ApiResponse(200, newSubscription, "User Subscribed Successfully"))
//         }
//         console.log("Subscription");
//         const deleteSubscription = await Subscription.deleteOne({
//             channel: channel._id,
//             subscriber: req?.user?._id
//         })
//         console.log("delete Subscription Successfull");
//         if(!deleteSubscription.deletedCount) {
//             throw new ApiError(400, deleteSubscription.deletedCount, "Failed to delete the Subscription in database")
//         }
    
//         return res.status(200).json(new ApiResponse(200, deleteSubscription.deletedCount, "User has been unSubscribed"))
//     } catch (error) {
//         throw new ApiError(400, "Error while subscribing")
//     }
    
// })

// export {channelSubscription}

import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}