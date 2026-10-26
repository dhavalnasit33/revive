
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

import { getCategories, getCollections } from "../../services/api";
import "../../styles/navbar.css";

import shopRingImage from "../../assets/images/shopring.png";
import jewelleryEditImage from "../../assets/images/shop all.png";
import collectionImage from "../../assets/images/earing.png";



import goldImage from "../../assets/images/gold.jpg";
import diamondJewelleryImage from "../../assets/images/diamond.png";
import silverImage from "../../assets/images/silver.jpg";
import platinumImage from "../../assets/images/platinum.jpg";

// MENU TABS
const menuTabs = [
  "Category",
  "Occasion",
  "Jewellery Type",
  "Price Range",
];

// STATIC PRICE RANGES
const priceRanges = [
  {
    _id: "price-under-2000",
    name: "Under ₹2,000",
    minPrice: 0,
    maxPrice: 1999,
  },
  {
    _id: "price-2000-4999",
    name: "₹2,000 – ₹4,999",
    minPrice: 2000,
    maxPrice: 4999,
  },
  {
    _id: "price-5000-9999",
    name: "₹5,000 – ₹9,999",
    minPrice: 5000,
    maxPrice: 9999,
  },
  {
    _id: "price-above-10000",
    name: "₹10,000 and Above",
    minPrice: 10000,
    maxPrice: null,
  },
];

// JEWELLERY TYPE IMAGES
const jewelleryTypeImages = {
  gold: goldImage,
  goldjewellery: goldImage,
  diamond: diamondJewelleryImage,
  diamondjewellery: diamondJewelleryImage,
  silver: silverImage,
  silverjewellery: silverImage,
  platinum: platinumImage,
  platinumjewellery: platinumImage,
};




// GET IMAGE FOR EACH MENU ITEM


