import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import process from 'process';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            ...options,
            resource_type: 'auto'
        });

        // Delete the temporary file
        fs.unlinkSync(filePath);

        return result;
    } catch (error) {
        // Delete the temporary file in case of error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    await cloudinary.uploader.destroy(publicId);
}; 