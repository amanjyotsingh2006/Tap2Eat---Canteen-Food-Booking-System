
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../../services/api.js'

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

/* ---------------- Helpers ---------------- */

const getResponseData = (response) => {
  return response.data?.data ?? response.data
}

const sorts = [
  { id: 'recent', label: 'Recently Saved' },
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
          <span className="text-lg font-extrabold text-orange-800">
            Tap2Eat
          </span>
        </Link>

        <div className="relative w-[260px] xl:w-[340px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search favourite dishes..."
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
                className={`border-b-2 py-5 text-sm font-semibold transition ${active
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

          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50"
          >
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
              <p className="text-gray-500">Tap2Eat Student</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

/* ---------------- Mobile Top Bar ---------------- */

const MobileTopBar = ({
  count,
  showSearch,
  onToggleSearch,
  search,
  setSearch,
}) => {
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

        <h1 className="text-lg font-extrabold">Favourites</h1>

        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
          {count}
        </span>

        <button
          onClick={onToggleSearch}
          aria-label="Search favourites"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full hover:bg-orange-50"
        >
          <Search size={19} />
        </button>

      </div>

      {showSearch && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search favourite dishes..."
              className="h-10 w-full rounded-full border border-orange-100 bg-orange-50 pl-10 pr-4 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>
      )}

    </header>
  )
}

/* ---------------- Bottom Navigation ---------------- */

const BottomNav = () => {
  const { pathname } = useLocation()

  const items = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/menu', label: 'Explore', icon: Compass },
    { to: '/favourites', label: 'Favourites', icon: Heart },
    { to: '/orders', label: 'Orders', icon: ReceiptText },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">

      <ul className="mx-auto grid max-w-xl grid-cols-5">

        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to

          return (
            <li key={to}>
              <Link
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-orange-700' : 'text-gray-600'
                  }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-orange-100' : ''
                    }`}
                >
                  <Icon size={20} className={active ? 'fill-orange-700' : ''} />
                </span>

                {label}
              </Link>
            </li>
          )
        })}

      </ul>
    </nav>
  )
}

/* ---------------- Favourite Card ---------------- */

const FavCard = ({ dish, onRemove, onAdd, adding }) => {

  const available = dish.available === 'Yes'

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md">

      <div className="relative h-32 bg-orange-50 sm:h-40 lg:h-44 xl:h-48">

        <img
          src={dish.image || '/images/food-placeholder.png'}
          alt={dish.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/food-placeholder.png'
          }}
        />

        <div className="absolute left-2 top-2">
          <span className="truncate rounded-full bg-gray-800/80 px-2.5 py-1 text-[10px] font-semibold text-white">
            {dish.categoryName}
          </span>
        </div>

        <button
          onClick={() => onRemove(dish.id)}
          aria-label={`Remove ${dish.name} from favourites`}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-orange-700 shadow-sm transition hover:scale-105 active:scale-95"
        >
          <Heart size={17} className="fill-orange-700" />
        </button>

        {!available && (
          <span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
            Currently Unavailable
          </span>
        )}

      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">

        <div className="flex items-center justify-between text-[11px]">

          <span className="flex items-center gap-1 font-bold text-orange-700">

            <Star size={12} className="fill-orange-600 text-orange-600" />

            {dish.rating > 0 ? dish.rating.toFixed(1) : 'New'}

          </span>

          <span className="flex items-center gap-1 font-semibold text-gray-500">
            <Clock size={11} />
            {dish.time ? `~${dish.time}m` : 'N/A'}
          </span>

        </div>

        <h3 className="mt-1.5 line-clamp-1 text-sm font-bold sm:text-[15px] lg:line-clamp-2 lg:min-h-[2.5rem] xl:line-clamp-1">
          {dish.name}
        </h3>

        <p className="mt-1 hidden line-clamp-2 text-xs leading-5 text-gray-500 lg:block">
          {dish.desc}
        </p>

        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3 lg:mt-4">

          <div>
            <p className="hidden text-[10px] font-semibold text-gray-400 lg:block">
              Price
            </p>

            <p className="text-lg font-extrabold">
              ₹{dish.price}
            </p>
          </div>

          <button
            onClick={() => onAdd(dish)}
            disabled={!available || adding}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-orange-700 px-3.5 text-xs font-bold text-white transition hover:bg-orange-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400 lg:px-4"
          >
            <Plus size={14} className="lg:hidden" />

            <ShoppingCart size={14} className="hidden lg:block" />

            <span className="lg:hidden">
              {adding ? 'Adding...' : 'Add'}
            </span>

            <span className="hidden lg:inline">
              {adding ? 'Adding...' : 'Add to Cart'}
            </span>
          </button>

        </div>
      </div>
    </article>
  )
}

/* ---------------- Empty State ---------------- */

