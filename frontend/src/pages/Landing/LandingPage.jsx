import { useState, useMemo } from "react";
import {
  UtensilsCrossed, Search, Menu, X, Zap, ArrowRight, Star, Clock, BookOpen,
  CreditCard, Smile, Hourglass, Wallet, Radio, ShoppingBag, Share2, Bell,
  Leaf, Timer, Check,
} from "lucide-react";
import { Link } from "react-router-dom"

const DISHES = [
  { id: 1, name: "Crispy Pesto Chicken Bowl", tag: "Non-Veg", rating: 4.9, time: 12, price: 8.5, kcal: 520, cat: "Healthy Bowls", desc: "Pesto roasted tender chicken fillet over brown rice, steamed florets, and...", img: "/Landing Page Images/food-1.jpg" },
  { id: 2, name: "Avocado & Halloumi Brioche", tag: "Veg", rating: 4.8, time: 8, price: 7.2, kcal: 440, cat: "Breakfast & Brunch", desc: "Golden grilled halloumi over crushed Hass avocado and sweet...", img: "/Landing Page Images/food-2.jpg" },
  { id: 3, name: "Spicy Teriyaki Tofu Bowl", tag: "Vegan", rating: 4.7, time: 10, price: 7.8, kcal: 410, cat: "Asian Bowls", desc: "Crispy sesame tofu glazed in house spicy teriyaki served with pickled...", img: "/Landing Page Images/food-3.jpg" },
  { id: 4, name: "Double Smashed Angus Burger", tag: "Non-Veg", rating: 4.9, time: 14, price: 9.0, kcal: 680, cat: "Gourmet Grill", desc: "Crisp smashed patties with gooey red cheddar, secret campus grill relish, an...", img: "/Landing Page Images/food-4.jpg" },
];

const CATEGORIES = [
  ["Healthy Bowls", 14], ["Gourmet Burgers", 9], ["Artisan Wraps", 11], ["Asian Bowls", 16],
  ["Wood-Fired Pizza", 8], ["Smoothies & Coolers", 12], ["Specialty Coffee", 16],
];

const STEPS = [
  { icon: BookOpen, title: "Browse Food", text: "Explore live menus, daily specials, and dietary filters right from your desk or dorm room before heading to the hall.", badge: "Live stock & dietary badges" },
  { icon: CreditCard, title: "Place Order", text: "Pay in seconds with meal points, card, or Apple Pay and get an estimated prep countdown with live progress bars.", badge: "Instant student card balance sync" },
  { icon: Smile, title: "Enjoy Your Meal", text: "Flash your digital QR token at the express pickup counter or smart thermal food locker and grab your fresh hot tray instantly.", badge: "Contactless thermal locker pods" },
];

const FEATURES = [
  { icon: Hourglass, title: "Zero Wait Times", text: "Skip the perpetual 25-minute lunch rush. Order while leaving class and find your warm meal packed up on arrival." },
  { icon: Radio, title: "Live Kitchen Queues", text: "Monitor real-time kitchen workloads and live prep stages so you never stand waiting at counter registers." },
  { icon: Wallet, title: "Campus Card Integration", text: "Tap directly with your university student ID card, dining meal credits, Apple Pay, or credit card in one tap." },
  { icon: Leaf, title: "Fresh & Local Ingredients", text: "Partnered with accredited campus culinary staff preparing dishes with locally sourced fresh produce every day." },
];

const FILTERS = ["All Dishes", "High Protein", "Vegetarian", "Under 10 Mins"];
const MOBILE_CATS = ["All", "Bowls", "Burgers", "Wraps", "Pizza"];

const TAG_STYLE = {
  "Non-Veg": "bg-red-800",
  Veg: "bg-green-700",
  Vegan: "bg-teal-700",
};

