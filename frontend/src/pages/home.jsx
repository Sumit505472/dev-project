import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-4 text-base-content">Loading...</p>;

  const isLoggedIn = user && Object.keys(user).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-gray-900
                dark:bg-base-100 dark:text-base-content dark:bg-none">
      <div className="px-6 py-10 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
          🚀 Online Judge
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {isLoggedIn ? (
            <>Logged in as <span className="font-medium text-purple-700 dark:text-primary">
                {user.fullname || user.email}
              </span></>
          ) : (
            <span className="font-semibold text-red-600 dark:text-error">
              You are not logged in.
            </span>
          )}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2">
        <div className="rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1
                    bg-pink-400 dark:bg-base-200
                    text-gray-800 dark:text-base-content">
          <h2 className="text-2xl font-bold mb-3">
            🔧 Online Compiler
          </h2>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            Run code instantly without logging in. Supports C++, Python, Java, and more!
          </p>
          <Link to="/compiler">
            <button className="px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 ease-in-out
                            bg-gray-900 hover:bg-blue-700 text-white
                            dark:btn dark:btn-primary">
              Try Compiler
            </button>
          </Link>
        </div>

        <div className="rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1
                    bg-green-400 dark:bg-base-200
                    text-gray-800 dark:text-base-content">
          <h2 className="text-2xl font-bold mb-3">
            📚 Solve Coding Problems
          </h2>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            Challenge yourself with real-world problems. Track progress and submit solutions.
          </p>
          <Link to="/problems">
            <button className="px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 ease-in-out
                            bg-gradient-to-r from-pink-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white
                            dark:btn dark:btn-accent">
              Go to Problems
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;