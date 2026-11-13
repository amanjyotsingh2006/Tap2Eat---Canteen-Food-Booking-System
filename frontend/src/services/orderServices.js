
import api from "./api.js";

// Place order
export const placeOrder = async (deliveryAddress) => {
  const response = await api.post("/orders/placeOrder", {
    deliveryAddress,
  });

  return response.data.data;
};

// Fetch user's orders
export const getOrders = async () => {
  const response = await api.get("/orders/getOrders");
  return response.data.data;
};

// Fetch one order
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/getOrder/${orderId}`);
  return response.data.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await api.patch(
    `/orders/cancelOrder/${orderId}`
  );

  return response.data.data;
};
