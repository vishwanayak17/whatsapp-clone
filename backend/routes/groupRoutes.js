const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const {
    createGroup,
    getGroups,
    getGroupById,
    addMember,
    removeMember,
    deleteGroup
} = require("../controllers/groupController")

router.post("/", authMiddleware, createGroup)
router.get("/", authMiddleware, getGroups)
router.get("/:id", authMiddleware, getGroupById)
router.post("/:id/members", authMiddleware, addMember)
router.delete("/:id/members/:userId", authMiddleware, removeMember)
router.delete("/:id", authMiddleware, deleteGroup)

module.exports = router