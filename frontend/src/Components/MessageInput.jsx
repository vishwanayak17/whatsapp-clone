import { useState, useRef } from "react"
import { FiSend, FiImage } from "react-icons/fi"
import { BsEmojiSmile } from "react-icons/bs"
import EmojiPicker from "emoji-picker-react"
import AudioMessage from "./AudioMessage"
import api from "../api/axios"

function MessageInput({ onSendMessage, onTyping, onStopTyping, onSendAudio, onSendImage }) {
  const [message, setMessage] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const typingTimeout = useRef(null)
  const fileInputRef = useRef(null)

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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large! Max 10MB allowed.")
      return
    }

    const formData = new FormData()
    formData.append("image", file)

    try {
      setUploading(true)
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      onSendImage(res.data.url)
    } catch (err) {
      alert("Image upload failed!")
      console.log(err)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
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

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="text-gray-500 hover:text-[#25D366] transition text-xl flex-shrink-0"
        >
          <FiImage />
        </button>

        <input
          type="text"
          placeholder={uploading ? "Uploading image..." : "Type a message"}
          className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none"
          value={message}
          onChange={handleChange}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={uploading}
        />

        <AudioMessage onSendAudio={onSendAudio} />

        {message.trim() && (
          <button
            onClick={handleSend}
            className="bg-[#25D366] text-white p-2 rounded-full hover:bg-[#128C7E] transition flex-shrink-0"
          >
            <FiSend />
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageInput