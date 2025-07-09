import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-navy-950">
      <Navigation />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-gray-400 mb-8">Page not found</p>
          <a
            href="/"
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg transition-colors inline-block"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
