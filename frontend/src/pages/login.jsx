import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { fetchUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
          email,
          password,
        }, {
          withCredentials: true,
        });

        if (res.data.success) {
          localStorage.setItem("token", res.data.token); 
          await fetchUser();  
          navigate('/');
        } else {
          setError("Login failed");
        }

      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 px-4">
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-3xl font-bold text-center mb-6 drop-shadow-sm">{isLogin ? 'Login' : 'Signup'}</h2>

        {/* Toggle buttons */}
        <div className="flex justify-between mb-6 bg-white/20 rounded-full p-1">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              isLogin ? 'bg-white text-blue-600' : 'text-white'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              !isLogin ? 'bg-white text-blue-600' : 'text-white'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {error && <div className="mb-4 text-yellow-200 text-center font-semibold">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-md bg-white/70 text-gray-800 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
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
              className="w-full rounded-md bg-white/70 text-gray-800 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md bg-white/70 text-gray-800 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isLogin && (
              <a href="#" className="absolute right-3 top-2 text-sm text-blue-100 hover:underline">
                Forgot?
              </a>
            )}
          </div>

          {!isLogin && (
            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-md bg-white/70 text-gray-800 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 py-2 rounded-full text-white font-semibold hover:opacity-90 transition"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <div className="text-sm text-center mt-4 text-white">
          {isLogin ? (
            <span>
              Don’t have an account?{' '}
              <button
                className="text-blue-100 underline hover:text-white"
                onClick={() => setIsLogin(false)}
              >
                Signup now
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className="text-blue-100 underline hover:text-white"
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
