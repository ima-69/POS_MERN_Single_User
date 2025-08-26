import User from '../models/User.js'

export const createUser = (data) => User.create(data)
export const findByUsername = (username) => User.findOne({ username })
export const findById = (id) => User.findById(id)