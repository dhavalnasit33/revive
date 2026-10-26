
import HeroBanner from "../../components/home/HeroBanner";
import BrandMarquee from "../../components/home/BrandMarquee";
import ProductShowcase from "../../components/home/ProductShowcase";
import CategoryShowcase from "./CategoryShowcase";
import NewArrivals from "./NewArrivals";
import BeautyVideoShowcase from "../../components/home/VideoShowcase";
import CollectionShowcase from "../../components/home/CollectionShowcase";
import LuxuryAwards from "../../components/home/LuxuryAwards";
import MetalFinder from "../../components/home/MetalFinder";
import BlogShowcase from "../../components/home/BlogShowcase";
import CustomerReviews from "../../components/home/CustomerReviews";

function Home() {
  return (
    <div className="home-page">
      <HeroBanner />
      <BrandMarquee />
      <ProductShowcase />
      <CategoryShowcase />

      <div id="new-arrivals">
        <NewArrivals />
      </div>

      <BeautyVideoShowcase />

      <div id="collections">
        <CollectionShowcase />
      </div>

      <LuxuryAwards />
      <MetalFinder />

      <BlogShowcase />

      <CustomerReviews />
      
    </div>
  );
}

export default Home;
