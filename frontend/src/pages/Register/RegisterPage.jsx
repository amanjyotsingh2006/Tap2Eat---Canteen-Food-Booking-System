import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Contact,
  Eye,
  EyeOff,
  HelpCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'

import api from '../../services/api.js'
import GoogleButton from '../../components/GoogleButton.jsx'

// Replace with your own image, e.g. '/images/register-bg.jpg' in /public
const HERO_IMAGE =
  'https://i.pinimg.com/736x/f3/0a/1c/f30a1cd9f258fe356a8e7855abddac36.jpg'

const BrandMark = ({ className = '', size = 18 }) => (
  <div
    className={`flex items-center justify-center rounded-xl bg-orange-500 text-white ${className}`}
  >
    <UtensilsCrossed size={size} />
  </div>
)

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    const fullName = formData.fullName.trim()
    const email = formData.email.trim().toLowerCase()
    const phone = formData.phone.trim()
    const { password, confirmPassword } = formData

    if (!fullName || fullName.length < 3) {
      setErrorMessage('Full name must contain at least 3 characters.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setErrorMessage('Please enter a valid 10-digit phone number.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter.')
      return
    }

    if (!/[a-z]/.test(password)) {
      setErrorMessage('Password must contain at least one lowercase letter.')
      return
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one number.')
      return
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one special character.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/users/register', {
        fullName,
        email,
        phone,
        password,
        confirmPassword
      })

      console.log('Registration Successful:', response.data)

      setSuccessMessage('Account created successfully! Redirecting to login...')

      setFormData({
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        phone: ''
      })

      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message)

      const status = error.response?.status
      const backendMessage =
        error.response?.data?.message || error.response?.data?.error

      if (!error.response) {
        setErrorMessage('Unable to connect to server. Please try again.')
      } else if (status === 409) {
        setErrorMessage(backendMessage || 'An account with this email already exists.')
      } else if (status === 400) {
        setErrorMessage(backendMessage || 'Please check your registration details.')
      } else if (status === 422) {
        setErrorMessage(backendMessage || 'Invalid registration information.')
      } else if (status >= 500) {
        setErrorMessage('Server error. Please try again later.')
      } else {
        setErrorMessage(backendMessage || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  // UI only: password strength bars (desktop)
  const { password } = formData
  const strength =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0)

  const fieldBox =
    'h-[52px] w-full rounded-xl border border-[#f0d5c8] bg-white text-sm text-[#2a1a14] outline-none transition placeholder:text-[#9b8478] focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:h-11'

  const labelClass =
    'mb-2 block text-xs font-semibold text-[#4a2c20] lg:mb-1.5 lg:text-[11px]'

  const iconClass =
    'absolute left-4 top-1/2 -translate-y-1/2 text-[#4a2c20] lg:text-[#6b4a3c]'

  return (
    <div className="min-h-screen bg-[#fff7f4] text-[#1f130e] lg:grid lg:grid-cols-2">
      {/* ================= LEFT PANEL (desktop only) ================= */}
      <section
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-cover bg-center p-[70px] text-white lg:flex"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/85" />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-full bg-[#fff1e8] px-5 py-2.5 text-orange-600 shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
              <UtensilsCrossed size={18} />
            </span>
            <span className="text-2xl font-bold">Tap2Eat</span>
          </Link>

          <span className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-wide backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            CAMPUS EXPRESS POS
          </span>
        </div>

        {/* Bottom content */}
        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-4 rounded-2xl bg-white px-5 py-3 text-sm text-[#1f130e] shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6eeea] text-[#a63a0f]">
              <Zap size={20} />
            </span>
            <span className="font-medium">
              Avg. Pickup Time: <b className="text-[#a63a0f]">7 mins</b>
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="text-gray-600">100% Contactless</span>
          </div>

          <h2 className="text-[40px] font-extrabold leading-tight tracking-tight">
            Join the campus dining revolution.
          </h2>

          <p className="mt-4 max-w-[640px] text-lg leading-8 text-white/90">
            Skip the queues, pre-order meals in seconds, and grab freshly
            prepped food from smart lockers across campus dining halls.
          </p>

          <div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
            <div className="flex -space-x-3">
              {['JD', 'SK', 'AL'].map((initials) => (
                <span
                  key={initials}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#ffd9c7] text-[11px] font-bold text-orange-700"
                >
                  {initials}
                </span>
              ))}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-[11px] font-bold">
                12k+
              </span>
            </div>
            <p className="text-sm text-white/90">
              Trusted by{' '}
              <strong className="text-white">
                12,000+ students and campus staff
              </strong>{' '}
              across all 6 dining halls.
            </p>
          </div>
        </div>
      </section>

      {/* ================= RIGHT PANEL ================= */}
      <section className="flex min-h-screen flex-col bg-[#fff7f4]">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-[#f3e4dc] bg-white px-4 py-3 lg:hidden">
          <Link to="/" aria-label="Go back" className="p-2 text-[#2a1a14]">
            <ArrowLeft size={24} />
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <BrandMark className="h-8 w-8 rounded-lg" size={16} />
            <span className="text-lg font-bold text-[#a63a0f]">Tap2Eat</span>
          </Link>

          <button type="button" aria-label="Help" className="p-2 text-[#4a2c20]">
            <HelpCircle size={24} />
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="mx-auto hidden w-full max-w-[560px] items-center justify-between px-0 pt-[70px] text-sm text-[#4a2c20] lg:flex">
          <Link to="/" className="flex items-center gap-2 hover:text-orange-600">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <span className="flex items-center gap-2">
            Student ID ready?
            <span className="h-2 w-2 rounded-full bg-orange-500" />
          </span>
        </div>

        {/* Form area */}
        <div className="mx-auto w-full max-w-[640px] flex-1 px-[26px] pb-6 pt-3 lg:max-w-[560px] lg:flex-none lg:px-0 lg:pt-6">
          <div className="lg:rounded-2xl lg:border lg:border-[#f3e4dc] lg:bg-white lg:p-10 lg:shadow-sm">
            {/* Mobile hero */}
            <div className="flex flex-col items-center lg:hidden">
              <div className="relative">
                <div
                  className="h-[104px] w-[104px] rounded-full border-4 border-orange-300 bg-cover bg-center shadow-md"
                  style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white">
                  <Zap size={16} />
                </span>
              </div>
              <span className="mt-3 rounded-full border border-[#f4b99f] bg-[#ffe9dd] px-5 py-1.5 text-sm font-medium text-[#a2410c]">
                Campus Express Pickup ⚡
              </span>
            </div>

            {/* Desktop icon */}
            <div className="hidden h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#f8ebe4] text-[#a63a0f] lg:flex">
              <UserCheck size={22} />
            </div>

            {/* Headings */}
            <div className="mt-4 text-center lg:mt-5 lg:text-left">
              <h1 className="text-[32px] font-extrabold tracking-tight lg:text-[28px]">
                Create Your Account
              </h1>
              <p className="mx-auto mt-2 max-w-[400px] text-base text-[#4a2c20] lg:mx-0 lg:max-w-none lg:text-sm">
                <span className="lg:hidden">
                  Sign up in seconds to order ahead and skip queues.
                </span>
                <span className="hidden lg:inline">
                  Sign up to start ordering fresh meals across campus.
                </span>
              </p>
            </div>

            {/* Google */}
            <div className="mt-6 lg:mt-7">
              <GoogleButton label="Sign up with Google" />
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4 lg:my-6">
              <div className="h-px flex-1 bg-[#f0d5c8]" />
              <span className="text-xs font-semibold text-[#4a2c20]">
                or register with email
              </span>
              <div className="h-px flex-1 bg-[#f0d5c8]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className={iconClass} />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Alex Johnson"
                    required
                    className={`${fieldBox} pl-12 pr-4 lg:pl-11`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  <span className="lg:hidden">Email Address</span>
                  <span className="hidden lg:inline">Campus or Personal Email</span>
                </label>
                <div className="relative">
                  <Mail size={18} className={iconClass} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@campus.edu"
                    required
                    className={`${fieldBox} pl-12 pr-4 lg:pl-11`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <div className="flex h-[52px] w-full overflow-hidden rounded-xl border border-[#f0d5c8] bg-white transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 lg:h-11">
                  <span className="flex items-center gap-2 px-4 text-[#4a2c20] lg:border-r lg:border-[#f0d5c8] lg:bg-[#faf1ed] lg:px-3 lg:text-sm">
                    <Phone size={18} />
                    <span className="hidden lg:inline">+1</span>
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-[#2a1a14] outline-none placeholder:text-[#9b8478] lg:px-4"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole size={18} className={iconClass} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    autoComplete="new-password"
                    className={`${fieldBox} pl-12 pr-12 lg:pl-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a2c20] hover:text-orange-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {/* Strength bars (desktop) */}
                <div className="mt-2 hidden items-center justify-between lg:flex">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1 w-11 rounded-full ${
                          i < strength ? 'bg-orange-500' : 'bg-[#eadfd9]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#4a2c20]">At least 8 characters</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck size={18} className={iconClass} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    className={`${fieldBox} pl-12 pr-12 lg:pl-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a2c20] hover:text-orange-500"
                    aria-label={
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <p
                    className={`mt-2 text-xs ${
                      formData.password === formData.confirmPassword
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {formData.password === formData.confirmPassword
                      ? 'Passwords match'
                      : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-center gap-3 pt-2 text-sm text-[#4a2c20]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-[#f0d5c8] accent-orange-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="font-semibold text-[#a63a0f]">
                    Terms of Service
                  </Link>{' '}
                  <span className="lg:hidden">&</span>
                  <span className="hidden lg:inline">and</span>{' '}
                  <Link to="/privacy-policy" className="font-semibold text-[#a63a0f]">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Error / success */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600"
                >
                  {successMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-base font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 lg:h-[60px] lg:text-sm lg:shadow-none"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Campus card (UI only) */}
            {/* <button
              type="button"
              className="mt-5 flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#e8d9d1] bg-[#f6eeea] text-sm font-medium text-[#4a2c20] transition hover:bg-orange-50 lg:h-[52px]"
            >
              <Contact size={20} className="text-orange-500" />
              <span className="lg:hidden">Tap with Campus ID Card</span>
              <span className="hidden lg:inline">Or sign up with Campus Student Card</span>
            </button> */}

            {/* Desktop divider */}
            <div className="mt-6 hidden h-px bg-[#f3e4dc] lg:block" />

            {/* Login link */}
            <p className="mt-6 text-center text-base text-[#4a2c20] lg:mt-5 lg:text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#a63a0f] hover:text-orange-600">
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="mx-auto hidden w-full max-w-[560px] flex-col items-center gap-2 pb-8 pt-6 text-xs text-[#6b4a3c] lg:flex">
          <span>© 2025 Tap2Eat Inc. Campus Dining.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-orange-600">Privacy</Link>
            <span className="h-1 w-1 rounded-full bg-[#6b4a3c]" />
            <Link to="/terms" className="hover:text-orange-600">Terms of Service</Link>
            <span className="h-1 w-1 rounded-full bg-[#6b4a3c]" />
            <span className="cursor-pointer hover:text-orange-600">Help</span>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="flex items-center justify-center gap-2 border-t border-[#f3e4dc] bg-[#fbf1ec] py-4 text-xs font-medium text-[#6b4a3c] lg:hidden">
          <LockKeyhole size={14} />
          Campus SSO Encrypted • 256-bit Secure
        </div>
      </section>
    </div>
  )
}

export default RegisterPage