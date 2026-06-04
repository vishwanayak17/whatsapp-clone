const User = require("../models/User")

// Sare Users lo
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user.id }
        }).select("-password")

        res.status(200).json({ users })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Ek User ki Profile
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({ user })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Profile Update
const updateUser = async (req, res) => {
    try {
        const { name, about, phone } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, about, phone },
            { returnDocument: "after" }
        ).select("-password")

        res.status(200).json({
            message: "Profile Updated",
            user: updatedUser
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
}