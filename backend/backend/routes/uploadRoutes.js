const express = require('express')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const cloudinary = require('../config/cloudinary')

const router = express.Router()

router.post(
  '/image',
  protect,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded',
        })
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'amri',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )

        stream.end(req.file.buffer)
      })

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      })
    } catch (error) {
      console.error('Cloudinary upload error:', error)

      res.status(500).json({
        success: false,
        message: 'Image upload failed',
      })
    }
  }
)

module.exports = router