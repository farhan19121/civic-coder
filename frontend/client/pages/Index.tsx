"use client"

import type React from "react"
import { useState } from "react"
import { MessageCircle, History, Globe, Home, HelpCircle, Plus, Send } from "lucide-react"
import { useNavigate } from 'react-router-dom';

interface DiagnosisResponse {
  confidence_score: number
  disclaimer: string
  predicted_disease: string
  recommendation: string
  symptoms_matched: string[]
}

const translations = {
  English: {
    title: "ChikitsaAI",
    disclaimer: "This chatbot provides preliminary screening only. Not a replacement for a doctor.",
    welcomeMessage: "Hello! I am ChikitsaAI, your AI healthcare assistant. How can I help you today?",
    newChat: "New Chat",
    history: "History",
    language: "Features",
    home: "About Us",
    help: "How it Works",
    placeholder: "Describe your symptoms...",
    send: "Send",
    analyzing: "Analyzing...",
    diagnosisResult: "Diagnosis Result",
    condition: "Condition:",
    confidence: "Confidence:",
    matchedSymptoms: "Matched Symptoms:",
    recommendation: "Recommendation:",
    user: "User",
  },
  Hindi: {
    title: "चिकित्साAI",
    disclaimer: "यह चैटबॉट केवल प्रारंभिक जांच प्रदान करता है। डॉक्टर का विकल्प नहीं है।",
    welcomeMessage: "नमस्ते! मैं चिकित्साAI हूं, आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?",
    newChat: "नई चैट",
    history: "इतिहास",
    language: "विशेषताएं",
    home: "हमारे बारे में",
    help: "यह कैसे काम करता है",
    placeholder: "अपने लक्षणों का वर्णन करें...",
    send: "भेजें",
    analyzing: "विश्लेषण कर रहे हैं...",
    diagnosisResult: "निदान परिणाम",
    condition: "स्थिति:",
    confidence: "विश्वास:",
    matchedSymptoms: "मिलान किए गए लक्षण:",
    recommendation: "सिफारिश:",
    user: "उपयोगकर्ता",
  },
}

const Chatbot = () => {
  const [inputValue, setInputValue] = useState("")
  const [response, setResponse] = useState<DiagnosisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const [language, setLanguage] = useState("English")

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setIsLoading(true)
    try {
      const endpoint = language === "Hindi" ? "http://127.0.0.1:5000/predict-hindi" : "http://localhost:5000/predict"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      })

      if (!res.ok) throw new Error("Network response was not ok")

      const data: DiagnosisResponse = await res.json()
      setResponse(data)
      setChatHistory((prev) => [...prev, inputValue])
    } catch (error) {
      console.error("Error:", error)
      setResponse({
        confidence_score: 0,
        disclaimer: language === "Hindi" ? "निदान सेवा से कनेक्ट करने में त्रुटि" : "Error connecting to the diagnosis service",
        predicted_disease: language === "Hindi" ? "सेवा अनुपलब्ध" : "Service Unavailable",
        recommendation: language === "Hindi" ? "कृपया बाद में पुनः प्रयास करें" : "Please try again later",
        symptoms_matched: [],
      })
    } finally {
      setIsLoading(false)
      setInputValue("")
    }
  }

  const startNewChat = () => {
    setResponse(null)
    setInputValue("")
  }

  const formatSymptom = (symptom: string) => {
    return symptom.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600">ChikitsaAI</h1>
        </div>

        {/* Language Selector */}
        <div className="px-6 py-4 border-b border-gray-200">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-black"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{translations[language as keyof typeof translations].newChat}</span>
            </button>

            
            <button
              onClick={() => navigate("/features")}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>{translations[language as keyof typeof translations].language}</span>
            </button>

            <button
              onClick={() => navigate("/about-us")}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>{translations[language as keyof typeof translations].home}</span>
            </button>

            <button
              onClick={() => navigate("/how-it-works")}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>{translations[language as keyof typeof translations].help}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {translations[language as keyof typeof translations].title}
              </h2>
              <p className="text-sm text-gray-500">{translations[language as keyof typeof translations].disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Welcome Message */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm border border-gray-200 max-w-2xl">
              <p className="text-gray-800">{translations[language as keyof typeof translations].welcomeMessage}</p>
            </div>
          </div>

          {/* User Message */}
          {chatHistory.length > 0 && (
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-green-600 text-white rounded-lg rounded-tr-none p-4 shadow-sm max-w-2xl">
                <p>{chatHistory[chatHistory.length - 1]}</p>
              </div>
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">{language === "Hindi" ? "उ" : "U"}</span>
              </div>
            </div>
          )}

          {/* AI Response */}
          {response && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm border border-gray-200 max-w-2xl space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {translations[language as keyof typeof translations].diagnosisResult}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">
                        {translations[language as keyof typeof translations].condition}
                      </span>{" "}
                      <span className="text-gray-900">{response.predicted_disease}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        {translations[language as keyof typeof translations].confidence}
                      </span>{" "}
                      <span className="text-gray-900">{(response.confidence_score * 100).toFixed(1)}%</span>
                    </p>

                    {response.symptoms_matched.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">
                          {translations[language as keyof typeof translations].matchedSymptoms}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {response.symptoms_matched.map((symptom, index) => (
                            <li key={index} className="text-gray-900">
                              {formatSymptom(symptom)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p>
                      <span className="font-medium text-gray-700">
                        {translations[language as keyof typeof translations].recommendation}
                      </span>{" "}
                      <span className="text-gray-900">{response.recommendation}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">{response.disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sample User Message for Demo */}
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-green-600 text-white rounded-lg rounded-tr-none p-4 shadow-sm max-w-2xl">
              <p>
                I've been experiencing a persistent cough and fatigue for the past week. Could you help me understand
                what might be causing these symptoms?
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={translations[language as keyof typeof translations].placeholder}
                disabled={isLoading}
                className="w-full p-3 pr-12 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[50px] max-h-32"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isLoading || !inputValue.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{translations[language as keyof typeof translations].analyzing}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{translations[language as keyof typeof translations].send}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
