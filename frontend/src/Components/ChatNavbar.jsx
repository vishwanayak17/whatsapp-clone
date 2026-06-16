import { FiPhone, FiVideo, FiArrowLeft } from "react-icons/fi"

function ChatNavbar({ selectedUser, onBack, isTyping, onVideoCall, onVoiceCall }) {
  return (
    <div className="bg-[#25D366] p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="md:hidden text-white mr-1">
          <FiArrowLeft size={22} />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#25D366] font-bold">
            {selectedUser?.name?.charAt(0).toUpperCase()}
          </div>
          {selectedUser?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h1 className="text-white text-sm font-semibold">{selectedUser?.name}</h1>
          <p className="text-green-100 text-xs">
            {isTyping ? "typing..." : selectedUser?.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-5 text-white text-xl">
        <button
          onClick={onVoiceCall}
          className="hover:text-green-200 transition"
          title="Voice Call"
        >
          <FiPhone />
        </button>
        <button
          onClick={onVideoCall}
          className="hover:text-green-200 transition"
          title="Video Call"
        >
          <FiVideo />
        </button>
      </div>
    </div>
  )
}

export default ChatNavbar