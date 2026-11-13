import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChefHat,
  Search,
  Bell,
  ShoppingBag,
  ArrowLeft,
  CircleHelp,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  QrCode,
  CheckCircle2,
  BadgeCheck,
  Clock,
  Hourglass,
  Navigation,
  RotateCcw,
  Download,
  Star,
  Store,
  Lock,
  ReceiptText,
  Headphones,
  Compass,
  User,
  ShoppingCart,
  Home,
  Info,
  CircleAlert,
  Radio,
} from 'lucide-react'

import Header from '../../../components/Header.jsx'

/* ---------------- Mock data (replace with API data) ---------------- */

const initialOrders = [
  {
    id: 'T2E-89241',
    status: 'ready',
    date: 'Today, 24 Oct 2025 • 01:21 PM',
    canteen: 'North Canteen',
    station: 'Counter 2 Express Pickup',
    token: '#B-42',
    pin: '4821',
    items: [
      { name: 'Crispy Masala Dosa', qty: 2, image: '/images/masala-dosa.jpg' },
      { name: 'Paneer Butter Masala Combo', qty: 1, image: '/images/paneer-butter-masala.jpg' },
      { name: 'Kesar Mango Lassi', qty: 1, image: '/images/mango-lassi.jpg' },
    ],
    summary: 'Crispy Masala Dosa (x2), Paneer Butter Masala Combo, Kesar Mango Lassi',
    meta: '3 items • Locker Bay #14 ready for tap collection',
    total: 331.8,
    payLabel: 'Total Paid (UPI)',
    payNote: 'Payment Verified',
    payState: 'ok',
    banner: 'Order is ready! Scan token at Counter 2 or Locker Bay #14.',
  },
  {
    id: 'T2E-88914',
    status: 'preparing',
    date: 'Today, 24 Oct 2025 • 12:45 PM',
    canteen: 'South Food Court',
    station: 'Station 4 (Biryani Special)',
    token: '#A-19',
    items: [
      { name: 'Hyderabadi Chicken Dum Biryani', qty: 1, image: '/images/biryani.jpg' },
      { name: 'Masala Chai & Bun Maska', qty: 1, image: '/images/chai-bun.jpg' },
    ],
    summary: 'Hyderabadi Chicken Dum Biryani, Masala Chai & Bun Maska',
    meta: '2 items • Paid via Campus Meal Card',
    total: 205,
    payLabel: 'Total Paid (Meal Card)',
    payNote: 'ID: #CMC-48190',
    progress: { percent: 45, text: 'In Kitchen • 3 orders ahead', eta: 'Est. 1:05 PM (~8 mins remaining)' },
  },
  {
    id: 'T2E-88650',
    status: 'pending',
    date: 'Today, 24 Oct 2025 • 12:15 PM',
    canteen: 'Central Library Cafe',
    station: 'Awaiting Canteen Acceptance',
    token: '#C-08',
    tokenNote: 'Pay at Counter',
    items: [
      { name: 'Cold Coffee Frappe', qty: 2, image: '/images/cold-coffee.jpg' },
      { name: 'Veg Puff', qty: 2, image: '/images/veg-puff.jpg' },
    ],
    summary: 'Cold Coffee Frappe (x2), Veg Puff (x2)',
    meta: '4 items • Transmitted to cafe terminal',
    total: 160,
    payLabel: 'Payable at Counter',
    payNote: 'Unpaid Order',
    payState: 'unpaid',
    banner: 'The kitchen will acknowledge within 2 minutes. You can cancel with zero charge.',
    cancellable: true,
  },
  {
    id: 'T2E-86412',
    status: 'completed',
    date: 'Yesterday, 23 Oct 2025 • 07:30 PM',
    canteen: 'North Canteen',
    headerNote: 'Collected at Counter 1 • 7:48 PM',
    items: [
      { name: 'Chole Bhature (2 pcs)', qty: 1, image: '/images/chole-bhature.jpg' },
      { name: 'Gulab Jamun with Rabdi', qty: 1, image: '/images/gulab-jamun.jpg' },
    ],
    summary: 'Chole Bhature (2 pcs), Gulab Jamun with Rabdi',
    meta: 'North Indian Dinner Combo',
    total: 285,
    payLabel: 'Paid via UPI',
    review: 4.5,
  },
  {
    id: 'T2E-84190',
    status: 'completed',
    date: '21 Oct 2025 • 09:15 AM',
    canteen: 'North Canteen',
    headerNote: 'Morning Breakfast Order',
    items: [
      { name: 'Medu Vada Sambar', qty: 1, image: '/images/medu-vada.jpg' },
      { name: 'Authentic Filter Coffee', qty: 1, image: '/images/filter-coffee.jpg' },
    ],
    summary: 'Medu Vada Sambar, Authentic Filter Coffee',
    meta: 'Breakfast Special (2 items)',
    total: 95,
    payLabel: 'Paid via Campus Meal Card',
  },
  {
    id: 'T2E-82901',
    status: 'cancelled',
    date: '19 Oct 2025 • 01:10 PM',
    canteen: 'Science Block Canteen',
    headerNote: 'Refund processed to Campus Meal Card',
    items: [{ name: 'Rajma Chawal Bowl', qty: 1, image: '/images/rajma-chawal.jpg' }],
    summary: 'Rajma Chawal Bowl',
    meta: 'Cancellation reason: Canteen out of stock • Auto-refunded (₹140.00)',
    total: 140,
    payLabel: 'Refund Status',
    payNote: 'Credited on 19 Oct, 01:14 PM',
  },
]

