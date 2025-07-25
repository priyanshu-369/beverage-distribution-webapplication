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
            return {
                url: fileUploaded.url,
                publicId: fileUploaded.public_id
            }
        }else{
            fs.unlinkSync(localFilesPath)
            console.log("Cloudinary upload did not return a URL despite no error.")
        }
        console.log("file uploaded: ",fileUploaded.url)
    } catch (error) {
            fs.unlinkSync(localFilesPath)
            return null      
    }
}

const destroyFromCloudinary = async(publicId) => {
  try {
      if(!publicId) return null;
  
      const destroyedFile = await cloudinary.uploader.destroy(publicId)
      if(destroyedFile){
        console.log(`destroyed file from cloudinary ${publicId}: ${destroyedFile.result}`)
        return destroyedFile
      }
  } catch (error) {
    console.error(`error destroying image with public id ${publicId}`)
    return {
        publicId,
        status: "failed",
        error: error.message
    }
  }
}
export { 
    uploadOnCloudinary,
    destroyFromCloudinary
}