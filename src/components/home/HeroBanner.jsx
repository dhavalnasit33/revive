import React from "react";
import "../../styles/HeroBanner.css";
import jewelleryBanner from "../../assets/images/banner.jpg";
import { ChevronRight } from "lucide-react";

const HeroBanner = () => {
    return (
        <section className="hero-banner">
            {/* Your saved banner image */}
            <div className="hero-banner-visual">
                <img
                    className="hero-banner-image"
                    src={jewelleryBanner}
                    alt="LUMORIA premium jewellery collection"
                />
            </div>

            {/* Left-side content */}
            <div className="hero-banner-content">
                <h1 className="hero-banner-title">
                    Elegance in Every Sparkle
                </h1>

                <p className="hero-banner-description">
                    Discover exquisite rings, necklaces, earrings, and bracelets
                    crafted to make every moment unforgettable.
                </p>

                <a className="hero-banner-cta" href="/collections">
                    <span>Discover Collection</span>
                    <span className="hero-banner-cta-arrow" aria-hidden="true">
                        <ChevronRight size={20} strokeWidth={1.5} />
                    </span>
                </a>
            </div>
        </section>
    );
};

export default HeroBanner;