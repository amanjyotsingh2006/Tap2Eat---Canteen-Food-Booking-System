import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../services/api.js'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Contact,
  CreditCard,
  Headphones,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Receipt,
  ShieldCheck,
  Store,
  Tag,
  Timer,
  User,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

/* ----------------------------- Placeholder data ---------------------------- */
// Replace with your own images (e.g. files in /public/images).

const COUPON_DISCOUNT = 0
const SUBSIDY = 0
const TAXES = 0

const STATIONS = [
  {
    id: 'counter',
    desktopTitle: 'Counter 2',
    mobileTitle: 'Express Counter',
    badge: 'Fastest',
    sub: 'Express Food Pickup Bar',
    detail: 'Attendant assisted, verbal number callout',
  },
  {
    id: 'locker',
    desktopTitle: 'Locker Bay #14',
    mobileTitle: 'Locker Bay #14',
    badge: 'Zero Contact',
    sub: 'Thermal Heated Smart Locker',
    detail: 'Unlock via 4-digit OTP or student card tap',
  },
]

const PAYMENTS = [
  {
    id: 'upi',
    title: 'UPI / Instant QR Payment',
    mobileTitle: 'UPI (GPay / PhonePe / Paytm)',
    desktopDesc: 'Scan terminal QR code or authorize with your virtual payment address (VPA).',
    mobileDesc: 'Instant QR & deep-link campus UPI intent',
    chips: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    mobileChips: ['Google Pay', 'PhonePe', 'BHIM'],
    mobileBadge: 'Fastest',
  },
  {
    id: 'meal',
    title: 'Campus Meal Card / Student Wallet',
    mobileTitle: 'Campus Meal Card',
    tag: '1-Click Tap',
    desktopDesc: 'Deduct directly from your university prepaid dining balance. Instant authorization without bank gateway.',
    mobileDesc: 'Direct tap from Student ID NFC / Barcode wallet',
    balance: '₹640.00',
    mobileBalance: '₹640 available',
  },
  {
    id: 'cash',
    title: 'Pay at Counter / Cash on Collection',
    mobileTitle: 'Pay at Counter / Cash',
    tag: 'Campus Favorite',
    right: 'Token Issued Instantly',
    desktopDesc:
      'An electronic kitchen counter token is generated upon checkout. Pay via cash, card, or UPI directly at the pickup window.',
    mobileDesc: 'Pay at Counter 2 during food collection voucher verification',
  },
  {
    id: 'card',
    title: 'Credit / Debit Card / Net Banking',
    mobileTitle: 'Debit / Credit Card',
    chips: ['Visa', 'Mastercard', 'RuPay'],
    mobileRight: 'RuPay • Visa • MC',
    desktopDesc: 'Campus-approved payment gateway with 3D Secure OTP verification.',
    mobileDesc: 'Online secure payment gateway with saved campus card support',
  },
]

const DESKTOP_ORDER = ['cash', 'meal', 'upi', 'card']
const MOBILE_ORDER = ['upi', 'meal', 'cash', 'card']
const byId = (ids) => ids.map((id) => PAYMENTS.find((p) => p.id === id))

const money = (n) => `₹${n.toFixed(2)}`

/* ------------------------------- Small parts ------------------------------- */
const Radio = ({ checked }) => (
  <span
    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-[#a63a0f]' : 'border-[#d9bfb3]'
      }`}
  >
    {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#a63a0f]" />}
  </span>
)

const Chip = ({ children }) => (
  <span className="rounded-md border border-[#f0d5c8] bg-[#fbf1ec] px-2.5 py-1 text-[10px] font-semibold text-[#4a2c20]">
    {children}
  </span>
)

const IconBox = ({ children, className = '' }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-lg bg-[#f6eeea] text-[#a63a0f] ${className}`}
  >
    {children}
  </span>
)

