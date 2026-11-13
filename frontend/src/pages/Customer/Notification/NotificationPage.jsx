import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft, CheckCheck, Settings, Bell, ShoppingBag, Search, Home, Utensils,
  Heart, Receipt, User, MoreVertical, X, Package, Flame, Tag, ThumbsUp,
  CheckCircle2, FileText, Star, ChefHat, Check, QrCode, MailCheck, Copy,
  RotateCcw, Download, MapPin, Trash2, Eye,
} from "lucide-react";

/* ---------- data ---------- */
const SEED = [
  { id: 1, group: "Today", cat: "orders", icon: "pack", tone: "violet", title: "Order Ready for Pickup", token: "#B-42", time: "5 mins ago", unread: true,
    body: "Your order is piping hot and packed! Proceed to North Canteen Counter 2 or collect from Smart Warm Locker #14 with your pickup PIN.",
    actions: [{ k: "pass", l: "Show Pickup Pass", primary: true }, { k: "directions", l: "Directions" }] },
  { id: 2, group: "Today", cat: "orders", icon: "fire", tone: "orange", title: "Kitchen Fired Up", token: "#B-42", time: "18 mins ago", unread: true,
    body: "Chef has fired up the tawa for your Paneer Butter Masala & Garlic Naan combo. Estimated readiness in 12 minutes at North Canteen.",
    actions: [{ k: "track", l: "Track Live Kitchen" }] },
  { id: 3, group: "Today", cat: "offers", icon: "tag", tone: "amber", title: "Campus Afternoon Craving Deal", token: "Limited Time", time: "1 hour ago", unread: true, code: "CAMPUS50",
    body: "Enjoy 50% off campus evening snacks + a free Kesar Mango Lassi on orders above ₹250 at South Food Court & Central Bakery.",
    actions: [{ k: "claim", l: "Claim Offer", primary: true }, { k: "copy", l: "Copy Code" }] },
  { id: 4, group: "Today", cat: "orders", icon: "like", tone: "blue", title: "Order Accepted by Kitchen", token: "#B-42", time: "28 mins ago", unread: true,
    body: "North Canteen kitchen terminal has acknowledged your order. Queue position: #3. Expected preparation time is 15-20 mins.",
    actions: [{ k: "details", l: "View Order Details" }] },
  { id: 5, group: "Yesterday", cat: "orders", icon: "check", tone: "green", title: "Order Collected Successfully", token: "#A-19", time: "Yesterday, 7:45 PM", unread: false,
    body: "Order #T2E-86412 (Masala Dosa + Filter Coffee) was picked up at South Food Court Counter 1. Enjoy your meal!",
    actions: [{ k: "rate", l: "Rate Order" }, { k: "reorder", l: "Reorder" }] },
  { id: 6, group: "Yesterday", cat: "orders", icon: "doc", tone: "green", title: "Payment Confirmed & Token Assigned", token: "#A-19", time: "Yesterday, 7:25 PM", unread: false,
    body: "₹110 debited from Student Dining Card. Order sent to South Food Court Kitchen Queue.",
    actions: [{ k: "invoice", l: "Tax Invoice" }] },
  { id: 7, group: "Yesterday", cat: "offers", icon: "star", tone: "amber", title: "Weekend Biryani Festival Announced", token: "Special Feast", time: "Yesterday, 1:15 PM", unread: false,
    body: "Pre-book your Dum Hyderabadi & Awadhi Jackfruit Biryani packs for Friday night dinner. Limited 200 portions per dining hall.",
    actions: [{ k: "preorder", l: "Pre-Order Now", primary: true }, { k: "menu", l: "View Feast Menu" }] },
];

const ICONS = { pack: Package, fire: Flame, tag: Tag, like: ThumbsUp, check: CheckCircle2, doc: FileText, star: Star };
const TONES = {
  violet: "bg-violet-100 text-violet-700", orange: "bg-orange-100 text-orange-700",
  amber: "bg-amber-100 text-amber-700", blue: "bg-sky-100 text-sky-700", green: "bg-emerald-100 text-emerald-700",
};
const STEPS = ["Order placed", "Accepted", "Cooking", "Packed", "Ready"];

/* ---------- small helpers ---------- */
const qrCells = (seed) => {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: 81 }, () => ((h = (h * 1664525 + 1013904223) >>> 0), h % 100 < 52));
};

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div role="status" className="fixed z-50 left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">
      {msg}
    </div>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-orange-800" : "bg-stone-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/* ---------- main ---------- */
