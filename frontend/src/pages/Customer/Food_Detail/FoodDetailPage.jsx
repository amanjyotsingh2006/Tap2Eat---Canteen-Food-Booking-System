import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../../services/api.js'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BadgeCheck,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Home,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Timer,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import Header from '../../../components/Header.jsx'

/* ----------------------------- Placeholder data ---------------------------- */
// Replace these with your own images (e.g. put files in /public/images).
const IMG = {
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80',
  chutney: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
  combo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  vada: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?auto=format&fit=crop&w=800&q=80',
  coffee: 'https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?auto=format&fit=crop&w=800&q=80',
  paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  lassi: 'https://images.unsplash.com/photo-1571006682889-e1b4ee02c8d6?auto=format&fit=crop&w=800&q=80',
}

const GALLERY = [
  { label: 'Aloo Masala', src: IMG.dosa },
  { label: 'Chutneys', src: IMG.chutney },
  { label: 'Combo View', src: IMG.combo },
]

const SPICE_LEVELS = [
  { id: 'mild', desktop: ['Mild', 'Low chili'], mobile: ['Mild', 'Gentle'] },
  { id: 'medium', desktop: ['Medium Spiced', 'Classic Canteen'], mobile: ['Medium', 'Default'] },
  { id: 'spicy', desktop: ['Spicy Andhra', 'Extra green chili'], mobile: ['Spicy', 'Extra Chili'] },
]

// price is shared between desktop and mobile; edit names/prices to taste
const EXTRAS = [
  {
    id: 'chutney',
    desktopName: 'Extra Coconut Chutney',
    mobileName: 'Extra Sambar (Katori)',
    mobileDesc: 'Piping hot vegetable stew',
    price: 10,
  },
  {
    id: 'ghee',
    desktopName: 'Extra Gunpowder Podi Ghee',
    mobileName: 'Ghee Podi Sprinkle',
    mobileDesc: 'Coarse lentil spice with melted ghee',
    price: 15,
  },
]

const RELATED = [
  { name: 'Medu Vada Sambar (2 pcs)', mobileName: 'Medu Vada (1 pc)', desc: 'Crisp lentil donuts with hot sambar', price: 70, mobilePrice: 35, tag: 'VEG', rating: 4.8, img: IMG.vada },
  { name: 'Filter Coffee (Brass Tumbler)', mobileName: 'Filter Coffee', desc: 'Chicory blend brewed fresh in milk', price: 25, mobilePrice: 25, tag: 'BEVERAGE', rating: 4.9, img: IMG.coffee },
  { name: 'Paneer Butter Masala Combo', mobileName: 'Paneer Combo', desc: 'With 2 butter phulkas & jeera rice', price: 140, mobilePrice: 140, tag: 'COMBO', rating: 4.8, img: IMG.paneer },
  { name: 'Kesar Mango Lassi', mobileName: 'Kesar Mango Lassi', desc: 'Clay kulhad with pistachios & saffron', price: 50, mobilePrice: 50, tag: 'CHILLED', rating: 4.9, img: IMG.lassi },
]

const NUTRITION = [
  { label: 'Calories', value: '340', unit: 'kcal' },
  { label: 'Protein', value: '8g', unit: 'plant source' },
  { label: 'Carbs', value: '48g', unit: 'slow release' },
  { label: 'Fats', value: '12g', unit: 'pure ghee' },
]

const BASE_PRICE = 90

/* ------------------------------- Small parts ------------------------------- */
const Logo = ({ size = 'md' }) => (
  <Link to="/" className="flex items-center gap-2">
    <span
      className={`flex items-center justify-center rounded-xl bg-[#a63a0f] text-white ${size === 'md' ? 'h-[50px] w-[50px]' : 'h-10 w-10'
        }`}
    >
      <UtensilsCrossed size={size === 'md' ? 22 : 18} />
    </span>
    <span className={`font-bold text-[#a63a0f] ${size === 'md' ? 'text-[28px]' : 'text-2xl'}`}>
      Tap2Eat
    </span>
  </Link>
)

