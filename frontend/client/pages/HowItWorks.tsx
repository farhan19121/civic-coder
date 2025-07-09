import Navigation from "@/components/Navigation";
import { User, MessageCircle, Brain, FileText, Heart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <User className="w-8 h-8 text-white" />,
      title: "User describes symptoms",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "NLP interprets text",
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "Neural network predicts possible illness",
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: "Bot gives info + urgency level",
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "User receives health tips or advice",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How ChikitsaAI Works
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-12 bottom-12 w-px bg-navy-700"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-6 relative"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-navy-800 rounded-lg flex items-center justify-center relative z-10">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl text-white font-medium">
                      {step.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}
