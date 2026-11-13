import { useState, useMemo, useEffect, useRef } from "react";
import {
  Star, ArrowLeft, Share2, Home, Compass, Heart, Receipt, User, Search, Bell, ShoppingBag,
  ThumbsUp, MoreVertical, Camera, Send, Check, ChevronDown, X, Flag, EyeOff, BadgeCheck,
  PenLine, Award, ShoppingCart, Phone, UtensilsCrossed,
} from "lucide-react";

/* ---------- data ---------- */
const BASE = { avg: 4.8, total: 348, orders: 142, dist: { 5: 258, 4: 63, 3: 17, 2: 7, 1: 3 } };
const ATTRS = [["Taste", 4.9], ["Crispiness", 4.9], ["Portion Size", 4.7], ["Value for Money", 4.8]];
const HIGHLIGHTS = ["Extra Crispy", "Spicy Potato", "Generous Chutney", "Fast Prep", "Value for Money", "Good Portion"];
const LABELS = ["", "Needs work", "Could be better", "Good", "Really good", "Loved it!"];
const SORTS = ["Most Recent", "Highest Rated", "Lowest Rated", "Most Helpful"];

const POOL = [
  { id: 1, name: "Priya Sharma", sub: "B.Tech ECE '25", badge: "Student", rating: 5, age: 0, when: "Today, 12:40 PM",
    title: "Best dosa in North Canteen, always piping hot!",
    body: "The ghee roast aroma hits you as soon as you open the container at locker bay 14. Extra coconut chutney was fresh and cold, perfectly balancing the spicy potato filling. Ready in under 7 minutes!",
    tags: ["Token #B-29 • Counter 2", "Dine-in tray"], helpful: 24 },
  { id: 2, name: "Rohan Varma", sub: "Satish Dhawan Hostel 4", badge: "Resident", rating: 5, age: 1, when: "Yesterday, 8:15 PM",
    title: "Lifesaver during late-night exam prep",
    body: "The potato masala has the authentic south Indian mustard seeds and curry leaves tempering. Crispiness holds up even after taking it back to the hostel room.",
    tags: ["Token #A-104 • Hostel Takeaway"], photo: "🌯", helpful: 18 },
  { id: 3, name: "Ananya Iyer", sub: "M.Sc Biotech '24", badge: "Student", rating: 4, age: 2, when: "2 days ago",
    title: "Crispy and light, but sambar was slightly mild",
    body: "Dosa itself is easily a 5/5. Only docking one star because the sambar was on the milder side today. Would love an option to request extra spicy gunpowder podi!",
    tags: ["Token #N-44"], helpful: 9 },
  { id: 4, name: "Devendra Patel", sub: "Deanery Administration", badge: "Staff", rating: 5, age: 3, when: "3 days ago",
    title: "Consistently good quality",
    body: "Staff at Counter 2 is fast and polite during rush lunch hours.", tags: ["Staff Meal Subsidy Used"], helpful: 5 },
  { id: 5, name: "Kabir Menon", sub: "B.Des '26", badge: "Student", rating: 2, age: 4, when: "4 days ago",
    title: "Arrived lukewarm",
    body: "Taste was fine but the dosa had gone soft by the time I got it. Probably a rush-hour issue.", tags: ["Takeaway"], helpful: 3 },
  { id: 6, name: "Sneha Rao", sub: "MBA '25", badge: "Student", rating: 5, age: 5, when: "5 days ago",
    title: "Perfect breakfast", body: "Generous chutney and a very crispy edge. Ordered twice this week.", tags: ["Dine-in tray"], photo: "🥞", helpful: 11 },
  { id: 7, name: "Imran Sheikh", sub: "Hostel 2", badge: "Resident", rating: 4, age: 6, when: "6 days ago",
    title: "Great value", body: "At ₹90 this is the best deal on campus. Wish the portion of potato was a little bigger.", tags: ["Hostel Delivery"], helpful: 6 },
  { id: 8, name: "Tara Nair", sub: "B.Sc Physics '27", badge: "Student", rating: 1, age: 7, when: "A week ago",
    title: "Order mix-up", body: "Got a plain dosa instead of masala. Counter staff fixed it, but it took 20 minutes.", tags: ["Token #C-12"], helpful: 2 },
];
const FIRST_PAGE = 4;

