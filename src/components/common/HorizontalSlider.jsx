
import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import "../../styles/HorizontalSlider.css";

function HorizontalSlider({
  children,
  trackClassName = "",
  wrapperClassName = "",
  showArrows = true,
  hideArrowsAt = "never",
  dragSpeed = 1.5,
  friction = 0.95,
  scrollStep = 1,
  cardSelector,
  leftLabel = "Scroll left",
  rightLabel = "Scroll right",
}) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const frameRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const stopMomentum = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    const track = trackRef.current;
    if (!track) return;

    // Do not start dragging from interactive controls.
    if (
      event.target.closest(
        "button, input, select, textarea, a, [data-no-slider-drag]"
      )
    ) {
      return;
    }

    stopMomentum();

    draggingRef.current = true;
    startXRef.current = event.clientX;
    startScrollRef.current = track.scrollLeft;
    lastXRef.current = event.clientX;
    velocityRef.current = 0;

    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!draggingRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    event.preventDefault();

    const distance = event.clientX - startXRef.current;

    track.scrollLeft = startScrollRef.current - distance * dragSpeed;

    velocityRef.current = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
  };

  const stopDragging = () => {
    if (!draggingRef.current) return;

    draggingRef.current = false;

    const glide = () => {
      const track = trackRef.current;

      if (!track || Math.abs(velocityRef.current) < 0.2) {
        velocityRef.current = 0;
        frameRef.current = null;
        setIsDragging(false);
        return;
      }

      track.scrollLeft -= velocityRef.current;
      velocityRef.current *= friction;

      frameRef.current = requestAnimationFrame(glide);
    };

    frameRef.current = requestAnimationFrame(glide);
  };

  const scrollTrack = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    stopMomentum();
    draggingRef.current = false;
    setIsDragging(false);

    const firstCard = cardSelector
      ? track.querySelector(cardSelector)
      : track.firstElementChild;

    if (!firstCard) return;

    const styles = window.getComputedStyle(track);
    const gap =
      parseFloat(styles.columnGap || styles.gap) || 0;

    const distance =
      (firstCard.getBoundingClientRect().width + gap) *
      scrollStep;

    track.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  return (
    <div className={`horizontal-slider ${wrapperClassName}`}>
      {showArrows && (
        <button
          type="button"
          className={`horizontal-slider-arrow horizontal-slider-arrow-left ${hideArrowsAt}`}
          aria-label={leftLabel}
          onClick={() => scrollTrack(-1)}
        >
          <FiChevronLeft />
        </button>
      )}

      <div
        ref={trackRef}
        className={[
          "horizontal-slider-track",
          trackClassName,
          isDragging ? "horizontal-slider-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </div>

      {showArrows && (
        <button
          type="button"
          className={`horizontal-slider-arrow horizontal-slider-arrow-right ${hideArrowsAt}`}
          aria-label={rightLabel}
          onClick={() => scrollTrack(1)}
        >
          <FiChevronRight />
        </button>
      )}
    </div>
  );
}

export default HorizontalSlider;
