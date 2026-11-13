import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import LandingPage from "./pages/Landing/LandingPage";
import PopularFoodCard from "./components/PopularFoodCard";
import ReviewCard from "./components/ReviewCard";
import HomePage from "./pages/Customer/Dashboard/DashboardPage";
import ExploreMenuPage from "./pages/Customer/Menu/MenuPage";
import FavouritesPage from "./pages/Customer/Favourite/MyFavouritePage";
import OrdersPage from "./pages/Customer/Order/MyOrderPage";
import FoodDetailPage from "./pages/Customer/Food_Detail/FoodDetailPage";
import CheckoutPage from "./pages/Customer/Checkout/CheckoutPage";
import CartPage from "./pages/Customer/Cart/CartPage";
import Notifications from "./pages/Customer/Notification/NotificationPage";
import OrderConfirmation from "./pages/Customer/Order_Confirmation/OrderConfirmationPage";
import RatingsReviews from "./pages/Customer/Review/FoodReviewPage";
import ProfileSettings from "./pages/Customer/Profile/ProfilePage";
import TrackOrder from "./pages/Customer/Order_Tracking/OrderTrackingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/menu" element={<ExploreMenuPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/food-detail/:id" element={<FoodDetailPage />} />
        <Route path="/food-review" element={<RatingsReviews />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/order-tracking" element={<TrackOrder />} />
        <Route path="/notification" element={<Notifications />} />
        <Route path="/profile" element={<ProfileSettings />} />


        <Route path="/popularfoods" element={<PopularFoodCard />}/>
        <Route path="/review" element={<ReviewCard />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;