import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Contact,
  Eye,
  EyeOff,
  HelpCircle,
  LockKeyhole,
  Mail,
  Radio,
  ShieldCheck,
  Timer,
  UtensilsCrossed,
} from 'lucide-react'

import api from '../../services/api.js'
import GoogleButton from '../../components/GoogleButton.jsx'

// Replace with your own image, e.g. '/images/login-bg.jpg' in /public
const HERO_IMAGE =
  'public/Login/Login_hero.jpg'

const BrandMark = ({ className = '' }) => (
  <div
    className={`flex items-center justify-center rounded-xl bg-orange-600 text-white ${className}`}
  >
    <UtensilsCrossed size={18} />
  </div>
)

const LoginPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const email = formData.email.trim().toLowerCase()
    const password = formData.password

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/users/login', { email, password })
      const { accessToken, refreshToken, user } = response.data.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Invalid login response from server")
      }

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))

      setSuccessMessage('Login successful! Redirecting...')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Login failed:', error.response?.data || error)

      const status = error.response?.status
      const backendMessage =
        error.response?.data?.message || error.response?.data?.error

      if (!error.response) {
        setErrorMessage(
          'Unable to connect to the server. Please check your internet connection.'
        )
      } else if (status === 401) {
        setErrorMessage('Invalid email or password. Please try again.')
      } else if (status === 404) {
        setErrorMessage('Account not found. Please register first.')
      } else if (status === 400) {
        setErrorMessage(backendMessage || 'Please check your email and password.')
      } else if (status === 403) {
        setErrorMessage(
          backendMessage || 'Your account does not have permission to login.'
        )
      } else if (status >= 500) {
        setErrorMessage('Server error. Please try again later.')
      } else {
        setErrorMessage(backendMessage || 'Login failed. Please try again.')
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

  const inputClass =
    'h-12 w-full rounded-xl border border-[#f0cfc0] bg-white text-sm text-[#2a1a14] outline-none transition placeholder:text-[#9b8478] focus:border-orange-600 focus:ring-2 focus:ring-orange-100 lg:h-[52px]'

  return (
    <div className="min-h-screen bg-[#fff7f4] text-[#1f130e] lg:grid lg:grid-cols-[45%_55%]">
      {/* ================= LEFT PANEL (desktop only) ================= */}
      <section
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-cover bg-center p-[60px] text-white lg:flex"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/landing"
            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2.5 backdrop-blur-md"
          >
            <UtensilsCrossed size={22} />
            <span className="text-xl font-bold">Tap2Eat</span>
          </Link>

          <span className="flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1.5 text-[11px] font-bold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-white" />
            CAMPUS EXPRESS POS
          </span>
        </div>

        {/* Bottom content */}
        <div className="relative z-10">
          {/* Live stats card */}
          <div className="mb-10 flex items-center gap-5 rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-orange-600">
              <Timer size={24} />
            </div>

            <div className="pr-5">
              <p className="text-[11px] font-semibold tracking-widest text-white/70">
                LIVE CAMPUS STATS
              </p>
              <p className="text-lg font-semibold">Avg. Pickup Time: 4 mins</p>
            </div>

            <div className="ml-auto flex items-center gap-2 border-l border-white/20 pl-6 text-sm font-medium">
              <Radio size={20} />
              100% Contactless
            </div>
          </div>

          <h2 className="max-w-[560px] text-[52px] font-extrabold leading-[1.15] tracking-tight">
            Fueling your campus days with fast, wholesome meals.
          </h2>

          <p className="mt-5 max-w-[600px] text-lg leading-8 text-white/90">
            Skip the endless cafeteria queues. Pre-order freshly curated
            artisan bowls, morning brews, and grill items across all student
            dining commons.
          </p>

          {/* Trusted by */}
          <div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
            <div className="flex -space-x-3">
              {['JD', 'SK', 'AL', '+6k'].map((initials, i) => (
                <span
                  key={initials}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold ${i === 3
                    ? 'bg-[#f1e4de] text-[#5c4036]'
                    : 'bg-[#ffd9c7] text-orange-700'
                    }`}
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="max-w-[420px] text-sm leading-5 text-white/90">
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
      <section className="flex min-h-screen flex-col bg-[#fff7f4] px-5 pb-6 pt-4 lg:px-0 lg:py-0">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 text-[#4a2c20]"
          >
            <ArrowLeft size={24} />
          </button>

          <Link to="/landing" className="flex items-center gap-2">
            <BrandMark className="h-[26px] w-[26px] rounded-lg" />
            <span className="text-lg font-bold text-orange-600">Tap2Eat</span>
          </Link>

          <button
            type="button"
            aria-label="Help"
            className="p-2 text-[#4a2c20]"
          >
            <HelpCircle size={24} />
          </button>
        </div>

        {/* Form column */}
        <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center lg:max-w-[550px] lg:px-0 lg:py-10">
          {/* Mobile hero image + badge */}
          <div className="mt-3 flex flex-col items-center lg:hidden">
            <div
              className="h-[88px] w-[88px] rounded-full border-4 border-[#f6ddd2] bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            />
            <span className="-mt-3 rounded-full border border-[#f4b99f] bg-[#ffe1d2] px-4 py-1.5 text-xs font-bold text-[#a2410c]">
              Campus Express Pickup ⚡
            </span>
          </div>

          {/* Desktop logo */}
          <div className="mb-5 hidden items-center gap-2 lg:flex">
            <BrandMark className="h-11 w-11" />
            <span className="text-3xl font-bold text-orange-600">Tap2Eat</span>
          </div>

          {/* Headings */}
          <div className="mt-6 text-center lg:mt-0 lg:text-left">
            <h1 className="text-[32px] font-extrabold tracking-tight lg:text-4xl">
              Welcome Back!
            </h1>
            <p className="mt-2 text-base text-[#4a2c20] lg:text-sm">
              Login to order your favourite food.
            </p>
          </div>

          {/* Google */}
          <div className="mt-8 lg:mt-7 ">
            <GoogleButton />
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#f0cfc0]" />
            <span className="text-sm text-[#6b4a3c] lg:text-xs">
              <span className="lg:hidden">or login with email</span>
              <span className="hidden lg:inline">or continue with email</span>
            </span>
            <div className="h-px flex-1 bg-[#f0cfc0]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4a3c]"
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@campus.edu"
                  required
                  className={`${inputClass} pl-11 pr-4`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4a3c]"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={`${inputClass} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b4a3c] hover:text-orange-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-[#f0cfc0] accent-orange-600"
                />
                <span>
                  <span className="lg:hidden">Remember me</span>
                  <span className="hidden lg:inline">Remember Me</span>
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Forgot Password?
              </Link>
            </div>

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

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 lg:h-[60px]"
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  <span className="lg:hidden">Login</span>
                  <span className="hidden lg:inline">Login to Tap2Eat</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Desktop-only divider line */}
          <div className="mt-5 hidden h-px bg-[#f0cfc0] lg:block" />

          {/* Campus card */}
          {/* <button
            type="button"
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#f0cfc0] bg-white text-sm font-semibold transition hover:bg-orange-50 lg:mt-5 lg:h-12 lg:bg-[#f6eeea] lg:font-medium"
          >
            <Radio size={20} className="text-orange-600 lg:hidden" />
            <Contact size={18} className="hidden text-orange-600 lg:block" />
            <span className="lg:hidden">Tap with Campus ID Card</span>
            <span className="hidden lg:inline">
              Or sign in with Campus Student Card
            </span>
          </button> */}

          {/* Register */}
          <p className="mt-7 text-center text-base text-[#4a2c20] lg:text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-orange-600 hover:text-orange-700"
            >
              Create an Account
            </Link>
          </p>
        </div>

        {/* ===== Mobile footer ===== */}
        <div className="mx-auto mt-8 w-full max-w-[600px] border-t border-[#f0cfc0] pt-6 text-center lg:hidden">
          <p className="flex items-center justify-center gap-2 text-sm text-[#4a2c20]">
            <ShieldCheck size={16} />
            Campus SSO Encrypted
          </p>
          <p className="mt-3 text-sm text-[#7a6258]">
            By logging in, you agree to our{' '}
            <Link to="/terms" className="underline">
              Terms of Service
            </Link>{' '}
            &{' '}
            <Link to="/privacy-policy" className="underline">
              Privacy Notice
            </Link>
            .
          </p>
        </div>

        {/* ===== Desktop footer ===== */}
        <div className="mx-auto hidden w-full max-w-[550px] border-t border-[#f0cfc0] py-8 text-xs text-[#7a6258] lg:flex lg:items-center lg:justify-between lg:gap-6">
          <span className="max-w-[210px]">
            © 2025 Tap2Eat Inc. Campus Dining.
          </span>
          <Link to="/privacy-policy" className="hover:text-orange-600">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-orange-600">
            Terms of Service
          </Link>
          <span className="cursor-pointer hover:text-orange-600">Help</span>
        </div>
      </section>
    </div>
  )
}

export default LoginPage