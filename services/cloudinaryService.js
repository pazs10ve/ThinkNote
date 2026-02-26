import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

/**
 * Uploads a local file to Cloudinary with retries, then deletes the local file.
 * 
 * @param {string} localFilePath - The absolute path to the local file
 * @param {string} folderName - The target folder in Cloudinary
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string>} - The secure URL of the uploaded image
 * @throws {Error} - If upload fails after all retries
 */
export const uploadToCloudinary = async (localFilePath, folderName, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: 'auto'
      });
      
      // Cleanup local file on success
      await fs.unlink(localFilePath).catch(err => console.error(`Failed to delete local file ${localFilePath}:`, err));
      
      return result.secure_url;
    } catch (error) {
      attempt++;
      console.error(`\n========================================`);
      console.error(`CLOUDINARY UPLOAD ATTEMPT ${attempt} FAILED`);
      console.error(`Local File: ${localFilePath}`);
      console.error(`Error Details:`, JSON.stringify(error, null, 2));
      console.error(`Error Message:`, error.message);
      console.error(`========================================\n`);
      
      if (attempt >= maxRetries) {
        // Cleanup local file on complete failure
        await fs.unlink(localFilePath).catch(err => console.error(`Failed to delete local file ${localFilePath} after final failure:`, err));
        throw new Error('upload failure');
      }
      
      // Simple backoff wait (e.g., 1s, 2s, 3s)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};
