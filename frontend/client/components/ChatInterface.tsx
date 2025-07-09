import { Mic, Send, Camera } from "lucide-react";
import { useState } from "react";

export default function ChatInterface() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex-1 flex flex-col bg-navy-950">
      {/* Header with disclaimer */}
      <div className="p-6 border-b border-navy-800">
        <p className="text-center text-gray-400 text-sm">
          This chatbot provides preliminary screening only. Not a replacement
          for a doctor.
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Bot message */}
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">ChikitsaAI</div>
              <div className="bg-navy-800 text-white p-4 rounded-lg max-w-md">
                Hello! I am ChikitsaAI, your AI healthcare assistant. How can I
                help you today
              </div>
            </div>
          </div>
        </div>

        {/* User message */}
        <div className="mb-6">
          <div className="flex items-start justify-end space-x-3">
            <div className="flex-1 flex justify-end">
              <div>
                <div className="text-sm text-gray-400 mb-1 text-right">
                  User
                </div>
                <div className="bg-primary text-white p-4 rounded-lg max-w-md">
                  I've been experiencing a persistent cough and fatigue for the
                  past week. Could you help me understand what might be causing
                  these symptoms?
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat input */}
      <div className="p-6 border-t border-navy-800">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your symptoms..."
              className="w-full bg-navy-800 text-white placeholder-gray-400 px-4 py-3 pr-20 rounded-lg border border-navy-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
