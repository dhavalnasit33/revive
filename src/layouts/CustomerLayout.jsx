
import { Outlet } from "react-router-dom";

import OfferBar from "../components/common/OfferBar";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/common/Footer";

function CustomerLayout() {
  return (
    <>
      <OfferBar />

      <Navbar />

      <main className="customer-content">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default CustomerLayout;
