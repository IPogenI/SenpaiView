import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/User.js"

export const protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            const user = await User.findOne({ _id: decoded.id }).select("-password")
            
            if (!user) {
                return res.status(401).json({ message: "User not found" })
            }

            req.user = user
            next()
        } catch (error) {
            console.error('Auth error:', error)
            return res.status(401).json({ message: "Not authorized, token failed" })
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" })
    }
})