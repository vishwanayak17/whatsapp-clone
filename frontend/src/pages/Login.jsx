import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../api/axios"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields!")
      return
    }
    try {
      setLoading(true)
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/home")
    } catch (err) {
      alert(err.response?.data?.message || "Login failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#25D366]">WhatsApp</h1>
          <p className="text-gray-400 mt-2 text-sm">Login to continue chatting</p>
        </div>
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
          className="w-full border border-gray-200 p-3 rounded-xl mb-6 focus:outline-none focus:border-[#25D366] text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#25D366] text-white p-3 rounded-xl hover:bg-[#128C7E] transition font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center mt-4 text-sm text-gray-500">
          Don't have an account?
          <Link to="/signup" className="text-[#25D366] font-semibold ml-1">Signup</Link>
        </p>
      </div>
    </div>
  )
}

export default Login