
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import {
  FiSearch,
  FiHeart,
  FiUser,
  FiShoppingBag,
  FiX,
  FiMenu,
} from "react-icons/fi";

import ShopAllDropdown from "./ShopAllDropdown";
import { getCategories, getCollections } from "../../services/api";
import "../../styles/navbar.css";

const assetFiles = import.meta.glob(
  "../../assets/**/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" }
);

const imageFor = (keyword) => {
  const match = Object.entries(assetFiles).find(([path]) =>
    path.toLowerCase().includes(keyword.toLowerCase())
  );

  return match?.[1] || "";
};

const searchCategories = [
  { name: "Rings", keyword: "shopring" },
  { name: "Earrings", keyword: "earings" },
  { name: "Necklaces", keyword: "necklaces" },
  { name: "Bracelets", keyword: "bracelet" },
]
  .map((item) => ({ ...item, image: imageFor(item.keyword) }))
  .filter((item) => item.image);

const trendingSearches = [
  "Gold Rings",
  "Diamond Earrings",
  "Gold Necklace",
  "Bracelets",
  "Wedding Jewellery",
  "New Arrivals",
];

const getListFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  return [];
};

function Navbar() {
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileShopExpanded, setMobileShopExpanded] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);


  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("lumoriaRecentSearches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchContainerRef = useRef(null);
  const navigate = useNavigate();


  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileShopExpanded(false);
    setOpenDropdown(null);
  };


  const goToHomeSection = (sectionId) => {
    closeMobileMenu();

    if (window.location.pathname === "/") {
      navigate(`/#${sectionId}`);

      // Also handle clicking the same section link again.
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const toggleDropdown = (name) => {
    setMobileShopExpanded(false);

    setOpenDropdown((current) => (current === name ? null : name));
  };

  const handleDropdownMouseEnter = (name) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setMobileShopExpanded(false);
      setOpenDropdown(name);
    }
  };

  const handleDropdownMouseLeave = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setOpenDropdown(null);
    }
  };


  // Load categories and collections once.
  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        if (active) {
          setCategories(getListFromResponse(response, "categories"));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);

        if (active) setCategories([]);
      } finally {
        if (active) setLoadingCategories(false);
      }
    };

    const fetchCollections = async () => {
      try {
        const response = await getCollections();

        if (active) {
          setCollections(getListFromResponse(response, "collections"));
        }
      } catch (error) {
        console.error("Error fetching collections:", error);

        if (active) setCollections([]);
      } finally {
        if (active) setLoadingCollections(false);
      }
    };

    fetchCategories();
    fetchCollections();

    return () => {
      active = false;
    };
  }, []);

  // Close search and menus with outside click or Escape.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
        setMobileShopExpanded(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const performSearch = (value) => {
    const query = value.trim();

    if (!query) return;

    const updatedRecent = [
      query,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updatedRecent);

    try {
      localStorage.setItem(
        "lumoriaRecentSearches",
        JSON.stringify(updatedRecent)
      );
    } catch (error) {
      console.error("Unable to save recent searches:", error);
    }

    setSearchText(query);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    closeMobileMenu();

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);

    try {
      localStorage.removeItem("lumoriaRecentSearches");
    } catch (error) {
      console.error("Unable to clear recent searches:", error);
    }
  };

  const filteredTrending = trendingSearches.filter((item) =>
    item.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const filteredCategories = searchCategories.filter((item) =>
    item.name.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  return (
    <header
      className={`site-header ${mobileMenuOpen ? "mobile-menu-open" : ""
        } ${mobileSearchOpen ? "mobile-search-open" : ""}`}
    >
      <div className="header-inner">
        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen((current) => !current);
            setMobileSearchOpen(false);
            setSearchOpen(false);
          }}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile search button */}
        <button
          type="button"
          className="mobile-search-toggle"
          aria-label={mobileSearchOpen ? "Close search" : "Open search"}
          aria-expanded={mobileSearchOpen}
          onClick={() => {
            setMobileSearchOpen((current) => !current);
            setMobileMenuOpen(false);
            setMobileShopExpanded(false);
            setOpenDropdown(null);
            setSearchOpen(false);
          }}
        >
          {mobileSearchOpen ? <FiX /> : <FiSearch />}
        </button>

        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
          LUMORIA
        </Link>

        {/* Desktop Shop All — existing component and CSS retained */}
        <div className="desktop-shop-all">
          <ShopAllDropdown
            variant="desktop"
            categories={categories}
            collections={collections}
            loadingCategories={loadingCategories}
            loadingCollections={loadingCollections}
          />
        </div>

        <nav className="main-navigation" aria-label="Main navigation">
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>
            Home
          </Link>

          {/* Mobile Shop All: category names only */}
          <div
            className={`mobile-shop-all-accordion ${mobileShopExpanded ? "is-expanded" : ""
              }`}
          >
            <button
              type="button"
              className="mobile-shop-all-trigger"
              aria-expanded={mobileShopExpanded}
              onClick={(event) => {
                setMobileShopExpanded((current) => !current);
                setOpenDropdown(null);
                event.currentTarget.blur();
              }}
            >
              <span>Shop All</span>

              <FaChevronDown
                className={`mobile-shop-chevron ${mobileShopExpanded ? "rotated" : ""
                  }`}
              />
            </button>

            {mobileShopExpanded && (
              <div className="mobile-shop-all-content">
                <Link
                  to="/products"
                  className="mobile-shop-all-products"
                  onClick={closeMobileMenu}
                >
                  All Jewellery
                </Link>

                <div className="mobile-shop-category-list">
                  {loadingCategories ? (
                    <p className="mobile-shop-message">
                      Loading categories...
                    </p>
                  ) : categories.length > 0 ? (
                    categories.map((category, index) => (
                      <Link
                        key={
                          category._id ||
                          category.slug ||
                          category.name ||
                          index
                        }
                        to={`/products?category=${encodeURIComponent(
                          category.slug || category.name
                        )}`}
                        className="mobile-shop-category-item"
                        onClick={closeMobileMenu}
                      >
                        <span className="mobile-shop-category-name">
                          {category.name}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="mobile-shop-message">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Collection dropdown */}
          <div
            className={`nav-dropdown-wrapper ${openDropdown === "collection" ? "dropdown-open" : ""
              }`}
            onMouseEnter={() => handleDropdownMouseEnter("collection")}
            onMouseLeave={() => handleDropdownMouseLeave("collection")}
          >
            <button
              type="button"
              className="nav-link nav-dropdown-button"
              aria-haspopup="true"
              aria-expanded={openDropdown === "collection"}
              onClick={(event) => {
                toggleDropdown("collection");
                event.currentTarget.blur();
              }}
            >
              Collection <FaChevronDown className="nav-chevron" />
            </button>

            <div className="nav-dropdown">
              <Link
                to="/#collections"
                onClick={(event) => {
                  event.preventDefault();
                  goToHomeSection("collections");
                }}
              >
                All Collections
              </Link>

              {loadingCollections ? (
                <span className="collection-dropdown-message">
                  Loading collections...
                </span>
              ) : collections.length > 0 ? (
                collections.map((collection) => (
                  <Link
                    key={collection._id || collection.slug || collection.name}
                    to={`/products?collection=${encodeURIComponent(
                      collection.slug || collection.name
                    )}`}
                    onClick={closeMobileMenu}
                  >
                    {collection.name}
                  </Link>
                ))
              ) : (
                <span className="collection-dropdown-message">
                  No collections found
                </span>
              )}

              <Link
                to="/#product-showcase"
                onClick={(event) => {
                  event.preventDefault();
                  goToHomeSection("product-showcase");
                }}
              >
                All Jewellery
              </Link>
            </div>
          </div>

          {/* Pages dropdown */}
          <div
            className={`nav-dropdown-wrapper ${openDropdown === "pages" ? "dropdown-open" : ""
              }`}
            onMouseEnter={() => handleDropdownMouseEnter("pages")}
            onMouseLeave={() => handleDropdownMouseLeave("pages")}
          >
            <button
              type="button"
              className="nav-link nav-dropdown-button"
              aria-label="Pages menu"
              aria-haspopup="true"
              aria-expanded={openDropdown === "pages"}
              onClick={(event) => {
                toggleDropdown("pages");
                event.currentTarget.blur();
              }}
            >
              Pages <FaChevronDown className="nav-chevron" />
            </button>

            <div className="nav-dropdown">
              <Link to="/about" onClick={closeMobileMenu}>
                About Us
              </Link>
              <Link to="/blog" onClick={closeMobileMenu}>
                Blog
              </Link>
              <Link to="/contact" onClick={closeMobileMenu}>
                Contact Us
              </Link>
            </div>
          </div>

          {/* NEW link */}
          <Link
            to="/#new-arrivals"
            className="nav-link new-nav-link"
            onClick={(event) => {
              event.preventDefault();
              goToHomeSection("new-arrivals");
            }}
          >
            <svg
              className="new-star new-star-left"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>

            <span className="new-nav-text">NEW</span>

            <svg
              className="new-star new-star-right"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </Link>

          <Link to="/products" className="nav-link" onClick={closeMobileMenu}>
            Best Sellers
          </Link>
        </nav>

        {/* Search bar and suggestions */}
        <div
          className={`header-search-container ${mobileSearchOpen ? "mobile-search-visible" : ""
            }`}
          ref={searchContainerRef}
        >
          <form
            className="header-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              performSearch(searchText);
            }}
          >
            <FaSearch className="search-icon" />

            <input
              type="search"
              aria-label="Search jewellery"
              placeholder="Search jewellery, rings, necklaces..."
              value={searchText}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchText(event.target.value);
                setSearchOpen(true);
              }}
            />

            {searchText && (
              <button
                type="button"
                className="search-clear-button"
                aria-label="Clear search"
                onClick={() => setSearchText("")}
              >
                <FiX />
              </button>
            )}
          </form>

          {searchOpen && (
            <div
              className="search-suggestions-dropdown"
              role="region"
              aria-label="Search suggestions"
            >
              {!searchText.trim() && recentSearches.length > 0 && (
                <section className="search-dropdown-section">
                  <div className="search-dropdown-heading">
                    <span>Recent Searches</span>
                    <button type="button" onClick={clearRecentSearches}>
                      Clear
                    </button>
                  </div>

                  <div className="search-trending-grid">
                    {recentSearches.map((item) => (
                      <button
                        type="button"
                        className="search-suggestion-item"
                        key={item}
                        onClick={() => performSearch(item)}
                      >
                        <FaSearch />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="search-dropdown-section">
                <div className="search-dropdown-heading">
                  <span>
                    {searchText.trim()
                      ? "Suggested Searches"
                      : "Trending Searches"}
                  </span>
                </div>

                {filteredTrending.length > 0 ? (
                  <div className="search-trending-grid">
                    {filteredTrending.map((item) => (
                      <button
                        type="button"
                        className="search-suggestion-item"
                        key={item}
                        onClick={() => performSearch(item)}
                      >
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="search-empty-message">
                    No matching suggestions. Press Enter to search.
                  </p>
                )}
              </section>

              {filteredCategories.length > 0 && (
                <section className="search-dropdown-section">
                  <div className="search-dropdown-heading">
                    <span>Shop by Category</span>
                  </div>

                  <div className="search-category-grid">
                    {filteredCategories.map((category) => (
                      <button
                        type="button"
                        className="search-category-card"
                        key={category.name}
                        onClick={() => performSearch(category.name)}
                      >
                        <img src={category.image} alt={category.name} />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {searchText.trim() && (
                <button
                  type="button"
                  className="search-view-all"
                  onClick={() => performSearch(searchText)}
                >
                  View results for “{searchText.trim()}” <FaSearch />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Header actions */}
        <div className="header-actions">
          <Link
            to="/wishlist"
            className="header-icon-button wishlist-action"
            aria-label="Wishlist"
          >
            <FiHeart />
          </Link>

          <Link
            to="/login"
            className="header-icon-button user-action"
            aria-label="My account"
          >
            <FiUser />
          </Link>

          <Link
            to="/cart"
            className="header-icon-button cart-action"
            aria-label="Shopping bag"
          >
            <FiShoppingBag />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
