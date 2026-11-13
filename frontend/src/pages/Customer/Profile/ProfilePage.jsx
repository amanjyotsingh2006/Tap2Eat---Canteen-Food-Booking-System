import { useState, useEffect, useRef, useMemo } from "react";
import {
  Camera, MapPin, Plus, ChevronRight, ChevronDown, User, Lock, Bell, CreditCard, UtensilsCrossed,
  Receipt, HelpCircle, LogOut, Pencil, Shield, Smartphone, Mail, Phone, Building2, Settings,
  ArrowLeft, Search, ShoppingBag, Home, Compass, Heart, SlidersHorizontal, IdCard, Store,
  BadgeCheck, Clock, Wallet, X, Check, Eye, EyeOff,
} from "lucide-react";

const inr = (n) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COUNTERS = ["North Canteen Counter 2", "North Canteen Counter 1", "South Food Court Counter 1", "Night Mess Locker Bay"];
const NOTIFS = [
  ["live", "Live Order Updates", "Kitchen preparation, locker readiness, and pickup bay alerts via Push & WhatsApp."],
  ["offers", "Campus Canteen Offers & Meal Deals", "Flash student discounts, combo offers, and late-night library cafe vouchers."],
  ["specials", "Daily Canteen Specials & Menu Favourites", "Daily chef specials, regional food stall rotas, and seasonal ingredient drops."],
  ["receipts", "Order Receipts & Digital Invoices via Email", "Instant GST-compliant student dining receipts sent to your registered campus email."],
];