const getItemImage = (item, tab) => {
  const image = item.image || item.imageUrl || "";

  // Categories and Occasions use images from MongoDB
  if (tab === "Category" || tab === "Occasion") {
    if (!image) {
      return jewelleryEditImage;
    }

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `http://localhost:3200${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  }

  // Jewellery types keep their existing static images
  const name = item.name
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (tab === "Jewellery Type") {
    return jewelleryTypeImages[name] || collectionImage;
  }

  return collectionImage;
};




// PROMOTIONAL IMAGE
const promoImage = jewelleryEditImage;

// SUPPORT DIFFERENT API RESPONSE SHAPES
const getListFromResponse = (response, key) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.[key])) {
    return response[key];
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.[key])) {
    return response.data[key];
  }

  return [];
};

function ShopAllDropdown() {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  const [activeTab, setActiveTab] = useState("Category");

  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent hover from immediately reopening after a click closes the menu.
  const [clickClosed, setClickClosed] = useState(false);

  const wrapperRef = useRef(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  const [categoryError, setCategoryError] = useState("");
  const [collectionError, setCollectionError] = useState("");

  // FETCH CATEGORIES AND COLLECTIONS
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await getCategories();

        console.log("Categories API response:", response);

        if (isMounted) {
          setCategories(getListFromResponse(response, "categories"));
        }
      } catch (error) {
        console.error("Header category API error:", error);

        if (isMounted) {
          setCategoryError("Unable to load categories.");
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    const loadCollections = async () => {
      try {
        const response = await getCollections();

        if (isMounted) {
          setCollections(getListFromResponse(response, "collections"));
        }
      } catch (error) {
        console.error("Header collection API error:", error);

        if (isMounted) {
          setCollectionError("Unable to load collections.");
        }
      } finally {
        if (isMounted) {
          setLoadingCollections(false);
        }
      }
    };

    loadCategories();
    loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  // HOVER: OPEN THE MENU
  const handleMouseEnter = () => {
    if (!clickClosed) {
      setMenuOpen(true);
    }
  };

  // LEAVE THE BUTTON AND ENTIRE MEGA MENU AREA
  const handleMouseLeave = () => {
    setMenuOpen(false);
    setClickClosed(false);
  };

  // CLICK: TOGGLE THE MENU
  const handleButtonClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
      setClickClosed(true);
    } else {
      setMenuOpen(true);
      setClickClosed(false);
    }
  };

  // CLOSE AFTER CLICKING A MENU LINK
  const handleMenuLinkClick = () => {
    setMenuOpen(false);
    setClickClosed(false);
  };

  // CLOSE WHEN CLICKING OUTSIDE THE MENU
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setClickClosed(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // CATEGORY URL
  const getCategoryUrl = (category) => {
    const value = category.slug || category.name;

    return `/products?category=${encodeURIComponent(value)}`;
  };

  // COLLECTION URL
  const getCollectionUrl = (collection) => {
    const value = collection.slug || collection.name;

    return `/products?collection=${encodeURIComponent(value)}`;
  };

  // PRICE RANGE URL
  const getPriceRangeUrl = (item) => {
    const params = new URLSearchParams();

    params.set("minPrice", String(item.minPrice));

    if (item.maxPrice !== null) {
      params.set("maxPrice", String(item.maxPrice));
    }

    return `/products?${params.toString()}`;
  };

  // ACTIVE TAB CHECKS
  const isCategoryTab = activeTab === "Category";
  const isJewelleryTypeTab = activeTab === "Jewellery Type";
  const isOccasionTab = activeTab === "Occasion";
  const isPriceRangeTab = activeTab === "Price Range";

  // JEWELLERY TYPES
  const jewelleryTypes = [
    {
      _id: "gold",
      name: "Gold Jewellery",
      type: "gold",
      image: goldImage,
    },
    {
      _id: "diamond",
      name: "Diamond Jewellery",
      type: "diamond",
      image: diamondJewelleryImage,
    },
    {
      _id: "silver",
      name: "Silver Jewellery",
      type: "silver",
      image: silverImage,
    },
    {
      _id: "platinum",
      name: "Platinum Jewellery",
      type: "platinum",
      image: platinumImage,
    },
  ];

  // ITEMS FOR THE SELECTED TAB
  const currentItems = isCategoryTab
    ? categories
    : isJewelleryTypeTab
      ? jewelleryTypes
      : isPriceRangeTab
        ? priceRanges
        : collections;

  // LOADING STATUS
  const currentLoading = isCategoryTab
    ? loadingCategories
    : isPriceRangeTab || isJewelleryTypeTab
      ? false
      : loadingCollections;

  // ERROR STATUS
  const currentError = isCategoryTab
    ? categoryError
    : isPriceRangeTab || isJewelleryTypeTab
      ? ""
      : collectionError;

  // MENU HEADING
  const currentHeading = isPriceRangeTab
    ? "Shop by Price"
    : isCategoryTab
      ? "Shop Jewellery"
      : isJewelleryTypeTab
        ? "Shop by Jewellery Type"
        : isOccasionTab
          ? "Shop by Occasion"
          : "Explore Collections";

  // MENU ITEM COUNT LABEL
  const currentCountLabel = isCategoryTab
    ? "categories"
    : isJewelleryTypeTab
      ? "jewellery types"
      : isPriceRangeTab
        ? "price ranges"
        : "collections";

  return (
    <div
      ref={wrapperRef}
      className={`shop-all-wrapper ${menuOpen ? "shop-all-open" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* SHOP ALL BUTTON */}
      <button
        type="button"
        className="shop-all-button"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={handleButtonClick}
      >
        <span className="shop-all-grid-icon" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} className="shop-all-dot" />
          ))}
        </span>

        <span>Shop All</span>

        <FaChevronDown
          className={`shop-all-chevron ${menuOpen ? "rotated" : ""}`}
        />
      </button>

      {/* MEGA MENU: KEEP IT INSIDE shop-all-wrapper */}
      <div
        className="jewellery-mega-menu"
        aria-hidden={!menuOpen}
      >
        <div className="mega-menu-top">
          {/* LEFT SIDEBAR */}
          <aside className="mega-menu-sidebar">
            <p className="mega-menu-eyebrow">EXPLORE</p>

            {menuTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`mega-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
                onMouseEnter={() => setActiveTab(tab)}
              >
                <span>{tab}</span>
                <span className="mega-tab-arrow">›</span>
              </button>
            ))}
          </aside>

          {/* CENTER CONTENT */}
          <section className="mega-menu-categories">
            <div className="mega-menu-heading">
              <div>
                <p className="mega-menu-eyebrow">CURATED FOR YOU</p>
                <h3>{currentHeading}</h3>
              </div>

              <span className="mega-menu-count">
                {currentItems.length} {currentCountLabel}
              </span>
            </div>

            {currentLoading ? (
              <p className="mega-menu-message">
                Loading {activeTab.toLowerCase()}...
              </p>
            ) : currentError ? (
              <p className="mega-menu-message">{currentError}</p>
            ) : (
              <>
                <div className="mega-category-grid">
                  {/* ALL JEWELLERY */}
                  <Link
                    to="/products"
                    className="mega-category-link"
                    onClick={handleMenuLinkClick}
                  >
                    <span className="mega-category-icon">✧</span>
                    <span>All Jewellery</span>
                  </Link>

                  {/* ITEMS FOR THE ACTIVE TAB */}
                  {currentItems.map((item) => (
                    <Link
                      key={item._id}
                      to={
                        isCategoryTab
                          ? getCategoryUrl(item)
                          : isJewelleryTypeTab
                            ? `/products?type=${encodeURIComponent(item.type)}`
                            : isPriceRangeTab
                              ? getPriceRangeUrl(item)
                              : getCollectionUrl(item)
                      }
                      className="mega-category-link"
                      onClick={handleMenuLinkClick}
                    >
                      {isPriceRangeTab ? (
                        <span className="mega-price-label">
                          {item.name}
                        </span>
                      ) : (
                        <>
                          <span className="mega-category-icon">
                            <img
                              src={getItemImage(item, activeTab)}
                              alt={item.name || "Jewellery"}
                              loading="lazy"
                              onError={(e) => {
                                console.error("Category image failed to load:", e.currentTarget.src);
                              }}
                            />
                          </span>

                          <span>{item.name}</span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>

                {currentItems.length === 0 && (
                  <p className="mega-menu-message">
                    No {activeTab.toLowerCase()} found.
                  </p>
                )}
              </>
            )}

            {/* EXPLORE ALL LINK */}
            <Link
              to={isCategoryTab ? "/products" : "/collections"}
              className="mega-all-link"
              onClick={handleMenuLinkClick}
            >
              Explore all{" "}
              {isCategoryTab ? "jewellery" : "collections"}
              <span>↗</span>
            </Link>
          </section>

          {/* RIGHT PROMOTIONAL CARD */}
          <aside className="mega-promo-card">
            <div className="mega-promo-image">
              <img
                src={promoImage}
                alt="Jewellery collection"
                loading="lazy"
              />

              <span className="mega-promo-label">LUMORIA EDIT</span>
            </div>

            <div className="mega-promo-content">
              <p className="mega-menu-eyebrow">TIMELESS ELEGANCE</p>

              <h3>
                Discover Timeless Crafted Gold Jewellery.
              </h3>

              <Link
                to="/collections"
                className="mega-promo-link"
                onClick={handleMenuLinkClick}
              >
                Explore Now ↗
              </Link>
            </div>
          </aside>
        </div>

        {/* BOTTOM BANNER */}
        <div className="mega-menu-bottom">
          <div className="mega-bottom-thumbnails">
            <img
              src={jewelleryEditImage}
              alt="Jewellery collection"
              loading="lazy"
            />

            <img
              src={shopRingImage}
              alt="Ring collection"
              loading="lazy"
            />

            <img
              src={collectionImage}
              alt="Jewellery design"
              loading="lazy"
            />
          </div>

          <div className="mega-bottom-copy">
            <span className="mega-bottom-title">
              The Jewellery Edit
            </span>

            <span className="mega-bottom-description">
              Find your next treasured piece in our curated collection.
            </span>
          </div>

          <Link
            to="/products"
            className="mega-view-all"
            onClick={handleMenuLinkClick}
          >
            View All <span>↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShopAllDropdown;
