import { Router } from 'express'
import multer from 'multer'
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js'
const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/image', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const result = await uploadBufferToCloudinary(req.file.buffer, 'mern-pos')
    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (e) { next(e) }
})

export default router