import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChefHat,
  MapPin,
  ChevronDown,
  Bell,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Timer,
  Star,
  Plus,
  Heart,
  Home,
  Compass,
  ReceiptText,
  User,
  ArrowRight,
  Utensils,
  Coffee,
  Salad,
  Soup,
  Cookie,
  GlassWater,
} from 'lucide-react'
import api from '../../../services/api'

/* ---------------- Mock data (replace with API data) ---------------- */

const getCategoryIcon = (name = '') => {
  const categoryName = name.toLowerCase()

  if (categoryName.includes('south')) return Salad
  if (categoryName.includes('north')) return Soup
  if (categoryName.includes('chaat')) return Cookie
  if (categoryName.includes('beverage') || categoryName.includes('drink')) {
    return GlassWater
  }
  if (categoryName.includes('snack')) return Coffee

  return Utensils
}

const dishes = [
  {
    id: 1,
    name: 'Crispy Masala Dosa',
    desc: 'With 2 chutneys & sambar',
    price: 90,
    rating: 4.9,
    orders: '1.2k',
    reviews: '240+',
    time: 5,
    category: 'south',
    categoryLabel: 'South Indian',
    veg: true,
    image: '/images/masala-dosa.jpg',
    stock: 'In Stock • Fresh Batch',
  },
  {
    id: 2,
    name: 'Paneer Butter Masala',
    desc: 'Velvety butter gravy',
    price: 140,
    rating: 4.8,
    orders: '840',
    reviews: '190+',
    time: 8,
    category: 'north',
    categoryLabel: 'North Indian',
    veg: true,
    image: '/images/paneer-butter-masala.jpg',
    stock: 'In Stock • Ready in 8m',
  },
  {
    id: 3,
    name: 'Hyderabadi Biryani',
    desc: 'With mirchi ka salan',
    price: 160,
    rating: 4.9,
    orders: '2.4k',
    reviews: '310+',
    time: 4,
    category: 'biryani',
    categoryLabel: 'Biryani & Rice',
    veg: false,
    image: '/images/biryani.jpg',
    stock: 'Fast Selling • 12 left',
    hot: true,
  },
  {
    id: 4,
    name: 'Delhi Samosa Chaat',
    desc: 'Tangy curd & tamarind',
    price: 60,
    rating: 4.7,
    orders: '950',
    reviews: '150+',
    time: 3,
    category: 'chaat',
    categoryLabel: 'Street Chaat',
    veg: true,
    image: '/images/samosa-chaat.jpg',
    stock: 'In Stock • Instant Counter 2',
  },
  {
    id: 5,
    name: 'Chole Bhature',
    desc: '2 Bhature + pickle',
    price: 110,
    rating: 4.8,
    orders: '1.8k',
    reviews: '215+',
    time: 6,
    category: 'north',
    categoryLabel: 'North Indian',
    veg: true,
    image: '/images/chole-bhature.jpg',
    stock: 'In Stock • Fresh & Hot',
  },
  {
    id: 6,
    name: 'Pav Bhaji',
    desc: 'With extra butter',
    price: 95,
    rating: 4.7,
    orders: '1.1k',
    reviews: '180+',
    time: 6,
    category: 'chaat',
    categoryLabel: 'Street Food',
    veg: true,
    image: '/images/pav-bhaji.jpg',
    stock: 'In Stock • 6m wait',
  },
  {
    id: 7,
    name: 'Kesar Mango Lassi',
    desc: 'Thick yogurt & saffron',
    price: 50,
    rating: 4.9,
    orders: '3.1k',
    reviews: '290+',
    time: 2,
    category: 'bev',
    categoryLabel: 'Beverages',
    veg: true,
    image: '/images/mango-lassi.jpg',
    stock: 'Chilled & Ready',
    chilled: true,
  },
  {
    id: 8,
    name: 'Gulab Jamun with Rabdi',
    desc: 'Warm & syrupy',
    price: 65,
    rating: 4.8,
    orders: '700',
    reviews: '120+',
    time: 3,
    category: 'snacks',
    categoryLabel: 'Desserts',
    veg: true,
    image: '/images/gulab-jamun.jpg',
    stock: 'In Stock',
  },
]

