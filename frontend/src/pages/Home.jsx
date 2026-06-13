import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import Sidebar from "../Components/Sidebar"
import ChatArea from "../Components/ChatArea"
import GroupChatArea from "../Components/GroupChatArea"

const socket = io("http://localhost:5000", {
  autoConnect: false
})

function Home() {
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [notifications, setNotifications] = useState({})
  const [groupNotifications, setGroupNotifications] = useState({})
  const [groups, setGroups] = useState([])
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
          lastMessage: data.type === "audio"
            ? "🎤 Audio message"
            : data.message
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

    return () => {
      socket.off("connect")
      socket.off("receiveMessage")
      socket.off("receiveGroupMessage")
      socket.off("messageDelivered")
      socket.off("messageSeen")
      socket.off("messageSent")
      socket.off("userCameOnline")
      socket.disconnect()
    }
  }, [])

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSelectedGroup(null)
    setShowSidebar(false)
    setNotifications(prev => ({
      ...prev,
      [user._id]: null
    }))
  }

  const handleSelectGroup = (group) => {
    setSelectedGroup(group)
    setSelectedUser(null)
    setShowSidebar(false)
    setGroupNotifications(prev => ({
      ...prev,
      [group._id]: null
    }))
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

  const handleDeleteMessage = (index) => {
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

        <div className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-[35%] flex-col border-r`}>
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

        <div className={`${!showSidebar ? "flex" : "hidden"} md:flex w-full md:w-[65%] flex-col`}>
          {selectedUser ? (
            <ChatArea
              selectedUser={selectedUser}
              messages={allMessages[selectedUser?._id] || []}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onSendAudio={handleSendAudio}
              onDeleteMessage={handleDeleteMessage}
              onBack={handleBack}
              socket={socket}
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
    </div>
  )
}

export default Home