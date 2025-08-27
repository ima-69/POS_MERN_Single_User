import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.token
  
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}