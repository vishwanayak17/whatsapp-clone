const Group = require("../models/Group")

// Group Create
const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body

        const group = await Group.create({
            name,
            description,
            admin: req.user.id,
            members: [...members, req.user.id]
        })

        const populatedGroup = await Group.findById(group._id)
            .populate("members", "-password")
            .populate("admin", "-password")

        res.status(201).json({
            message: "Group Created!",
            group: populatedGroup
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get All Groups
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            members: { $in: [req.user.id] }
        })
            .populate("members", "-password")
            .populate("admin", "-password")

        res.status(200).json({ groups })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get Group By ID
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate("members", "-password")
            .populate("admin", "-password")

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        res.status(200).json({ group })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Update Group (name, description)
const updateGroup = async (req, res) => {
    try {
        const { name, description } = req.body

        const group = await Group.findById(req.params.id)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can update group" })
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        )
            .populate("members", "-password")
            .populate("admin", "-password")

        res.status(200).json({
            message: "Group Updated!",
            group: updatedGroup
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Make Admin
const makeAdmin = async (req, res) => {
    try {
        const { userId } = req.body

        const group = await Group.findById(req.params.id)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can make others admin" })
        }

        group.admin = userId
        await group.save()

        const updatedGroup = await Group.findById(req.params.id)
            .populate("members", "-password")
            .populate("admin", "-password")

        res.status(200).json({
            message: "Admin transferred!",
            group: updatedGroup
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Add Member
const addMember = async (req, res) => {
    try {
        const { userId } = req.body

        const group = await Group.findById(req.params.id)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can add members" })
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "User already in group" })
        }

        group.members.push(userId)
        await group.save()

        const updatedGroup = await Group.findById(req.params.id)
            .populate("members", "-password")
            .populate("admin", "-password")

        res.status(200).json({
            message: "Member Added!",
            group: updatedGroup
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Remove Member
const removeMember = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can remove members" })
        }

        group.members = group.members.filter(
            member => member.toString() !== req.params.userId
        )
        await group.save()

        res.status(200).json({ message: "Member Removed!" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Delete Group
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can delete group" })
        }

        await Group.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: "Group Deleted!" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    makeAdmin,
    addMember,
    removeMember,
    deleteGroup
}