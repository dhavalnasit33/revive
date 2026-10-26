
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiHeart,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

import { addToCart } from "../../services/api";
import "../../styles/ProductCard.css";
import addToCartIcon from "../../assets/images/addtocart.png";

function ProductCard({ product }) {
  const INR_TO_USD_RATE = 95;

  const formatPrice = (inrPrice) => {
    const usdPrice = Number(inrPrice || 0) / INR_TO_USD_RATE;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(usdPrice);
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productId = product?._id || product?.id;
  const productName = product?.name || "Jewellery";

  const description =
    product?.description ||
    "Discover timeless elegance with this beautiful design.";

  const originalPrice = Number(product?.price ?? 0);
  const discountedPrice = Number(product?.discountPrice ?? 0);

  const hasDiscount =
    discountedPrice > 0 && originalPrice > discountedPrice;

  const price = hasDiscount ? discountedPrice : originalPrice;

  const discount = hasDiscount
    ? Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100
    )
    : 0;

  const imagePath =
    product?.image ||
    product?.imageUrl ||
    product?.imageURL ||
    product?.thumbnail ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "";

  const productImage =
    typeof imagePath === "string" && imagePath
      ? /^https?:\/\//i.test(imagePath)
        ? imagePath
        : `http://localhost:3200${imagePath.startsWith("/") ? "" : "/"
        }${imagePath}`
      : "";

  const rating = Math.min(
    5,
    Math.max(
      0,
      Number(
        product?.averageRating ??
        product?.rating ??
        product?.ratingsAverage ??
        0
      )
    )
  );

  const reviewCount = Number(
    product?.numReviews ??
    product?.reviewCount ??
    product?.reviews?.length ??
    0
  );

  const handleAddToCart = async () => {
    if (!productId) {
      setMessage("Product is unavailable.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await addToCart(productId, 1);

      setMessage("Added to cart successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Please login to add to cart."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = () => {
    const nextValue = !isWishlisted;

    setIsWishlisted(nextValue);

    setMessage(
      nextValue
        ? "Wishlist UI selected. Connect your wishlist API to save it."
        : "Removed from wishlist."
    );
  };

  return (
    <article className="product-card">
      <div className="product-image-box">
        <button
          type="button"
          className={`product-wishlist ${isWishlisted ? "active" : ""
            }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <FiHeart />
        </button>

        <Link
          to={`/products/${productId}`}
          className="product-image-link"
        >
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              loading="lazy"
              onError={(event) => {
                console.error("Product image failed:", productImage);
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-image-placeholder">
              No image available
            </div>
          )}
        </Link>

        {/* Mobile add-to-cart icon */}
        {/* Mobile add-to-cart icon */}
        <button
          type="button"
          className="product-image-cart"
          onClick={handleAddToCart}
          disabled={loading}
          aria-label="Add to cart"
        >
          <img
            src={addToCartIcon}
            alt=""
            className="product-cart-image"
          />

          <span className="product-cart-badge" />
        </button>
      </div>

      <div className="product-details">
        <div className="product-rating">
          <span className="product-rating-value">
            {rating.toFixed(1)}
          </span>

          <div className="product-stars">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFull = rating >= star;
              const isHalf = !isFull && rating >= star - 0.5;

              return isFull ? (
                <FaStar key={star} />
              ) : isHalf ? (
                <FaStarHalfAlt key={star} />
              ) : (
                <FiStar key={star} />
              );
            })}
          </div>

          <span className="product-review-count">
            {reviewCount} Reviews
          </span>
        </div>

        <Link
          to={`/products/${productId}`}
          className="product-name"
        >
          {productName}
        </Link>

        <p className="product-description">{description}</p>

        <div className="product-prices">
          <span className="product-price">
            {formatPrice(price)}
          </span>

          {hasDiscount && (
            <>
              <span className="product-original-price">
                {formatPrice(originalPrice)}
              </span>

              <span className="product-discount-text">
                {discount}% off
              </span>
            </>
          )}
        </div>

        <div className="product-buttons">
          <button
            type="button"
            className="add-cart-button"
            onClick={handleAddToCart}
            disabled={loading}
          >
            <FiShoppingBag />
            {loading ? "Adding..." : "Add to Cart"}
          </button>

          <Link
            to={`/products/${productId}`}
            className="quick-buy-button"
          >
            Quick Buy
            <FiChevronRight className="quick-buy-icon" />
          </Link>
        </div>

        {message && (
          <p className="product-message" role="status">
            {message}
          </p>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
