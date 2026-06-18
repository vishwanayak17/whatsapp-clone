import { useEffect, useState } from "react"
import ChatNavbar from "./ChatNavbar"
import Messages from "./Messages"
import MessageInput from "./MessageInput"

function ChatArea({
  selectedUser,
  messages,
  currentUser,
  onSendMessage,
  onDeleteMessage,
  onBack,
  socket,
  onSendAudio,
  onSendImage,
  onVideoCall,
  onVoiceCall
}) {

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
        msg.status === "delivered" &&
        !msg.deleted
      ) {
        socket.emit("messageSeen", {
          messageId: msg.messageId,
          senderId: selectedUser._id
        })
      }
    })
  }, [messages])

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
    <div className="flex flex-col h-full min-h-0">

      <ChatNavbar
        selectedUser={selectedUser}
        onBack={onBack}
        isTyping={isTyping}
        onVideoCall={onVideoCall}
        onVoiceCall={onVoiceCall}
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
        onSendAudio={onSendAudio}
        onSendImage={onSendImage}
      />

    </div>
  )
}

export default ChatArea