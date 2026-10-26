
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProductById,
  addToCart,
} from "../../services/api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data.product || data);
      } catch (err) {
        console.error("Product details error:", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setMessage("");
    setError("");
    setAdding(true);

    try {
      const data = await addToCart(product._id, quantity);
      setMessage(data.message || "Product added to cart successfully!");
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to add product. Please log in and try again."
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (error && !product) return <p>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <section className="product-details">
      <Link to="/">← Back to Home</Link>

      <h1>{product.name}</h1>
      <p>Price: ₹{product.price}</p>

      {product.description && <p>{product.description}</p>}

      {product.stock !== undefined && (
        <p>Available stock: {product.stock}</p>
      )}

      <label htmlFor="quantity">Quantity:</label>{" "}
      <input
        id="quantity"
        type="number"
        min="1"
        max={product.stock}
        value={quantity}
        onChange={(event) => {
          const value = Number(event.target.value);
          setQuantity(value);
        }}
      />

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          adding ||
          product.stock < 1 ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > product.stock
        }
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </section>
  );
}

export default ProductDetails;
