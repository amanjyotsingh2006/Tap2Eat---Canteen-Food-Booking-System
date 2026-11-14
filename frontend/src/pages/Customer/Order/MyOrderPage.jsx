
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChefHat,
  Search,
  ArrowLeft,
  CircleHelp,
  ChevronRight,
  RotateCcw,
  Star,
  Store,
  BadgeCheck,
  CircleAlert,
  Clock,
  ReceiptText,
  Headphones,
  Compass,
  User,
  ShoppingCart,
  MapPin,
} from 'lucide-react'

import api from '../../../services/api.js'
import Header from '../../../components/Header.jsx'

/* ---------------- Status configuration ---------------- */

const statusConfig = {
  ready: {
    label: 'Ready for Pickup',
    pill: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-600',
    card: 'border-purple-300 ring-2 ring-purple-100',
    head: 'bg-purple-50/60',
  },
  preparing: {
    label: 'Preparing',
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
    card: 'border-orange-100',
    head: 'bg-orange-50/40',
  },
  pending: {
    label: 'Pending',
    pill: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    card: 'border-orange-100',
    head: 'bg-orange-50/40',
  },
  completed: {
    label: 'Completed',
    pill: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-600',
    card: 'border-orange-100',
    head: 'bg-orange-50/40',
  },
  cancelled: {
    label: 'Cancelled',
    pill: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-600',
    card: 'border-orange-100',
    head: 'bg-orange-50/40',
  },
}

const tabs = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready for Pickup' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

/* ---------------- Helpers ---------------- */

const fmt = (amount) => `₹${Number(amount || 0).toFixed(2)}`

const formatOrderDate = (date) => {
  if (!date) return 'Date unavailable'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable'
  }

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const mapOrder = (order) => {
  const status = String(order.status || 'Pending').toLowerCase()
  const paymentStatus = String(
    order.paymentStatus || 'Pending'
  ).toLowerCase()

  const items = (order.items || []).map((item) => {
    const food =
      item.food && typeof item.food === 'object'
        ? item.food
        : {}

    return {
      foodId: food._id || item.food,
      name: food.name || 'Food item',
      qty: Number(item.quantity || 1),
      price: Number(item.price || 0),
      image: food.image || '/images/food-placeholder.png',
    }
  })

  const totalQuantity = items.reduce(
    (total, item) => total + item.qty,
    0
  )

  return {
    id: order._id,
    orderNumber: order.orderNumber || order._id,
    status,
    date: formatOrderDate(order.createdAt),
    deliveryAddress: order.deliveryAddress || '',
    items,
    summary: items.length
      ? items.map((item) => `${item.name} (x${item.qty})`).join(', ')
      : 'No items available',
    meta: `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`,
    total: Number(order.totalAmount || 0),

    paymentStatus,

    payNote: {
      success: 'Payment Successful',
      pending: 'Payment Pending',
      failed: 'Payment Failed',
      refunded: 'Payment Refunded',
    }[paymentStatus] || 'Payment Status Unknown',

    cancellable:
      status === 'pending' && paymentStatus !== 'success',
  }
}

/* ---------------- Navigation ---------------- */

