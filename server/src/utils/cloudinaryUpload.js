import cloudinary from '../config/cloudinary.js'

export function uploadBufferToCloudinary(buffer, folder = 'mern-pos') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
    stream.end(buffer)
  })
}