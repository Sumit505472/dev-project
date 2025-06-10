import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/me`, {
        withCredentials: true,
      });

      console.log("Fetched user:", res.data.user);
      setUser(res.data.user); 
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount to check login status
  useEffect(() => {
    fetchUser();
  }, []);

  // to Clear cookie on logout (client-side only)
  const logout = () => {
    
    setUser(null);
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
