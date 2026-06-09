import { useState, useEffect, useRef } from "react"
import { FiSearch } from "react-icons/fi"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MdGroupAdd } from "react-icons/md"
import api from "../api/axios"
import CreateGroup from "./CreateGroup"

function Sidebar({ onSelectUser, onSelectGroup, selectedUser, selectedGroup, currentUser, onLogout, onOpenProfile, onOpenSettings, notifications, socket, onGroupCreated, groups, setGroups }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [activeTab, setActiveTab] = useState("chats")
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users")
        setUsers(res.data.users)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups")
        setGroups(res.data.groups)
      } catch (err) {
        console.log(err)
      }
    }
    fetchGroups()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on("userStatusUpdate", (data) => {
      setUsers(prev => prev.map(user =>
        user._id === data.userId
          ? { ...user, isOnline: data.isOnline, lastSeen: data.lastSeen }
          : user
      ))
    })
    return () => socket.off("userStatusUpdate")
  }, [socket])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const getLastSeen = (user) => {
    if (user.isOnline) return "🟢 Online"
    if (!user.lastSeen) return "Last seen recently"
    const date = new Date(user.lastSeen)
    return `Last seen ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#25D366] font-bold text-lg">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-white font-semibold text-sm">{currentUser?.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-white hover:bg-[#128C7E] p-2 rounded-full transition"
            title="New Group"
          >
            <MdGroupAdd size={22} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white hover:bg-[#128C7E] p-2 rounded-full transition"
            >
              <BsThreeDotsVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl z-50 w-48 overflow-hidden">
                <button
                  onClick={() => { onOpenProfile(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => { onOpenSettings(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  ⚙️ Settings
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => { onLogout(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "chats" ? "text-[#25D366] border-b-2 border-[#25D366]" : "text-gray-400"}`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "groups" ? "text-[#25D366] border-b-2 border-[#25D366]" : "text-gray-400"}`}
        >
          Groups
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-white border-b">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm w-full focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* Chats Tab */}
        {activeTab === "chats" && (
          <>
            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-10">No contacts found</p>
            )}
            {filteredUsers.map(user => (
              <div
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${selectedUser?._id === user._id ? "bg-gray-100" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h1 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h1>
                    {notifications?.[user._id]?.count > 0 && (
                      <span className="bg-[#25D366] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-1">
                        {notifications[user._id].count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate text-gray-400">
                    {notifications?.[user._id]?.lastMessage || getLastSeen(user)}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <>
            {filteredGroups.length === 0 && (
              <div className="text-center mt-10">
                <p className="text-gray-400 text-sm">No groups yet!</p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="mt-3 text-[#25D366] text-sm font-semibold"
                >
                  Create a group
                </button>
              </div>
            )}
            {filteredGroups.map(group => (
              <div
                key={group._id}
                onClick={() => onSelectGroup(group)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${selectedGroup?._id === group._id ? "bg-gray-100" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold text-gray-800 truncate">{group.name}</h1>
                  <p className="text-xs text-gray-400 truncate">
                    {group.members.length} members
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(group) => {
            onGroupCreated(group)
            setGroups(prev => [...prev, group])
          }}
        />
      )}

    </div>
  )
}

export default Sidebar