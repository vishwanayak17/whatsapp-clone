const multer = require("multer")
const path = require("path")

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            cb(null, true)
        } else {
            cb(new Error("Only images are allowed!"))
        }
    }
})

const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" })
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

        res.status(200).json({
            message: "Image uploaded successfully",
            url: fileUrl
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = { upload, uploadImage }