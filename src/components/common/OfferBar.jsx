
import { useEffect, useState } from "react";
import "../../styles/OfferBar.css";

const offers = [
  {
    message: "Get 15% extra discount on purchase above ₹1000",
    code: "LUMORA-15",
  },
  {
    message: "Enjoy 10% off on your next jewellery order",
    code: "LUMORA-10",
  },
  {
    message: "Enjoy free shipping on your jewellery order",
    code: "FREESHIP",
  },
];

function OfferText({ offer }) {
  return (
    <p className="offer-text">
      <span className="offer-message">
        {offer.message}
      </span>

      <span className="offer-code-wrapper">
        <span className="offer-separator"> — </span>
        <span className="offer-use-code">Use Code:</span>
        <span className="offer-code">{offer.code}</span>
      </span>
    </p>
  );
}

function OfferBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState("idle");
  const [isHovered, setIsHovered] = useState(false);

  const isAnimating = phase !== "idle";

  const moveSlider = (step) => {
    if (phase !== "idle") return;

    setDirection(step);
    setPhase("prepare");
  };

  // Start the CSS transition only after the initial slide position renders.
  useEffect(() => {
    if (phase !== "prepare") return;

    const frame = requestAnimationFrame(() => {
      setPhase("moving");
    });

    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Automatically move every 5 seconds; pause on hover or during animation.
  useEffect(() => {
    if (isHovered || isAnimating) return;

    const timer = setTimeout(() => {
      moveSlider(1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, isHovered, isAnimating]);

  const previousIndex =
    (currentIndex - 1 + offers.length) % offers.length;

  const nextIndex = (currentIndex + 1) % offers.length;

  const firstOffer =
    direction === 1 ? offers[currentIndex] : offers[previousIndex];

  const secondOffer =
    direction === 1 ? offers[nextIndex] : offers[currentIndex];

  const trackPosition =
    phase === "idle"
      ? "0%"
      : direction === 1
        ? phase === "prepare" ? "0%" : "-50%"
        : phase === "prepare" ? "-50%" : "0%";

  const handleTransitionEnd = (event) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      phase !== "moving"
    ) {
      return;
    }

    setCurrentIndex(
      (index) => (index + direction + offers.length) % offers.length
    );
    setPhase("idle");
  };

  return (
    <div
      className="offer-bar"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsHovered(false);
        }
      }}
    >
      <button
        type="button"
        className="offer-arrow offer-arrow-left"
        aria-label="Previous offer"
        onClick={() => moveSlider(-1)}
        disabled={isAnimating}
      >
        <span />
      </button>

      <div className="offer-viewport" aria-live="polite">
        <div
          className={`offer-track ${
            phase === "moving" ? "offer-track-animated" : ""
          }`}
          style={{ transform: `translateX(${trackPosition})` }}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className="offer-slide">
            <OfferText offer={firstOffer} />
          </div>

          <div className="offer-slide">
            <OfferText offer={secondOffer} />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="offer-arrow offer-arrow-right"
        aria-label="Next offer"
        onClick={() => moveSlider(1)}
        disabled={isAnimating}
      >
        <span />
      </button>
    </div>
  );
}

export default OfferBar;
