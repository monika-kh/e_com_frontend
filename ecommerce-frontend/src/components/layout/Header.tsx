import React from "react";
import { Link, useLocation } from "react-router-dom";
import CartIcon from "../header/CartIcon";
import "../../styles/layout/header.css";
import authImage from "../../assets/auth/auth-illustration.png";

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="main-header">
      {/* LEFT: Logo */}
      <div className="header-left">
        <Link to="/" className="brand">
          <img
            src={authImage}
            alt="MadeWithLove Logo"
            className="brand-logo"
          />
          <span className="brand-text">MadeWithLove</span>
        </Link>
      </div>

      {/* CENTER: Navigation / Search */}
      <nav className="header-nav">
        <Link
          to="/home"
          className={`nav-link${location.pathname.startsWith("/home") ? " nav-link-active" : ""}`}
        >
          Home
        </Link>
        {/* <Link
          to="/products?categoryName=All"
          className={`nav-link${
            location.pathname.startsWith("/products") ? " nav-link-active" : ""
          }`}
        >
          Products
        </Link> */}
        <Link
          to="/profile"
          className={`nav-link${
            location.pathname.startsWith("/profile") ? " nav-link-active" : ""
          }`}
        >
          Profile
        </Link>
        <Link
          to="/orders"
          className={`nav-link${
            location.pathname.startsWith("/orders") ? " nav-link-active" : ""
          }`}
        >
          Orders
        </Link>
      </nav>

      {/* RIGHT: Cart + Hamburger */}
      <div className="header-right">
        <CartIcon />
        <button className="hamburger" aria-label="Menu">
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
