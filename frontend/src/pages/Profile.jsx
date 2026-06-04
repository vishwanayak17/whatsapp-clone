import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowLeft, FiEdit2, FiCheck } from "react-icons/fi"
import api from "../api/axios"

function Profile() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user"))

  const [name, setName] = useState(currentUser?.name || "")
  const [about, setAbout] = useState(currentUser?.about || "")
  const [phone, setPhone] = useState(currentUser?.phone || "")
  const [loading, setLoading] = useState(false)
  const [editName, setEditName] = useState(false)
  const [editAbout, setEditAbout] = useState(false)
  const [editPhone, setEditPhone] = useState(false)

  const handleUpdate = async () => {
    try {
      setLoading(true)
      const res = await api.put(`/users/${currentUser._id}`, {
        name,
        about,
        phone
      })
      localStorage.setItem("user", JSON.stringify(res.data.user))
      alert("Profile Updated! ✅")
      navigate("/home")
    } catch (err) {
      alert("Error updating profile!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      <div className="bg-[#25D366] p-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")} className="text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold text-lg">Profile</h1>
      </div>

      <div className="flex flex-col items-center py-8 bg-white mb-4">
        <div className="w-32 h-32 rounded-full bg-[#25D366] flex items-center justify-center text-white text-5xl font-bold mb-3">
          {name.charAt(0).toUpperCase()}
        </div>
        <p className="text-gray-400 text-sm">Profile Photo</p>
      </div>

      <div className="bg-white px-6 py-4 mb-2">
        <p className="text-[#25D366] text-xs font-semibold mb-3">YOUR NAME</p>
        <div className="flex items-center justify-between border-b pb-3">
          {editName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 focus:outline-none text-sm text-gray-800"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-800">{name}</p>
          )}
          <button
            onClick={() => setEditName(!editName)}
            className="text-gray-400 hover:text-[#25D366] transition ml-3"
          >
            {editName ? <FiCheck size={18} /> : <FiEdit2 size={18} />}
          </button>
        </div>
      </div>

      <div className="bg-white px-6 py-4 mb-2">
        <p className="text-[#25D366] text-xs font-semibold mb-3">ABOUT</p>
        <div className="flex items-center justify-between border-b pb-3">
          {editAbout ? (
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="flex-1 focus:outline-none text-sm text-gray-800"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-800">{about || "Hey there! I am using WhatsApp"}</p>
          )}
          <button
            onClick={() => setEditAbout(!editAbout)}
            className="text-gray-400 hover:text-[#25D366] transition ml-3"
          >
            {editAbout ? <FiCheck size={18} /> : <FiEdit2 size={18} />}
          </button>
        </div>
      </div>

      <div className="bg-white px-6 py-4 mb-6">
        <p className="text-[#25D366] text-xs font-semibold mb-3">PHONE</p>
        <div className="flex items-center justify-between border-b pb-3">
          {editPhone ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 focus:outline-none text-sm text-gray-800"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-800">{phone || "Add phone number"}</p>
          )}
          <button
            onClick={() => setEditPhone(!editPhone)}
            className="text-gray-400 hover:text-[#25D366] transition ml-3"
          >
            {editPhone ? <FiCheck size={18} /> : <FiEdit2 size={18} />}
          </button>
        </div>
      </div>

      <div className="px-6">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#25D366] text-white p-3 rounded-xl hover:bg-[#128C7E] transition font-semibold"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </div>
  )
}

export default Profile