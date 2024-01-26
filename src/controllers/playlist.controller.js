import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if (!( name || description )) {
        throw new ApiError(400, "Please Provide Both name and description")
    }

    if(!req?.user?._id) {
        throw new ApiError(400, "Unauthorized access user is not logged in")
    }

    const playlist = await Playlist.create({
        owner: req.user._id,
        name,
        description
    })

    if(!playlist) {
        throw new ApiError(400, "Failed to save playlist in DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created Succesfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId) {
        throw new ApiError(400, "User Id not provided in params")
    }

    const userPlaylists = await Playlist.find({
        owner: userId
    })

    if(!userPlaylists) {
        throw new ApiError(404, "Failed to fetch Playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists, "Successfully fetched user playlists"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId) {
        throw new ApiError(400, "play list id not provided in params")
    }

    const playlist = await Playlist.findById({
        _id: playlistId
    })

    if(!playlist) {
        throw new ApiError(400, "PlayList Id is not valid")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Succesfully fetched playlist from DB"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!(playlistId || videoId || req?.user?._id)) {
        throw new ApiError(400, "Playlist or video Id is not provided, Or User is Logged In")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req?.user?._id
    },
    {
        $push: {
            videos: videoId
        }
    }, { new: true })

    if(!updatePlaylist) {
        throw new ApiError(400, "PlayList is not present in DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "Successfully updated playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!(playlistId || videoId || req?.user?._id)) {
        throw new ApiError(400, "Either playlistId, VideoId is not provided or user is not looged IN")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate({
        owner: req?.user?._id,
        _id: playlistId
    },
    {
        $pull: {
            videos: videoId
        }
    }, { new: true })

    if(!updatePlaylist) {
        throw new ApiError(404, "Not Autorized to update Playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Successfully removed video from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!(playlistId || req?.user?._id)) {
        throw new ApiError(400, "Playlist Id is not available or User is not logged In")
    }

    const deletedPlaylist = await Playlist.deleteOne({
        _id: playlistId,
        owner: req?.user?._id
    })

    if(!deletedPlaylist) {
        throw new ApiError(400, "Unauthorized to delete the playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "SUccesfully deleted the palylist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    let toUpdate = {}

    if(!(playlistId || (name || description) || req?.user?._id)) {
        throw new ApiError(400, "Not enough data is given or user is not logged In")
    }

    if(name) {
        toUpdate.name = name
    }

    if(description) {
        toUpdate.description = description
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req?.user?._id
    }, 
    {
        ...toUpdate
    }, { new: true })
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}