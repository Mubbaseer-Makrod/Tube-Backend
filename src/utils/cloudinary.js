import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async function(localFilePath) {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload
        (localFilePath,{ 
            resource_type: "auto" });
        console.log(localFilePath);
        // console.log("File Uploaded Successfully ", response);
        await fs.unlink(localFilePath, (error) => {
            if(error) {
                throw new ApiError(400, `Failed to delete local file after uploading ERROR:${error}`)
            }
        })
        return response
    } catch (error) {
        await fs.unlink(localFilePath) // remove locally saved file as the upload failed
        return null
    }
}

const destroyOnCloudinary = async function(fileUrl) {
    try {
        if(!fileUrl) {
            return null
        }
        const publicId = fileUrl.split('/').pop().split('.')[0];
        const response = await cloudinary.uploader.destroy(publicId)
        if(!response) {
            return null
        }
        console.log(response);
        return response
    } catch (error) {
        return null
    }
}

export {uploadOnCloudinary, destroyOnCloudinary}
