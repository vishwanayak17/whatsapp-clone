const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const {
    getAllUsers,
    getUserById,
    updateUser
} = require("../controllers/userController")

router.get("/", authMiddleware, getAllUsers)
router.get("/:id", authMiddleware, getUserById)
router.put("/:id", authMiddleware, updateUser)

module.exports = router