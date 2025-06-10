import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import HomePage from './pages/home';
import ProblemList from './pages/problemlist';
import ProblemDetail from './pages/problemDetails';
import LoginPage from './pages/login';
import AddProblemForm from './components/addproblem';
import Compiler from './pages/compiler';
import Header from './components/header';
import Dashboard from './pages/Dashboard';

function App() {
  // Initialize theme state: try to get it from localStorage, or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Use useEffect to apply the theme to the <html> tag whenever 'theme' changes
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

  // Function to toggle the theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    // The classes here (bg-base-100, text-base-content) will now correctly
    // pick up the theme applied to <html> via data-theme
    <div className="min-h-screen bg-base-100 text-base-content transition-colors ">
      <Router>
        <Header toggleTheme={toggleTheme} currentTheme={theme} />
        {/* Pass the toggleTheme function and current theme down to Header */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problem/:id" element={<ProblemDetail />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/addproblem" element={<AddProblemForm />} />
          <Route path="/*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;