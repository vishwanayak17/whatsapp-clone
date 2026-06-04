const User = require("../models/User")

const onlineUsers = new Map()

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id)

        socket.on("userOnline", async (userId) => {
            onlineUsers.set(userId, socket.id)
            socket.userId = userId
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: Date.now()
            })
            io.emit("userStatusUpdate", { userId, isOnline: true })
        })

        socket.on("joinRoom", (userId) => {
            socket.join(userId)
            console.log(`User ${userId} joined room`)
        })

        socket.on("sendMessage", (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId)

            if (receiverSocketId) {
                io.to(data.receiverId).emit("receiveMessage", {
                    ...data,
                    status: "delivered"
                })
                io.to(data.senderId).emit("messageDelivered", {
                    messageId: data.messageId
                })
            } else {
                io.to(data.senderId).emit("messageDelivered", {
                    messageId: data.messageId,
                    status: "sent"
                })
            }
        })

        socket.on("messageSeen", (data) => {
            io.to(data.senderId).emit("messageSeen", {
                messageId: data.messageId
            })
        })

        socket.on("typing", (data) => {
            socket.to(data.receiverId).emit("typing", data)
        })

        socket.on("stopTyping", (data) => {
            socket.to(data.receiverId).emit("stopTyping", data)
        })

        socket.on("disconnect", async () => {
            const userId = socket.userId
            if (userId) {
                onlineUsers.delete(userId)
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: Date.now()
                })
                io.emit("userStatusUpdate", {
                    userId,
                    isOnline: false,
                    lastSeen: new Date()
                })
            }
            console.log("User Disconnected:", socket.id)
        })
    })
}