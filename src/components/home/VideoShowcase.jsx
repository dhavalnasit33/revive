
import { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import video1 from "../../assets/videos/video1.mp4";
import video2 from "../../assets/videos/video2.mp4";
import video3 from "../../assets/videos/video3.mp4";
import video4 from "../../assets/videos/video4.mp4";
import video5 from "../../assets/videos/video5.mp4";
import video6 from "../../assets/videos/video6.mp4";
import video7 from "../../assets/videos/video7.mp4";
import video8 from "../../assets/videos/video8.mp4";

import "../../styles/VideoShowcase.css";

const videoCards = [
  {
    id: 1,
    title: "Everyday Elegance",
    video: video1,
  },
  {
    id: 2,
    title: "Made to Be Remembered",
    video: video2,
  },
  {
    id: 3,
    title: "The Art of Craftsmanship",
    video:  video3,
  },
  {
    id: 4,
    title: "A Little More Sparkle",
    video: video4,
  },
  {
    id: 5,
    title: "For Your Special Day",
    video: video5,
  },
  {
    id: 6,
    title: "Your Story, Your Style",
    video: video6,
  },

   {
    id: 7,
    title: "Your Story, Your Style",
    video: video7,
  },

  {
    id: 8,
    title: "Your Story, Your Style",
    video: video8,
  },
];


function BeautyVideoShowcase() {
  const sliderRef = useRef(null);

  // Mouse dragging state
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Momentum scrolling state
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const animationFrameRef = useRef(null);

  const [isPointerScrollActive, setIsPointerScrollActive] =
    useState(false);

  // Stop momentum animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start dragging
  const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    // Cancel any previous momentum
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isDownRef.current = true;
    setIsPointerScrollActive(true);

    startXRef.current = event.clientX;
    scrollLeftRef.current = slider.scrollLeft;

    lastXRef.current = event.clientX;
    velocityRef.current = 0;

    slider.classList.add("is-dragging");
  };

  // Drag the videos horizontally
  const handleMouseMove = (event) => {
    if (!isDownRef.current) return;

    const slider = sliderRef.current;
    if (!slider) return;

    event.preventDefault();

    const distance = event.clientX - startXRef.current;
    const dragDistance = distance * 1.5;

    slider.scrollLeft = scrollLeftRef.current - dragDistance;

    // Track mouse movement for momentum
    velocityRef.current = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
  };

  // Release mouse and glide to a stop
  const stopPointerScrolling = () => {
    if (!isDownRef.current) return;

    isDownRef.current = false;

    const glide = () => {
      const slider = sliderRef.current;

      if (!slider || Math.abs(velocityRef.current) < 0.2) {
        velocityRef.current = 0;
        animationFrameRef.current = null;

        slider?.classList.remove("is-dragging");
        setIsPointerScrollActive(false);
        return;
      }

      slider.scrollLeft -= velocityRef.current;

      // Friction controls how gradually the slider stops
      velocityRef.current *= 0.95;

      animationFrameRef.current = requestAnimationFrame(glide);
    };

    animationFrameRef.current = requestAnimationFrame(glide);
  };

  // Arrow button scrolling
  const scrollVideos = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector(".beauty-video-card");
    if (!card) return;

    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap || styles.gap) || 12;

    slider.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <section className="beauty-video-showcase">
      <div className="beauty-video-heading">
        <h2 className="beauty-video-title">
          <span className="beauty-title-light">
            Beauty That
          </span>{" "}
          <span className="beauty-title-dark">
            Tells Your Story
          </span>
        </h2>
      </div>

      <div className="beauty-video-slider-wrap">
        <button
          type="button"
          className="beauty-video-arrow beauty-video-arrow-left"
          aria-label="Previous videos"
          onClick={() => scrollVideos(-1)}
        >
          <FiChevronLeft />
        </button>

        <div
          ref={sliderRef}
          className={`beauty-video-track ${
            isPointerScrollActive ? "pointer-scroll-active" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopPointerScrolling}
          onMouseLeave={stopPointerScrolling}
          onDragStart={(event) => event.preventDefault()}
        >
          {videoCards.map((item) => (
            <article
              className="beauty-video-card"
              key={item.id}
              style={{
                pointerEvents: isPointerScrollActive ? "none" : "auto",
              }}
            >
              <video
                className="beauty-video-media"
                src={item.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                draggable="false"
                onError={(event) => {
                  console.error(
                    `Unable to load video: ${item.video}`,
                    event.currentTarget.error
                  );
                }}
              />
            </article>
          ))}
        </div>

        <button
          type="button"
          className="beauty-video-arrow beauty-video-arrow-right"
          aria-label="Next videos"
          onClick={() => scrollVideos(1)}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}

export default BeautyVideoShowcase;