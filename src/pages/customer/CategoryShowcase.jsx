
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../services/api";
import "../../styles/CategoryShowcase.css";

const imageFiles = import.meta.glob("../../assets/images/*", {
    eager: true,
    query: "?url",
    import: "default",
});

// Show only these four categories, in this order
const allowedCategories = [
    {
        key: "necklaces",
        name: "Necklaces",
        keywords: ["diamondnecklace", "necklaces", "necklace"],
    },
    {
        key: "rings",
        name: "Rings",
        keywords: ["shopring", "rings", "ring"],
    },
    {
        key: "earrings",
        name: "Earrings",
        keywords: ["earring", "earings", "earing"],
    },
    {
        key: "bracelets",
        name: "Bracelets",
        keywords: ["bracelets", "bracelet", "bangles"],
    },
];

const findCategoryImage = (keywords) => {
    const match = Object.entries(imageFiles).find(([path]) => {
        const filename = path.split("/").pop().toLowerCase();

        return keywords.some((keyword) => filename.includes(keyword));
    });

    return match?.[1] || "";
};

function CategoryShowcase() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getCategories();

                const responseData = response?.data ?? response;

                const data = Array.isArray(responseData)
                    ? responseData
                    : responseData?.categories ??
                    responseData?.data ??
                    responseData?.result ??
                    [];

                if (!Array.isArray(data)) {
                    throw new Error("Unable to read categories from the API.");
                }

                // Match backend categories to the four allowed categories.
                const filteredCategories = allowedCategories
                    .map((allowed) => {
                        const category = data.find((item) => {
                            const categoryName = (
                                item?.name ||
                                item?.title ||
                                item?.categoryName ||
                                ""
                            )
                                .trim()
                                .toLowerCase();

                            return (
                                categoryName === allowed.key ||
                                categoryName === allowed.name.toLowerCase()
                            );
                        });

                        if (!category) return null;

                        return {
                            ...category,
                            displayName: allowed.name,
                            displayImage:
                                category.image ||
                                category.imageUrl ||
                                category.imageURL ||
                                findCategoryImage(allowed.keywords),
                        };
                    })
                    .filter(Boolean);

                if (isMounted) {
                    setCategories(filteredCategories);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load categories."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <section className="category-showcase">
                <h2 className="category-showcase-title">
                    <span>Shop by</span>
                    <span className="category-title-bold">Categories</span>
                </h2>

                <p className="category-showcase-status">
                    Loading categories...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="category-showcase">
                <h2 className="category-showcase-title">
                    <span>Shop by </span>
                    <span>Categories</span>
                </h2>

                <p className="category-showcase-status" role="alert">
                    {error}
                </p>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="category-showcase">
            <h2 className="category-showcase-title">
                <span>Shop by </span>
                <span>Categories</span>
            </h2>

            <div className="category-showcase-grid">
                {categories.map((category) => {
                    const id = category._id || category.id;
                    const name = category.displayName;

                    const count = Number(
                        category.productCount ??
                        category.productsCount ??
                        category.products?.length ??
                        0
                    );

                    const image = category.displayImage;

                    const imageSrc = image
                        ? /^https?:\/\//i.test(image) || image.startsWith("data:")
                            ? image
                            : image.startsWith("/")
                                ? `http://localhost:3200${image}`
                                : image
                        : "";

                    return (
                        <Link
                            to={`/products?category=${encodeURIComponent(id || name)}`}
                            className="category-showcase-card"
                            key={id || name}
                        >
                            <div className="category-showcase-content">
                                <h3>{name}</h3>
                                <p>+ {count} Products</p>
                            </div>

                            {imageSrc && (
                                <img
                                    className="category-showcase-image"
                                    src={imageSrc}
                                    alt={name}
                                    loading="lazy"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

export default CategoryShowcase;
