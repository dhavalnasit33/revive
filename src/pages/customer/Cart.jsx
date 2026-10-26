
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../../services/api";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data.cart?.items || []);
      setError("");
    } catch (err) {
      console.error("Cart error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your cart. Please log in."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      const data = await updateCartQuantity(productId, Number(quantity));
      setCart(data.cart?.items || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update quantity."
      );
    }
  };

  const handleRemove = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      setCart(data.cart?.items || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove product."
      );
    }
  };

  const total = cart.reduce((sum, item) => {
    const product = item.product;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  if (loading) return <p>Loading your cart...</p>;

  return (
    <section className="cart-page">
      <h1>My Shopping Cart</h1>

      {error && <p role="alert">{error}</p>}

      {cart.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <Link to="/">Continue Shopping</Link>
        </>
      ) : (
        <>
          {cart.map((item) => {
            const product = item.product;

            if (!product) return null;

            return (
              <div className="cart-item" key={product._id}>
                <h3>{product.name}</h3>

                <p>Price: ₹{product.price}</p>

                <label htmlFor={`quantity-${product._id}`}>
                  Quantity:
                </label>

                <input
                  id={`quantity-${product._id}`}
                  type="number"
                  min="1"
                  max={product.stock}
                  value={item.quantity}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "") return;

                    const quantity = Number(value);

                    if (
                      Number.isInteger(quantity) &&
                      quantity >= 1 &&
                      quantity <= product.stock
                    ) {
                      handleQuantityChange(product._id, quantity);
                    }
                  }}
                />

                <p>
                  Subtotal: ₹{product.price * item.quantity}
                </p>

                <button
                  type="button"
                  onClick={() => handleRemove(product._id)}
                >
                  Remove
                </button>
              </div>
            );
          })}

          <h2>Total: ₹{total}</h2>
          <Link to="/">Continue Shopping</Link>

            <button onClick={() => navigate("/checkout")}>
                 Proceed to Checkout
            </button>
        </>     
      )}
    </section>
  );
}

export default Cart;