/* ---------- helpers ---------- */
function Switch({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${on ? "bg-orange-800" : "bg-stone-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const strength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

function Avatar({ photo, name, size }) {
  const ini = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return photo
    ? <img src={photo} alt={name} className={`${size} rounded-full object-cover border-4 border-orange-200`} />
    : <span className={`${size} rounded-full bg-orange-200 text-orange-900 border-4 border-orange-100 grid place-items-center font-bold text-2xl`}>{ini}</span>;
}

/* ---------- page ---------- */
const ProfileSettings =() => {
  const [profile, setProfile] = useState({ name: "Arjun Kumar", email: "arjun.kumar@campus.university.edu", phone: "+91 98765 43210", hostel: "North Wing Hostel, Room 402", counter: COUNTERS[0] });
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [balance, setBalance] = useState(1450);
  const [prefs, setPrefs] = useState({ live: true, offers: true, specials: false, receipts: true });
  const [twoFA, setTwoFA] = useState(true);
  const [pwdAgo, setPwdAgo] = useState("4 months ago");
  const [diet, setDiet] = useState({ veg: true, nutFree: true, jain: false });
  const [modal, setModal] = useState(null);
  const [nav, setNav] = useState("personal");
  const [toast, setToast] = useState("");
  const fileRef = useRef();
  const tt = useRef();

  const say = (m) => { setToast(m); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(""), 2200); };
  useEffect(() => () => clearTimeout(tt.current), []);
  const togglePref = (k) => { setPrefs((p) => ({ ...p, [k]: !p[k] })); };

  /* edit profile */
  const startEdit = () => { setDraft(profile); setErrors({}); setEditing(true); document.getElementById("personal")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const cancelEdit = () => { setEditing(false); setErrors({}); };
  const saveEdit = () => {
    const e = {};
    if (draft.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) e.email = "Enter a valid email address.";
    if (draft.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
    if (draft.hostel.trim().length < 3) e.hostel = "Enter your hostel and room.";
    setErrors(e);
    if (Object.keys(e).length) return say("Please fix the highlighted fields");
    setProfile({ ...draft, name: draft.name.trim() });
    setEditing(false);
    say("Profile updated");
  };

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return say("Please choose an image file");
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(f));
    say("Profile photo updated");
  };

  const goSection = (id) => { setNav(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const menu = [
    ["personal", User, "Personal Information", () => goSection("personal")],
    ["security", Lock, "Account Security", () => goSection("security")],
    ["notifs", Bell, "Notification Preferences", () => goSection("notifs")],
    ["card", CreditCard, "Campus Dining Card & Pass", () => { setNav("card"); setModal("topup"); }, "Active"],
    ["diet", UtensilsCrossed, "Dietary & Allergen Preferences", () => { setNav("diet"); setModal("diet"); }],
    ["orders", Receipt, "Order History & Receipts", () => { setNav("orders"); say("Opening order history…"); }],
    ["help", HelpCircle, "Help & Campus Support", () => { setNav("help"); setModal("help"); }],
  ];

  const dietSub = [diet.veg && "Veg preferences", diet.nutFree && "nut-free alerts", diet.jain && "Jain"].filter(Boolean).join(", ") || "No preferences set";
  const prefCount = Object.values(prefs).filter(Boolean).length;

  /* personal-info field */
  const Field = ({ k, label, icon: Icon, badge, readOnly, desktopOnly, mobileOnly, type = "text" }) => (
    <div className={`${desktopOnly ? "hidden lg:block" : ""} ${mobileOnly ? "lg:hidden" : ""} lg:rounded-xl lg:border lg:border-orange-100 lg:bg-orange-50/60 lg:p-4 py-2.5 border-b border-orange-100 lg:border-b last:border-b-0`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`f-${k}`} className="text-xs text-stone-600 lg:tracking-wide lg:uppercase">{label}</label>
        {badge && <span className="hidden lg:inline text-[11px] bg-orange-100 text-orange-900 rounded-full px-2.5 py-0.5">{badge}</span>}
        {Icon && <Icon size={16} className="lg:hidden text-stone-400" />}
      </div>
      {editing && !readOnly ? (
        <>
          <input id={`f-${k}`} type={type} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
            className={`mt-1 w-full rounded-md border px-2.5 py-1.5 bg-white outline-none focus:border-orange-500 ${errors[k] ? "border-red-500" : "border-orange-200"}`} />
          {errors[k] && <p role="alert" className="text-xs text-red-700 mt-1">{errors[k]}</p>}
        </>
      ) : (
        <p className="mt-1 font-medium break-words">{readOnly || profile[k]}</p>
      )}
    </div>
  );

  /* mobile account rows */
  const rows = [
    [Lock, "Change Password", `Last updated ${pwdAgo}`, () => setModal("password")],
    [Bell, "Notification Preferences", "Push, WhatsApp & Email alerts", () => setModal("notifs")],
    [UtensilsCrossed, "Dietary & Allergens", dietSub, () => setModal("diet")],
    [CreditCard, "Saved Payment & Meal Card", "UPI & Campus Card linked", () => setModal("pay")],
    [Store, "Delivery / Pickup Points", `Default: ${profile.counter}`, () => setModal("delivery")],
    [HelpCircle, "Help & Campus Support", "FAQs & Canteen Helpline", () => setModal("help")],
  ];

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-24 lg:pb-0">
      {/* desktop header */}
      <header className="hidden lg:flex items-center gap-8 bg-white border-b border-orange-100 px-8 py-3">
        <span className="font-bold text-xl text-orange-800 flex items-center gap-2"><UtensilsCrossed size={20} />Tap2Eat</span>
        <nav className="flex gap-6 text-sm">{["Menu", "Campus Dining", "Notifications", "Help"].map((n) => <a key={n} href="#" className="hover:text-orange-800">{n}</a>)}</nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 w-60 border border-orange-100 rounded-full bg-orange-50 px-3 py-1.5 text-sm text-stone-400"><Search size={14} />Search dish, canteen, stall…</div>
          <Bell size={18} />
          <span className="relative"><ShoppingBag size={18} /><i className="absolute -top-2 -right-2 bg-orange-800 text-white text-[10px] rounded-full w-4 h-4 grid place-items-center not-italic">2</i></span>
          <span className="flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 pl-1 pr-3 py-1 text-xs font-semibold">
            {photo ? <img src={photo} alt="" className="w-7 h-7 rounded-full object-cover" /> : <span className="w-7 h-7 rounded-full bg-orange-200 grid place-items-center text-orange-900">{profile.name[0]}</span>}
            {profile.name}<ChevronDown size={14} />
          </span>
        </div>
      </header>

      {/* mobile header */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-orange-100 flex items-center justify-between px-4 py-3">
        <button aria-label="Back"><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">My Profile</h1>
        <button aria-label="Settings" onClick={() => setModal("notifs")}><Settings size={22} /></button>
      </header>

      <main className="mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <p className="hidden lg:block text-xs text-stone-500 mb-5">Home › Account › <span className="text-orange-800 font-medium">Profile & Settings</span></p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />

        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start">
          {/* ========== SIDEBAR / PROFILE CARD ========== */}
          <aside className="lg:sticky lg:top-6 space-y-5 mb-5 lg:mb-0">
            <section className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-6">
              <div className="flex lg:flex-col items-center gap-4 lg:gap-0 lg:text-center">
                <div className="relative shrink-0">
                  <Avatar photo={photo} name={profile.name} size="w-20 h-20 lg:w-28 lg:h-28" />
                  <button onClick={() => fileRef.current.click()} aria-label="Change photo" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-800 text-white border-2 border-white grid place-items-center"><Camera size={14} /></button>
                </div>
                <div className="flex-1 lg:mt-3 min-w-0">
                  <h2 className="text-xl lg:text-2xl font-bold truncate">{profile.name}</h2>
                  <p className="text-sm text-stone-600"><span className="lg:hidden">B.Tech CS • #CS-2022-84</span><span className="hidden lg:inline">B.Tech CS • 2022-84</span></p>
                  <div className="lg:hidden flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-orange-100 text-orange-900 rounded-full px-2.5 py-1 flex items-center gap-1"><BadgeCheck size={12} />Verified Student</span>
                    <span className="text-xs bg-orange-100 text-orange-900 rounded-full px-2.5 py-1 flex items-center gap-1"><Wallet size={12} />Meal Card: ₹{balance.toLocaleString("en-IN")}</span>
                  </div>
                  <span className="hidden lg:inline-flex items-center gap-1.5 mt-3 text-xs border border-orange-200 bg-orange-50 rounded-full px-3 py-1.5"><MapPin size={13} className="text-orange-800" />{profile.hostel}</span>
                </div>
              </div>

              <div className="lg:hidden flex items-center justify-between border-t border-orange-100 mt-4 pt-4">
                <span className="text-sm flex items-center gap-2 text-stone-700"><Clock size={15} className="text-orange-800" />Active Term • Fall '25</span>
                <button onClick={editing ? cancelEdit : startEdit} className="flex items-center gap-2 border border-orange-300 bg-orange-50 text-orange-900 font-semibold rounded-lg px-5 py-2"><Pencil size={14} />{editing ? "Cancel" : "Edit Profile"}</button>
              </div>

              <div className="hidden lg:flex items-center justify-between mt-5 rounded-xl border border-orange-200 bg-orange-50/60 p-4">
                <div><p className="text-[11px] tracking-wide text-stone-600">DINING CARD</p><p className="text-xl font-bold mt-0.5">{inr(balance)}</p></div>
                <button onClick={() => setModal("topup")} className="flex items-center gap-1 bg-orange-800 hover:bg-orange-900 text-white text-sm font-semibold rounded-full px-4 py-2"><Plus size={14} />Top Up</button>
              </div>
            </section>

            <nav className="hidden lg:block bg-white border border-orange-100 rounded-2xl p-2" aria-label="Settings sections">
              {menu.map(([id, Icon, label, fn, tag]) => (
                <button key={id} onClick={fn} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left ${nav === id ? "bg-orange-100 text-orange-900 font-semibold" : "hover:bg-orange-50"}`}>
                  <Icon size={17} className="text-orange-800" /><span className="flex-1">{label}</span>
                  {tag && <span className="text-[11px] bg-orange-100 text-orange-800 rounded-full px-2 py-0.5">{tag}</span>}
                  {nav === id && !tag && <ChevronRight size={15} />}
                </button>
              ))}
              <div className="border-t border-orange-100 mt-2 pt-2">
                <button onClick={() => setModal("logout")} className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-orange-800 font-medium hover:bg-orange-50"><LogOut size={17} />Log Out</button>
              </div>
            </nav>
          </aside>

          {/* ========== CONTENT ========== */}
          <div className="space-y-5 min-w-0">
            <div className="hidden lg:flex items-start justify-between">
              <div><h1 className="text-3xl font-bold">Profile & Account Settings</h1><p className="text-stone-600 mt-1">Manage your student identity, contact info, security, and notification settings.</p></div>
              <button onClick={editing ? cancelEdit : startEdit} className="flex items-center gap-2 bg-orange-800 hover:bg-orange-900 text-white font-semibold rounded-lg px-5 py-2.5"><Pencil size={15} />{editing ? "Cancel Editing" : "Edit Profile"}</button>
            </div>

            {/* Personal info */}
            <section id="personal" className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-6 scroll-mt-6">
              <div className="flex items-start justify-between lg:border-b lg:border-orange-100 lg:pb-4 mb-2 lg:mb-5">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-lg lg:text-base"><IdCard size={18} className="text-orange-800" />Personal Information</h3>
                  <p className="hidden lg:block text-xs text-stone-500 mt-1">Primary institutional credentials linked to student portal.</p>
                </div>
                <span className="lg:hidden text-xs bg-stone-100 text-stone-600 rounded-full px-3 py-1">Campus Registry</span>
                <button onClick={editing ? cancelEdit : startEdit} className="hidden lg:flex items-center gap-1 text-xs text-orange-800"><Pencil size={12} />{editing ? "Cancel" : "Edit"}</button>
              </div>

              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <Field k="name" label="Full Name" icon={User} />
                <Field k="email" label="Email Address / Campus Email" icon={Mail} badge="✓ Verified Student" type="email" />
                <Field k="phone" label="Phone Number / Contact Number" icon={Phone} badge="SMS & WhatsApp" type="tel" />
                <Field k="id" label="Student / Employee ID" readOnly="CS-2022-84" desktopOnly />
                <Field k="dept" label="Department & Year" readOnly="Computer Science & Engineering • 3rd Year" desktopOnly />
                <div className="hidden lg:block rounded-xl border border-orange-100 bg-orange-50/60 p-4">
                  <p className="text-xs tracking-wide uppercase text-stone-600">Preferred Delivery / Counter Bay</p>
                  <button onClick={() => setModal("delivery")} className="mt-1 font-medium text-orange-800 flex items-center gap-2"><Store size={15} />{profile.counter}</button>
                </div>
                <Field k="hostel" label="Campus Hostel / Hall" icon={Building2} mobileOnly />
              </div>

              {editing && (
                <div className="flex gap-3 mt-4 justify-end">
                  <button onClick={cancelEdit} className="border border-stone-300 rounded-lg px-5 py-2 text-sm">Cancel</button>
                  <button onClick={saveEdit} className="bg-orange-800 hover:bg-orange-900 text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-2"><Check size={14} />Save Changes</button>
                </div>
              )}
            </section>

            {/* Desktop: security */}
            <section id="security" className="hidden lg:block bg-white border border-orange-100 rounded-2xl p-6 scroll-mt-6">
              <h3 className="font-semibold flex items-center gap-2"><Shield size={17} className="text-orange-800" />Account Security & Settings</h3>
              <p className="text-xs text-stone-500 mt-1 pb-4 border-b border-orange-100">Control access methods and authentication factors.</p>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/60 p-5">
                <div><p className="font-semibold">Password</p><p className="text-sm text-stone-600 mt-1">Last changed {pwdAgo} • Strength: Strong</p></div>
                <button onClick={() => setModal("password")} className="bg-white border border-orange-200 rounded-lg px-4 py-2 text-sm hover:bg-orange-50">Update Password</button>
              </div>
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50/60 p-5">
                <span className="w-11 h-11 rounded-lg bg-orange-100 text-orange-800 grid place-items-center"><Smartphone size={20} /></span>
                <div className="flex-1"><p className="font-semibold">Two-Factor Authentication (2FA)</p><p className="text-sm text-stone-600">Active via Campus Authenticator app for rapid meal authorizations.</p></div>
                <span className={`text-[11px] font-semibold tracking-wide ${twoFA ? "text-orange-800" : "text-stone-500"}`}>{twoFA ? "ENABLED" : "DISABLED"}</span>
                <Switch on={twoFA} label="Two-factor authentication" onChange={() => (twoFA ? setModal("2fa") : (setTwoFA(true), say("2FA enabled")))} />
              </div>
            </section>

            {/* Desktop: notification prefs */}
            <section id="notifs" className="hidden lg:block bg-white border border-orange-100 rounded-2xl p-6 scroll-mt-6">
              <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal size={17} className="text-orange-800" />Notification Preferences</h3>
              <p className="text-xs text-stone-500 mt-1 pb-4 border-b border-orange-100">Select which campus alerts and order status notifications you want to receive.</p>
              <ul className="divide-y divide-orange-100">
                {NOTIFS.map(([k, t, d]) => (
                  <li key={k} className="flex items-center justify-between gap-6 py-4">
                    <div><p className="font-medium">{t}</p><p className="text-sm text-stone-600">{d}</p></div>
                    <Switch on={prefs[k]} label={t} onChange={() => togglePref(k)} />
                  </li>
                ))}
              </ul>
            </section>

            {/* Mobile: account settings list */}
            <section className="lg:hidden bg-white border border-orange-100 rounded-2xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-orange-100">
                <h3 className="font-semibold flex items-center gap-2 text-lg"><Settings size={18} className="text-orange-800" />Account Settings</h3>
                <span className="text-xs text-stone-600">Tap to configure</span>
              </div>
              {rows.map(([Icon, t, s, fn]) => (
                <button key={t} onClick={fn} className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b last:border-0 border-orange-100">
                  <span className="w-11 h-11 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 grid place-items-center shrink-0"><Icon size={18} /></span>
                  <span className="flex-1 min-w-0"><b className="block">{t}</b><span className="text-sm text-stone-600 block truncate">{s}</span></span>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              ))}
            </section>

            {/* Mobile: quick prefs */}
            <section className="lg:hidden bg-white border border-orange-100 rounded-2xl p-4">
              <h3 className="font-semibold flex items-center gap-2 text-lg mb-3"><SlidersHorizontal size={18} className="text-orange-800" />Quick Preferences</h3>
              {[["live", "WhatsApp Order Updates", "Instant pickup readiness notifications"], ["offers", "Campus Special Deals", "Happy hours & dining hall combo discounts"]].map(([k, t, d]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-3 border-t first:border-0 border-orange-100">
                  <div><p className="font-semibold">{t}</p><p className="text-sm text-stone-600">{d}</p></div>
                  <Switch on={prefs[k]} label={t} onChange={() => togglePref(k)} />
                </div>
              ))}
            </section>

            <button onClick={() => setModal("logout")} className="lg:hidden w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-orange-800 font-semibold py-3.5"><LogOut size={18} />Log Out of Campus Account</button>
            <p className="lg:hidden text-center text-xs text-stone-500">Tap2Eat Campus v2.4.12 • Secure Student Session</p>
          </div>
        </div>
      </main>

      {/* desktop footer */}
      <footer className="hidden lg:block bg-stone-100 border-t border-orange-100 mt-12">
        <div className="mx-auto px-8 py-8 flex justify-between gap-10 text-sm">
          <div><p className="font-bold text-xl text-orange-800 flex items-center gap-2"><UtensilsCrossed size={18} />Tap2Eat</p><p className="text-stone-600 mt-2 max-w-xs">© 2025 Tap2Eat Campus Dining Systems. All rights reserved.</p></div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 justify-end content-start underline text-orange-900">
            {["Campus Dining Hours", "Hall Locations", "Student Meal Plans", "Dietary & Allergens", "Campus Support", "Contact Dining Services"].map((l) => <a key={l} href="#">{l}</a>)}
          </nav>
        </div>
      </footer>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-orange-100 flex justify-around items-center py-2 text-[11px]">
        {[[Home, "Home"], [Compass, "Explore"], [Heart, "Favourites"], [Receipt, "Orders"], [User, "Profile"]].map(([I, l]) => (
          <button key={l} className={`flex flex-col items-center gap-0.5 ${l === "Profile" ? "bg-orange-800 text-white rounded-full px-5 py-2" : "text-stone-700"}`}><I size={19} />{l}</button>
        ))}
      </nav>

      {/* ===== modals ===== */}
      {modal === "topup" && <TopUp balance={balance} onClose={() => setModal(null)} onDone={(a) => { setBalance((b) => b + a); setModal(null); say(`${inr(a)} added to your dining card`); }} />}
      {modal === "password" && <Password onClose={() => setModal(null)} onDone={() => { setPwdAgo("just now"); setModal(null); say("Password updated"); }} />}
      {modal === "2fa" && (
        <Modal title="Turn off 2FA?" onClose={() => setModal(null)}>
          <p className="text-sm text-stone-600 mb-4">Meal authorizations will no longer need your Campus Authenticator app. We recommend keeping it on.</p>
          <div className="flex gap-3"><button onClick={() => setModal(null)} className="flex-1 border border-stone-300 rounded-lg py-2.5">Keep enabled</button>
            <button onClick={() => { setTwoFA(false); setModal(null); say("2FA disabled"); }} className="flex-1 bg-orange-800 text-white rounded-lg py-2.5 font-semibold">Turn off</button></div>
        </Modal>
      )}
      {modal === "notifs" && (
        <Modal title="Notification Preferences" onClose={() => setModal(null)}>
          <p className="text-xs text-stone-500 mb-2">{prefCount} of {NOTIFS.length} alert types on</p>
          {NOTIFS.map(([k, t, d]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3 border-t border-orange-100"><div><p className="font-medium text-sm">{t}</p><p className="text-xs text-stone-500">{d}</p></div><Switch on={prefs[k]} label={t} onChange={() => togglePref(k)} /></div>
          ))}
        </Modal>
      )}
      {modal === "diet" && (
        <Modal title="Dietary & Allergens" onClose={() => setModal(null)}>
          {[["veg", "Vegetarian only"], ["nutFree", "Nut-free alerts"], ["jain", "Jain-friendly (no root vegetables)"]].map(([k, t]) => (
            <div key={k} className="flex items-center justify-between py-3 border-t first:border-0 border-orange-100"><p className="text-sm font-medium">{t}</p><Switch on={diet[k]} label={t} onChange={() => setDiet((d) => ({ ...d, [k]: !d[k] }))} /></div>
          ))}
          <button onClick={() => { setModal(null); say("Dietary preferences saved"); }} className="w-full mt-4 bg-orange-800 text-white rounded-lg py-2.5 font-semibold">Save</button>
        </Modal>
      )}
      {modal === "delivery" && (
        <Modal title="Default Pickup Point" onClose={() => setModal(null)}>
          <div className="space-y-2">
            {COUNTERS.map((c) => (
              <button key={c} onClick={() => { setProfile((p) => ({ ...p, counter: c })); setDraft((d) => ({ ...d, counter: c })); setModal(null); say(`Default set to ${c}`); }}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm text-left ${profile.counter === c ? "border-orange-800 bg-orange-50 font-semibold" : "border-orange-100"}`}>
                {c}{profile.counter === c && <Check size={16} className="text-orange-800" />}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === "pay" && (
        <Modal title="Saved Payment & Meal Card" onClose={() => setModal(null)}>
          <div className="rounded-xl border border-orange-100 p-4 mb-3 flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold grid place-items-center">UPI</span><div><p className="font-semibold text-sm">Google Pay UPI</p><p className="text-xs text-stone-500">arjun@okhdfc • Linked</p></div></div>
          <div className="rounded-xl border border-orange-100 p-4 mb-4 flex items-center justify-between"><div><p className="font-semibold text-sm">Campus Dining Card</p><p className="text-xs text-stone-500">Balance {inr(balance)}</p></div><button onClick={() => setModal("topup")} className="text-sm text-orange-800 font-semibold">Top Up</button></div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal title="Help & Campus Support" onClose={() => setModal(null)}>
          <p className="text-sm text-stone-600 mb-4">Facing an issue with an order or token? Reach the Canteen Helpline.</p>
          <a href="tel:+9108028993287" className="block text-center bg-orange-800 text-white rounded-lg py-3 font-semibold mb-2">Call +91 (080) 2899-EATS</a>
          <a href="mailto:canteen-ops@campus.edu" className="block text-center border border-orange-200 rounded-lg py-3 text-sm">Email canteen-ops@campus.edu</a>
        </Modal>
      )}
      {modal === "logout" && (
        <Modal title="Log out?" onClose={() => setModal(null)}>
          <p className="text-sm text-stone-600 mb-4">You'll need to sign in again with your campus credentials to place orders.</p>
          <div className="flex gap-3"><button onClick={() => setModal(null)} className="flex-1 border border-stone-300 rounded-lg py-2.5">Stay signed in</button>
            <button onClick={() => { setModal(null); say("Logged out — redirecting to sign in…"); }} className="flex-1 bg-orange-800 text-white rounded-lg py-2.5 font-semibold">Log out</button></div>
        </Modal>
      )}

      {toast && <div role="status" className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
    </div>
  );
}

/* ---------- Top up modal ---------- */
function TopUp({ balance, onClose, onDone }) {
  const [amt, setAmt] = useState(500);
  const [custom, setCustom] = useState("");
  const value = custom ? Number(custom) : amt;
  const valid = value >= 50 && value <= 5000;
  return (
    <Modal title="Top Up Dining Card" onClose={onClose}>
      <p className="text-sm text-stone-600 mb-3">Current balance: <b>{inr(balance)}</b></p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[200, 500, 1000, 2000].map((a) => (
          <button key={a} onClick={() => { setAmt(a); setCustom(""); }} className={`rounded-lg border py-2 text-sm font-semibold ${!custom && amt === a ? "bg-orange-800 text-white border-orange-800" : "border-orange-200"}`}>₹{a}</button>
        ))}
      </div>
      <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Or enter amount (₹50 – ₹5,000)"
        className="w-full border border-orange-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
      {!valid && <p className="text-xs text-red-700 mt-2">Enter an amount between ₹50 and ₹5,000.</p>}
      <p className="text-xs text-stone-500 mt-3">Paid via Google Pay UPI • New balance {valid ? inr(balance + value) : "—"}</p>
      <button disabled={!valid} onClick={() => onDone(value)} className="w-full mt-4 bg-orange-800 disabled:bg-stone-300 text-white rounded-lg py-3 font-semibold">Add {valid ? inr(value) : "money"}</button>
    </Modal>
  );
}

/* ---------- Password modal ---------- */
function Password({ onClose, onDone }) {
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [cf, setCf] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState("");
  const s = useMemo(() => strength(nw), [nw]);
  const submit = () => {
    if (!cur) return setErr("Enter your current password.");
    if (nw.length < 8) return setErr("New password must be at least 8 characters.");
    if (s < 3) return setErr("Add upper & lower case letters and a number.");
    if (nw === cur) return setErr("New password must differ from the current one.");
    if (nw !== cf) return setErr("Passwords don't match.");
    onDone();
  };
  const inp = "w-full border border-orange-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500";
  return (
    <Modal title="Update Password" onClose={onClose}>
      <div className="space-y-3">
        <input type={show ? "text" : "password"} value={cur} onChange={(e) => { setCur(e.target.value); setErr(""); }} placeholder="Current password" className={inp} autoComplete="current-password" />
        <div className="relative">
          <input type={show ? "text" : "password"} value={nw} onChange={(e) => { setNw(e.target.value); setErr(""); }} placeholder="New password" className={inp} autoComplete="new-password" />
          <button type="button" onClick={() => setShow(!show)} aria-label="Toggle visibility" className="absolute right-3 top-3 text-stone-500">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded ${i <= s ? (s < 3 ? "bg-orange-400" : "bg-emerald-600") : "bg-stone-200"}`} />)}</div>
        <p className="text-xs text-stone-500">Strength: {["Too short", "Weak", "Fair", "Strong", "Very strong"][nw ? s : 0]}</p>
        <input type={show ? "text" : "password"} value={cf} onChange={(e) => { setCf(e.target.value); setErr(""); }} placeholder="Confirm new password" className={inp} autoComplete="new-password" />
      </div>
      {err && <p role="alert" className="text-xs text-red-700 mt-3">{err}</p>}
      <button onClick={submit} className="w-full mt-4 bg-orange-800 text-white rounded-lg py-3 font-semibold">Update Password</button>
    </Modal>
  );
}

export default ProfileSettings;