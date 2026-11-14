
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  Settings,
  Bell,
  ShoppingBag,
  Search,
  Home,
  Utensils,
  Heart,
  Receipt,
  User,
  MoreVertical,
  X,
  Package,
  Tag,
  CheckCircle2,
  MailCheck,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";

import api from "../../../services/api.js";

/* ---------- notification helpers ---------- */

const ICONS = {
  Orders: Package,
  Payments: Receipt,
  System: Bell,
  Offer: Tag,
};

const TONES = {
  Orders: "bg-violet-100 text-violet-700",
  Payments: "bg-emerald-100 text-emerald-700",
  System: "bg-sky-100 text-sky-700",
  Offer: "bg-amber-100 text-amber-700",
};

const getCategory = (type) => {
  if (type === "Offer") return "offers";
  if (type === "Orders" || type === "Payments") return "orders";
  return "system";
};

const getTime = (date) => {
  if (!date) return "";

  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) return "";

  const diff = Date.now() - notificationDate.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  if (days < 7) return `${days} days ago`;

  return notificationDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getGroup = (date) => {
  if (!date) return "Older";

  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) return "Older";

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(notificationDate, today)) return "Today";
  if (isSameDay(notificationDate, yesterday)) return "Yesterday";

  return "Older";
};

const formatNotification = (notification) => ({
  ...notification,
  id: notification._id,
  cat: getCategory(notification.type),
  group: getGroup(notification.createdAt),
  time: getTime(notification.createdAt),
  unread: !notification.isRead,
});

/* ---------- toast ---------- */

function Toast({ msg }) {
  if (!msg) return null;

  return (
    <div
      role="status"
      className="fixed z-50 left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg"
    >
      {msg}
    </div>
  );
}

