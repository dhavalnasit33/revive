
import React from "react";
import "../../styles/BrandMarquee.css";

import tiffanyLogo from "../../assets/images/brands/tiffany.png";
import cartierLogo from "../../assets/images/brands/cartier.jpg";
import bvlgariLogo from "../../assets/images/brands/bvlgari.jpg";
import harryWinstonLogo from "../../assets/images/brands/harry-winston.jpg";
import vanCleefLogo from "../../assets/images/brands/van-cleef.png";
import tanishqLogo from "../../assets/images/brands/tanishq.png"
import chopardLogo from "../../assets/images/brands/chopard.jpg";
import pandoraLogo from "../../assets/images/brands/pandora.png";


const brands = [
  {
    name: "Tiffany & Co.",
    logo: tiffanyLogo,
    className: "tiffany",
  },
  {
    name: "Cartier",
    logo: cartierLogo,
    className: "cartier",
  },
  {
    name: "Bvlgari",
    logo: bvlgariLogo,
    className: "bvlgari",
  },

  
   {
    name: "Tanishq",
    logo: tanishqLogo,
    className: "tanishq",
  },

  
  {
    name: "Van Cleef & Arpels",
    logo: vanCleefLogo,
    className: "van-cleef",
  },

  {
    name: "Pandora",
    logo: pandoraLogo,
    className: "pandora",
  },

    {
    name: "Chopard",
    logo: chopardLogo,
    className: "chopard",
  },

  {
    name: "Harry Winston",
    logo: harryWinstonLogo,
    className: "harry-winston",
  },
 
];

function BrandMarquee() {
  return (
    <section className="brand-marquee" aria-label="Jewellery brands">
      <div className="brand-marquee-inner">
        <div className="brand-marquee-track">
          {[1, 2].map((groupIndex) => (
            <div
              className="brand-marquee-group"
              key={groupIndex}
              aria-hidden={groupIndex === 2 ? "true" : undefined}
            >
              {brands.map((brand) => (
                <div
                  className="brand-marquee-item"
                  key={`${groupIndex}-${brand.className}`}
                >
                  <img
                    className={`brand-marquee-logo brand-marquee-logo--${brand.className}`}
                    src={brand.logo}
                    alt={groupIndex === 1 ? brand.name : ""}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandMarquee;
