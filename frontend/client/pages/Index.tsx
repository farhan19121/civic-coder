import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-80 h-full bg-navy-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">ChikitsaAI</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar className="h-full border-none" />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy-900 p-4 border-b border-navy-800">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">ChikitsaAI</h1>
            <div className="w-6"></div>
          </div>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
