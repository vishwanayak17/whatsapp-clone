const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1000) + "-" + file.originalname
        cb(null, uniqueName)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|mp4|mp3/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            cb(null, true)
        } else {
            cb(new Error("File type not allowed!"))
        }
    }
})

const uploadFiles = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" })
        }

        const fileData = req.files.map(file => ({
            url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            name: file.originalname,
            type: file.mimetype,
            size: file.size
        }))

        res.status(200).json({
            message: "Files uploaded successfully",
            files: fileData
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = { upload, uploadFiles }