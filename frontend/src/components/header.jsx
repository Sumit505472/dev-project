import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./theme";

const Header = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  const isLoggedIn = user && Object.keys(user).length > 0;
  const isAdmin = user?.role === "admin";
  const userInitial = user?.fullname ? user.fullname[0].toUpperCase() : "?";

  return (
    <nav
      className="h-16 w-full px-6 bg-white/70 dark:bg-gray-900/80 shadow-md border-b border-gray-200 dark:border-gray-700 flex justify-between items-center backdrop-blur-md z-10"
      role="navigation"
      aria-label="Main Navigation"
    >
      {/* Left: Logo */}
     <div className="flex items-center gap-10">
  <Link
    to="/"
    className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text hover:scale-105 transition-transform"
  >
    CodeEdge
  </Link>

  <div className="flex items-center gap-6">
    <Link
      to="/compiler"
      className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
    >
      Compiler
    </Link>

    <Link
  to={isLoggedIn ? "/problems" : "/login"}
  className="text-gray-700 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
>
  Problems
</Link>
  </div>
</div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        <ThemeToggle/>

        {isAdmin && (
          <Link
            to="/admin"
            className="text-sm font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-200 dark:hover:text-cyan-400"
          >
            Admin
          </Link>
        )}

        {isLoggedIn && (
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            aria-label={`Go to dashboard for ${user.fullname || "user"}`}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center text-sm font-bold select-none">
              {userInitial}
            </div>
            <p className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors select-none">
              {user.fullname || "User"}
            </p>
          </Link>
        )}

        {isLoggedIn ? (
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full font-medium transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Logout"
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full font-medium transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Login"
            >
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;