const combos = [
  {
    id: 1,
    tag: 'EVENING SNACK',
    code: 'CHAI49',
    title: 'Chai & Samosa Combo',
    desc: 'Steaming ginger masala tea with two crispy hand-folded aloo samosas & mint chutney.',
    price: 49,
    oldPrice: 75,
    cta: 'Order Combo',
  },
  {
    id: 2,
    tag: 'STUDENT SPECIAL',
    code: 'BOX120',
    title: 'Midday Meal Box with Paneer',
    desc: 'Matar paneer, dal fry, jeera rice, 3 butter rotis, gulab jamun, and salad.',
    price: 120,
    oldPrice: 160,
    cta: 'Order Combo',
  },
  {
    id: 3,
    tag: 'ZERO QUEUE',
    code: 'FASTPICK',
    title: 'Express Locker Pickup',
    desc: 'Pre-order any meal via Tap2Eat locker bays and receive a complimentary special Masala Chai.',
    perk: 'Free Chai Perk',
    cta: 'Activate Deal',
  },
]

const navLinks = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/menu', label: 'Menu', icon: Compass },
  { to: '/favourites', label: 'Favourites', icon: Heart },
  { to: '/orders', label: 'My Orders', icon: ReceiptText },
]

/* ---------------- Small helpers ---------------- */

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const VegDot = ({ veg }) => (
  <span
    className={`flex h-4 w-4 items-center justify-center rounded-[3px] border-2 bg-white ${veg ? 'border-green-600' : 'border-red-600'
      }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'
        }`}
    />
  </span>
)

/* ---------------- Sections ---------------- */

const TopBar = ({ cartCount, cartTotal, search, setSearch, user }) => {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700 text-white">
            <ChefHat size={20} />
          </div>
          <span className="text-lg font-extrabold text-orange-800">
            Tap2Eat
          </span>
        </Link>

        {/* Mobile location pill */}
        <button className="flex min-w-0 items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 lg:hidden">
          <MapPin size={13} className="shrink-0 text-orange-600" />
          <span className="truncate">North Canteen</span>
          <ChevronDown size={13} className="shrink-0" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
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

        {/* Desktop search */}
        {/* <div className="relative hidden max-w-md flex-1 lg:block">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu, snacks, thalis..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div> */}

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link to={"/notification"}>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50">
              <Bell size={20} />
              <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </Link>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-orange-100 px-2.5 py-2 text-orange-800 hover:bg-orange-200 lg:px-3"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-700 text-[10px] font-bold text-white lg:hidden">
                  {cartCount}
                </span>
                <span className="hidden text-left text-[10px] font-bold leading-tight lg:block">
                  {cartCount} items
                  <br />₹{cartTotal}
                </span>
              </>
            )}
          </Link>

          {/* Profile (desktop) */}
          <Link to={"/profile"}>
            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-orange-800">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="text-[11px] leading-tight">
                <p className="font-bold">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-gray-500">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}

const Greeting = ({ search, setSearch, user }) => (
  <section className="mt-4 lg:mt-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:rounded-2xl lg:border lg:border-orange-100 lg:bg-white lg:px-6 lg:py-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}! <span>👋</span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          What would you like to eat today?
          <span className="hidden lg:inline">
            {' '}
            Fresh batches are currently sizzling.
          </span>
        </p>
      </div>

      {/* Desktop location card */}
      <button className="hidden items-center gap-3 rounded-xl border border-orange-200 px-4 py-2.5 text-left lg:flex">
        <MapPin size={18} className="text-orange-700" />
        <div className="text-xs">
          <p className="font-bold">
            North Campus Food Court{' '}
            <span className="ml-1 text-[10px] text-green-600">● Open</span>
          </p>
          <p className="text-gray-500">Live Queue: 8–12 min wait</p>
        </div>
        <ChevronDown size={16} />
      </button>

      {/* Mobile search + filter */}
      <div className="flex gap-3 lg:hidden">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search samosa, dosa, biryani..."
            className="h-12 w-full rounded-xl border border-orange-100 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-700 text-white">
          <SlidersHorizontal size={19} />
        </button>
      </div>
    </div>
  </section>
)

