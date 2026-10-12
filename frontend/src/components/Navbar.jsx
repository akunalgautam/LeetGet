import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="nav-bar">
      <div className="nav-container">
        <div className="logo-name">
          <img
            className="nav-bar-logo"
            src="./images/logo.png"
            alt="logo_image"
          />
          <h2>LeetGet</h2>
        </div>

        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-greeting">Hi, {user.username}</span>
              {user.isAdmin && (
                <Link className="link-login" to="/admin">
                  Admin
                </Link>
              )}
              <button className="link-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="link-login" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
