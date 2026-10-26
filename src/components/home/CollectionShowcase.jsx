
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { getCollections, getProducts } from "../../services/api";
import ProductCard from "../../components/products/ProductCard";
import "../../styles/ProductCard.css";
import "../../styles/CollectionShowcase.css";

import newArrivalsImage from "../../assets/images/newarrivals.png";
import partyWearImage from "../../assets/images/partywear.jpg";
import dailyWearImage from "../../assets/images/dailywear.png";
import bridalImage from "../../assets/images/bridal.png";
import weddingImage from "../../assets/images/wedding.jpg";

const COLLECTION_ORDER = [
    "New Arrivals",
    "Party-wear Collection",
    "Daily Wear",
    "Wedding Collections",
    "Bridal",
];

const PRODUCTS_PER_VIEW = 4;

const COLLECTION_IMAGES = {
    "New Arrivals": newArrivalsImage,
    "Party-wear Collection": partyWearImage,
    "Daily Wear": dailyWearImage,
    "Bridal": bridalImage,
    "Wedding Collections": weddingImage,
};

function CollectionShowcase() {
    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchShowcaseData() {
            try {
                setLoading(true);
                setError("");

                const [collectionResponse, firstPageResponse] =
                    await Promise.all([
                        getCollections(),
                        getProducts({ page: 1 }),
                    ]);

                const collectionData = Array.isArray(collectionResponse)
                    ? collectionResponse
                    : collectionResponse?.data ??
                    collectionResponse?.collections ??
                    [];

                const firstPageData = Array.isArray(firstPageResponse)
                    ? firstPageResponse
                    : firstPageResponse?.data ??
                    firstPageResponse?.products ??
                    [];

                let allProducts = [...firstPageData];

                // Load the remaining pages so collection filtering
                // can find products beyond the first page.
                const totalPages = Number(
                    firstPageResponse?.totalPages ??
                    firstPageResponse?.data?.totalPages ??
                    1
                );

                if (totalPages > 1) {
                    const remainingPages = await Promise.all(
                        Array.from(
                            { length: totalPages - 1 },
                            (_, index) => getProducts({ page: index + 2 })
                        )
                    );

                    remainingPages.forEach((response) => {
                        const pageProducts = Array.isArray(response)
                            ? response
                            : response?.data ??
                            response?.products ??
                            [];

                        allProducts = [...allProducts, ...pageProducts];
                    });
                }

                if (!isMounted) return;

                const sortedCollections = [...collectionData].sort(
                    (a, b) => {
                        const nameA = a.name ?? a.title ?? "";
                        const nameB = b.name ?? b.title ?? "";

                        const indexA = COLLECTION_ORDER.indexOf(nameA);
                        const indexB = COLLECTION_ORDER.indexOf(nameB);

                        return (
                            (indexA === -1 ? 999 : indexA) -
                            (indexB === -1 ? 999 : indexB)
                        );
                    }
                );

                setCollections(sortedCollections);
                setProducts(allProducts);
            } catch (err) {
                if (isMounted) {
                    console.error("Collection Showcase:", err);
                    setError("Unable to load collections and products.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchShowcaseData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Show "New" as a tab for the New Arrivals collection.
    const collectionTabs = [
        { id: "new", name: "New", collectionName: "New Arrivals" },
        ...collections
            .filter((collection) => {
                const name = collection.name ?? collection.title;

                return name && name !== "New Arrivals" && name !== "New";
            })
            .map((collection) => ({
                id: collection._id,
                name: collection.name ?? collection.title,
                collectionName: collection.name ?? collection.title,
            })),
    ];

    const activeTab = collectionTabs[activeIndex];

    const selectedCollection = collections.find(
        (collection) =>
            (collection.name ?? collection.title) ===
            activeTab?.collectionName
    );

    const displayedProducts = products
        .filter((product) => {
            const productCollection =
                product.collection?._id ?? product.collection;

            return (
                selectedCollection &&
                String(productCollection) === String(selectedCollection._id)
            );
        })
        .slice(0, PRODUCTS_PER_VIEW);

    const handleCollectionChange = (index) => {
        setActiveIndex(index);
    };

    const handlePreviousCollection = () => {
        setActiveIndex((currentIndex) =>
            currentIndex === 0
                ? collectionTabs.length - 1
                : currentIndex - 1
        );
    };

    const handleNextCollection = () => {
        setActiveIndex((currentIndex) =>
            currentIndex === collectionTabs.length - 1
                ? 0
                : currentIndex + 1
        );
    };

    return (
        <section id="collections" className="collection-showcase">
            <div className="collection-showcase-heading">
                <h2>
                    <span>Featured </span> Luxury Collection</h2>
            </div>

            <nav
                className="collection-showcase-tabs"
                aria-label="Product collections"
            >
                {collectionTabs.map((collection, index) => (
                    <button
                        type="button"
                        key={collection.id}
                        className={activeIndex === index ? "active" : ""}
                        onMouseEnter={() => handleCollectionChange(index)}
                        onFocus={() => handleCollectionChange(index)}
                        onClick={() => handleCollectionChange(index)}
                    >
                        {collection.name}
                    </button>
                ))}
            </nav>

            {loading ? (
                <p className="collection-showcase-message">
                    Loading collections...
                </p>
            ) : error ? (
                <p className="collection-showcase-message">{error}</p>
            ) : (
                <div className="collection-showcase-content">
                    <div className="collection-showcase-banner">
                        <img
                            src={
                                COLLECTION_IMAGES[activeTab?.collectionName] ??
                                newArrivalsImage
                            }
                            alt={`${activeTab?.collectionName ?? "New Arrivals"} jewellery collection`}
                            className="collection-showcase-banner-image"
                        />

                        <div className="collection-showcase-banner-text">
                            <h3>{activeTab?.collectionName ?? "New Arrivals"}</h3>
                            <p>GET UPTO 30% OFF</p>
                        </div>
                    </div>

                    <div className="collection-showcase-products">
                        <button
                            type="button"
                            className="collection-showcase-arrow collection-showcase-arrow-left"
                            aria-label="Previous collection"
                            onClick={handlePreviousCollection}
                            disabled={collectionTabs.length < 2}
                        >
                            <FiChevronLeft />
                        </button>

                        <div className="collection-showcase-track">
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map((product) => (
                                    <div
                                        className="collection-showcase-product-item"
                                        key={product._id}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))
                            ) : (
                                <p className="collection-showcase-message">
                                    No products found in this collection.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className="collection-showcase-arrow collection-showcase-arrow-right"
                            aria-label="Next collection"
                            onClick={handleNextCollection}
                            disabled={collectionTabs.length < 2}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <div className="collection-showcase-view-all">
                    <button
                        type="button"
                        className="collection-showcase-view-all-btn"
                        onClick={() => {
                            window.location.href = "/products";
                        }}
                    >
                        <span>View All</span>
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </section>
    );
}

export default CollectionShowcase;
