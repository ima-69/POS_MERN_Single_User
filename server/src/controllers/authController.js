import { signup, login, getUserById } from '../services/authService.js'
import { signToken, cookieOptions } from '../utils/jwt.js'

const safe = (userDoc) => {
  const { password, __v, ...rest } = userDoc.toObject()
  return rest
}

export async function registerCtrl(req, res, next) {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'username and password are required' })
    const user = await signup({ username, password })
    const token = signToken({ id: user._id, role: user.role })
    res.cookie('token', token, cookieOptions)
    res.status(201).json({ user: safe(user), token })
  } catch (err) { next(err) }
}

export async function loginCtrl(req, res, next) {
  try {
    const { username, password } = req.body
    const user = await login({ username, password })
    const token = signToken({ id: user._id, role: user.role })
    res.cookie('token', token, cookieOptions)
    res.json({ user: safe(user), token })
  } catch (err) { next(err) }
}

export async function meCtrl(req, res, next) {
  try {
    const user = await getUserById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: safe(user) })
  } catch (err) { next(err) }
}

export async function logoutCtrl(req, res) {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 })
  res.json({ message: 'Logged out' })
}