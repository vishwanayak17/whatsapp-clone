import { useState, useEffect, useRef } from "react"
import { FiArrowLeft, FiSend }  from "react-icons/fi"
import { BsEmojiSmile } from "react-icons/bs"
import { BsCheck, BsCheckAll } from "react-icons/bs"
import { MdDelete } from "react-icons/md"
import EmojiPicker from "emoji-picker-react"

function GroupChatArea({ group, currentUser, onBack, socket }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`group_messages_${group._id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    // Join group room
    socket.emit("joinGroup", group._id)

    socket.on("receiveGroupMessage", (data) => {
      setMessages(prev => {
        const updated = [...prev, data]
        localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
        return updated
      })
    })

    socket.on("groupTyping", (data) => {
      if (data.senderId !== currentUser._id) {
        setIsTyping(true)
        setTypingUser(data.senderName)
      }
    })

    socket.on("groupStopTyping", (data) => {
      if (data.senderId !== currentUser._id) {
        setIsTyping(false)
        setTypingUser("")
      }
    })

    return () => {
      socket.off("receiveGroupMessage")
      socket.off("groupTyping")
      socket.off("groupStopTyping")
    }
  }, [group._id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    socket.emit("sendGroupMessage", data)
    setMessages(prev => {
      const updated = [...prev, data]
      localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
      return updated
    })
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
    setMessages(prev => {
      const updated = prev.map((msg, i) =>
        i === index ? { ...msg, deleted: true, message: "" } : msg
      )
      localStorage.setItem(`group_messages_${group._id}`, JSON.stringify(updated))
      return updated
    })
  }

  const isAdmin = group.admin._id === currentUser._id

  return (
    <div className="flex flex-col h-full">

      {/* Navbar */}
      <div className="bg-[#25D366] p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-white mr-1">
            <FiArrowLeft size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#25D366] font-bold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-white text-sm font-semibold">{group.name}</h1>
            <p className="text-green-100 text-xs">
              {isTyping ? `${typingUser} typing...` : `${group.members.length} members`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-[#ECE5DD]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
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
          >
            <div className="relative max-w-[65%]">
              <div
                className={`px-3 py-2 rounded-lg shadow-sm ${msg.senderId === currentUser._id ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}
              >
                {/* Sender Name */}
                {msg.senderId !== currentUser._id && (
                  <p className="text-xs text-[#25D366] font-semibold mb-1">
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

              {/* Delete option */}
              {msg.senderId === currentUser._id && !msg.deleted && (
                <button
                  onClick={() => handleDeleteMessage(index)}
                  className="absolute -top-6 right-0 bg-white rounded-lg shadow px-2 py-1 text-red-500 text-xs hidden hover:flex items-center gap-1"
                >
                  <MdDelete size={14} />
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

    </div>
  )
}

export default GroupChatArea