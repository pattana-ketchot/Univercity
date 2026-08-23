import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false })

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // Example: await registerUser(formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock success
      console.log('Registration data:', {
        username: formData.username,
        email: formData.email
      })

      // Redirect to login or home page
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setSocialLoading({ ...socialLoading, google: true })
    try {
      // TODO: Implement Google OAuth
      // Example: await signInWithGoogle()

      alert('Google Sign Up ยังไม่ได้เปิดใช้งาน\nกรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่า OAuth')
    } catch (error) {
      console.error('Google sign up error:', error)
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
    } finally {
      setSocialLoading({ ...socialLoading, google: false })
    }
  }

  const handleFacebookSignUp = async () => {
    setSocialLoading({ ...socialLoading, facebook: true })
    try {
      // TODO: Implement Facebook OAuth
      // Example: await signInWithFacebook()

      alert('Facebook Sign Up ยังไม่ได้เปิดใช้งาน\nกรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่า OAuth')
    } catch (error) {
      console.error('Facebook sign up error:', error)
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook')
    } finally {
      setSocialLoading({ ...socialLoading, facebook: false })
    }
  }

  const isFormValid = formData.username && formData.email && formData.password && formData.confirmPassword

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[320px]">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/assets/logo.png"
              alt="University Logo"
              className="h-36 w-auto"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-24 h-24 bg-pnru rounded-full hidden items-center justify-center">
              <span className="text-white text-3xl font-bold">S</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-pnru mb-1">STPNRU</h1>
          <p className="text-sm text-gray-600 mb-6">
            คณะวิทยาศาสตร์และเทคโนโลยี
          </p>

          {/* Page Title */}
          <h2 className="text-xl font-bold text-pnru">Create Account</h2>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                autoComplete="username"
                aria-label="Username"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pnru transition-colors ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                autoComplete="email"
                aria-label="Email"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pnru transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                aria-label="Password"
                className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pnru transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                aria-label="Confirm Password"
                className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pnru transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-xs text-red-500 text-center">{errors.submit}</p>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full py-3 bg-white border-2 border-pnru text-pnru font-semibold rounded-lg hover:bg-[#E8F5F1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-pnru font-medium hover:underline">
            Login
          </Link>
        </p>

        {/* Social Authentication */}
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={socialLoading.google}
              className="py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {socialLoading.google ? '...' : 'Google'}
              </span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookSignUp}
              disabled={socialLoading.facebook}
              className="py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {socialLoading.facebook ? '...' : 'Facebook'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
