import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Authcontext";

const HomePage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="p-4">Loading...</p>;

  const isLoggedIn = user && Object.keys(user).length > 0;

  return (
    <div className="min-h-screen bg-blue-100 text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Online Judge</h1>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-blue-500 font-medium">
            Home
          </Link>
          <Link to="/problems" className="hover:text-blue-500 font-medium">
            Problems
          </Link>

          {!isLoggedIn ? (
            <Link to="/login">
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700">
                Login
              </button>
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Welcome message */}
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Welcome to the Online Judge</h1>
        {isLoggedIn ? (
          <p className="text-gray-700">
            Logged in as: {user.fullname || user.email}
          </p>
        ) : (
          <p className="text-red-600">You are not logged in.</p>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-7xl  mx-auto px-4 py-12 grid gap-8 md:grid-cols-2">
        {/* Compiler Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300">
          <h2 className="text-xl font-semibold mb-4">🔧 Online Compiler</h2>
          <p className="mb-4 text-gray-600">
            Run code instantly without logging in. Supports C++, Python, Java,
            and more!
          </p>
          <Link to="/compiler">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Try Compiler
            </button>
          </Link>
        </div>

        {/* Problems Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300">
          <h2 className="text-xl font-semibold mb-4">📚 Solve Coding Problems</h2>
          <p className="mb-4 text-gray-600">
            Challenge yourself with real-world problems. Track progress and
            submit solutions.
          </p>
          <Link to="/problems">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Go to Problems
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
