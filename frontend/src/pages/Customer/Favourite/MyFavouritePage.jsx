import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChefHat,
  Search,
  Bell,
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  Heart,
  HeartOff,
  Star,
  Clock,
  Plus,
  ChevronRight,
  ChevronDown,
  Zap,
  Eye,
  EyeOff,
  Home,
  Compass,
  ReceiptText,
  User,
} from 'lucide-react'

/* ---------------- Mock data (replace with API data) ---------------- */

const initialFavourites = [
  { id: 1, name: 'Crispy Masala Dosa', desc: 'Signature fermented crepe with ghee-roasted spiced potato curry and three fresh chutneys.', price: 90, rating: 4.8, reviews: '340+', time: 8, tag: 'Prep 8 min', canteen: 'South Food Court', veg: true, orders: 340, image: '/images/masala-dosa.jpg' },
  { id: 2, name: 'Hyderabadi Chicken Dum Biryani', desc: 'Slow-cooked spiced basmati rice layered with juicy marinated chicken pieces, served with raita.', price: 180, rating: 4.9, reviews: '510+', time: 12, tag: "Chef's Pick", canteen: 'North Canteen', veg: false, orders: 510, image: '/images/biryani.jpg' },
  { id: 3, name: 'Paneer Butter Masala Combo', desc: 'Fresh cottage cheese cubes simmered in velvety tomato makhani, served with two rotis and rice.', price: 140, rating: 4.7, reviews: '280+', time: 10, tag: 'Student Deal', canteen: 'North Canteen', veg: true, orders: 280, image: '/images/paneer-butter-masala.jpg' },
  { id: 4, name: 'Kesar Mango Lassi', desc: 'Creamy traditional churned curd blended with Alphonso mango pulp and Kashmiri saffron.', price: 50, rating: 4.9, reviews: '420+', time: 3, tag: 'Cold Beverage', canteen: 'South Food Court', veg: true, orders: 420, image: '/images/mango-lassi.jpg' },
  { id: 5, name: 'Cold Coffee Frappe', desc: 'Double-shot Arabica espresso blended with vanilla gelato and chilled cream, perfect for study nights.', price: 70, rating: 4.8, reviews: '390+', time: 4, tag: 'Study Booster', canteen: 'Library Cafe', veg: true, orders: 390, image: '/images/cold-coffee.jpg' },
  { id: 6, name: 'Chole Bhature with Rabdi', desc: 'Two oversized fluffy puffed bhature paired with spiced chickpea gravy, pickled ginger, and rabdi.', price: 110, rating: 4.8, reviews: '460+', time: 7, tag: 'Popular', canteen: 'North Canteen', veg: true, orders: 460, image: '/images/chole-bhature.jpg' },
  { id: 7, name: 'Medu Vada Sambar Combo', desc: 'Three golden crispy urad dal fritters soaked in hot aromatic shallot-drumstick sambar and fresh chutney.', price: 60, rating: 4.6, reviews: '195+', time: 5, tag: 'Quick Bite', canteen: 'South Food Court', veg: true, orders: 195, image: '/images/medu-vada.jpg' },
  { id: 8, name: 'Rajma Chawal Homestyle Bowl', desc: 'Comforting North Indian red kidney bean stew over fragrant jeera rice, with crunchy spiced papad.', price: 85, rating: 4.7, reviews: '230+', time: 6, tag: 'Comfort Food', canteen: 'Library Cafe', veg: true, orders: 230, image: '/images/rajma-chawal.jpg' },
]

const sorts = [
  { id: 'ordered', label: 'Most Ordered' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'fastest', label: 'Fastest Prep' },
  { id: 'low', label: 'Price: Low to High' },
  { id: 'high', label: 'Price: High to Low' },
]

const diets = [
  { id: 'all', label: 'Veg & Non-Veg' },
  { id: 'veg', label: 'Veg Only' },
  { id: 'nonveg', label: 'Non-Veg Only' },
]

const navLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/orders', label: 'My Orders' },
]

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

/* ---------------- Header / Navigation ---------------- */

const Header = ({ cartCount, search, setSearch }) => {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 hidden border-b border-orange-100 bg-white/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 items-center gap-8 px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700 text-white">
            <ChefHat size={20} />
          </div>
          <span className="text-lg font-extrabold text-orange-800">Tap2Eat</span>
        </Link>

        <div className="relative w-[260px] xl:w-[340px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search favourites, dishes, canteens..."
            className="h-10 w-full rounded-full border border-orange-100 bg-orange-50/50 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <nav className="flex flex-1 items-center justify-center gap-8">
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

        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50">
            <Bell size={20} />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-orange-600" />
          </button>

          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-700 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="mx-1 h-8 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
              AK
            </div>
            <div className="text-[11px] leading-tight">
              <p className="font-bold">Arjun Kumar</p>
              <p className="text-gray-500">ID: CS-2022-84</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

const MobileTopBar = ({ count, onToggleEmpty, showEmpty }) => {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold">Favourites</h1>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">{count}</span>

        <button
          onClick={onToggleEmpty}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-gray-700"
        >
          {showEmpty ? <Eye size={13} /> : <EyeOff size={13} />}
          {showEmpty ? 'View Items' : 'View Empty'}
        </button>
        <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50">
          <Search size={19} />
        </button>
      </div>
    </header>
  )
}

