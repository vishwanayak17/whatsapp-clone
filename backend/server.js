const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const http = require("http")
const { Server } = require("socket.io")

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const socketHandler = require("./socket/socketHandler")

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected 😄")
})
.catch((error) => {
    console.log("MongoDB Error:", error)
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

// Test Route
app.get("/", (req, res) => {
    res.send("Backend Running 😄")
})

// Socket.io
socketHandler(io)

// Port
const PORT = process.env.PORT || 5000

// Server Start
server.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`)
})