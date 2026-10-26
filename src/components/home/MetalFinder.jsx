
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MetalFinder.css";


import goldImage from "../../assets/images/metalsgold.jpg";
import silverImage from "../../assets/images/metalsilver.jpg";
import diamondImage from "../../assets/images/metaldiamond.jpg";

const metals = [
  { name: "PLATINUM", color: "#C7C9CC" },
  { name: "DIAMOND", color: "#E7E9F0" },
  { name: "GOLD", color: "#D5A33B" },
  { name: "ROSE GOLD", color: "#C98278" },
  { name: "SILVER", color: "#AEB6C0" },
];

const jewelleryLooks = [
  {
    name: "DIAMOND",
    image: diamondImage,
    alt: "Diamond jewellery inspiration",
  },
  {
    name: "GOLD",
    image: goldImage,
    alt: "Gold jewellery inspiration",
  },
  {
    name: "SILVER",
    image: silverImage,
    alt: "Silver jewellery inspiration",
  },
];

function MetalFinder() {
  const [selectedMetal, setSelectedMetal] = useState("GOLD");
  const navigate = useNavigate();

  const handleShop = () => {
    navigate(`/products?metal=${encodeURIComponent(selectedMetal)}`);
  };

  return (
    <section className="metal-finder container-fluid">
      <div className="metal-finder-inner">
        <div className="metal-finder-heading text-center">
          <h2 className="metal-finder-title">
            <span>Find Your</span> Metal Match
          </h2>
        </div>

        <div className="metal-finder-cards">
          {jewelleryLooks.map((look) => (
            <button
              type="button"
              key={look.name}
              className={`metal-look-card metal-look-${look.name
                .toLowerCase()
                .replace(" ", "-")} ${
                selectedMetal === look.name ? "active" : ""
              }`}
              onClick={() => setSelectedMetal(look.name)}
              aria-label={`Select ${look.name}`}
              aria-pressed={selectedMetal === look.name}
            >
              <img
                src={look.image}
                alt={look.alt}
                className="metal-look-image"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div className="metal-shop-area">
          <button
            type="button"
            className="metal-shop-button"
            onClick={handleShop}
          >
            Match Now
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="metal-selector">
          <div className="metal-selector-bar" />

          <div className="metal-options-container">
            {metals.map((metal) => (
              <button
                type="button"
                key={metal.name}
                className={`metal-option ${
                  selectedMetal === metal.name ? "selected" : ""
                }`}
                onClick={() => setSelectedMetal(metal.name)}
                aria-pressed={selectedMetal === metal.name}
              >
                <span
                  className="metal-radio"
                  style={{ "--metal-color": metal.color }}
                >
                  {selectedMetal === metal.name && (
                    <span className="metal-radio-dot" />
                  )}
                </span>

                <span className="metal-option-label">
                  {metal.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetalFinder;