const Hero = () => (
  <section className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-700 to-orange-500 text-white shadow-md lg:grid lg:grid-cols-[58%_42%] lg:bg-orange-800 lg:from-orange-800 lg:to-orange-800">
    <div className="p-5 sm:p-7 lg:p-10">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider">
        <span className="rounded-md bg-white/15 px-2.5 py-1">
          <span className="lg:hidden">⚡ CANTEEN FLASH SALE</span>
          <span className="hidden lg:inline">CAMPUS SPECIAL DEAL</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-orange-700 lg:bg-black/70 lg:text-white">
          <Timer size={12} />
          <span className="lg:hidden">18m left</span>
          <span className="hidden lg:inline">Offer ends in 02:45:10</span>
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
        <span className="lg:hidden">20% OFF on all Thalis & Combos</span>
        <span className="hidden lg:inline">
          Grand Thali Feast &amp; Hyderabadi Biryani Special
        </span>
      </h2>

      <p className="mt-3 text-sm text-white/90">
        <span className="lg:hidden">
          Use code: <u className="font-bold">THALI20</u>
        </span>
        <span className="hidden lg:inline">
          Get 25% OFF on your second canteen order with code{' '}
          <u className="font-bold">CAMPUSFEAST</u>. Authentic spices,
          slow-cooked royal aromatics.
        </span>
      </p>

      <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50">
        <span className="lg:hidden">Grab Deal</span>
        <span className="hidden lg:inline">Claim Offer Now</span>
        <ArrowRight size={14} className="hidden lg:block" />
      </button>
    </div>

    {/* Hero image (desktop only) */}
    <div className="relative hidden lg:block">
      <img
        src="public/DashboardPage/hero.jpg"
        alt="Thali and biryani"
        className="h-full w-full object-cover rounded-4xl pr-5"
      />
    </div>
  </section>
)

const Categories = ({ active, setActive, categories }) => (
  <section className="mt-7">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold lg:text-base">
        <span className="lg:hidden">Categories</span>
        <span className="hidden lg:inline">Explore Categories</span>
      </h2>
      <Link to="/menu" className="text-xs font-bold text-orange-700">
        View All
      </Link>
    </div>

    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${active === id
            ? 'border-orange-700 bg-orange-700 text-white'
            : 'border-orange-100 bg-white text-gray-700 hover:border-orange-300'
            }`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  </section>
)

const FilterBar = ({ search, setSearch, diet, setDiet }) => (
  <div className="mt-5 hidden flex-wrap items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3 lg:flex">
    <div className="relative min-w-[260px] flex-1">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dosas, samosas, thalis, lassi..."
        className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-orange-500"
      />
    </div>

    <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 text-xs font-semibold">
      {[
        { id: 'all', label: 'All' },
        { id: 'veg', label: '● Pure Veg' },
        { id: 'nonveg', label: '● Non-Veg' },
      ].map((d) => (
        <button
          key={d.id}
          onClick={() => setDiet(d.id)}
          className={`rounded-md px-3 py-1.5 ${diet === d.id ? 'bg-orange-100 text-orange-800' : 'text-gray-600'
            }`}
        >
          {d.label}
        </button>
      ))}
    </div>

    <select className="h-10 rounded-lg border border-gray-200 px-3 text-xs font-semibold outline-none">
      <option>Sort: Most Popular</option>
      <option>Price: Low to High</option>
      <option>Price: High to Low</option>
      <option>Fastest Prep</option>
    </select>

    <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold">
      <SlidersHorizontal size={14} />
      Under ₹150
    </button>
  </div>
)

const DishCard = ({ dish, onAdd }) => (
  <article className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-2.5 shadow-sm transition hover:shadow-md lg:p-0">
    {/* Image */}
    <div className="relative h-28 overflow-hidden rounded-xl bg-orange-50 sm:h-36 lg:h-40 lg:rounded-none">
      <img
        src={dish.image}
        alt={dish.name}
        loading="lazy"
        className="h-full w-full object-cover"
      />

      {/* Veg indicator (mobile) */}
      {typeof dish.veg === 'boolean' && (
        <div className="absolute left-2 top-2 lg:hidden">
          <VegDot veg={dish.veg} />
        </div>
      )}

      {/* Category (desktop) */}
      <span className="absolute left-2 top-2 hidden rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold lg:block">
        {dish.categoryLabel}
      </span>

      {dish.chilled && (
        <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-orange-600 lg:hidden">
          ❄ Chilled
        </span>
      )}

      {/* Wishlist (desktop) */}
      <button className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-600 hover:text-red-500 lg:flex">
        <Heart size={15} />
      </button>

      {/* Ready in (mobile) */}
      <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-700 lg:hidden">
        Ready in {dish.time}m
      </span>
    </div>

    {/* Body */}

    <div className="flex flex-1 flex-col px-1 pt-3 lg:p-4">
      <div className="flex items-center text-[11px] text-gray-500">
        {typeof dish.rating === 'number' && (
          <span className="flex items-center gap-1 font-bold text-gray-800">
            <Star size={12} className="fill-orange-500 text-orange-500" />
            {dish.rating.toFixed(1)}
          </span>
        )}

        {typeof dish.rating !== 'number' && (
          <span className="text-gray-400">No rating yet</span>
        )}
      </div>

      <h3 className="mt-1.5 text-sm font-bold leading-snug lg:text-[15px]">
        {dish.name}
      </h3>
      <p className="mt-1 text-xs text-gray-500 lg:hidden">{dish.desc}</p>

      {/* Stock line (desktop) */}
      <p
        className={`mt-2 hidden w-fit rounded px-2 py-0.5 text-[10px] font-semibold lg:block ${dish.hot
          ? 'bg-orange-50 text-orange-600'
          : 'bg-green-50 text-green-700'
          }`}
      >
        {dish.stock}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 lg:mt-4">
        <p className="text-lg font-extrabold">
          ₹{dish.price}
          <span className="ml-2 hidden text-[10px] font-normal text-gray-400 lg:inline">
            ${(dish.price / 28.8).toFixed(2)}
          </span>
        </p>

        <button
          onClick={() => onAdd(dish)}
          aria-label={`Add ${dish.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-700 text-white transition hover:bg-orange-800 active:scale-95 lg:h-9 lg:w-auto lg:gap-1 lg:rounded-lg lg:px-4 lg:text-xs lg:font-bold"
        >
          <Plus size={16} />
          <span className="hidden lg:inline">Add</span>
        </button>
      </div>
    </div>
  </article>
)

const PopularSection = ({ items, onAdd }) => (
  <section className="mt-7">
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold lg:text-xl">
          <span className="lg:hidden">Popular Canteen Bites</span>
          <span className="hidden lg:inline">Popular on Campus Today</span>
          <span className="rounded-md bg-orange-100 px-2 py-1 text-[10px] font-semibold text-orange-700 lg:hidden">
            Fast prep
          </span>
        </h2>
        <p className="mt-0.5 hidden text-xs text-gray-500 lg:block">
          Top-rated picks freshly prepared at the live counter
        </p>
      </div>
      <p className="text-[11px] text-gray-500">
        <span className="lg:hidden">Sorted by speed</span>
        <span className="hidden lg:inline">{items.length} items available</span>
      </p>
    </div>

    {items.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-white py-14 text-center text-sm text-gray-500">
        No dishes match your search.
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {items.map((d) => (
          <Link
            key={d.id}
            to={`/food-detail/${d.id}`}
          >
            <DishCard dish={d} onAdd={onAdd} />
          </Link>
        ))}
      </div>
    )}
  </section>
)

