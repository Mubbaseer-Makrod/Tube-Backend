import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId, // one who is sunbscribing
            ref: "User"
        },
        channel : {
            type: mongoose.Schema.Types.ObjectId, // to whom one is subscribing
            ref: "User"
        },
                
    }, 
    { timestamps: true }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)