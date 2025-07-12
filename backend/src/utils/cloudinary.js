import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
        secure:true,
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadOnCloudinary = async(localFilesPath) => {
    try {
        if(!localFilesPath) return null;
        const fileUploaded = await cloudinary.uploader.upload(localFilesPath, {
            resource_type:"auto"
        })
        if(fileUploaded){
            fs.unlinkSync(localFilesPath)
        }
        console.log("file uploaded: ",fileUploaded.url)
    } catch (error) {
            fs.unlinkSync(localFilesPath)
            return null      
    }
}

export default uploadOnCloudinary;