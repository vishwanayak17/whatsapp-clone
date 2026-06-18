import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import Sidebar from "../Components/Sidebar"
import ChatArea from "../Components/ChatArea"
import GroupChatArea from "../Components/GroupChatArea"
import VideoCall from "../Components/VideoCall"
import IncomingCall from "../Components/IncomingCall"

const socket = io("http://localhost:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
})

function Home() {
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [notifications, setNotifications] = useState({})
  const [groupNotifications, setGroupNotifications] = useState({})
  const [groups, setGroups] = useState([])

  const [stream, setStream] = useState(null)
  const [call, setCall] = useState({})
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [currentCallType, setCurrentCallType] = useState("video")

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const callStartTime = useRef(null)

  const currentUser = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const getMessages = () => {
    const saved = localStorage.getItem(`messages_${currentUser?._id}`)
    return saved ? JSON.parse(saved) : {}
  }

  const [allMessages, setAllMessages] = useState(getMessages)

  const saveMessages = (msgs) => {
    const msgsToSave = {}
    for (let key in msgs) {
      msgsToSave[key] = msgs[key].map(msg => {
        if (msg.type === "audio") {
          return { ...msg, audio: null }
        }
        return msg
      })
    }
    localStorage.setItem(`messages_${currentUser?._id}`, JSON.stringify(msgsToSave))
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/")
      return
    }

    socket.connect()

    socket.on("connect", () => {
      socket.emit("joinRoom", currentUser._id)
      socket.emit("userOnline", currentUser._id)
    })

    socket.on("receiveMessage", (data) => {
      setAllMessages(prev => {
        const updated = {
          ...prev,
          [data.senderId]: [...(prev[data.senderId] || []), data]
        }
        saveMessages(updated)
        return updated
      })
      setNotifications(prev => ({
        ...prev,
        [data.senderId]: {
          count: (prev[data.senderId]?.count || 0) + 1,
          lastMessage: data.type === "audio" ? "🎤 Audio message" : data.type === "image" ? "📷 Photo" : data.message
        }
      }))
    })

    socket.on("receiveGroupMessage", (data) => {
      if (data.senderId !== currentUser._id) {
        setGroupNotifications(prev => ({
          ...prev,
          [data.groupId]: {
            count: (prev[data.groupId]?.count || 0) + 1,
            lastMessage: `${data.senderName}: ${data.message}`
          }
        }))
      }
    })

    socket.on("messageDelivered", (data) => {
      setAllMessages(prev => {
        const updated = { ...prev }
        for (let key in updated) {
          updated[key] = updated[key].map(msg =>
            msg.messageId === data.messageId
              ? { ...msg, status: "delivered" }
              : msg
          )
        }
        saveMessages(updated)
        return updated
      })
    })

    socket.on("messageSeen", (data) => {
      setAllMessages(prev => {
        const updated = { ...prev }
        for (let key in updated) {
          updated[key] = updated[key].map(msg =>
            msg.messageId === data.messageId
              ? { ...msg, status: "seen" }
              : msg
          )
        }
        saveMessages(updated)
        return updated
      })
    })

    socket.on("messageSent", (data) => {
      setAllMessages(prev => {
        const updated = { ...prev }
        for (let key in updated) {
          updated[key] = updated[key].map(msg =>
            msg.messageId === data.messageId
              ? { ...msg, status: "sent" }
              : msg
          )
        }
        saveMessages(updated)
        return updated
      })
    })

    socket.on("userCameOnline", (data) => {
      setAllMessages(prev => {
        const updated = { ...prev }
        const userMessages = updated[data.userId] || []
        if (userMessages.length > 0) {
          updated[data.userId] = userMessages.map(msg =>
            msg.status === "sent" && msg.senderId === currentUser._id
              ? { ...msg, status: "delivered" }
              : msg
          )
          saveMessages(updated)
        }
        return updated
      })
    })

    socket.on("callMessage", (data) => {
      setAllMessages(prev => {
        const otherUserId = data.senderId === currentUser._id
          ? data.receiverId
          : data.senderId
        const updated = {
          ...prev,
          [otherUserId]: [...(prev[otherUserId] || []), data]
        }
        saveMessages(updated)
        return updated
      })
    })

    socket.on("messageDeleted", (data) => {
      setAllMessages(prev => {
        const updated = { ...prev }
        for (let key in updated) {
          updated[key] = updated[key].map(msg =>
            msg.messageId === data.messageId
              ? { ...msg, deleted: true, message: "" }
              : msg
          )
        }
        saveMessages(updated)
        return updated
      })
    })

    socket.on("callUser", (data) => {
      setCall({
        isReceivingCall: true,
        from: data.from,
        name: data.name,
        signal: data.signal,
        callType: data.callType
      })
      setCurrentCallType(data.callType)
    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true)
      callStartTime.current = Date.now()
      if (connectionRef.current) {
        connectionRef.current.signal(signal)
      }
    })

    socket.on("callRejected", () => {
      setCall({})
      setInCall(false)
      setCallEnded(true)
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (connectionRef.current) connectionRef.current.destroy()
      alert("Call was rejected!")
    })

    socket.on("callEnded", () => {
      setCallAccepted(false)
      setCallEnded(true)
      setInCall(false)
      setCall({})
      callStartTime.current = null
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (connectionRef.current) connectionRef.current.destroy()
    })

    return () => {
      socket.off("connect")
      socket.off("receiveMessage")
      socket.off("receiveGroupMessage")
      socket.off("messageDelivered")
      socket.off("messageSeen")
      socket.off("messageSent")
      socket.off("userCameOnline")
      socket.off("callMessage")
      socket.off("messageDeleted")
      socket.off("callUser")
      socket.off("callAccepted")
      socket.off("callRejected")
      socket.off("callEnded")
    }
  }, [])

  const callUser = async (callType) => {
    if (!selectedUser) return
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true
      })
      setStream(mediaStream)
      setInCall(true)
      setCurrentCallType(callType)
      setCallEnded(false)
      setCallAccepted(false)

      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream
      }

      const peer = new window.SimplePeer({
        initiator: true,
        trickle: false,
        stream: mediaStream
      })

      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: selectedUser._id,
          signalData: data,
          from: currentUser._id,
          name: currentUser.name,
          callType
        })
      })

      peer.on("stream", (remoteStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream
        }
      })

      peer.on("error", (err) => {
        console.log("Peer error:", err)
      })

      connectionRef.current = peer

    } catch (err) {
      console.log("Call error:", err)
      alert("Camera/Mic access denied!")
    }
  }

  const answerCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: call.callType === "video",
        audio: true
      })
      setStream(mediaStream)
      setCallAccepted(true)
      setInCall(true)
      setCallEnded(false)
      callStartTime.current = Date.now()

      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream
      }

      const peer = new window.SimplePeer({
        initiator: false,
        trickle: false,
        stream: mediaStream
      })

      peer.on("signal", (data) => {
        socket.emit("answerCall", {
          signal: data,
          to: call.from
        })
      })

      peer.on("stream", (remoteStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream
        }
      })

      peer.on("error", (err) => {
        console.log("Peer error:", err)
      })

      peer.signal(call.signal)
      connectionRef.current = peer
      setCall(prev => ({ ...prev, isReceivingCall: false }))

    } catch (err) {
      console.log("Answer error:", err)
      alert("Camera/Mic access denied!")
    }
  }

  const rejectCall = () => {
    socket.emit("rejectCall", {
      to: call.from,
      from: currentUser._id,
      callType: call.callType
    })
    setCall({})
  }

  const leaveCall = () => {
    const duration = callStartTime.current
      ? Math.floor((Date.now() - callStartTime.current) / 1000)
      : 0

    const callTo = selectedUser?._id || call.from
    socket.emit("endCall", {
      to: callTo,
      from: currentUser._id,
      callType: currentCallType,
      duration,
      status: "ended"
    })

    setCallAccepted(false)
    setCallEnded(true)
    setInCall(false)
    setCall({})
    callStartTime.current = null
    if (stream) stream.getTracks().forEach(track => track.stop())
    if (connectionRef.current) connectionRef.current.destroy()
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSelectedGroup(null)
    setShowSidebar(false)
    setNotifications(prev => ({ ...prev, [user._id]: null }))
  }

  const handleSelectGroup = (group) => {
    setSelectedGroup(group)
    setSelectedUser(null)
    setShowSidebar(false)
    setGroupNotifications(prev => ({ ...prev, [group._id]: null }))
  }

  const handleSendMessage = (message) => {
    if (!selectedUser) return
    const data = {
      messageId: Date.now().toString(),
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message,
      status: "sent",
      time: new Date(),
      deleted: false
    }
    socket.emit("sendMessage", data)
    setAllMessages(prev => {
      const updated = {
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), data]
      }
      saveMessages(updated)
      return updated
    })
  }

  const handleSendAudio = (audioData) => {
    if (!selectedUser) return
    const data = {
      messageId: Date.now().toString(),
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      type: "audio",
      audio: audioData,
      message: "🎤 Audio message",
      status: "sent",
      time: new Date(),
      deleted: false
    }
    socket.emit("sendMessage", data)
    setAllMessages(prev => {
      const updated = {
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), data]
      }
      saveMessages(updated)
      return updated
    })
  }

  const handleSendImage = (imageUrl) => {
    if (!selectedUser) return
    const data = {
      messageId: Date.now().toString(),
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      type: "image",
      image: imageUrl,
      message: "📷 Photo",
      status: "sent",
      time: new Date(),
      deleted: false
    }
    socket.emit("sendMessage", data)
    setAllMessages(prev => {
      const updated = {
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), data]
      }
      saveMessages(updated)
      return updated
    })
  }

  const handleDeleteMessage = (index) => {
    const msgToDelete = allMessages[selectedUser._id][index]

    socket.emit("deleteMessage", {
      messageId: msgToDelete.messageId,
      receiverId: selectedUser._id
    })

    setAllMessages(prev => {
      const updated = {
        ...prev,
        [selectedUser._id]: prev[selectedUser._id].map((msg, i) =>
          i === index ? { ...msg, deleted: true, message: "" } : msg
        )
      }
      saveMessages(updated)
      return updated
    })
  }

  const handleLogout = () => {
    socket.emit("userOffline", currentUser._id)
    socket.disconnect()
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const handleBack = () => {
    setShowSidebar(true)
    setSelectedUser(null)
    setSelectedGroup(null)
  }

  const handleGroupCreated = (group) => {
    setGroups(prev => [...prev, group])
  }

  return (
    <div className="h-screen bg-[#ECE5DD] flex items-center justify-center">
      <div className="w-full h-full md:w-[95%] md:h-[95%] md:rounded-2xl bg-white shadow-xl flex overflow-hidden">

        <div className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-[35%] flex-col border-r h-full overflow-hidden`}>
          <Sidebar
            onSelectUser={handleSelectUser}
            onSelectGroup={handleSelectGroup}
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenProfile={() => navigate("/profile")}
            onOpenSettings={() => navigate("/settings")}
            notifications={notifications}
            groupNotifications={groupNotifications}
            socket={socket}
            onGroupCreated={handleGroupCreated}
            groups={groups}
            setGroups={setGroups}
          />
        </div>

        <div className={`${!showSidebar ? "flex" : "hidden"} md:flex w-full md:w-[65%] flex-col h-full overflow-hidden`}>
          {selectedUser ? (
            <ChatArea
              selectedUser={selectedUser}
              messages={allMessages[selectedUser?._id] || []}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onSendAudio={handleSendAudio}
              onSendImage={handleSendImage}
              onDeleteMessage={handleDeleteMessage}
              onBack={handleBack}
              socket={socket}
              onVideoCall={() => callUser("video")}
              onVoiceCall={() => callUser("voice")}
            />
          ) : selectedGroup ? (
            <GroupChatArea
              group={selectedGroup}
              currentUser={currentUser}
              onBack={handleBack}
              socket={socket}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
              <div className="text-center">
                <div className="text-8xl mb-4">💬</div>
                <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
                <p className="text-gray-400 text-sm">Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <IncomingCall
        call={call}
        answerCall={answerCall}
        rejectCall={rejectCall}
      />

      {inCall && (
        <VideoCall
          myVideo={myVideo}
          userVideo={userVideo}
          stream={stream}
          callAccepted={callAccepted}
          leaveCall={leaveCall}
          callType={currentCallType}
          userName={selectedUser?.name || call.name}
        />
      )}

    </div>
  )
}

export default Home