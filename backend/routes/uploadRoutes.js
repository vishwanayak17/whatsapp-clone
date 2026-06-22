const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const { upload, uploadFiles } = require("../controllers/uploadController")

router.post("/", authMiddleware, upload.array("files", 10), uploadFiles)

module.exports = router