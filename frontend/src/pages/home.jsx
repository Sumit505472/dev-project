import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Code2, BookOpenCheck, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#EBF8FF] to-[#D6EFFF] text-gray-900
                    dark:bg-gradient-to-br dark:from-[#1A202C] dark:to-[#2D3748] dark:text-gray-200">

      {/* Header */}
      <header className="text-center py-12 px-6">
        <h1 className="text-5xl font-extrabold text-[#2B6CB0] dark:text-white tracking-tight flex justify-center items-center gap-2">
          <Sparkles className="w-8 h-8 text-[#3182CE]" />
          Judge Matrix
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your all-in-one platform to code, compile, and challenge yourself with real-world problems.
        </p>
      </header>

      {/* Cards */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid gap-10 md:grid-cols-2">

        {/* Compiler Card */}
        <div className="rounded-3xl shadow-xl border border-transparent p-8 transition-transform hover:-translate-y-1 hover:shadow-2xl
                        bg-gradient-to-tr from-[#90CDF4] via-[#63B3ED] to-[#4299E1] text-white dark:from-[#2A4365] dark:via-[#2C5282] dark:to-[#2B6CB0]">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-6 h-6 text-white" />
            <h2 className="text-3xl font-bold">Online Code Compiler</h2>
          </div>
          <p className="text-white/90 mb-6">
            Write, test, and run your code instantly 
          </p>
          <Link to="/compiler">
            <button className="w-full py-3 rounded-xl text-base font-semibold bg-white text-[#2B6CB0] hover:bg-gray-200 transition">
              Launch Compiler
            </button>
          </Link>
        </div>

        {/* Problems Card */}
        <div className="rounded-3xl shadow-xl border border-transparent p-8 transition-transform hover:-translate-y-1 hover:shadow-2xl
                        bg-gradient-to-tr from-[#68D391] via-[#48BB78] to-[#38A169] text-white dark:from-[#22543D] dark:via-[#276749] dark:to-[#2F855A]">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenCheck className="w-6 h-6 text-white" />
            <h2 className="text-3xl font-bold">Solve Coding Challenges</h2>
          </div>
          <p className="text-white/90 mb-6">
            Solve curated problems, sharpen your skills, and track your progress.
          </p>
          {isLoggedIn ? (
            <Link to="/problems">
              <button className="w-full py-3 rounded-xl text-base font-semibold bg-white text-[#2F855A] hover:bg-gray-200 transition">
                Explore Problems
              </button>
            </Link>
          ) : (
            <button
              onClick={handleGoToProblemsClick}
              className="w-full py-3 rounded-xl text-base font-semibold bg-white text-[#4A5568] hover:bg-gray-200 transition"
              title="You must be logged in to access problems"
            >
              Login to Solve Problems
            </button>
          )}
        </div>

      </main>
    </div>
  );
};

export default HomePage;