/* ---------- switch ---------- */

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-orange-800" : "bg-stone-300"
        }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"
          }`}
      />
    </button>
  );
}

/* ---------- main component ---------- */

const Notifications = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [menuId, setMenuId] = useState(null);

  const [showSettings, setShowSettings] = useState(false);

  const [prefs, setPrefs] = useState({
    orders: true,
    offers: true,
    system: true,
  });

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const timer = useRef(null);

  /* ---------- toast message ---------- */

  const say = useCallback((message) => {
    setToast(message);

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setToast("");
    }, 2500);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  /* ---------- close more menu ---------- */

  useEffect(() => {
    const close = () => setMenuId(null);

    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  /* ---------- fetch notifications ---------- */

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notification/get");

      const notifications = response.data?.data;

      if (!Array.isArray(notifications)) {
        throw new Error("Invalid notifications response");
      }

      setItems(notifications.map(formatNotification));
    } catch (err) {
      console.error(
        "Fetching notifications failed:",
        err.response?.data || err
      );

      const message =
        err.response?.data?.message ||
        "Unable to load notifications. Please try again.";

      setError(message);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ---------- mark one notification as read ---------- */

  const markAsRead = async (id) => {
    const notification = items.find((n) => n.id === id);

    if (!notification || !notification.unread) return;

    try {
      await api.patch(`/notification/markAsRead/${id}`);

      setItems((previous) =>
        previous.map((n) =>
          n.id === id
            ? {
              ...n,
              unread: false,
              isRead: true,
            }
            : n
        )
      );
    } catch (err) {
      console.error(
        "Mark as read failed:",
        err.response?.data || err
      );

      say(
        err.response?.data?.message ||
        "Unable to mark notification as read."
      );
    }
  };

  /* ---------- mark all notifications as read ---------- */

  const markAll = async () => {
    const unreadNotifications = items.filter((n) => n.unread);

    if (unreadNotifications.length === 0) {
      return say("No unread notifications");
    }

    try {
      setMarkingAll(true);

      const results = await Promise.allSettled(
        unreadNotifications.map((n) =>
          api.patch(`/notification/markAsRead/${n.id}`)
        )
      );

      const successfulIds = new Set(
        unreadNotifications
          .filter(
            (_, index) => results[index].status === "fulfilled"
          )
          .map((n) => n.id)
      );

      setItems((previous) =>
        previous.map((n) =>
          successfulIds.has(n.id)
            ? {
              ...n,
              unread: false,
              isRead: true,
            }
            : n
        )
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failedCount > 0) {
        say(
          `${failedCount} notification(s) could not be marked as read.`
        );
      } else {
        say("All notifications marked as read");
      }
    } catch (err) {
      console.error("Mark all failed:", err);

      say("Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  /* ---------- delete notification ---------- */

  const remove = async (id) => {
    try {
      setDeletingId(id);

      await api.delete(`/notification/delete/${id}`);

      setItems((previous) =>
        previous.filter((n) => n.id !== id)
      );

      say("Notification dismissed");
    } catch (err) {
      console.error(
        "Deleting notification failed:",
        err.response?.data || err
      );

      say(
        err.response?.data?.message ||
        "Unable to dismiss notification."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- notification filtering ---------- */

  const visible = useMemo(() => {
    return items.filter((n) => {
      if (n.cat === "orders") return prefs.orders;
      if (n.cat === "offers") return prefs.offers;
      if (n.cat === "system") return prefs.system;

      return true;
    });
  }, [items, prefs]);

  const counts = {
    all: visible.length,

    unread: visible.filter((n) => n.unread).length,

    orders: visible.filter((n) => n.cat === "orders").length,

    offers: visible.filter((n) => n.cat === "offers").length,
  };

  const shown = visible.filter((n) => {
    if (tab === "all") return true;
    if (tab === "unread") return n.unread;

    return n.cat === tab;
  });

  const groups = ["Today", "Yesterday", "Older"]
    .map((group) => ({
      group,
      list: shown.filter((n) => n.group === group),
    }))
    .filter((item) => item.list.length > 0);

  const tabs = [
    ["all", "All"],
    ["unread", "Unread"],
    ["orders", "Orders"],
    ["offers", "Offers"],
  ];

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-24 lg:pb-0">

      {/* Desktop header */}

      <header className="hidden lg:flex items-center gap-8 bg-white border-b border-orange-100 px-8 py-3">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-800">
          <span className="w-9 h-9 rounded-lg bg-orange-800 text-white grid place-items-center">
            🍴
          </span>
          Tap2Eat
        </div>

        <nav className="flex gap-6 text-sm">
          {[
            "Home",
            "Menu",
            "Favourites",
            "My Orders",
            "Notifications",
            "Help",
          ].map((n) => (
            <button
              key={n}
              onClick={() => {
                const routes = {
                  Home: "/",
                  Menu: "/explore",
                  Favourites: "/favourites",
                  "My Orders": "/orders",
                };

                if (routes[n]) navigate(routes[n]);
              }}
              className={
                n === "Notifications"
                  ? "text-orange-800 font-semibold border-b-2 border-orange-800 pb-1"
                  : "hover:text-orange-800"
              }
            >
              {n}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm text-stone-400 w-64">
            <Search size={14} />
            Search tokens, dishes…
          </div>

          <span className="relative">
            <Bell size={19} />

            {counts.unread > 0 && (
              <i className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
            )}
          </span>

          <ShoppingBag size={19} />

          <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-900 grid place-items-center text-xs font-bold">
            <User size={16} />
          </span>
        </div>
      </header>

      {/* Mobile header */}

      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-orange-100 flex items-center gap-3 px-4 py-3">
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-xl font-bold">Notifications</h1>

        {counts.unread > 0 && (
          <span className="text-xs bg-orange-800 text-white rounded-full px-2 py-0.5 font-semibold">
            {counts.unread} New
          </span>
        )}

        <button
          onClick={markAll}
          disabled={markingAll || counts.unread === 0}
          className="ml-auto flex items-center gap-1 text-sm text-orange-800 disabled:opacity-50"
        >
          <CheckCheck size={16} />

          {markingAll ? "Marking..." : "Mark all read"}
        </button>
      </header>

      <main className="mx-auto px-4 lg:px-8 pt-4 lg:pt-6">

        {/* Desktop title */}

        <div className="hidden lg:flex items-end justify-between border-b border-orange-100 pb-4 mb-5">
          <div>
            <p className="text-xs text-stone-500 mb-3">
              Home ›{" "}
              <span className="text-orange-800">
                Notifications
              </span>
            </p>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Notifications
              </h1>

              {counts.unread > 0 && (
                <span className="text-xs bg-orange-800 text-white rounded-full px-2.5 py-0.5 font-semibold">
                  {counts.unread} Unread
                </span>
              )}
            </div>

            <p className="text-sm text-stone-500 mt-1">
              Stay updated on your orders, payments, campus
              announcements, and exclusive food deals.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAll}
              disabled={markingAll || counts.unread === 0}
              className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-4 py-2 text-sm hover:bg-orange-50 disabled:opacity-50"
            >
              <CheckCheck size={15} />

              {markingAll ? "Marking..." : "Mark All as Read"}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-4 py-2 text-sm hover:bg-orange-50"
            >
              <Settings size={15} />
              Notification Settings
            </button>
          </div>
        </div>

        {/* Tabs */}

        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 items-center">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border ${tab === id
                  ? "bg-orange-800 text-white border-orange-800"
                  : "bg-white border-orange-200 hover:bg-orange-50"
                }`}
            >
              {label}

              <span
                className={`text-xs rounded-full px-1.5 ${tab === id
                    ? "bg-orange-600"
                    : "bg-stone-100"
                  }`}
              >
                {counts[id]}
              </span>
            </button>
          ))}

          <button
            onClick={() => setShowSettings(true)}
            className="lg:hidden shrink-0 ml-auto p-2 rounded-full bg-white border border-orange-200"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Loading */}

        {loading && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-orange-800 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm text-stone-500 mt-3">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="py-16 text-center">
            <Bell
              size={30}
              className="mx-auto text-stone-400 mb-2"
            />

            <p className="font-semibold">{error}</p>

            <button
              onClick={fetchNotifications}
              className="mt-3 inline-flex items-center gap-2 bg-orange-800 text-white rounded-lg px-4 py-2 text-sm"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* Notification list */}

        {!loading && !error && (
          <>
            {groups.map(({ group, list }) => (
              <section key={group} className="mb-8">

                <div className="flex justify-between text-xs font-semibold tracking-wide text-stone-600 mb-3">
                  <span>{group.toUpperCase()}</span>

                  <span className="font-normal text-stone-500">
                    {list.length}{" "}
                    {list.length === 1 ? "update" : "updates"}
                  </span>
                </div>

                <ul className="space-y-3">
                  {list.map((n) => {
                    const Icon = ICONS[n.type] || Bell;

                    return (
                      <li
                        key={n.id}
                        onClick={() => {
                          if (n.unread) markAsRead(n.id);
                        }}
                        className={`rounded-xl border p-4 flex gap-3 sm:gap-4 cursor-pointer transition-colors ${n.unread
                            ? "bg-orange-50 border-orange-200"
                            : "bg-white border-orange-100"
                          }`}
                      >
                        {/* Notification icon */}

                        <span
                          className={`w-10 h-10 shrink-0 rounded-full grid place-items-center ${TONES[n.type] || TONES.System
                            }`}
                        >
                          <Icon size={18} />
                        </span>

                        <div className="flex-1 min-w-0">

                          {/* Title and menu */}

                          <div className="flex items-start gap-2">
                            <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="font-semibold">
                                {n.title}
                              </h3>

                              {n.unread && (
                                <i
                                  className="w-2 h-2 bg-red-700 rounded-full"
                                  aria-label="unread"
                                />
                              )}

                              {n.orderNumber && (
                                <span className="text-[11px] bg-white border border-orange-200 text-orange-800 rounded px-1.5 py-0.5">
                                  {n.orderNumber}
                                </span>
                              )}

                              <span className="text-[11px] bg-white border border-orange-200 text-orange-800 rounded px-1.5 py-0.5">
                                {n.type || "System"}
                              </span>
                            </div>

                            <span className="hidden sm:block text-xs text-stone-500 whitespace-nowrap pt-1">
                              {n.time}
                            </span>

                            {/* More menu */}

                            <div
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                aria-label="More"
                                onClick={() =>
                                  setMenuId(
                                    menuId === n.id ? null : n.id
                                  )
                                }
                                className="p-1 text-stone-500"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {menuId === n.id && (
                                <div className="absolute right-0 top-7 z-10 w-44 bg-white border border-orange-100 rounded-lg shadow-lg text-sm overflow-hidden">

                                  <button
                                    onClick={() => {
                                      markAsRead(n.id);
                                      setMenuId(null);
                                    }}
                                    disabled={!n.unread}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 disabled:opacity-50"
                                  >
                                    <Eye size={14} />
                                    Mark as read
                                  </button>

                                  <button
                                    onClick={() => {
                                      remove(n.id);
                                      setMenuId(null);
                                    }}
                                    disabled={deletingId === n.id}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-red-700 disabled:opacity-50"
                                  >
                                    <Trash2 size={14} />
                                    {deletingId === n.id
                                      ? "Deleting..."
                                      : "Dismiss"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Mobile time */}

                          <p className="sm:hidden text-xs text-stone-500 mt-1">
                            {n.time}
                          </p>

                          {/* Notification message */}

                          <p className="text-sm text-stone-600 mt-1 break-words">
                            {n.message}
                          </p>

                          {/* Read status */}

                          <div className="flex items-center gap-1.5 mt-3">
                            {n.isRead ? (
                              <>
                                <CheckCircle2
                                  size={13}
                                  className="text-emerald-600"
                                />

                                <span className="text-xs text-stone-500">
                                  Read
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-orange-800 font-medium">
                                New notification
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {/* Empty state */}

            <div className="border-t border-orange-100 py-10 text-center">
              <MailCheck
                size={30}
                className="mx-auto text-stone-500 mb-2"
              />

              <p className="font-semibold">
                {shown.length === 0
                  ? "Nothing here right now"
                  : counts.unread === 0
                    ? "You're completely caught up!"
                    : "Notifications loaded successfully"}
              </p>

              <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1">
                {shown.length === 0
                  ? "Try another filter, or turn categories back on in Notification Settings."
                  : counts.unread === 0
                    ? "You have read all your notifications."
                    : "You have new notifications waiting for you."}
              </p>
            </div>
          </>
        )}
      </main>

      {/* Desktop footer */}

      <footer className="hidden lg:block bg-white border-t border-orange-100 mt-6">
        <div className="mx-auto px-8 py-10 grid grid-cols-4 gap-8 text-sm text-stone-600">

          <div>
            <p className="font-bold text-xl text-orange-800 mb-2">
              Tap2Eat
            </p>

            Campus Dining Systems • Real-time kitchen token
            tracking and seamless ordering for campus residence halls.

            <p className="mt-3">
              <b className="text-stone-800">
                Canteen Operating Hours:
              </b>{" "}
              7:30 AM – 11:00 PM (Daily)
            </p>
          </div>

          <div>
            <p className="font-semibold text-stone-800 mb-2">
              Campus Dining
            </p>

            {[
              "Campus Dining Hours",
              "Hall Locations",
              "Student Meal Plans",
              "Dietary & Allergens",
            ].map((l) => (
              <p key={l} className="py-0.5 underline">
                {l}
              </p>
            ))}
          </div>

          <div>
            <p className="font-semibold text-stone-800 mb-2">
              Help & Services
            </p>

            {[
              "Campus Support",
              "Contact Dining Services",
              "Lost Token Helpline",
              "Feedback & Complaints",
            ].map((l) => (
              <p key={l} className="py-0.5 underline">
                {l}
              </p>
            ))}
          </div>

          <div className="border border-orange-200 rounded-xl p-4 text-xs">
            <p className="font-semibold text-orange-800 mb-1">
              Dining Desk Helpline
            </p>

            Facing delays with your order? Contact your
            canteen help counter.

            <p className="font-semibold text-stone-800 mt-1">
              +91 (080) 4122-EATS (Ext. 402)
            </p>
          </div>
        </div>

        <div className="mx-auto px-8 py-4 border-t border-orange-100 flex justify-between text-xs text-stone-500">
          <span>
            © 2025 Tap2Eat Campus Dining Systems. All rights reserved.
          </span>

          <span className="flex gap-6 underline">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Dining Service</a>
            <a href="#">Health & Safety Guidelines</a>
          </span>
        </div>
      </footer>

      {/* Mobile bottom navigation */}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-orange-100 flex justify-around py-2 text-xs">
        {[
          [Home, "Home", "/"],
          [Utensils, "Explore", "/explore"],
          [Heart, "Favourites", "/favourites"],
          [Receipt, "Orders", "/orders"],
          [User, "Profile", "/profile"],
        ].map(([Icon, label, path]) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full ${label === "Orders"
                ? "bg-orange-800 text-white px-5"
                : "text-stone-700"
              }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>

      {/* Notification settings modal */}

      {showSettings && (
        <div
          className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">
                Notification Settings
              </h2>

              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {[
              [
                "orders",
                "Order & payment updates",
                "Kitchen, pickup and payment alerts",
              ],
              [
                "offers",
                "Offers & festivals",
                "Deals, coupons and special feasts",
              ],
              [
                "system",
                "System notifications",
                "Important account and service updates",
              ],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b last:border-0 border-orange-100"
              >
                <div>
                  <p className="font-medium text-sm">
                    {title}
                  </p>

                  <p className="text-xs text-stone-500">
                    {description}
                  </p>
                </div>

                <Switch
                  on={prefs[key]}
                  label={title}
                  onChange={() =>
                    setPrefs((previous) => ({
                      ...previous,
                      [key]: !previous[key],
                    }))
                  }
                />
              </div>
            ))}

            <button
              onClick={() => {
                setShowSettings(false);
                say("Notification filters updated for this session");
              }}
              className="w-full mt-4 bg-orange-800 text-white rounded-lg py-2.5 font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default Notifications;
