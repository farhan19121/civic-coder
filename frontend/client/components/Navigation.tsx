import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "How it Works", path: "/how-it-works" },
    { label: "About us", path: "/about-us" },
    { label: "Features", path: "/features" },
  ];

  return (
    <header className="bg-navy-950 border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 text-white"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1s .448 1 1 1z" />
                <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1s.448 1 1 1z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">ChikitsaAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:text-white hover:bg-navy-800",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
              Get Started
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:text-white hover:bg-navy-800",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
