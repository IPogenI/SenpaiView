import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import userModel from "../models/User.js"

export const protect = asyncHandler(async (req, res, next) =>{
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            //  Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //  Get user from the token
            req.user = await userModel.findOne({ _id: decoded.id }).select("-password")
            if (!req.user) {
                res.status(401)
                throw new Error("User not found")
            }

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error("Not Authorized!")
        }
    }

    if(!token){
        res.status(401)
        throw new Error("Not Authorized, There is no token")
    }
})