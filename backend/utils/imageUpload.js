// backend/utils/imageUpload.js
const axios = require('axios');
const FormData = require('form-data');

const uploadToImgBB = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append('image', imageData);
    
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
        delete_url: response.data.data.delete_url
      };
    } else {
      return {
        success: false,
        message: 'Image upload failed'
      };
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      message: error.message || 'Image upload failed'
    };
  }
};

module.exports = { uploadToImgBB };