
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiArrowRight,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import { getBlogs } from "../../services/api";
import "../../styles/BlogShowcase.css";

const IMAGE_BASE_URL = "http://localhost:3200";

function BlogShowcase() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        let isMounted = true;

        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getBlogs({
                    page: currentPage,
                    limit: 4,
                });

                if (!isMounted) return;

                setBlogs(
                    Array.isArray(response.blogs)
                        ? response.blogs
                        : []
                );

                setTotalPages(response.totalPages || 1);
            } catch (err) {
                if (!isMounted) return;

                console.error("Blog API error:", err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load articles. Please try again later."
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBlogs();

        return () => {
            isMounted = false;
        };
    }, [currentPage]);

    const getImageUrl = (image) => {
        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${IMAGE_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
    };

    const formatDate = (date) => {
        if (!date) return "LUMORIA JOURNAL";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "LUMORIA JOURNAL";
        }

        return parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <section className="blog-showcase">
            <div className="blog-showcase-header">
                <h2 className="blog-showcase-title">
                    <span>Read Blog</span> of Jewellery
                </h2>

                <Link to="/blog" className="blog-view-all">
                    Read More Blogs
                    <FiChevronRight />
                </Link>
            </div>

            {loading && (
                <p className="blog-showcase-message">
                    Loading articles...
                </p>
            )}

            {!loading && error && (
                <p className="blog-showcase-message blog-showcase-error">
                    {error}
                </p>
            )}

            {!loading && !error && blogs.length === 0 && (
                <p className="blog-showcase-message">
                    Our jewellery stories are coming soon.
                </p>
            )}

            {!loading && !error && blogs.length > 0 && (
                <div className="blog-showcase-slider-wrap">
                    <button
                        type="button"
                        className="blog-slider-arrow blog-slider-prev"
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.max(1, page - 1)
                            )
                        }
                        disabled={currentPage === 1}
                        aria-label="Previous articles"
                    >
                        <FiChevronLeft />
                    </button>

                    <div className="blog-showcase-grid">
                        {blogs.map((blog) => (
                            <article
                                className="blog-showcase-card"
                                key={blog._id}
                            >
                                <Link
                                    to={`/blog/${blog.slug}`}
                                    className="blog-showcase-image-link"
                                    aria-label={`Read ${blog.title}`}
                                >
                                    <div className="blog-showcase-image">
                                        {blog.coverImage ? (
                                            <img
                                                src={getImageUrl(blog.coverImage)}
                                                alt={blog.title}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="blog-image-placeholder">
                                                LUMORIA
                                            </div>
                                        )}

                                        <span className="blog-showcase-badge">
                                            {blog.category || "Jewellery"}
                                        </span>
                                    </div>
                                </Link>

                                <div className="blog-showcase-content">
                                    <div className="blog-showcase-meta">
                                        <span>
                                            {formatDate(
                                                blog.publishedAt ||
                                                blog.createdAt
                                            )}
                                        </span>

                                        <span className="blog-meta-dot">
                                            •
                                        </span>

                                        <span className="meta-category">
                                            {blog.category || "Jewellery"}
                                        </span>
                                    </div>

                                    <h3>
                                        <Link to={`/blog/${blog.slug}`}>
                                            {blog.title}
                                        </Link>
                                    </h3>

                                    <p className="blog-showcase-excerpt">
                                        {blog.excerpt}
                                    </p>

                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="blog-read-more"
                                    >
                                        <span>Read More</span>
                                        <FiChevronRight />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="blog-slider-arrow blog-slider-next"
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.min(totalPages, page + 1)
                            )
                        }
                        disabled={currentPage >= totalPages}
                        aria-label="Next articles"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </section>
    );
}

export default BlogShowcase;