const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const ago = (m) => (m < 1 ? "Just now" : `${Math.round(m)} min ago`);

function Stars({ value, size = 14, className = "" }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-orange-500 text-orange-500" : "text-orange-300"} />
      ))}
    </span>
  );
}

const RatingsReviews = () => {
  const [mine, setMine] = useState([]);
  const [shown, setShown] = useState(FIRST_PAGE);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("Most Recent");
  const [liked, setLiked] = useState({});
  const [likeBase, setLikeBase] = useState({});
  const [hidden, setHidden] = useState({});
  const [menu, setMenu] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState("");

  // form
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [picked, setPicked] = useState(["Extra Crispy", "Generous Chutney"]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showName, setShowName] = useState(true);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const formRef = useRef();
  const tt = useRef();

  const say = (m) => { setToast(m); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(""), 2200); };
  useEffect(() => () => clearTimeout(tt.current), []);
  useEffect(() => { const c = () => setMenu(null); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, []);

  /* ---------- derived stats (update when you submit) ---------- */
  const stats = useMemo(() => {
    const dist = { ...BASE.dist };
    mine.forEach((r) => { dist[r.rating] += 1; });
    const total = BASE.total + mine.length;
    const avg = (BASE.avg * BASE.total + mine.reduce((s, r) => s + r.rating, 0)) / total;
    return { dist, total, avg, orders: BASE.orders + mine.length };
  }, [mine]);

  const all = useMemo(() => [...mine, ...POOL], [mine]);
  const counts = useMemo(() => ({
    photos: all.filter((r) => r.photo).length,
    5: all.filter((r) => r.rating === 5).length,
    4: all.filter((r) => r.rating === 4).length,
    critical: all.filter((r) => r.rating <= 2).length,
  }), [all]);

  const list = useMemo(() => {
    let l = all.filter((r) => !hidden[r.id]);
    if (filter === "photos") l = l.filter((r) => r.photo);
    else if (filter === "5") l = l.filter((r) => r.rating === 5);
    else if (filter === "4") l = l.filter((r) => r.rating === 4);
    else if (filter === "critical") l = l.filter((r) => r.rating <= 2);
    const likes = (r) => r.helpful + (liked[r.id] ? 1 : 0);
    const s = [...l];
    if (sort === "Most Recent") s.sort((a, b) => a.age - b.age);
    if (sort === "Highest Rated") s.sort((a, b) => b.rating - a.rating || a.age - b.age);
    if (sort === "Lowest Rated") s.sort((a, b) => a.rating - b.rating || a.age - b.age);
    if (sort === "Most Helpful") s.sort((a, b) => likes(b) - likes(a));
    return s;
  }, [all, filter, sort, hidden, liked]);

  const visible = list.slice(0, shown);
  const filters = [
    ["all", `All Reviews (${stats.orders})`], ["photos", `With Photos (${counts.photos})`],
    ["5", `5 Stars (${counts[5]})`], ["4", `4 Stars (${counts[4]})`], ["critical", `Critical (${counts.critical})`],
  ];

  /* ---------- actions ---------- */
  const togglePick = (h) => setPicked((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]));
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return say("Please choose an image file");
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(f));
  };
  const submit = () => {
    if (!rating) { setError("Tap the stars to rate your dish first."); return; }
    if (text.trim().length < 10) { setError("Write at least 10 characters about your experience."); return; }
    setError("");
    const rev = {
      id: Date.now(), name: showName ? "Arjun K." : "Anonymous Diner", sub: showName ? "B.Tech CS '26" : "Verified purchase",
      badge: "Student", rating, age: -1, when: "Just now", title: LABELS[rating],
      body: text.trim(), tags: ["Token #B-42 • Counter 2", ...picked.slice(0, 2)], photo: photo || undefined, helpful: 0, own: true,
    };
    setMine((m) => [rev, ...m]);
    setRating(0); setText(""); setPhoto(null); setPicked([]); setFilter("all"); setSort("Most Recent");
    say("Review posted — you earned 15 Campus Karma points!");
  };
  const toggleLike = (r) => setLiked((l) => ({ ...l, [r.id]: !l[r.id] }));
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch (e) {}
    say("Link copied");
  };
  const goForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const active = hover || rating;

  const ReviewCard = ({ r }) => (
    <li className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-5">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 lg:w-9 lg:h-9 shrink-0 rounded-full bg-orange-100 text-orange-900 grid place-items-center text-sm font-semibold">{initials(r.name)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <b className="text-base">{r.name}</b>
            <span className="text-[11px] flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><BadgeCheck size={11} />{r.badge}</span>
          </div>
          <p className="hidden lg:block text-xs text-stone-500">{r.sub}</p>
          <p className="lg:hidden flex items-center gap-2 text-xs text-stone-500"><Stars value={r.rating} size={11} />{r.when}</p>
        </div>
        <div className="hidden lg:flex flex-col items-end gap-1 text-xs text-stone-500"><Stars value={r.rating} size={12} />{r.when}</div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button aria-label="More" onClick={() => setMenu(menu === r.id ? null : r.id)} className="p-1 text-stone-500 lg:hidden"><MoreVertical size={16} /></button>
          <button aria-label="More" onClick={() => setMenu(menu === r.id ? null : r.id)} className="p-1 text-stone-400 hidden lg:block"><MoreVertical size={14} /></button>
          {menu === r.id && (
            <div className="absolute right-0 top-7 z-10 w-40 bg-white border border-orange-100 rounded-lg shadow-lg text-sm overflow-hidden">
              <button onClick={() => { say("Reported — thanks for keeping reviews honest"); setMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50"><Flag size={13} />Report</button>
              <button onClick={() => { setHidden((h) => ({ ...h, [r.id]: true })); setMenu(null); say("Review hidden"); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50"><EyeOff size={13} />Hide</button>
            </div>
          )}
        </div>
      </div>

      <h4 className="hidden lg:block font-semibold text-sm mt-4">{r.title}</h4>
      <p className="text-[15px] lg:text-sm text-stone-700 mt-3 lg:mt-1.5 leading-relaxed">{r.body}</p>

      {r.photo && (
        <button onClick={() => setLightbox(r.photo)} className="mt-3 block w-24 h-24 lg:w-32 lg:h-28 rounded-lg overflow-hidden bg-orange-100 grid place-items-center text-5xl relative">
          {r.photo.startsWith("blob:") ? <img src={r.photo} alt="Review" className="w-full h-full object-cover" /> : r.photo}
          <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white rounded px-1.5">View</span>
        </button>
      )}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-orange-100">
        <div className="flex flex-wrap gap-2 flex-1">
          {r.tags.map((t) => <span key={t} className="text-xs bg-stone-100 text-stone-600 rounded-full px-3 py-1">{t}</span>)}
        </div>
        <button onClick={() => toggleLike(r)} aria-pressed={!!liked[r.id]}
          className={`flex items-center gap-1.5 text-xs border rounded-full px-3 py-1.5 ${liked[r.id] ? "bg-orange-800 text-white border-orange-800" : "border-stone-300 hover:bg-stone-50"}`}>
          <ThumbsUp size={13} />Helpful ({r.helpful + (liked[r.id] ? 1 : 0)})
        </button>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-24 lg:pb-0">
      {/* desktop header */}
      <header className="hidden lg:flex items-center gap-8 bg-orange-50 border-b border-orange-100 px-9 py-3">
        <span className="font-bold text-xl text-orange-800 flex items-center gap-2"><span className="w-9 h-9 rounded-lg bg-orange-800 text-white grid place-items-center"><UtensilsCrossed size={18} /></span>Tap2Eat</span>
        <nav className="flex gap-6 text-sm">{["Menu", "Orders", "Canteens", "Favourites"].map((n) => <a key={n} href="#" className={n === "Menu" ? "text-orange-800 font-semibold border-b-2 border-orange-800 pb-1" : ""}>{n}</a>)}</nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 w-60 border border-orange-100 rounded-full bg-white px-3 py-1.5 text-sm text-stone-400"><Search size={14} />Search items, counters…</div>
          <Bell size={18} /><span className="flex items-center gap-2 rounded-full border border-orange-200 px-3 py-1.5 text-sm bg-white"><ShoppingBag size={14} />Cart <b className="bg-orange-800 text-white rounded-full text-xs px-1.5">2</b></span>
          <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-900 grid place-items-center text-xs font-bold">AK</span>
        </div>
      </header>

      {/* mobile header */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-orange-100 flex items-center gap-3 px-4 py-3">
        <button aria-label="Back"><ArrowLeft size={22} /></button>
        <div className="flex-1"><h1 className="font-bold text-lg leading-tight">Ratings & Reviews</h1><p className="text-xs text-stone-500">Tap2Eat Campus Verified</p></div>
        <button onClick={share} aria-label="Share"><Share2 size={20} /></button>
        <span className="w-9 h-9 rounded-lg bg-orange-100 grid place-items-center">🥞</span>
      </header>

      <main className="mx-auto px-4 lg:px-6 pt-4 lg:pt-5">
        <div className="hidden lg:flex justify-between text-xs text-stone-500 mb-4">
          <p>Home › Menu › North Canteen › Crispy Masala Dosa › <span className="text-orange-800 font-medium">Reviews & Ratings</span></p>
          <a href="#" className="text-orange-800 flex items-center gap-1"><ArrowLeft size={12} />Back to Crispy Masala Dosa</a>
        </div>

        {/* item card */}
        <section className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-5 flex items-center gap-4 mb-5">
          <span className="w-14 h-14 lg:w-24 lg:h-24 rounded-lg bg-orange-100 grid place-items-center text-3xl lg:text-5xl shrink-0">🥞</span>
          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex gap-2 mb-2 text-[11px]">
              {["North Canteen", "Counter 2"].map((t) => <span key={t} className="border border-orange-200 rounded px-2 py-0.5">{t}</span>)}
              <span className="bg-orange-100 text-orange-900 rounded px-2 py-0.5">♥ Student Favourite</span>
            </div>
            <h2 className="font-bold text-lg lg:text-2xl">Crispy Masala Dosa</h2>
            <p className="hidden lg:block text-sm text-stone-600 mt-1 max-w-lg">Ghee-roasted crispy crepe filled with tempered mustard-potato masala, served hot with fresh coconut chutney & aromatic vegetable sambar.</p>
            <p className="text-sm text-stone-600 lg:hidden">₹90 • North Canteen</p>
            <p className="lg:hidden text-sm flex items-center gap-1 mt-0.5"><Star size={13} className="fill-orange-500 text-orange-500" /><b>{stats.avg.toFixed(1)}</b> <span className="text-stone-500">({stats.total} ratings)</span></p>
            <p className="hidden lg:block text-sm mt-2"><b className="text-orange-800 text-base">₹90</b> <span className="text-stone-500 text-xs ml-2">Avg. Prep: 6–8 mins</span></p>
          </div>
          <button onClick={goForm} className="lg:hidden flex items-center gap-1.5 bg-orange-100 text-orange-900 rounded-xl px-4 py-2.5 text-sm font-semibold"><PenLine size={15} />Rate</button>
          <div className="hidden lg:block text-center">
            <button onClick={() => say("Added to cart — ₹90")} className="flex items-center gap-2 bg-orange-800 hover:bg-orange-900 text-white font-semibold rounded-lg px-6 py-3"><ShoppingCart size={16} />Order Now • ₹90</button>
            <p className="text-[11px] text-stone-500 mt-2">Fast Token Ready at Counter 2</p>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-[1fr_1.9fr] lg:gap-6 lg:items-start">
          {/* LEFT */}
          <div className="space-y-5">
            {/* summary */}
            <section className="bg-white border border-orange-100 rounded-2xl p-5">
              <div className="hidden lg:flex justify-between items-start border-b border-orange-100 pb-3 mb-4">
                <div><h3 className="font-semibold">Overall Rating</h3><p className="text-xs text-stone-500">Based on campus student verifications</p></div>
                <span className="text-xs bg-orange-100 text-orange-900 rounded-full px-3 py-1 flex items-center gap-1"><Award size={12} />Top Rated</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                <div className="lg:bg-orange-50 lg:border lg:border-orange-100 lg:rounded-xl lg:p-4 lg:text-center">
                  <p className="text-5xl font-bold text-orange-800 leading-none">{stats.avg.toFixed(1)}<span className="lg:hidden text-base text-stone-500 font-normal"> / 5</span></p>
                  <Stars value={stats.avg} size={16} className="mt-2" />
                  <p className="text-[11px] text-stone-500 mt-2 hidden lg:block">out of 5</p>
                </div>
                <ul className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const pct = (stats.dist[s] / stats.total) * 100;
                    return (
                      <li key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-6">{s}★</span>
                        <span className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden"><span className="block h-full bg-orange-500 lg:bg-orange-800 transition-all" style={{ width: `${pct}%` }} /></span>
                        <span className="w-9 text-right text-stone-600">{Math.round(pct)}%</span>
                        <span className="hidden lg:block w-9 text-right text-stone-400">({stats.dist[s]})</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-xs text-stone-600 mt-3">{stats.total} ratings & {stats.orders} reviews</p>
              <p className="hidden lg:block text-xs text-stone-500 mt-1">96% of campus diners recommend this dish for quick lunch & dinner.</p>
              <div className="border-t border-orange-100 mt-4 pt-4">
                <p className="text-[11px] tracking-wide text-orange-900 mb-2">CAMPUS FOOD INDEX</p>
                <div className="flex flex-wrap lg:grid lg:grid-cols-2 gap-2">
                  {ATTRS.map(([n, v], i) => (
                    <span key={n} className={`text-sm border border-orange-200 rounded-full lg:rounded-md px-3 py-1.5 flex items-center justify-between gap-3 ${i > 2 ? "hidden lg:flex" : ""}`}>
                      {n} <b className="text-orange-800">{v}★</b>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* write review */}
            <section ref={formRef} className="bg-white border border-orange-100 border-t-4 border-t-orange-700 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold flex items-center gap-2"><PenLine size={16} className="text-orange-800" />Write a Review</h3>
                <span className="lg:hidden text-xs bg-stone-100 rounded px-2 py-0.5">Token #B-42</span>
              </div>
              <p className="text-sm text-stone-600 mb-4">
                <span className="lg:hidden">Reviewing your order: Crispy Masala Dosa</span>
                <span className="hidden lg:inline text-xs text-stone-500">Help fellow campus diners know how fresh & tasty this dish was!</span>
              </p>
              <div className="rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2 text-xs mb-4 hidden lg:block">
                <span className="text-stone-500">Selected Verified Meal</span><br />Order #T2E-89241 (Today, 01:21 PM - North Canteen)
              </div>

              <div className="rounded-xl bg-orange-50 border border-orange-100 text-center p-4 mb-4">
                <p className="text-xs text-stone-500 mb-2">Tap to rate your experience</p>
                <div className="flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onMouseEnter={() => setHover(i)} onClick={() => { setRating(i); setError(""); }}>
                      <Star size={32} className={`transition-colors ${i <= active ? "fill-orange-500 text-orange-500" : "text-orange-400"}`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-semibold text-orange-800 mt-2 min-h-5">{active ? `${LABELS[active]} (${active}.0)` : ""}</p>
              </div>

              <p className="text-sm font-medium mb-2">What made it great?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {HIGHLIGHTS.map((h) => {
                  const on = picked.includes(h);
                  return (
                    <button key={h} onClick={() => togglePick(h)} aria-pressed={on}
                      className={`text-xs rounded-full px-3 py-1.5 border flex items-center gap-1 ${on ? "bg-orange-800 text-white border-orange-800" : "bg-orange-50 border-orange-200"}`}>
                      {on && <Check size={12} />}{h}
                    </button>
                  );
                })}
              </div>

              <label className="text-sm font-medium block mb-2" htmlFor="rv">Your Detailed Experience</label>
              <div className="relative">
                <textarea id="rv" value={text} maxLength={250} onChange={(e) => { setText(e.target.value); setError(""); }}
                  placeholder="Write your review about the food taste, temperature, packing…"
                  className="w-full h-28 resize-none rounded-lg border border-orange-200 p-3 text-sm outline-none focus:border-orange-500" />
                <span className="absolute bottom-2 right-3 text-[11px] text-stone-500">{text.length} / 250</span>
              </div>

              <div className="flex gap-3 mt-3 items-stretch">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <button onClick={() => (photo ? (URL.revokeObjectURL(photo), setPhoto(null)) : fileRef.current.click())}
                  className="shrink-0 w-16 lg:w-auto lg:flex-1 border border-dashed border-stone-300 rounded-lg text-[11px] text-stone-600 flex flex-col lg:flex-row items-center justify-center gap-1 py-2 overflow-hidden">
                  {photo ? <><img src={photo} alt="Selected" className="w-8 h-8 rounded object-cover" /><span>Remove</span></> : <><Camera size={16} /><span>Add Photo<span className="hidden lg:inline"> (Optional)</span></span></>}
                </button>
                <button onClick={submit} className="lg:hidden flex-1 bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2">Submit Review <Send size={15} /></button>
              </div>

              <label className="hidden lg:flex items-center justify-between mt-3 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-3 text-xs cursor-pointer">
                Display as Verified Student Diners (Arjun K.)
                <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="accent-orange-800 w-4 h-4" />
              </label>
              {error && <p role="alert" className="text-xs text-red-700 mt-3">{error}</p>}
              <button onClick={submit} className="hidden lg:flex w-full mt-3 bg-orange-800 hover:bg-orange-900 text-white font-semibold rounded-lg py-3 items-center justify-center gap-2">Submit Review <Send size={14} /></button>
              <p className="hidden lg:block text-[11px] text-center text-stone-500 mt-3">Reviews follow Tap2Eat Campus Diners Code of Conduct. Verified student meals earn 15 Campus Karma points.</p>
            </section>
          </div>

          {/* RIGHT: reviews */}
          <section className="mt-6 lg:mt-0">
            <div className="lg:bg-white lg:border lg:border-orange-100 lg:rounded-2xl lg:p-5 lg:mb-4">
              <div className="flex items-end justify-between mb-3">
                <div><h3 className="text-xl lg:text-lg font-bold lg:font-semibold">{`Customer Reviews`}</h3>
                  <p className="hidden lg:block text-xs text-stone-500">Showing real feedback from North Canteen diners</p></div>
                <span className="lg:hidden text-xs text-stone-500">{stats.orders} verified orders</span>
                <label className="hidden lg:flex items-center gap-2 text-xs text-stone-600">Sort by:
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-orange-200 rounded-md px-2 py-1.5 bg-white">
                    {SORTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map(([id, l]) => (
                  <button key={id} onClick={() => { setFilter(id); setShown(FIRST_PAGE); }}
                    className={`shrink-0 text-xs rounded-full px-4 py-1.5 border ${filter === id ? "bg-orange-800 text-white border-orange-800" : "bg-white border-orange-200 hover:bg-orange-50"}`}>{l}</button>
                ))}
              </div>
              <label className="lg:hidden flex items-center gap-2 text-xs text-stone-600 mt-3">Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-orange-200 rounded-md px-2 py-1 bg-white">{SORTS.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            </div>

            {visible.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-2xl p-10 text-center text-stone-500">No reviews match this filter yet. Be the first to write one!</div>
            ) : (
              <ul className="space-y-4">{visible.map((r) => <ReviewCard key={r.id} r={r} />)}</ul>
            )}

            <div className="flex items-center justify-between mt-5 text-xs text-stone-500">
              <span>Showing {visible.length} of {list.length === all.length && filter === "all" ? stats.orders : list.length} student reviews</span>
              {shown < list.length && (
                <button onClick={() => setShown((s) => s + 3)} className="flex items-center gap-2 border border-orange-200 bg-white rounded-lg px-5 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-50">
                  Load More Reviews <ChevronDown size={14} />
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* desktop footer */}
      <footer className="hidden lg:block bg-white border-t border-orange-100 mt-12">
        <div className="mx-auto px-6 py-10 grid grid-cols-4 gap-8 text-sm text-stone-600">
          <div><p className="font-bold text-lg text-orange-800 mb-2">Tap2Eat</p>Official high-speed campus dining and smart canteen order orchestration network for students, faculty & residents.<p className="text-xs text-emerald-700 mt-3">● North Canteen Live: Kitchen Ready</p></div>
          <div><p className="font-semibold text-stone-800 mb-2">Campus Dining</p>{["Campus Dining Hours", "Hall Locations", "Student Meal Plans"].map((l) => <a key={l} href="#" className="block underline py-0.5">{l}</a>)}</div>
          <div><p className="font-semibold text-stone-800 mb-2">Dining Standards</p>{["Dietary & Allergens", "Campus Support", "Contact Dining Services"].map((l) => <a key={l} href="#" className="block underline py-0.5">{l}</a>)}</div>
          <div className="border border-orange-200 rounded-xl p-4 text-xs"><p className="font-semibold text-orange-800 mb-1">Campus Canteen Helpline</p>Emergency orders, allergen alerts & token issues:<a href="tel:+9108028993287" className="flex items-center gap-2 font-semibold text-stone-800 text-sm mt-2"><Phone size={14} />+91 (080) 2899-EATS</a><p className="mt-2">North Canteen Hours: 07:30 AM - 10:45 PM Daily</p></div>
        </div>
        <div className="mx-auto px-6 py-4 border-t border-orange-100 flex justify-between text-xs text-stone-500">
          <span>© 2025 Tap2Eat Campus Dining Systems. All rights reserved.</span><span>Campus ID Sync Active • FSSAI Certified Counters • Zero Food Waste Pledge</span>
        </div>
      </footer>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-orange-100 flex justify-around items-end py-2 text-[11px]">
        {[[Home, "Home"], [Compass, "Explore"], [Heart, "Favourites"], [Receipt, "Orders"], [User, "Profile"]].map(([I, l]) => (
          <button key={l} className={`flex flex-col items-center gap-0.5 ${l === "Explore" ? "bg-orange-700 text-white rounded-full w-14 h-14 justify-center -mt-4" : "text-stone-700"}`}><I size={20} />{l}</button>
        ))}
      </nav>

      {/* photo lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-40 bg-black/70 grid place-items-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" aria-label="Close"><X size={26} /></button>
          <div className="bg-orange-100 rounded-2xl w-full max-w-md aspect-square grid place-items-center text-[9rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {lightbox.startsWith("blob:") ? <img src={lightbox} alt="Review" className="w-full h-full object-cover" /> : lightbox}
          </div>
        </div>
      )}

      {toast && <div role="status" className="fixed z-50 left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
    </div>
  );
}

export default RatingsReviews;