const statusConfig = {
  ready: { label: 'Ready for Pickup', pill: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', card: 'border-purple-300 ring-2 ring-purple-100', head: 'bg-purple-50/60' },
  preparing: { label: 'Preparing', pill: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', card: 'border-orange-100', head: 'bg-orange-50/40' },
  pending: { label: 'Pending', pill: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', card: 'border-orange-100', head: 'bg-orange-50/40' },
  completed: { label: 'Completed', pill: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-600', card: 'border-orange-100', head: 'bg-orange-50/40' },
  cancelled: { label: 'Cancelled', pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-600', card: 'border-orange-100', head: 'bg-orange-50/40' },
}

const tabs = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready for Pickup' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const navLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/orders', label: 'My Orders' },
]

const fmt = (n) => `₹${n.toFixed(2)}`

/* ---------------- Navigation ---------------- */

const MobileTopBar = () => {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold">My Orders</h1>
        <div className="ml-auto flex items-center gap-1">
          <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"><Search size={19} /></button>
          <button aria-label="Help" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"><CircleHelp size={19} /></button>
        </div>
      </div>
    </header>
  )
}

const BottomNav = ({ cartCount, activeOrders }) => {
  const { pathname } = useLocation()
  const items = [
    { to: '/menu', label: 'Explore', icon: Compass },
    { to: '/orders', label: 'Orders', icon: ReceiptText, badge: activeOrders },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { to: '/profile', label: 'Profile', icon: User },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(({ to, label, icon: Icon, badge }) => {
          const active = pathname === to
          return (
            <li key={to}>
              <Link to={to} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-orange-700' : 'text-gray-600'}`}>
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-orange-600 text-white' : ''}`}>
                  <Icon size={20} />
                </span>
                {badge > 0 && (
                  <span className="absolute right-5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-700 text-[9px] font-bold text-white ring-2 ring-white">
                    {badge}
                  </span>
                )}
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ---------------- Order card ---------------- */

const Thumbs = ({ items }) => (
  <div className="flex shrink-0 gap-2">
    {items.slice(0, 3).map((it) => (
      <div key={it.name} className="relative h-14 w-14 overflow-hidden rounded-xl bg-orange-50 sm:h-16 sm:w-16">
        <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
        {it.qty > 1 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-700 px-1 text-[9px] font-bold text-white">
            {it.qty}
          </span>
        )}
      </div>
    ))}
  </div>
)

const OrderCard = ({ order, onCancel, onReorder }) => {
  const cfg = statusConfig[order.status]
  const isActive = ['ready', 'preparing', 'pending'].includes(order.status)
  const cancelled = order.status === 'cancelled'

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${cfg.card}`}>
      {/* Header strip */}
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-orange-100 px-4 py-3 text-xs sm:px-5 ${cfg.head}`}>
        <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-gray-500">
          Order <b className="text-gray-800">#{order.id}</b>
        </span>
        <span className="hidden text-gray-400 sm:inline">• {order.date}</span>

        <div className="ml-auto flex items-center gap-2">
          {isActive && order.token && (
            <span
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                order.status === 'ready' ? 'bg-purple-700 text-white' : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              {order.status === 'ready' && <QrCode size={13} />}
              TOKEN {order.token}
              <span className={`font-medium ${order.status === 'ready' ? 'text-white/80' : 'text-gray-500'}`}>
                {order.tokenNote || order.station?.split(' ').slice(0, 2).join(' ')}
              </span>
            </span>
          )}
          {order.headerNote && (
            <span className={`flex items-center gap-1.5 text-[11px] ${cancelled ? 'font-semibold text-red-600' : order.status === 'completed' && order.headerNote.startsWith('Collected') ? 'text-green-700' : 'text-gray-500'}`}>
              {order.status === 'completed' && order.headerNote.startsWith('Collected') && <CheckCircle2 size={13} />}
              <span className="hidden sm:inline">{order.headerNote}</span>
            </span>
          )}
        </div>
        <p className="w-full text-[11px] text-gray-400 sm:hidden">{order.date}</p>
      </div>

      {/* Body */}
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_280px] md:gap-0">
        {/* Left */}
        <div className="min-w-0 md:pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <Store size={15} className="text-orange-700" />
            <h3 className="text-sm font-bold">{order.canteen}</h3>
            {order.station && <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{order.station}</span>}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <Thumbs items={order.items} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold leading-snug ${cancelled ? 'text-red-700 line-through decoration-red-300' : ''}`}>
                {order.summary}
              </p>
              <p className={`mt-1 text-[11px] ${cancelled ? 'text-red-600' : 'text-gray-500'}`}>{order.meta}</p>
            </div>
          </div>

          {/* Progress */}
          {order.progress && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                  <ChefHat size={13} /> {order.progress.text}
                </span>
                <span className="text-gray-500">{order.progress.eta}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${order.progress.percent}%` }} />
              </div>
            </div>
          )}

          {/* Banner */}
          {order.banner && (
            <div
              className={`mt-4 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] ${
                order.status === 'ready'
                  ? 'border-purple-100 bg-purple-50 text-purple-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {order.status === 'ready' ? <CheckCircle2 size={14} /> : <Hourglass size={14} />}
              <span className="flex-1">{order.banner}</span>
              {order.status === 'ready' && (
                <button className="flex items-center gap-1 font-bold text-purple-700">
                  <QrCode size={13} /> Show Pickup QR / Token
                </button>
              )}
            </div>
          )}

          {order.review && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
              Your review:
              <span className="flex text-orange-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={s <= Math.round(order.review) ? 'fill-orange-500' : ''} />
                ))}
              </span>
              ({order.review}/5 rated)
            </p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col justify-between gap-4 border-t border-orange-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:text-right">
          <div>
            <p className="text-[11px] text-gray-500">{order.payLabel}</p>
            <p className={`text-2xl font-extrabold ${cancelled ? 'text-green-700' : ''}`}>
              {cancelled ? '+' : ''}{fmt(order.total)}
            </p>
            {order.payState === 'ok' && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-green-600 md:justify-end">
                <BadgeCheck size={13} /> {order.payNote}
              </p>
            )}
            {order.payState === 'unpaid' && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-orange-600 md:justify-end">
                <CircleAlert size={13} /> {order.payNote}
              </p>
            )}
            {!order.payState && order.payNote && <p className="mt-1 text-[11px] text-gray-500">{order.payNote}</p>}
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {order.cancellable && (
              <button onClick={() => onCancel(order.id)} className="px-2 text-xs font-semibold text-red-600 hover:underline">
                Cancel Order
              </button>
            )}
            <button className="flex-1 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-orange-50 md:flex-none">
              {order.status === 'completed' && order.review ? 'View Details & Invoice' : cancelled ? 'View Details & Refund Receipt' : 'View Details'}
            </button>
            {isActive && (
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 md:flex-none">
                <Navigation size={13} /> {order.status === 'pending' ? 'Track Order' : 'Track Live Order'}
              </button>
            )}
            {order.status === 'completed' && (
              <button onClick={() => onReorder(order)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 md:flex-none">
                <RotateCcw size={13} /> Reorder Items
              </button>
            )}
            {cancelled && (
              <button onClick={() => onReorder(order)} className="flex-1 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-xs font-semibold text-orange-700 hover:bg-orange-50 md:flex-none">
                Reorder
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* ---------------- Footer ---------------- */

const Footer = () => (
  <footer className="mt-12 hidden border-t border-orange-100 bg-orange-50/50 lg:block">
    <div className="mx-auto px-8 py-10">
      <div className="grid grid-cols-4 gap-8 text-xs text-gray-600">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white"><ChefHat size={17} /></div>
            <span className="text-base font-extrabold text-orange-700">Tap2Eat</span>
          </div>
          <p className="leading-5">High-efficiency food-tech dining platform engineered for university campuses and rapid student dining orchestration.</p>
          <p className="mt-3 text-[10px] text-gray-400">Version 2.4.12 • Campus Build #802</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Operating Hours</h4>
          <p>North Canteen: 07:30 AM – 10:30 PM</p>
          <p>South Food Court: 08:00 AM – 11:00 PM</p>
          <p>Science Block: 09:00 AM – 06:00 PM</p>
          <p>Library Night Cafe: 08:00 PM – 02:00 AM</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Student Dining</h4>
          <Link to="/meal-card" className="block hover:text-orange-700">Meal Card Recharge</Link>
          <Link to="/allergens" className="block hover:text-orange-700">Dietary & Allergen Matrix</Link>
          <Link to="/mess-passes" className="block hover:text-orange-700">Campus Hostel Mess Passes</Link>
          <Link to="/subsidy" className="block hover:text-orange-700">Student Subsidy Policy</Link>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Need Support?</h4>
          <p>Instant kitchen escalation & token verification desk:</p>
          <div className="rounded-lg border border-orange-100 bg-white p-3">
            <p className="font-bold text-gray-900">Campus Helpline: +91 (800) 420-EATS</p>
            <p className="text-gray-500">support@tap2eat-campus.edu</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-orange-100 pt-5 text-[11px] text-gray-500">
        <span>© 2026 Tap2Eat Food-Tech Systems. University Dining Services. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="hover:text-orange-700">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-orange-700">Terms of Service</Link>
          <Link to="/hygiene" className="hover:text-orange-700">Kitchen Hygiene Reports</Link>
          <Link to="/fssai" className="hover:text-orange-700">FSSAI Compliance</Link>
        </div>
      </div>
    </div>
  </footer>
)

/* ---------------- Page ---------------- */

const OrdersPage = () => {
  const [orders, setOrders] = useState(initialOrders)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(3)

  const handleCancel = (id) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled', cancellable: false, banner: undefined, headerNote: 'Cancelled by you • No charge', token: undefined } : o)))

  const handleReorder = (order) => setCartCount((c) => c + order.items.reduce((s, i) => s + i.qty, 0))

  const counts = useMemo(() => {
    const c = { all: orders.length }
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (tab !== 'all' && o.status !== tab) return false
      if (!q) return true
      return (o.id + o.canteen + o.summary).toLowerCase().includes(q)
    })
  }, [orders, tab, search])

  const active = filtered.filter((o) => ['ready', 'preparing', 'pending'].includes(o.status))
  const past = filtered.filter((o) => ['completed', 'cancelled'].includes(o.status))
  const activeTotal = orders.filter((o) => ['ready', 'preparing', 'pending'].includes(o.status)).length

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">
      <Header cartCount={cartCount} hideOnMobile />
      <MobileTopBar />

      <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-0">
        {/* Breadcrumb */}
        <nav className="mt-6 hidden items-center gap-2 text-[11px] text-gray-500 lg:flex">
          <Link to="/" className="hover:text-orange-700">Home</Link><ChevronRight size={11} />
          <span>Orders</span><ChevronRight size={11} />
          <span className="font-semibold text-gray-800">Order History</span>
        </nav>

        {/* Title + search */}
        <section className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="hidden lg:block">
            <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
            <p className="mt-1 text-sm text-gray-600">Track live meal tokens and view your campus canteen dining history</p>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative w-[330px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID, canteen, or dish..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-orange-500"
              />
            </div>
            <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold hover:bg-orange-50">
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </section>

        {/* Mobile search + kitchen status */}
        <div className="mt-4 space-y-3 lg:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, canteen or dish..."
              className="h-11 w-full rounded-xl border border-orange-100 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <button className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 font-semibold text-gray-700">
              <Store size={14} className="text-orange-700" /> Active: North Canteen & All <ChevronDown size={13} />
            </button>
            <span className="flex items-center gap-1.5 font-semibold text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Kitchens Live
            </span>
          </div>
        </div>

        {/* Status tabs */}
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-5 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                {t.label}
                <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${isActive ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[t.id] || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active orders */}
        {active.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold lg:text-lg">
                <span className="lg:hidden text-sm font-extrabold uppercase tracking-wide">Live Active Orders ({active.length})</span>
                <span className="hidden lg:inline">Active Dining Passes</span>
                <span className="hidden rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 lg:inline">
                  {active.length} In Progress
                </span>
              </h2>
              <span className="flex items-center gap-1.5 text-[11px] text-green-600">
                <Radio size={12} />
                <span className="lg:hidden text-gray-500">Auto-refreshing</span>
                <span className="hidden lg:inline">Live token sync active</span>
              </span>
            </div>
            <div className="space-y-4">
              {active.map((o) => (
                <OrderCard key={o.id} order={o} onCancel={handleCancel} onReorder={handleReorder} />
              ))}
            </div>
          </section>
        )}

        {/* Past orders */}
        {past.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide lg:text-lg lg:font-bold lg:normal-case lg:tracking-normal">
                <Clock size={15} className="lg:hidden" />
                <span className="lg:hidden">Order History</span>
                <span className="hidden lg:inline">Past Order History</span>
                <span className="hidden rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 lg:inline">
                  {past.length} Records
                </span>
              </h2>
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 hover:underline">
                <span className="lg:hidden">Download Statements</span>
                <span className="hidden lg:inline">Download Monthly Statement</span>
                <Download size={12} className="hidden lg:block" />
              </button>
            </div>
            <div className="space-y-4">
              {past.map((o) => (
                <OrderCard key={o.id} order={o} onCancel={handleCancel} onReorder={handleReorder} />
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-white py-16 text-center text-sm text-gray-500">
            No orders match your search.
            <button onClick={() => { setTab('all'); setSearch('') }} className="ml-2 font-bold text-orange-700">Reset</button>
          </div>
        )}

        {/* Info cards (desktop/tablet) */}
        <section className="mt-10 hidden gap-4 md:grid md:grid-cols-3">
          {[
            { icon: Lock, title: 'Express Locker Bays', text: 'Tap your student NFC ID card or scan pickup QR at designated heated lockers for 15-second pickup.', tint: 'bg-orange-100 text-orange-700' },
            { icon: ReceiptText, title: 'Direct Refund Guarantee', text: 'Orders unacknowledged within 5 minutes or cancelled by kitchen are immediately refunded to source account.', tint: 'bg-green-100 text-green-700' },
            { icon: Headphones, title: 'Canteen Helpdesk', text: 'Discrepancy with meal token? Call Campus Dining Central Desk at Ext. 4410 or chat with live kitchen lead.', tint: 'bg-blue-100 text-blue-700' },
          ].map(({ icon: Icon, title, text, tint }) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}><Icon size={18} /></span>
              <div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
      <BottomNav cartCount={cartCount} activeOrders={activeTotal} />
    </div>
  )
}

export default OrdersPage