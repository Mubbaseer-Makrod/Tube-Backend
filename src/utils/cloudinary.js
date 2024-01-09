import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { response } from "express";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async function(localFilePath) {
    try {
        const responce = await cloudinary.uploader.upload
        (localFilePath,{ 
            resource_type: "auto" });
        console.log("File Uploaded Successfully ", response.url);
        return response
    } catch (error) {
        fs.unlink(localFilePath) // remove locally saved file as the upload failed
        return null
    }
}

export {uploadOnCloudinary}
