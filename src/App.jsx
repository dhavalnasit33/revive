
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/admin/Dashboard";
import Home from "./pages/customer/Home";
import CustomerLayout from "./layouts/CustomerLayout";
import ProductDetails from "./pages/customer/ProductDetails";
import Login from "./pages/customer/Login";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>


        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;