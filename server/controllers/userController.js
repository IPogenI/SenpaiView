import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import asyncHandler from "express-async-handler"
import User from "../models/User.js";
import userModel from "../models/User.js";

// @desc Register new user
// @route POST /api/users
// @access Public


export const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please add all fields")
    }

    // Checl if user exists
    const userExists = await User.findOne({email})
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const user = await User.create({
        name,
        email, 
        password: hashedPassword
    })

    if(user){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        }) 
    } else {
        res.status(400)
        throw new Error("Invalid User Data")
    }

})


// @desc Authenticate a user
// @route POST /api/users/login
// @access Public


export const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    // Check for user email
    const user = await userModel.findOne({email})

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error("Invalid User Credentials")
    }

})


// @desc Get user data
// @route GET /api/users/me
// @access Private


export const getUser = asyncHandler(async (req, res) => {
    const user = await userModel.findOne({ _id: req.user.id })
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    const { _id, name, email, isAdmin } = user

    res.status(200).json({
        _id: _id,
        name,
        email,
        isAdmin
    })
}) 


// @desc Get all users (admin only)
// @route GET /api/users/all
// @access Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
        res.status(403);
        throw new Error("Not authorized as admin");
    }

    const users = await userModel.find().select("-password");
    res.status(200).json(users);
});


// @desc Delete a user (admin only)
// @route DELETE /api/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
        res.status(403);
        throw new Error("Not authorized as admin");
    }

    const user = await userModel.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    await userModel.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "User removed" });
});


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

