import { useEffect, useRef } from "react"
import { BsCheck, BsCheckAll } from "react-icons/bs"

function Messages({ messages, currentUser }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderTick = (msg) => {
    if (msg.senderId !== currentUser._id) return null
    if (msg.status === "seen") {
      return <BsCheckAll className="text-blue-500" size={16} />
    } else if (msg.status === "delivered") {
      return <BsCheckAll className="text-gray-400" size={16} />
    } else {
      return <BsCheck className="text-gray-400" size={16} />
    }
  }

  return (
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
          <div className={`px-3 py-2 rounded-lg max-w-[65%] shadow-sm ${msg.senderId === currentUser._id ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
            <p className="text-sm text-gray-800 break-words">{msg.message}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <p className="text-[10px] text-gray-400">
                {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              {renderTick(msg)}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

export default Messages