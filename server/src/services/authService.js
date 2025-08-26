import { createUser, findByUsername, findById } from '../repositories/userRepo.js'

export async function signup({ username, password }) {
  const exists = await findByUsername(username)
  if (exists) {
    const err = new Error('Username already exists')
    err.status = 400
    throw err
  }
  const user = await createUser({ username, password })
  return user
}

export async function login({ username, password }) {
  const user = await findByUsername(username)
  if (!user) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }
  const ok = await user.comparePassword(password)
  if (!ok) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }
  return user
}

export async function getUserById(id) { return findById(id) }