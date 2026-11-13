import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api.js";

import {
  Check,
  Copy,
  CalendarDays,
  Lock,
  HelpCircle,
  MapPin,
  Download,
  ArrowLeft,
  ArrowRight,
  Target,
  Headset,
  Receipt,
  UtensilsCrossed,
  X,
  ChefHat,
  Send,
  Store,
  Info,
} from "lucide-react";

const inr = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const STAGES = [
  "Order placed",
  "Kitchen accepted",
  "Preparing",
  "Packed",
  "Ready for pickup",
];

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [tracking, setTracking] = useState(false);
  const [help, setHelp] = useState(false);

  const toastTimer = useRef(null);
  const copyTimer = useRef(null);

  // Fetch order details from backend.
  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      const orderId = id || location.state?.order?._id;

      if (!orderId) {
        if (active) {
          setError(
            "Order details are unavailable. Please open your order history."
          );
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/getOrder/${orderId}`);

        const fetchedOrder = response.data?.data;

        if (!fetchedOrder) {
          throw new Error("Order details were not found.");
        }

        if (active) {
          setOrder(fetchedOrder);
        }
      } catch (err) {
        console.error("Fetch order error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id, location.state]);

  // Clear timers when component unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      clearTimeout(copyTimer.current);
    };
  }, []);

  const say = (message) => {
    setToast(message);

    clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToast("");
    }, 2200);
  };

  // Convert backend response into UI-friendly data.
  const ORDER = useMemo(() => {
    if (!order) return null;

    const orderItems = (order.items || []).map((item, index) => {
      const food =
        typeof item.food === "object" && item.food !== null
          ? item.food
          : {};

      return {
        id: item._id || food._id || index,
        name: food.name || "Food item",
        qty: Number(item.quantity || 1),
        unit: Number(item.price || 0),
      };
    });

    const createdDate = order.createdAt
      ? new Date(order.createdAt)
      : null;

    return {
      ref: order.orderNumber || order._id,
      student: order.user?.name || "Customer",

      placedAt:
        createdDate && !Number.isNaN(createdDate.getTime())
          ? createdDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Not available",

      date:
        createdDate && !Number.isNaN(createdDate.getTime())
          ? createdDate.toLocaleDateString("en-IN")
          : "Not available",

      counter: order.deliveryAddress || "Pickup location not provided",

      items: orderItems,

      total: Number(order.totalAmount || 0),

      status: order.status || "Pending",

      paymentStatus: order.paymentStatus || "Pending",
    };
  }, [order]);

  const subtotal = useMemo(() => {
    return (
      ORDER?.items.reduce(
        (sum, item) => sum + item.unit * item.qty,
        0
      ) || 0
    );
  }, [ORDER]);

  const total = ORDER?.total ?? 0;

  // Map actual backend status to the progress indicator.
  const stage = useMemo(() => {
    switch (ORDER?.status) {
      case "Preparing":
        return 2;

      case "Ready":
      case "Completed":
        return 4;

      default:
        return 0;
    }
  }, [ORDER]);

  // Copy order reference.
  const copyRef = async () => {
    if (!ORDER?.ref) return;

    try {
      await navigator.clipboard.writeText(String(ORDER.ref));

      setCopied(true);
      say("Order reference copied");

      clearTimeout(copyTimer.current);

      copyTimer.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      say("Unable to copy order reference");
    }
  };

  // Generate receipt content.
  const receiptText = () => {
    return [
      "================================",
      "          TAP2EAT RECEIPT",
      "================================",
      "",
      `Order Reference: ${ORDER.ref}`,
      `Customer: ${ORDER.student}`,
      `Date: ${ORDER.date}`,
      `Time: ${ORDER.placedAt}`,
      `Order Status: ${ORDER.status}`,
      `Payment Status: ${ORDER.paymentStatus}`,
      "",
      "--------------------------------",
      "ORDER ITEMS",
      "--------------------------------",
      ...ORDER.items.map(
        (item) =>
          `${item.name} x ${item.qty} = ${inr(item.unit * item.qty)}`
      ),
      "",
      "--------------------------------",
      `Subtotal: ${inr(subtotal)}`,
      `Total Amount: ${inr(total)}`,
      "--------------------------------",
      "",
      `Delivery / Pickup Address: ${ORDER.counter}`,
      "",
      "Thank you for ordering with Tap2Eat!",
    ].join("\n");
  };

  // Download receipt as text file.
  const downloadReceipt = () => {
    const blob = new Blob([receiptText()], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Tap2Eat-Receipt-${ORDER.ref}.txt`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    say("Receipt downloaded");
  };

  // Browser print dialog allows saving as PDF.
  const printPdf = () => {
    window.print();
  };

  const goHome = () => {
    navigate("/dashboard");
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/60">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="font-semibold text-orange-800">
            Loading your order details...
          </p>
        </div>
      </div>
    );
  }

  // Error screen.
  if (error || !ORDER) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/60 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-7 text-center border border-orange-100">
          <X size={36} className="mx-auto text-red-500" />

          <h1 className="mt-4 text-xl font-bold">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            {error || "Order details could not be found."}
          </p>

          <button
            onClick={() => navigate("/orders")}
            className="mt-5 w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
          >
            View My Orders
          </button>

          <button
            onClick={goHome}
            className="mt-3 w-full rounded-xl border border-orange-200 py-3 font-semibold text-stone-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 flex flex-col">
      {/* Header */}
      <header className="bg-orange-50 border-b border-orange-100 px-4 lg:px-9 py-3 flex items-center gap-3">
        <span className="font-bold text-2xl text-orange-800 flex items-center gap-2">
          <UtensilsCrossed size={20} />
          Tap2Eat
        </span>

        <span className="text-xs bg-orange-100 text-orange-900 rounded-full px-3 py-0.5">
          <span className="lg:hidden">Campus POS</span>
          <span className="hidden lg:inline">Campus Express</span>
        </span>

        <div className="ml-auto flex items-center gap-4">
          <span className="hidden lg:flex items-center gap-2 text-xs border border-orange-200 rounded-lg px-3 py-2 bg-white">
            <Lock size={13} />
            Secure Session
          </span>

          <button
            onClick={() => setHelp(true)}
            className="flex items-center gap-1 text-orange-800 text-sm font-medium"
            aria-label="Help"
          >
            <HelpCircle size={20} />
            <span className="hidden lg:inline">Help</span>
          </button>

          <button
            onClick={goHome}
            className="lg:hidden"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-0 py-5 lg:py-12">
        <div className="lg:rounded-2xl lg:border lg:border-orange-100 lg:bg-white overflow-hidden">
          {/* Hero */}
          <section className="text-center lg:px-10 lg:pt-10 lg:pb-8">
            <div className="mx-auto w-20 h-20 lg:w-24 lg:h-24 rounded-full grid place-items-center bg-emerald-100 lg:bg-orange-100 mb-4">
              <span className="w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-full grid place-items-center bg-emerald-500 lg:bg-orange-600 text-white shadow-lg">
                <Check size={30} strokeWidth={3} />
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold">
              {ORDER.status === "Cancelled"
                ? "Order Cancelled"
                : "Order Placed Successfully!"}
            </h1>

            <p className="text-stone-600 mt-2 max-w-lg mx-auto">
              Thank you,{" "}
              <b className="text-stone-900">{ORDER.student}</b>!

              <span className="block mt-1">
                Your current order status is{" "}
                <b className="text-orange-800">{ORDER.status}</b>.
              </span>
            </p>

            <div className="hidden lg:inline-flex items-center gap-3 mt-6 border border-orange-200 bg-orange-50 rounded-full px-5 py-2 text-xs">
              <i className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span>{ORDER.status}</span>
              <span className="border-l border-orange-200 pl-3">
                Order Reference: {ORDER.ref}
              </span>
            </div>
          </section>

          {/* Mobile Order Card */}
          <section className="lg:hidden mt-5 bg-white border border-orange-200 rounded-2xl p-4">
            <p className="text-xs tracking-wide text-stone-600">
              ORDER REFERENCE
            </p>

            <div className="flex justify-between items-start gap-2">
              <p className="text-2xl font-bold text-orange-800 leading-tight break-all">
                {ORDER.ref}
              </p>

              <button
                onClick={copyRef}
                className="flex items-center gap-1 bg-orange-50 rounded-full px-3 py-2 text-stone-700 text-xs shrink-0"
              >
                {copied ? (
                  <Check size={13} />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className="mt-2 text-xs text-stone-500">
              {ORDER.date} • {ORDER.placedAt}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 border-t border-orange-100 pt-3">
              <div className="border border-orange-100 rounded-lg bg-orange-50/50 p-3 text-xs text-stone-600">
                Order Status

                <p className="text-sm font-semibold text-stone-900 mt-2">
                  {ORDER.status}
                </p>
              </div>

              <div className="border border-orange-100 rounded-lg bg-orange-50/50 p-3 text-xs text-stone-600">
                Payment Status

                <p className="text-sm font-semibold text-stone-900 mt-2">
                  {ORDER.paymentStatus}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-lg bg-orange-50 border border-orange-100 p-3">
              <span className="w-10 h-10 rounded-full bg-white grid place-items-center text-orange-800">
                <Store size={18} />
              </span>

              <div className="min-w-0">
                <p className="text-xs text-stone-600">
                  Delivery / Pickup Address
                </p>

                <p className="font-semibold break-words">
                  {ORDER.counter}
                </p>
              </div>
            </div>
          </section>

          {/* Desktop Order Information */}
          <section className="hidden lg:grid grid-cols-3 border-y border-orange-100 bg-orange-50/60 text-sm">
            <div className="p-5 border-r border-orange-100">
              <p className="flex justify-between text-xs tracking-wide text-stone-600">
                ORDER REFERENCE

                <button
                  onClick={copyRef}
                  aria-label="Copy reference"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-700" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </p>

              <p className="font-bold mt-3 break-all">
                {ORDER.ref}
              </p>

              <p className="text-xs text-stone-500 mt-2">
                Order details
              </p>
            </div>

            <div className="p-5 border-r border-orange-100">
              <p className="text-xs tracking-wide text-stone-600">
                ORDER STATUS
              </p>

              <p className="font-bold text-lg mt-3">
                {ORDER.status}
              </p>

              <p className="text-xs text-orange-800 mt-2">
                Current backend status
              </p>
            </div>

            <div className="p-5">
              <p className="flex justify-between text-xs tracking-wide text-stone-600">
                TIMESTAMP
                <CalendarDays size={14} />
              </p>

              <p className="font-bold text-lg mt-3">
                {ORDER.placedAt}
              </p>

              <p className="text-xs text-stone-500 mt-1">
                {ORDER.date}
              </p>
            </div>
          </section>

          {/* Order Body */}
          <div className="mt-4 lg:mt-0 lg:grid lg:grid-cols-[1.45fr_1fr]">
            {/* Items */}
            <section className="bg-white lg:bg-transparent border border-orange-200 lg:border-0 rounded-2xl lg:rounded-none p-4 lg:p-8 lg:border-r lg:border-orange-100">
              <div className="flex items-center justify-between mb-3 lg:mb-5">
                <h2 className="font-semibold lg:text-base flex items-center gap-2">
                  <Receipt
                    size={16}
                    className="hidden lg:block text-orange-800"
                  />

                  <span>
                    Ordered Items ({ORDER.items.length})
                  </span>
                </h2>

                <span className="text-xs bg-stone-100 text-stone-600 rounded-full px-3 py-1">
                  Tap2Eat Order
                </span>
              </div>

              {ORDER.items.length === 0 ? (
                <p className="text-sm text-stone-500 py-4">
                  No order items were found.
                </p>
              ) : (
                <ul className="divide-y divide-orange-100 lg:divide-y-0 lg:space-y-3">
                  {ORDER.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 py-3 lg:p-3 lg:border lg:border-orange-200 lg:rounded-xl first:pt-0 lg:first:pt-3"
                    >
                      <span className="w-16 h-16 lg:w-[68px] lg:h-[68px] shrink-0 rounded-lg bg-orange-100 grid place-items-center text-3xl">
                        🍽️
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-semibold truncate">
                            {item.name}
                          </h3>

                          <span className="font-semibold whitespace-nowrap">
                            {inr(item.unit * item.qty)}
                          </span>
                        </div>

                        <p className="text-sm text-stone-600 mt-1">
                          Quantity: {item.qty}
                        </p>

                        <p className="hidden lg:block text-xs text-stone-500 mt-1">
                          {inr(item.unit)} each
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pickup Address */}
              <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/70 p-4 flex gap-3">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-white grid place-items-center text-orange-800">
                  <MapPin size={18} />
                </span>

                <div className="text-sm min-w-0">
                  <p className="text-xs tracking-wide text-stone-600">
                    DELIVERY / PICKUP ADDRESS
                  </p>

                  <p className="font-semibold text-base break-words">
                    {ORDER.counter}
                  </p>
                </div>
              </div>

              {/* Mobile Bill */}
              <dl className="lg:hidden border-t border-orange-100 mt-4 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <dt>Item Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>

                <div className="flex justify-between items-end border-t border-dashed border-stone-300 pt-3">
                  <div>
                    <p className="font-bold text-base">
                      Total Amount
                    </p>

                    <p className="text-xs text-stone-500">
                      Payment: {ORDER.paymentStatus}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-orange-800">
                    {inr(total)}
                  </p>
                </div>
              </dl>
            </section>

            {/* Desktop Payment Summary */}
            <section className="hidden lg:flex flex-col p-8">
              <h2 className="font-semibold flex items-center gap-2 mb-5">
                <Receipt size={16} className="text-orange-800" />
                Payment Summary
              </h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Cart Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>

                <div className="flex justify-between border-t border-stone-200 pt-3 font-bold">
                  <dt>Total Amount</dt>
                  <dd className="text-orange-800">
                    {inr(total)}
                  </dd>
                </div>
              </dl>

              <div className="flex justify-between items-end border-t border-stone-300 mt-4 pt-4">
                <div>
                  <p className="font-semibold">Total Amount</p>

                  <p className="text-xs text-stone-500 mt-1">
                    Payment: {ORDER.paymentStatus}
                  </p>
                </div>

                <p className="text-3xl font-bold text-orange-800">
                  {inr(total)}
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-orange-200 p-4 text-sm">
                <p className="text-xs tracking-wide text-stone-600">
                  PAYMENT STATUS
                </p>

                <p className="mt-2 font-semibold">
                  {ORDER.paymentStatus}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  Payment method details will appear when payment integration is available.
                </p>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={printPdf}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium border border-stone-200 rounded-lg py-3 hover:bg-stone-50"
                >
                  <Download size={14} />
                  Print / Save PDF
                </button>
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="mt-5 lg:mt-0 space-y-3 lg:space-y-0 lg:flex lg:flex-row-reverse lg:justify-between lg:items-center lg:bg-orange-50/60 lg:border-t lg:border-orange-100 lg:px-6 lg:py-5">
            <button
              onClick={() => setTracking(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3.5 lg:px-8 shadow"
            >
              <Send size={17} className="lg:hidden" />
              <Target size={17} className="hidden lg:block" />
              Track My Order
              <ArrowRight size={16} className="hidden lg:block" />
            </button>

            <button
              onClick={goHome}
              className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white py-3.5 lg:px-6 font-medium text-orange-900 lg:text-stone-800"
            >
              <UtensilsCrossed
                size={17}
                className="lg:hidden text-orange-800"
              />
              <ArrowLeft size={16} className="hidden lg:block" />
              Back to Home
            </button>

            <button
              onClick={downloadReceipt}
              className="lg:hidden mx-auto flex items-center gap-2 text-sm underline text-stone-700 pt-1"
            >
              <Receipt size={16} />
              Download Receipt (.txt)
            </button>
          </div>
        </div>

        {/* Help Strip */}
        <div className="mt-5 lg:mt-6 rounded-xl border border-orange-100 bg-stone-100/70 px-4 py-3 text-xs lg:text-sm flex items-center gap-3 text-stone-700">
          <Headset
            size={22}
            className="hidden lg:block text-orange-800 shrink-0"
          />

          <p className="flex-1 text-center lg:text-left">
            <b className="block text-sm text-stone-900">
              Need help with your order?
            </b>

            <span>
              Please contact your canteen directly for order changes or dietary alerts.
            </span>
          </p>

          <button
            onClick={() => setHelp(true)}
            className="hidden lg:flex items-center gap-1 text-orange-800 font-medium whitespace-nowrap"
          >
            Help Desk
            <ArrowRight size={14} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden lg:flex items-center gap-4 bg-stone-100 border-t border-orange-100 px-9 py-6 text-sm text-stone-600">
        <b className="text-stone-900">Tap2Eat</b>

        <span>•</span>

        <span>
          © 2026 Tap2Eat. All rights reserved.
        </span>

        <nav className="ml-auto flex gap-6">
          {[
            "Security & Privacy",
            "Terms of Service",
            "Canteen Standards",
            "Support Desk",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-orange-800"
            >
              {item}
            </a>
          ))}
        </nav>
      </footer>

      {/* Tracking Modal */}
      {tracking && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setTracking(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5"
          >
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-bold text-lg">
                Order Tracking
              </h2>

              <button
                onClick={() => setTracking(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-stone-500 mb-4">
              Order {ORDER.ref}
            </p>

            {ORDER.status === "Cancelled" ? (
              <p className="text-sm bg-red-50 text-red-700 rounded-lg p-3">
                This order has been cancelled.
              </p>
            ) : (
              <ol className="space-y-3">
                {STAGES.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`w-7 h-7 rounded-full grid place-items-center text-xs ${
                        index < stage
                          ? "bg-emerald-600 text-white"
                          : index === stage
                            ? "bg-orange-600 text-white animate-pulse"
                            : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {index < stage ? (
                        <Check size={14} />
                      ) : index === 2 ? (
                        <ChefHat size={14} />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <span
                      className={
                        index <= stage
                          ? "font-medium"
                          : "text-stone-400"
                      }
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <p className="mt-4 text-sm bg-orange-50 rounded-lg p-3">
              {ORDER.status === "Ready"
                ? "Your order is ready for pickup!"
                : ORDER.status === "Completed"
                  ? "Your order has been completed."
                  : ORDER.status === "Cancelled"
                    ? "This order has been cancelled."
                    : `Your current order status is ${ORDER.status}.`}
            </p>

            <p className="mt-2 text-xs text-stone-500">
              Tracking reflects the latest status returned by the backend. Refresh the page to retrieve updated status.
            </p>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {help && (
        <div
          className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4"
          onClick={() => setHelp(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">
                Help Desk
              </h2>

              <button
                onClick={() => setHelp(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-stone-600 mb-4">
              For order changes, cancellations, or dietary alerts, please contact your canteen directly.
            </p>

            <button
              onClick={() => {
                setHelp(false);
                say("Please contact your canteen directly for assistance.");
              }}
              className="w-full text-center bg-orange-600 text-white rounded-lg py-3 font-semibold"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed z-50 left-1/2 -translate-x-1/2 bottom-6 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;