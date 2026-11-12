import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./theme";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (loading) return null;

  const isLoggedIn = user && Object.keys(user).length > 0;
  const isAdmin = user?.role === "admin";
  const userInitial = user?.fullname ? user.fullname[0].toUpperCase() : "?";
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 flex min-h-16 w-full items-center border-b border-slate-200/80 bg-white/85 px-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85" role="navigation" aria-label="Main Navigation">
      <div className="flex w-full items-center justify-between lg:w-auto lg:gap-12">
        <Link to="/" className="text-xl font-bold tracking-[-0.04em] text-slate-950 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">CodeEdge</Link>
        <div className="hidden items-center gap-8 lg:flex"><Link to="/compiler" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">Compiler</Link><Link to={isLoggedIn ? "/problems" : "/login"} className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">Problems</Link></div>
      </div>
      <div className="ml-auto flex items-center gap-3"><ThemeToggle />{isAdmin && <Link to="/admin" className="hidden text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 lg:block">Admin</Link>}{isLoggedIn && <Link to="/dashboard" className="group hidden items-center space-x-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 lg:flex" aria-label={`Go to dashboard for ${user.fullname || "user"}`}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white select-none">{userInitial}</div><p className="text-sm font-medium text-slate-600 transition-colors group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400 select-none">{user.fullname || "User"}</p></Link>}{isLoggedIn ? <button onClick={logout} className="button-danger hidden lg:block" aria-label="Logout">Logout</button> : <Link to="/login" className="button-primary hidden lg:inline-flex" aria-label="Login">Login</Link>}<button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" aria-label="Toggle navigation menu" aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      {menuOpen && <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white px-6 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-950 lg:hidden"><div className="flex flex-col gap-4 text-sm font-medium"><Link onClick={closeMenu} to="/compiler" className="text-slate-600 dark:text-slate-300">Compiler</Link><Link onClick={closeMenu} to={isLoggedIn ? "/problems" : "/login"} className="text-slate-600 dark:text-slate-300">Problems</Link>{isLoggedIn && <Link onClick={closeMenu} to="/dashboard" className="text-slate-600 dark:text-slate-300">Dashboard</Link>}{isAdmin && <Link onClick={closeMenu} to="/admin" className="text-slate-600 dark:text-slate-300">Admin</Link>}{!isLoggedIn && <Link onClick={closeMenu} to="/login" className="button-primary inline-flex w-fit">Login</Link>}{isLoggedIn && <button onClick={logout} className="button-danger w-fit">Logout</button>}</div></div>}
    </nav>
  );
};

export default Header;