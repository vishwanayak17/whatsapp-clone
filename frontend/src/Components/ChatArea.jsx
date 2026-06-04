import { useEffect, useState } from "react"
import ChatNavbar from "./ChatNavbar"
import Messages from "./Messages"
import MessageInput from "./MessageInput"

function ChatArea({ selectedUser, messages, currentUser, onSendMessage, onBack, socket }) {
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!selectedUser) return

    socket.on("typing", (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(true)
      }
    })

    socket.on("stopTyping", (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(false)
      }
    })

    // Messages seen mark karo
    messages.forEach(msg => {
      if (msg.senderId === selectedUser._id && msg.status !== "seen") {
        socket.emit("messageSeen", {
          messageId: msg.messageId,
          senderId: selectedUser._id
        })
      }
    })

    return () => {
      socket.off("typing")
      socket.off("stopTyping")
    }
  }, [selectedUser, messages])

  const handleTyping = () => {
    socket.emit("typing", {
      senderId: currentUser._id,
      receiverId: selectedUser._id
    })
  }

  const handleStopTyping = () => {
    socket.emit("stopTyping", {
      senderId: currentUser._id,
      receiverId: selectedUser._id
    })
  }

  return (
    <div className="flex flex-col h-full">
      <ChatNavbar
        selectedUser={selectedUser}
        onBack={onBack}
        isTyping={isTyping}
      />
      <Messages messages={messages} currentUser={currentUser} />
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  )
}

export default ChatArea