export default function Tap2Eat() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bag, setBag] = useState({});
  const [filter, setFilter] = useState("All Dishes");
  const [activeCat, setActiveCat] = useState("All");

  const add = (id) => setBag((b) => ({ ...b, [id]: (b[id] || 0) + 1 }));
  const count = useMemo(() => Object.values(bag).reduce((a, b) => a + b, 0), [bag]);
  const total = useMemo(
    () => DISHES.reduce((s, d) => s + (bag[d.id] || 0) * d.price, 0),
    [bag]
  );

  const visible = DISHES.filter((d) => {
    if (filter === "Vegetarian") return d.tag === "Veg" || d.tag === "Vegan";
    if (filter === "Under 10 Mins") return d.time < 10;
    if (filter === "High Protein") return d.kcal >= 500;
    return true;
  });

  const Brand = ({ className = "" }) => (
    <a href="#top" className={`flex items-center gap-2 text-lg font-bold text-[#a63a0f] ${className}`}>
      <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-[#a63a0f] text-white">
        <UtensilsCrossed size={18} />
      </span>
      Tap2Eat
    </a>
  );

  const navLinks = [
    { label: "Home", href: "#top" },
    { label: "Explore Menu", href: "#menu" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <div id="top" className="min-h-screen bg-[#fff6f1] font-sans leading-normal text-[#1f1a17]">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-[#f0e2da] bg-[#fff6f1]/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] items-center justify-between px-4 md:h-[68px] md:px-8">
          <Brand />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-stone-500 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={l.href === "#top" ? "text-[#a63a0f]" : "hover:text-[#a63a0f]"}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-5 text-[13px] font-medium md:flex">
            <Link to="/login">Login</Link>
            <Link
              to="/register"
              className="rounded-full bg-[#a63a0f] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#8a2f0b]"
            >
              Sign Up
            </Link>
          </div>

          {/* Hamburger */}
          <div className="flex gap-1 md:hidden">
            <button
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid place-items-center rounded-lg p-2"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="flex flex-col border-t border-[#f0e2da] bg-[#fff6f1] px-4 pb-4 md:hidden">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-[#f0e2da] py-3 font-medium ${l.href === "#top" ? "text-[#a63a0f]" : ""
                  }`}
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#f0e2da] py-3 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-3 rounded-full bg-[#a63a0f] px-[18px] py-2.5 text-center text-[13px] font-semibold text-white transition hover:bg-[#8a2f0b]"
            >
              Sign Up
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="pb-2 pt-5 md:pb-12 md:pt-16">
        <div className="mx-auto grid items-center gap-5 px-4 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-8">
          <div>
            <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#fdeee6] px-3 py-1.5 text-[11px] font-semibold text-[#a63a0f] md:text-xs">
              <Zap size={12} />
              <span className="md:hidden">Fast Campus Pickup</span>
              <span className="hidden md:inline">Campus Dining Reimagined • Instant Locker Pickup</span>
            </span>

            <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Good Food. Great Mood.{" "}
              <span className="text-[#a63a0f]">Just a Tap Away.</span>
            </h1>

            <p className="mb-5 mt-3 text-[15px] text-stone-500 md:mb-7 md:mt-[18px] md:max-w-[480px] md:text-[17px]">
              <span className="md:hidden">
                Order ahead from North &amp; South Campus cafeterias. Skip the rush and pick up hot food in minutes.
              </span>
              <span className="hidden md:inline">
                Say goodbye to long canteen queues. Browse live cafeteria menus, customize meals, and pick up hot, freshly cooked food with contactless digital tokens.
              </span>
            </p>

            <div className="flex gap-3">
              <Link to={"/login"}>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#a63a0f] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(166,58,15,.25)] transition hover:bg-[#8a2f0b] md:w-auto">
                  Order Now <ArrowRight size={16} />
                </button>
              </Link>
              <Link to={"/login"}>
                <button className="hidden items-center rounded-[10px] border border-[#f0e2da] bg-white px-5 py-3.5 text-[15px] font-semibold md:inline-flex">
                  View Today's Menu
                </button>
              </Link>
            </div>

            <div className="mt-8 hidden max-w-[420px] items-center gap-3 border-t border-[#f0e2da] pt-5 md:flex">
              <div className="flex">
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} className="-ml-2 h-7 w-7 rounded-full border-2 border-[#fff6f1] bg-[#e8cdbf] first:ml-0" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-xs text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                  <b className="ml-1.5 text-[#1f1a17]">4.9/5</b>
                </div>
                <small className="text-[11px] text-stone-500">Trusted by 12,000+ campus foodies daily</small>
              </div>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative h-60 overflow-hidden rounded-[18px] shadow-[0_10px_30px_rgba(0,0,0,.1)] md:h-[420px] md:rounded-[22px]">
            <img src="/Landing Page Images/hero.jpg" alt="Honey Glazed Teriyaki Crunch Bowl" className="h-full w-full bg-[#e9d9cf] object-cover" />

            {/* desktop token */}
            <div className="absolute right-3.5 top-3.5 hidden flex-col rounded-xl bg-white px-3.5 py-2.5 shadow-lg md:flex">
              <small className="text-[9px] font-semibold text-stone-500">DIGITAL TOKEN</small>
              <b className="text-xs">#48 Ready at Counter 4</b>
              <small className="text-[9px] text-stone-500">Locker Express Pod 8</small>
            </div>

            {/* desktop caption */}
            <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-[18px] pb-4 pt-10 text-white md:flex">
              <b>Honey Glazed Teriyaki Crunch Bowl</b>
              <small className="flex items-center gap-1 text-[11px]"><Clock size={12} /> 7–9 mins prep</small>
            </div>

            {/* mobile info bar */}
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 md:hidden">
              <div className="flex flex-col">
                <small className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-stone-500">
                  <i className="inline-block h-2 w-2 rounded-full bg-orange-500" /> ACTIVE KITCHENS
                </small>
                <b className="text-sm">Order ready in 8m</b>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#fdeee6] px-2.5 py-1.5 text-[11px] font-semibold text-[#a63a0f]">
                <Timer size={13} /> Fast Track
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="menu" className="py-7 md:py-14">
        <div className="mx-auto px-4 md:px-8">
          {/* mobile chips */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <small className="text-[11px] font-bold tracking-widest text-stone-500">CATEGORIES</small>
              <a className="text-[13px] font-semibold text-[#a63a0f]">Swipe →</a>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 pt-3 [scrollbar-width:none]">
              {MOBILE_CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium ${activeCat === c
                    ? "border-[#a63a0f] bg-[#a63a0f] text-white"
                    : "border-[#f0e2da] bg-white"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* desktop cards */}
          <div className="hidden md:block">
            <span className="text-[11px] font-bold tracking-widest text-[#a63a0f]">CURATED STATIONS</span>
            <h2 className="text-3xl font-bold tracking-tight">Explore by Craving</h2>
            <p className="mb-6 mt-1.5 text-sm text-stone-500">
              Hand-crafted bowls, burgers, wraps and barista brews across campus hubs.
            </p>
            <div className="grid grid-cols-7 gap-3">
              {CATEGORIES.map(([name, n]) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-1 rounded-xl border border-[#f0e2da] bg-white px-2 py-4 text-center text-xs transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(166,58,15,.12)]"
                >
                  <span className="mb-1.5 grid h-9 w-9 place-items-center rounded-full bg-[#fdeee6] text-[#a63a0f]">
                    <UtensilsCrossed size={16} />
                  </span>
                  <b>{name}</b>
                  <small className="text-[10px] text-stone-500">{n} Options</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DISHES */}
      <section className="py-7 md:py-14">
        <div className="mx-auto px-4 md:px-8">
          <div className="mb-3.5 flex items-end justify-between">
            <div>
              <span className="hidden text-[11px] font-bold tracking-widest text-[#a63a0f] md:block">HOT PICKS</span>
              <h2 className="text-[22px] font-bold tracking-tight md:text-3xl">
                <span className="md:hidden">Popular Dishes</span>
                <span className="hidden md:inline">Campus Favorites Today</span>
              </h2>
              <p className="mt-0.5 text-[13px] text-stone-500 md:mt-1.5 md:text-sm">
                <span className="md:hidden">Top student picks today</span>
                <span className="hidden md:inline">Pre-ordered most frequently before lecture rush hours.</span>
              </p>
            </div>
            <a className="text-[13px] font-semibold text-[#a63a0f] md:hidden">See all ›</a>
            <div className="hidden gap-2 md:flex">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === f
                    ? "border-[#a63a0f] bg-[#a63a0f] text-white"
                    : "border-[#f0e2da] bg-white"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 md:gap-4">
            {visible.map((d) => (
              <article
                key={d.id}
                className="flex gap-3 overflow-hidden rounded-[14px] border border-[#f0e2da] bg-white p-2.5 md:flex-col md:gap-0 md:p-0"
              >
                <div className="relative h-[84px] w-[84px] flex-none overflow-hidden rounded-[10px] md:h-[170px] md:w-full md:rounded-none">
                  <img src={d.img} alt={d.name} className="h-full w-full bg-[#e9d9cf] object-cover" />
                  <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white md:bottom-2 md:left-2 md:top-auto ${TAG_STYLE[d.tag]}`}>
                    {d.tag}
                  </span>
                  <span className="absolute left-2 top-2 hidden items-center gap-[3px] rounded-full bg-white px-[7px] py-[3px] text-[10px] font-semibold md:inline-flex">
                    <Star size={10} fill="currentColor" className="text-amber-500" /> {d.rating}
                  </span>
                  <span className="absolute right-2 top-2 hidden rounded-full bg-black/65 px-[7px] py-[3px] text-[10px] text-white md:inline">
                    {d.time}m prep
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1 md:p-3.5">
                  <small className="hidden text-[10px] font-semibold text-[#a63a0f] md:block">{d.cat}</small>
                  <b className="text-sm font-semibold leading-tight md:text-[15px]">{d.name}</b>
                  <small className="flex items-center gap-1 text-[11px] text-stone-500 md:hidden">
                    <Star size={11} fill="currentColor" className="text-amber-500" /> {d.rating} • <Clock size={11} /> {d.time}m
                  </small>
                  <small className="hidden min-h-[34px] text-[11px] text-stone-500 md:block">{d.desc}</small>

                  <div className="mt-auto flex items-center justify-between md:mt-2 md:border-t md:border-[#f0e2da] md:pt-3">
                    <div>
                      <small className="hidden text-[10px] text-stone-500 md:block">Price</small>
                      <b className="text-[15px] font-bold">${d.price.toFixed(2)}</b>
                    </div>
                    <Link to={"/login"}>
                      <button
                        onClick={() => add(d.id)}
                        className="rounded-lg border border-[#f0e2da] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#a63a0f] transition hover:bg-[#a63a0f] hover:text-white md:border-[#a63a0f] md:bg-[#a63a0f] md:text-white md:hover:bg-[#8a2f0b]"
                      >
                        <span className="md:hidden">+ Add</span>

                        <span className="hidden md:inline">+ Order</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="about" className="bg-[#fdeee6] py-7 md:py-14">
        <div className="mx-auto px-4 md:px-8">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-widest text-[#a63a0f]">FAST PROCESS</span>
            <h2 className="text-[22px] font-bold tracking-tight md:text-3xl">How Tap2Eat Works</h2>
            <p className="mt-1.5 hidden text-sm text-stone-500 md:block">
              Delicious food in 3 effortless steps. Order anywhere on campus, collect hot in seconds.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:mt-9 md:grid-cols-3 md:gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-start gap-3.5 rounded-[14px] border border-[#f0e2da] bg-white p-4 md:block md:p-6">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-[#fbd9c9] font-bold text-[#a63a0f] md:hidden">
                  {i + 1}
                </span>
                <div>
                  <small className="mb-3 hidden text-[10px] font-bold tracking-widest text-[#a63a0f] md:block">
                    STEP 0{i + 1}
                  </small>
                  <span className="mb-3 hidden h-[38px] w-[38px] place-items-center rounded-[10px] bg-[#fdeee6] text-[#a63a0f] md:grid">
                    <s.icon size={18} />
                  </span>
                  <b className="flex items-center gap-1.5 text-sm md:text-[17px]">
                    <s.icon size={15} className="md:hidden" /> {s.title}
                  </b>
                  <p className="mt-0.5 text-xs text-stone-500 md:mb-4 md:mt-2 md:text-[13px]">{s.text}</p>
                  <small className="hidden items-center gap-1.5 border-t border-[#f0e2da] pt-3 text-[11px] text-stone-500 md:flex">
                    <Check size={12} /> {s.badge}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-7 md:py-14">
        <div className="mx-auto px-4 md:px-8">
          <h2 className="mb-7 hidden text-center text-3xl font-bold tracking-tight md:block">
            Why Students &amp; Staff Love Tap2Eat
          </h2>
          <small className="mb-3 block text-center text-[11px] font-bold tracking-widest text-stone-500 md:hidden">
            BUILT FOR CAMPUS LIFE
          </small>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex-col items-center gap-2 rounded-[10px] border border-[#f0e2da] bg-white px-2 py-3.5 text-center text-[11px] md:items-start md:rounded-[14px] md:p-[22px] md:text-left md:text-[15px] ${i === 3 ? "hidden md:flex" : "flex"
                  }`}
              >
                <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#fdeee6] text-[#a63a0f]">
                  <f.icon size={18} />
                </span>
                <b className="font-semibold">{f.title}</b>
                <p className="hidden text-[13px] font-normal text-stone-500 md:block">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (desktop only) */}
      <section className="mx-auto mt-6 hidden px-8 md:block">
        <div className="flex items-center justify-between gap-6 rounded-[22px] bg-gradient-to-br from-[#a63a0f] to-[#c2501c] p-11 text-white">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
              SMART LOCKERS ON CAMPUS
            </span>
            <h2 className="mb-2 mt-3 text-3xl font-bold tracking-tight">Ready to grab lunch without the wait?</h2>
            <p className="text-sm opacity-90">
              Join 12,000+ students and faculty saving an average of 42 minutes every week on dining.
            </p>
          </div>
          <div className="flex flex-none gap-3">
            <button className="rounded-[10px] bg-white px-5 py-3.5 text-[15px] font-semibold text-[#a63a0f]">
              Download App
            </button>
            <button className="rounded-[10px] border border-white/50 px-5 py-3.5 text-[15px] font-semibold text-white">
              Order as Guest
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="mt-6 bg-[#f3e7e0] pb-4 pt-7 text-center md:mt-14 md:pb-6 md:pt-12 md:text-left">
        <div className="mx-auto px-4 md:grid md:grid-cols-[1.2fr_2fr] md:gap-12 md:px-8">
          <div>
            <Brand className="justify-center md:justify-start" />
            <p className="mx-auto mt-2 max-w-[320px] text-[13px] text-stone-500 md:mx-0">
              Delivering fresh culinary moments on campus. Skip the queues, eat well, study better.
            </p>
            <div className="mt-2.5 flex justify-center gap-2 md:justify-start">
              <button className="grid place-items-center rounded-lg p-2"><Share2 size={16} /></button>
              <button className="grid place-items-center rounded-lg p-2"><Bell size={16} /></button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs md:mt-0 md:grid md:grid-cols-3 md:justify-start md:gap-6 md:text-[13px]">
            {[
              ["Dining Hubs", ["Explore Menu", "Campus Locations", "Partner Dining"]],
              ["Wellness & Standards", ["Nutrition & Allergens", "Careers", "Express Lockers"]],
              ["Policy", ["Privacy Policy", "Terms of Service", "Student Safety"]],
            ].map(([title, links]) => (
              <div key={title} className="contents md:flex md:flex-col md:gap-2.5 md:text-stone-500">
                <b className="hidden text-[13px] text-[#1f1a17] md:mb-1 md:block">{title}</b>
                {links.map((l) => (
                  <a key={l} className="hover:text-[#a63a0f]">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-[18px] px-4 text-[11px] text-stone-500 md:mt-9 md:border-t md:border-[#f0e2da] md:px-8 md:pt-5">
          © 2026 Tap2Eat Inc. All rights reserved. Delivering fresh culinary moments on campus.
        </div>
      </footer>

      {/* STICKY BAG (mobile) */}
      {count > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-[14px] bg-[#2b2220] p-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,.3)] md:hidden">
          <div className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-[#a63a0f] text-xs font-bold">
            {count}
          </div>
          <div className="flex flex-1 flex-col text-[13px]">
            <b>View Active Bag</b>
            <small className="text-[11px] opacity-75">${total.toFixed(2)} • South Hall</small>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-[#a63a0f] px-4 py-2 text-[13px] font-semibold">
            Checkout <ShoppingBag size={14} />
          </button>
        </div>
      )}
    </div>
  );
}