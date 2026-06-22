import { useState, useRef } from "react"
import { FiSend, FiImage, FiPaperclip } from "react-icons/fi"
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

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Total size check
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      alert("Total file size too large! Max 50MB allowed.")
      return
    }

    const formData = new FormData()
    files.forEach(file => {
      formData.append("files", file)
    })

    try {
      setUploading(true)
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      // Har file ko alag message bana ke bhejo
      res.data.files.forEach(fileData => {
        onSendImage(fileData)
      })

    } catch (err) {
      alert(err.response?.data?.message || "File upload failed!")
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

        {/* Multiple File Upload */}
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.mp4,.mp3"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="text-gray-500 hover:text-[#25D366] transition text-xl flex-shrink-0"
          title="Attach files"
        >
          <FiPaperclip />
        </button>

        <input
          type="text"
          placeholder={uploading ? "Uploading files..." : "Type a message"}
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