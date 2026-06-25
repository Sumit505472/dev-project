
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const { fetchUser } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
          {
            email,
            password,
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          await fetchUser();
          navigate("/");
        } else {
          setError("Login failed");
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }

        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
          {
            fullname,
            email,
            password,
          },
          {
            withCredentials: true,
          }
        );

        setIsLogin(true);
        setError("Signup successful! Please login.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] relative overflow-hidden flex items-center justify-center px-6 py-10">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.18),_transparent_60%)]" />

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-6">

        {/* Left Side */}
        <div className="bg-[#111827]/90 border border-gray-800 rounded-3xl p-6 text-white">

          <div className="inline-flex px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 mb-6">
            🚀 BUILT FOR CODERS
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
            Code faster,
            <br />
            learn better,
            <br />
            and ship with confidence.
          </h1>

          <p className="text-gray-400 mb-8">
            Join a focused coding workspace with compiler tools,
            guided challenges, and a developer-first experience.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="font-semibold">⚡ Instant Compiler</h3>
              <p className="text-sm text-gray-400 mt-1">
                Run code instantly
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="font-semibold">🎯 Challenges</h3>
              <p className="text-sm text-gray-400 mt-1">
                Practice daily
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="font-semibold">👥 Community</h3>
              <p className="text-sm text-gray-400 mt-1">
                Learn together
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="font-semibold">🔒 Secure Access</h3>
              <p className="text-sm text-gray-400 mt-1">
                Protected accounts
              </p>
            </div>
          </div>

          <div className="mt-8 bg-black border border-gray-800 rounded-xl p-4">
            <p className="text-green-400 text-sm">
              function solve() {"{"}
            </p>

            <p className="text-yellow-400 text-sm ml-4">
              return "Build something great";
            </p>

            <p className="text-green-400 text-sm">{"}"}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-[#111827]/90 border border-gray-800 rounded-3xl p-8 text-white flex flex-col justify-center">

          <h2 className="text-3xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <p className="text-center text-gray-400 mt-2 mb-8">
            {isLogin
              ? "Log in to continue coding on CodeEdge"
              : "Join CodeEdge and start solving challenges"}
          </p>

          {error && (
            <div className="mb-4 text-center text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                required
              />
            )}

            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />

            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                required
              />
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
            >
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setIsLogin(false);
                  }}
                  className="text-blue-500 hover:text-blue-400"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setIsLogin(true);
                  }}
                  className="text-blue-500 hover:text-blue-400"
                >
                  Log in
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