const MobileTopBar = () => {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-extrabold">My Orders</h1>

        <div className="ml-auto flex items-center gap-1">
          <button
            aria-label="Search"
            onClick={() => document.getElementById('orders-search')?.focus()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"
          >
            <Search size={19} />
          </button>

          <button
            aria-label="Help"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"
          >
            <CircleHelp size={19} />
          </button>
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
              <Link
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-orange-700' : 'text-gray-600'
                  }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-orange-600 text-white' : ''
                    }`}
                >
                  <Icon size={20} />
                </span>

                {badge > 0 && (
                  <span className="absolute right-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-700 px-1 text-[9px] font-bold text-white ring-2 ring-white">
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
    {items.slice(0, 3).map((item, index) => (
      <div
        key={item.foodId || `${item.name}-${index}`}
        className="relative h-14 w-14 overflow-hidden rounded-xl bg-orange-50 sm:h-16 sm:w-16"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/food-placeholder.png'
          }}
          className="h-full w-full object-cover"
        />

        {item.qty > 1 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-700 px-1 text-[9px] font-bold text-white">
            {item.qty}
          </span>
        )}
      </div>
    ))}
  </div>
)

const OrderCard = ({
  order,
  onCancel,
  onReorder,
  cancellingId,
  reorderingId,
}) => {
  const cfg = statusConfig[order.status] || statusConfig.pending

  const isActive = ['ready', 'preparing', 'pending'].includes(
    order.status
  )

  const cancelled = order.status === 'cancelled'
  const canReorder = ['completed', 'cancelled'].includes(order.status)

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${cfg.card}`}
    >
      {/* Header */}
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-orange-100 px-4 py-3 text-xs sm:px-5 ${cfg.head}`}
      >
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        <span className="text-gray-500">
          Order <b className="text-gray-800">#{order.orderNumber}</b>
        </span>

        <span className="hidden text-gray-400 sm:inline">
          • {order.date}
        </span>

        <p className="w-full text-[11px] text-gray-400 sm:hidden">
          {order.date}
        </p>
      </div>

      {/* Body */}
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_280px] md:gap-0">
        <div className="min-w-0 md:pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <Store size={15} className="text-orange-700" />
            <h3 className="text-sm font-bold">Tap2Eat Order</h3>
          </div>

          {order.deliveryAddress && (
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <MapPin size={14} className="mt-0.5 shrink-0 text-orange-600" />
              <span>
                <b className="text-gray-700">Delivery Address:</b>{' '}
                {order.deliveryAddress}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <Thumbs items={order.items} />

            <div className="min-w-0">
              <p
                className={`text-sm font-semibold leading-snug ${cancelled
                    ? 'text-red-700 line-through decoration-red-300'
                    : ''
                  }`}
              >
                {order.summary}
              </p>

              <p
                className={`mt-1 text-[11px] ${cancelled ? 'text-red-600' : 'text-gray-500'
                  }`}
              >
                {order.meta}
              </p>
            </div>
          </div>
        </div>

        {/* Payment and actions */}
        <div className="flex flex-col justify-between gap-4 border-t border-orange-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:text-right">
          <div>
            <p className="text-[11px] text-gray-500">Order Total</p>

            <p
              className={`text-2xl font-extrabold ${cancelled ? 'text-gray-500' : ''
                }`}
            >
              {fmt(order.total)}
            </p>

            {order.paymentStatus === 'success' && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-green-600 md:justify-end">
                <BadgeCheck size={13} />
                {order.payNote}
              </p>
            )}

            {order.paymentStatus === 'pending' && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-orange-600 md:justify-end">
                <CircleAlert size={13} />
                {order.payNote}
              </p>
            )}

            {['failed', 'refunded'].includes(order.paymentStatus) && (
              <p className="mt-1 text-[11px] text-gray-500">
                {order.payNote}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {order.cancellable && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={cancellingId === order.id}
                className="px-2 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                {cancellingId === order.id
                  ? 'Cancelling...'
                  : 'Cancel Order'}
              </button>
            )}

            {canReorder && (
              <button
                onClick={() => onReorder(order)}
                disabled={reorderingId === order.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
              >
                <RotateCcw size={13} />
                {reorderingId === order.id ? 'Adding Items...' : 'Reorder Items'}
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
      <div className="grid grid-cols-3 gap-8 text-xs text-gray-600">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <ChefHat size={17} />
            </div>
            <span className="text-base font-extrabold text-orange-700">
              Tap2Eat
            </span>
          </div>
          <p className="leading-5">
            Order your favourite food easily with Tap2Eat.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Quick Links</h4>
          <Link to="/menu" className="block hover:text-orange-700">
            Explore Menu
          </Link>
          <Link to="/orders" className="block hover:text-orange-700">
            My Orders
          </Link>
          <Link to="/favourites" className="block hover:text-orange-700">
            Favourites
          </Link>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Need Support?</h4>
          <p>Need help with your order?</p>
          <Link
            to="/profile"
            className="font-semibold text-orange-700 hover:underline"
          >
            Contact / Profile
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-orange-100 pt-5 text-[11px] text-gray-500">
        <span>© 2026 Tap2Eat. All rights reserved.</span>

        <div className="flex gap-6">
          <Link to="/privacy-policy" className="hover:text-orange-700">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-orange-700">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  </footer>
)

/* ---------------- Main page ---------------- */

const OrdersPage = () => {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [reorderingId, setReorderingId] = useState(null)

  /* ---------------- Fetch orders ---------------- */

  const fetchOrders = async () => {
    try {
      setError('')

      const response = await api.get('/orders/getOrders')

      const orderData = response.data.data

      const ordersArray = Array.isArray(orderData)
        ? orderData
        : orderData?.orders || []

      setOrders(ordersArray.map(mapOrder))
    } catch (error) {
      console.error('Fetch orders error:', error)

      setError(
        error.response?.data?.message ||
        'Unable to fetch your orders. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Fetch cart count ---------------- */

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/')

      const cart = response.data.data

      const count = (cart?.items || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      )

      setCartCount(count)
    } catch (error) {
      console.error('Fetch cart error:', error)
    }
  }

  /* ---------------- Initial loading ---------------- */

  useEffect(() => {
    fetchOrders()
    fetchCart()
  }, [])

  /* ---------------- Cancel order ---------------- */

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    )

    if (!confirmed) return

    try {
      setCancellingId(id)

      const response = await api.patch(
        `/orders/cancelOrder/${id}`
      )

      alert(
        response.data.message || 'Order cancelled successfully.'
      )

      await fetchOrders()
    } catch (error) {
      console.error('Cancel order error:', error)

      alert(
        error.response?.data?.message ||
        'Unable to cancel this order.'
      )
    } finally {
      setCancellingId(null)
    }
  }

  /* ---------------- Reorder items ---------------- */

  const handleReorder = async (order) => {
    try {
      const validItems = order.items.filter(
        (item) => item.foodId
      )

      if (!validItems.length) {
        alert('No valid food items available to reorder.')
        return
      }

      setReorderingId(order.id)

      for (const item of validItems) {
        await api.post('/cart/add', {
          foodId: item.foodId,
          quantity: item.qty,
        })
      }

      await fetchCart()

      alert('Items added to your cart successfully.')

      navigate('/cart')
    } catch (error) {
      console.error('Reorder error:', error)

      alert(
        error.response?.data?.message ||
        'Unable to reorder items. Please try again.'
      )

      await fetchCart()
    } finally {
      setReorderingId(null)
    }
  }

  /* ---------------- Order counts ---------------- */

  const counts = useMemo(() => {
    const result = { all: orders.length }

    orders.forEach((order) => {
      result[order.status] = (result[order.status] || 0) + 1
    })

    return result
  }, [orders])

  /* ---------------- Search and filtering ---------------- */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      if (tab !== 'all' && order.status !== tab) {
        return false
      }

      if (!query) return true

      return (
        `${order.orderNumber} ${order.summary} ${order.deliveryAddress}`
          .toLowerCase()
          .includes(query)
      )
    })
  }, [orders, tab, search])

  const active = filtered.filter((order) =>
    ['ready', 'preparing', 'pending'].includes(order.status)
  )

  const past = filtered.filter((order) =>
    ['completed', 'cancelled'].includes(order.status)
  )

  const activeTotal = orders.filter((order) =>
    ['ready', 'preparing', 'pending'].includes(order.status)
  ).length

  /* ---------------- Refresh ---------------- */

  const handleRefresh = () => {
    setLoading(true)
    fetchOrders()
    fetchCart()
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">
      <Header cartCount={cartCount} hideOnMobile />
      <MobileTopBar />

      <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-0">
        {/* Breadcrumb */}
        <nav className="mt-6 hidden items-center gap-2 text-[11px] text-gray-500 lg:flex">
          <Link to="/" className="hover:text-orange-700">
            Home
          </Link>
          <ChevronRight size={11} />
          <span>Orders</span>
          <ChevronRight size={11} />
          <span className="font-semibold text-gray-800">
            Order History
          </span>
        </nav>

        {/* Title and search */}
        <section className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="hidden lg:block">
            <h1 className="text-3xl font-extrabold tracking-tight">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View your order history and manage your orders.
            </p>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative w-[330px]">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="orders-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID or dish..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Mobile search */}
        <div className="mt-4 lg:hidden">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="orders-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or dish..."
              className="h-11 w-full rounded-xl border border-orange-100 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-5 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((item) => {
            const isSelected = tab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${isSelected
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-orange-200 bg-white text-gray-700 hover:bg-orange-50'
                  }`}
              >
                {item.label}

                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${isSelected
                      ? 'bg-white/25'
                      : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {counts[item.id] || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

            <p className="text-sm text-gray-500">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={handleRefresh}
              className="mt-3 rounded-lg bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Active orders */}
        {!loading && !error && active.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold lg:text-lg">
                Active Orders ({active.length})
              </h2>

              <span className="text-[11px] text-gray-500">
                {active.length} active
              </span>
            </div>

            <div className="space-y-4">
              {active.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancel}
                  onReorder={handleReorder}
                  cancellingId={cancellingId}
                  reorderingId={reorderingId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past orders */}
        {!loading && !error && past.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide lg:text-lg lg:font-bold lg:normal-case lg:tracking-normal">
                <Clock size={15} className="lg:hidden" />
                Order History ({past.length})
              </h2>
            </div>

            <div className="space-y-4">
              {past.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancel}
                  onReorder={handleReorder}
                  cancellingId={cancellingId}
                  reorderingId={reorderingId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-white py-16 text-center text-sm text-gray-500">
            {orders.length === 0
              ? 'You have not placed any orders yet.'
              : 'No orders match your search.'}

            <div className="mt-3">
              <button
                onClick={() => {
                  setTab('all')
                  setSearch('')
                }}
                className="font-bold text-orange-700 hover:underline"
              >
                View All Orders
              </button>
            </div>

            {orders.length === 0 && (
              <Link
                to="/menu"
                className="mt-4 inline-block rounded-lg bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-700"
              >
                Explore Menu
              </Link>
            )}
          </div>
        )}

        {/* Information cards */}
        <section className="mt-10 hidden gap-4 md:grid md:grid-cols-3">
          {[
            {
              icon: ReceiptText,
              title: 'Order History',
              text: 'View your previous orders, order totals, and payment statuses.',
              tint: 'bg-orange-100 text-orange-700',
            },
            {
              icon: RotateCcw,
              title: 'Quick Reorder',
              text: 'Add items from your completed or cancelled orders back to your cart.',
              tint: 'bg-green-100 text-green-700',
            },
            {
              icon: Headphones,
              title: 'Need Support?',
              text: 'Visit your profile for account and support-related information.',
              tint: 'bg-blue-100 text-blue-700',
            },
          ].map(({ icon: Icon, title, text, tint }) => (
            <div
              key={title}
              className="flex gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
              >
                <Icon size={18} />
              </span>

              <div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />

      <BottomNav
        cartCount={cartCount}
        activeOrders={activeTotal}
      />
    </div>
  )
}

export default OrdersPage
