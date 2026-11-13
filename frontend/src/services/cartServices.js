
import api from "./api.js";

// Fetch logged-in user's cart
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data.data;
};

// Add food to cart
export const addToCart = async (foodId, quantity = 1) => {
  const response = await api.post("/cart/add", {
    foodId,
    quantity,
  });

  return response.data.data;
};

// Update food quantity
export const updateCartItem = async (foodId, quantity) => {
  const response = await api.patch(`/cart/update/${foodId}`, {
    quantity,
  });

  return response.data.data;
};

// Remove food from cart
export const removeCartItem = async (foodId) => {
  const response = await api.delete(`/cart/remove/${foodId}`);
  return response.data.data;
};

// Clear cart
export const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return response.data.data;
};
