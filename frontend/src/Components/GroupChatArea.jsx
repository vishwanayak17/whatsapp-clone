import { useState, useEffect, useRef } from "react"
import { FiArrowLeft, FiSend, FiX, FiUsers, FiEdit2, FiCheck } from "react-icons/fi"
import { BsEmojiSmile } from "react-icons/bs"
import { MdDelete, MdAdminPanelSettings } from "react-icons/md"
import EmojiPicker from "emoji-picker-react"
import api from "../api/axios"

function GroupChatArea({ group, currentUser, onBack, socket }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`group_messages_${group._id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [groupData, setGroupData] = useState(group)
  const [allUsers, setAllUsers] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [hoveredMsg, setHoveredMsg] = useState(null)
  const [editName, setEditName] = useState(false)
  const [editDesc, setEditDesc] = useState(false)
  const [newName, setNewName] = useState(group.name)
  const [newDesc, setNewDesc] = useState(group.description || "")
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  const isAdmin = groupData.admin._id === currentUser._id ||
    groupData.admin === currentUser._id

  useEffect(() => {
    socket.emit("joinGroup", group._id)

    const handleGroupMessage = (data) => {
      if (data.senderId !== currentUser._id) {
        setMessages(prev => {
          const isDuplicate = prev.some(m => m.messageId === data.messageId)
          if (isDuplicate) return prev
          const updated = [...prev, data]
          localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
          return updated
        })
      }
    }

    const handleGroupTyping = (data) => {
      if (data.senderId !== currentUser._id) {
        setIsTyping(true)
        setTypingUser(data.senderName)
      }
    }

    const handleGroupStopTyping = (data) => {
      if (data.senderId !== currentUser._id) {
        setIsTyping(false)
        setTypingUser("")
      }
    }

    socket.on("receiveGroupMessage", handleGroupMessage)
    socket.on("groupTyping", handleGroupTyping)
    socket.on("groupStopTyping", handleGroupStopTyping)

    return () => {
      socket.off("receiveGroupMessage", handleGroupMessage)
      socket.off("groupTyping", handleGroupTyping)
      socket.off("groupStopTyping", handleGroupStopTyping)
    }
  }, [group._id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users")
        setAllUsers(res.data.users)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUsers()
  }, [])

  const handleSend = () => {
    if (!message.trim()) return
    const data = {
      messageId: Date.now().toString(),
      groupId: group._id,
      senderId: currentUser._id,
      senderName: currentUser.name,
      message,
      time: new Date(),
      deleted: false
    }
    setMessages(prev => {
      const updated = [...prev, data]
      localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
      return updated
    })
    socket.emit("sendGroupMessage", data)
    setMessage("")
    setShowEmoji(false)
    socket.emit("groupStopTyping", {
      groupId: group._id,
      senderId: currentUser._id
    })
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    socket.emit("groupTyping", {
      groupId: group._id,
      senderId: currentUser._id,
      senderName: currentUser.name
    })
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit("groupStopTyping", {
        groupId: group._id,
        senderId: currentUser._id
      })
    }, 1500)
  }

  const handleDeleteMessage = (index) => {
    if (!window.confirm("Delete this message?")) return
    setMessages(prev => {
      const updated = prev.map((msg, i) =>
        i === index ? { ...msg, deleted: true, message: "" } : msg
      )
      localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
      return updated
    })
  }

  const handleUpdateGroup = async () => {
    try {
      const res = await api.put(`/groups/${group._id}`, {
        name: newName,
        description: newDesc
      })
      setGroupData(res.data.group)
      setEditName(false)
      setEditDesc(false)
      alert("Group updated!")
    } catch (err) {
      alert(err.response?.data?.message || "Error updating group!")
    }
  }

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm("Make this member admin? You will lose admin rights!")) return
    try {
      const res = await api.put(`/groups/${group._id}/make-admin`, { userId })
      setGroupData(res.data.group)
      alert("Admin transferred!")
    } catch (err) {
      alert(err.response?.data?.message || "Error!")
    }
  }

  const handleAddMember = async (userId) => {
    try {
      const res = await api.post(`/groups/${group._id}/members`, { userId })
      setGroupData(res.data.group)
      alert("Member added!")
    } catch (err) {
      alert(err.response?.data?.message || "Error adding member!")
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return
    try {
      await api.delete(`/groups/${group._id}/members/${userId}`)
      setGroupData(prev => ({
        ...prev,
        members: prev.members.filter(m => (m._id || m) !== userId)
      }))
      alert("Member removed!")
    } catch (err) {
      alert(err.response?.data?.message || "Error removing member!")
    }
  }

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return
    try {
      await api.delete(`/groups/${group._id}/members/${currentUser._id}`)
      onBack()
    } catch (err) {
      alert("Error leaving group!")
    }
  }

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return
    try {
      await api.delete(`/groups/${group._id}`)
      onBack()
    } catch (err) {
      alert("Error deleting group!")
    }
  }

  const memberIds = groupData.members.map(m => m._id || m)
  const nonMembers = allUsers.filter(u => !memberIds.includes(u._id))

  return (
    <div className="flex flex-col h-full">

      {/* Navbar */}
      <div className="bg-[#25D366] p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-white mr-1">
            <FiArrowLeft size={22} />
          </button>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowGroupInfo(true)}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-500 font-bold text-lg">
              {groupData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white text-sm font-semibold">{groupData.name}</h1>
              <p className="text-green-100 text-xs">
                {isTyping ? `${typingUser} typing...` : `${groupData.members.length} members`}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowGroupInfo(true)}
          className="text-white hover:bg-[#128C7E] p-2 rounded-full transition"
        >
          <FiUsers size={20} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-[#ECE5DD]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
        onClick={() => setShowEmoji(false)}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white px-6 py-3 rounded-full shadow-sm">
              <p className="text-gray-400 text-sm">No messages yet. Say Hi! 👋</p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-2 ${msg.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
            onMouseEnter={() => setHoveredMsg(index)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <div className="relative max-w-[65%]">
              <div className={`px-3 py-2 rounded-lg shadow-sm ${msg.senderId === currentUser._id ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                {msg.senderId !== currentUser._id && (
                  <p className="text-xs text-purple-500 font-semibold mb-1">
                    {msg.senderName}
                  </p>
                )}
                {msg.deleted ? (
                  <p className="text-sm text-gray-400 italic">🚫 This message was deleted</p>
                ) : (
                  <p className="text-sm text-gray-800 break-words">{msg.message}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-[10px] text-gray-400">
                    {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {hoveredMsg === index && msg.senderId === currentUser._id && !msg.deleted && (
                <button
                  onClick={() => handleDeleteMessage(index)}
                  className="absolute -top-6 right-0 bg-white rounded-lg shadow px-2 py-1 text-red-500 text-xs flex items-center gap-1 hover:bg-red-50 transition"
                >
                  <MdDelete size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t relative">
        {showEmoji && (
          <div className="absolute bottom-16 left-2 z-10">
            <EmojiPicker
              onEmojiClick={(emojiData) => setMessage(prev => prev + emojiData.emoji)}
              height={350}
              width={300}
            />
          </div>
        )}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-gray-500 hover:text-[#25D366] transition text-xl flex-shrink-0"
          >
            <BsEmojiSmile />
          </button>
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none"
            value={message}
            onChange={handleChange}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-[#25D366] text-white p-2 rounded-full hover:bg-[#128C7E] transition flex-shrink-0"
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="bg-[#25D366] p-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-white font-semibold">Group Info</h2>
              <button onClick={() => setShowGroupInfo(false)} className="text-white">
                <FiX size={22} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">

              {/* Group Details */}
              <div className="flex flex-col items-center py-6 bg-gray-50 border-b">
                <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {groupData.name.charAt(0).toUpperCase()}
                </div>

                {/* Edit Name */}
                <div className="flex items-center gap-2 w-full px-6 justify-center">
                  {editName ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border-b border-[#25D366] focus:outline-none text-center font-semibold text-gray-800 text-lg w-48"
                      autoFocus
                    />
                  ) : (
                    <h2 className="font-semibold text-gray-800 text-lg">{groupData.name}</h2>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (editName) handleUpdateGroup()
                        else setEditName(true)
                      }}
                      className="text-[#25D366]"
                    >
                      {editName ? <FiCheck size={18} /> : <FiEdit2 size={16} />}
                    </button>
                  )}
                </div>

                {/* Edit Description */}
                <div className="flex items-center gap-2 w-full px-6 justify-center mt-2">
                  {editDesc ? (
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="border-b border-[#25D366] focus:outline-none text-center text-sm text-gray-500 w-48"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {groupData.description || "Add group description"}
                    </p>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (editDesc) handleUpdateGroup()
                        else setEditDesc(true)
                      }}
                      className="text-[#25D366]"
                    >
                      {editDesc ? <FiCheck size={18} /> : <FiEdit2 size={14} />}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">{groupData.members.length} members</p>
              </div>

              {/* Members */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-semibold">
                    MEMBERS ({groupData.members.length})
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddMember(!showAddMember)}
                      className="text-xs text-[#25D366] font-semibold"
                    >
                      {showAddMember ? "Cancel" : "+ Add Member"}
                    </button>
                  )}
                </div>

                {/* Add Member */}
                {showAddMember && nonMembers.length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">Select to add:</p>
                    {nonMembers.map(user => (
                      <div
                        key={user._id}
                        onClick={() => handleAddMember(user._id)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-800">{user.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Members List */}
                {groupData.members.map(member => {
                  const memberId = member._id || member
                  const memberName = member.name || "Unknown"
                  const isGroupAdmin = groupData.admin._id === memberId ||
                    groupData.admin === memberId
                  const isMe = memberId === currentUser._id

                  return (
                    <div key={memberId} className="flex items-center gap-3 py-3 border-b">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800">{memberName}</p>
                          {isGroupAdmin && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <MdAdminPanelSettings size={12} />
                              Admin
                            </span>
                          )}
                          {isMe && (
                            <span className="text-xs text-gray-400">(You)</span>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      {isAdmin && !isMe && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isGroupAdmin && (
                            <button
                              onClick={() => handleMakeAdmin(memberId)}
                              className="text-xs text-blue-500 hover:bg-blue-50 px-2 py-1 rounded-lg transition"
                              title="Make Admin"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(memberId)}
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="p-4 border-t flex flex-col gap-3">
                {!isAdmin && (
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full text-red-500 py-3 rounded-xl hover:bg-red-50 transition text-sm font-semibold border border-red-200"
                  >
                    🚪 Leave Group
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDeleteGroup}
                    className="w-full text-red-500 py-3 rounded-xl hover:bg-red-50 transition text-sm font-semibold border border-red-200"
                  >
                    🗑️ Delete Group
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GroupChatArea