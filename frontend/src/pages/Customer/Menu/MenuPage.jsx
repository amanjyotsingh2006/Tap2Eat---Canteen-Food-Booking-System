import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChefHat,
  Search,
  X,
  Bell,
  ShoppingBag,
  User,
  Heart,
  Star,
  Plus,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Mic,
  Zap,
  Timer,
  RefreshCw,
  Home,
  Compass,
  ReceiptText,
  Headphones,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react'

/* ---------------- Mock data (replace with API data) ---------------- */

const categories = [
  { id: 'all', label: 'All Dishes' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'desserts', label: 'Desserts' },
]

const dishes = [
  { id: 1, name: 'Crispy Masala Dosa', desc: 'Served with piping hot drumstick sambar, fresh coconut chutney.', price: 90, rating: 4.9, time: 5, orders: '480+', category: 'breakfast', veg: true, jain: false, image: '/images/masala-dosa.jpg' },
  { id: 2, name: 'Paneer Butter Masala Meal', desc: 'Cottage cheese in buttery tomato gravy with 2 butter rotis.', price: 140, rating: 4.8, time: 8, orders: '310+', category: 'lunch', veg: true, jain: false, image: '/images/paneer-butter-masala.jpg' },
  { id: 3, name: 'Hyderabadi Chicken Dum Biryani', desc: 'Slow-cooked dum basmati rice, tender spiced chicken, raita.', price: 160, rating: 4.9, time: 6, orders: '620+', category: 'lunch', veg: false, jain: false, image: '/images/biryani.jpg' },
  { id: 4, name: 'Samosa Chaat Platter', desc: 'Crushed potato samosas with warm chole, sweetened curd.', price: 60, rating: 4.7, time: 4, orders: '410+', category: 'snacks', veg: true, jain: false, image: '/images/samosa-chaat.jpg' },
  { id: 5, name: 'Chole Bhature with Pickled Onions', desc: '2 fluffy golden bhaturas paired with authentic chole.', price: 110, rating: 4.8, time: 7, orders: '540+', category: 'breakfast', veg: true, jain: false, image: '/images/chole-bhature.jpg' },
  { id: 6, name: 'Pav Bhaji Extra Butter', desc: 'Spiced tawa bhaji with melting butter dollop, 2 toasted pavs.', price: 95, rating: 4.7, time: 5, orders: '390+', category: 'snacks', veg: true, jain: true, image: '/images/pav-bhaji.jpg' },
  { id: 7, name: 'Kesar Mango Lassi', desc: 'Chilled thick yogurt smoothie infused with Alphonso pulp.', price: 50, rating: 4.9, time: 2, orders: '510+', category: 'beverages', veg: true, jain: true, image: '/images/mango-lassi.jpg' },
  { id: 8, name: 'Gulab Jamun with Rabdi', desc: '2 melt-in-mouth warm khoya jamuns rested on slow-cooked rabdi.', price: 65, rating: 4.8, time: 3, orders: '280+', category: 'desserts', veg: true, jain: false, image: '/images/gulab-jamun.jpg' },
  { id: 9, name: 'Medu Vada Sambar', desc: 'Crispy outside, fluffy inside black gram lentil fritters.', price: 70, rating: 4.6, time: 4, orders: '340+', category: 'breakfast', veg: true, jain: false, image: '/images/medu-vada.jpg' },
  { id: 10, name: 'Rajma Chawal Bowl', desc: 'Homestyle slow-cooked Kashmiri red kidney bean curry with rice.', price: 100, rating: 4.7, time: 5, orders: '470+', category: 'lunch', veg: true, jain: false, image: '/images/rajma-chawal.jpg' },
  { id: 11, name: 'Masala Chai & Bun Maska', desc: 'Authentic adrak-elaichi brewed hot tea served with buttered bun.', price: 45, rating: 4.9, time: 2, orders: '890+', category: 'snacks', veg: true, jain: false, image: '/images/chai-bun.jpg' },
  { id: 12, name: 'Malai Kulfi Falooda', desc: 'Dense caramelized milk kulfi topped with rose syrup, vermicelli.', price: 75, rating: 4.8, time: 3, orders: '310+', category: 'desserts', veg: true, jain: false, image: '/images/kulfi-falooda.jpg' },
]

const budgets = [
  { id: 'lt50', label: '< ₹50', test: (p) => p < 50 },
  { id: '50-100', label: '₹50-₹100', test: (p) => p >= 50 && p <= 100 },
  { id: '100-200', label: '₹100-₹200', test: (p) => p > 100 && p <= 200 },
]

