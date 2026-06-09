import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowLeft, FiMoon, FiSun, FiBell, FiLock, FiHelpCircle, FiTrash2 } from "react-icons/fi"

function Settings() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user"))
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleClearChats = () => {
    if (window.confirm("Are you sure you want to clear all chats?")) {
      localStorage.removeItem(`messages_${currentUser._id}`)
      alert("All chats cleared!")
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Header */}
      <div className="bg-[#25D366] p-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")} className="text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold text-lg">Settings</h1>
      </div>

      {/* Profile Section */}
      <div
        onClick={() => navigate("/profile")}
        className="bg-white p-4 flex items-center gap-4 mb-2 cursor-pointer hover:bg-gray-50 transition"
      >
        <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white text-2xl font-bold">
          {currentUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{currentUser?.name}</h2>
          <p className="text-sm text-gray-500">{currentUser?.about || "Hey there! I am using WhatsApp"}</p>
          <p className="text-xs text-gray-400">{currentUser?.phone || "No phone number"}</p>
        </div>
      </div>

      {/* Settings Options */}
      <div className="bg-white mb-2">
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <FiBell className="text-purple-500" size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400">Message notifications</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition ${notifications ? "bg-[#25D366]" : "bg-gray-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
              {darkMode ? <FiSun className="text-yellow-500" size={18} /> : <FiMoon className="text-yellow-500" size={18} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Dark Mode</p>
              <p className="text-xs text-gray-400">Coming soon!</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition ${darkMode ? "bg-[#25D366]" : "bg-gray-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`}></div>
          </button>
        </div>

        <div className="flex items-center gap-4 px-4 py-4 border-b cursor-pointer hover:bg-gray-50">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <FiLock className="text-blue-500" size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Privacy</p>
            <p className="text-xs text-gray-400">Last seen, profile photo</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <FiHelpCircle className="text-green-500" size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Help</p>
            <p className="text-xs text-gray-400">FAQ, contact us</p>
          </div>
        </div>
      </div>

      {/* Clear Chats */}
      <div className="bg-white mb-2">
        <button
          onClick={handleClearChats}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 transition"
        >
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <FiTrash2 className="text-red-500" size={18} />
          </div>
          <p className="text-sm font-medium text-red-500">Clear All Chats</p>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center py-6">
        <p className="text-gray-400 text-xs">WhatsApp Clone v1.0</p>
        <p className="text-gray-400 text-xs">Made with ❤️ by Vishwa</p>
      </div>

    </div>
  )
}

export default Settings