const BottomNav = () => {
  const { pathname } = useLocation()
  const items = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/menu', label: 'Explore', icon: Compass },
    { to: '/favourites', label: 'Favourites', icon: Heart },
    { to: '/orders', label: 'Orders', icon: ReceiptText, badge: 1 },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map(({ to, label, icon: Icon, badge }) => {
          const active = pathname === to
          return (
            <li key={to}>
              <Link
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  active ? 'text-orange-700' : 'text-gray-600'
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-orange-100' : ''}`}>
                  <Icon size={20} className={active ? 'fill-orange-700' : ''} />
                </span>
                {badge && (
                  <span className="absolute right-4 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-700 text-[9px] font-bold text-white">
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

/* ---------------- Favourite card ---------------- */

const FavCard = ({ dish, onRemove, onAdd }) => (
  <article className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md">
    <div className="relative h-32 bg-orange-50 sm:h-40 lg:h-44 xl:h-48">
      <img src={dish.image} alt={dish.name} loading="lazy" className="h-full w-full object-cover" />

      <div className="absolute left-2 top-2 flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold lg:bg-transparent lg:p-0">
          <VegDot veg={dish.veg} />
          <span className={`lg:hidden ${dish.veg ? 'text-green-700' : 'text-red-600'}`}>
            {dish.veg ? 'Veg' : 'Non-Veg'}
          </span>
        </span>
        <span className="truncate rounded-full bg-gray-800/80 px-2.5 py-1 text-[10px] font-semibold text-white">
          {dish.canteen}
        </span>
      </div>

      <button
        onClick={() => onRemove(dish.id)}
        aria-label={`Remove ${dish.name} from favourites`}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-orange-700 shadow-sm transition hover:scale-105 active:scale-95"
      >
        <Heart size={17} className="fill-orange-700" />
      </button>
    </div>

    <div className="flex flex-1 flex-col p-3 sm:p-4">
      {/* Rating row */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 font-bold text-orange-700">
          <Star size={12} className="fill-orange-600 text-orange-600" />
          {dish.rating}
          <span className="hidden font-normal text-gray-500 lg:inline">({dish.reviews} reviews)</span>
          <span className="flex items-center gap-1 font-semibold text-gray-500 lg:hidden">
            <span>•</span>
            <Clock size={11} /> ~{dish.time}m
          </span>
        </span>
        <span className="hidden text-[10px] font-bold text-orange-700 lg:block">{dish.tag}</span>
      </div>

      <h3 className="mt-1.5 line-clamp-1 text-sm font-bold sm:text-[15px] lg:line-clamp-2 lg:min-h-[2.5rem] xl:line-clamp-1">
        {dish.name}
      </h3>
      <p className="mt-1 hidden line-clamp-2 text-xs leading-5 text-gray-500 lg:block">{dish.desc}</p>

      <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3 lg:mt-4">
        <div>
          <p className="hidden text-[10px] font-semibold text-gray-400 lg:block">Price</p>
          <p className="text-lg font-extrabold">₹{dish.price}</p>
        </div>
        <button
          onClick={() => onAdd(dish)}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-orange-700 px-3.5 text-xs font-bold text-white transition hover:bg-orange-800 active:scale-95 lg:px-4"
        >
          <Plus size={14} className="lg:hidden" />
          <ShoppingCart size={14} className="hidden lg:block" />
          <span className="lg:hidden">Add</span>
          <span className="hidden lg:inline">Add to Cart</span>
        </button>
      </div>
    </div>
  </article>
)

/* ---------------- Empty state ---------------- */

const EmptyState = () => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-700">
      <HeartOff size={28} />
    </div>
    <h3 className="mt-4 text-lg font-bold">No favourites yet</h3>
    <p className="mt-1 max-w-sm text-sm text-gray-500">
      Tap the heart on any dish to save it here for quick re-ordering.
    </p>
    <Link
      to="/menu"
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
    >
      Explore Menu <ChevronRight size={15} />
    </Link>
  </div>
)

/* ---------------- Footer ---------------- */

const Footer = () => (
  <footer className="mt-14 hidden border-t border-orange-100 bg-orange-50/50 lg:block">
    <div className="mx-auto flex items-center justify-between px-8 py-8 text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-700 text-white">
            <ChefHat size={17} />
          </div>
          <span className="text-base font-extrabold text-orange-800">Tap2Eat</span>
        </div>
        <span>© 2026 Tap2Eat Campus Dining Services. All rights reserved.</span>
      </div>
      <div className="flex gap-8">
        <Link to="/hours" className="hover:text-orange-700">Dining Hours</Link>
        <Link to="/allergens" className="hover:text-orange-700">Dietary & Allergens</Link>
        <Link to="/canteens" className="hover:text-orange-700">Canteen Locations</Link>
        <Link to="/support" className="hover:text-orange-700">Support & Help</Link>
      </div>
    </div>
  </footer>
)

/* ---------------- Page ---------------- */

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState(initialFavourites)
  const [search, setSearch] = useState('')
  const [canteen, setCanteen] = useState('all')
  const [sort, setSort] = useState('ordered')
  const [diet, setDiet] = useState('all')
  const [forceEmpty, setForceEmpty] = useState(false) // demo toggle, remove in production
  const [cart, setCart] = useState([])

  const handleRemove = (id) => setFavourites((p) => p.filter((d) => d.id !== id))
  const handleAdd = (dish) => setCart((p) => [...p, dish])

  const canteenCounts = useMemo(() => {
    return favourites.reduce((acc, d) => ({ ...acc, [d.canteen]: (acc[d.canteen] || 0) + 1 }), {})
  }, [favourites])

  const canteens = Object.keys(canteenCounts)

  const visible = useMemo(() => {
    if (forceEmpty) return []
    const list = favourites.filter((d) => {
      if (canteen !== 'all' && d.canteen !== canteen) return false
      if (diet === 'veg' && !d.veg) return false
      if (diet === 'nonveg' && d.veg) return false
      if (search && !(d.name + d.desc + d.canteen).toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'rating': return b.rating - a.rating
        case 'fastest': return a.time - b.time
        case 'low': return a.price - b.price
        case 'high': return b.price - a.price
        default: return b.orders - a.orders
      }
    })
  }, [favourites, canteen, diet, search, sort, forceEmpty])

  const totalSaved = forceEmpty ? 0 : favourites.length

  const selectClass =
    'h-10 w-full appearance-none rounded-full border border-orange-200 bg-white pl-4 pr-9 text-xs font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100'

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">
      <Header cartCount={cart.length} search={search} setSearch={setSearch} />
      <MobileTopBar count={totalSaved} showEmpty={forceEmpty} onToggleEmpty={() => setForceEmpty((v) => !v)} />

      <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-0">
        {/* Breadcrumb (desktop) */}
        <nav className="mt-6 hidden items-center gap-2 text-xs text-gray-500 lg:flex">
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-orange-700">
            <Home size={13} /> Home
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-orange-700">Favourites</span>
        </nav>

        {/* Hero (desktop) */}
        <section className="mt-4 hidden items-center justify-between gap-6 rounded-2xl border border-orange-100 bg-white p-8 shadow-sm lg:flex">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Heart size={15} className="fill-orange-700" /> Campus Personal Collection
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Your Favourite Foods</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Quickly re-order the campus dishes you love most across all canteen bays. Freshly
              prepared with student dining discounts automatically applied.
            </p>
          </div>
          <button
            onClick={() => setForceEmpty((v) => !v)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-orange-300 px-5 py-2.5 text-xs font-semibold text-orange-800 hover:bg-orange-50"
          >
            {forceEmpty ? <Eye size={15} /> : <EyeOff size={15} />}
            Toggle Empty Favourites State
          </button>
        </section>

        {/* Mobile canteen chips */}
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCanteen('all')}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
              canteen === 'all' ? 'border-orange-700 bg-orange-700 text-white' : 'border-orange-200 bg-white text-gray-700'
            }`}
          >
            All ({totalSaved})
          </button>
          {canteens.map((c) => (
            <button
              key={c}
              onClick={() => setCanteen(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
                canteen === c ? 'border-orange-700 bg-orange-700 text-white' : 'border-orange-200 bg-white text-gray-700'
              }`}
            >
              {c.replace('Food Court', 'Food Court')} ({canteenCounts[c]})
            </button>
          ))}
        </div>

        {/* Mobile hint row */}
        <div className="mt-4 flex items-center justify-between text-xs lg:hidden">
          <span className="text-gray-600">Tap heart to remove saved dishes</span>
          <span className="flex items-center gap-1 font-bold text-orange-700">
            <Zap size={13} className="fill-orange-700" /> Fast Pickup
          </span>
        </div>

        {/* Desktop filter row */}
        <div className="mt-6 hidden items-center gap-4 lg:flex">
          <div className="relative w-[215px]">
            <select value={canteen} onChange={(e) => setCanteen(e.target.value)} className={selectClass}>
              <option value="all">All Canteens ({totalSaved})</option>
              {canteens.map((c) => (
                <option key={c} value={c}>{c} ({canteenCounts[c]})</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative w-[250px]">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>Sort by: {s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative w-[225px]">
            <select value={diet} onChange={(e) => setDiet(e.target.value)} className={selectClass}>
              {diets.map((d) => (
                <option key={d.id} value={d.id}>Dietary: {d.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="rounded-full bg-orange-100 px-3 py-1.5 font-bold text-orange-800">
              {totalSaved} Saved Items
            </span>
            <span className="text-gray-500">Active kitchen counters ready</span>
          </div>
        </div>

        {/* Grid */}
        <section className="mt-5 lg:mt-6">
          {visible.length === 0 ? (
            totalSaved === 0 ? (
              <EmptyState />
            ) : (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white py-14 text-center text-sm text-gray-500">
                No saved dishes match your filters.
                <button
                  onClick={() => { setCanteen('all'); setDiet('all'); setSearch('') }}
                  className="ml-2 font-bold text-orange-700"
                >
                  Reset
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {visible.map((d) => (
                <FavCard key={d.id} dish={d} onRemove={handleRemove} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}

export default FavouritesPage