const sorts = [
  { id: 'popular', label: 'Popular' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'fastest', label: 'Fastest Prep' },
  { id: 'low', label: 'Price: Low to High' },
  { id: 'high', label: 'Price: High to Low' },
]

const navLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/orders', label: 'My Orders' },
]

const PAGE_SIZE = 8

/* ---------------- Small helpers ---------------- */

const VegDot = ({ veg }) => (
  <span
    className={`flex h-4 w-4 items-center justify-center rounded-[3px] border-2 bg-white ${
      veg ? 'border-green-600' : 'border-red-600'
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
  </span>
)

const Checkbox = ({ checked }) => (
  <span
    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
      checked ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300 bg-white'
    }`}
  >
    {checked && <Check size={12} strokeWidth={3} />}
  </span>
)

/* ---------------- Header / Navigation ---------------- */

const Header = ({ cartCount, cartTotal, search, setSearch }) => {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700 text-white">
            <ChefHat size={20} />
          </div>
          <span className="text-lg font-extrabold text-orange-800">Tap2Eat</span>
        </Link>

        {/* Mobile location pill */}
        <button className="flex min-w-0 items-center gap-1.5 rounded-lg border border-orange-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 lg:hidden">
          <MapPin size={13} className="shrink-0 text-orange-700" />
          <span className="truncate">North Canteen</span>
          <ChevronDown size={12} className="shrink-0" />
        </button>

        {/* Desktop search */}
        <div className="relative hidden w-[240px] lg:block xl:w-[300px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dosas, meals, chai..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
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

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50">
            <Bell size={20} />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-orange-600" />
          </button>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-orange-800 hover:bg-orange-50 lg:border lg:border-orange-200 lg:bg-orange-50 lg:px-3"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-700 text-[10px] font-bold text-white lg:hidden">
                  {cartCount}
                </span>
                <span className="hidden text-left text-[10px] font-bold leading-tight lg:block">
                  Cart
                  <br />₹{cartTotal}
                </span>
              </>
            )}
          </Link>

          <Link
            to="/profile"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-orange-200 text-orange-800 lg:flex"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}

