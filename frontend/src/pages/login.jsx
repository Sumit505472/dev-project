import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';
import { useAuth } from '../../Authcontext';

const LoginPage = () => {
  const { fetchUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Login API call
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
          email,
          password,
        }, {
          withCredentials: true,
        });

        if (res.data.success && res.data.token) {
          localStorage.setItem("token", res.data.token);  // ✅ Store token
          await fetchUser();  // ✅ Now this will work correctly
          navigate('/');
        } else {
          setError("Login failed: No token returned");
        }

      } else {
        // Signup validation
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }

        // Signup API call
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
          fullname,
          email,
          password,
        }, {
          withCredentials: true,
        });

        setIsLogin(true);
        setError("Signup successful! Please login.");
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#00c6ff]">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">{isLogin ? 'Login' : 'Signup'}</h2>

        <div className="flex justify-between mb-6 border border-gray-200 rounded-full p-1">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isLogin ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white' : 'text-gray-600'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !isLogin ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white' : 'text-gray-600'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-blue-500"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isLogin && (
              <a
                href="#"
                className="absolute right-0 bottom-0 text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            )}
          </div>

          {!isLogin && (
            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white py-2 rounded-full font-semibold hover:opacity-90 transition"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          {isLogin ? (
            <span>
              Don’t have an account?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Signup now
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
