import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

// Mongoose-agregation-pipeline {Helps write complex queries}

const videoSchema = mongoose.Schema({
    videoFile: {
        type: String, // cloudanary url
        required: true
    },
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        require: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: true
    }
},{timestamp: true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)