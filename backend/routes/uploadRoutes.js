const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const { upload, uploadImage } = require("../controllers/uploadController")

router.post("/", authMiddleware, upload.single("image"), uploadImage)

module.exports = router