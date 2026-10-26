
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import { getProducts, getCollections } from "../../services/api";
import ProductCard from "../../components/products/ProductCard";
import HorizontalSlider from "../../components/common/HorizontalSlider";

import "../../styles/NewArrivals.css";

const COLLECTION_NAME = "New Arrivals";
const PAGE_SIZE = 10;

function getCollectionsFromResponse(response) {
  const candidates = [
    response?.data?.collections,
    response?.data?.data?.collections,
    response?.collections,
    response?.data?.data,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function getProductsFromResponse(response) {
  const candidates = [
    response?.data?.products,
    response?.data?.data?.products,
    response?.products,
    response?.data?.data,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function getPaginationValue(response, key) {
  return (
    response?.data?.[key] ??
    response?.data?.pagination?.[key] ??
    response?.data?.data?.[key] ??
    response?.data?.data?.pagination?.[key] ??
    response?.[key] ??
    response?.pagination?.[key]
  );
}

function getProductCollectionId(product) {
  const collection =
    product?.collection ??
    product?.collectionId ??
    product?.collections;

  if (Array.isArray(collection)) {
    return collection.map((item) =>
      typeof item === "object" && item !== null
        ? item._id || item.id
        : item
    );
  }

  if (typeof collection === "object" && collection !== null) {
    return collection._id || collection.id;
  }

  return collection;
}

function belongsToCollection(product, collectionId) {
  const productCollectionId = getProductCollectionId(product);

  if (Array.isArray(productCollectionId)) {
    return productCollectionId.some(
      (id) => String(id) === String(collectionId)
    );
  }

  return String(productCollectionId) === String(collectionId);
}

function getProductId(product) {
  return String(product?._id ?? product?.id ?? "");
}

function NewArrivals() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchNewArrivals() {
      try {
        setLoading(true);
        setError("");

        // Find the New Arrivals collection.
        const collectionResponse = await getCollections();
        const collections =
          getCollectionsFromResponse(collectionResponse);

        const collection = collections.find(
          (item) =>
            String(item.name ?? item.title ?? "")
              .trim()
              .toLowerCase() === COLLECTION_NAME.toLowerCase()
        );

        if (!collection) {
          throw new Error(
            '"New Arrivals" collection was not found.'
          );
        }

        const collectionId = collection._id ?? collection.id;

        if (!collectionId) {
          throw new Error(
            "New Arrivals collection ID is missing."
          );
        }

        // Fetch every API page, not just the first 10 products.
        const firstResponse = await getProducts({
          collection: collectionId,
          sort: "newest",
          page: 1,
          limit: PAGE_SIZE,
        });

        const firstProducts =
          getProductsFromResponse(firstResponse);

        const reportedPages = Number(
          getPaginationValue(firstResponse, "totalPages")
        );

        const reportedTotal = Number(
          getPaginationValue(firstResponse, "totalProducts")
        );

        const pagesFromTotal =
          Number.isFinite(reportedTotal) && reportedTotal >= 0
            ? Math.ceil(reportedTotal / PAGE_SIZE)
            : 0;

        const totalPages =
          Number.isFinite(reportedPages) && reportedPages > 0
            ? reportedPages
            : pagesFromTotal > 0
              ? pagesFromTotal
              : firstProducts.length >= PAGE_SIZE
                ? 2
                : 1;

        const allProducts = [...firstProducts];

        for (let page = 2; page <= totalPages; page += 1) {
          const response = await getProducts({
            collection: collectionId,
            sort: "newest",
            page,
            limit: PAGE_SIZE,
          });

          const pageProducts =
            getProductsFromResponse(response);

          if (pageProducts.length === 0) break;

          allProducts.push(...pageProducts);
        }

        // Keep only products assigned to this collection and remove duplicates.
        const uniqueProducts = new Map();

        allProducts
          .filter((product) =>
            belongsToCollection(product, collectionId)
          )
          .forEach((product) => {
            const id = getProductId(product);

            if (id) {
              uniqueProducts.set(id, product);
            }
          });

        if (isMounted) {
          setProducts([...uniqueProducts.values()]);
        }
      } catch (err) {
        console.error("New Arrivals error:", err);

        if (isMounted) {
          setProducts([]);
          setError(
            err.message ||
              "Unable to load New Arrivals products."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNewArrivals();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep the existing See More navigation.
  function handleSeeMore() {
    navigate(
      `/products?collection=${encodeURIComponent(COLLECTION_NAME)}`
    );
  }

  const showSeeMore =
    !loading && !error && products.length > 0;

  const seeMoreButton = (
    <button
      type="button"
      className="new-arrivals-see-more"
      onClick={handleSeeMore}
    >
      See More <FiChevronRight />
    </button>
  );

  return (
    <section id="new-arrivals" className="new-arrivals">
      <div className="new-arrivals-header">
        <h2 className="new-arrivals-title">
          <span className="new-arrivals-text-new">New</span>{" "}
          <span className="new-arrivals-text-arrivals">
            Arrivals
          </span>
          <span className="new-arrivals-title-bold">
            {" "}For You
          </span>
        </h2>

        {showSeeMore && (
          <div className="new-arrivals-see-more-wrapper new-arrivals-see-more-mobile">
            {seeMoreButton}
          </div>
        )}
      </div>

      {loading ? (
        <p className="new-arrivals-status">
          Loading New Arrivals...
        </p>
      ) : error ? (
        <p className="new-arrivals-status" role="alert">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="new-arrivals-status">
          No products found in New Arrivals.
        </p>
      ) : (
        <>
          <HorizontalSlider
            wrapperClassName="new-arrivals-slider-wrapper"
            trackClassName="new-arrivals-grid"
            showArrows={true}
            hideArrowsAt="hide-at-tablet"
            dragSpeed={1.5}
            friction={0.95}
            scrollStep={5}
            cardSelector=".product-card"
            leftLabel="Previous products"
            rightLabel="Next products"
          >
            {products.map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
              />
            ))}
          </HorizontalSlider>

          {showSeeMore && (
            <div className="new-arrivals-see-more-wrapper new-arrivals-see-more-desktop">
              {seeMoreButton}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default NewArrivals;