const BottomNav = () => {
  const { pathname } = useLocation()
  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Explore', icon: Compass },
    { to: '/favourites', label: 'Favourites', icon: Heart },
    { to: '/orders', label: 'Orders', icon: ReceiptText, dot: true },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map(({ to, label, icon: Icon, dot }) => {
          const active = pathname === to
          return (
            <li key={to}>
              <Link
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  active ? 'text-orange-700' : 'text-gray-600'
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full ${
                    active ? 'bg-orange-100' : ''
                  }`}
                >
                  <Icon size={20} />
                </span>
                {dot && <span className="absolute right-6 top-2 h-2 w-2 rounded-full bg-orange-600" />}
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ---------------- Filters (shared by sidebar + mobile sheet) ---------------- */

const FiltersPanel = ({ f, counts, total }) => (
  <div className="text-sm">
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-bold">
        <SlidersHorizontal size={16} /> Filters
      </h2>
      <button onClick={f.clear} className="text-xs font-bold text-orange-700">
        Clear all
      </button>
    </div>

    <hr className="my-4 border-gray-200" />

    {/* Categories */}
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Meal Categories</h3>
    <ul className="space-y-1">
      {categories.map((c) => {
        const active = f.category === c.id
        const count = c.id === 'all' ? total : counts[c.id] || 0
        return (
          <li key={c.id}>
            <button
              onClick={() => f.setCategory(c.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                active ? 'bg-orange-100 text-orange-800' : 'text-gray-700 hover:bg-orange-50'
              }`}
            >
              {c.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  active ? 'bg-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          </li>
        )
      })}
    </ul>

    <hr className="my-5 border-gray-200" />

    {/* Dietary */}
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Dietary Preference</h3>
    <div className="space-y-3">
      {[
        { key: 'veg', label: 'Pure Veg', icon: <VegDot veg /> },
        { key: 'nonveg', label: 'Non-Veg', icon: <VegDot veg={false} /> },
        { key: 'jain', label: 'Jain Friendly (No Onion/Garlic)', icon: <span className="text-green-700">🌿</span> },
      ].map((d) => (
        <button
          key={d.key}
          onClick={() => f.toggleDiet(d.key)}
          className="flex w-full items-center justify-between text-xs font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            {d.icon} {d.label}
          </span>
          <Checkbox checked={f.diet[d.key]} />
        </button>
      ))}
    </div>

    <hr className="my-5 border-gray-200" />

    {/* Availability */}
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Availability & Express</h3>
    <button
      onClick={() => f.setInStock(!f.inStock)}
      className="flex w-full items-center justify-between text-xs font-medium text-gray-700"
    >
      In Stock Only
      <span className={`relative h-5 w-9 rounded-full transition ${f.inStock ? 'bg-orange-600' : 'bg-gray-300'}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            f.inStock ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>

    <div className="mt-3 space-y-2">
      <button
        onClick={() => f.setFast(!f.fast)}
        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
          f.fast ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-gray-200 text-gray-700'
        }`}
      >
        <Timer size={14} /> Ready in &lt; 10 mins
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
        <Zap size={14} /> Campus Express Pickup
      </button>
    </div>

    <hr className="my-5 border-gray-200" />

    {/* Budget */}
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Budget Range</h3>
      <span className="text-[10px] font-bold text-orange-700">₹40 - ₹200</span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {budgets.map((b) => (
        <button
          key={b.id}
          onClick={() => f.setBudget(f.budget === b.id ? 'all' : b.id)}
          className={`rounded-lg border px-1 py-2 text-[11px] font-semibold ${
            f.budget === b.id
              ? 'border-orange-500 bg-orange-100 text-orange-800'
              : 'border-gray-200 text-gray-700'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>

    <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-3 text-[11px] leading-5 text-orange-900">
      <p className="font-bold">Main Canteen Kitchen</p>
      Open today till 9:30 PM. Live order queue: 8 tickets ahead.
    </div>
  </div>
)

/* ---------------- Dish card ---------------- */

const DishCard = ({ dish, onAdd }) => (
  <article className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md">
    <div className="relative h-32 bg-orange-50 sm:h-40 lg:h-36 xl:h-40">
      <img src={dish.image} alt={dish.name} loading="lazy" className="h-full w-full object-cover" />

      <div className="absolute left-2 top-2 sm:hidden">
        <VegDot veg={dish.veg} />
      </div>

      <button
        aria-label="Add to favourites"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-600 hover:text-red-500"
      >
        <Heart size={15} />
      </button>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold">
          <Star size={10} className="fill-orange-500 text-orange-500" />
          {dish.rating}
          <span className="font-semibold text-gray-500 sm:hidden">• {dish.time}m</span>
        </span>
        <span className="hidden rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold capitalize text-gray-600 sm:block">
          {dish.category}
        </span>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-3 sm:p-4">
      {/* Desktop meta */}
      <div className="mb-2 hidden items-center justify-between text-[10px] sm:flex">
        <span className="flex items-center gap-1.5 font-semibold text-green-700">
          <VegDot veg={dish.veg} />
          Ready in {dish.time}m
        </span>
        <span className="text-gray-500">{dish.orders} orders</span>
      </div>

      <h3 className="text-sm font-bold leading-snug sm:text-[15px]">{dish.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{dish.desc}</p>

      <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3 sm:mt-4">
        <div>
          <p className="hidden text-[10px] text-gray-400 sm:block">Price</p>
          <p className="text-lg font-extrabold">₹{dish.price}</p>
        </div>
        <button
          onClick={() => onAdd(dish)}
          aria-label={`Add ${dish.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-700 text-white transition hover:bg-orange-800 active:scale-95 sm:w-auto sm:gap-1 sm:rounded-lg sm:px-4 sm:text-xs sm:font-bold"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  </article>
)

/* ---------------- Footer ---------------- */

const Footer = () => (
  <footer className="mt-12 hidden border-t border-orange-100 bg-white lg:block">
    <div className="mx-auto px-8 py-10">
      <div className="grid grid-cols-4 gap-8 text-xs text-gray-600">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-700 text-white">
              <ChefHat size={17} />
            </div>
            <span className="text-base font-extrabold text-orange-800">Tap2Eat</span>
          </div>
          <p className="leading-5">
            Fast, hygienic, and authentic campus dining. Skip the long lunch queues with real-time
            pre-orders and express campus counter pickups.
          </p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-bold text-gray-900">Campus Counters & Hours</h4>
          <p className="flex items-center gap-2"><Clock size={14} className="text-orange-700" /> Mon - Sat: 7:30 AM – 10:00 PM</p>
          <p className="flex items-center gap-2"><Clock size={14} className="text-orange-700" /> Sunday: 8:30 AM – 8:00 PM</p>
          <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-orange-700" /> Food Court Level 1 & Science Block Wing C</p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-bold text-gray-900">Allergen & Quality Promise</h4>
          <p className="leading-5">
            All gravies are prepared fresh daily using pure filtered oils and fresh dairy. Items
            containing tree nuts, lactose, or gluten are explicitly flagged.
          </p>
          <p className="flex items-center gap-2 font-semibold text-green-700">
            <ShieldCheck size={14} /> FSSAI Certified Kitchen
          </p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-bold text-gray-900">Need Help?</h4>
          <p>Encountered a counter delay or payment issue?</p>
          <p className="flex items-center gap-2 font-bold text-orange-700">
            <Headphones size={14} /> Canteen Desk Helpline: Ext 4022
          </p>
          <p className="text-gray-500">Support email: canteen-support@tap2eat.campus</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5 text-[11px] text-gray-500">
        <span>© 2026 Tap2Eat Smart Campus Dining Solutions. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="hover:text-orange-700">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-orange-700">Terms of Service</Link>
          <Link to="/nutrition" className="hover:text-orange-700">Campus Nutrition Guidelines</Link>
        </div>
      </div>
    </div>
  </footer>
)

/* ---------------- Page ---------------- */

const ExploreMenuPage = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [diet, setDiet] = useState({ veg: false, nonveg: false, jain: false })
  const [inStock, setInStock] = useState(true)
  const [fast, setFast] = useState(false)
  const [budget, setBudget] = useState('all')
  const [sort, setSort] = useState('popular')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [showFilters, setShowFilters] = useState(false)
  const [cart, setCart] = useState([])

  const toggleDiet = (key) => setDiet((d) => ({ ...d, [key]: !d[key] }))

  const clear = () => {
    setSearch('')
    setCategory('all')
    setDiet({ veg: false, nonveg: false, jain: false })
    setInStock(false)
    setFast(false)
    setBudget('all')
    setVisible(PAGE_SIZE)
  }

  const f = {
    category, setCategory,
    diet, toggleDiet,
    inStock, setInStock,
    fast, setFast,
    budget, setBudget,
    clear,
  }

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    Object.values(diet).filter(Boolean).length +
    (fast ? 1 : 0) +
    (budget !== 'all' ? 1 : 0)

  const filtered = useMemo(() => {
    const anyDiet = diet.veg || diet.nonveg || diet.jain
    const budgetTest = budgets.find((b) => b.id === budget)?.test

    const list = dishes.filter((d) => {
      if (search && !(d.name + d.desc).toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'all' && d.category !== category) return false
      if (anyDiet) {
        const ok = (diet.veg && d.veg) || (diet.nonveg && !d.veg) || (diet.jain && d.jain)
        if (!ok) return false
      }
      if (fast && d.time >= 10) return false
      if (budgetTest && !budgetTest(d.price)) return false
      return true
    })

    const parse = (o) => parseInt(o, 10)
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'rating': return b.rating - a.rating
        case 'fastest': return a.time - b.time
        case 'low': return a.price - b.price
        case 'high': return b.price - a.price
        default: return parse(b.orders) - parse(a.orders)
      }
    })
  }, [search, category, diet, fast, budget, sort])

  const counts = useMemo(
    () => dishes.reduce((acc, d) => ({ ...acc, [d.category]: (acc[d.category] || 0) + 1 }), {}),
    []
  )

  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length

  const cartCount = cart.length
  const cartTotal = cart.reduce((s, d) => s + d.price, 0)
  const handleAdd = (dish) => setCart((p) => [...p, dish])

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">
      <Header cartCount={cartCount} cartTotal={cartTotal} search={search} setSearch={setSearch} />

      <main className={`mx-auto px-4 sm:px-6 lg:px-8 lg:pb-0 ${cartCount ? 'pb-44' : 'pb-28'}`}>
        {/* Breadcrumb (desktop) */}
        <nav className="mt-5 hidden items-center gap-2 text-xs text-gray-500 lg:flex">
          <Link to="/" className="hover:text-orange-700">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-orange-700">Explore Menu</span>
        </nav>

        {/* Title + desktop search/sort */}
        <section className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Explore Our Menu
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              <span className="lg:hidden">Freshly prepared campus bites & live kitchen specials</span>
              <span className="hidden lg:inline">
                Browse freshly prepped canteen meals, snacks, and beverages across campus counters.
              </span>
            </p>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative w-[250px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-9 text-sm outline-none focus:border-orange-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs">
              <span className="mr-1 text-gray-500">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent font-semibold outline-none"
              >
                {sorts.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Mobile search */}
        <div className="relative mt-4 lg:hidden">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dosas, thalis, chai, biryani..."
            className="h-12 w-full rounded-xl border border-orange-100 bg-white pl-10 pr-11 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
          <Mic size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Mobile category chips */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
                category === c.id
                  ? 'border-orange-700 bg-orange-700 text-white'
                  : 'border-orange-200 bg-white text-gray-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Mobile filter row */}
        <div className="mt-3 flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setShowFilters(true)}
            className="flex h-10 items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 text-xs font-semibold"
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-700 text-[9px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="flex h-10 items-center rounded-lg border border-orange-100 bg-white px-3 text-xs">
            <span className="mr-1 text-gray-500">Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent font-semibold outline-none">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>

          <button
            onClick={() => toggleDiet('veg')}
            className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 text-xs font-semibold"
          >
            <VegDot veg /> Veg Only <Checkbox checked={diet.veg} />
          </button>
        </div>

        {/* Mobile kitchen banner */}
        <button className="mt-3 flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left lg:hidden">
          <Zap size={20} className="shrink-0 text-orange-700" />
          <span className="flex-1 text-xs text-gray-600">
            <b className="block text-sm text-gray-900">Average Kitchen Prep: 6 Mins</b>
            North Canteen counter is actively accepting fast tokens
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        {/* Desktop status row */}
        <div className="mt-4 hidden items-center justify-between border-b border-orange-100 pb-3 text-xs text-gray-600 lg:flex">
          <div className="flex items-center gap-2">
            <span>Showing <b>{filtered.length}</b> delicious canteen items</span>
            {search && (
              <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-1 text-[11px] text-orange-800">
                Active Query: "{search}"
                <button onClick={() => setSearch('')}><X size={11} /></button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-600" /> Veg Available</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" /> Non-Veg Available</span>
            <span className="flex items-center gap-1 font-semibold text-orange-700"><Zap size={12} /> Average wait: 7 mins</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-6">
          {/* Sidebar (desktop) */}
          <aside className="sticky top-20 hidden rounded-2xl border border-orange-100 bg-white p-5 lg:block">
            <FiltersPanel f={f} counts={counts} total={dishes.length} />
          </aside>

          <section>
            {shown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white py-16 text-center text-sm text-gray-500">
                No dishes match your filters.
                <button onClick={clear} className="ml-2 font-bold text-orange-700">Clear all</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4 xl:grid-cols-4">
                {shown.map((d) => (
                  <DishCard key={d.id} dish={d} onAdd={handleAdd} />
                ))}
              </div>
            )}

            {/* Load more / pagination */}
            {shown.length > 0 && (
              <div className="mt-7 flex flex-col gap-3 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-orange-100 lg:pt-6">
                {remaining > 0 ? (
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white text-sm font-semibold text-orange-800 hover:bg-orange-50 lg:px-6"
                  >
                    <RefreshCw size={15} />
                    Load More Dishes ({remaining} {remaining === 1 ? 'remaining' : 'remaining'})
                  </button>
                ) : (
                  <span />
                )}

                <p className="text-center text-xs text-gray-500 lg:hidden">
                  Showing {shown.length} of {filtered.length} canteen items
                </p>

                <div className="hidden items-center gap-2 text-xs text-gray-600 lg:flex">
                  <span className="mr-2">Page 1 of {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400"><ChevronLeft size={15} /></button>
                  <button className="h-9 w-9 rounded-lg bg-orange-700 font-bold text-white">1</button>
                  <button className="h-9 w-9 rounded-lg border border-gray-200 bg-white font-semibold">2</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Mobile sticky cart bar */}
      {cartCount > 0 && (
        <Link
          to="/cart"
          className="fixed inset-x-3 bottom-[76px] z-20 flex items-center gap-3 rounded-2xl bg-orange-700 px-4 py-3 text-white shadow-lg lg:hidden"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {cartCount}
          </span>
          <span className="min-w-0 flex-1 text-xs">
            <b className="block text-sm">{cartCount} Items Added</b>
            <span className="block truncate text-white/80">
              {cart.slice(-3).map((d) => d.name.split(' ')[0]).join(', ')}
            </span>
          </span>
          <b className="text-lg">₹{cartTotal}</b>
          <ChevronRight size={18} />
        </Link>
      )}

      <BottomNav />

      {/* Mobile filters sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-24">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
            <FiltersPanel f={f} counts={counts} total={dishes.length} />
            <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4">
              <button
                onClick={() => setShowFilters(false)}
                className="h-12 w-full rounded-xl bg-orange-700 text-sm font-bold text-white"
              >
                Show {filtered.length} dishes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExploreMenuPage