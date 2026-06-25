import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import HomePage from './pages/home';
import ProblemList from './pages/problemlist';
import ProblemDetail from './pages/problemDetails';
import LoginPage from './pages/login';
import AddProblemForm from './components/addproblem';
import Compiler from './pages/compiler';
import Header from './components/header';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';
import AdminProblems from './pages/AdminProblems';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-300">
        403 Forbidden: Admin access required.
      </div>
    );
  }

  return children;
};

function App() {

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

 
  useEffect(() => {
    // Set the data-theme attribute for DaisyUI
    document.documentElement.setAttribute('data-theme', theme);

    // Toggle the 'dark' class for Tailwind's dark: variants
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save the current theme to localStorage for persistence
    localStorage.setItem('theme', theme);
  }, [theme]); // Re-run this effect whenever the 'theme' state changes

 
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
 
    <div className="min-h-screen bg-base-100 text-base-content transition-colors ">
      <Router>
        <Header toggleTheme={toggleTheme} currentTheme={theme} />
       
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problem/:id" element={<ProblemDetail />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/admin" element={<AdminRoute><AdminProblems /></AdminRoute>} />
          <Route path="/admin/add-problem" element={<AdminRoute><AddProblemForm /></AdminRoute>} />
          <Route path="/admin/problems/:id/edit" element={<AdminRoute><AddProblemForm /></AdminRoute>} />
          <Route path="/addproblem" element={<Navigate to="/admin/add-problem" replace />} />
          <Route path="/*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
