import { useState, useEffect } from "react"
import { FiX, FiCheck } from "react-icons/fi"
import api from "../api/axios"

function CreateGroup({ onClose, onGroupCreated }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [users, setUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users")
        setUsers(res.data.users)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUsers()
  }, [])

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(prev => prev.filter(id => id !== userId))
    } else {
      setSelectedMembers(prev => [...prev, userId])
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter group name!")
      return
    }
    if (selectedMembers.length === 0) {
      alert("Please select at least one member!")
      return
    }
    try {
      setLoading(true)
      const res = await api.post("/groups", {
        name,
        description,
        members: selectedMembers
      })
      onGroupCreated(res.data.group)
      onClose()
    } catch (err) {
      alert("Error creating group!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#25D366] p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">New Group</h2>
          <button onClick={onClose} className="text-white">
            <FiX size={22} />
          </button>
        </div>

        {/* Group Name */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Group Name"
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#25D366] text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Group Description (optional)"
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#25D366] text-sm mt-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Members */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3 font-semibold">
            SELECT MEMBERS ({selectedMembers.length} selected)
          </p>
          <div className="max-h-60 overflow-y-auto">
            {users.map(user => (
              <div
                key={user._id}
                onClick={() => toggleMember(user._id)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-xl transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium flex-1">{user.name}</p>
                {selectedMembers.includes(user._id) && (
                  <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                    <FiCheck className="text-white" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-[#25D366] text-white p-3 rounded-xl hover:bg-[#128C7E] transition font-semibold"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default CreateGroup