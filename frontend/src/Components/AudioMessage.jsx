import { useState, useRef } from "react"
import { FiMic, FiSquare, FiSend } from "react-icons/fi"
import { BsPlayFill, BsPauseFill } from "react-icons/bs"

function AudioMessage({ onSendAudio }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  const getMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ""
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getMimeType()
      const options = mimeType ? { mimeType } : {}
      
      mediaRecorder.current = new MediaRecorder(stream, options)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const mimeUsed = mediaRecorder.current.mimeType || "audio/webm"
        const blob = new Blob(audioChunks.current, { type: mimeUsed })
        console.log("Blob size:", blob.size, "Type:", mimeUsed)
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start(100)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.log("Mic error:", err)
      alert("Microphone access denied!")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleSend = () => {
    if (!audioBlob) return

    if (audioBlob.size > 5000000) {
      alert("Audio is too long! Please record a shorter message.")
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = () => {
      const base64Audio = reader.result
      console.log("Sending audio, size:", base64Audio.length)
      onSendAudio(base64Audio)
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      setIsPlaying(false)
    }
  }

  const handleCancel = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Preview error:", err))
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2">

      {/* Recording state */}
      {isRecording && (
        <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 text-sm font-medium">
            {formatTime(recordingTime)}
          </span>
          <span className="text-red-400 text-xs">Recording...</span>
        </div>
      )}

      {/* Preview state */}
      {audioUrl && !isRecording && (
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
          <button onClick={togglePlay} className="text-[#25D366]">
            {isPlaying ? <BsPauseFill size={18} /> : <BsPlayFill size={18} />}
          </button>
          <span className="text-gray-500 text-sm">{formatTime(recordingTime)}</span>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={handleCancel}
            className="text-red-500 text-xs ml-1 hover:bg-red-100 p-1 rounded-full"
          >
            ✕
          </button>
          <button
            onClick={handleSend}
            className="bg-[#25D366] text-white p-1.5 rounded-full ml-1 hover:bg-[#128C7E] transition"
          >
            <FiSend size={14} />
          </button>
        </div>
      )}

      {/* Mic button */}
      {!audioUrl && (
        <button
          onClick={handleRecordClick}
          className={`p-2 rounded-full transition ${isRecording
            ? "bg-red-500 text-white animate-pulse"
            : "text-gray-500 hover:text-[#25D366]"
            }`}
          title={isRecording ? "Click to stop recording" : "Click to start recording"}
        >
          {isRecording ? <FiSquare size={20} /> : <FiMic size={20} />}
        </button>
      )}

    </div>
  )
}

export default AudioMessage