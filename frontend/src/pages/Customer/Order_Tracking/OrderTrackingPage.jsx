import { useState, useEffect, useRef, useMemo } from "react";
import {
  Copy, Check, Download, Share2, Headset, Clock, Timer, Ticket, Store, ChefHat, Bell, ClipboardList,
  CheckCircle2, Flame, Phone, ArrowLeft, RefreshCw, HelpCircle, QrCode, MapPin, X, Lock, Tag,
  GraduationCap, UtensilsCrossed, Search, ShoppingBag, ShieldCheck, Mail, ListOrdered, Package, Compass, User,
} from "lucide-react";

/* ---------- data ---------- */
const ORDER = {
  id: "#T2E-89241", token: "#B-42", pin: "4821", placed: "01:21 PM",
  items: [
    { id: 1, name: "Crispy Masala Dosa", emoji: "🥞", qty: 2, price: 200, opts: "Medium Spiced, Extra Coconut Chutney, Golden Ghee Roast", mOpts: "Extra Coconut Chutney", state: "In Pan", station: "South Indian Tawa #1" },
    { id: 2, name: "Paneer Butter Masala Combo", emoji: "🍛", qty: 1, price: 140, opts: "2 Phulkas, Medium spice, Fresh Butter Topping", mOpts: "Includes 2 Tandoori Roti", state: "Plated", station: "North Indian Curry Bay" },
    { id: 3, name: "Kesar Mango Lassi 300ml", emoji: "🥤", qty: 1, price: 50, opts: "Chilled Kulhad, Saffron Pistachio Garnish, Low Sugar", mOpts: "300ml Chilled", state: "Packed & Chilled", station: "Beverage Counter" },
  ],
  coupon: 50, subsidy: 34, tax: 25.8,
};
const STAGES = [
  { t: "Order Placed", time: "01:21 PM", sub: "Online via UPI", m: "Order confirmed & payment verified", Icon: Check },
  { t: "Order Accepted", time: "01:23 PM", sub: "North Kitchen Staff", m: "North Canteen acknowledged ticket", Icon: ClipboardList },
  { t: "Preparing", time: "01:25 PM", sub: "On tawa station now", m: "Chef is packing your meal on live tawa", Icon: ChefHat },
  { t: "Ready for Pickup", time: "Est. 01:33 PM", sub: "Locker Bay #14 / Ctr 2", m: "Token callout at Counter 2 or Locker #14", Icon: Bell },
  { t: "Completed", time: "Final step", sub: "Token tap required", m: "Meal collected & closed", Icon: CheckCircle2 },
];
const inr = (n) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const REFRESH = 15;

