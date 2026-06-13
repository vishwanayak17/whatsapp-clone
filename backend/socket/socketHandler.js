const User = require("../models/User")

const onlineUsers = new Map()

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id)

        socket.on("joinRoom", (userId) => {
            socket.join(userId)
            socket.userId = userId
        })

        socket.on("userOnline", async (userId) => {
            onlineUsers.set(userId, socket.id)
            socket.userId = userId
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: Date.now()
            })
            io.emit("userStatusUpdate", { userId, isOnline: true })
            
            // Jab user online ho → sab ko notify karo
            io.emit("userCameOnline", { userId })
        })

        socket.on("sendMessage", (data) => {
            if (data.type === "audio" && data.audio) {
                if (data.audio.length > 10000000) {
                    socket.emit("messageSent", { messageId: data.messageId })
                    return
                }
            }

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
                io.to(data.senderId).emit("messageSent", {
                    messageId: data.messageId
                })
            }
        })

        socket.on("joinGroup", (groupId) => {
            socket.join(groupId)
            console.log(`User joined group: ${groupId}`)
        })

        socket.on("sendGroupMessage", (data) => {
            io.to(data.groupId).emit("receiveGroupMessage", data)
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

        socket.on("groupTyping", (data) => {
            socket.to(data.groupId).emit("groupTyping", data)
        })

        socket.on("groupStopTyping", (data) => {
            socket.to(data.groupId).emit("groupStopTyping", data)
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