const Checkbox = ({ checked }) => (
  <span
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? 'border-[#a63a0f] bg-[#a63a0f]' : 'border-[#d9bfb3] bg-white'
      }`}
  >
    {checked && (
      <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
      </svg>
    )}
  </span>
)

/* --------------------------------- Page ------------------------------------ */
const FoodDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  const [activeImage, setActiveImage] = useState(0)
  const [spice, setSpice] = useState('medium')
  const [selectedExtras, setSelectedExtras] = useState([])
  const [qty, setQty] = useState(1)
  const [liked, setLiked] = useState(false)
  const [favouriteLoading, setFavouriteLoading] = useState(false)

  // Fetch food details
  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/foods/${id}`)

        const foodData = response.data?.data

        if (!foodData) {
          throw new Error('Food details not found')
        }

        setFood(foodData)
      } catch (err) {
        console.error('Food details error:', err)

        setError(
          err.response?.data?.message ||
          err.message ||
          'Unable to load food details'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFoodDetails()
    }
  }, [id])

  // Fetch favourite status for the current food
  useEffect(() => {
    const fetchFavouriteStatus = async () => {
      try {
        const response = await api.get('/favourites')
        const favourites = response.data?.data ?? []

        const isSaved = Array.isArray(favourites) && favourites.some(
          (item) => String(item.food?._id || item.food) === String(id)
        )

        setLiked(isSaved)
      } catch (err) {
        console.error(
          'Favourite status fetching failed:',
          err.response?.data?.message || err.message
        )
      }
    }

    if (id) {
      fetchFavouriteStatus()
    }
  }, [id])

  // Get dynamic food information
  const foodName = food?.name || 'Food Item'
  const foodDescription = food?.description || ''
  const basePrice = Number(food?.price ?? 0)

  const foodImage =
    food?.image ||
    food?.imageUrl ||
    food?.foodImage ||
    IMG.dosa

  const foodCategory =
    typeof food?.category === 'object'
      ? food.category?.name
      : food?.category

  const total = useMemo(() => {
    return basePrice * qty
  }, [basePrice, qty])

  const toggleExtra = (id) => {
    setSelectedExtras((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  // Add food to cart
  const handleAddToCart = async () => {
    if (!food?._id) {
      alert('Food information is missing')
      return
    }

    try {
      setAddingToCart(true)

      const response = await api.post('/cart/add', {
        foodId: food._id,
        quantity: qty,
      })

      navigate("/cart")

    } catch (err) {
      console.error('Add to cart error:', err)

      if (err.response?.status === 401) {
        alert('Please login to add items to your cart')
        navigate('/login')
        return
      }

      alert(
        err.response?.data?.message ||
        'Unable to add food to cart. Please try again.'
      )
    } finally {
      setAddingToCart(false)
    }
  }

  const QtyControl = ({ className = '', compact = false }) => (
    <div className={`flex items-center justify-between rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] ${className}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className={`flex items-center justify-center text-[#4a2c20] ${compact ? 'h-10 w-10 rounded-lg bg-white shadow-sm' : 'h-full flex-1'
          }`}
      >
        <Minus size={16} />
      </button>
      <span className={`text-center font-semibold ${compact ? 'w-8' : 'flex-1'}`}>{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty((q) => q + 1)}
        className={`flex items-center justify-center text-[#4a2c20] ${compact ? 'h-10 w-10 rounded-lg bg-white shadow-sm' : 'h-full flex-1'
          }`}
      >
        <Plus size={16} />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7f4]">
        <p className="text-lg font-semibold text-[#a63a0f]">
          Loading food details...
        </p>
      </div>
    )
  }

  if (error || !food) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fff7f4]">
        <h2 className="text-xl font-bold text-[#a63a0f]">
          {error || 'Food not found'}
        </h2>

        <Link
          to="/menu"
          className="rounded-lg bg-[#a63a0f] px-6 py-3 font-semibold text-white"
        >
          Back to Menu
        </Link>
      </div>
    )
  }

  // Add or remove food from favourites
  const handleToggleFavourite = async () => {
    if (!food?._id || favouriteLoading) return

    try {
      setFavouriteLoading(true)

      if (liked) {
        await api.delete(`/favourites/delete/${food._id}`)
        setLiked(false)
      } else {
        await api.post(`/favourites/add/${food._id}`)
        setLiked(true)
      }
    } catch (err) {
      console.error('Favourite update failed:', err)

      alert(
        err.response?.data?.message ||
        'Unable to update favourites. Please try again.'
      )
    } finally {
      setFavouriteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f4] pb-24 text-[#2a1a14] lg:pb-0">
      {/* ======================= DESKTOP NAVBAR ======================= */}
      <Header />

      {/* ======================= MOBILE HERO ======================= */}
      <div className="relative h-[330px] lg:hidden">
        <img
          src={foodImage}
          alt={foodName}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/menu"
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <ArrowLeft size={20} />
          </Link>

          <button
            type="button"
            onClick={handleToggleFavourite}
            disabled={favouriteLoading}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <Heart
              size={20}
              className={liked ? 'fill-[#a63a0f] text-[#a63a0f]' : 'text-[#a63a0f]'}
            />
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-4 flex gap-2">
        <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2a1a14]">
          <span className="flex h-4 w-4 items-center justify-center rounded-sm border-2 border-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          </span>
          100% Veg
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#a63a0f] px-3 py-1.5 text-xs font-semibold text-white">
          <Zap size={12} />
          5m Prep
        </span>
      </div>
      {/* </div> */}

      {/* ======================= MOBILE CONTENT ======================= */}
      <div className="relative -mt-6 rounded-t-[28px] bg-[#fffdfc] px-4 pb-8 pt-5 lg:hidden">
        <div className="flex items-center justify-between text-xs text-[#4a2c20]">
          <span>South Indian • Breakfast & All-Day</span>
          <span className="rounded-full bg-[#fde3d6] px-3 py-1 font-semibold text-[#a63a0f]">Counter 2</span>
        </div>

        <h1 className="mt-2 text-[28px] font-extrabold tracking-tight">
          {foodName}
        </h1>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#4a2c20]">
            <span className="flex items-center gap-1 rounded bg-[#a63a0f] px-2 py-1 text-xs font-bold text-white">
              4.9 <Star size={11} />
            </span>
            (1.2k reviews • 3.4k ordered)
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            In Stock
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-[#f3e4dc] pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-extrabold leading-none">₹{basePrice}</span>
            <span className="text-sm text-[#6b4a3c] line-through">₹{basePrice}</span>
            <span className="rounded bg-[#fde3d6] px-2 py-0.5 text-xs font-semibold text-[#a63a0f]">Save ₹20</span>
          </div>
          <span className="text-xs italic text-[#4a2c20]">Campus tax incl.</span>
        </div>

        <p className="mt-4 text-base leading-7 text-[#4a2c20]">
          {foodDescription}
        </p>

        {/* Wait card */}
        <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fde3d6] text-[#a63a0f]">
            <Timer size={20} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">North Canteen</p>
            <p className="text-xs text-[#4a2c20]">Express Pickup available at Counter 2</p>
          </div>
          <span className="text-sm font-bold text-[#a63a0f]">~6 mins wait</span>
        </div>

        {/* Nutritional balance */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#4a2c20]">Nutritional Balance</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['340 kcal', '8g Protein', '100% Veg', 'Gluten-Free'].map((c) => (
            <span key={c} className="rounded-full bg-[#f6eeea] px-4 py-1.5 text-xs font-medium text-[#4a2c20]">
              {c}
            </span>
          ))}
        </div>

        {/* Spice */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Choose Spice Level</h2>
          <span className="rounded bg-[#fde3d6] px-2 py-0.5 text-xs font-semibold text-[#a63a0f]">Required</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SPICE_LEVELS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpice(s.id)}
              className={`rounded-xl border px-2 py-3 text-center transition ${spice === s.id
                ? 'border-2 border-[#a63a0f] bg-[#fdeee6] text-[#a63a0f]'
                : 'border-[#f0d5c8] bg-white text-[#2a1a14]'
                }`}
            >
              <p className="text-sm font-semibold">{s.mobile[0]}</p>
              <p className="mt-0.5 text-[11px]">{s.mobile[1]}</p>
            </button>
          ))}
        </div>

        {/* Extras */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Frequently Added Extras</h2>
          <span className="text-xs text-[#4a2c20]">Optional</span>
        </div>
        <div className="mt-3 space-y-3">
          {EXTRAS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => toggleExtra(e.id)}
              className="flex w-full items-center gap-4 rounded-xl border border-[#f0d5c8] bg-white p-4 text-left"
            >
              <Checkbox checked={selectedExtras.includes(e.id)} />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{e.mobileName}</span>
                <span className="block text-xs text-[#4a2c20]">{e.mobileDesc}</span>
              </span>
              <span className="text-sm font-semibold">+₹{basePrice}</span>
            </button>
          ))}
        </div>

        {/* Ingredients */}
        <div className="mt-6 border-t border-[#f3e4dc] pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4a2c20]">Authentic Ingredients</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Rice', 'Urad Dal', 'Potatoes', 'Mustard Seeds', 'Curry Leaves', 'Pure Ghee'].map((i) => (
              <span key={i} className="rounded-lg bg-[#f6eeea] px-3 py-1.5 text-sm text-[#4a2c20]">
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* Often paired with */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Often Paired With</h2>
          <span className="text-xs font-semibold text-[#a63a0f]">Campus Specials</span>
        </div>
        <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
          {[RELATED[1], RELATED[0], RELATED[3]].map((r) => (
            <div key={r.name} className="w-[170px] shrink-0 rounded-2xl border border-[#f0d5c8] bg-white p-2">
              <img src={foodImage} alt={r.mobileName} className="h-[100px] w-full rounded-xl object-cover" />
              <p className="mt-2 text-sm font-semibold">{r.mobileName}</p>
              <p className="text-[11px] text-[#4a2c20]">{r.desc.split(' ').slice(0, 2).join(' ')}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold">₹{basePrice}</span>
                <button type="button" className="rounded-md bg-[#f6eeea] px-3 py-1 text-xs font-semibold text-[#a63a0f]">
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================= MOBILE STICKY BAR ======================= */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-[#f3e4dc] bg-white p-4 lg:hidden">
        <QtyControl compact className="p-1" />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="flex h-[52px] flex-1 items-center justify-between rounded-xl bg-[#a63a0f] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={18} />
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </span>
          <span>₹{total}</span>
        </button>
      </div>

      {/* ======================= DESKTOP CONTENT ======================= */}
      <main className="mx-auto hidden max-w-[1600px] px-10 pb-16 pt-8 lg:block">
        {/* Breadcrumb */}

        <nav className="flex items-center gap-3 text-sm text-[#4a2c20]">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-[#a63a0f]">
            <Home size={15} /> Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/menu" className="hover:text-[#a63a0f]">Menu</Link>
          <ChevronRight size={14} />
          <Link to="/menu" className="hover:text-[#a63a0f]">{foodCategory}</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#a63a0f]">{foodName}</span>
        </nav>

        <div className="mt-6 grid grid-cols-2 items-start gap-[50px]">
          {/* ---------- LEFT COLUMN ---------- */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#f0d5c8] bg-white">
              <div className="relative h-[550px]">
                <img
                  src={foodImage}
                  alt={GALLERY[activeImage].label}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-5 top-5 flex gap-3">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-green-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm border-2 border-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    </span>
                    PURE VEG
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-[#a63a0f] px-4 py-2 text-xs font-bold text-white">
                    <Award size={14} />
                    Chef's Campus Special
                  </span>
                </div>

                <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#a63a0f]">
                  <Zap size={14} />
                  Ready in 5-7 mins
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3 text-xs">
                <span className="flex items-center gap-2 text-[#4a2c20]">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Prepared live upon order placement
                </span>
                <span className="flex items-center gap-2 font-semibold text-[#a63a0f]">
                  <Flame size={14} />
                  Fresh on Cast Iron Tawa
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {GALLERY.map((g, i) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-[178px] overflow-hidden rounded-xl border-2 transition ${activeImage === i ? 'border-[#a63a0f]' : 'border-[#f0d5c8]'
                    }`}
                >
                  <img src={foodImage} alt={g.label} className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-[#a63a0f]">
                    {g.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#f0d5c8] rounded-xl border border-[#f0d5c8] bg-white py-4">
              {[
                { icon: <Sparkles size={18} />, t: '100% Fresh', d: 'Daily ground batter' },
                { icon: <ShieldCheck size={18} />, t: 'Zero Trans Fats', d: 'Pure ghee & oils' },
                { icon: <BadgeCheck size={18} />, t: 'FSSAI Certified', d: 'Audited canteen' },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-3 px-5">
                  <span className="text-[#a63a0f]">{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{f.t}</p>
                    <p className="text-xs text-[#4a2c20]">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Counter card */}
            <div className="mt-5 rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fde3d6] text-[#a63a0f]">
                  <Store size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">North Canteen Counter 2</h3>
                  <p className="text-sm text-[#4a2c20]">Near Academic Block C Ground Floor</p>
                </div>
                <span className="rounded-full bg-[#fde3d6] px-3 py-1 text-xs font-bold text-[#a63a0f]">
                  Live Queue: Fast
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#f0d5c8] pt-4 text-sm">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-[#a63a0f]" />
                  <b>4 orders ahead</b> in queue
                </span>
                <span className="flex items-center gap-2">
                  <Package size={16} className="text-[#a63a0f]" />
                  <b>Express Locker Pickup</b> available
                </span>
              </div>
            </div>
          </div>

          {/* ---------- RIGHT COLUMN ---------- */}
          <div className="rounded-2xl border border-[#f0d5c8] bg-white p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f6eeea] px-4 py-1.5 text-xs font-medium text-[#4a2c20]">
                South Indian • Breakfast & Tiffin
              </span>
              <span className="flex items-center gap-2 rounded-full bg-[#fde3d6] px-4 py-1.5 text-xs font-bold text-[#a63a0f]">
                <Flame size={13} />
                Top Rated Campus Bite
              </span>
              <span className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                In Stock • Sizzling Live on Tawa
              </span>
            </div>

            <h1 className="mt-4 text-[42px] font-extrabold leading-tight tracking-tight">
              {foodName}
            </h1>
            <p className="mt-1 text-lg text-[#4a2c20]">
              {foodDescription}
            </p>

            <div className="mt-4 flex items-center gap-4 border-b border-[#f0d5c8] pb-4 text-sm">
              <span className="flex items-center gap-1 rounded bg-[#a63a0f] px-3 py-1 text-sm font-bold text-white">
                4.9 <Star size={13} className="fill-white" />
              </span>
              <span className="font-semibold text-[#a63a0f]">1,240+ campus student reviews</span>
              <span className="h-1 w-1 rounded-full bg-[#6b4a3c]" />
              <span className="flex items-center gap-2 text-[#4a2c20]">
                <ShieldCheck size={15} />
                North Canteen Counter 2 Signature
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold text-[#a63a0f]">₹{basePrice}</span>
                <span className="text-xl text-[#6b4a3c] line-through">₹110</span>
                <span className="rounded bg-[#fde3d6] px-2.5 py-1 text-xs font-bold text-[#a63a0f]">18% OFF</span>
              </div>
              <span className="text-xs font-semibold text-[#4a2c20]">Student subsidy applied • Taxes incl.</span>
            </div>

            {/* <p className="mt-6 text-lg leading-8 text-[#4a2c20]">
              {foodDescription}
            </p> */}

            {/* Add-ons */}
            <h2 className="mt-7 text-lg font-bold">
              Add-ons & Extras <span className="text-sm font-normal text-[#4a2c20]">(Optional)</span>
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {EXTRAS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleExtra(e.id)}
                  className="flex items-center gap-3 rounded-xl border border-[#f0d5c8] bg-white px-4 py-3.5 text-left text-sm"
                >
                  <Checkbox checked={selectedExtras.includes(e.id)} />
                  <span className="flex-1">{e.desktopName}</span>
                  <span className="font-semibold text-[#a63a0f]">+₹{basePrice}</span>
                </button>
              ))}
            </div>

            {/* Spice */}
            <h2 className="mt-7 text-lg font-bold">
              Spice Level <span className="text-[#a63a0f]">*</span>
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-4">
              {SPICE_LEVELS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpice(s.id)}
                  className={`rounded-xl border px-3 py-4 text-center transition ${spice === s.id
                    ? 'border-2 border-[#a63a0f] bg-[#fdeee6] text-[#a63a0f]'
                    : 'border-[#f0d5c8] bg-white hover:border-[#a63a0f]'
                    }`}
                >
                  <p className="text-sm font-bold">{s.desktop[0]}</p>
                  <p className="mt-0.5 text-xs">{s.desktop[1]}</p>
                </button>
              ))}
            </div>

            {/* Qty + Add to cart */}
            <div className="mt-6 flex items-center gap-4">
              <QtyControl className="h-16 w-[180px]" />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex h-16 flex-1 items-center justify-center gap-3 rounded-xl bg-[#a63a0f] text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#8a2f0b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingBag size={20} />
                {addingToCart ? 'Adding...' : `Add to Cart • ₹${total}`}
              </button>
              <button
                type="button"
                aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
                onClick={handleToggleFavourite}
                disabled={favouriteLoading}
                className="flex h-16 w-14 items-center justify-center rounded-xl border border-[#f0d5c8] bg-white disabled:opacity-50"
              >
                <Heart
                  size={22}
                  className={liked ? 'fill-[#a63a0f] text-[#a63a0f]' : 'text-[#4a2c20]'}
                />
              </button>
              <button
                type="button"
                aria-label="Share"
                className="flex h-16 w-14 items-center justify-center rounded-xl border border-[#f0d5c8] bg-white text-[#4a2c20]"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Nutrition */}
            <div className="mt-6 rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-lg font-bold">
                  <Flame size={18} className="text-[#a63a0f]" />
                  Nutrition & Allergens
                </h3>
                <span className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                  Gluten-Free Crepe
                </span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {NUTRITION.map((n) => (
                  <div key={n.label} className="rounded-lg border border-[#f0d5c8] bg-white py-3 text-center">
                    <p className="text-xs font-semibold text-[#4a2c20]">{n.label}</p>
                    <p className="mt-1 text-xl font-extrabold">
                      {n.value} <span className="text-[11px] font-normal text-[#6b4a3c]">{n.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#4a2c20]">
                <b>Contains:</b> Dairy (Ghee) and Mustard Seeds. Prepared in a facility handling tree nuts.
              </p>
            </div>

            <p className="mt-5 border-t border-[#f0d5c8] pt-4 text-sm leading-6 text-[#4a2c20]">
              <b className="text-[#2a1a14]">Ingredients:</b> Aged sona masoori rice, urad dal, fenugreek, farm
              potatoes, green chillies, curry leaves, pure clarified butter (ghee), tempered mustard seeds.
            </p>
          </div>
        </div>

        {/* ---------- YOU MIGHT ALSO LIKE ---------- */}
        <section className="mt-14 border-t border-[#f0d5c8] pt-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-extrabold tracking-tight">
                You Might Also Like / Campus Favourites
              </h2>
              <p className="mt-1 text-lg text-[#4a2c20]">
                Popular accompaniments ordered alongside Crispy Masala Dosa
              </p>
            </div>
            <Link to="/menu" className="flex items-center gap-2 font-semibold text-[#a63a0f]">
              View full breakfast menu <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-5">
            {RELATED.map((r) => (
              <div key={r.name} className="overflow-hidden rounded-2xl border border-[#f0d5c8] bg-white">
                <div className="relative h-[228px]">
                  <img
                    src={foodImage}
                    alt={foodName}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#4a2c20]">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {r.tag}
                  </span>
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-bold">
                    {r.rating} <Star size={11} className="fill-[#a63a0f] text-[#a63a0f]" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{r.name}</h3>
                  <p className="mt-1 text-sm text-[#4a2c20]">{r.desc}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f0d5c8] pt-4">
                    <span className="text-xl font-extrabold">₹{basePrice}</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-lg bg-[#f6eeea] px-4 py-2 text-sm font-semibold text-[#a63a0f] hover:bg-[#fde3d6]"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ======================= DESKTOP FOOTER ======================= */}
      <footer className="hidden border-t border-[#f0d5c8] bg-[#fff7f4] lg:block">
        <div className="mx-auto max-w-[1600px] px-10 py-12">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#a63a0f] text-white">
                  <UtensilsCrossed size={18} />
                </span>
                <span className="text-2xl font-bold text-[#a63a0f]">Tap2Eat</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#4a2c20]">
                Official high-speed campus dining and smart locker pickup network. Eliminating canteen
                wait lines since 2024.
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm text-[#4a2c20]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#a63a0f]" />
                Central Student Union, North & South Canteens
              </p>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-lg font-bold">
                <Clock size={16} className="text-[#a63a0f]" /> Canteen Operating Hours
              </h4>
              <dl className="mt-4 space-y-2 text-sm text-[#4a2c20]">
                {[
                  ['Morning Tiffin:', '07:30 AM - 11:30 AM'],
                  ['Lunch Meals:', '12:00 PM - 03:30 PM'],
                  ['Evening Snacks:', '04:30 PM - 07:00 PM'],
                  ['Night Canteen:', '08:00 PM - 11:30 PM'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt>{k}</dt>
                    <dd className="font-semibold text-[#2a1a14]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck size={16} className="text-[#a63a0f]" /> Hygiene & Standards
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-[#4a2c20]">
                <li>• Strict daily quality inspection</li>
                <li>• FSSAI License: 10022043000892</li>
                <li>• Calorie & macro audited recipes</li>
                <li>• Reusable eco-cutlery initiative</li>
              </ul>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-lg font-bold">
                <Phone size={16} className="text-[#a63a0f]" /> Student Helpline
              </h4>
              <p className="mt-4 text-sm text-[#4a2c20]">
                Order delayed or missing a locker code? Contact the counter steward directly:
              </p>
              <div className="mt-3 rounded-xl border border-[#f0d5c8] bg-[#fbf1ec] p-4">
                <p className="flex items-center gap-2 text-base font-bold text-[#a63a0f]">
                  <Phone size={16} /> +91 (080) 4123-8890
                </p>
                <p className="mt-1 text-xs text-[#4a2c20]">Intercom Ext: #4402 (Counter 2)</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-[#f0d5c8] pt-6 text-sm text-[#4a2c20]">
            <span>© 2025 Tap2Eat Campus Food Services. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/dietary" className="hover:text-[#a63a0f]">Dietary Transparency</Link>
              <Link to="/privacy-policy" className="hover:text-[#a63a0f]">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#a63a0f]">Campus Meal Card Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div >
  )
}

export default FoodDetailPage