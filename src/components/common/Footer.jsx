
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <h2>AURÉLLE</h2>
        <p>Jewellery made for your special moments.</p>
      </div>

      <div className="footer-links">
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
      </div>

      <p>© {new Date().getFullYear()} AURÉLLE. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
