import { useEffect, useState } from "react"
import ChatNavbar from "./ChatNavbar"
import Messages from "./Messages"
import MessageInput from "./MessageInput"

function ChatArea({ selectedUser, messages, currentUser, onSendMessage, onDeleteMessage, onBack, socket }) {
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!selectedUser || !socket) return

    const handleTyping = (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(true)
      }
    }

    const handleStopTyping = (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(false)
      }
    }

    socket.on("typing", handleTyping)
    socket.on("stopTyping", handleStopTyping)

    return () => {
      socket.off("typing", handleTyping)
      socket.off("stopTyping", handleStopTyping)
    }
  }, [selectedUser, socket])

  useEffect(() => {
    if (!selectedUser || !messages.length) return

    messages.forEach(msg => {
      if (
        msg.senderId === selectedUser._id &&
        msg.status !== "seen" &&
        !msg.deleted
      ) {
        socket.emit("messageSeen", {
          messageId: msg.messageId,
          senderId: selectedUser._id
        })
      }
    })
  }, [messages, selectedUser])

  const handleTypingEmit = () => {
    socket.emit("typing", {
      senderId: currentUser._id,
      receiverId: selectedUser._id
    })
  }

  const handleStopTypingEmit = () => {
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
      <Messages
        messages={messages}
        currentUser={currentUser}
        onDeleteMessage={onDeleteMessage}
      />
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={handleTypingEmit}
        onStopTyping={handleStopTypingEmit}
      />
    </div>
  )
}

export default ChatArea