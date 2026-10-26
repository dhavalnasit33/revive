
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import ProductCard from "../products/ProductCard";
import HorizontalSlider from "../common/HorizontalSlider";
import { getProducts } from "../../services/api";

import "../../styles/productShowcase.css";

function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const showcaseRef = useRef(null);

  // Show the section when the user scrolls to it.
  useEffect(() => {
    const section = showcaseRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(section);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Fetch products from the API.
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await getProducts();

        const productList =
          Array.isArray(response)
            ? response
            : response?.products ??
              response?.data?.products ??
              response?.data ??
              [];

        if (isMounted) {
          setProducts(
            Array.isArray(productList) ? productList.slice(0, 10) : []
          );
        }
      } catch (error) {
        console.error("Failed to load showcase products:", error);

        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="product-showcase"
      ref={showcaseRef}
      className={`product-showcase ${isVisible ? "is-visible" : ""}`}
    >
      {/* LEFT SIDE - ORIGINAL BANNER, UNCHANGED */}
      <div className="product-banner">
        <div className="product-content">
          <h2 className="product-title">
            TIMELESS
            <br />
            JEWELLERY
          </h2>

          <p className="product-subtitle">
            Elegance in <span>Every Detail</span>
          </p>

          <p className="product-showcase-description">
            Discover beautiful jewellery designed to make
            every moment special.
          </p>

          <Link to="/products" className="product-see-more">
            <span>See More</span>
            <FiChevronRight />
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE - ORIGINAL PRODUCT SHOWCASE */}
      <div className="product-showcase-right">
        {loading ? (
          <p className="showcase-message">
            Loading jewellery products...
          </p>
        ) : products.length > 0 ? (
          <HorizontalSlider
            wrapperClassName="product-showcase-slider"
            trackClassName="product-showcase-grid"
            showArrows={false}
            dragSpeed={1.5}
            friction={0.95}
          >
            {products.map((product, index) => (
              <div
                className="product-showcase-item"
                key={product._id || product.id}
                style={{ "--card-index": index }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </HorizontalSlider>
        ) : (
          <p className="showcase-message">
            No jewellery products available.
          </p>
        )}
      </div>
    </section>
  );
}

export default ProductShowcase;