const Combos = () => (
  <section className="mt-9">
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold lg:text-xl">
          <span className="lg:hidden">Special Daily Combos 🔥</span>
          <span className="hidden lg:inline">
            Today&apos;s Campus Combos &amp; Offers
          </span>
        </h2>
        <p className="mt-0.5 hidden text-xs text-gray-500 lg:block">
          Pocket-friendly meal bundles curated for study sessions
        </p>
      </div>
      <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-semibold text-orange-700">
        <span className="lg:hidden">Today Only</span>
        <span className="hidden lg:inline">Updated 15 mins ago</span>
      </span>
    </div>

    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {combos.map((c) => (
        <article
          key={c.id}
          className="flex flex-col rounded-2xl border border-orange-100 bg-white p-4 shadow-sm lg:p-5"
        >
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="rounded bg-orange-100 px-2 py-1 text-orange-700">
              {c.tag}
            </span>
            <span className="text-gray-400">{c.code}</span>
          </div>

          <h3 className="mt-3 text-base font-bold">{c.title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-gray-500">{c.desc}</p>

          <div className="mt-auto flex items-center justify-between pt-4">
            {c.price ? (
              <p className="text-lg font-extrabold">
                ₹{c.price}
                <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                  ₹{c.oldPrice}
                </span>
              </p>
            ) : (
              <p className="text-xs font-bold text-orange-700">{c.perk}</p>
            )}
            <button className="rounded-lg bg-orange-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-800">
              {c.cta}
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
)

const Footer = () => (
  <footer className="mt-12 hidden border-t border-orange-100 bg-white lg:block">
    <div className="mx-auto flex items-center justify-between px-8 py-5 text-[11px] text-gray-500">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-700 text-white">
          <ChefHat size={15} />
        </div>
        <span className="font-bold text-orange-800">Tap2Eat</span>
        <span>© 2026 Tap2Eat Technologies Ltd. North Campus Hub.</span>
      </div>
      <div className="flex gap-6">
        <Link to="/rules" className="hover:text-orange-700">Canteen Rules</Link>
        <Link to="/allergens" className="hover:text-orange-700">Dietary Allergens</Link>
        <Link to="/live-cam" className="hover:text-orange-700">Kitchen Live Cam</Link>
        <Link to="/support" className="hover:text-orange-700">Support Desk</Link>
      </div>
    </div>
  </footer>
)

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
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-orange-700' : 'text-gray-600'
                  }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-orange-100' : ''
                    }`}
                >
                  <Icon size={20} />
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

/* ---------------- Page ---------------- */

const HomePage = () => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [diet, setDiet] = useState('all')
  const [cart, setCart] = useState([])

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })

  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Dishes', icon: Utensils }
  ])

  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const [profileResponse, categoryResponse, foodResponse] =
          await Promise.all([
            api.get('/profile/profile'),
            api.get('/categories'),
            api.get('/foods')
          ])

        // Actual logged-in user
        const profileData = profileResponse.data.data

        setUser(profileData)
        localStorage.setItem('user', JSON.stringify(profileData))

        // Actual categories from MongoDB
        const categoryData = categoryResponse.data.data || []

        const formattedCategories = [
          { id: 'all', label: 'All Dishes', icon: Utensils },
          ...categoryData.map((category) => ({
            id: category._id,
            label: category.name,
            icon: getCategoryIcon(category.name)
          }))
        ]

        setCategories(formattedCategories)

        // Actual food items from MongoDB
        const foodData = foodResponse.data.data || []

        const formattedDishes = foodData
          .filter((food) => food.available === 'Yes')
          .map((food) => ({
            id: food._id,
            name: food.name,
            desc: food.description,
            price: food.price,
            rating: food.rating,
            time: food.preparationTime,
            category: food.category?._id || food.category,
            categoryLabel: food.category?.name || 'Other',
            image: food.image,
            stock: 'Available',
            hot: false,
            veg: null
          }))

        setDishes(formattedDishes)

      } catch (error) {
        console.error(
          'Dashboard loading error:',
          error.response?.data || error
        )

        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          setUser(null)
          setErrorMessage('Your session has expired. Please log in again.')
        } else {
          setErrorMessage(
            error.response?.data?.message ||
            'Unable to load dashboard data. Please try again.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleAdd = (dish) => {
    // Existing local placeholder only.
    // Backend cart integration will be done separately.
    setCart((prev) => [...prev, dish])
  }

  const cartCount = cart.length
  const cartTotal = cart.reduce((sum, dish) => sum + dish.price, 0)

  const filtered = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        activeCategory === 'all' ||
        dish.category === activeCategory

      const matchesDiet =
        diet === 'all' ||
        (diet === 'veg' && dish.veg === true) ||
        (diet === 'nonveg' && dish.veg === false)

      return matchesSearch && matchesCategory && matchesDiet
    })
  }, [dishes, search, activeCategory, diet])

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#202b40]">

      <TopBar
        cartCount={cartCount}
        cartTotal={cartTotal}
        search={search}
        setSearch={setSearch}
        user={user}
      />

      <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-0">

        <Greeting
          search={search}
          setSearch={setSearch}
          user={user}
        />

        <Hero />

        <Categories
          active={activeCategory}
          setActive={setActiveCategory}
          categories={categories}
        />

        <FilterBar
          search={search}
          setSearch={setSearch}
          diet={diet}
          setDiet={setDiet}
        />

        {loading ? (
          <div className="mt-10 rounded-2xl border border-orange-100 bg-white py-14 text-center">
            <p className="text-sm font-semibold text-gray-600">
              Loading your dashboard...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="mt-10 rounded-2xl border border-red-200 bg-white px-5 py-10 text-center">
            <p className="text-sm font-semibold text-red-600">
              {errorMessage}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-orange-700 px-5 py-2 text-xs font-bold text-white hover:bg-orange-800"
            >
              Try Again
            </button>
          </div>
        ) : (
          <PopularSection
            items={filtered}
            onAdd={handleAdd}
          />
        )}

        <Combos />

      </main>

      <Footer />
      <BottomNav />

    </div>
  )
}

export default HomePage