function qrCells(seed) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const g = Array.from({ length: 81 }, () => ((h = (h * 1664525 + 1013904223) >>> 0), h % 100 < 50));
  [[0, 0], [0, 6], [6, 0]].forEach(([r, c]) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g[(r + i) * 9 + c + j] = i === 1 && j === 1 ? false : true; });
  return g;
}
function Qr({ cell = "w-3 h-3" }) {
  const cells = useMemo(() => qrCells(ORDER.token), []);
  return (
    <div className="inline-grid grid-cols-9 gap-px bg-white p-1.5 border border-stone-300 rounded-lg" aria-label="Pickup QR code">
      {cells.map((on, i) => <i key={i} className={`${cell} ${on ? "bg-stone-900" : "bg-white"}`} />)}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">{title}</h2><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function TrackOrder() {
  const [stage, setStage] = useState(2);          // 0-4
  const [progress, setProgress] = useState(65);   // kitchen % while preparing
  const [count, setCount] = useState(REFRESH);
  const [spin, setSpin] = useState(false);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const tt = useRef();

  const say = (m) => { setToast(m); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(""), 2400); };
  useEffect(() => () => clearTimeout(tt.current), []);

  const subtotal = ORDER.items.reduce((s, i) => s + i.price, 0);
  const total = subtotal - ORDER.coupon - ORDER.subsidy + ORDER.tax;
  const pct = stage >= 3 ? 100 : progress;
  const mins = stage >= 3 ? 0 : Math.max(1, Math.round((100 - progress) * 0.23));
  const queue = stage >= 3 ? 0 : Math.max(1, Math.ceil((100 - progress) / 14));
  const ready = stage >= 3;
  const done = stage >= 4;

  /* refresh = pull latest kitchen status (simulated) */
  const refresh = (auto = false) => {
    setSpin(true); setTimeout(() => setSpin(false), 700);
    setCount(REFRESH);
    if (stage >= 3) { if (!auto) say("Status is up to date"); return; }
    const next = Math.min(100, progress + 8 + Math.floor(Math.random() * 10));
    setProgress(next);
    if (next >= 100) { setStage(3); say(`Token ${ORDER.token} is ready — collect at Counter 2 or Locker #14!`); }
    else if (!auto) say("Kitchen status refreshed");
  };

  /* auto-refresh countdown */
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [done]);
  useEffect(() => { if (count <= 0 && !done) refresh(true); /* eslint-disable-next-line */ }, [count]);

  const copy = async (text, key, msg) => {
    try { await navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(key); say(msg); setTimeout(() => setCopied(""), 1500);
  };
  const share = async () => {
    const url = `${window.location.origin}/track/${ORDER.id.slice(1)}`;
    if (navigator.share) { try { await navigator.share({ title: `Order ${ORDER.id}`, url }); return; } catch (e) { return; } }
    copy(url, "share", "Live tracking link copied");
  };
  const invoice = () => {
    const txt = [`Tap2Eat Invoice ${ORDER.id}`, `Token ${ORDER.token} • North Canteen (Counter 2)`, "",
      ...ORDER.items.map((i) => `${i.name} x${i.qty}  ${inr(i.price)}`), "",
      `Subtotal ${inr(subtotal)}`, `Coupon CAMPUSFEAST -${inr(ORDER.coupon)}`, `Student subsidy -${inr(ORDER.subsidy)}`,
      `Tax & fee ${inr(ORDER.tax)}`, `Total paid ${inr(total)} via Google Pay UPI`].join("\n");
    const url = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `invoice-${ORDER.id.slice(1)}.txt`; a.click(); URL.revokeObjectURL(url);
    say("Invoice downloaded");
  };
  const collect = () => { setStage(4); say("Handover confirmed — enjoy your meal! 🎉"); };

  const stageState = (i) => (i < stage || done ? "done" : i === stage ? "active" : "todo");
  const stageTime = (i) => (i === 3 && ready ? "Ready now" : STAGES[i].time);
  const statusLabel = done ? "Completed" : ready ? "Ready for Pickup" : "In Kitchen • Preparing";

  /* ---------- shared blocks ---------- */
  const PinBox = ({ small }) => (
    <button onClick={() => copy(ORDER.pin, "pin", "Locker PIN copied")} className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 rounded-lg px-3 py-1.5 font-mono font-bold tracking-[0.3em] text-orange-800 text-lg">
      {ORDER.pin}{small && (copied === "pin" ? <Check size={15} /> : <Copy size={15} />)}
    </button>
  );
  const Steps = () => (
    <ol className="text-sm text-stone-700 space-y-2">
      {["Head over to North Canteen West Wing corridor.", "Scan the QR at Locker Bay #14 or show Token #B-42 at Counter 2.", "Collect freshly packed hot meal trays & seal-checked beverages."].map((s, i) => (
        <li key={i} className="flex gap-3"><span className="w-5 h-5 shrink-0 rounded-full bg-orange-100 text-orange-900 text-xs grid place-items-center font-semibold">{i + 1}</span>{s}</li>
      ))}
    </ol>
  );

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-40 lg:pb-0">
      {/* desktop header */}
      <header className="hidden lg:flex items-center gap-8 bg-white border-b border-orange-100 px-8 py-2.5">
        <span className="font-bold text-2xl text-orange-800 flex items-center gap-2"><UtensilsCrossed size={22} />Tap2Eat</span>
        <div className="flex items-center gap-2 w-64 border border-orange-100 rounded-full bg-orange-50 px-3 py-1.5 text-sm text-stone-400"><Search size={14} />Search meal, canteen stall…</div>
        <nav className="flex gap-8 text-sm ml-auto">
          {["Menu", "Orders", "Canteens"].map((n) => <a key={n} href="#" className={n === "Orders" ? "text-orange-800 font-semibold border-b-2 border-orange-800 pb-1" : ""}>{n}</a>)}
        </nav>
        <div className="flex items-center gap-4">
          <Bell size={18} />
          <span className="flex items-center gap-2 border border-orange-200 rounded-full px-3 py-1.5 text-sm"><ShoppingBag size={14} />Cart (3)</span>
          <span className="flex items-center gap-2"><span className="w-9 h-9 rounded-full bg-orange-200 text-orange-900 grid place-items-center font-bold text-sm">AK</span><span className="text-xs leading-tight"><b className="block">Arjun Kumar</b>ID: CS-2022-84</span></span>
        </div>
      </header>

      {/* mobile header */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-orange-100 flex items-center gap-3 px-4 py-3">
        <button aria-label="Back"><ArrowLeft size={22} /></button>
        <div className="flex-1"><h1 className="font-bold leading-tight">Track Order</h1><p className="text-xs text-stone-500">Order {ORDER.id}</p></div>
        <button onClick={() => setModal("help")} aria-label="Help"><HelpCircle size={22} /></button>
        <button onClick={() => refresh()} aria-label="Refresh" className="text-orange-800"><RefreshCw size={20} className={spin ? "animate-spin" : ""} /></button>
      </header>

      <main className="mx-auto px-4 lg:px-6 py-4 lg:py-5 space-y-5">
        <p className="hidden lg:block text-xs text-stone-500">Home › Orders › Order {ORDER.id} › <span className="text-orange-800 font-medium">Live Tracking</span></p>

        {/* ===== order header ===== */}
        <section className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="hidden lg:block text-2xl font-bold">Order {ORDER.id}</h2>
                <button onClick={() => copy(ORDER.id, "id", "Order ID copied")} className="hidden lg:block text-stone-500" aria-label="Copy order id">{copied === "id" ? <Check size={16} /> : <Copy size={16} />}</button>
                <span className="flex items-center gap-2 bg-orange-800 lg:bg-orange-700 text-white font-bold rounded-full px-4 py-2 text-sm"><Ticket size={16} />TOKEN {ORDER.token}</span>
                <span className="lg:hidden flex items-center gap-1.5 text-sm border border-orange-100 rounded-lg px-3 py-1.5 bg-stone-50"><Store size={14} />North Canteen</span>
              </div>
              <p className="lg:hidden mt-3 font-semibold text-orange-800 flex items-center gap-2"><i className={`w-3 h-3 rounded-full ${done ? "bg-emerald-600" : "bg-orange-700"}`} />{statusLabel}</p>
              <p className="hidden lg:flex items-center gap-4 text-sm text-stone-600 mt-3"><span className="flex items-center gap-1.5"><Clock size={14} />Placed Today, {ORDER.placed}</span>•<span className="flex items-center gap-1.5"><Store size={14} />North Canteen (Counter 2)</span></p>
            </div>
            <div className="hidden lg:flex flex-wrap gap-2 justify-end max-w-xs">
              <button onClick={invoice} className="flex items-center gap-2 text-xs border border-stone-300 rounded-lg px-3 py-2 hover:bg-stone-50"><Download size={13} />Download Invoice</button>
              <button onClick={share} className="flex items-center gap-2 text-xs border border-stone-300 rounded-lg px-3 py-2 hover:bg-stone-50"><Share2 size={13} />Share Live Link</button>
              <button onClick={() => setModal("help")} className="flex items-center gap-2 text-xs bg-stone-200 rounded-lg px-3 py-2 hover:bg-stone-300"><Headset size={13} />Get Help / Support</button>
            </div>
          </div>

          {/* mobile ETA */}
          <div className="lg:hidden mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="flex justify-between items-center text-sm font-semibold"><span className="flex items-center gap-2"><Timer size={16} className="text-orange-700" />{ready ? "Your order is ready!" : `Estimated Ready in ~${mins} mins`}</span><span className="text-stone-600 font-normal">01:35 PM</span></div>
            <div className="h-2 bg-orange-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-orange-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} /></div>
            <p className="flex justify-between text-xs mt-2 text-stone-600"><span>Kitchen Queue: {ready ? "Done" : "Active"}</span><span className="text-orange-800 font-semibold">{pct}% Prepared</span></p>
          </div>
        </section>

        {/* ===== desktop stepper ===== */}
        <section className="hidden lg:block bg-white border border-orange-100 rounded-2xl px-8 py-8">
          <ol className="grid grid-cols-5 relative">
            {STAGES.map((s, i) => {
              const st = stageState(i); const { Icon } = s;
              return (
                <li key={s.t} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={`absolute top-6 right-1/2 w-full h-0.5 -z-0 ${i <= stage || done ? "bg-orange-800" : "bg-stone-300"}`} />}
                  <span className={`relative z-10 w-12 h-12 rounded-full grid place-items-center border-2 ${st === "done" ? "bg-orange-800 border-orange-800 text-white" : st === "active" ? "bg-orange-600 border-orange-200 text-white ring-4 ring-orange-100" : "bg-stone-100 border-stone-300 text-stone-400"}`}><Icon size={20} /></span>
                  <p className={`mt-3 font-semibold text-sm ${st === "active" ? "text-orange-800" : st === "todo" ? "text-stone-500" : ""}`}>{s.t}{st === "active" && <i className="inline-block w-2 h-2 bg-orange-600 rounded-full ml-1.5 animate-pulse" />}</p>
                  <p className="text-xs text-stone-500 mt-1">{st === "done" ? "Completed • " : st === "active" ? "Active • " : ""}{stageTime(i)}</p>
                  <p className="text-[11px] text-orange-800/80 mt-1">{s.sub}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ===== desktop ETA strip ===== */}
        <section className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center gap-8 bg-orange-100/70 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-xl bg-orange-600 text-white grid place-items-center"><Timer size={26} /></span>
            <div><p className="text-2xl font-bold text-orange-800">{ready ? "Ready now" : `~${Math.max(mins, 1)}-${mins + 2} mins`} <span className="text-[11px] align-middle bg-white border border-orange-200 rounded px-2 py-0.5 font-medium">Fast Track</span></p><p className="text-sm text-stone-600">Estimated Pickup at 1:35 PM</p></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2"><span className="flex items-center gap-1.5"><Flame size={13} className="text-orange-700" />Live Kitchen Progress</span><b className="text-orange-800">{pct}% Complete</b></div>
            <div className="h-2.5 bg-white rounded-full overflow-hidden"><div className="h-full bg-orange-700 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} /></div>
            <p className="text-xs text-stone-600 mt-2">{done ? "Order collected. Thank you!" : ready ? "Chef has packed your order — head to pickup." : "Chef is preparing your Crispy Masala Dosa on tawa"}</p>
          </div>
          <div className="bg-white border border-orange-100 rounded-xl p-4 flex items-center gap-3 min-w-64">
            <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-800 grid place-items-center"><ChefHat size={18} /></span>
            <div className="text-xs"><p className="font-semibold text-sm">Queue Position: #{queue} <span className="text-emerald-700 font-medium">• {queue <= 2 ? "Low Traffic" : "Moderate"}</span></p><p className="text-stone-600">Master Tawa Chef Ramesh on station</p></div>
          </div>
        </section>

        {/* ===== mobile timeline ===== */}
        <section className="lg:hidden bg-white border border-orange-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">Live Kitchen Timeline</h3><span className="text-xs border border-orange-200 text-orange-800 bg-orange-50 rounded-full px-3 py-1 flex items-center gap-1"><RefreshCw size={11} />Live Sync</span></div>
          <ol>
            {STAGES.map((s, i) => {
              const st = stageState(i); const { Icon } = s;
              return (
                <li key={s.t} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${st === "done" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : st === "active" ? "bg-orange-700 text-white ring-4 ring-orange-100" : "bg-stone-100 text-stone-400"}`}>{st === "done" ? <Check size={18} /> : <Icon size={18} />}</span>
                    {i < STAGES.length - 1 && <span className={`w-0.5 flex-1 my-1 min-h-6 ${st === "done" ? "bg-emerald-300" : "bg-stone-200"}`} />}
                  </div>
                  <div className={`flex-1 pb-4 ${st === "active" ? "bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1 mb-3" : ""}`}>
                    <div className="flex justify-between gap-2 items-center"><p className={`font-semibold ${st === "todo" ? "text-stone-400" : st === "active" ? "text-orange-800" : ""}`}>{s.t}{st === "active" && <span className="ml-2 text-[10px] bg-orange-200 text-orange-900 rounded px-1.5 py-0.5 align-middle">ACTIVE</span>}</p><span className="text-xs text-stone-500 whitespace-nowrap">{stageTime(i).replace("Est. ", i === 3 ? "Est. " : "")}</span></div>
                    <p className={`text-sm ${st === "todo" ? "text-stone-400" : "text-stone-600"}`}>{s.m}</p>
                    {st === "active" && i === 2 && <p className="mt-2 text-xs bg-orange-100/70 rounded-lg p-2 text-stone-700">{queue} order{queue > 1 ? "s" : ""} ahead in queue • Freshly sizzling on tawa</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ===== mobile pickup pass ===== */}
        <section className="lg:hidden bg-white border border-orange-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold flex items-center gap-2"><Lock size={16} className="text-orange-800" />Express Pickup Pass</h3><span className="text-xs bg-emerald-50 text-emerald-700 rounded-lg px-3 py-1 font-medium">Fast Counter</span></div>
          <div className="flex gap-4 border border-orange-100 rounded-xl p-3">
            <div className="text-center"><Qr cell="w-2.5 h-2.5" /><p className="text-[10px] tracking-widest text-stone-500 mt-1">SCAN AT BAY</p></div>
            <div className="flex-1 text-sm"><p className="text-xs text-stone-500">Designated Location:</p><p className="font-semibold text-lg leading-tight">Counter 2 • Smart Locker #14</p>
              <div className="mt-2 border border-orange-200 bg-orange-50 rounded-lg p-2"><p className="text-[11px] text-stone-600">Locker Unlock PIN</p><PinBox small /></div></div>
          </div>
          <p className="text-xs text-stone-600 mt-3">Tap QR on reader at Locker #14 or show token <b>{ORDER.token}</b> to attendant.</p>
        </section>

        {/* ===== items + billing / station ===== */}
        <div className="lg:grid lg:grid-cols-[1.45fr_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
          <div className="space-y-5 min-w-0">
            <section className="bg-white border border-orange-100 rounded-2xl p-4 lg:p-6">
              <div className="flex items-center justify-between pb-3 lg:border-b lg:border-orange-100">
                <h3 className="font-bold text-lg flex items-center gap-2"><UtensilsCrossed size={18} className="hidden lg:block text-orange-800" /><span className="lg:hidden">Order Summary (3 items)</span><span className="hidden lg:inline">Items in Order (3)</span></h3>
                <span className="text-xs bg-stone-100 text-stone-600 rounded-lg px-3 py-1"><span className="hidden lg:inline">Kitchen Token: B-42</span><span className="lg:hidden">Receipt #89241</span></span>
              </div>
              <ul className="divide-y divide-orange-100">
                {ORDER.items.map((i) => (
                  <li key={i.id} className="flex gap-3 py-4">
                    <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-orange-100 grid place-items-center text-3xl shrink-0">{i.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3"><p className="font-semibold flex items-center gap-2 min-w-0"><span className="w-3.5 h-3.5 border border-green-600 grid place-items-center shrink-0"><i className="w-1.5 h-1.5 rounded-full bg-green-600" /></span><span className="truncate">{i.name}</span><span className="hidden lg:inline text-[11px] bg-stone-100 rounded px-1.5">x{i.qty}</span></p><b className="whitespace-nowrap">{inr(i.price)}</b></div>
                      <p className="hidden lg:block text-sm text-stone-600 mt-1">{i.opts}</p>
                      <p className="lg:hidden text-sm text-stone-600 mt-1">Qty: {i.qty} • {i.mOpts}</p>
                      <p className="hidden lg:flex items-center gap-2 mt-2 text-xs text-stone-600"><span className="border border-orange-200 bg-orange-50 rounded-full px-2 py-0.5">{done ? "Collected" : ready ? "Ready" : i.state}</span>• Station: {i.station}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {/* mobile totals */}
              <dl className="lg:hidden border-t border-orange-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600"><dt>Item Total & Taxes</dt><dd>{inr(subtotal)}</dd></div>
                <div className="flex justify-between text-emerald-700"><dt>Student Discount (TAP15)</dt><dd>-{inr(ORDER.coupon + ORDER.subsidy + 8.2 - ORDER.tax + ORDER.tax)}</dd></div>
                <div className="flex justify-between items-center border-t border-orange-100 pt-3"><dt className="font-bold flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-700" />Total Paid (UPI)</dt><dd className="text-2xl font-bold text-orange-800">{inr(total)}</dd></div>
                <p className="text-xs text-stone-500 text-right">Paid via Google Pay • {ORDER.placed}</p>
              </dl>
            </section>

            {/* desktop billing */}
            <section className="hidden lg:block bg-white border border-orange-100 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-orange-100"><h3 className="font-bold flex items-center gap-2"><ClipboardList size={17} className="text-orange-800" />Billing & Payment Breakdown</h3><span className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 flex items-center gap-1"><Check size={12} />Paid Online</span></div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Item Total (Subtotal)</dt><dd>{inr(subtotal)}</dd></div>
                <div className="flex justify-between text-emerald-700"><dt className="flex items-center gap-2"><Tag size={14} />Coupon Discount (CAMPUSFEAST)</dt><dd>-{inr(ORDER.coupon)}</dd></div>
                <div className="flex justify-between text-orange-800"><dt className="flex items-center gap-2"><GraduationCap size={15} />Student Meal Subsidy (CS Dept)</dt><dd>-{inr(ORDER.subsidy)}</dd></div>
                <div className="flex justify-between"><dt>Convenience & Kitchen Tax (5% GST)</dt><dd>{inr(ORDER.tax)}</dd></div>
              </dl>
              <div className="flex justify-between items-end border-t border-stone-300 mt-4 pt-4"><div><p className="font-semibold">Total Paid</p><p className="text-xs text-stone-500">Inclusive of all institutional campus taxes</p></div><p className="text-3xl font-bold text-orange-800">{inr(total)}</p></div>
              <div className="mt-4 rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm flex justify-between"><span>Google Pay UPI (Txn: UPI/48920199201)</span><span className="font-mono text-xs text-stone-500">01:21:44 PM</span></div>
            </section>
          </div>

          {/* desktop station panel */}
          <aside className="hidden lg:block bg-white border border-orange-100 rounded-2xl p-6">
            <div className="flex items-start justify-between"><div><p className="text-[11px] tracking-wide text-orange-800 font-semibold">DESIGNATED STATION</p><h3 className="text-2xl font-bold mt-1">North Canteen</h3><p className="text-sm text-stone-600">Ground Floor Central Dining Hall, West Wing</p></div><span className="w-11 h-11 rounded-xl bg-orange-100 text-orange-800 grid place-items-center"><MapPin size={20} /></span></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3"><p className="text-[10px] tracking-wide text-stone-600">EXPRESS COUNTER</p><p className="font-bold text-orange-800 text-lg">Counter #2</p><p className="text-[11px] text-stone-500">Show live token on tap</p></div>
              <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3"><p className="text-[10px] tracking-wide text-stone-600">HEATED SMART LOCKER</p><p className="font-bold text-orange-800 text-lg">Bay #14</p><p className="text-[11px] text-orange-800">Auto-warming active</p></div>
            </div>
            <div className="mt-4 rounded-xl bg-stone-100 border border-stone-200 p-4">
              <div className="flex justify-between items-center mb-3"><p className="text-sm font-medium flex items-center gap-2"><QrCode size={15} className="text-orange-800" />Contact-Free Locker Unlock Pass</p><span className="text-[11px] bg-orange-800 text-white rounded px-2 py-1 font-bold">TOKEN {ORDER.token}</span></div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <Qr cell="w-4 h-4" /><p className="text-[10px] tracking-[0.25em] text-stone-500 mt-2">SCAN AT BAY #14</p>
                <p className="mt-3 text-xs text-stone-600 flex items-center justify-center gap-2">Direct Keypad PIN: <PinBox small /></p>
              </div>
              <p className="text-[11px] text-center text-stone-600 mt-3">Hold screen to the locker scanner camera or counter handheld tablet</p>
            </div>
            <p className="text-[11px] tracking-wide font-semibold mt-5 mb-3">PICKUP INSTRUCTIONS</p>
            <Steps />
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-orange-100"><div className="flex items-center gap-3 text-xs"><Phone size={16} className="text-stone-500" /><div><p>Counter Intercom</p><p className="font-mono text-stone-600">Ext. 4402 (Active)</p></div></div>
              <a href="tel:+918049123000" className="text-xs border border-orange-200 text-orange-800 rounded-lg px-4 py-2 hover:bg-orange-50">Call Counter Chef</a></div>
          </aside>
        </div>

        {/* ===== mobile desk card ===== */}
        <section className="lg:hidden rounded-2xl border border-orange-100 bg-orange-50 p-4 flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-orange-100 text-orange-800 grid place-items-center"><Headset size={20} /></span>
          <div className="flex-1"><p className="font-semibold">North Canteen Desk</p><p className="text-xs text-stone-600">Counter Attendant: Rajesh K.</p></div>
          <a href="tel:+918049123000" className="flex items-center gap-2 text-sm border border-orange-300 text-orange-800 rounded-lg px-4 py-2 bg-white"><Phone size={14} />Call</a>
        </section>

        {/* ===== desktop action bar ===== */}
        <section className="hidden lg:flex items-center justify-between bg-white border border-orange-100 rounded-2xl px-6 py-4">
          <button className="flex items-center gap-2 text-sm hover:text-orange-800"><ArrowLeft size={16} />Back to My Orders</button>
          <p className="text-sm text-orange-800 flex items-center gap-2"><UtensilsCrossed size={14} />Need dietary adjustment? <button onClick={() => setModal("help")} className="underline">Contact kitchen staff directly</button></p>
          {ready && !done ? (
            <button onClick={collect} className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg px-6 py-3 text-sm"><CheckCircle2 size={16} />I've Collected My Order</button>
          ) : (
            <button onClick={() => refresh()} disabled={done} className="flex items-center gap-2 bg-orange-800 hover:bg-orange-900 disabled:bg-stone-300 text-white font-semibold rounded-lg px-6 py-3 text-sm"><RefreshCw size={15} className={spin ? "animate-spin" : ""} />{done ? "Order Completed" : `Refresh Status (Auto in ${Math.max(count, 0)}s)`}</button>
          )}
        </section>
      </main>

      {/* desktop footer */}
      <footer className="hidden lg:block bg-white border-t border-orange-100 mt-8">
        <div className="mx-auto px-6 py-10 grid grid-cols-4 gap-8 text-sm text-stone-600">
          <div><p className="font-bold text-xl text-orange-800 flex items-center gap-2 mb-2"><UtensilsCrossed size={18} />Tap2Eat</p>High-velocity campus dining & smart kitchen orchestration platform. Nourishing student life with zero queue waiting times.</div>
          <div><p className="font-semibold text-stone-800 mb-2">Campus Dining Bays</p>{["North Canteen (Central Hall)", "South Tech Hub Bistro", "Night Owl Snacks (Hostel Block 4)", "Green Lawn Organic Cafe"].map((l) => <p key={l} className="py-0.5">{l}</p>)}</div>
          <div><p className="font-semibold text-stone-800 mb-2">Operating Hours</p>{[["Breakfast", "07:30 AM - 10:30 AM"], ["Lunch", "12:00 PM - 03:30 PM"], ["Evening Snacks", "04:30 PM - 07:00 PM"], ["Dinner", "07:30 PM - 10:45 PM"]].map(([a, b]) => <p key={a} className="flex justify-between py-0.5"><span>{a}:</span><span>{b}</span></p>)}</div>
          <div><p className="font-semibold text-stone-800 mb-2">Student Dining Help</p><p className="text-xs">Have dietary restrictions or refund queries?</p><p className="flex items-center gap-2 text-xs mt-2 text-orange-800"><Mail size={13} />dining-support@campus.tap2eat.in</p><p className="flex items-center gap-2 text-xs mt-1 text-orange-800"><Phone size={13} />Campus Hotline: +91 80 4912 3000</p></div>
        </div>
        <div className="mx-auto px-6 py-4 border-t border-orange-100 flex justify-between text-xs text-stone-500"><span>© 2025 Tap2Eat Food Technologies Inc. All rights reserved. Campus Dining Operations Division.</span><span className="flex gap-6"><a href="#">Nutritional Standards</a><a href="#">Privacy Policy</a><a href="#">FSSAI Compliance</a></span></div>
      </footer>

      {/* mobile sticky action + nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-orange-50 border-t border-orange-100">
        <div className="flex gap-3 px-4 pt-3">
          {ready && !done ? (
            <button onClick={collect} className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 text-white font-semibold rounded-xl py-3.5"><CheckCircle2 size={18} />I've Collected My Order</button>
          ) : (
            <button onClick={() => setModal("qr")} className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl py-3.5"><QrCode size={18} />Show Pickup QR / Token</button>
          )}
          <button onClick={() => setModal("actions")} aria-label="More actions" className="w-14 rounded-xl bg-stone-200 grid place-items-center"><ListOrdered size={20} /></button>
        </div>
        <nav className="flex justify-around pt-2 pb-2 text-[11px] bg-white mt-3 border-t border-orange-100">
          {[[Compass, "Explore"], [Package, "Orders", 1], [ShoppingBag, "Cart"], [User, "Profile"]].map(([I, l, b]) => (
            <button key={l} className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 ${l === "Orders" ? "bg-orange-700 text-white rounded-2xl" : "text-stone-700"}`}><I size={19} />{l}{b && <i className="absolute -top-1 right-2 bg-white text-orange-800 border border-orange-300 text-[10px] w-4 h-4 rounded-full grid place-items-center not-italic font-bold">{b}</i>}</button>
          ))}
        </nav>
      </div>

      {/* ===== modals ===== */}
      {modal === "qr" && (
        <Modal title={`Pickup Pass • Token ${ORDER.token}`} onClose={() => setModal(null)}>
          <div className="text-center"><Qr cell="w-5 h-5" /><p className="text-xs tracking-[0.25em] text-stone-500 mt-2">SCAN AT LOCKER BAY #14</p>
            <p className="text-sm mt-4 flex items-center justify-center gap-2">Keypad PIN <PinBox small /></p>
            <p className="text-xs text-stone-500 mt-3">Or show token <b>{ORDER.token}</b> at Counter 2.</p></div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal title="Help & Support" onClose={() => setModal(null)}>
          <p className="text-sm text-stone-600 mb-4">Need a dietary adjustment or having trouble with Token {ORDER.token}? Reach the North Canteen desk.</p>
          <a href="tel:+918049123000" className="block text-center bg-orange-800 text-white rounded-lg py-3 font-semibold mb-2">Call Counter Chef (Ext. 4402)</a>
          <a href="mailto:dining-support@campus.tap2eat.in" className="block text-center border border-orange-200 rounded-lg py-3 text-sm">Email dining-support@campus.tap2eat.in</a>
        </Modal>
      )}
      {modal === "actions" && (
        <Modal title="More actions" onClose={() => setModal(null)}>
          {[[Download, "Download Invoice", () => { invoice(); setModal(null); }], [Share2, "Share Live Link", () => { share(); setModal(null); }], [Copy, "Copy Order ID", () => { copy(ORDER.id, "id", "Order ID copied"); setModal(null); }], [Headset, "Get Help / Support", () => setModal("help")]].map(([I, l, fn]) => (
            <button key={l} onClick={fn} className="w-full flex items-center gap-3 py-3 border-t first:border-0 border-orange-100 text-left"><I size={18} className="text-orange-800" />{l}</button>
          ))}
        </Modal>
      )}

      {toast && <div role="status" className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-44 lg:bottom-8 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg max-w-[90vw] text-center">{toast}</div>}
    </div>
  );
}