import React from "react";
import { Link } from "react-router-dom";
import CartIcon from "../header/CartIcon";
import "../../styles/layout/header.css";
import authImage from "../../assets/auth/auth-illustration.png";

const Header: React.FC = () => {
  return (
    <header className="main-header">
      {/* LEFT SECTION */}
      <div className="header-left">
        <button className="hamburger" aria-label="Menu">
          ☰
        </button>

        <Link to="/" className="brand">
          <img
            src={authImage}
            alt="MadeWithLove Logo"
            className="brand-logo"
          />
          <span className="brand-text">MadeWithLove</span>
        </Link>
      </div>

      {/* CENTER SEARCH */}
      <div className="header-search">
        <input
          type="text"
          placeholder="Search for gifts, fabrics, candles..."
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="header-right">
        <Link to="/profile" className="header-link">
          👤 Monika
        </Link>

        <CartIcon />
      </div>
    </header>
  );
};

export default Header;
