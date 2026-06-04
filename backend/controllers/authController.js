const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Signup
const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "Signup Successfull",
            user: newUser
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

// Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(200).json({
            message: "Login Successfull",
            token,
            user
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

// Get Me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports = {
    signupUser,
    loginUser,
    getMe
}