/* --------------------------------- Page ------------------------------------ */
const CheckoutPage = () => {
  const navigate = useNavigate()

  const [station, setStation] = useState('counter')
  const [payment, setPayment] = useState('cash')
  const [notes, setNotes] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [billOpen, setBillOpen] = useState(false)

  // Backend data
  const [items, setItems] = useState([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [placing, setPlacing] = useState(false)

  const [cartError, setCartError] = useState('')
  const [orderError, setOrderError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  // Backend requires deliveryAddress.
  // For Tap2Eat pickup, we send the selected pickup location.
  const [deliveryAddress, setDeliveryAddress] = useState(
    'North Canteen, Counter 2'
  )

  // Fetch actual cart items
  const fetchCart = async () => {
    try {
      setLoadingCart(true)
      setCartError('')

      const response = await api.get('/cart')

      const cartData = response.data?.data
      const cartItems = cartData?.items || []

      const formattedItems = cartItems.map((item) => {
        const food = item.food || {}
        const quantity = Number(item.quantity) || 1
        const unitPrice = Number(item.price ?? food.price ?? 0)

        return {
          id: food._id || item._id,
          name: food.name || 'Food item',
          qty: quantity,
          price: unitPrice * quantity,
          img: food.image || food.imageUrl || food.thumbnail || '',
          note: '',
        }
      })

      setItems(formattedItems)

    } catch (error) {
      console.error('Fetch cart error:', error)

      setCartError(
        error.response?.data?.message ||
        'Unable to load your cart. Please try again.'
      )
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Select pickup station
  const selectStation = (stationId) => {
    setStation(stationId)

    if (stationId === 'counter') {
      setDeliveryAddress('North Canteen, Counter 2')
    } else {
      setDeliveryAddress('North Canteen, Locker Bay #14')
    }
  }

  // Calculate actual cart total
  const totals = useMemo(() => {
    const itemTotal = items.reduce(
      (sum, item) => sum + item.price,
      0
    )

    const coupon = couponApplied ? COUPON_DISCOUNT : 0
    const total = itemTotal - coupon - SUBSIDY + TAXES
    const original = itemTotal + TAXES

    return {
      itemTotal,
      coupon,
      total,
      original,
      saved: original - total,
    }
  }, [items, couponApplied])

  const distinctItems = items.length

  // Place order through backend
  const handlePlaceOrder = async () => {
    try {
      setOrderError('')

      if (items.length === 0) {
        setOrderError('Your cart is empty.')
        return
      }

      if (!deliveryAddress.trim()) {
        setOrderError('Please select a pickup location.')
        return
      }

      // Online payment gateways are not connected yet.
      // Backend currently creates orders with paymentStatus Pending.
      if (payment !== 'cash') {
        setOrderError(
          'Online payment is not integrated yet. Please select Pay at Counter / Cash.'
        )
        return
      }

      setPlacing(true)

      const response = await api.post('/orders/placeOrder', {
        deliveryAddress: deliveryAddress,
      })

      const order = response.data?.data;

      if (!order?._id) {
        throw new Error('Order was created but the response was invalid.')
      }

      navigate(`/order-confirmation/${order._id}`, {
        state: { order },
      })

    } catch (error) {
      console.error('Place order error:', error)

      setOrderError(
        error.response?.data?.message ||
        error.message ||
        'Unable to place your order. Please try again.'
      )
    } finally {
      setPlacing(false)
    }
  }

  const instructionsField = (rows, className) => (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value.slice(0, 80))}
      rows={rows}
      placeholder="e.g. Please keep extra sambar separate..."
      className={`w-full resize-y rounded-xl border border-[#f0d5c8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9b8478] focus:border-[#a63a0f] ${className}`}
    />
  )

  // Order confirmation screen
  if (placedOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7f4] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#f0d5c8] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#2a1a14]">
            Order Placed Successfully!
          </h1>

          <p className="mt-2 text-sm text-[#6b4a3c]">
            Your Tap2Eat order has been submitted successfully.
          </p>

          <div className="mt-6 rounded-xl bg-[#fff7f4] p-4 text-left">
            <p className="text-xs text-[#6b4a3c]">Order Number</p>

            <p className="mt-1 text-lg font-bold text-[#a63a0f]">
              {placedOrder.orderNumber}
            </p>

            <div className="mt-4 flex justify-between text-sm">
              <span>Order Status</span>
              <span className="font-semibold">
                {placedOrder.status}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span>Payment Status</span>
              <span className="font-semibold">
                {placedOrder.paymentStatus}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span>Total Amount</span>
              <span className="font-bold">
                {money(Number(placedOrder.totalAmount || 0))}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/menu')}
            className="mt-6 h-12 w-full rounded-xl bg-[#a63a0f] font-bold text-white hover:bg-[#8f300c]"
          >
            Continue Shopping
          </button>

        </div>
      </div>
    )
  }

  {
    loadingCart && (
      <div className="rounded-xl bg-white p-6 text-center">
        Loading your cart...
      </div>
    )
  }

  {
    cartError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {cartError}

        <button
          onClick={fetchCart}
          className="ml-2 font-bold underline"
        >
          Retry
        </button>
      </div>
    )
  }

  {
    orderError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {orderError}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff7f4] pb-44 text-[#2a1a14] lg:pb-0">
      {/* ======================= MOBILE ======================= */}
      <div className="lg:hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-[#f3e4dc] bg-[#fff7f4] px-4 py-4">
          <Link to="/cart" aria-label="Back to cart" className="p-1">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-[#f0d5c8] bg-[#f6eeea] px-3 py-1.5 text-[11px] font-semibold text-[#4a2c20]">
            <Lock size={11} /> Secure
          </span>
        </header>

        <div className="space-y-4 px-3.5 py-4">
          {/* Stepper */}
          <div className="rounded-xl border border-[#f0d5c8] bg-white px-5 py-4">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-5 right-5 top-5 h-0.5 bg-[#f3e4dc]" />
              <div className="absolute left-5 top-5 h-0.5 w-1/2 bg-[#a63a0f]" />
              {[
                { label: 'Cart', state: 'done' },
                { label: 'Pickup & Info', state: 'active' },
                { label: 'Pay', state: 'todo' },
              ].map((s) => (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${s.state === 'active'
                      ? 'border-[#f4b99f] bg-[#a63a0f] text-white'
                      : s.state === 'done'
                        ? 'border-[#a63a0f] bg-white text-[#a63a0f]'
                        : 'border-[#d9bfb3] bg-[#f6eeea] text-[#6b4a3c]'
                      }`}
                  >
                    {s.state === 'done' ? (
                      <Check size={18} />
                    ) : s.state === 'active' ? (
                      <MapPin size={17} />
                    ) : (
                      <Banknote size={17} />
                    )}
                  </span>
                  <span
                    className={`text-[11px] ${s.state === 'active' ? 'font-bold text-[#a63a0f]' : 'text-[#4a2c20]'
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student details */}
          <section className="rounded-xl border border-[#f0d5c8] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-base font-bold">
                <Contact size={18} className="text-[#a63a0f]" /> Student Details
              </h2>
              <button type="button" className="flex items-center gap-1 text-xs font-semibold text-[#a63a0f]">
                Edit <Pencil size={11} />
              </button>
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <p className="text-base font-bold">Arjun Kumar</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#4a2c20]">
                  <Building2 size={13} /> Hostel Block 4, Rm 218
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-[#f0d5c8] bg-[#fbf1ec] px-2.5 py-1 text-[10px] font-semibold text-[#a63a0f]">
                <BadgeCheck size={12} /> Campus Verified
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] px-3 py-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#f0d5c8] pb-2">
                <span className="flex items-center gap-2">
                  <Phone size={13} className="text-[#a63a0f]" /> +91 98765 43210
                </span>
                <span className="text-[10px] text-[#6b4a3c]">Primary</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-2">
                  <Mail size={13} className="text-[#a63a0f]" /> arjun.k@campus.edu
                </span>
                <span className="font-mono text-[10px] font-bold">#STU-2024-8890</span>
              </div>
            </div>
          </section>

          {/* Pickup location */}
          <section className="rounded-xl border border-[#f0d5c8] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-base font-bold">
                <Store size={18} className="text-[#a63a0f]" /> Pickup Location
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-[#fde3d6] px-2.5 py-1 text-[10px] font-semibold text-[#a63a0f]">
                <Clock size={11} /> Ready in ~12 mins
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#a63a0f] text-white">
                <UtensilsCrossed size={20} />
              </span>
              <div>
                <p className="text-base font-bold">North Canteen — Counter 2</p>
                <p className="text-xs text-[#4a2c20]">Central Plaza Food Court, Ground Floor</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#4a2c20]">Select Pickup Method</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {STATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectStation(s.id)}
                  className={`flex h-14 items-center justify-center gap-2 rounded-xl border px-2 text-sm font-semibold transition ${station === s.id
                    ? 'border-2 border-[#a63a0f] bg-[#fdeee6] text-[#a63a0f]'
                    : 'border-[#f0d5c8] bg-white text-[#2a1a14]'
                    }`}
                >
                  {s.mobileTitle}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#4a2c20]">
              <span>Pickup Instructions (Optional)</span>
              <span>Max 80 chars</span>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 80))}
              placeholder="e.g. Extra napkins, leave at express rack..."
              className="mt-2 h-11 w-full rounded-lg border border-[#f0d5c8] bg-white px-3 text-sm outline-none placeholder:text-[#9b8478] focus:border-[#a63a0f]"
            />
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-[#f0d5c8] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-base font-bold">
                <Wallet size={18} className="text-[#a63a0f]" /> Payment Option
              </h2>
              <span className="text-xs text-[#6b4a3c]">Select One</span>
            </div>

            <div className="mt-4 space-y-3">
              {byId(MOBILE_ORDER).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPayment(p.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${payment === p.id
                    ? 'border-2 border-[#a63a0f] bg-[#fdeee6]'
                    : 'border-[#f0d5c8] bg-white'
                    }`}
                >
                  <Radio checked={payment === p.id} />
                  <span className="flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[15px] font-bold leading-snug">{p.mobileTitle}</span>
                      {p.mobileBadge && (
                        <span className="rounded bg-[#a63a0f] px-2 py-0.5 text-[10px] font-bold text-white">
                          {p.mobileBadge}
                        </span>
                      )}
                      {p.mobileBalance && (
                        <span className="shrink-0 text-[11px] font-bold text-[#a63a0f]">{p.mobileBalance}</span>
                      )}
                      {p.mobileRight && (
                        <span className="shrink-0 text-[10px] font-semibold text-[#4a2c20]">{p.mobileRight}</span>
                      )}
                      {p.id === 'cash' && <Banknote size={16} className="shrink-0 text-[#6b4a3c]" />}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#4a2c20]">{p.mobileDesc}</span>
                    {p.mobileChips && (
                      <span className="mt-2 flex flex-wrap gap-2">
                        {p.mobileChips.map((c) => (
                          <Chip key={c}>{c}</Chip>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Bill summary */}
          <section className="rounded-xl border border-[#f0d5c8] bg-white p-4">
            <button
              type="button"
              onClick={() => setBillOpen((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
              aria-expanded={billOpen}
            >
              <Receipt size={18} className="shrink-0 text-[#a63a0f]" />
              <span className="flex-1">
                <span className="block text-[15px] font-bold leading-snug">
                  {distinctItems} Items from North Canteen
                </span>
                <span className="mt-0.5 block text-xs text-[#4a2c20]">Tap to inspect items & bill</span>
              </span>
              <span className="text-base font-bold text-[#a63a0f]">{money(totals.total)}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 transition ${billOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {billOpen && (
              <div className="mt-4 space-y-3 border-t border-[#f3e4dc] pt-4 text-sm">
                {items.map((i) => (
                  <div key={i.name} className="flex items-center justify-between">
                    <span>
                      {i.name} <span className="text-xs text-[#6b4a3c]">× {i.qty}</span>
                    </span>
                    <span className="font-semibold">{money(i.price)}</span>
                  </div>
                ))}
                {couponApplied && (
                  <div className="flex justify-between text-[#a63a0f]">
                    <span>Coupon (CAMPUSFEAST)</span>
                    <span>-{money(COUPON_DISCOUNT)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#a63a0f]">
                  <span>Campus Student Subsidy (10%)</span>
                  <span>-{money(SUBSIDY)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Canteen Facility Fee</span>
                  <span>{money(TAXES)}</span>
                </div>
              </div>
            )}
          </section>

          <p className="flex items-center gap-2 px-1 text-[11px] text-[#2a1a14]">
            <ShieldCheck size={14} className="text-[#a63a0f]" />
            Express queue token issued instantly after confirmation.
          </p>
        </div>

        {/* Mobile footer */}
        <footer className="mt-6 bg-[#f6eeea] px-6 py-8 text-center">
          <p className="text-base font-bold">Tap2Eat</p>
          <p className="mt-2 text-sm leading-6 text-[#4a2c20]">
            © 2024 Tap2Eat Technologies Inc. All orders protected by 256-bit campus secure checkout.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-[#4a2c20]">
            <Link to="/privacy-policy">Security & Privacy</Link>
            <Link to="/terms">Terms of Service</Link>
            <span>Canteen Standards</span>
            <span>Support Desk</span>
          </div>
        </footer>

        {/* Mobile sticky bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#f3e4dc] bg-white px-4 pb-3 pt-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-[#4a2c20]">To Pay</p>
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-[28px] font-bold leading-none">{money(totals.total)}</span>
                <span className="font-mono text-xs text-[#6b4a3c] line-through">{money(totals.original)}</span>
              </p>
            </div>
            <span className="mb-1 flex items-center gap-1.5 rounded-full border border-[#f4b99f] bg-[#fde3d6] px-3 py-1 text-[11px] font-semibold text-[#a63a0f]">
              <Tag size={11} /> Saved {money(totals.saved)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing}
            className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#a63a0f] text-base font-bold text-white transition active:scale-[0.99] disabled:opacity-60"
          >
            {placing ? 'Placing order...' : `Place Order (${money(totals.total)})`}
            {!placing && <ArrowRight size={18} />}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#4a2c20]">
            <Lock size={11} /> 100% Secure Campus Transaction • Encrypted
          </p>
        </div>
      </div>

      {/* ======================= DESKTOP ======================= */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="border-b border-[#f3e4dc] bg-[#fff7f4]">
          <div className="mx-auto flex h-[54px] max-w-[1500px] items-center justify-between px-7">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a63a0f] text-white">
                  <UtensilsCrossed size={16} />
                </span>
                <span className="text-xl font-bold text-[#a63a0f]">Tap2Eat</span>
              </Link>
              <span className="h-5 w-px bg-[#e8d5cb]" />
              <span className="text-[11px] text-[#4a2c20]">Campus Express Checkout</span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#f0d5c8] bg-[#f6eeea] px-3 py-1 text-[10px] font-semibold text-[#4a2c20]">
                <Lock size={10} /> 256-Bit SSL
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs font-medium text-[#4a2c20]">
              <Link to="/cart" className="flex items-center gap-2 hover:text-[#a63a0f]">
                <ArrowLeft size={14} /> Return to Cart
              </Link>
              <button type="button" className="flex items-center gap-1.5 text-[#a63a0f] hover:underline">
                <HelpCircle size={14} /> Help
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-7 pb-16 pt-7">
          {/* Stepper */}
          <div className="rounded-xl border border-[#f0d5c8] bg-white px-10 py-5">
            <div className="mx-auto flex max-w-[860px] items-center justify-between">
              {[
                { n: 1, a: 'Step 1', b: 'Cart Review', state: 'done' },
                { n: 2, a: 'Step 2', b: 'Details & Pickup', state: 'active' },
                { n: 3, a: 'Step 3', b: 'Payment & OTP', state: 'todo' },
              ].map((s, idx) => (
                <React.Fragment key={s.n}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${s.state === 'active'
                        ? 'bg-[#a63a0f] text-white ring-4 ring-[#f4d4c6]'
                        : s.state === 'done'
                          ? 'border border-[#a63a0f] bg-white text-[#a63a0f]'
                          : 'bg-[#f1e4de] text-[#4a2c20]'
                        }`}
                    >
                      {s.state === 'done' ? <Check size={16} /> : s.n}
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11px] text-[#4a2c20]">{s.a}</p>
                      <p
                        className={`text-sm ${s.state === 'active' ? 'font-bold text-[#a63a0f]' : 'font-medium'
                          }`}
                      >
                        {s.b}
                      </p>
                    </div>
                  </div>
                  {idx < 2 && (
                    <span
                      className={`mx-4 h-0.5 flex-1 ${idx === 0 ? 'bg-[#a63a0f]' : 'bg-[#f0d5c8]'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-[1fr_328px] items-start gap-7">
            {/* ---------- LEFT ---------- */}
            <div className="space-y-6">
              {/* Customer details */}
              <section className="rounded-xl border border-[#f0d5c8] bg-white p-6">
                <div className="flex items-start justify-between border-b border-[#f3e4dc] pb-4">
                  <div className="flex items-center gap-4">
                    <IconBox className="h-11 w-11">
                      <Contact size={20} />
                    </IconBox>
                    <div>
                      <h2 className="text-xl font-bold">Customer & Student Details</h2>
                      <p className="text-xs text-[#4a2c20]">
                        Verified credentials for identity & fast food-locker validation
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-[#f4b99f] bg-[#fde3d6] px-3 py-1.5 text-[11px] font-semibold text-[#a63a0f]">
                    <BadgeCheck size={13} /> Verified Campus Student
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                    <p className="text-[11px] text-[#4a2c20]">Full Name & Hostel Unit</p>
                    <p className="mt-1.5 text-base font-bold">Arjun Kumar</p>
                    <p className="text-xs text-[#4a2c20]">Hostel Block 4, Room 218</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#a63a0f]">
                      <Building2 size={12} /> Campus Resident
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                    <p className="text-[11px] text-[#4a2c20]">Campus Webmail</p>
                    <p className="mt-1.5 text-base font-bold">arjun.kumar@campus.edu</p>
                    <p className="text-xs text-[#4a2c20]">Auto-synced with Campus SSO</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#4a2c20]">
                      <Mail size={12} /> Active University Directory
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                    <p className="text-[11px] text-[#4a2c20]">Mobile Contact (for OTP token)</p>
                    <p className="mt-1.5 text-base font-bold">+91 98765 43210</p>
                    <p className="text-xs text-[#4a2c20]">SMS & WhatsApp Alerts Enabled</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#a63a0f]">
                      <MessageSquare size={12} /> Instant dispatch alert verified
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                    <p className="text-[11px] text-[#4a2c20]">University Roll / Student ID</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="font-mono text-base font-bold">#STU-2024-8890</p>
                      <span className="rounded border border-[#a63a0f] px-2 py-0.5 text-[10px] font-bold text-[#a63a0f]">
                        ⊙ 33 TappPoints
                      </span>
                    </div>
                    <p className="text-xs text-[#4a2c20]">Eligible for meal subsidization</p>
                    <p className="mt-3 text-[11px] font-semibold text-[#a63a0f]">Available for auto-redemption</p>
                  </div>
                </div>
              </section>

              {/* Pickup point */}
              <section className="rounded-xl border border-[#f0d5c8] bg-white p-6">
                <div className="flex items-center gap-4">
                  <IconBox className="h-11 w-11">
                    <Store size={20} />
                  </IconBox>
                  <div>
                    <h2 className="text-xl font-bold">Campus Pickup Point & Timing</h2>
                    <p className="text-xs text-[#4a2c20]">
                      Designated collection zone and instant kitchen preparation schedule
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-lg border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                  <div className="flex items-center gap-4">
                    <MapPin size={20} className="text-[#a63a0f]" />
                    <div>
                      <p className="text-base font-bold">North Canteen</p>
                      <p className="text-xs text-[#4a2c20]">Ground Floor, Central Dining Hall (West Wing Corridor)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-[#f4b99f] bg-[#fde3d6] px-4 py-2.5">
                    <Timer size={20} className="text-[#a63a0f]" />
                    <div className="text-[11px] leading-4 text-[#a63a0f]">
                      <p className="font-bold">Ready in ~12–15 mins</p>
                      <p>Estimated: 1:25 PM</p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm font-semibold">Select Pickup Station</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {STATIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStation(s.id)}
                      className={`rounded-xl border p-4 text-left transition ${station === s.id
                        ? 'border-2 border-[#a63a0f] bg-[#fff7f4]'
                        : 'border-[#f0d5c8] bg-white hover:border-[#a63a0f]'
                        }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${station === s.id ? 'border-[#a63a0f]' : 'border-[#4a2c20]'
                              }`}
                          >
                            {station === s.id && <span className="h-2 w-2 rounded-full bg-[#a63a0f]" />}
                          </span>
                          <span className="text-base font-bold">{s.desktopTitle}</span>
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${s.id === 'counter'
                            ? 'bg-transparent text-[#a63a0f]'
                            : 'bg-[#f1e4de] text-[#4a2c20]'
                            }`}
                        >
                          {s.badge}
                        </span>
                      </span>
                      <span className="mt-2 block text-xs text-[#4a2c20]">{s.sub}</span>
                      <span className="mt-3 flex items-center gap-1.5 text-[11px] text-[#2a1a14]">
                        {s.id === 'counter' ? <User size={12} /> : <Lock size={12} />}
                        {s.detail}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm font-semibold">
                  Pickup Instructions or Chef Notes{' '}
                  <span className="text-xs font-normal text-[#4a2c20]">(Optional)</span>
                </p>
                {instructionsField(3, 'mt-2')}
                <p className="mt-2 text-[11px] text-[#4a2c20]">
                  Special requests are forwarded immediately to the culinary line.
                </p>
              </section>

              {/* Payment method */}
              <section className="rounded-xl border border-[#f0d5c8] bg-white p-6">
                <div className="flex items-center gap-4">
                  <IconBox className="h-11 w-11">
                    <Banknote size={20} />
                  </IconBox>
                  <div>
                    <h2 className="text-xl font-bold">Select Payment Method</h2>
                    <p className="text-xs text-[#4a2c20]">Multiple campus-friendly settlement options supported</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {byId(DESKTOP_ORDER).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPayment(p.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left transition ${payment === p.id
                        ? 'border-2 border-[#a63a0f] bg-[#fff7f4]'
                        : 'border-[#f0d5c8] bg-white hover:border-[#a63a0f]'
                        }`}
                    >
                      <Radio checked={payment === p.id} />
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-3">
                            <span className="text-base font-bold">{p.title}</span>
                            {p.tag && (
                              <span className="rounded bg-[#fde3d6] px-2 py-0.5 text-[10px] font-semibold text-[#a63a0f]">
                                {p.tag}
                              </span>
                            )}
                          </span>
                          {p.right && <span className="text-xs text-[#4a2c20]">{p.right}</span>}
                          {p.balance && (
                            <span className="text-base font-bold text-[#a63a0f]">Balance: {p.balance}</span>
                          )}
                          {p.chips && (
                            <span className="flex gap-2">
                              {p.chips.map((c) => (
                                <Chip key={c}>{c}</Chip>
                              ))}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-xs text-[#4a2c20]">{p.desktopDesc}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-5 flex items-center gap-2 border-t border-[#f3e4dc] pt-4 text-xs text-[#4a2c20]">
                  <ShieldCheck size={14} className="text-[#a63a0f]" />
                  Zero cancellation fee before kitchen preparation starts. Refunds issued immediately.
                </p>
              </section>
            </div>

            {/* ---------- RIGHT: ORDER SUMMARY ---------- */}
            <aside className="sticky top-6 space-y-4">
              <div className="rounded-xl border border-[#f0d5c8] bg-white p-5">
                <div className="flex items-start justify-between border-b border-[#f3e4dc] pb-3">
                  <div>
                    <h3 className="text-base font-bold">Order Summary</h3>
                    <p className="text-[11px] text-[#4a2c20]">{distinctItems} items from North Canteen</p>
                  </div>
                  <span className="rounded bg-[#fde3d6] px-2 py-1 text-[10px] font-bold text-[#a63a0f]">
                    Veg Kitchen
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((i) => (
                    <div key={i.name} className="flex items-center gap-3">
                      {i.img ? (
                        <img
                          src={i.img}
                          alt={i.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f6eeea] text-[#a63a0f]">
                          <UtensilsCrossed size={20} />
                        </div>
                      )}
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{i.name}</span>
                          <span className="font-semibold">{money(i.price)}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-[#4a2c20]">
                          <span>Qty: {i.qty}</span>
                          <span className={i.note.startsWith('+') ? 'text-[#a63a0f]' : ''}>{i.note}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {couponApplied && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-[#a63a0f] bg-[#fff7f4] px-3 py-2.5">
                    <Tag size={14} className="text-[#a63a0f]" />
                    <div className="flex-1 text-[11px]">
                      <p className="font-bold">CAMPUSFEAST</p>
                      <p className="text-[#a63a0f]">₹50 off student coupon applied</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCouponApplied(false)}
                      className="text-[11px] text-[#4a2c20] hover:text-[#a63a0f]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="mt-4 space-y-2 border-b border-[#f3e4dc] pb-4 text-xs">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span>{money(totals.itemTotal)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-[#a63a0f]">
                      <span>Coupon Discount (CAMPUSFEAST)</span>
                      <span>-{money(COUPON_DISCOUNT)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#a63a0f]">
                    <span>Campus Student Subsidy (10%)</span>
                    <span>-{money(SUBSIDY)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Canteen Facility Fee</span>
                    <span>{money(TAXES)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <span className="text-base font-bold">Total Amount</span>
                  <span className="text-[22px] font-extrabold text-[#a63a0f]">{money(totals.total)}</span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-[#a63a0f]">
                  You save {money(totals.saved)} on this order
                </p>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c2410c] text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-[#a63a0f] active:scale-[0.99] disabled:opacity-60"
                >
                  {placing ? 'Placing order...' : 'Place Order & Get Pickup OTP'}
                  {!placing && <ArrowRight size={16} />}
                </button>

                <div className="mt-4 space-y-1.5 border-t border-[#f3e4dc] pt-4 text-center text-[11px] text-[#2a1a14]">
                  <p className="flex items-center justify-center gap-1.5">
                    <MessageSquare size={11} /> Instant Token on WhatsApp & SMS
                  </p>
                  <p className="flex items-center justify-center gap-1.5">
                    <Clock size={11} className="text-[#a63a0f]" /> Free Cancellation within 2 mins
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#f0d5c8] bg-[#f6eeea] px-4 py-3.5 text-xs">
                <span className="flex items-center gap-2 text-[#4a2c20]">
                  <Headphones size={15} className="text-[#a63a0f]" /> Dining Help Desk: Ext 4022
                </span>
                <span className="font-semibold text-[#a63a0f]">Active Now</span>
              </div>
            </aside>
          </div>
        </div>

        {/* Desktop footer */}
        <footer className="border-t border-[#f0d5c8] bg-[#f6eeea]">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-7 py-8 text-xs text-[#4a2c20]">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-[#2a1a14]">Tap2Eat</span>
              <span className="h-1 w-1 rounded-full bg-[#6b4a3c]" />
              <span>© 2024 Tap2Eat Technologies Inc. All orders protected by 256-bit campus secure checkout.</span>
            </div>
            <div className="flex gap-8">
              <Link to="/privacy-policy" className="hover:text-[#a63a0f]">Security & Privacy</Link>
              <Link to="/terms" className="hover:text-[#a63a0f]">Terms of Service</Link>
              <span className="cursor-pointer hover:text-[#a63a0f]">Canteen Standards</span>
              <span className="cursor-pointer hover:text-[#a63a0f]">Support Desk</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CheckoutPage