const EmptyState = () => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">

    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-700">
      <HeartOff size={28} />
    </div>

    <h3 className="mt-4 text-lg font-bold">
      No favourites yet
    </h3>

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

          <span className="text-base font-extrabold text-orange-800">
            Tap2Eat
          </span>
        </div>

        <span>
          © 2026 Tap2Eat Campus Dining Services. All rights reserved.
        </span>

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

/* ---------------- Main Page ---------------- */

const FavouritesPage = () => {

  const [favourites, setFavourites] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState({ items: [], totalPrice: 0 })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recent')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [addingFoodId, setAddingFoodId] = useState(null)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  /* ---------------- Fetch Favourites ---------------- */

  const fetchFavourites = async () => {
    try {
      const response = await api.get('/favourites')
      const data = getResponseData(response)

      setFavourites(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch favourites error:', error)
      throw error
    }
  }

  /* ---------------- Fetch Categories ---------------- */

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      const data = getResponseData(response)

      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  /* ---------------- Fetch Cart ---------------- */

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      const data = getResponseData(response)

      setCart(data || { items: [], totalPrice: 0 })
    } catch (error) {
      console.error('Fetch cart error:', error)
    }
  }

  /* ---------------- Initial API Calls ---------------- */

  useEffect(() => {

    const loadPage = async () => {
      setLoading(true)
      setError('')

      try {
        await Promise.all([
          fetchFavourites(),
          fetchCategories(),
          fetchCart(),
        ])
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Unable to load favourites. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadPage()

  }, [])

  /* ---------------- Category Lookup ---------------- */

  const categoryMap = useMemo(() => {

    const map = {}

    categories.forEach((item) => {
      map[String(item._id)] = item.name
    })

    return map

  }, [categories])

  /* ---------------- Transform Backend Data ---------------- */

  const favouriteDishes = useMemo(() => {

    return favourites
      .filter((favourite) => favourite.food)
      .map((favourite) => {

        const food = favourite.food

        const categoryId =
          food.category?._id || food.category

        return {
          id: food._id,
          favouriteId: favourite._id,

          name: food.name || 'Unnamed Food',
          desc: food.description || '',

          price: Number(food.price) || 0,
          rating: Number(food.rating) || 0,

          time: Number(food.preparationTime) || 0,

          categoryName:
            categoryMap[String(categoryId)] || 'Other',

          categoryId: String(categoryId || ''),

          image: food.image || '',
          available: food.available,

          createdAt: favourite.createdAt,
        }
      })

  }, [favourites, categoryMap])

  /* ---------------- Category Counts ---------------- */

  const categoryCounts = useMemo(() => {

    return favouriteDishes.reduce((acc, dish) => {

      const key = dish.categoryId || 'other'

      acc[key] = (acc[key] || 0) + 1

      return acc

    }, {})

  }, [favouriteDishes])

  /* ---------------- Category Options ---------------- */

  const categoryOptions = useMemo(() => {

    const usedCategoryIds = new Set(
      favouriteDishes.map((dish) => dish.categoryId)
    )

    return categories.filter((item) =>
      usedCategoryIds.has(String(item._id))
    )

  }, [categories, favouriteDishes])

  /* ---------------- Cart Count ---------------- */

  const cartCount = useMemo(() => {

    return (cart.items || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    )

  }, [cart])

  /* ---------------- Remove Favourite ---------------- */

  const handleRemove = async (foodId) => {

    try {
      setActionError('')

      await api.delete(`/favourites/delete/${foodId}`)

      setFavourites((previous) =>
        previous.filter((item) => {
          const favouriteFoodId =
            item.food?._id || item.food

          return String(favouriteFoodId) !== String(foodId)
        })
      )

    } catch (error) {

      console.error('Remove favourite error:', error)

      setActionError(
        error.response?.data?.message ||
        'Unable to remove this dish from favourites.'
      )
    }
  }

  /* ---------------- Add to Cart ---------------- */

  const handleAdd = async (dish) => {

    try {
      setAddingFoodId(dish.id)
      setActionError('')

      await api.post('/cart/add', {
        foodId: dish.id,
        quantity: 1,
      })

      await fetchCart()

    } catch (error) {

      console.error('Add to cart error:', error)

      setActionError(
        error.response?.data?.message ||
        'Unable to add this dish to cart.'
      )

    } finally {
      setAddingFoodId(null)
    }
  }

  /* ---------------- Filter and Sort ---------------- */

  const visible = useMemo(() => {

    let list = [...favouriteDishes]

    if (category !== 'all') {
      list = list.filter(
        (dish) => dish.categoryId === category
      )
    }

    if (search.trim()) {

      const searchText = search.toLowerCase().trim()

      list = list.filter((dish) => {

        return (
          dish.name.toLowerCase().includes(searchText) ||
          dish.desc.toLowerCase().includes(searchText) ||
          dish.categoryName.toLowerCase().includes(searchText)
        )
      })
    }

    return list.sort((a, b) => {

      switch (sort) {

        case 'rating':
          return b.rating - a.rating

        case 'fastest':
          return a.time - b.time

        case 'low':
          return a.price - b.price

        case 'high':
          return b.price - a.price

        default:
          return new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
      }

    })

  }, [favouriteDishes, category, search, sort])

  const totalSaved = favouriteDishes.length

  const selectClass =
    'h-10 w-full appearance-none rounded-full border border-orange-200 bg-white pl-4 pr-9 text-xs font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100'

  /* ---------------- Render ---------------- */

  return (

    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">

      <Header
        cartCount={cartCount}
        search={search}
        setSearch={setSearch}
      />

      <MobileTopBar
        count={totalSaved}
        showSearch={showMobileSearch}
        onToggleSearch={() =>
          setShowMobileSearch((previous) => !previous)
        }
        search={search}
        setSearch={setSearch}
      />

      <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-0">

        {/* Breadcrumb */}

        <nav className="mt-6 hidden items-center gap-2 text-xs text-gray-500 lg:flex">

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 hover:text-orange-700"
          >
            <Home size={13} /> Home
          </Link>

          <ChevronRight size={12} />

          <span className="font-semibold text-orange-700">
            Favourites
          </span>

        </nav>

        {/* Hero */}

        <section className="mt-4 hidden items-center justify-between gap-6 rounded-2xl border border-orange-100 bg-white p-8 shadow-sm lg:flex">

          <div className="max-w-2xl">

            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Heart size={15} className="fill-orange-700" />
              Campus Personal Collection
            </p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
              Your Favourite Foods
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Quickly re-order the campus dishes you love most.
              Your saved dishes are available here whenever you need them.
            </p>

          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-orange-300 px-5 py-2.5 text-xs font-semibold text-orange-800">
            <Heart size={15} className="fill-orange-700" />
            {totalSaved} Saved Items
          </div>

        </section>

        {/* Mobile Category Chips */}

        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          <button
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${category === 'all'
                ? 'border-orange-700 bg-orange-700 text-white'
                : 'border-orange-200 bg-white text-gray-700'
              }`}
          >
            All ({totalSaved})
          </button>

          {categoryOptions.map((item) => (

            <button
              key={item._id}
              onClick={() => setCategory(String(item._id))}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${category === String(item._id)
                  ? 'border-orange-700 bg-orange-700 text-white'
                  : 'border-orange-200 bg-white text-gray-700'
                }`}
            >
              {item.name} ({categoryCounts[String(item._id)] || 0})
            </button>

          ))}

        </div>

        {/* Mobile Hint */}

        <div className="mt-4 flex items-center justify-between text-xs lg:hidden">

          <span className="text-gray-600">
            Tap heart to remove saved dishes
          </span>

          <span className="flex items-center gap-1 font-bold text-orange-700">
            <Zap size={13} className="fill-orange-700" />
            Fast Pickup
          </span>

        </div>

        {/* Desktop Filters */}

        <div className="mt-6 hidden items-center gap-4 lg:flex">

          <div className="relative w-[250px]">

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="all">
                All Categories ({totalSaved})
              </option>

              {categoryOptions.map((item) => (
                <option key={item._id} value={String(item._id)}>
                  {item.name} ({categoryCounts[String(item._id)] || 0})
                </option>
              ))}

            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />

          </div>

          <div className="relative w-[250px]">

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={selectClass}
            >
              {sorts.map((item) => (
                <option key={item.id} value={item.id}>
                  Sort by: {item.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />

          </div>

          <div className="ml-auto flex items-center gap-3 text-xs">

            <span className="rounded-full bg-orange-100 px-3 py-1.5 font-bold text-orange-800">
              {totalSaved} Saved Items
            </span>

            <span className="text-gray-500">
              Your saved dishes
            </span>

          </div>

        </div>

        {/* Action Error */}

        {actionError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Loading */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-24">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-700" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading your favourites...
            </p>

          </div>

        ) : error ? (

          <div className="mt-6 rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
            >
              Retry
            </button>

          </div>

        ) : (

          /* Favourite Grid */

          <section className="mt-5 lg:mt-6">

            {visible.length === 0 ? (

              totalSaved === 0 ? (

                <EmptyState />

              ) : (

                <div className="rounded-2xl border border-dashed border-orange-200 bg-white py-14 text-center text-sm text-gray-500">

                  No saved dishes match your filters.

                  <button
                    onClick={() => {
                      setCategory('all')
                      setSearch('')
                    }}
                    className="ml-2 font-bold text-orange-700"
                  >
                    Reset
                  </button>

                </div>

              )

            ) : (

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">

                {visible.map((dish) => (

                  <FavCard
                    key={dish.favouriteId}
                    dish={dish}
                    onRemove={handleRemove}
                    onAdd={handleAdd}
                    adding={addingFoodId === dish.id}
                  />

                ))}

              </div>

            )}

          </section>

        )}

      </main>

      <Footer />

      <BottomNav />

    </div>
  )
}

export default FavouritesPage
