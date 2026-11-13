
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Trash2,
  Minus,
  Plus,
  MapPin,
  PenLine,
  GraduationCap,
  Leaf,
  Check,
  ShoppingBag,
  LoaderCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../../services/cartServices";

import { placeOrder } from "../../../services/orderServices";

const inr = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CartPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [noPlastic, setNoPlastic] = useState(true);
  const [pickup, setPickup] = useState("counter");

  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setError("");

      const cart = await getCart();

      setItems(
        Array.isArray(cart?.items) ? cart.items : []
      );
    } catch (err) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 404
      ) {
        setItems([]);
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load your cart."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Change quantity
  const changeQty = async (foodId, currentQty, difference) => {
    const newQty = currentQty + difference;

    if (newQty < 1) return;

    try {
      setUpdating(true);
      setError("");

      await updateCartItem(foodId, newQty);
      await fetchCart();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update quantity."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Remove an item
  const remove = async (foodId) => {
    try {
      setUpdating(true);
      setError("");

      await removeCartItem(foodId);
      await fetchCart();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove this item."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!items.length) return;

    try {
      setUpdating(true);
      setError("");

      await clearCart();
      setItems([]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to clear your cart."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Bill calculation
  // Backend currently charges only food prices.
  const bill = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const food = item.food;

      if (!food) return sum;

      const price = Number(food.price ?? item.price ?? 0);
      const quantity = Number(item.quantity || 0);

      return sum + price * quantity;
    }, 0);

    return {
      subtotal,
      total: subtotal,
    };
  }, [items]);

  const count = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // Place order
  const handleCheckout = () => {
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    navigate("/checkout");
  };

  // Successful order screen
  if (successOrder) {
    return (
      <div className="min-h-screen bg-orange-50/60">
        <Header />

        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-700 grid place-items-center mb-5">
              <Check size={32} />
            </div>

            <h1 className="text-2xl font-bold text-stone-800">
              Order Placed Successfully!
            </h1>

            <p className="text-stone-600 mt-3">
              Your order has been received by the canteen.
            </p>

            <div className="bg-orange-50 rounded-xl p-4 mt-6 text-left">
              <p className="text-sm text-stone-500">
                Order Number
              </p>

              <p className="font-bold text-orange-900 mt-1">
                {successOrder.orderNumber || successOrder._id}
              </p>

              <div className="flex justify-between mt-4">
                <span className="text-sm text-stone-600">
                  Total Amount
                </span>

                <span className="font-bold">
                  {inr(successOrder.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-sm text-stone-600">
                  Status
                </span>

                <span className="text-sm font-semibold text-orange-800">
                  {successOrder.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-6 bg-orange-800 hover:bg-orange-900 text-white font-semibold rounded-xl py-3"
            >
              Continue Ordering
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/60 text-stone-800 pb-28 lg:pb-0">
      <Header />

      <main className="mx-auto px-4 lg:px-8 pt-4 lg:pt-6">
        {/* Breadcrumb and title */}
        <div className="hidden lg:block mb-6">
          <p className="text-xs text-stone-500 mb-4">
            Home › Menu ›{" "}
            <span className="text-orange-800">Your Cart</span>
          </p>

          <div className="flex items-center justify-between border-b border-orange-100 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Your Cart
              </h1>

              <span className="text-xs bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                ● {count} items
              </span>
            </div>
          </div>
        </div>

        {/* Pickup banner */}
        <div className="flex items-center gap-3 bg-orange-100/70 border border-orange-200 rounded-xl p-3 lg:p-4 mb-5">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-orange-600 text-white grid place-items-center">
            <Zap size={20} />
          </span>

          <div className="flex-1 text-sm">
            <p className="font-semibold">
              Estimated Pickup Time: 12-15 mins
            </p>

            <p className="text-stone-600">
              North Canteen • Express pickup counter
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500">
            <LoaderCircle
              size={32}
              className="animate-spin text-orange-700"
            />
            <p className="mt-3">Loading your cart...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* LEFT SIDE */}
            <div className="space-y-5 min-w-0">
              {/* Cart items */}
              <section className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-orange-50/50 border-b border-orange-100">
                  <h2 className="font-semibold">
                    Order Items ({count})
                  </h2>

                  <button
                    onClick={handleClearCart}
                    disabled={!items.length || updating}
                    className="text-xs text-orange-800 disabled:opacity-40"
                  >
                    Clear All
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="p-10 text-center">
                    <ShoppingBag
                      size={42}
                      className="mx-auto text-orange-300"
                    />

                    <p className="font-semibold mt-4">
                      Your cart is empty
                    </p>

                    <p className="text-sm text-stone-500 mt-1">
                      Add something from the canteen menu.
                    </p>

                    <button
                      onClick={() => navigate("/menu")}
                      className="mt-5 rounded-lg bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Browse Food
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const food = item.food;

                    if (!food) return null;

                    const foodId = food._id;
                    const quantity = Number(item.quantity || 1);
                    const unitPrice = Number(
                      food.price ?? item.price ?? 0
                    );

                    return (
                      <div
                        key={foodId}
                        className="flex gap-3 sm:gap-4 p-4 sm:p-5 border-b last:border-0 border-orange-100"
                      >
                        {/* Food image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-orange-100 overflow-hidden grid place-items-center">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag
                              size={30}
                              className="text-orange-500"
                            />
                          )}
                        </div>

                        {/* Food details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <h3 className="font-semibold leading-snug">
                              {food.name}
                            </h3>

                            <button
                              onClick={() => remove(foodId)}
                              disabled={updating}
                              aria-label="Remove item"
                              className="lg:hidden text-stone-400 hover:text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <p className="text-xs text-stone-500 mt-1">
                            {inr(unitPrice)} each
                          </p>

                          <div className="flex items-end justify-between mt-3 lg:hidden">
                            <p className="font-bold text-orange-900">
                              {inr(unitPrice * quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity and price */}
                        <div className="flex flex-col lg:flex-row items-end lg:items-center justify-end gap-3 lg:gap-8">
                          <div className="flex items-center border border-orange-200 rounded-full lg:rounded-lg bg-white">
                            <button
                              onClick={() =>
                                changeQty(foodId, quantity, -1)
                              }
                              disabled={updating}
                              className="p-2 disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center font-semibold">
                              {quantity}
                            </span>

                            <button
                              onClick={() =>
                                changeQty(foodId, quantity, 1)
                              }
                              disabled={updating}
                              className="p-2 text-orange-600 disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <span className="hidden lg:block w-24 text-right font-bold text-lg">
                            {inr(unitPrice * quantity)}
                          </span>

                          <button
                            onClick={() => remove(foodId)}
                            disabled={updating}
                            aria-label="Remove item"
                            className="hidden lg:block text-stone-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              {/* Pickup mode */}
              <section className="bg-white rounded-2xl border border-orange-100 p-5">
                <div className="flex justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-orange-800"
                    />
                    Pickup Mode
                  </h2>

                  <span className="text-xs text-orange-800">
                    Select your preference
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "counter",
                      title: "Express Counter Pickup",
                      description: "Direct collection at the counter",
                    },
                    {
                      id: "locker",
                      title: "Campus Locker Bay",
                      description: "Contactless locker collection",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPickup(option.id)}
                      className={`text-left rounded-xl border-2 p-4 ${pickup === option.id
                        ? "border-orange-800 bg-orange-50"
                        : "border-orange-100"
                        }`}
                    >
                      <p className="font-semibold">
                        {option.title}
                      </p>

                      <p className="text-sm text-stone-600 mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Delivery address */}
              <section className="bg-white rounded-2xl border border-orange-100 p-4 lg:p-5">
                <h2 className="font-semibold flex items-center gap-2 mb-3">
                  <MapPin
                    size={17}
                    className="text-orange-800"
                  />
                  Delivery / Pickup Address
                </h2>

                <textarea
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(e.target.value)
                  }
                  placeholder="Enter your campus, building, hostel or pickup location..."
                  className="w-full h-24 resize-none rounded-lg bg-orange-50/60 border border-orange-100 p-3 text-sm outline-none focus:border-orange-400"
                />

                <p className="text-xs text-stone-500 mt-2">
                  Required to place your order.
                </p>
              </section>

              {/* Special instructions */}
              <div className="grid lg:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl border border-orange-100 p-4 lg:p-5">
                  <h2 className="font-semibold flex items-center gap-2 mb-3">
                    <PenLine
                      size={16}
                      className="text-orange-800"
                    />
                    Special Cooking Instructions
                  </h2>

                  <textarea
                    value={instructions}
                    onChange={(e) =>
                      setInstructions(e.target.value)
                    }
                    placeholder="Add a note for the canteen kitchen (optional)..."
                    className="w-full h-24 resize-none rounded-lg bg-orange-50/60 border border-orange-100 p-3 text-sm outline-none focus:border-orange-400"
                  />

                  <p className="text-xs text-stone-500 mt-2">
                    Note: Special instructions are currently
                    frontend-only; your order API does not save them.
                  </p>
                </section>

                <section className="bg-white rounded-2xl border border-orange-100 p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Leaf
                        size={16}
                        className="text-emerald-700"
                      />
                      Green Campus Initiative
                    </h2>
                  </div>

                  <p className="text-sm text-stone-600 mb-3">
                    Opt out of single-use plastic cutlery 🌱
                  </p>

                  <button
                    onClick={() => setNoPlastic(!noPlastic)}
                    className="w-full flex items-center justify-between rounded-lg bg-orange-50/60 border border-orange-100 px-3 py-3 text-sm"
                  >
                    No plastic spoon / fork needed

                    <span
                      className={`w-6 h-6 rounded-full grid place-items-center ${noPlastic
                        ? "bg-orange-800 text-white"
                        : "border border-stone-300"
                        }`}
                    >
                      {noPlastic && <Check size={14} />}
                    </span>
                  </button>

                  <p className="text-xs text-stone-500 mt-3">
                    Note: This preference is not yet sent to the backend.
                  </p>
                </section>
              </div>
            </div>

            {/* RIGHT SIDE: BILL SUMMARY */}
            <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-orange-100 p-5 lg:p-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-orange-100 pb-3 mb-4">
                <h2 className="text-xl font-bold lg:font-semibold">
                  Order Summary
                </h2>
              </div>

              <dl className="space-y-3 text-sm">
                <Row
                  label="Items Subtotal"
                  value={inr(bill.subtotal)}
                />

                <Row
                  label="Discount"
                  value={inr(0)}
                />

                <Row
                  label="Additional Fees"
                  value={inr(0)}
                />
              </dl>

              <div className="flex items-end justify-between border-t border-orange-100 mt-4 pt-4">
                <div>
                  <p className="text-sm text-stone-600">
                    Total Amount
                  </p>

                  <p className="text-3xl font-bold text-orange-900">
                    {inr(bill.total)}
                  </p>
                </div>

                <span className="text-xs bg-emerald-50 text-emerald-700 rounded-md px-2 py-1">
                  No hidden fees
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={
                  !items.length ||
                  placingOrder ||
                  updating
                }
                className="hidden lg:flex w-full mt-5 items-center justify-center gap-2 rounded-xl bg-orange-800 hover:bg-orange-900 text-white font-semibold py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-500 mt-3">
                Payment status will be managed by your order system.
              </p>

              <button
                onClick={() => navigate("/")}
                className="hidden lg:flex w-full mt-4 items-center justify-center gap-2 rounded-xl border border-orange-200 py-3 text-sm font-medium"
              >
                <ArrowLeft size={14} />
                Continue Ordering Food
              </button>

              <div className="hidden lg:flex gap-3 mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-orange-200 text-orange-900 grid place-items-center">
                  <GraduationCap size={18} />
                </span>

                <p>
                  Tap2Eat
                  <br />
                  Your campus food ordering platform.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Mobile checkout bar */}
      {!loading && items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-orange-50 border-t border-orange-100 px-4 pt-3 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-stone-500">
                To Pay
              </p>

              <p className="text-2xl font-bold text-orange-900">
                {inr(bill.total)}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder || updating}
              className="flex-1 max-w-[230px] bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {placingOrder ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <>
                  Place Order
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default CartPage;
