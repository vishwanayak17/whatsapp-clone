import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor } from "react-icons/fi"
import { useState, useEffect } from "react"

function VideoCall({ myVideo, userVideo, stream, callAccepted, leaveCall, callType, userName, connectionRef }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [savedCameraTrack, setSavedCameraTrack] = useState(null)

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (userVideo.current && stream && callAccepted) {
      // Remote stream set already hota hai Home.jsx se peer "stream" event mein
      // Yeh sirf safety hai
    }
  }, [callAccepted])

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })

        const screenTrack = screenStream.getVideoTracks()[0]
        const cameraTrack = stream.getVideoTracks()[0]
        setSavedCameraTrack(cameraTrack)

        if (connectionRef.current && connectionRef.current._pc) {
          const sender = connectionRef.current._pc
            .getSenders()
            .find(s => s.track && s.track.kind === "video")
          if (sender) {
            sender.replaceTrack(screenTrack)
          }
        }

        setIsScreenSharing(true)

        screenTrack.onended = () => {
          stopScreenShare()
        }

      } catch (err) {
        console.log("Screen share error:", err)
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = () => {
    if (savedCameraTrack && connectionRef.current && connectionRef.current._pc) {
      const sender = connectionRef.current._pc
        .getSenders()
        .find(s => s.track && s.track.kind === "video")
      if (sender) {
        sender.replaceTrack(savedCameraTrack)
      }
    }
    setIsScreenSharing(false)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div>
          <p className="text-white font-semibold">{userName}</p>
          <p className="text-green-400 text-sm">
            {callAccepted ? (isScreenSharing ? "Sharing screen" : "Connected") : "Calling..."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-900">
        {callType === "video" ? (
          callAccepted ? (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#25D366] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {userName?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-lg">Calling {userName}...</p>
              <p className="text-gray-400 text-sm mt-2">Waiting for answer...</p>
            </div>
          )
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-[#25D366] flex items-center justify-center text-white text-5xl font-bold mx-auto mb-6">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <p className="text-white text-2xl font-semibold">{userName}</p>
            <p className="text-gray-400 mt-2">
              {callAccepted ? "Voice call connected" : "Calling..."}
            </p>
          </div>
        )}
      </div>

      {callType === "video" && (
        <div className="absolute bottom-24 right-4 w-32 h-44 border-2 border-white rounded-xl overflow-hidden bg-gray-800">
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">

        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-700"} text-white`}
        >
          {isMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
        </button>

        {callType === "video" && (
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${isScreenSharing ? "bg-blue-500" : "bg-gray-700"} text-white`}
            title="Share Screen"
          >
            <FiMonitor size={22} />
          </button>
        )}

        <button
          onClick={leaveCall}
          className="bg-red-600 text-white p-5 rounded-full"
        >
          <FiPhoneOff size={26} />
        </button>

        {callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoOff ? "bg-red-500" : "bg-gray-700"} text-white`}
          >
            {isVideoOff ? <FiVideoOff size={22} /> : <FiVideo size={22} />}
          </button>
        )}

      </div>

    </div>
  )
}

export default VideoCall