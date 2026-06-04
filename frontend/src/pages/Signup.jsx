import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../api/axios"

function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields!")
      return
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    try {
      setLoading(true)
      const res = await api.post("/auth/signup", { name, email, password })
      alert(res.data.message)
      navigate("/")
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#25D366]">WhatsApp</h1>
          <p className="text-gray-400 mt-2 text-sm">Create your account</p>
        </div>
        <input
          type="text"
          placeholder="Enter Name"
          className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:outline-none focus:border-[#25D366] text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:outline-none focus:border-[#25D366] text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:outline-none focus:border-[#25D366] text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border border-gray-200 p-3 rounded-xl mb-6 focus:outline-none focus:border-[#25D366] text-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSignup()}
        />
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#25D366] text-white p-3 rounded-xl hover:bg-[#128C7E] transition font-semibold"
        >
          {loading ? "Creating account..." : "Signup"}
        </button>
        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account?
          <Link to="/" className="text-[#25D366] font-semibold ml-1">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup