
import { FiChevronRight } from "react-icons/fi";
import { FaCrown, FaStar, FaGem } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../styles/LuxuryAwards.css";

function LuxuryAwards() {
    return (
        <section className="luxury-awards">
            <div className="luxury-awards-inner">

                {/* LEFT CONTENT */}
                <div className="luxury-awards-content">
                    <h2 className="luxury-awards-title">
                        <span className="luxury-awards-title-first">
                            Elegance Made to
                        </span>{" "}

                        <span className="luxury-awards-title-gradient">
                            Last Forever!
                        </span>
                    </h2>

                    <p className="luxury-awards-description">
                        Discover jewellery that celebrates your unique style,
                        crafted to make every moment unforgettable.
                    </p>

                    <Link
                        to="/products"
                        className="luxury-awards-button"
                    >
                        <span>Explore Collection</span>
                        <FiChevronRight aria-hidden="true" />
                    </Link>
                </div>

                {/* RIGHT AWARD BADGES */}
                <div className="luxury-awards-badges">

                    {/* CERTIFIED PURITY */}
                    <div className="luxury-award-badge luxury-award-purity">
                        <div className="luxury-award-ring">
                            <FaGem
                                className="luxury-award-diamond"
                                aria-hidden="true"
                            />

                            <span className="luxury-award-purity-number">
                                100%
                            </span>

                            <span className="luxury-award-label">
                                Certified Purity
                            </span>

                            <span className="luxury-award-divider" />

                            <span className="luxury-award-year">
                                2026
                            </span>
                        </div>
                    </div>

                    {/* BRIDAL DESIGN */}
                    <div className="luxury-award-badge luxury-award-bridal">
                        <div className="luxury-award-ring">
                            <FaCrown
                                className="luxury-award-crown"
                                aria-hidden="true"
                            />

                            <span className="luxury-award-small">
                                The Greatest
                            </span>

                            <span className="luxury-award-main">
                                Bridal
                            </span>

                            <span className="luxury-award-label">
                                Design
                            </span>

                            <span className="luxury-award-divider" />

                            <span className="luxury-award-year">
                                2026
                            </span>
                        </div>
                    </div>

                    {/* LUXURY WINNER */}
                    <div className="luxury-award-badge luxury-award-winner">
                        <div className="luxury-award-ring">
                            <FaCrown
                                className="luxury-award-crown"
                                aria-hidden="true"
                            />

                            <span className="luxury-award-small">
                                Best of
                            </span>

                            <span className="luxury-award-main">
                                Luxury
                            </span>

                            <span className="luxury-award-label">
                                Winner
                            </span>

                            <div
                                className="luxury-award-stars"
                                aria-label="Three stars"
                            >
                                <FaStar />
                                <FaStar />
                                <FaStar />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default LuxuryAwards;
