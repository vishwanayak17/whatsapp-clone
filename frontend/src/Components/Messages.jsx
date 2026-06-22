import { useEffect, useRef, useState } from "react"
import { BsCheck, BsCheckAll, BsPlayFill, BsPauseFill } from "react-icons/bs"
import { MdDelete } from "react-icons/md"

function AudioPlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!src) return
    const audio = new Audio()
    audio.preload = "auto"
    audio.src = src
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration))
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime))
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    audio.load()

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Error:", err))
    }
  }

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00"
    const mins = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${mins}:${s.toString().padStart(2, "0")}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!src) return null

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <button
        onClick={togglePlay}
        className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white flex-shrink-0"
      >
        {isPlaying ? <BsPauseFill size={16} /> : <BsPlayFill size={16} />}
      </button>
      <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-1 bg-[#25D366] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  )
}

function ImageMessage({ src }) {
  return (
    <img
      src={src}
      alt="sent image"
      className="rounded-lg max-w-[250px] max-h-[300px] object-cover cursor-pointer"
      onClick={() => window.open(src, "_blank")}
    />
  )
}

function FileMessage({ fileUrl, fileName, fileSize }) {
  const formatSize = (bytes) => {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase()
    if (ext === "pdf") return "📄"
    if (ext === "doc" || ext === "docx") return "📝"
    if (ext === "xls" || ext === "xlsx") return "📊"
    if (ext === "ppt" || ext === "pptx") return "📑"
    if (ext === "zip") return "🗜️"
    if (ext === "mp4") return "🎬"
    if (ext === "mp3") return "🎵"
    return "📎"
  }

  const icon = getIcon(fileName)
  const size = formatSize(fileSize)

  return (
    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-w-[200px] hover:bg-gray-50 p-1 rounded-lg transition">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate font-medium">{fileName}</p>
        <p className="text-xs text-gray-400">{size}</p>
      </div>
    </a>
  )
}

function CallMessage({ msg, currentUser }) {
  const isMine = msg.senderId === currentUser._id
  const isMissed = msg.callStatus === "missed"

  const formatDuration = (secs) => {
    if (!secs) return ""
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return ` • ${mins}:${s.toString().padStart(2, "0")} min`
  }

  return (
    <div className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 ${isMine ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
        <div className="text-2xl">
          {isMissed ? "📵" : msg.callType === "video" ? "📹" : "📞"}
        </div>
        <div>
          <p className={`text-sm font-medium ${isMissed ? "text-red-500" : "text-gray-800"}`}>
            {isMissed
              ? `Missed ${msg.callType === "video" ? "video" : "voice"} call`
              : `${msg.callType === "video" ? "Video" : "Voice"} call${formatDuration(msg.callDuration)}`
            }
          </p>
          <p className="text-[10px] text-gray-400">
            {new Date(msg.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

function Messages({ messages, currentUser, onDeleteMessage }) {
  const bottomRef = useRef(null)
  const [selectedMsg, setSelectedMsg] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderTick = (msg) => {
    if (msg.senderId !== currentUser._id) return null
    if (msg.deleted) return null
    if (msg.type === "call") return null
    switch (msg.status) {
      case "seen":
        return <BsCheckAll className="text-blue-500" size={14} />
      case "delivered":
        return <BsCheckAll className="text-gray-400" size={14} />
      default:
        return <BsCheck className="text-gray-400" size={14} />
    }
  }

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto p-4 bg-[#ECE5DD]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
      onClick={() => setSelectedMsg(null)}
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white px-6 py-3 rounded-full shadow-sm">
            <p className="text-gray-400 text-sm">No messages yet. Say Hi! 👋</p>
          </div>
        </div>
      )}

      {messages.map((msg, index) => {
        if (msg.type === "call") {
          return <CallMessage key={index} msg={msg} currentUser={currentUser} />
        }

        return (
          <div
            key={index}
            className={`flex mb-2 ${msg.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
          >
            <div className="relative max-w-[65%]">
              {selectedMsg === index && msg.senderId === currentUser._id && (
                <div className="absolute -top-8 right-0 bg-white rounded-lg shadow-lg z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteMessage(index)
                      setSelectedMsg(null)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 text-xs hover:bg-red-50 rounded-lg whitespace-nowrap"
                  >
                    <MdDelete size={16} />
                    Delete Message
                  </button>
                </div>
              )}

              <div
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedMsg(selectedMsg === index ? null : index)
                }}
                className={`px-3 py-2 rounded-lg shadow-sm cursor-pointer ${msg.senderId === currentUser._id
                  ? "bg-[#DCF8C6] rounded-tr-none"
                  : "bg-white rounded-tl-none"
                  }`}
              >
                {msg.deleted ? (
                  <p className="text-sm text-gray-400 italic">
                    🚫 This message was deleted
                  </p>
                ) : msg.type === "audio" ? (
                  <AudioPlayer src={msg.audio} />
                ) : msg.type === "image" ? (
                  <ImageMessage src={msg.image} />
                ) : msg.type === "file" ? (
                  <FileMessage fileUrl={msg.fileUrl} fileName={msg.fileName} fileSize={msg.fileSize} />
                ) : (
                  <p className="text-sm text-gray-800 break-words">
                    {msg.message}
                  </p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-[10px] text-gray-400">
                    {new Date(msg.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  {renderTick(msg)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

export default Messages