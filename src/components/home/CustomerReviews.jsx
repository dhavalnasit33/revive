import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getHomepageReviews } from "../../services/api";

function CustomerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    const [visibleCount, setVisibleCount] = useState(() => {
        if (typeof window === "undefined") return 3;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getHomepageReviews();
                const data = response?.data;

                const reviewList = Array.isArray(data)
                    ? data
                    : data?.reviews ||
                      data?.data?.reviews ||
                      data?.data ||
                      [];

                if (!Array.isArray(reviewList)) {
                    throw new Error("Invalid reviews response from server.");
                }

                setReviews(
                    reviewList.filter(
                        (review) =>
                            !review.status ||
                            review.status.toLowerCase() === "approved"
                    )
                );
            } catch (err) {
                console.error("Failed to fetch customer reviews:", err);
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Unable to load customer reviews."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setVisibleCount(1);
            } else if (window.innerWidth < 1024) {
                setVisibleCount(2);
            } else {
                setVisibleCount(3);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const ratedReviews = reviews.filter(
        (review) => Number(review.rating) > 0
    );

    const averageRating =
        ratedReviews.length > 0
            ? (
                  ratedReviews.reduce(
                      (total, review) => total + Number(review.rating),
                      0
                  ) / ratedReviews.length
              ).toFixed(1)
            : "0.0";

    const totalReviews = ratedReviews.length;
    const maxIndex = Math.max(0, reviews.length - visibleCount);

    useEffect(() => {
        setCurrentIndex((index) => Math.min(index, maxIndex));
    }, [maxIndex]);

    const formatDate = (date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "";

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getCustomerName = (review) => {
        const user = review.user || review.customer;

        return (
            user?.name ||
            user?.fullName ||
            review.name ||
            "Verified Customer"
        );
    };

    const renderStars = (rating, size = 20) => {
        const roundedRating = Math.round(Number(rating) || 0);

        return (
            <div
                className="flex shrink-0 items-center gap-1"
                aria-label={`${rating} out of 5 stars`}
            >
                {Array.from({ length: 5 }, (_, index) =>
                    index < roundedRating ? (
                        <FaStar
                            key={index}
                            size={size}
                            className="shrink-0 text-[#F5A122]"
                        />
                    ) : (
                        <FaRegStar
                            key={index}
                            size={size}
                            className="shrink-0 text-[#F5A122]"
                        />
                    )
                )}
            </div>
        );
    };

    const previousReviews = () => {
        setCurrentIndex((index) => Math.max(0, index - 1));
    };

    const nextReviews = () => {
        setCurrentIndex((index) => Math.min(maxIndex, index + 1));
    };

    return (
        <section className="mt-5 w-full bg-white px-4 py-12 sm:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-[50px]">
                {/* Rating and heading */}
                <div className="flex w-full flex-col items-center gap-5 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#222]">
                        <span className="text-lg font-semibold">
                            {averageRating}/5
                        </span>

                        {renderStars(Number(averageRating), 20)}

                        <span>
                            from {totalReviews.toLocaleString("en-US")} reviews
                        </span>
                    </div>

                    <h2 className="font-['Austin_Trial',serif] text-3xl font-medium text-[#222] sm:text-4xl lg:text-5xl">
                        What Our Customers Say!
                    </h2>
                </div>

                {/* Review slider */}
                <div className="w-full">
                    {loading && (
                        <p className="py-12 text-center text-gray-500">
                            Loading customer reviews...
                        </p>
                    )}

                    {!loading && error && (
                        <p className="py-10 text-center text-red-600">
                            {error}
                        </p>
                    )}

                    {!loading && !error && reviews.length === 0 && (
                        <p className="py-12 text-center text-gray-500">
                            No approved customer reviews available yet.
                        </p>
                    )}

                    {!loading && !error && reviews.length > 0 && (
                        <>
                            <div className="relative">
                                {/* Previous arrow */}
                                <button
                                    type="button"
                                    onClick={previousReviews}
                                    disabled={currentIndex === 0}
                                    aria-label="Previous reviews"
                                    className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition hover:border-[#DA2074] hover:text-[#DA2074] disabled:cursor-not-allowed disabled:opacity-40 sm:-left-5 sm:h-11 sm:w-11 lg:-left-6"
                                >
                                    <FiChevronLeft size={22} />
                                </button>

                                {/* Cards */}
                                <div className="overflow-hidden px-1 py-1 sm:px-2">
                                    <div
                                        className="flex items-stretch gap-5 transition-transform duration-500 ease-in-out"
                                        style={{
                                            transform: `translateX(calc(${currentIndex} * (-100% / ${visibleCount} - 20px / ${visibleCount})))`,
                                        }}
                                    >
                                        {reviews.map((review) => {
                                            const rating = Math.min(
                                                5,
                                                Math.max(
                                                    0,
                                                    Number(review.rating) || 0
                                                )
                                            );

                                            return (
                                                <article
                                                    key={review._id || review.id}
                                                    className="box-border flex min-w-0 flex-shrink-0 flex-col rounded-[20px] border border-[#E5E5E5] bg-[#FDFDFD] p-6 sm:p-7 lg:p-8"
                                                    style={{
                                                        width: `calc((100% - ${
                                                            (visibleCount - 1) * 20
                                                        }px) / ${visibleCount})`,
                                                        height: "349px",
                                                    }}
                                                >
                                                    {/* Stars, count and date */}
                                                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                            {renderStars(rating, 20)}

                                                            <span className="whitespace-nowrap font-['Roboto_Flex',sans-serif] text-base font-medium leading-none text-[#000000]">
                                                                {rating} Star
                                                                {rating === 1 ? "" : "s"}
                                                            </span>
                                                        </div>

                                                        <span className="font-['Roboto_Flex',sans-serif] text-sm font-normal leading-normal text-[#666666] sm:text-base">
                                                            {formatDate(review.createdAt)}
                                                        </span>
                                                    </div>

                                                    {/* Review text */}
                                                    <p className="mb-5 min-w-0 flex-1 break-words overflow-y-auto pr-1 font-['Roboto_Flex',sans-serif] text-[18px] font-normal leading-[26px] text-[#222222]">
                                                        {review.comment ||
                                                            review.review ||
                                                            "Thank you for sharing your feedback."}
                                                    </p>

                                                    {/* Customer name */}
                                                    <div className="mt-auto border-t border-gray-100 pt-4">
                                                        <p className="break-words font-['Roboto_Flex',sans-serif] text-base font-normal leading-normal text-[#222222]">
                                                            — {getCustomerName(review)}
                                                        </p>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Next arrow */}
                                <button
                                    type="button"
                                    onClick={nextReviews}
                                    disabled={currentIndex >= maxIndex}
                                    aria-label="Next reviews"
                                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition hover:border-[#DA2074] hover:text-[#DA2074] disabled:cursor-not-allowed disabled:opacity-40 sm:-right-5 sm:h-11 sm:w-11 lg:-right-6"
                                >
                                    <FiChevronRight size={22} />
                                </button>
                            </div>

                            {/* Pagination */}
                            <div className="mt-5 flex justify-center gap-2">
                                {Array.from({ length: maxIndex + 1 }).map(
                                    (_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            aria-label={`Show review position ${index + 1}`}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`h-[2px] rounded-full transition-all duration-300 ${
                                                currentIndex === index
                                                    ? "w-[60px] bg-[#DA2074]"
                                                    : "w-8 bg-[#CCCCCC]"
                                            }`}
                                        />
                                    )
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CustomerReviews;