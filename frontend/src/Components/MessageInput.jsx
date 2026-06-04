import { useState, useRef } from "react"
import { FiSend } from "react-icons/fi"
import { BsEmojiSmile } from "react-icons/bs"
import EmojiPicker from "emoji-picker-react"

function MessageInput({ onSendMessage, onTyping, onStopTyping }) {
  const [message, setMessage] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const typingTimeout = useRef(null)

  const handleSend = () => {
    if (!message.trim()) return
    onSendMessage(message)
    setMessage("")
    setShowEmoji(false)
    onStopTyping()
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    onTyping()
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      onStopTyping()
    }, 1500)
  }

  const handleEmoji = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji)
  }

  return (
    <div className="bg-white border-t relative">
      {showEmoji && (
        <div className="absolute bottom-16 left-2 z-10">
          <EmojiPicker onEmojiClick={handleEmoji} height={350} width={300} />
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
  )
}

export default MessageInput