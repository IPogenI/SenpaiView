import express from "express"
import {registerUser, loginUser, getUser, getAllUsers, deleteUser} from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/user', protect, getUser)
router.get('/all', protect, getAllUsers)
router.delete('/:id', protect, deleteUser)

export default router;