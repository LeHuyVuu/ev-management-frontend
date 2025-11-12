import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import api from "../../context/api"

// ✅ Toastify
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Authentication() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // ✅ NEW
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: ''
  })
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { email, password, confirmPassword, fullName, phone, address } = formData

    if (!email.trim() || !password.trim()) {
      toast.warn('Please enter email and password.')
      return
    }

    // REGISTER demo
    if (!isLogin) {
      if (!fullName.trim() || !phone.trim() || !address.trim()) {
        toast.warn('Please fill out all required fields.')
        return
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.')
        return
      }

      setIsSubmitting(true) // ✅ show Authenticating...
      toast.success("Registered successfully! You can now sign in.")
      setIsLogin(true)
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      setIsSubmitting(false) // ✅ done
      return
    }

    // LOGIN
    try {
      setIsSubmitting(true) // ✅ show Authenticating...
      const res = await axios.post(`${api.identity}/api/Auth/login`, {
        email,
        password
      })

      console.log("Full response:", res.data)

      // ✅ Lấy token đúng chỗ
      const token = res.data?.data?.token
      if (!token) {
        toast.error("Không tìm thấy token từ API")
        return
      }

      localStorage.setItem("token", token)

      // ✅ Decode JWT
      const decoded = jwtDecode(token)
      console.log("Decoded JWT:", decoded)

      const roleId = parseInt(decoded.RoleId)

      console.log("role id nè: " + typeof (roleId) + roleId);
      // ✅ Redirect theo role
      if (roleId === 1 || roleId === 2) {
        toast.success("Signed in successfully!")
        navigate("/evm/product-distribution", { replace: true })
      } else if (roleId === 3 || roleId === 4) {
        toast.success("Signed in successfully!")
        navigate("/dealer/vehicle-search", { replace: true })
      } else {
        toast.error("Unauthorized role!")
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Login failed")
    } finally {
      setIsSubmitting(false) // ✅ done
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* ✅ Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        theme="colored"
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join us today'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* ✅ Button hiển thị Authenticating... khi submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl transition
                ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"}`}
            >
              {isSubmitting ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          {/* <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(prev => !prev)
                  setShowPassword(false)
                  setShowConfirmPassword(false)
                }}
                className="ml-2 text-blue-600 font-semibold"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Authentication