// export default function Notifications() {
const Notifications = () => {
  const [items, setItems] = useState(SEED);
  const [tab, setTab] = useState("all");
  const [panel, setPanel] = useState(null);          // {id, kind}
  const [menuId, setMenuId] = useState(null);
  const [claimed, setClaimed] = useState({});
  const [rating, setRating] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ orders: true, offers: true });
  const [toast, setToast] = useState("");
  const timer = useRef();

  const say = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2200); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const close = () => setMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const visible = useMemo(() => items.filter((n) => prefs[n.cat]), [items, prefs]);
  const counts = {
    all: visible.length,
    unread: visible.filter((n) => n.unread).length,
    orders: visible.filter((n) => n.cat === "orders").length,
    offers: visible.filter((n) => n.cat === "offers").length,
  };
  const shown = visible.filter((n) => tab === "all" || (tab === "unread" ? n.unread : n.cat === tab));
  const groups = ["Today", "Yesterday"].map((g) => ({ g, list: shown.filter((n) => n.group === g) })).filter((x) => x.list.length);

  const patch = (id, p) => setItems((l) => l.map((n) => (n.id === id ? { ...n, ...p } : n)));
  const markAll = () => { setItems((l) => l.map((n) => ({ ...n, unread: false }))); say("All notifications marked as read"); };
  const remove = (id) => { setItems((l) => l.filter((n) => n.id !== id)); say("Notification dismissed"); };

  const act = (n, k) => {
    patch(n.id, { unread: false });
    const toggle = (kind) => setPanel((p) => (p && p.id === n.id && p.kind === kind ? null : { id: n.id, kind }));
    switch (k) {
      case "pass": return toggle("pass");
      case "track": return toggle("track");
      case "rate": return toggle("rate");
      case "claim": setClaimed((c) => ({ ...c, [n.id]: true })); return say("Offer claimed — it's in your wallet");
      case "copy":
        try { navigator.clipboard.writeText(n.code); } catch (e) {}
        return say(`Code ${n.code} copied`);
      case "directions": return say("Opening directions to Counter 2…");
      case "details": return say("Opening order details…");
      case "reorder": return say("Previous items added to your cart");
      case "invoice": return say("Tax invoice downloading…");
      case "preorder": return say("Pre-order started for Friday dinner");
      case "menu": return say("Opening feast menu…");
      default:
    }
  };

  const tabs = [["all", "All"], ["unread", "Unread"], ["orders", "Orders"], ["offers", "Offers"]];

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-24 lg:pb-0">
      {/* desktop header */}
      <header className="hidden lg:flex items-center gap-8 bg-white border-b border-orange-100 px-8 py-3">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-800">
          <span className="w-9 h-9 rounded-lg bg-orange-800 text-white grid place-items-center">🍴</span>Tap2Eat
        </div>
        <nav className="flex gap-6 text-sm">
          {["Home", "Menu", "Favourites", "My Orders", "Notifications", "Help"].map((n) => (
            <a key={n} href="#" className={n === "Notifications" ? "text-orange-800 font-semibold border-b-2 border-orange-800 pb-1" : "hover:text-orange-800"}>{n}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm text-stone-400 w-64"><Search size={14} /> Search tokens, dishes…</div>
          <span className="relative"><Bell size={19} />{counts.unread > 0 && <i className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />}</span>
          <ShoppingBag size={19} />
          <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-900 grid place-items-center text-xs font-bold">AK</span>
        </div>
      </header>

      {/* mobile header */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-orange-100 flex items-center gap-3 px-4 py-3">
        <button aria-label="Back"><ArrowLeft size={22} /></button>
        <h1 className="text-xl font-bold">Notifications</h1>
        {counts.unread > 0 && <span className="text-xs bg-orange-800 text-white rounded-full px-2 py-0.5 font-semibold">{counts.unread} New</span>}
        <button onClick={markAll} className="ml-auto flex items-center gap-1 text-sm text-orange-800"><CheckCheck size={16} />Mark all read</button>
      </header>

      <main className="mx-auto px-4 lg:px-8 pt-4 lg:pt-6">
        {/* desktop title */}
        <div className="hidden lg:flex items-end justify-between border-b border-orange-100 pb-4 mb-5">
          <div>
            <p className="text-xs text-stone-500 mb-3">Home › <span className="text-orange-800">Notifications</span></p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Notifications</h1>
              {counts.unread > 0 && <span className="text-xs bg-orange-800 text-white rounded-full px-2.5 py-0.5 font-semibold">{counts.unread} Unread</span>}
            </div>
            <p className="text-sm text-stone-500 mt-1">Stay updated on your live kitchen tokens, campus canteen pickups, and exclusive food deals.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={markAll} className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-4 py-2 text-sm hover:bg-orange-50"><CheckCheck size={15} />Mark All as Read</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-4 py-2 text-sm hover:bg-orange-50"><Settings size={15} />Notification Settings</button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 items-center">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border ${tab === id ? "bg-orange-800 text-white border-orange-800" : "bg-white border-orange-200 hover:bg-orange-50"}`}>
              {label}
              <span className={`text-xs rounded-full px-1.5 ${tab === id ? "bg-orange-600" : "bg-stone-100"}`}>{counts[id]}</span>
            </button>
          ))}
          <button onClick={() => setShowSettings(true)} className="lg:hidden shrink-0 ml-auto p-2 rounded-full bg-white border border-orange-200" aria-label="Settings"><Settings size={16} /></button>
        </div>

        {/* list */}
        {groups.map(({ g, list }) => (
          <section key={g} className="mb-8">
            <div className="flex justify-between text-xs font-semibold tracking-wide text-stone-600 mb-3">
              <span>{g.toUpperCase()}</span>
              <span className="font-normal text-stone-500">{list.length} {list.length === 1 ? "update" : "updates"}</span>
            </div>
            <ul className="space-y-3">
              {list.map((n) => {
                const Icon = ICONS[n.icon];
                const open = panel && panel.id === n.id ? panel.kind : null;
                return (
                  <li key={n.id} onClick={() => n.unread && patch(n.id, { unread: false })}
                    className={`rounded-xl border p-4 flex gap-3 sm:gap-4 cursor-default transition-colors ${n.unread ? "bg-orange-50 border-orange-200" : "bg-white border-orange-100"}`}>
                    <span className={`w-10 h-10 shrink-0 rounded-full grid place-items-center ${TONES[n.tone]}`}><Icon size={18} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="font-semibold">{n.title}</h3>
                          {n.unread && <i className="w-2 h-2 bg-red-700 rounded-full" aria-label="unread" />}
                          <span className="text-[11px] bg-white border border-orange-200 text-orange-800 rounded px-1.5 py-0.5">{n.token}</span>
                        </div>
                        <span className="hidden sm:block text-xs text-stone-500 whitespace-nowrap pt-1">{n.time}</span>
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button aria-label="More" onClick={() => setMenuId(menuId === n.id ? null : n.id)} className="p-1 text-stone-500"><MoreVertical size={16} /></button>
                          {menuId === n.id && (
                            <div className="absolute right-0 top-7 z-10 w-44 bg-white border border-orange-100 rounded-lg shadow-lg text-sm overflow-hidden">
                              <button onClick={() => { patch(n.id, { unread: !n.unread }); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50">
                                <Eye size={14} />{n.unread ? "Mark as read" : "Mark as unread"}
                              </button>
                              <button onClick={() => { remove(n.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-red-700">
                                <Trash2 size={14} />Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="sm:hidden text-xs text-stone-500">{n.time}</p>
                      <p className="text-sm text-stone-600 mt-1">{n.body}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        {n.actions.map((a) => {
                          const done = a.k === "claim" && claimed[n.id];
                          return (
                            <button key={a.k} disabled={done} onClick={() => act(n, a.k)}
                              className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-2 border ${
                                a.primary ? "bg-orange-800 text-white border-orange-800 hover:bg-orange-900 disabled:bg-emerald-700 disabled:border-emerald-700"
                                : "bg-white border-stone-200 hover:bg-stone-50"}`}>
                              {done ? <Check size={13} /> : a.k === "pass" ? <QrCode size={13} /> : a.k === "copy" ? <Copy size={13} /> : a.k === "reorder" ? <RotateCcw size={13} /> : a.k === "invoice" ? <Download size={13} /> : a.k === "directions" ? <MapPin size={13} /> : a.k === "rate" ? <Star size={13} /> : null}
                              {done ? "Claimed" : a.l}
                            </button>
                          );
                        })}
                        {n.code && <span className="text-xs text-stone-500">Code: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">{n.code}</code></span>}
                      </div>

                      {/* expandable panels */}
                      {open === "pass" && (
                        <div onClick={(e) => e.stopPropagation()} className="mt-3 flex items-center gap-4 bg-white border border-orange-200 rounded-xl p-3 w-fit">
                          <div className="grid grid-cols-9 gap-px bg-white p-1 border border-stone-200">
                            {qrCells(n.token).map((on, i) => <i key={i} className={`w-2.5 h-2.5 ${on ? "bg-stone-900" : "bg-white"}`} />)}
                          </div>
                          <div className="text-sm"><p className="text-stone-500 text-xs">Locker #14 PIN</p><p className="font-mono text-2xl font-bold tracking-widest">8492</p>
                            <button onClick={() => setPanel(null)} className="text-xs text-orange-800 underline mt-1">Hide</button></div>
                        </div>
                      )}
                      {open === "track" && (
                        <ol onClick={(e) => e.stopPropagation()} className="mt-3 flex items-center gap-1 overflow-x-auto bg-white border border-orange-200 rounded-xl p-3">
                          {STEPS.map((s, i) => (
                            <li key={s} className="flex items-center gap-1 shrink-0">
                              <span className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${i <= 2 ? "bg-orange-800 text-white" : "bg-stone-100 text-stone-500"}`}>
                                {i === 2 ? <ChefHat size={12} /> : i < 2 ? <Check size={12} /> : null}{s}
                              </span>
                              {i < STEPS.length - 1 && <span className="w-4 h-px bg-stone-300" />}
                            </li>
                          ))}
                        </ol>
                      )}
                      {open === "rate" && (
                        <div onClick={(e) => e.stopPropagation()} className="mt-3 flex items-center gap-1 bg-white border border-orange-200 rounded-xl p-3 w-fit">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} aria-label={`${s} stars`} onClick={() => { setRating((r) => ({ ...r, [n.id]: s })); say(`Thanks! You rated ${s}★`); setPanel(null); }}>
                              <Star size={22} className={s <= (rating[n.id] || 0) ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                            </button>
                          ))}
                          {rating[n.id] && <span className="text-xs text-stone-500 ml-2">Your rating: {rating[n.id]}★</span>}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {/* empty / caught up */}
        <div className="border-t border-orange-100 py-10 text-center">
          <MailCheck size={30} className="mx-auto text-stone-500 mb-2" />
          <p className="font-semibold">{shown.length === 0 ? "Nothing here right now" : "You're completely caught up!"}</p>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1">
            {shown.length === 0 ? "Try another filter, or turn categories back on in Notification Settings." : "Notifications older than 30 days are automatically archived. Check your order history for past receipts."}
          </p>
        </div>
      </main>

      {/* desktop footer */}
      <footer className="hidden lg:block bg-white border-t border-orange-100 mt-6">
        <div className="mx-auto px-8 py-10 grid grid-cols-4 gap-8 text-sm text-stone-600">
          <div><p className="font-bold text-xl text-orange-800 mb-2">Tap2Eat</p>Campus Dining Systems • Real-time kitchen token tracking and seamless ordering for campus residence halls.<p className="mt-3"><b className="text-stone-800">Canteen Operating Hours:</b> 7:30 AM – 11:00 PM (Daily)</p></div>
          <div><p className="font-semibold text-stone-800 mb-2">Campus Dining</p>{["Campus Dining Hours", "Hall Locations", "Student Meal Plans", "Dietary & Allergens"].map((l) => <a key={l} href="#" className="block underline py-0.5">{l}</a>)}</div>
          <div><p className="font-semibold text-stone-800 mb-2">Help & Services</p>{["Campus Support", "Contact Dining Services", "Lost Token Helpline", "Feedback & Complaints"].map((l) => <a key={l} href="#" className="block underline py-0.5">{l}</a>)}</div>
          <div className="border border-orange-200 rounded-xl p-4 text-xs"><p className="font-semibold text-orange-800 mb-1">Dining Desk Helpline</p>Facing delays with Token #B-42? Call the North Canteen Help Counter directly:<p className="font-semibold text-stone-800 mt-1">+91 (080) 4122-EATS (Ext. 402)</p></div>
        </div>
        <div className="mx-auto px-8 py-4 border-t border-orange-100 flex justify-between text-xs text-stone-500">
          <span>© 2025 Tap2Eat Campus Dining Systems. All rights reserved.</span>
          <span className="flex gap-6 underline"><a href="#">Privacy Policy</a><a href="#">Terms of Dining Service</a><a href="#">Health & Safety Guidelines</a></span>
        </div>
      </footer>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-orange-100 flex justify-around py-2 text-xs">
        {[[Home, "Home"], [Utensils, "Explore"], [Heart, "Favourites"], [Receipt, "Orders"], [User, "Profile"]].map(([I, l]) => (
          <button key={l} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full ${l === "Orders" ? "bg-orange-800 text-white px-5" : "text-stone-700"}`}>
            <I size={20} />{l}
          </button>
        ))}
      </nav>

      {/* settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setShowSettings(false)}>
          <div role="dialog" aria-modal="true" className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Notification Settings</h2>
              <button onClick={() => setShowSettings(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {[["orders", "Order & token updates", "Kitchen, pickup and payment alerts"], ["offers", "Offers & festivals", "Deals, coupons and special feasts"]].map(([k, t, d]) => (
              <div key={k} className="flex items-center justify-between py-3 border-b last:border-0 border-orange-100">
                <div><p className="font-medium text-sm">{t}</p><p className="text-xs text-stone-500">{d}</p></div>
                <Switch on={prefs[k]} label={t} onChange={() => setPrefs((p) => ({ ...p, [k]: !p[k] }))} />
              </div>
            ))}
            <button onClick={() => { setShowSettings(false); say("Preferences saved"); }} className="w-full mt-4 bg-orange-800 text-white rounded-lg py-2.5 font-semibold">Done</button>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}

export default Notifications