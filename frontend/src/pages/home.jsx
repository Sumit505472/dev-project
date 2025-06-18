import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return <p className="p-4 text-gray-800 dark:text-gray-200">Loading...</p>;

  const isLoggedIn = user && Object.keys(user).length > 0;

  const handleGoToProblemsClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#DCECF9] text-gray-900
                    dark:bg-gradient-to-br dark:from-[#1A202C] dark:to-[#2D3748] dark:text-gray-200">

      {/* Header */}
      <div className="px-6 py-10 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-blue-500 dark:text-gray-100">
          Judge Matrix
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {/* Optional subtitle or keep empty */}
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2">
        
        {/* Compiler Card */}
        <div className="rounded-3xl shadow-lg border border-[#D0E6F7] p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1
                        bg-[#E0F2FF] dark:bg-[#2D3748] text-[#1A202C] dark:text-gray-200">
          <h2 className="text-2xl font-bold mb-3">🔧 Online Compiler</h2>
          <p className="text-gray-700 mb-6 dark:text-gray-300">
            Run code instantly without logging in.
          </p>
          <Link to="/compiler">
            <button className="px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 ease-in-out
                               bg-[#319795] hover:bg-[#2C7A7B] text-white
                               dark:bg-[#38B2AC] dark:hover:bg-[#2C7A7B]">
              Try Compiler
            </button>
          </Link>
        </div>

        {/* Problems Card */}
        <div className="rounded-3xl shadow-lg border border-[#D0E6F7] p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1
                        bg-[#E0F2FF] dark:bg-[#2D3748] text-[#1A202C] dark:text-gray-200">
          <h2 className="text-2xl font-bold mb-3">📚 Solve Coding Problems</h2>
          <p className="text-gray-700 mb-6 dark:text-gray-300">
            Challenge yourself with real-world problems. Track progress and submit solutions.
          </p>
          {isLoggedIn ? (
            <Link to="/problems">
              <button className="px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 ease-in-out
                                 bg-[#319795] hover:bg-[#2C7A7B] text-white
                                 dark:bg-[#38B2AC] dark:hover:bg-[#2C7A7B]">
                Go to Problems
              </button>
            </Link>
          ) : (
            <button
              onClick={handleGoToProblemsClick}
              className="px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 ease-in-out
                         bg-[#718096] hover:bg-[#4A5568] text-white
                         dark:bg-[#4A5568] dark:hover:bg-[#2D3748]"
              title="You must be logged in to access problems"
            >
              Login to Solve Problems
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
