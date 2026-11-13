import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChefHat, MapPin, ChevronDown, Bell, ShoppingBag } from 'lucide-react'
import api from '../services/api' // adjust the path if your folder layout differs

const navLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/orders', label: 'My Orders' },
]

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export default function Header({ canteen = 'North Canteen', hideOnMobile = false }) {
  const { pathname } = useLocation()
  const [user, setUser] = useState(readUser)
  const [cart, setCart] = useState({ count: 0, total: 0 })

  /* ---- cart: fetch now, and again whenever a page fires "cart-updated" ---- */
  const loadCart = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return setCart({ count: 0, total: 0 })
    try {
      const res = await api.get('/cart') // <-- change if your cart endpoint differs
      const data = res.data?.data
      const items = Array.isArray(data) ? data : data?.items || []

      const count = items.reduce((s, i) => s + (i.quantity || 1), 0)
      const total =
        data?.totalAmount ??
        items.reduce((s, i) => s + (i.food?.price ?? i.price ?? 0) * (i.quantity || 1), 0)

      setCart({ count, total })
    } catch {
      /* not logged in or cart empty — keep header quiet */
    }
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [loadCart])

  /* ---- user: use cached copy instantly, refresh from API in background ---- */
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return
    api
      .get('/profile/profile')
      .then((res) => {
        const profile = res.data?.data
        if (profile) {
          setUser(profile)
          localStorage.setItem('user', JSON.stringify(profile))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur ${
        hideOnMobile ? 'hidden lg:block' : ''
      }`}
    >
      <div className="mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700 text-white">
            <ChefHat size={20} />
          </div>
          <span className="text-lg font-extrabold text-orange-800">Tap2Eat</span>
        </Link>

        {/* Mobile location pill */}
        <button
          type="button"
          className="flex min-w-0 items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 lg:hidden"
        >
          <MapPin size={13} className="shrink-0 text-orange-600" />
          <span className="truncate">{canteen}</span>
          <ChevronDown size={13} className="shrink-0" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.to || pathname.startsWith(l.to + '/')
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 py-5 text-sm font-semibold transition ${
                  active
                    ? 'border-orange-700 text-orange-700'
                    : 'border-transparent text-gray-600 hover:text-orange-700'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/notification"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50"
          >
            <Bell size={20} />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Link>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative flex items-center gap-2 rounded-xl bg-orange-100 px-2.5 py-2 text-orange-800 hover:bg-orange-200 lg:px-3"
          >
            <ShoppingBag size={20} />
            {cart.count > 0 && (
              <>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-700 text-[10px] font-bold text-white lg:hidden">
                  {cart.count}
                </span>
                <span className="hidden text-left text-[10px] font-bold leading-tight lg:block">
                  {cart.count} items
                  <br />₹{cart.total}
                </span>
              </>
            )}
          </Link>

          {/* Profile (desktop) */}
          <Link to="/profile" className="hidden items-center gap-2 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-orange-800">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-[11px] leading-tight">
              <p className="font-bold">{user?.fullName || 'User'}</p>
              <p className="text-gray-500">{user?.email || ''}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}